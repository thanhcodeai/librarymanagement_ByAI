# Báo cáo kiểm thử hộp trắng thủ công — Lá Thư Viện

Ngày: 16/10/2026. Phiên bản nguồn: commit `aaf4586c69bb6fa19450567f8ac3d44232755ac4`, repository `thanhcodeai/librarymanagement_ByAI`.

## 1. Phương pháp và giới hạn kết quả

Thực hiện đọc mã nguồn, xây dựng đồ thị luồng điều khiển rút gọn, phân tích điều kiện/nhánh, lần vết giá trị biến và xử lý ngoại lệ (desk checking). Không viết thêm hoặc chạy test tự động trong đợt này, không sửa mã ứng dụng, không thay đổi dữ liệu DB, không đẩy thay đổi lên GitHub.

Bảng dưới ghi **kết quả suy luận từ mã**, không phải kết quả chạy chương trình. “Phù hợp theo mã” nghĩa là đường đi dẫn tới hành vi mong đợi dưới tiền điều kiện nêu trong ca, không phải chứng nhận PASS thực nghiệm. Không đo và không tuyên bố tỷ lệ line/branch/function coverage, MC/DC hay kiểm thử toàn bộ đường đi. Kết quả 19 test ở lần phát triển trước không được tính thành kết quả thực thi của đợt kiểm thử thủ công này.

Phạm vi trọng tâm: auth/phân quyền, tạo và xét duyệt mượn, cập nhật tồn, quản lý user, transaction, xử lý lỗi; đọc bổ sung frontend và script thiết lập. Không phải kiểm thử hộp trắng đầy đủ mọi component React hay mọi thư viện bên thứ ba.

## 2. Cơ sở mã nguồn và quy tắc cần bảo vệ

- `server/app.js`: validation, auth, các endpoint và error handler.
- `server/db.js`: transaction commit/rollback/release.
- `server/security.js`: scrypt, timingSafeEqual, SHA-256 cho session token.
- `db/001_initial.sql`: InnoDB, FK, UNIQUE và CHECK.
- `src/main.jsx`: trạng thái đăng nhập, request API và hồ sơ.
- `scripts/setup.sh`: nhánh tạo cấu hình và cài đặt.

Invariant: chỉ Admin xét duyệt; chủ yêu cầu lấy từ session; dueDate > borrowDate; yêu cầu mới PENDING; chỉ PENDING được xử lý; duyệt giảm đúng một, từ chối không giảm; số lượng trong [0,total]; lỗi ghi giữa chừng phải rollback; lịch sử phải thuộc đúng user.

## 3. Đồ thị và độ phức tạp luồng xét duyệt

Đối tượng: phần xử lý nghiệp vụ trong callback transaction, `server/app.js:500–535`. Tiền điều kiện: auth và Admin middleware đã cho qua; request body/id hợp lệ; dữ liệu tuân thủ FK. Không đưa nhánh thư viện Zod, driver hoặc toàn bộ middleware vào đồ thị này.

Các nút quyết định:

| Nút | Điều kiện | Vị trí |
|---|---|---|
| D1 | Không tìm thấy yêu cầu? | app.js:505 |
| D2 | status khác PENDING? | app.js:506 |
| D3 | decision là APPROVE? | app.js:515 |
| D4 | available_quantity < 1? | app.js:516 |
| D5 | affectedRows khác 1? | app.js:526 |

Đồ thị rút gọn (T = đúng, F = sai):

```text
Start → khóa và đọc request → D1
D1(T) → lỗi 404 → rollback → End
D1(F) → D2
D2(T) → lỗi 409 already processed → rollback → End
D2(F) → khóa và đọc book → D3
D3(F) → đặt DENIED → cập nhật request + audit → commit → End
D3(T) → D4
D4(T) → lỗi 409 out of stock → rollback → End
D4(F) → giảm tồn có điều kiện → D5
D5(T) → lỗi 409 quantity conflict → rollback → End
D5(F) → đặt APPROVED → cập nhật request + audit → commit → End
```

