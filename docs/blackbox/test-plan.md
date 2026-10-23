# Kiểm thử hộp đen — Lá Thư Viện, phiên bản 2.1

**226 test case riêng biệt**, tất cả chưa chạy. Mỗi biến thể đầu vào có ID và ô kết quả riêng. Một TC có thể có nhiều bước đọc để kiểm tra cùng một hành vi.

[Tải Excel](test-cases.xlsx) · [CSV](test-cases.csv) · [Script sinh tài liệu](generate_workbook.py)

Nguồn: [OpenAPI](../openapi.json), [quyết định](../decisions.md), [truy vết](../traceability.md), [README](../../README.md). Đã đối chiếu SRS gốc v1.0 do người dùng gửi; xem [báo cáo SRS/code](srs-code-review.md). Đối chiếu mã để tìm khoảng trống/mâu thuẫn, không lấy hành vi triển khai làm chuẩn thay SRS.

## Hướng dẫn

**Nguồn SRS:** Đặc tả yêu cầu phần mềm website quản lý thư viện — SRS.docx; v1.0 ngày 16/10/2026; SHA-256 a440fa65c73192e27e82b27dee6a8bbef78505d31ae98023388250db3356e703. Chỉ lưu metadata/trích dẫn mục; không tự đưa file người dùng đính kèm lên GitHub.

**Phiên bản:** 2.1 — đã đối chiếu SRS gốc do người dùng cung cấp và code tại acdb8a9. ID BB2-xxx mới; cột ID cũ giữ liên hệ BB-001…064. Số lượng tăng do tách đầu vào và thêm nhánh còn thiếu.

**Trạng thái:** Các TC giữ Chưa chạy để không lẫn hồ sơ thực thi với mẫu thiết kế. Lượt review ngày 23/10/2026 đã chạy 19 tests có sẵn, browser workflow và 43 checks bổ trợ; có lỗi UI email xác nhận. Xem sheet Kiem chung và srs-code-review.md, không suy ra toàn bộ TC đã Pass.

**BASE:** Môi trường test riêng, dữ liệu không phải production. Node/MySQL/app đã sẵn sàng; không có người ghi đồng thời trừ ca concurrency. MIN_PASSWORD_LENGTH=8, SESSION_HOURS=8, BLOCK_DUPLICATE_PENDING=true. Mỗi ca fixture mới, không phụ thuộc ca trước.

**API:** Mọi path trong TC có prefix /api/v1; Content-Type application/json cho body. GUEST là jar rỗng. U1/U2 là hai USER khác nhau, A1 là ADMIN. A1 chuẩn bị dữ liệu, người thực hiện request mục tiêu theo tiền điều kiện.

**RUN:** RUN là 8 ký tự chữ/số duy nhất mỗi ca. {ID} lấy từ phản hồi tạo fixture. repeat(a,n) là CHUỖI gồm đúng n ký tự a, không phải biểu thức gửi nguyên văn. <OMIT> nghĩa là bỏ khóa JSON. Ca chuỗi 1 ký tự phải chọn ký tự còn trống hoặc fixture cô lập.

**REG:** JSON nền: username=bb{RUN}, fullName=Nguyen An {RUN}, email=bb{RUN}@example.com, password=P. P là mật khẩu thử hợp lệ dài 12 ký tự do tester tạo và giữ cục bộ. Biến thể password có thể thay bằng chuỗi a đúng độ dài n; không áp quy tắc chữ hoa/ký tự đặc biệt.

**LOGIN:** JSON username của tài khoản mục tiêu, password=P đã dùng khi tạo tài khoản đó; mỗi tài khoản jar riêng. P_NEW khác P, dài 12 ký tự. Không đưa mật khẩu/cookie/token vào bằng chứng hoặc Git.

**BOOK:** JSON nền: bookCode=CODE{RUN}, title=Sach {RUN}, author=Tacgia {RUN}, category=CAT{RUN}, totalQuantity=2; bỏ availableQuantity nếu TC không nói khác. Khi PUT giữ đủ bookCode,title,author,totalQuantity và giữ category/description hiện có để chỉ đổi biến mục tiêu.

**USERPUT:** JSON giữ username, fullName, email hiện tại của tài khoản mục tiêu; bỏ password và role trừ khi TC yêu cầu thay. Tránh vô tình xóa email hoặc đổi trường không phải mục tiêu.

**BORROW:** JSON nền: bookId=ID sách B1, borrowDate=D, dueDate=D+1. D là ngày thực hiện +1 ngày, dạng YYYY-MM-DD; cộng ngày theo lịch. Trường thiếu ID không được gửi dưới dạng chuỗi placeholder.

**Fixtures trạng thái:** Tạo B1 mới qua A1; đăng ký/đăng nhập U1/U2; tạo request bằng USER rồi APPROVE/DENY bằng A1. Để có PENDING với tồn 0: tạo 2 request khi tồn 1, duyệt request USER còn lại. Không sửa DB để dựng fixture hộp đen.

**MISSING_ID:** Chọn ID dương trong miền hợp đồng, xác nhận không có đối tượng mục tiêu qua GET danh sách đầy đủ hoặc GET chi tiết nếu được hỗ trợ; không suy luận từ một trang danh sách. Không có ghi đồng thời khi xác nhận.

**Chứng cứ:** Mỗi TC ghi commit ứng dụng, cấu hình không bí mật, môi trường, browser, ngày giờ, input thực, HTTP/body đã che secret, mốc trước/sau. Lưu ID đối tượng và request ID; cookie không đưa vào báo cáo.

**Oracle chung:** HTTP và nội dung/nghiệp vụ phải đồng thời đúng. Lỗi có success=false, error.code/message và requestId; không lộ SQL/stack/credential. Thành công JSON có success=true và data; 204 không body. Lỗi không làm thay đổi đối tượng nghiệp vụ.

**CLEANUP:** Đối tượng tạo thành công chưa có lịch sử: A1 DELETE sách/user thử sau ca. Có lịch sử: chỉ giữ trong môi trường test riêng; muốn reset phải dùng cơ chế môi trường test được cho phép, không xóa volume/DB có dữ liệu cần giữ. Không để cleanup làm mất bằng chứng.

**Thứ tự chạy:** Chuẩn bị fixture độc lập, chạy P0 trước P1. Rate limit dùng instance/IP riêng hoặc chạy cuối. Hết hạn session cần 8 giờ, đánh dấu Chưa chạy/Blocked nếu chưa chờ đủ.

**Phân loại kết quả:** Pass: mọi assertion đạt. Fail: sai khác có bằng chứng. Blocked: thiếu fixture/công cụ/đặc tả. Chưa chạy: chưa thực hiện. Các mục chưa chốt nằm riêng ở sheet Cần làm rõ, chưa tính là TC thực thi.

**Phạm vi:** Đã đọc SRS v1.0 ngày 16/10/2026 do người dùng cung cấp (SHA-256 trong srs-code-review.md). Phủ các nhóm FR-01…12 nhưng vẫn còn mục TBD/NFR chưa được nghiệm thu. Không gồm trả sách, gia hạn, phạt, thanh toán. Bộ này thiên về API hộp đen, có các ca UI riêng; không thay thế UAT toàn bộ màn hình.

**Sinh lại file:** python docs/blackbox/generate_workbook.py (cần openpyxl). Script chỉ sinh CSV/Markdown/Excel, không chạy ứng dụng hoặc sửa mã ứng dụng.

## Điểm cần làm rõ

| ID | Chủ đề | Phát hiện | Xử lý |
| --- | --- | --- | --- |
| Q-01 | Mới cập nhật / sort=newest | UI ghi Mới cập nhật nhưng static review API cho thấy sắp theo ID tạo mới; OpenAPI chỉ nêu enum. | Cần chủ sản phẩm xác định theo thời điểm tạo hay thời điểm sửa, chiều và quy tắc bằng nhau. Không biến hành vi hiện tại thành chuẩn. Chưa có TC nghiệm thu sort=newest. |
| Q-02 | Query ngoài hợp đồng | userId không nằm trong query của /me/borrow-requests. | Bắt buộc không lộ dữ liệu U2; cần chốt HTTP 400 hoặc bỏ qua với 200. Chưa đưa biến thể này vào bộ TC thực thi cho tới khi chốt HTTP. |
| Q-03 | ADMIN cuối cùng | Quy tắc có trong decisions.md; không thể dựng tình huống một ADMIN hợp lệ hạ/xóa ADMIN cuối khác chỉ bằng luồng công khai mà không đồng thời vi phạm tự bảo vệ. | Đã có TC tự bảo vệ; không tuyên bố đã phủ riêng mọi nhánh last-admin. Cần thiết kế quyền nhiều ADMIN/fixture ngoài phạm vi hộp đen trước khi bổ sung. |
| Q-04 | Giới hạn triển khai ngoài SRS | Đã nhận SRS v1.0 ngày 16/10/2026. SRS dùng BIGINT UNSIGNED trong dictionary; code dùng INT và path max2147483647; totalQuantity max1.000.000 và description max10.000 chưa được chốt trong SRS. | Đây là khác biệt thiết kế/contract cần xác nhận, không tự gắn thành requirement đã được duyệt. |
| Q-06 | TBD của SRS so với decisions.md | SRS vẫn để TBD: auth/session/expiry, password, email, quyền Guest, Admin mượn, duplicate pending, quyền sửa tồn và tự quản lý ADMIN. decisions.md ghi các lựa chọn triển khai; SRS tải lên chưa cập nhật chúng. | TC của các chính sách này chỉ là kiểm tra contract/cấu hình hiện tại, chưa đủ để kết luận đạt SRS nếu thiếu phê duyệt thay đổi yêu cầu. |
| Q-07 | Mâu thuẫn quyền lịch sử Admin trong SRS | API catalog ghi /me/borrow-requests: User; authorization matrix ghi Admin được own borrow history. Code chỉ yêu cầu auth nên Admin cũng gọi được. | Cần chốt và cập nhật SRS; chưa kết luận code vi phạm ở mục này. |
| Q-05 | NFR và audit/rollback | Chưa có ngưỡng SLA/p95/RPO/RTO hoặc API đọc audit và cơ chế gây lỗi hạ tầng được hỗ trợ. | Không đánh dấu các yêu cầu này đạt. Bộ hiện tại không thay thế load test, penetration test, kiểm thử khôi phục hoặc kiểm thử hộp trắng rollback. |

## Test case

### BB2-001 — Đăng ký hợp lệ

- Truy vết: FR-01; ID cũ: BB-001; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username/email mới.
- Dữ liệu: REG.

1. POST /auth/register với REG.
2. GET /admin/users bằng A1, q=username.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** success=true; data.username/fullName/email đúng; data.role=USER; không có password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-002 — Thiếu username

- Truy vết: FR-01; ID cũ: BB-002; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG bỏ khóa username.

1. POST /auth/register.
2. A1 GET /admin/users?q={RUN}, duyệt mọi trang; không có ID mới thuộc marker RUN.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo tài khoản.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-003 — Thiếu fullName

- Truy vết: FR-01; ID cũ: BB-002; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG bỏ khóa fullName.

1. POST /auth/register.
2. A1 GET /admin/users?q={RUN}, duyệt mọi trang; không có ID mới thuộc marker RUN.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo tài khoản.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-004 — Thiếu password

- Truy vết: FR-01; ID cũ: BB-002; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG bỏ khóa password.

