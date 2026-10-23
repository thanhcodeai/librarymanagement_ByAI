# Đối chiếu SRS gốc — test case — web đã code

Ngày kiểm tra: 23/10/2026 (Asia/Saigon). Mã ứng dụng được kiểm tra tại commit `acdb8a9bad97971ad2e76686b396c72242ad9612`; thay đổi sau đó chỉ thuộc tài liệu/kiểm tra bổ trợ, không sửa ứng dụng.

## Kết luận

Các chức năng cốt lõi FR-01…FR-12 và quy tắc trạng thái/tồn kho có đối ứng trong code và bộ test. **Không đủ cơ sở kết luận toàn bộ web/bộ TC đã đạt toàn bộ SRS.** SRS gốc là baseline còn nhiều TBD; bộ TC có cả kiểm tra yêu cầu SRS, hợp đồng OpenAPI hiện tại và chính sách bổ sung trong `decisions.md`. Việc có tên FR trong truy vết không đồng nghĩa mọi ngoại lệ/NFR đã được kiểm thử.

Đã xác nhận một lỗi UI đăng nhập email dài và một bất nhất giữa nhãn sắp xếp với hành vi. Chưa sửa mã ứng dụng trong công việc đối chiếu này.

## Nguồn và thứ tự đối chiếu

1. File do người dùng gửi: **Đặc tả yêu cầu phần mềm website quản lý thư viện — SRS.docx**, phiên bản **1.0**, ngày lập **16/10/2026**.
   SHA-256: `a440fa65c73192e27e82b27dee6a8bbef78505d31ae98023388250db3356e703`.
2. [Quyết định triển khai](../decisions.md), [OpenAPI](../openapi.json), [truy vết hiện có](../traceability.md).
3. [Backend](../../server/app.js), [frontend](../../src/main.jsx), [DDL](../../db/001_initial.sql).
4. Kết quả chạy thực tế trên database test riêng, bên dưới.

File SRS đính kèm chỉ được đọc để đối chiếu; không tự sao chép bản gốc lên GitHub. SRS có câu “mọi chi tiết chưa được người dùng xác nhận… được đánh dấu TBD / Không xác định, không tự biến thành yêu cầu bắt buộc”. Các dòng `decisions.md` ghi lựa chọn/xác nhận trước đây là một nguồn bổ sung, **không chứng minh rằng bản SRS tải lên đã cập nhật/phê duyệt hết các thay đổi này**.

## Đối chiếu chức năng

Đối chiếu tĩnh áp dụng cho toàn bộ các nhóm dưới đây; cột kết quả chạy chỉ mô tả phần đã thực sự chạy.