Với đúng mô hình rút gọn trên, có 5 nút quyết định nên V(G) = D + 1 = 6. Có 6 đường kết thúc logic: không tìm thấy, đã xử lý, hết sách, cập nhật không đạt, duyệt thành công, từ chối thành công. Đây là độ phức tạp **của mô hình**, không phải số đo độ phức tạp toàn route. Đồ thị gộp biểu thức ?: gán status và || chuẩn hóa note vào nút cập nhật; không tính cạnh ngoại lệ await. Nếu đếm cú pháp callback theo quy ước mỗi if, ?:, || là một quyết định thì có 5 if + 1 ?: + 1 ||, cho giá trị 8; các tổ hợp không độc lập hoàn toàn vì điều kiện decision được lặp lại.

Đường D5(T) là phòng vệ. Với FK đúng, row lock đang giữ và một dòng sách tồn tại với tồn > 0, UPDATE bình thường phải tác động 1 dòng. Không nên tuyên bố đã tái hiện nhánh này bằng dữ liệu nghiệp vụ thông thường. Lỗi SQL/audit đi qua rollback là luồng ngoại lệ riêng, không cộng như một đường đã chạy của đồ thị trên.

## 4. Bảng lần vết theo nhánh

### 4.1. Xác thực và phân quyền

| ID | Dữ liệu / tiền điều kiện | Nhánh được lần vết và kết quả suy luận | Đánh giá |
|---|---|---|---|
| A01 | Không có cookie session | cookieToken trả undefined; !token đúng → 401, không next | Phù hợp theo mã |
| A02 | Có token, không có session tương ứng | Query trả []; !rows[0] đúng → 401 | Phù hợp theo mã |
| A03 | Session có expires_at <= UTC_TIMESTAMP() | WHERE loại session → 401 | Phù hợp theo mã |
| A04 | Session hợp lệ, role USER, gọi Admin API | auth next; role !== ADMIN đúng → 403 | Phù hợp theo mã |
| A05 | Session hợp lệ, role ADMIN, gọi API tạo mượn | reader kiểm tra role !== USER → 403 | Phù hợp theo quyết định phạm vi |
| A06 | Đăng ký có role=ADMIN | registerSchema đã omit role và strict → validation 400 trước INSERT | Phù hợp theo mã |
| A07 | Tài khoản tồn tại, mật khẩu sai | verifyPassword false; (!u hoặc !valid) đúng → 401, không tạo session | Phù hợp theo mã |
| A08 | Tài khoản tồn tại, mật khẩu đúng | Điều kiện lỗi sai; tạo token, transaction lưu hash/session/audit, cookie HttpOnly; publicUser không có password_hash | Phù hợp theo mã |

Căn cứ: app.js:55, 90–97, 122–148, 186–249; security.js:9–21.

### 4.2. Tạo yêu cầu mượn

Các ca giả định đã đăng nhập role USER, trừ dữ liệu bị bác bỏ trực tiếp. Ngày hợp lệ mẫu: borrowDate=2026-10-16, dueDate=2026-10-30.

| ID | Dữ liệu / tiền điều kiện | Nhánh và kết quả suy luận | Đánh giá |
|---|---|---|---|
| B01 | Body thêm userId=999 hoặc status=APPROVED | strict schema từ chối trước transaction → 400 | Phù hợp theo mã |
| B02 | bookId không tồn tại, ngày hợp lệ | !b đúng → 404, rollback | Phù hợp theo mã |
| B03 | dueDate=borrowDate=2026-10-16 | dueDate <= borrowDate đúng → 400 | Phù hợp theo mã |
| B04 | dueDate=2026-10-15, borrowDate=2026-10-16 | dueDate <= borrowDate đúng → 400 | Phù hợp theo mã |
| B05 | dueDate=2026-02-30 | Regex qua, round-trip ISO khác input → validation 400 | Phù hợp theo mã |
| B06 | Chặn trùng bật, đã có PENDING cùng user/book | Khóa dòng user; existing có giá trị → 409 DUPLICATE_PENDING | Phù hợp theo mã |
| B07 | BLOCK_DUPLICATE_PENDING=false, đã có PENDING | Bỏ qua kiểm tra existing, tạo PENDING mới | Phù hợp với nhánh cấu hình; không phải cấu hình đã chốt |
| B08 | Sách tồn tại, ngày hợp lệ, chưa có pending trùng | INSERT dùng req.user.id; status mặc định PENDING; không UPDATE books; audit + commit → 201 | Phù hợp theo mã |