1. POST /auth/register.
2. A1 GET /admin/users?q={RUN}, duyệt mọi trang; không có ID mới thuộc marker RUN.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo tài khoản.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-005 — username = "repeat(a,0)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,0)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-006 — username = "repeat(a,1)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,1)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.username đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-007 — username = "repeat(a,2)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,2)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.username đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-008 — username = "repeat(a,63)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,63)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.username đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-009 — username = "repeat(a,64)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,64)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.username đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-010 — username = "repeat(a,65)"

- Truy vết: FR-01; ID cũ: BB-003; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất username bằng "repeat(a,65)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-011 — password = "repeat(a,7)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,7)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-012 — password = "repeat(a,8)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,8)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** 201; tài khoản mới được tạo. Đăng nhập bằng chính mật khẩu đầu vào trả 200; JSON không trả password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-013 — password = "repeat(a,9)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,9)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** 201; tài khoản mới được tạo. Đăng nhập bằng chính mật khẩu đầu vào trả 200; JSON không trả password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-014 — password = "repeat(a,127)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,127)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** 201; tài khoản mới được tạo. Đăng nhập bằng chính mật khẩu đầu vào trả 200; JSON không trả password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-015 — password = "repeat(a,128)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,128)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** 201; tài khoản mới được tạo. Đăng nhập bằng chính mật khẩu đầu vào trả 200; JSON không trả password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-016 — password = "repeat(a,129)"

- Truy vết: FR-01; ID cũ: BB-005; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-07 / TBD-SEC-01 vẫn TBD; 8–128 theo decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất password bằng "repeat(a,129)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-017 — fullName = "repeat(a,0)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,0)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-018 — fullName = "repeat(a,1)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,1)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.fullName đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-019 — fullName = "repeat(a,2)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,2)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.fullName đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-020 — fullName = "repeat(a,149)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,149)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.fullName đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-021 — fullName = "repeat(a,150)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,150)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.fullName đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-022 — fullName = "repeat(a,151)"

- Truy vết: FR-01; ID cũ: BB-006; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username một ký tự cần bảo đảm chưa tồn tại; cô lập từng ca để tránh trùng.
- Dữ liệu: REG mới; repeat(a,n) là chuỗi n ký tự a, không phải chuỗi biểu thức; thay duy nhất fullName bằng "repeat(a,151)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-023 — username = "abc def"

- Truy vết: FR-01; ID cũ: BB-004; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS không chốt regex username; theo OpenAPI hiện tại.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username thử chưa tồn tại.
- Dữ liệu: REG; thay duy nhất username bằng "abc def".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-024 — username = "abc@def"

- Truy vết: FR-01; ID cũ: BB-004; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS không chốt regex username; theo OpenAPI hiện tại.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username thử chưa tồn tại.
- Dữ liệu: REG; thay duy nhất username bằng "abc@def".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-025 — username = "a-Z_0.9-"

- Truy vết: FR-01; ID cũ: BB-004; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS không chốt regex username; theo OpenAPI hiện tại.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; username thử chưa tồn tại.
- Dữ liệu: REG; thay duy nhất username bằng "a-Z_0.9-".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.username đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-026 — Đăng ký trùng username

- Truy vết: FR-01; ID cũ: BB-007; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; U1 có email hợp lệ.
- Dữ liệu: REG mới nhưng username trùng U1.

1. POST /auth/register.
2. A1 tìm username mới và đọc U1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** error.code=DUPLICATE; không tạo tài khoản mới; U1 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-027 — Đăng ký trùng email

- Truy vết: FR-01; ID cũ: BB-009; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01: duy nhất nếu email bật; cấu hình bật theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; U1 có email hợp lệ.
- Dữ liệu: REG mới nhưng email trùng U1.

1. POST /auth/register.
2. A1 tìm username mới và đọc U1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** error.code=DUPLICATE; không tạo tài khoản mới; U1 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-028 — email = "<OMIT>"

- Truy vết: FR-01; ID cũ: BB-008; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01 / TBD-USER-01 vẫn TBD; email tùy chọn/định dạng theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG; <OMIT> nghĩa là bỏ khóa; thay duy nhất email bằng "<OMIT>".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.email=null.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-029 — email = ""

- Truy vết: FR-01; ID cũ: BB-008; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01 / TBD-USER-01 vẫn TBD; email tùy chọn/định dạng theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG; <OMIT> nghĩa là bỏ khóa; thay duy nhất email bằng "".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.email=null.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-030 — email = null

- Truy vết: FR-01; ID cũ: BB-008; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01 / TBD-USER-01 vẫn TBD; email tùy chọn/định dạng theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG; <OMIT> nghĩa là bỏ khóa; thay duy nhất email bằng null.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.email=null.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-031 — email = "bb{RUN}@example.com"

- Truy vết: FR-01; ID cũ: BB-008; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01 / TBD-USER-01 vẫn TBD; email tùy chọn/định dạng theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG; <OMIT> nghĩa là bỏ khóa; thay duy nhất email bằng "bb{RUN}@example.com".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.email đúng địa chỉ đã gửi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-032 — email = "abc@"

- Truy vết: FR-01; ID cũ: BB-008; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01 / TBD-USER-01 vẫn TBD; email tùy chọn/định dạng theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG; <OMIT> nghĩa là bỏ khóa; thay duy nhất email bằng "abc@".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/register.
3. Đọc phản hồi.
4. A1 GET /admin/users?q={RUN}, duyệt mọi trang (marker nằm trong username hoặc fullName không bị thay); đối chiếu ID trước/sau.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không có ID tài khoản mới thuộc marker RUN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-033 — Chèn role ADMIN khi đăng ký

- Truy vết: FR-01; ID cũ: BB-010; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register; decisions.md: tài khoản/email/mật khẩu.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: REG thêm role=ADMIN.

1. POST /auth/register.
2. A1 kiểm tra username mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo tài khoản với bất kỳ role nào.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-034 — Đăng nhập USER

- Truy vết: FR-02; ID cũ: BB-011; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-02; cookie session là lựa chọn bổ sung TBD-AUTH-01, không phải yêu cầu JWT bắt buộc.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; tài khoản USER có mật khẩu thử đã biết.
- Dữ liệu: LOGIN của USER.

1. POST /auth/login bằng cookie jar mới.
2. Kiểm tra Set-Cookie.
3. GET /me bằng cookie vừa nhận.

**HTTP mong đợi:** 200; GET /me: 200.
**Kết quả mong đợi:** success=true; data.user đúng tài khoản USER; cookie library_session có HttpOnly, SameSite=Strict; /me đúng ID/role, không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-035 — Đăng nhập ADMIN

- Truy vết: FR-02; ID cũ: BB-011; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-02; cookie session là lựa chọn bổ sung TBD-AUTH-01, không phải yêu cầu JWT bắt buộc.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST; tài khoản ADMIN có mật khẩu thử đã biết.
- Dữ liệu: LOGIN của ADMIN.

1. POST /auth/login bằng cookie jar mới.
2. Kiểm tra Set-Cookie.
3. GET /me bằng cookie vừa nhận.

**HTTP mong đợi:** 200; GET /me: 200.
**Kết quả mong đợi:** success=true; data.user đúng tài khoản ADMIN; cookie library_session có HttpOnly, SameSite=Strict; /me đúng ID/role, không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-036 — Sai mật khẩu

- Truy vết: FR-02; ID cũ: BB-012; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN U1 nhưng password sai.

1. POST /auth/login.
2. GET /me bằng jar đó.

**HTTP mong đợi:** 401; GET /me: 401.
**Kết quả mong đợi:** INVALID_CREDENTIALS; không cấp phiên có thể dùng để gọi /me.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-037 — Tài khoản không tồn tại

- Truy vết: FR-02; ID cũ: BB-012; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN username chữ/số xác nhận không tồn tại.

1. POST /auth/login.
2. GET /me bằng jar đó.

**HTTP mong đợi:** 401; GET /me: 401.
**Kết quả mong đợi:** INVALID_CREDENTIALS; không cấp phiên có thể dùng để gọi /me.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-038 — username = ""

- Truy vết: FR-02; ID cũ: BB-013; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Login.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN; <OMIT> nghĩa là bỏ khóa; thay duy nhất username bằng "".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/login.
3. Đọc phản hồi.
4. GET /me bằng cùng jar.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; GET /me bằng cùng jar trả 401.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-039 — username = "<OMIT>"

- Truy vết: FR-02; ID cũ: BB-013; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Login.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN; <OMIT> nghĩa là bỏ khóa; thay duy nhất username bằng "<OMIT>".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/login.
3. Đọc phản hồi.
4. GET /me bằng cùng jar.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; GET /me bằng cùng jar trả 401.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-040 — password = ""

- Truy vết: FR-02; ID cũ: BB-013; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Login.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN; <OMIT> nghĩa là bỏ khóa; thay duy nhất password bằng "".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/login.
3. Đọc phản hồi.
4. GET /me bằng cùng jar.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; GET /me bằng cùng jar trả 401.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-041 — password = "<OMIT>"

- Truy vết: FR-02; ID cũ: BB-013; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Login.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: LOGIN; <OMIT> nghĩa là bỏ khóa; thay duy nhất password bằng "<OMIT>".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /auth/login.
3. Đọc phản hồi.
4. GET /me bằng cùng jar.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; GET /me bằng cùng jar trả 401.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-042 — Ngưỡng rate limit auth

- Truy vết: FR-02; ID cũ: BB-014; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: decisions.md: 100 yêu cầu/15 phút/IP trên nhóm auth.
- Căn cứ SRS/phạm vi: Rate-limit100/15 phút từ decisions.md; SRS không ấn định con số.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; Instance test riêng đã khởi động; chưa có request /auth từ IP thử; không có runner khác dùng IP này.
- Dữ liệu: 101 POST /auth/login cùng IP; LOGIN sai mật khẩu, đúng cấu trúc.

1. Gửi tuần tự 101 lần trong dưới 15 phút.
2. Ghi HTTP của từng lần.

**HTTP mong đợi:** Lần 1–100: 401; lần 101: 429.
**Kết quả mong đợi:** 100 lần đầu INVALID_CREDENTIALS; lần 101 RATE_LIMIT; /me với jar rỗng vẫn 401. Không chạy ca này chung instance/IP với ca auth khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-043 — Guest bị chặn /books

- Truy vết: FR-03; ID cũ: BB-015; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS TBD-BOOK-01: quyền Guest chưa chốt; TC401 theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; GUEST; B1 tồn tại.
- Dữ liệu: GET /books.

1. Gửi GET không có cookie.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không có dữ liệu sách.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-044 — Guest bị chặn /books/{B1}

- Truy vết: FR-04; ID cũ: BB-015; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS TBD-BOOK-01: quyền Guest chưa chốt; TC401 theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; GUEST; B1 tồn tại.
- Dữ liệu: GET /books/{B1}.

1. Gửi GET không có cookie.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không có dữ liệu sách.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-045 — Tìm theo title

- Truy vết: FR-03; ID cũ: BB-016; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tìm chuỗi con; OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1 với title=Sach{RUN} Alpha, author=Tacgia{RUN}, bookCode=CODE{RUN}.
- Dữ liệu: GET /books?q=Sach{RUN}.