| FR | Yêu cầu trong SRS | Code / UI | Đối chiếu TC và bằng chứng / giới hạn |
| --- | --- | --- | --- |
| FR-01 | Đăng ký, required fields, username unique, role USER, không trả hash | `registerSchema`, POST register; `AuthForm` | TC đăng ký có đủ luồng chính/thiếu/trùng/chèn role. 33 kiểm tra bổ trợ đăng ký đạt các assertions đã nêu; email/min-max password vẫn cần căn cứ chính sách ngoài SRS. |
| FR-02 | Đăng nhập bằng username/email + password; xác định role | POST login nhận username tối đa254, truy vấn username OR email; UI input tối đa64 | User/Admin login có trong tests/browser. **Lỗi BUG-01 email dài** xác nhận. Thêm TC email API và UI; session/cookie là lựa chọn auth bổ sung, không bắt buộc phải có JWT vì ví dụ JWT trong SRS chỉ minh họa. |
| FR-03 | Search/filter/sort/pagination; rỗng trả200 items=[] | `listBooks`, `Catalog`, `Pagination` | Có TC kết quả/rỗng/filter/sort title/available/phân trang. Sort newest chưa có chuẩn chiều/thời điểm trong SRS; xem UX-02. Default12/max100, tiếng Việt không dấu là quyết định bổ sung. |
| FR-04 | Detail, invalid ID, not found | GET books/:id; `BookDetail` | Có TC200/400/404; existing API/browser kiểm tra detail. Miền ID INT nhỏ hơn BIGINT trong dictionary SRS là điểm thiết kế cần chốt. |
| FR-05 | Owner từ auth, book/date hợp lệ, tạoPENDING, chưa giảm tồn, không nhận userId/status/reviewedBy | `reader`, schema strict, transaction create; `BorrowForm` | Có TC hợp lệ/biên ngày/spoof/nonexistent; existing tests kiểm tra owner/ngày. 8 phép thử ngày không hợp lệ bổ trợ trả400, không có request mới/tồn không đổi. Admin403 và duplicate409 theo quyết định ngoài SRS vì SRS để TBD. |
| FR-06 | Own profile, invalid/no auth, không password_hash | GET /me sau auth; `Profile` | TC U1/U2 giữ riêng, đã bổ sung Guest401 và fake session401 theo RTM gốc. Tests có sẵn kiểm tra profile/auth; không suy ra hết các TC đã chạy. |
| FR-07 | Own history, status/pagination, không đọc user khác | `listRequests(own=true)`; `Requests` | TC own/filter/empty và bổ sung pagination invalid/noauth. SRS có mâu thuẫn quyền Admin/history giữa catalog và authorization matrix; code cho Admin gọi own history, cần chốt Q-07. |
| FR-08 | Logout và credential behavior tùy cơ chế auth | DELETE session và clearCookie; logout UI | TC kiểm tra replay cookie cũ. Existing API/browser logout đạt; thu hồi tức thì là lựa chọn session, không phải mọi kiến trúc JWT đều mặc định làm được. |
| FR-09 | Admin stats, User403/invalid401, tổng nhất quán | GET admin/stats; `Dashboard` | TC quyền theo operation và delta tạo sách/tạo request/duyệt. Existing test kiểm tra stats/audit. Các delta mới chưa chạy toàn bộ trong lượt này. |
| FR-10 | Admin CRUD, unique code, số lượng >=0, available<=total, xóa có FK | CRUD books; `BookForm`/delete dialog | TC có create/duplicate/biên/sửa/xóa; thêm total=onLoan và chống ghi đè available. Existing tests/browser CRUD và inventory đạt. Quyền nhập available khi create/update vẫn TBD trong SRS, chi tiết theo decisions.md. |
| FR-11 | PENDING→APPROVED/DENIED, terminal409, hết tồn giữPENDING, transaction/concurrency | lock request/book; update/audit trong transaction; `DecisionForm` | TC chứa cả DENY khi available0, terminal combinations, concurrent cases. Existing tests xác nhận concurrently exactly-once và forced rollback. Chưa thực hiện thủ công toàn bộ TC mới. |
| FR-12 | Admin CRUD users, duplicate, not found, role invalid, FK | CRUD users; `UserForm`/delete dialog | TC có CRUD/duplicate/password/role/delete; bổ sung roleINVALID cho POST/PUT. Existing tests kiểm tra userCRUD/FK/self-protection. Tự xóa/hạ quyền ADMIN là quyết định bổ sung vì SRS còn TBD. |

## Quy tắc nghiệp vụ và NFR