Căn cứ: app.js:300–346; SQL:18–24. So sánh chuỗi ngày có thứ tự đúng do format YYYY-MM-DD và kiểm tra ngày lịch hợp lệ trước khi so sánh.

### 4.3. Xét duyệt mượn

Giả định đã qua middleware Admin. q là tồn trước thao tác.

| ID | Tiền điều kiện / dữ liệu | Đường đi và kết quả suy luận | Đánh giá |
|---|---|---|---|
| C01 | ID hợp lệ nhưng không có request | D1=T → 404; không giảm tồn | Phù hợp theo mã |
| C02 | Request APPROVED | D1=F, D2=T → 409; không xử lý lần hai | Phù hợp theo mã |
| C03 | Request DENIED | D1=F, D2=T → 409 | Phù hợp theo mã |
| C04 | PENDING, APPROVE, q=0 | D1F,D2F,D3T,D4T → 409; request giữ PENDING | Phù hợp theo mã |
| C05 | PENDING, APPROVE, q=1; driver báo affectedRows=0 | D1F,D2F,D3T,D4F,D5T → 409, rollback | Nhánh phòng vệ; cần fault injection để kiểm chứng động |
| C06 | PENDING, APPROVE, q=1, affectedRows=1, audit thành công | D1F,D2F,D3T,D4F,D5F → q'=0, APPROVED, reviewed_by=actor, commit | Phù hợp theo mã |
| C07 | PENDING, DENY, q=0 hoặc q>0 | D1F,D2F,D3F → DENIED, q'=q, commit | Phù hợp theo mã |
| C08 | Như C06 nhưng ghi audit ném lỗi; rollback thành công | Đã giảm tồn/cập nhật request nhưng chưa commit; catch rollback → trạng thái và tồn về trước thao tác, API 500 | Phù hợp theo mã, phụ thuộc rollback thành công |

Căn cứ: app.js:491–538; db.js:14–27. Việc khóa request và book giúp ngăn hai lần duyệt cùng request hoặc hai request lấy cuốn cuối; đây là lập luận từ lịch khóa, không phải lần đo chạy đồng thời trong đợt này.

### 4.4. Số lượng và quản lý sách

Với sách total=5, available=2 thì onLoan=3, available mới = total mới - 3.

| ID | Dữ liệu / tiền điều kiện | Kết quả lần vết | Đánh giá |
|---|---|---|---|
| D01 | Cập nhật ID sách không tồn tại | !b đúng → 404, rollback | Phù hợp theo mã |
| D02 | Sửa totalQuantity=2 | available=-1 < 0 → 409, không cập nhật | Phù hợp theo mã |
| D03 | Sửa totalQuantity=6, availableQuantity=6 | available tính được 3; trường có gửi và khác 3 → 409 | Phù hợp theo mã |
| D04 | Sửa totalQuantity=6, bỏ availableQuantity | Vế đầu && sai; cập nhật available=3 | Phù hợp theo mã |
| D05 | Sửa totalQuantity=6, availableQuantity=3 | Vế đầu && đúng, vế sau sai; cập nhật thành công | Phù hợp theo mã |
| D06 | Xóa sách đã có borrow history | FK RESTRICT phát lỗi; handler chuyển 409 HISTORY_CONFLICT | Phù hợp theo mã và schema |
| D07 | Tạo sách totalQuantity=-1 hoặc availableQuantity>total | Giá trị âm bị schema bác bỏ; vượt tổng bị if bác bỏ → 400 | Phù hợp theo mã |

Căn cứ: app.js:56–66, 413–488, 655–658; SQL:8–24. D03/D04/D05 khảo sát các đường short-circuit của biểu thức && ở app.js:457, không tuyên bố MC/DC toàn ứng dụng.

### 4.5. Quản lý người dùng

Các ca cần actor Admin còn hợp lệ, dữ liệu username/email không trùng nếu không nói khác.