1. Gửi truy vấn.
2. Duyệt mọi trang nếu có nhiều trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có ID B1; mọi kết quả có chuỗi tìm ở title, author hoặc bookCode (không phân biệt hoa/dấu).
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-046 — Tìm theo author

- Truy vết: FR-03; ID cũ: BB-016; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tìm chuỗi con; OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1 với title=Sach{RUN} Alpha, author=Tacgia{RUN}, bookCode=CODE{RUN}.
- Dữ liệu: GET /books?q=Tacgia{RUN}.

1. Gửi truy vấn.
2. Duyệt mọi trang nếu có nhiều trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có ID B1; mọi kết quả có chuỗi tìm ở title, author hoặc bookCode (không phân biệt hoa/dấu).
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-047 — Tìm theo bookCode

- Truy vết: FR-03; ID cũ: BB-016; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tìm chuỗi con; OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1 với title=Sach{RUN} Alpha, author=Tacgia{RUN}, bookCode=CODE{RUN}.
- Dữ liệu: GET /books?q=CODE{RUN}.

1. Gửi truy vấn.
2. Duyệt mọi trang nếu có nhiều trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có ID B1; mọi kết quả có chuỗi tìm ở title, author hoặc bookCode (không phân biệt hoa/dấu).
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-048 — Tìm tiếng Việt: THU VIEN {RUN}

- Truy vết: FR-03; ID cũ: BB-017; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tìm không phân biệt hoa/dấu.
- Căn cứ SRS/phạm vi: SRS checklist: search case/accent chưa chốt; TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1 title=Thư viện {RUN}.
- Dữ liệu: GET /books?q=THU VIEN {RUN}.

1. Gửi truy vấn URL-encoded.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có B1 trong kết quả; không bỏ sót vì hoa thường hoặc dấu.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-049 — Tìm tiếng Việt: thu vien {RUN}

- Truy vết: FR-03; ID cũ: BB-017; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tìm không phân biệt hoa/dấu.
- Căn cứ SRS/phạm vi: SRS checklist: search case/accent chưa chốt; TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1 title=Thư viện {RUN}.
- Dữ liệu: GET /books?q=thu vien {RUN}.

1. Gửi truy vấn URL-encoded.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có B1 trong kết quả; không bỏ sót vì hoa thường hoặc dấu.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-050 — Tìm không có kết quả

- Truy vết: FR-03; ID cũ: BB-018; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 xác nhận không có sách khớp chuỗi chữ/số này.
- Dữ liệu: GET /books?q=ZZZ{RUN}NoMatch999.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.items=[]; data.total=0; data.totalPages=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-051 — Kết hợp tìm và thể loại

- Truy vết: FR-03; ID cũ: BB-019; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo B1/B2 có cùng token Sach{RUN}, category lần lượt CAT{RUN}A/CAT{RUN}B.
- Dữ liệu: GET /books?q=Sach{RUN}&category=CAT{RUN}A.

1. Gửi truy vấn bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Có B1, không có B2; mọi item vừa khớp q vừa có category=CAT{RUN}A.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-052 — Sắp xếp title

- Truy vết: FR-03; ID cũ: BB-020; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: UI: Tên sách A → Z / Còn nhiều nhất; OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS chỉ nêu sort; chiều A-Z/available theo nhãn UI và OpenAPI. newest tách Q-01.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo 3 sách category=SORT{RUN}, title Aaa/Bbb/Ccc{RUN}, số khả dụng lần lượt 1/3/2.
- Dữ liệu: GET /books?category=SORT{RUN}&sort=title.

1. Gửi truy vấn.
2. So sánh cả danh sách 3 item.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Các title trong tập dữ liệu Aaa{RUN}, Bbb{RUN}, Ccc{RUN} theo thứ tự tăng A/B/C.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-053 — Sắp xếp available

- Truy vết: FR-03; ID cũ: BB-020; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: UI: Tên sách A → Z / Còn nhiều nhất; OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS chỉ nêu sort; chiều A-Z/available theo nhãn UI và OpenAPI. newest tách Q-01.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo 3 sách category=SORT{RUN}, title Aaa/Bbb/Ccc{RUN}, số khả dụng lần lượt 1/3/2.
- Dữ liệu: GET /books?category=SORT{RUN}&sort=available.

1. Gửi truy vấn.
2. So sánh cả danh sách 3 item.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** availableQuantity theo thứ tự 3,2,1; không ràng buộc thứ tự khi bằng nhau.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-054 — Biên page=0

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?page=0.

1. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không trả danh sách thành công.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-055 — Biên page=1

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?page=1.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.page=1; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-056 — Biên page=2

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?page=2.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.page=2; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-057 — Biên pageSize=0

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=0.

1. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không trả danh sách thành công.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-058 — Biên pageSize=1

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=1.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.pageSize=1; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-059 — Biên pageSize=2

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=2.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.pageSize=2; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-060 — Biên pageSize=99

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=99.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.pageSize=99; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-061 — Biên pageSize=100

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=100.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.pageSize=100; items không vượt pageSize; các trường total/totalPages nhất quán.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-062 — Biên pageSize=101

- Truy vết: FR-03; ID cũ: BB-021; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS nêu pagination invalid; ngưỡng1/100 từ decisions.md/OpenAPI, không phải con số SRS.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất 3 sách.
- Dữ liệu: GET /books?pageSize=101.

1. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không trả danh sách thành công.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-063 — q dài 254

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?q=repeat(a,254).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Trả danh sách (có thể rỗng), không lỗi validation.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-064 — q dài 255

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?q=repeat(a,255).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Trả danh sách (có thể rỗng), không lỗi validation.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-065 — q dài 256

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?q=repeat(a,256).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-066 — category dài 99

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?category=repeat(a,99).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Trả danh sách (có thể rỗng), không lỗi validation.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-067 — category dài 100

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?category=repeat(a,100).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Trả danh sách (có thể rỗng), không lỗi validation.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-068 — category dài 101

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?category=repeat(a,101).

1. Tạo chuỗi n ký tự a, URL-encode.
2. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-069 — Sort ngoài allowlist

- Truy vết: FR-03; ID cũ: BB-022; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: Giới hạn query/enum từ OpenAPI; SRS nêu query phải hợp lệ.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /books?sort=invalid.

1. Gửi truy vấn.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-070 — Trang đầu

- Truy vết: FR-03; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo chính xác 5 sách trong category=PAGE{RUN}, title A/B/C/D/E{RUN}; không ghi dữ liệu đồng thời.
- Dữ liệu: GET /books?category=PAGE{RUN}&sort=title&page=1&pageSize=2.

1. Đọc trang 1–3 làm mốc khi cần.
2. Gửi truy vấn mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** 2 item; 2 ID đầu trong thứ tự đã chọn. data.total=5; data.totalPages=3.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-071 — Trang giữa

- Truy vết: FR-03; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo chính xác 5 sách trong category=PAGE{RUN}, title A/B/C/D/E{RUN}; không ghi dữ liệu đồng thời.
- Dữ liệu: GET /books?category=PAGE{RUN}&sort=title&page=2&pageSize=2.

1. Đọc trang 1–3 làm mốc khi cần.
2. Gửi truy vấn mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** 2 item tiếp theo; không trùng ID trang đầu. data.total=5; data.totalPages=3.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-072 — Trang cuối

- Truy vết: FR-03; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo chính xác 5 sách trong category=PAGE{RUN}, title A/B/C/D/E{RUN}; không ghi dữ liệu đồng thời.
- Dữ liệu: GET /books?category=PAGE{RUN}&sort=title&page=3&pageSize=2.

1. Đọc trang 1–3 làm mốc khi cần.
2. Gửi truy vấn mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** 1 item còn lại; hợp ba trang là đúng 5 ID, không trùng/mất. data.total=5; data.totalPages=3.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-073 — Vượt trang cuối

- Truy vết: FR-03; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS FR-03; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; A1 tạo chính xác 5 sách trong category=PAGE{RUN}, title A/B/C/D/E{RUN}; không ghi dữ liệu đồng thời.
- Dữ liệu: GET /books?category=PAGE{RUN}&sort=title&page=4&pageSize=2.

1. Đọc trang 1–3 làm mốc khi cần.
2. Gửi truy vấn mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items=[]; total vẫn 5, totalPages vẫn 3. data.total=5; data.totalPages=3.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-074 — Phân trang mặc định

- Truy vết: FR-03; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: query parameters page/pageSize/q/category/sort.
- Căn cứ SRS/phạm vi: SRS checklist để pagination default TBD; default12 là decisions.md/OpenAPI.
- Vị trí code đối chiếu tĩnh: server/app.js:70 (paging), :251 listBooks; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; ít nhất 13 sách.
- Dữ liệu: GET /books không gửi page/pageSize.

1. Gửi truy vấn.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.page=1; data.pageSize=12; items có 12 phần tử.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-075 — Tồn tại

- Truy vết: FR-04; ID cũ: BB-023; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /books/{id}.
- Căn cứ SRS/phạm vi: SRS FR-04; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; U1; B1 tồn tại; MISSING_ID không tồn tại.
- Dữ liệu: GET /books/{B1}.

1. Gửi GET.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id=B1, đúng thông tin fixture.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-076 — Không tồn tại

- Truy vết: FR-04; ID cũ: BB-023; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /books/{id}.
- Căn cứ SRS/phạm vi: SRS FR-04; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; U1; B1 tồn tại; MISSING_ID không tồn tại.
- Dữ liệu: GET /books/{MISSING_ID}.

1. Gửi GET.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** BOOK_NOT_FOUND; không trả dữ liệu sách.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-077 — ID bằng 0

- Truy vết: FR-04; ID cũ: BB-024; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /books/{id}.
- Căn cứ SRS/phạm vi: SRS FR-04; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; U1; B1 tồn tại; MISSING_ID không tồn tại.
- Dữ liệu: GET /books/0.

1. Gửi GET.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-078 — ID âm

- Truy vết: FR-04; ID cũ: BB-024; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /books/{id}.
- Căn cứ SRS/phạm vi: SRS FR-04; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; U1; B1 tồn tại; MISSING_ID không tồn tại.
- Dữ liệu: GET /books/-1.

1. Gửi GET.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-079 — ID chữ

- Truy vết: FR-04; ID cũ: BB-024; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /books/{id}.
- Căn cứ SRS/phạm vi: SRS FR-04; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:293; src/main.jsx:979 BookDetail
- Tiền điều kiện: BASE; U1; B1 tồn tại; MISSING_ID không tồn tại.
- Dữ liệu: GET /books/abc.

1. Gửi GET.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-080 — Tạo yêu cầu không giảm tồn

- Truy vết: FR-05; ID cũ: BB-025; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 total=2, available=2; không có PENDING U1/B1.
- Dữ liệu: BORROW.

1. POST /borrow-requests.
2. GET /me/borrow-requests và GET /books/{B1}.

**HTTP mong đợi:** 201; các GET: 200.
**Kết quả mong đợi:** data.id là ID mới; lịch sử có đúng ID, user.id=U1, status=PENDING, ngày D/D+1; availableQuantity vẫn 2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-081 — Ngày trả D-1

- Truy vết: FR-05; ID cũ: BB-026; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW, dueDate=D-1.

1. POST /borrow-requests.
2. Đọc lịch sử U1 và tồn B1.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** INVALID_DATES; không tạo yêu cầu, tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-082 — Ngày trả D+0