| Yêu cầu SRS | Bằng chứng / trạng thái |
| --- | --- |
| BR-01…03 | Unique, role mặc định, ownership có trong code và existing tests; TC có đối ứng. |
| BR-04, BR-14 / NFR-SEC-03 | Middleware auth/admin áp dụng ở backend; TC quyền chia riêng từng operation; existing tests có User403. Không dùng việc ẩn nút làm bằng chứng phân quyền. |
| BR-05…10, BR-13 | Date order, PENDING, terminal state, decrement1, deny giữ tồn và invariant được code thể hiện; existing tests exercised; bộ TC mới có đối ứng. |
| BR-11 | Code yêu cầu auth và sách tồn tại, FK; TC unknown book/Guest/fake session. Chưa chạy riêng mọi biến thể xóa account rồi replay request trong bộ mới. |
| BR-12 / NFR-DATA-01 | Existing test giả lập lỗi driver ghi audit để kiểm tra rollback trên MySQL thật đạt. Đây là integration/fault-injection, **không gọi là kiểm thử hộp đen thuần túy**, không nhét thành TC hộp đen chỉ để có coverage. |
| BR-15 | SRS mặc định RESTRICT khi có history; TC delete FK book/user và existing tests có kiểm tra. Hard/soft-delete tổng thể vẫn cần quyết định. |
| BR-16…18 | SRS để TBD giới hạn số cuốn/số ngày và duplicate pending. Không tự áp ngưỡng mượn; duplicate chặn theo decisions.md. |
| NFR-SEC-01 | HTTPS production **chưa được nghiệm thu**; localhost HTTP ở môi trường dev không chứng minh fail/đạt cấu hình production. |
| NFR-SEC-02 / NFR-DATA-02 | Hash bằng scrypt/salt và FK/CHECK thấy trong code/DDL; đây là static/integration evidence, không thể chỉ dựa vào black-box JSON để kết luận cách lưu mật khẩu. |
| NFR-SEC-04/05 / NFR-MNT-01/02 | Auth/validation/error envelope và /api/v1 có đối ứng; tests kiểm tra một số input/error. Đã bổ sung TC malformed JSON; chưa có exhaustive security validation hoặc penetration test. |
| NFR-SEC-06…08 | Cơ chế auth, chính sách password và timeout vẫn TBD trong SRS; session, 8–128 và 8 giờ đến từ lựa chọn repo, không gắn nhãn “SRS bắt buộc”. |
| NFR-LOG-01…03 | Có hàm audit và gọi ở các mutation/login; existing tests kiểm tra audit trong một số luồng. Chưa chứng minh đầy đủ mọi audit event/không rò secret/log retention bằng black-box suite; cần evidence vận hành được phép xem. |
| PERF/SCALE/SLA/BACKUP/RPO/RTO | Ngưỡng vẫn TBD; không tự đặt SLA hoặc coi TC chức năng là nghiệm thu các NFR này. |

## Phát hiện cần xử lý

### BUG-01 — Web không đăng nhập được bằng email hợp lệ dài hơn64 ký tự