| ID | Dữ liệu / tiền điều kiện | Kết quả lần vết | Đánh giá |
|---|---|---|---|
| E01 | Admin tự xóa chính mình | userId===req.user.id đúng → 409 | Phù hợp theo mã |
| E02 | Admin tự đổi role từ ADMIN sang USER | Điều kiện bảo vệ tự hạ quyền đúng → 409 | Phù hợp theo mã |
| E03 | Có >=2 Admin, xóa Admin khác chưa có lịch sử liên quan | Điều kiện bảo vệ sai; DELETE, audit, commit → 204 | Phù hợp theo chính sách tạm đã công khai |
| E04 | Sửa hồ sơ, không password, không role | hash=null; giữ hash/role hiện có; không xóa sessions | Phù hợp theo mã |
| E05 | Sửa với password mới hợp lệ | hash có giá trị → UPDATE và DELETE sessions cùng transaction | Phù hợp theo mã |
| E06 | Đổi USER sang ADMIN | role khác cũ → DELETE sessions, audit role mới | Phù hợp theo mã |
| E07 | Cập nhật ID user không tồn tại | !u đúng → 404, rollback | Phù hợp theo mã |

Căn cứ: app.js:568–625. Nhánh “chỉ còn một Admin nhưng actor là Admin khác” không có tiền điều kiện bình thường nhất quán; không tạo ca giả để tuyên bố phủ nhánh này. Rủi ro quyền thay đổi đồng thời được tách riêng ở WB-04.

### 4.6. Transaction và ngoại lệ

| ID | Giả định tại từng điểm await | Kết quả lần vết | Đánh giá |
|---|---|---|---|
| F01 | Lấy connection, begin, fn, commit đều thành công | Trả kết quả fn, finally release connection | Phù hợp theo mã |
| F02 | fn hoặc commit ném lỗi; rollback thành công | catch rollback, throw lỗi gốc, finally release | Phù hợp theo mã |
| F03 | getConnection ném lỗi | Thoát trước try; không release vì chưa sở hữu connection | Phù hợp theo mã |
| F04 | fn ném lỗi E1; rollback ném lỗi E2 | await rollback ngắt catch; finally vẫn release nhưng caller nhận E2, không phải E1 | Điểm yếu độ bền WB-05 |

Căn cứ: db.js:14–27. Trường hợp commit lỗi do mất kết nối có thể có kết quả commit không xác định ở DB; không thể khẳng định mọi lỗi commit đều đồng nghĩa dữ liệu chưa commit.

## 5. Phát hiện và bằng chứng

### WB-01 — Phản hồi lỗi có thể lộ đường dẫn nội bộ

Mức độ: Trung bình. Xác định bằng luồng dữ liệu mã; có bằng chứng bổ sung là JSON ENOENT người dùng đã cung cấp trong hội thoại, không phải thực thi mới.

Vị trí: app.js:634–641 và 667–676. `sendFile(dist/index.html)` phát lỗi khi thiếu build. Error handler lấy nguyên `err.message`; chỉ chuẩn hóa lỗi không thuộc các nhóm đặc biệt nếu status >=500. Lỗi file ENOENT có status 404 đi tới phản hồi với message chứa đường dẫn thật. Đây là thiếu sót so với NFR-SEC-04 và phần chuẩn hóa lỗi trong SRS: filesystem path phải ở server.

Kỳ vọng: thông báo chung, mã lỗi ổn định, không có ổ đĩa hoặc đường dẫn máy chủ. Lần vết: missing build → ENOENT/404 → bỏ qua nhánh status>=500 → trả err.message. Đề nghị: chuẩn hóa lỗi filesystem, log chi tiết nội bộ với requestId, kiểm tra build trước startup. Không tự sửa trong đợt này.

### WB-02 — Cache cài đặt mặc định không tương thích Windows

Mức độ: Trung bình, thuộc khả năng cài đặt. Xác định bằng mã và phù hợp với log đường dẫn C:\Program Files\Git\workspace\.npm-cache người dùng đã gửi.

Vị trí: scripts/setup.sh:5. Khi npm_config_cache chưa có, script gán đường dẫn Linux `/workspace/.npm-cache`. Chạy qua Git Bash trên Windows có thể ánh xạ dưới thư mục cài Git và không ghi được. Nhánh biến đã đặt thì dùng giá trị người dùng và không gặp đúng lỗi mặc định này.

Kỳ vọng: dùng npm cache mặc định hoặc đường dẫn ghi được theo hệ điều hành. Đề nghị: không hardcode đường dẫn cloud cho máy cá nhân. Đây không phải lỗi nghiệp vụ mượn sách.

### WB-03 — Hồ sơ trên frontend có thể giữ dữ liệu cũ sau tự cập nhật