- Truy vết: FR-05; ID cũ: BB-026; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW, dueDate=D.

1. POST /borrow-requests.
2. Đọc lịch sử U1 và tồn B1.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** INVALID_DATES; không tạo yêu cầu, tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-083 — Ngày trả D+1

- Truy vết: FR-05; ID cũ: BB-026; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW, dueDate=D+1.

1. POST /borrow-requests.
2. Đọc lịch sử U1 và tồn B1.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** Có yêu cầu mới PENDING, tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-084 — borrowDate = "2027-02-29"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất borrowDate bằng "2027-02-29".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-085 — borrowDate = "2028-02-30"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất borrowDate bằng "2028-02-30".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-086 — borrowDate = "31/12/2028"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất borrowDate bằng "31/12/2028".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-087 — borrowDate = ""

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất borrowDate bằng "".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-088 — dueDate = "2027-02-29"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất dueDate bằng "2027-02-29".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-089 — dueDate = "2028-02-30"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất dueDate bằng "2028-02-30".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-090 — dueDate = "31/12/2028"

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất dueDate bằng "31/12/2028".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-091 — dueDate = ""

- Truy vết: FR-05; ID cũ: BB-027; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW; trường ngày còn lại hợp lệ (2028-01-01 hoặc 2029-01-01 để bảo đảm thứ tự nếu ngày hợp lệ); thay duy nhất dueDate bằng "".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /borrow-requests.
3. Đọc phản hồi.
4. U1 GET /me/borrow-requests và GET /books/{B1}; đối chiếu lịch sử/tồn trước khi gửi.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; lịch sử U1 không có yêu cầu mới; tồn B1 không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-092 — Ngày nhuận hợp lệ

- Truy vết: FR-05; ID cũ: BB-028; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW với borrowDate=2028-02-29, dueDate=2028-03-01.

1. POST /borrow-requests.
2. GET lịch sử bằng cùng U1.

**HTTP mong đợi:** 201; GET: 200.
**Kết quả mong đợi:** Ngày đọc lại đúng 2028-02-29/2028-03-01, status=PENDING.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-093 — Mượn sách không tồn tại

- Truy vết: FR-05; ID cũ: BB-029; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; MISSING_ID không tồn tại.
- Dữ liệu: BORROW bookId=MISSING_ID.

1. POST /borrow-requests.
2. Đọc lịch sử U1.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** BOOK_NOT_FOUND; không tạo yêu cầu.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-094 — Chèn userId

- Truy vết: FR-05; ID cũ: BB-030; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW thêm userId={U2}.

1. POST /borrow-requests.
2. Đọc lịch sử U1/U2.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không có yêu cầu mới hoặc thay đổi tồn.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-095 — Chèn status

- Truy vết: FR-05; ID cũ: BB-030; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW thêm status=APPROVED.

1. POST /borrow-requests.
2. Đọc lịch sử U1/U2.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không có yêu cầu mới hoặc thay đổi tồn.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-096 — Chèn reviewedBy

- Truy vết: FR-05; ID cũ: BB-030; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; B1 mới, không có PENDING.
- Dữ liệu: BORROW thêm reviewedBy={A1}.

1. POST /borrow-requests.
2. Đọc lịch sử U1/U2.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không có yêu cầu mới hoặc thay đổi tồn.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-097 — Trùng PENDING

- Truy vết: FR-05; ID cũ: BB-031; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS BR-18 / TBD-BORROW-03 còn TBD; chặn trùng là decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; U1; đã có đúng một R1 PENDING của U1/B1.
- Dữ liệu: BORROW cùng B1.

1. POST /borrow-requests.
2. Đọc đủ các trang lịch sử U1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE_PENDING; vẫn đúng một PENDING U1/B1; tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-098 — ADMIN không được tạo yêu cầu

- Truy vết: FR-05; ID cũ: BB-032; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS authorization matrix để TBD Admin mượn; TC403 theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; A1; B1 tồn tại.
- Dữ liệu: BORROW.

1. POST /borrow-requests bằng A1.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không tạo yêu cầu.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-099 — Gửi mới sau APPROVED

- Truy vết: FR-05/FR-11; ID cũ: BB-054; ưu tiên: P1; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05/FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm; server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; U1; yêu cầu cũ U1/B1 đã APPROVED; không còn PENDING U1/B1.
- Dữ liệu: BORROW.

1. POST /borrow-requests.
2. GET lịch sử.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** Có ID mới PENDING; yêu cầu cũ giữ trạng thái; tồn trước/sau tạo mới không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-100 — Gửi mới sau DENIED

- Truy vết: FR-05/FR-11; ID cũ: BB-054; ưu tiên: P1; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-05/FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm; server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; U1; yêu cầu cũ U1/B1 đã DENIED; không còn PENDING U1/B1.
- Dữ liệu: BORROW.

1. POST /borrow-requests.
2. GET lịch sử.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** Có ID mới PENDING; yêu cầu cũ giữ trạng thái; tồn trước/sau tạo mới không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-101 — Hồ sơ U1

- Truy vết: FR-06; ID cũ: BB-033; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-06; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:129 (auth), :250 (/me); src/main.jsx:1709 Profile
- Tiền điều kiện: BASE; U1 và U2 có phiên riêng.
- Dữ liệu: GET /me bằng U1.

1. Gửi GET với jar chỉ của tài khoản mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id/username/role đúng U1; không có password, passwordHash hoặc token trong JSON.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-102 — Hồ sơ U2

- Truy vết: FR-06; ID cũ: BB-033; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-06; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:129 (auth), :250 (/me); src/main.jsx:1709 Profile
- Tiền điều kiện: BASE; U1 và U2 có phiên riêng.
- Dữ liệu: GET /me bằng U2.

1. Gửi GET với jar chỉ của tài khoản mục tiêu.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id/username/role đúng U2; không có password, passwordHash hoặc token trong JSON.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-103 — Cách ly lịch sử

- Truy vết: FR-07; ID cũ: BB-034; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1/U2 có lịch sử riêng và cookie riêng.
- Dữ liệu: GET /me/borrow-requests bằng U1.

1. Gửi GET, đọc mọi trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Tất cả item.user.id=U1; không có ID yêu cầu của U2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-104 — Lọc lịch sử PENDING

- Truy vết: FR-07; ID cũ: BB-035; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /me/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1 có ít nhất một yêu cầu mỗi trạng thái hợp lệ.
- Dữ liệu: GET /me/borrow-requests?status=PENDING.

1. Gửi GET bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items không rỗng; mọi item.status=PENDING và user.id=U1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-105 — Lọc lịch sử APPROVED

- Truy vết: FR-07; ID cũ: BB-035; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /me/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1 có ít nhất một yêu cầu mỗi trạng thái hợp lệ.
- Dữ liệu: GET /me/borrow-requests?status=APPROVED.

1. Gửi GET bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items không rỗng; mọi item.status=APPROVED và user.id=U1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-106 — Lọc lịch sử DENIED

- Truy vết: FR-07; ID cũ: BB-035; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /me/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1 có ít nhất một yêu cầu mỗi trạng thái hợp lệ.
- Dữ liệu: GET /me/borrow-requests?status=DENIED.

1. Gửi GET bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items không rỗng; mọi item.status=DENIED và user.id=U1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-107 — Lọc lịch sử INVALID

- Truy vết: FR-07; ID cũ: BB-035; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /me/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1 có ít nhất một yêu cầu mỗi trạng thái hợp lệ.
- Dữ liệu: GET /me/borrow-requests?status=INVALID.

1. Gửi GET bằng U1.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-108 — Lịch sử rỗng

- Truy vết: FR-07; ID cũ: BB-036; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /me/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; USER mới U0 chưa có yêu cầu.
- Dữ liệu: GET /me/borrow-requests bằng U0.

1. Gửi GET.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items=[]; total=0; totalPages=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-109 — Đăng xuất thu hồi phiên

- Truy vết: FR-08; ID cũ: BB-037; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-08 phụ thuộc cơ chế auth; thu hồi ngay theo session trong decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:235 logout; src/main.jsx:195 logout
- Tiền điều kiện: BASE; U1 có phiên còn hạn; giữ bản cookie chỉ trong HTTP client cục bộ.
- Dữ liệu: POST /auth/logout; GET /me với chính cookie cũ.

1. POST logout.
2. Gửi lại GET /me kèm cookie cũ, không dựa vào việc browser đã xóa cookie.

**HTTP mong đợi:** 204; GET: 401.
**Kết quả mong đợi:** Logout không có body; cookie cũ không được chấp nhận (UNAUTHENTICATED).
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-110 — GUEST bị chặn GET /admin/stats

- Truy vết: FR-09; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/stats bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-111 — U1 bị chặn GET /admin/stats

- Truy vết: FR-09; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/stats bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-112 — GUEST bị chặn GET /admin/books

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/books bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-113 — U1 bị chặn GET /admin/books

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/books bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-114 — GUEST bị chặn POST /admin/books

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: BOOK mới.

1. Gửi POST /admin/books bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-115 — U1 bị chặn POST /admin/books

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: BOOK mới.

1. Gửi POST /admin/books bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-116 — GUEST bị chặn PUT /admin/books/{B1}

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: BOOK giữ mã B1; title mới.