- **Nguồn yêu cầu:** SRS FR-02 ghi “username/email + password”; dictionary email VARCHAR254; OpenAPI Login.username max254.
- **Tái hiện:** tạo tài khoản test có email hợp lệ83 ký tự; API login email/password trả200. Đăng xuất; gõ cùng email vào form đăng nhập bằng Chromium; nhập password đúng; bấm Đăng nhập.
- **Thực tế:** ô chỉ giữ64 ký tự vì [maxlength64](../../src/main.jsx#L546); request login trả401. API dùng [str254 và username OR email](../../server/app.js#L200).
- **Mong đợi:** nhập đầy đủ email được hỗ trợ và login200 đúng người dùng.
- **TC:** BB2-222. Ưu tiên P0 trong bộ TC; mức lỗi chức năng medium, có đường vòng đăng nhập bằng username.
- **Trạng thái:** đã xác nhận qua browser và API; chưa sửa code. [Bằng chứng](evidence/ui-review.json). Script tái hiện kiểm tra hành vi lỗi hiện tại; exit0 của script là tái hiện thành công, **không phải** web đạt TC này.

### UX-02 — “Mới cập nhật” không phản ánh lần sửa sách

- UI có nhãn [Mới cập nhật](../../src/main.jsx#L851), nhưng API dùng [id DESC](../../server/app.js#L277).
- Tạo B1 rồi B2 cùng thể loại, sửa B1 gần nhất, query newest: thứ tự vẫn B2,B1. Đã quan sát bằng API; đã đọc nhãn trên browser.
- SRS chỉ nêu sort, không chốt tạo mới hay cập nhật. Vì vậy đây là **bất nhất UI/hành vi cần quyết định**, chưa gán là vi phạm yêu cầu sắp xếp cụ thể của SRS. Chốt Q-01 rồi mới sửa nhãn hoặc logic; không đổi TC để hợp thức hóa một cách hiểu tùy ý.

### SPEC-03 — SRS và quyết định bổ sung chưa đồng bộ

Password min/max, session expiry, email optional, Guest, duplicatePENDING, Adminborrow, nhập tồn, self-protection vẫn TBD trong SRS; `decisions.md` đã chọn một số chính sách. Bản TC mới thêm cột **Căn cứ SRS / phạm vi** để tránh lẫn SRS với contract hiện tại. Cần cập nhật baseline hoặc có phê duyệt quyết định bổ sung trước nghiệm thu chính thức.

### SPEC-04 — Contract có khác biệt kỹ thuật cần ghi nhận

- SRS dictionary dùng BIGINT UNSIGNED; DDL thực tế INT UNSIGNED và path validator max2147483647. Chưa gây lỗi với fixture hiện tại; chưa được chứng minh là miền ID đã được phê duyệt.
- Code có totalQuantity max1.000.000, description max10.000; SRS không ấn định các giới hạn này, OpenAPI chưa mô tả hết. Không tự gọi đây là giới hạn nghiệp vụ SRS.
- Quyền Admin đọc own history mâu thuẫn ngay trong SRS: catalog “User”, matrix cho Admin✓; code hiện cho phép. Cần chốt thay vì kết luận bug từ một bảng đơn lẻ.

## Đã sửa trong tài liệu test

- BB2-084…091: sửa hậu kiểm từ tìm username/bookCode sang **GET lịch sử U1 và GET sách B1**, kiểm tra không sinh request/không đổi tồn.
- Giữ nguyên216 ID đã gửi; bổ sung10 ca BB2-217…226 cho các ngoại lệ/luồng trong SRS: Guest profile/history/borrow, fake session, login email API/UI, invalid role create/update, malformedJSON, invalid history pagination.
- Tổng hiện tại **226 TC**. Mỗi ca có thêm căn cứ SRS/phạm vi và vị trí code đối chiếu tĩnh; Excel thêm sheet **Kiểm chứng**.
- Tất cả trạng thái trong sheet TC để “Chưa chạy” như mẫu kế hoạch; kết quả review được lưu riêng. Đây không phải báo cáo226 ca đã thực thi, và không được hiểu tất cả case đã Pass (BUG-01 đã có sai khác xác nhận).

## Lượt kiểm tra thực tế

| Kiểm tra | Kết quả | Giới hạn |
| --- | --- | --- |
| `npm run build` | PASS; có warning chunk-size | Không chứng minh toàn bộ chức năng chạy đúng. |
| `bash scripts/test-db.sh` | **19/19 tests PASS**, 0fail/skip | Bộ test có sẵn, dùng `library_management_test`; không phải226 TC mới. Dòng log Error trong forced-audit-failure là tình huống lỗi có chủ đích, test rollback vẫn Pass. |
| `DB_NAME=library_blackbox_review_test TEST_BASE_URL=http://127.0.0.1:3001 node tests/browser.mjs` | PASS reader borrow, admin approve, create/delete book, users/profile/mobile; không pageerror | Database test riêng có seed; không phủ mọi screen/edge case. |
| `DB_NAME=library_blackbox_review_test node docs/blackbox/check-api-alignment.mjs` | **43/43 assertions đạt**: 33 đăng ký, 8 invaliddate, 2 phép quan sát API | Bằng chứng bổ trợ theo từng ID ở [api-review.json](evidence/api-review.json). Assertions chỉ phủ phần được script kiểm tra; hai quan sát không phải TC web Pass. |
| `DB_NAME=library_blackbox_review_test node docs/blackbox/check-ui-alignment.mjs` | Tái hiện BUG-01; đọc nhãn UX-02 | [ui-review.json](evidence/ui-review.json); không phải passing acceptance test của email login. |
| Kiểm tra workbook | Đọc lại XLSX/CSV, ID duy nhất, mapping FR và code, dữ liệu hai bản Excel khớp | Chỉ kiểm tra cấu trúc/tài liệu. |

Các script bổ trợ cần Node24/dependencies đã cài, database riêng tên kết thúc `_test`, migration/seed và credential seed được giữ cục bộ trong `.env`. UI script cần server trỏ đúng DB test và Chromium; `DB_NAME` phía client là guard, không tự kiểm chứng database phía server. Không chạy trên server production. Script giữ/cập nhật bằng chứng không chứa mật khẩu/cookie và dọn fixture không có lịch sử do nó tạo.

**Chưa chạy trong lượt này:** toàn bộ226 TC thủ công, rate-limit100/15 phút, timeout8 giờ, productionHTTPS, load/backup/restore và nghiệm thu các TBD.