Mức độ: Thấp. Xác định từ luồng state, chưa thực thi động trong đợt này.

Vị trí: src/main.jsx:168–193, 1709–1753. App nạp user bằng `/me` lúc mount và sau login. Profile hiển thị prop user. Sau form quản trị lưu user, ứng dụng tăng revision để tải lại danh sách nhưng không nạp lại user của App. Với Admin tự sửa fullName/email, không đổi mật khẩu/role, session vẫn còn; danh sách đã mới nhưng hồ sơ/avatar vẫn dùng dữ liệu cũ cho đến refresh trang hoặc đăng nhập lại.

Kỳ vọng: sau cập nhật chính mình, các vùng hiển thị hồ sơ đồng bộ. Đề nghị: refresh `/me` hoặc cập nhật App user khi mutation tác động chính mình.

### WB-04 — Quyền reviewer có khoảng trống khi thay đổi đồng thời

Mức độ: Rủi ro cao cần ưu tiên xác minh; chưa tái hiện động, không gán kết quả FAIL thực nghiệm.

Vị trí: app.js:129–143, 500–535, 574–597. Middleware đọc role trước transaction xét duyệt. Bên trong transaction không đọc/khóa lại vai trò reviewer. Lịch xen kẽ suy ra:

1. Admin A gọi approve, auth đọc A.role=ADMIN rồi tạm dừng trước transaction.
2. Admin B hạ quyền A thành USER và commit; xóa sessions của A.
3. Request đang xử lý của A tiếp tục; không chạy auth lại. Transaction duyệt cập nhật reviewed_by=A và commit trong khi A đã là USER.

Xóa session không tự hủy request đang xử lý. Đối chiếu BR-14 “reviewed_by phải là Admin ở thời điểm thực hiện”: cần xác minh yêu cầu về thời điểm hiệu lực thu hồi quyền và bảo vệ thích hợp trong transaction. Đề nghị: kiểm tra và khóa vai trò actor theo thứ tự khóa nhất quán trước mutation nhạy cảm, rồi kiểm thử lịch xen kẽ trên DB thật. Không khẳng định đây là khai thác đã xảy ra.

### WB-05 — Lỗi rollback có thể che mất lỗi gốc

Mức độ: Thấp / độ bền và chẩn đoán. Phân tích ngoại lệ có điều kiện, chưa giả lập động.

Vị trí: db.js:21–25. `await c.rollback()` có thể ném lỗi trước `throw e`. Caller nhận lỗi rollback thay vì lỗi nghiệp vụ/ghi DB ban đầu. finally vẫn release nên không kết luận rò rỉ connection từ trường hợp này.

Kỳ vọng kỹ thuật: giữ lỗi gốc và thông tin rollback thất bại, không khẳng định rollback thành công khi chưa có bằng chứng. Đề nghị: xử lý lỗi rollback riêng và liên kết cause/log requestId. Đây là khuyến nghị độ bền, không phải quy tắc chức năng mới của SRS.

## 6. Tổng hợp

Đã lập và lần vết 42 kịch bản ở sáu nhóm, có một nhánh phòng vệ chưa có dữ liệu nghiệp vụ thông thường để tái hiện và một tình huống rollback thất bại được ghi thành điểm yếu độ bền. Các đường nghiệp vụ chính có điều kiện kiểm tra tương ứng, nhưng điều đó không phải kết luận website tuyệt đối không có lỗi.

Ghi nhận ba thiếu sót xác định bằng đọc mã (WB-01, WB-02, WB-03), một rủi ro thu hồi quyền đồng thời (WB-04) và một điểm yếu chẩn đoán khi rollback lỗi (WB-05). Ưu tiên xác minh/xử lý WB-04 và chuẩn hóa lỗi WB-01; sửa tính tương thích WB-02 trước khi hướng dẫn chạy Windows. Chưa sửa hoặc push code theo yêu cầu hiện tại.

Độ phủ thực thi: chưa đo. Số ca PASS/FAIL chạy mới: không áp dụng. Việc đọc cả hai nhánh không tương đương đã thực thi cả hai nhánh. Kết quả này là báo cáo hộp trắng thủ công để phục vụ học tập/rà soát và làm cơ sở kiểm chứng tiếp theo.