1. Gửi PUT /admin/books/{B1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-117 — U1 bị chặn PUT /admin/books/{B1}

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: BOOK giữ mã B1; title mới.

1. Gửi PUT /admin/books/{B1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-118 — GUEST bị chặn DELETE /admin/books/{B1}

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body; B1 chưa có lịch sử.

1. Gửi DELETE /admin/books/{B1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-119 — U1 bị chặn DELETE /admin/books/{B1}

- Truy vết: FR-10; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body; B1 chưa có lịch sử.

1. Gửi DELETE /admin/books/{B1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-120 — GUEST bị chặn GET /admin/borrow-requests

- Truy vết: FR-11; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/borrow-requests bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-121 — U1 bị chặn GET /admin/borrow-requests

- Truy vết: FR-11; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/borrow-requests bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-122 — GUEST bị chặn PATCH /admin/borrow-requests/{R1}

- Truy vết: FR-11; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: decision=APPROVE; R1 PENDING còn tồn.

1. Gửi PATCH /admin/borrow-requests/{R1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-123 — U1 bị chặn PATCH /admin/borrow-requests/{R1}

- Truy vết: FR-11; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: decision=APPROVE; R1 PENDING còn tồn.

1. Gửi PATCH /admin/borrow-requests/{R1} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-124 — GUEST bị chặn GET /admin/users

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/users bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-125 — U1 bị chặn GET /admin/users

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body.

1. Gửi GET /admin/users bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-126 — GUEST bị chặn POST /admin/users

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: REG mới; role=USER.

1. Gửi POST /admin/users bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-127 — U1 bị chặn POST /admin/users

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: REG mới; role=USER.

1. Gửi POST /admin/users bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-128 — GUEST bị chặn PUT /admin/users/{U2}

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: USERPUT U2, fullName mới.

1. Gửi PUT /admin/users/{U2} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-129 — U1 bị chặn PUT /admin/users/{U2}

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: USERPUT U2, fullName mới.

1. Gửi PUT /admin/users/{U2} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-130 — GUEST bị chặn DELETE /admin/users/{U2}

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; GUEST; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body; U2 chưa có lịch sử.

1. Gửi DELETE /admin/users/{U2} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-131 — U1 bị chặn DELETE /admin/users/{U2}

- Truy vết: FR-12; ID cũ: BB-038; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; U1; A1 chuẩn bị B1/R1/U2 phù hợp và ghi mốc đối tượng; Content-Type JSON, Origin hợp lệ.
- Dữ liệu: Không body; U2 chưa có lịch sử.

1. Gửi DELETE /admin/users/{U2} bằng vai trò mục tiêu.
2. A1 đọc lại đối tượng nếu đây là mutation.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** FORBIDDEN; không lộ dữ liệu quản trị; mutation không đổi đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-132 — ADMIN xem thống kê

- Truy vết: FR-09; ID cũ: BB-038; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /admin/stats; UI: Tổng quan.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; A1.
- Dữ liệu: GET /admin/stats.

1. Gửi GET.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** success=true; có totalBooks,totalCopies,availableCopies,totalUsers,totalRequests,pending,approved,denied; các tổng không âm.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-133 — Thống kê sau thêm sách

- Truy vết: FR-09; ID cũ: BB-039; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tồn kho; UI: Tổng quan.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; A1; không có người ghi đồng thời; lấy S0 từ GET stats.
- Dữ liệu: BOOK mới total=3, available mặc định.

1. POST /admin/books.
2. GET stats S1.

**HTTP mong đợi:** POST: 201; GET: 200.
**Kết quả mong đợi:** S1.totalBooks=S0+1; totalCopies=S0+3; availableCopies=S0+3; các chỉ số user/request/status không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-134 — Thống kê sau tạo yêu cầu

- Truy vết: FR-09; ID cũ: BB-039; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: tạo yêu cầu không giảm tồn; UI: Tổng quan.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; A1/U1; B1 còn tồn; không trùng PENDING; không có ghi đồng thời; lấy S0.
- Dữ liệu: BORROW bằng U1.

1. POST /borrow-requests.
2. A1 GET stats S1.

**HTTP mong đợi:** POST: 201; GET: 200.
**Kết quả mong đợi:** totalRequests/pending tăng 1; approved/denied, totalBooks/totalCopies/availableCopies/totalUsers không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-135 — Thống kê sau duyệt

- Truy vết: FR-09; ID cũ: BB-039; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-09; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:400 stats; src/main.jsx:1374 Dashboard
- Tiền điều kiện: BASE; A1; R1 PENDING còn tồn; không ghi đồng thời; lấy S0.
- Dữ liệu: decision=APPROVE.

1. PATCH R1.
2. GET stats S1.

**HTTP mong đợi:** PATCH: 200; GET: 200.
**Kết quả mong đợi:** pending giảm 1; approved tăng 1; availableCopies giảm 1; totalRequests/denied/totalBooks/totalCopies/totalUsers không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-136 — Tạo sách mặc định tồn

- Truy vết: FR-10; ID cũ: BB-040; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK; totalQuantity=2; bỏ availableQuantity.

1. POST /admin/books.
2. GET /books/{ID mới}.

**HTTP mong đợi:** 201; GET: 200.
**Kết quả mong đợi:** totalQuantity=2; availableQuantity=2; mã/tên/tác giả khớp BOOK.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-137 — Mã sách trùng

- Truy vết: FR-10; ID cũ: BB-041; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 đã tồn tại.
- Dữ liệu: BOOK có bookCode trùng B1.

1. POST /admin/books.
2. Tìm theo mã B1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE; không tạo sách mới; B1 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-138 — bookCode = "repeat(a,0)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,0)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-139 — bookCode = "repeat(a,1)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,1)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.bookCode đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-140 — bookCode = "repeat(a,2)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,2)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.bookCode đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-141 — bookCode = "repeat(a,49)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,49)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.bookCode đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-142 — bookCode = "repeat(a,50)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,50)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.bookCode đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-143 — bookCode = "repeat(a,51)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất bookCode bằng "repeat(a,51)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-144 — title = "repeat(a,0)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,0)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-145 — title = "repeat(a,1)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,1)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.title đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-146 — title = "repeat(a,2)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,2)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.title đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-147 — title = "repeat(a,254)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,254)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.title đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-148 — title = "repeat(a,255)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,255)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.title đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-149 — title = "repeat(a,256)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất title bằng "repeat(a,256)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-150 — author = "repeat(a,0)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,0)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-151 — author = "repeat(a,1)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,1)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.author đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-152 — author = "repeat(a,2)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,2)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.author đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-153 — author = "repeat(a,254)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,254)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.author đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-154 — author = "repeat(a,255)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,255)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.author đúng giá trị đã gửi; các trường khác đúng dữ liệu nền; không lộ password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-155 — author = "repeat(a,256)"

- Truy vết: FR-10; ID cũ: BB-042; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; cô lập ca một ký tự để không trùng mã.
- Dữ liệu: BOOK mới; repeat(a,n) là n ký tự a; thay duy nhất author bằng "repeat(a,256)".

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-156 — totalQuantity = -1

- Truy vết: FR-10; ID cũ: BB-043; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; bỏ availableQuantity; thay duy nhất totalQuantity bằng -1.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-157 — totalQuantity = 0

- Truy vết: FR-10; ID cũ: BB-043; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; bỏ availableQuantity; thay duy nhất totalQuantity bằng 0.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.totalQuantity=0; data.availableQuantity=0; mã/tên/tác giả đúng BOOK.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-158 — totalQuantity = 1

- Truy vết: FR-10; ID cũ: BB-043; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; bỏ availableQuantity; thay duy nhất totalQuantity bằng 1.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.totalQuantity=1; data.availableQuantity=1; mã/tên/tác giả đúng BOOK.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-159 — totalQuantity = 2

- Truy vết: FR-10; ID cũ: BB-043; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; bỏ availableQuantity; thay duy nhất totalQuantity bằng 2.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. GET /books/{ID mới} bằng A1; đối chiếu các trường và tổng/tồn.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** data.totalQuantity=2; data.availableQuantity=2; mã/tên/tác giả đúng BOOK.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-160 — totalQuantity = 1.5

- Truy vết: FR-10; ID cũ: BB-043; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; bỏ availableQuantity; thay duy nhất totalQuantity bằng 1.5.

1. Chuẩn bị dữ liệu nền mới.
2. Gửi POST /admin/books.
3. Đọc phản hồi.
4. A1 GET /books?category=CAT{RUN}, duyệt mọi trang; danh sách vẫn rỗng, không có ID sách mới.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** success=false; error.code=VALIDATION_ERROR; không tạo/sửa đối tượng.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-161 — Tạo total=2, available=-1

- Truy vết: FR-10; ID cũ: BB-044; ưu tiên: P1; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10 quy định bất đẳng thức; quyền nhập available khi tạo vẫn TBD, TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; totalQuantity=2; availableQuantity=-1.

1. POST /admin/books.
2. Đọc lại ID mới nếu có.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo sách.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-162 — Tạo total=2, available=0

- Truy vết: FR-10; ID cũ: BB-044; ưu tiên: P1; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10 quy định bất đẳng thức; quyền nhập available khi tạo vẫn TBD, TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; totalQuantity=2; availableQuantity=0.

1. POST /admin/books.
2. Đọc lại ID mới nếu có.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** totalQuantity=2; availableQuantity=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-163 — Tạo total=2, available=1

- Truy vết: FR-10; ID cũ: BB-044; ưu tiên: P1; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10 quy định bất đẳng thức; quyền nhập available khi tạo vẫn TBD, TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; totalQuantity=2; availableQuantity=1.

1. POST /admin/books.
2. Đọc lại ID mới nếu có.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** totalQuantity=2; availableQuantity=1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-164 — Tạo total=2, available=2

- Truy vết: FR-10; ID cũ: BB-044; ưu tiên: P1; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10 quy định bất đẳng thức; quyền nhập available khi tạo vẫn TBD, TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; totalQuantity=2; availableQuantity=2.

1. POST /admin/books.
2. Đọc lại ID mới nếu có.

**HTTP mong đợi:** 201.
**Kết quả mong đợi:** totalQuantity=2; availableQuantity=2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-165 — Tạo total=2, available=3

- Truy vết: FR-10; ID cũ: BB-044; ưu tiên: P1; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10 quy định bất đẳng thức; quyền nhập available khi tạo vẫn TBD, TC theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: BOOK mới; totalQuantity=2; availableQuantity=3.

1. POST /admin/books.
2. Đọc lại ID mới nếu có.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** INVALID_QUANTITY; không tạo sách.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-166 — Sửa tổng thành 1 khi đang mượn 2

- Truy vết: FR-10; ID cũ: BB-045; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10; quy tắc sửa tổng giữ số đang mượn là decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 total=3, available=1; tạo 2 khoản APPROVED qua U1/U2; fixture mới cho mỗi ca.
- Dữ liệu: BOOK đầy đủ giữ bookCode/title/author B1; totalQuantity=1; bỏ availableQuantity.

1. PUT /admin/books/{B1}.
2. GET /books/{B1}; đọc hai yêu cầu đã duyệt.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** QUANTITY_CONFLICT; B1 giữ total=3, available=1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-167 — Sửa tổng thành 2 khi đang mượn 2

- Truy vết: FR-10; ID cũ: BB-045; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10; quy tắc sửa tổng giữ số đang mượn là decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 total=3, available=1; tạo 2 khoản APPROVED qua U1/U2; fixture mới cho mỗi ca.
- Dữ liệu: BOOK đầy đủ giữ bookCode/title/author B1; totalQuantity=2; bỏ availableQuantity.

1. PUT /admin/books/{B1}.
2. GET /books/{B1}; đọc hai yêu cầu đã duyệt.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** B1 total=2, available=0; hai yêu cầu vẫn APPROVED.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-168 — Sửa tổng thành 4 khi đang mượn 2

- Truy vết: FR-10; ID cũ: BB-045; ưu tiên: P0; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS BR-10; quy tắc sửa tổng giữ số đang mượn là decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 total=3, available=1; tạo 2 khoản APPROVED qua U1/U2; fixture mới cho mỗi ca.
- Dữ liệu: BOOK đầy đủ giữ bookCode/title/author B1; totalQuantity=4; bỏ availableQuantity.

1. PUT /admin/books/{B1}.
2. GET /books/{B1}; đọc hai yêu cầu đã duyệt.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** B1 total=4, available=2; hai yêu cầu vẫn APPROVED.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-169 — Từ chối ghi đè tồn khả dụng

- Truy vết: FR-10; ID cũ: Mới; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 total=3, available=1 với 2 khoản APPROVED.
- Dữ liệu: BOOK B1 totalQuantity=4, availableQuantity=4 (đúng phải là 2).

1. PUT /admin/books/{B1}.
2. GET sách.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** QUANTITY_CONFLICT; B1 vẫn total=3, available=1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-170 — Xóa sách chưa có lịch sử

- Truy vết: FR-10; ID cũ: BB-046; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 không có yêu cầu nào.
- Dữ liệu: DELETE /admin/books/{B1}.

1. DELETE B1.
2. GET B1; nếu có lịch sử, đọc yêu cầu cũ.

**HTTP mong đợi:** 204; GET: 404.
**Kết quả mong đợi:** DELETE không body; GET BOOK_NOT_FOUND.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-171 — Xóa sách có lịch sử

- Truy vết: FR-10; ID cũ: BB-046; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BookWrite, /admin/books; decisions.md: tồn kho.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; B1 có yêu cầu DENIED.
- Dữ liệu: DELETE /admin/books/{B1}.

1. DELETE B1.
2. GET B1; nếu có lịch sử, đọc yêu cầu cũ.

**HTTP mong đợi:** 409; GET: 200.
**Kết quả mong đợi:** HISTORY_CONFLICT; sách và lịch sử giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-172 — APPROVE khi available=1

- Truy vết: FR-11; ID cũ: BB-047; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING của U1/B1, B1.available=1; có thể tạo PENDING trước khi USER khác mượn cuốn cuối.
- Dữ liệu: {"decision":"APPROVE","note":"Ghi chu APPROVE"}.

1. PATCH /admin/borrow-requests/{R1}.
2. GET danh sách yêu cầu bằng A1, lọc ID R1.
3. GET sách B1 bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id=R1, status=APPROVED, reviewedBy=A1; lịch sử có reviewedAt trong khoảng gửi/nhận, decisionNote đúng; available=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-173 — DENY khi available=1

- Truy vết: FR-11; ID cũ: BB-048; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING của U1/B1, B1.available=1; có thể tạo PENDING trước khi USER khác mượn cuốn cuối.
- Dữ liệu: {"decision":"DENY","note":"Ghi chu DENY"}.

1. PATCH /admin/borrow-requests/{R1}.
2. GET danh sách yêu cầu bằng A1, lọc ID R1.
3. GET sách B1 bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id=R1, status=DENIED, reviewedBy=A1; lịch sử có reviewedAt trong khoảng gửi/nhận, decisionNote đúng; available=1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-174 — APPROVE khi available=0

- Truy vết: FR-11; ID cũ: BB-049; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING của U1/B1, B1.available=0; có thể tạo PENDING trước khi USER khác mượn cuốn cuối.
- Dữ liệu: {"decision":"APPROVE","note":"Ghi chu APPROVE"}.

1. PATCH /admin/borrow-requests/{R1}.
2. GET danh sách yêu cầu bằng A1, lọc ID R1.
3. GET sách B1 bằng U1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** OUT_OF_STOCK; R1 vẫn PENDING, reviewedBy/reviewedAt/decisionNote chưa có; available=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-175 — DENY khi available=0

- Truy vết: FR-11; ID cũ: Mới; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING của U1/B1, B1.available=0; có thể tạo PENDING trước khi USER khác mượn cuốn cuối.
- Dữ liệu: {"decision":"DENY","note":"Ghi chu DENY"}.

1. PATCH /admin/borrow-requests/{R1}.
2. GET danh sách yêu cầu bằng A1, lọc ID R1.
3. GET sách B1 bằng U1.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** data.id=R1, status=DENIED, reviewedBy=A1; lịch sử có reviewedAt trong khoảng gửi/nhận, decisionNote đúng; available=0.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-176 — APPROVED không chuyển qua APPROVE

- Truy vết: FR-11; ID cũ: BB-050; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 đã APPROVED; ghi trạng thái/metadata và tồn ban đầu.
- Dữ liệu: decision=APPROVE; note=khongduocdoi.

1. PATCH R1.
2. Đọc lại R1 và B1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** BORROW_REQUEST_ALREADY_PROCESSED; toàn bộ trạng thái/metadata xét duyệt và tồn giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-177 — APPROVED không chuyển qua DENY

- Truy vết: FR-11; ID cũ: BB-050; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 đã APPROVED; ghi trạng thái/metadata và tồn ban đầu.
- Dữ liệu: decision=DENY; note=khongduocdoi.

1. PATCH R1.
2. Đọc lại R1 và B1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** BORROW_REQUEST_ALREADY_PROCESSED; toàn bộ trạng thái/metadata xét duyệt và tồn giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-178 — DENIED không chuyển qua APPROVE

- Truy vết: FR-11; ID cũ: BB-050; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 đã DENIED; ghi trạng thái/metadata và tồn ban đầu.
- Dữ liệu: decision=APPROVE; note=khongduocdoi.

1. PATCH R1.
2. Đọc lại R1 và B1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** BORROW_REQUEST_ALREADY_PROCESSED; toàn bộ trạng thái/metadata xét duyệt và tồn giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-179 — DENIED không chuyển qua DENY

- Truy vết: FR-11; ID cũ: BB-050; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 đã DENIED; ghi trạng thái/metadata và tồn ban đầu.
- Dữ liệu: decision=DENY; note=khongduocdoi.

1. PATCH R1.
2. Đọc lại R1 và B1.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** BORROW_REQUEST_ALREADY_PROCESSED; toàn bộ trạng thái/metadata xét duyệt và tồn giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-180 — Duyệt đồng thời cùng yêu cầu

- Truy vết: FR-11; ID cũ: BB-051; ưu tiên: P0; kỹ thuật: Chuyển trạng thái / Đồng thời.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1 có hai jar hợp lệ; R1 PENDING; B1.available=2.
- Dữ liệu: Hai PATCH decision=APPROVE; cùng R1.

1. Dùng hai HTTP client đồng bộ bắt đầu bằng barrier, lưu giờ bắt đầu/kết thúc.
2. Gửi song song (không tuần tự).
3. Đọc cả phản hồi, lịch sử và sách. Nếu không có bằng chứng gửi song song, đánh dấu Blocked thay vì Pass.

**HTTP mong đợi:** Một 200; một 409.
**Kết quả mong đợi:** R1 APPROVED; tồn chỉ giảm 1 thành 1; không đổi quyết định lần hai.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-181 — Duyệt đồng thời tranh cuốn cuối

- Truy vết: FR-11; ID cũ: BB-052; ưu tiên: P0; kỹ thuật: Chuyển trạng thái / Đồng thời.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1 có hai jar hợp lệ; R1/R2 PENDING của U1/U2 cùng B1.available=1.
- Dữ liệu: Hai PATCH APPROVE, một R1 và một R2.

1. Dùng hai HTTP client đồng bộ bắt đầu bằng barrier, lưu giờ bắt đầu/kết thúc.
2. Gửi song song (không tuần tự).
3. Đọc cả phản hồi, lịch sử và sách. Nếu không có bằng chứng gửi song song, đánh dấu Blocked thay vì Pass.

**HTTP mong đợi:** Một 200; một 409.
**Kết quả mong đợi:** Chỉ một yêu cầu APPROVED; yêu cầu còn lại PENDING; available=0, không âm; không mất yêu cầu.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-182 — Ghi chú dài 0

- Truy vết: FR-11; ID cũ: BB-053; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING mới, B1.available=1.
- Dữ liệu: decision=APPROVE; note=repeat(a,0) (chuỗi thực, không phải biểu thức).

1. PATCH R1.
2. Đọc lại yêu cầu và sách.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** R1 APPROVED; tồn giảm đúng 1; decisionNote rỗng/null.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-183 — Ghi chú dài 499

- Truy vết: FR-11; ID cũ: BB-053; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING mới, B1.available=1.
- Dữ liệu: decision=APPROVE; note=repeat(a,499) (chuỗi thực, không phải biểu thức).

1. PATCH R1.
2. Đọc lại yêu cầu và sách.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** R1 APPROVED; decisionNote đúng 499 ký tự a; tồn giảm đúng 1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-184 — Ghi chú dài 500

- Truy vết: FR-11; ID cũ: BB-053; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING mới, B1.available=1.
- Dữ liệu: decision=APPROVE; note=repeat(a,500) (chuỗi thực, không phải biểu thức).

1. PATCH R1.
2. Đọc lại yêu cầu và sách.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** R1 APPROVED; decisionNote đúng 500 ký tự a; tồn giảm đúng 1.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-185 — Ghi chú dài 501

- Truy vết: FR-11; ID cũ: BB-053; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING mới, B1.available=1.
- Dữ liệu: decision=APPROVE; note=repeat(a,501) (chuỗi thực, không phải biểu thức).

1. PATCH R1.
2. Đọc lại yêu cầu và sách.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; R1 vẫn PENDING; tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-186 — Quyết định ngoài enum

- Truy vết: FR-11; ID cũ: BB-053; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; R1 PENDING còn tồn.
- Dữ liệu: decision=INVALID.

1. PATCH R1; đọc lại R1 và sách.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không đổi trạng thái, metadata hoặc tồn.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-187 — Xét duyệt ID không tồn tại

- Truy vết: FR-11; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: BorrowCreate, BorrowDecision; decisions.md: mượn/xét duyệt.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; MISSING_ID chưa tồn tại.
- Dữ liệu: PATCH /admin/borrow-requests/{MISSING_ID}; decision=APPROVE.

1. Gửi PATCH hợp lệ.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** REQUEST_NOT_FOUND; không ảnh hưởng yêu cầu/sách khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-188 — Admin lọc PENDING

- Truy vết: FR-11; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /admin/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; có ít nhất một yêu cầu mỗi trạng thái.
- Dữ liệu: GET /admin/borrow-requests?status=PENDING.

1. GET và duyệt đủ trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Mọi item.status=PENDING; tổng khớp số item qua mọi trang.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-189 — Admin lọc APPROVED

- Truy vết: FR-11; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /admin/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; có ít nhất một yêu cầu mỗi trạng thái.
- Dữ liệu: GET /admin/borrow-requests?status=APPROVED.

1. GET và duyệt đủ trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Mọi item.status=APPROVED; tổng khớp số item qua mọi trang.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-190 — Admin lọc DENIED

- Truy vết: FR-11; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: /admin/borrow-requests.
- Căn cứ SRS/phạm vi: SRS FR-11; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348, :490, :491 (decisions); src/main.jsx:1191 Requests, :1318 DecisionForm
- Tiền điều kiện: BASE; A1; có ít nhất một yêu cầu mỗi trạng thái.
- Dữ liệu: GET /admin/borrow-requests?status=DENIED.

1. GET và duyệt đủ trang.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** Mọi item.status=DENIED; tổng khớp số item qua mọi trang.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-191 — Admin tạo USER

- Truy vết: FR-12; ID cũ: BB-055; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1.
- Dữ liệu: REG mới; role=USER.

1. POST /admin/users.
2. GET /admin/users?q=username.

**HTTP mong đợi:** 201; GET: 200.
**Kết quả mong đợi:** ID mới; đúng username/fullName/email; role=USER; danh sách chứa tài khoản; không password/hash.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-192 — Admin sửa họ tên

- Truy vết: FR-12; ID cũ: BB-055; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 tồn tại.
- Dữ liệu: USERPUT U2; fullName=Ten Moi {RUN}; không gửi password.

1. PUT /admin/users/{U2}.
2. GET danh sách tìm U2.

**HTTP mong đợi:** 200; GET: 200.
**Kết quả mong đợi:** fullName cập nhật; ID/username/role giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-193 — Admin xóa USER không lịch sử

- Truy vết: FR-12; ID cũ: BB-055; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 chưa có yêu cầu mượn, không phải ADMIN.
- Dữ liệu: DELETE /admin/users/{U2}.

1. DELETE U2.
2. Tìm username U2.
3. Thử đăng nhập U2.

**HTTP mong đợi:** 204; GET: 200; LOGIN: 401.
**Kết quả mong đợi:** DELETE không body; danh sách không có U2; không thể đăng nhập U2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-194 — POST người dùng trùng username

- Truy vết: FR-12; ID cũ: BB-056; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U1/U2 tồn tại, email khác nhau và không rỗng.
- Dữ liệu: REG mới; thay username bằng giá trị U1.

1. POST /admin/users.
2. Đọc lại U1/U2 và tìm tài khoản mới nếu POST.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE; không tạo mới; U1/U2 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-195 — POST người dùng trùng email

- Truy vết: FR-12; ID cũ: BB-056; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U1/U2 tồn tại, email khác nhau và không rỗng.
- Dữ liệu: REG mới; thay email bằng giá trị U1.

1. POST /admin/users.
2. Đọc lại U1/U2 và tìm tài khoản mới nếu POST.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE; không tạo mới; U1/U2 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-196 — PUT người dùng trùng username

- Truy vết: FR-12; ID cũ: BB-056; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U1/U2 tồn tại, email khác nhau và không rỗng.
- Dữ liệu: USERPUT U2; thay username bằng giá trị U1.

1. PUT /admin/users/{U2}.
2. Đọc lại U1/U2 và tìm tài khoản mới nếu POST.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE; không tạo mới; U1/U2 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-197 — PUT người dùng trùng email

- Truy vết: FR-12; ID cũ: BB-056; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U1/U2 tồn tại, email khác nhau và không rỗng.
- Dữ liệu: USERPUT U2; thay email bằng giá trị U1.

1. PUT /admin/users/{U2}.
2. Đọc lại U1/U2 và tìm tài khoản mới nếu POST.

**HTTP mong đợi:** 409.
**Kết quả mong đợi:** DUPLICATE; không tạo mới; U1/U2 không thay đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-198 — Đổi mật khẩu thu hồi phiên

- Truy vết: FR-12; ID cũ: BB-057; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS không quy định cụ thể thu hồi session sau đổi password; theo OpenAPI/decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U1 có phiên còn hạn; biết mật khẩu thử cũ/mới khác nhau.
- Dữ liệu: USERPUT U1 thêm password=P_NEW.

1. PUT U1.
2. GET /me dùng cookie cũ U1.
3. LOGIN mật khẩu cũ bằng jar mới.
4. LOGIN mật khẩu mới.

**HTTP mong đợi:** PUT: 200; /me cũ: 401; LOGIN cũ: 401; LOGIN mới: 200.
**Kết quả mong đợi:** Cookie cũ bị thu hồi; chỉ mật khẩu mới dùng được; ID/role U1 giữ nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-199 — Đổi role thu hồi phiên

- Truy vết: FR-12; ID cũ: BB-058; ưu tiên: P0; kỹ thuật: Chuyển trạng thái.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; thu hồi session sau đổi role theo OpenAPI; quản trị ADMIN khác còn TBD.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 là USER có phiên còn hạn, không phải A1.
- Dữ liệu: USERPUT U2; role=ADMIN.

1. PUT U2.
2. GET /me dùng cookie cũ U2.
3. LOGIN lại U2; GET /admin/stats.

**HTTP mong đợi:** PUT: 200; /me cũ: 401; LOGIN mới: 200; stats: 200.
**Kết quả mong đợi:** Phiên cũ bị thu hồi; phiên mới nhận role ADMIN và dùng được quyền ADMIN.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-200 — Không được tự xóa

- Truy vết: FR-12; ID cũ: BB-059; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12 / TBD-ADMIN-01 còn TBD; tự bảo vệ ADMIN theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; ít nhất hai ADMIN để kiểm riêng quy tắc tự bảo vệ.
- Dữ liệu: Không body.

1. DELETE /admin/users/{A1} bằng A1.
2. GET /me bằng A1.

**HTTP mong đợi:** 409; GET: 200.
**Kết quả mong đợi:** ADMIN_PROTECTED; A1 vẫn tồn tại, role=ADMIN; phiên A1 còn dùng được.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-201 — Không được tự hạ quyền

- Truy vết: FR-12; ID cũ: BB-059; ưu tiên: P0; kỹ thuật: Bảng quyết định.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12 / TBD-ADMIN-01 còn TBD; tự bảo vệ ADMIN theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; ít nhất hai ADMIN để kiểm riêng quy tắc tự bảo vệ.
- Dữ liệu: USERPUT A1; role=USER.

1. PUT /admin/users/{A1} bằng A1.
2. GET /me bằng A1.

**HTTP mong đợi:** 409; GET: 200.
**Kết quả mong đợi:** ADMIN_PROTECTED; A1 vẫn tồn tại, role=ADMIN; phiên A1 còn dùng được.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-202 — Không xóa USER có lịch sử

- Truy vết: FR-12; ID cũ: BB-060; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 có một yêu cầu DENIED.
- Dữ liệu: DELETE /admin/users/{U2}.

1. DELETE U2.
2. GET danh sách và lịch sử của U2.

**HTTP mong đợi:** 409; GET: 200.
**Kết quả mong đợi:** HISTORY_CONFLICT; U2 và lịch sử còn nguyên.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-203 — Sửa hồ sơ không đổi mật khẩu

- Truy vết: FR-12; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: UserCreate/UserUpdate; decisions.md: quản trị người dùng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 có mật khẩu thử đã biết và phiên còn hạn.
- Dữ liệu: USERPUT U2 đổi fullName; bỏ password và role.

1. PUT U2.
2. GET /me bằng phiên U2 hiện tại.
3. LOGIN U2 bằng mật khẩu cũ trong jar khác.

**HTTP mong đợi:** PUT: 200; /me: 200; LOGIN: 200.
**Kết quả mong đợi:** Đổi đúng fullName; mật khẩu/role không đổi; phiên hiện tại không bị thu hồi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-204 — PUT đối tượng không tồn tại

- Truy vết: FR-10; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: operation tương ứng.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; MISSING_ID không tồn tại.
- Dữ liệu: BOOK.

1. Gửi PUT /admin/books/{MISSING_ID}.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** BOOK_NOT_FOUND; không thay đổi dữ liệu khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-205 — DELETE đối tượng không tồn tại

- Truy vết: FR-10; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: operation tương ứng.
- Căn cứ SRS/phạm vi: SRS FR-10; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:56 bookSchema, :413 create, :441 update, :481 delete; src/main.jsx:1102 BookForm
- Tiền điều kiện: BASE; A1; MISSING_ID không tồn tại.
- Dữ liệu: Không body.

1. Gửi DELETE /admin/books/{MISSING_ID}.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** BOOK_NOT_FOUND; không thay đổi dữ liệu khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-206 — PUT đối tượng không tồn tại

- Truy vết: FR-12; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: operation tương ứng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; MISSING_ID không tồn tại.
- Dữ liệu: REG; role=USER.

1. Gửi PUT /admin/users/{MISSING_ID}.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** USER_NOT_FOUND; không thay đổi dữ liệu khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-207 — DELETE đối tượng không tồn tại

- Truy vết: FR-12; ID cũ: Mới; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: operation tương ứng.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; MISSING_ID không tồn tại.
- Dữ liệu: Không body.

1. Gửi DELETE /admin/users/{MISSING_ID}.

**HTTP mong đợi:** 404.
**Kết quả mong đợi:** USER_NOT_FOUND; không thay đổi dữ liệu khác.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-208 — Phiên hết hạn tuyệt đối

- Truy vết: BR/Auth; ID cũ: BB-061; ưu tiên: P1; kỹ thuật: Giá trị biên.
- Nguồn kỳ vọng: OpenAPI: securitySchemes và security của operation; decisions.md: phân quyền/session.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-08 / TBD-AUTH-02 còn TBD; 8 giờ theo decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:129 auth, :217 session expiry
- Tiền điều kiện: BASE; U1 có phiên mới; SESSION_HOURS=8; không đổi mật khẩu/role/logout; đồng hồ client/server đồng bộ.
- Dữ liệu: GET /me cùng cookie tại t0+7h59m và t0+8h01m; t0 là thời điểm nhận LOGIN.

1. Giữ cookie trong client cục bộ.
2. Gửi GET ở hai mốc, buộc gửi cùng cookie kể cả sau hạn cookie.
3. Không đăng nhập lại; không sửa DB/đồng hồ.

**HTTP mong đợi:** Trước hạn: 200; sau hạn: 401.
**Kết quả mong đợi:** Trước hạn đúng U1; sau hạn UNAUTHENTICATED. Ghi giờ và độ lệch; ca chưa chờ đủ không được Pass.
**Hậu điều kiện/dọn dữ liệu:** Ca kéo dài 8 giờ, chạy riêng. Không lưu cookie vào báo cáo/Git; xóa cookie cục bộ sau khi thu bằng chứng.
**Trạng thái:** Chưa chạy.

### BB2-209 — Origin khác nguồn bị chặn

- Truy vết: BR/Security; ID cũ: BB-062; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: same-origin mutation.
- Căn cứ SRS/phạm vi: SRS NFR-SEC; Origin check là cơ chế session/same-origin bổ sung trong decisions.md.
- Vị trí code đối chiếu tĩnh: server/app.js:13 helmet, :150 Origin, :251 listBooks, :638 error handler; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; B1 còn tồn; không trùng PENDING; HTTP client gửi cookie chủ động, không dựa vào browser SameSite.
- Dữ liệu: BORROW; Origin=https://other.example.

1. POST /borrow-requests kèm cookie U1.
2. Đọc lịch sử U1.

**HTTP mong đợi:** 403.
**Kết quả mong đợi:** ORIGIN_REJECTED; không có yêu cầu mới, tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-210 — Chuỗi SQL được xử lý như dữ liệu

- Truy vết: BR/Security; ID cũ: BB-063; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: decisions.md: LIKE chuỗi con, parameterized input.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-04/05 về input/error; ca SQL/HTML bổ trợ kiểm tra bảo mật web, không thay penetration test.
- Vị trí code đối chiếu tĩnh: server/app.js:13 helmet, :150 Origin, :251 listBooks, :638 error handler; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; U1; có ít nhất một sách nhưng không có sách chứa chuỗi đầu vào.
- Dữ liệu: GET /books?q=' OR 1=1 --.

1. URL-encode chuỗi, GET /books.

**HTTP mong đợi:** 200.
**Kết quả mong đợi:** items=[]; total=0; không trả toàn bộ danh sách và không lộ lỗi SQL.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-211 — Không thực thi HTML trong tiêu đề

- Truy vết: BR/Security; ID cũ: BB-063; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: traceability.md: NFR-SEC; UI hiển thị dữ liệu người dùng.
- Căn cứ SRS/phạm vi: SRS NFR-SEC-04/05 về input/error; ca SQL/HTML bổ trợ kiểm tra bảo mật web, không thay penetration test.
- Vị trí code đối chiếu tĩnh: server/app.js:13 helmet, :150 Origin, :251 listBooks, :638 error handler; src/main.jsx:676 Catalog
- Tiền điều kiện: BASE; A1 tạo B1 riêng; U1 có browser mới.
- Dữ liệu: BOOK title=<script>window.bbXssFlag=1</script>.

1. A1 POST tạo sách.
2. U1 tìm mã B1, mở danh sách và chi tiết.
3. Kiểm tra console window.bbXssFlag trên trang.

**HTTP mong đợi:** POST: 201; GET/UI: 200.
**Kết quả mong đợi:** Tiêu đề hiển thị dạng văn bản đúng nội dung; window.bbXssFlag là undefined; không tạo phần tử script từ dữ liệu tiêu đề.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-212 — Bố cục USER 1440x1060

- Truy vết: UI; ID cũ: BB-064; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: README: responsive desktop/mobile.
- Căn cứ SRS/phạm vi: Ca UI bổ sung; SRS chưa chốt viewport 1440/390 hoặc tiêu chí responsive chi tiết.
- Vị trí code đối chiếu tĩnh: src/main.jsx:167 App, :648 Pagination, :676 Catalog; src/style.css
- Tiền điều kiện: BASE; Browser Chromium; USER có tài khoản hợp lệ; B1 tồn tại.
- Dữ liệu: Viewport 1440x1060.

1. Đăng nhập đúng vai trò.
2. Mở danh sách, tìm B1, mở chi tiết.
3. Mở Sách của tôi và Hồ sơ.
4. Kiểm tra cuộn ngang, nút và nội dung bị che.

**HTTP mong đợi:** N/A (UI).
**Kết quả mong đợi:** document.documentElement.scrollWidth <= innerWidth; đọc được nội dung; điều khiển dùng được; dialog đóng được; không có pageerror mới.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-213 — Bố cục ADMIN 1440x1060

- Truy vết: UI; ID cũ: BB-064; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: README: responsive desktop/mobile.
- Căn cứ SRS/phạm vi: Ca UI bổ sung; SRS chưa chốt viewport 1440/390 hoặc tiêu chí responsive chi tiết.
- Vị trí code đối chiếu tĩnh: src/main.jsx:167 App, :648 Pagination, :676 Catalog; src/style.css
- Tiền điều kiện: BASE; Browser Chromium; ADMIN có tài khoản hợp lệ; B1 tồn tại.
- Dữ liệu: Viewport 1440x1060.

1. Đăng nhập đúng vai trò.
2. Mở danh sách, tìm B1, mở chi tiết.
3. Mở menu quản trị, màn hình quản lý sách.
4. Kiểm tra cuộn ngang, nút và nội dung bị che.

**HTTP mong đợi:** N/A (UI).
**Kết quả mong đợi:** document.documentElement.scrollWidth <= innerWidth; đọc được nội dung; điều khiển dùng được; dialog đóng được; không có pageerror mới.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-214 — Bố cục USER 390x844

- Truy vết: UI; ID cũ: BB-064; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: README: responsive desktop/mobile.
- Căn cứ SRS/phạm vi: Ca UI bổ sung; SRS chưa chốt viewport 1440/390 hoặc tiêu chí responsive chi tiết.
- Vị trí code đối chiếu tĩnh: src/main.jsx:167 App, :648 Pagination, :676 Catalog; src/style.css
- Tiền điều kiện: BASE; Browser Chromium; USER có tài khoản hợp lệ; B1 tồn tại.
- Dữ liệu: Viewport 390x844.

1. Đăng nhập đúng vai trò.
2. Mở danh sách, tìm B1, mở chi tiết.
3. Mở Sách của tôi và Hồ sơ.
4. Kiểm tra cuộn ngang, nút và nội dung bị che.

**HTTP mong đợi:** N/A (UI).
**Kết quả mong đợi:** document.documentElement.scrollWidth <= innerWidth; đọc được nội dung; điều khiển dùng được; dialog đóng được; không có pageerror mới.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-215 — Bố cục ADMIN 390x844

- Truy vết: UI; ID cũ: BB-064; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: README: responsive desktop/mobile.
- Căn cứ SRS/phạm vi: Ca UI bổ sung; SRS chưa chốt viewport 1440/390 hoặc tiêu chí responsive chi tiết.
- Vị trí code đối chiếu tĩnh: src/main.jsx:167 App, :648 Pagination, :676 Catalog; src/style.css
- Tiền điều kiện: BASE; Browser Chromium; ADMIN có tài khoản hợp lệ; B1 tồn tại.
- Dữ liệu: Viewport 390x844.

1. Đăng nhập đúng vai trò.
2. Mở danh sách, tìm B1, mở chi tiết.
3. Mở menu quản trị, màn hình quản lý sách.
4. Kiểm tra cuộn ngang, nút và nội dung bị che.

**HTTP mong đợi:** N/A (UI).
**Kết quả mong đợi:** document.documentElement.scrollWidth <= innerWidth; đọc được nội dung; điều khiển dùng được; dialog đóng được; không có pageerror mới.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-216 — Phản hồi form thiếu dữ liệu

- Truy vết: UI; ID cũ: BB-064; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: OpenAPI: Register.required; UI đăng ký.
- Căn cứ SRS/phạm vi: Ca UI bổ sung; SRS chưa chốt viewport 1440/390 hoặc tiêu chí responsive chi tiết.
- Vị trí code đối chiếu tĩnh: src/main.jsx:167 App, :648 Pagination, :676 Catalog; src/style.css
- Tiền điều kiện: BASE; GUEST; Chromium desktop.
- Dữ liệu: Form đăng ký để trống username, các trường còn lại hợp lệ.

1. Mở Đăng ký.
2. Điền các trường còn lại.
3. Bấm Đăng ký.

**HTTP mong đợi:** N/A (UI).
**Kết quả mong đợi:** Không tạo tài khoản; validation chỉ ra trường bắt buộc (native browser hoặc thông báo ứng dụng); vẫn ở form, không hiện lỗi kỹ thuật.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-217 — Guest bị chặn /me

- Truy vết: FR-06; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-06/07; BR-03; HTTP conventions.
- Căn cứ SRS/phạm vi: SRS FR-06; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:129 (auth), :250 (/me); src/main.jsx:1709 Profile
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: GET /me.

1. GET không kèm cookie.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không trả hồ sơ/lịch sử.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-218 — Guest bị chặn /me/borrow-requests

- Truy vết: FR-07; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-06/07; BR-03; HTTP conventions.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: GET /me/borrow-requests.

1. GET không kèm cookie.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không trả hồ sơ/lịch sử.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-219 — Guest không tạo được yêu cầu

- Truy vết: FR-05; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-05; BR-11.
- Căn cứ SRS/phạm vi: SRS FR-05; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:300 (dates), :308 (create); src/main.jsx:1018 BorrowForm
- Tiền điều kiện: BASE; GUEST; B1 tồn tại.
- Dữ liệu: BORROW.

1. POST /borrow-requests không cookie.
2. A1 kiểm tra danh sách requests.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không tạo yêu cầu, tồn không đổi.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-220 — Session không hợp lệ

- Truy vết: FR-06; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-06; NFR-SEC-04.
- Căn cứ SRS/phạm vi: SRS FR-06; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:129 (auth), :250 (/me); src/main.jsx:1709 Profile
- Tiền điều kiện: BASE; Cookie library_session=invalidtoken; không phải cookie thật.
- Dữ liệu: GET /me.

1. GET /me kèm cookie giả.

**HTTP mong đợi:** 401.
**Kết quả mong đợi:** UNAUTHENTICATED; không lộ hồ sơ.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-221 — Đăng nhập API bằng email

- Truy vết: FR-02; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-02: username/email + password.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; U1 có email=bb{RUN}@example.com đã cấu hình.
- Dữ liệu: LOGIN username=email U1, password=P.

1. POST /auth/login bằng jar mới.
2. GET /me.

**HTTP mong đợi:** 200; GET: 200.
**Kết quả mong đợi:** data.user.id=U1; /me đúng U1; có phiên hợp lệ.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-222 — Đăng nhập UI bằng email dài hơn 64

- Truy vết: FR-02; ID cũ: SRS-review; ưu tiên: P0; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-02; dictionary email VARCHAR(254); OpenAPI Login.username max254.
- Căn cứ SRS/phạm vi: SRS FR-02; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:168 (rate limit), :200 (login); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; A1 tạo U1 có email=repeat(a,60)+@ui{RUN}.example.com; tổng 83 ký tự; browser Chromium; bắt đầu GUEST.
- Dữ liệu: Email 83 ký tự hợp lệ; password=P của U1.

1. Xác nhận API LOGIN với email này trả 200 rồi logout.
2. Mở form đăng nhập bằng browser.
3. Nhập đầy đủ email bằng thao tác bàn phím; nhập password.
4. Bấm Đăng nhập; quan sát giá trị ô, HTTP và màn hình.

**HTTP mong đợi:** API: 200; UI LOGIN: 200; /me: 200.
**Kết quả mong đợi:** Ô đăng nhập giữ đủ 83 ký tự; đăng nhập thành công, vào Khám phá sách; /me đúng U1. Không sửa kỳ vọng thành 401 theo lỗi hiện tại.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-223 — POST role không hợp lệ

- Truy vết: FR-12; ID cũ: SRS-review; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-12 ngoại lệ role invalid; role USER/ADMIN.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 là USER còn tồn tại.
- Dữ liệu: REG mới role=INVALID.

1. POST /admin/users.
2. Đọc lại danh sách/đối tượng.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo mới; không đổi role/thuộc tính U2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-224 — PUT role không hợp lệ

- Truy vết: FR-12; ID cũ: SRS-review; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-12 ngoại lệ role invalid; role USER/ADMIN.
- Căn cứ SRS/phạm vi: SRS FR-12; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:539 list, :554 create, :568 update, :605 delete; src/main.jsx:1497 UserList, :1606 UserForm
- Tiền điều kiện: BASE; A1; U2 là USER còn tồn tại.
- Dữ liệu: USERPUT U2 role=INVALID.

1. PUT /admin/users/{U2}.
2. Đọc lại danh sách/đối tượng.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không tạo mới; không đổi role/thuộc tính U2.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-225 — JSON không hợp lệ

- Truy vết: FR-01; ID cũ: SRS-review; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS HTTP conventions; NFR-MNT-02; NFR-SEC-04/05.
- Căn cứ SRS/phạm vi: SRS FR-01; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:37 (schemas), :186 (register); src/main.jsx:507 AuthForm
- Tiền điều kiện: BASE; GUEST.
- Dữ liệu: Content-Type application/json; raw body={"username":.

1. POST /auth/register với raw body đúng như trên, không dùng JSON serializer tự sửa.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** error.code=INVALID_JSON; success=false; không lộ stack/SQL.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.

### BB2-226 — Phân trang lịch sử sai

- Truy vết: FR-07; ID cũ: SRS-review; ưu tiên: P1; kỹ thuật: Phân vùng tương đương.
- Nguồn kỳ vọng: SRS FR-07 ngoại lệ pagination invalid; OpenAPI page minimum1.
- Căn cứ SRS/phạm vi: SRS FR-07; chi tiết mã lỗi/trường JSON theo OpenAPI. Đối chiếu tĩnh, không đồng nghĩa TC đã chạy.
- Vị trí code đối chiếu tĩnh: server/app.js:348 listRequests, :396 (own); src/main.jsx:1191 Requests
- Tiền điều kiện: BASE; U1.
- Dữ liệu: GET /me/borrow-requests?page=0.

1. Gửi GET bằng U1.

**HTTP mong đợi:** 400.
**Kết quả mong đợi:** VALIDATION_ERROR; không trả danh sách thành công.
**Hậu điều kiện/dọn dữ liệu:** Đọc lại đối tượng bằng API nếu có thay đổi. Giữ bằng chứng; dọn theo CLEANUP trong Hướng dẫn.
**Trạng thái:** Chưa chạy.
