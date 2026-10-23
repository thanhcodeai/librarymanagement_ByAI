# Bộ test case kiểm thử hộp đen — Lá Thư Viện

## Phạm vi và nguồn đối chiếu

Thiết kế từ hợp đồng bên ngoài: [README](../../README.md), [OpenAPI](../openapi.json), [quyết định nghiệp vụ](../decisions.md) và [truy vết FR](../traceability.md). Chưa có bản SRS gốc trong checkout, vì vậy cần đối chiếu lại khi có bản SRS được phê duyệt. Không dùng nhánh mã, cấu trúc DB hoặc độ bao phủ dòng làm tiêu chí đạt. Quan sát qua UI và API công khai.

Đây là bộ **thiết kế, chưa thực thi**. Các kết quả kiểm thử cũ không được tính là kết quả của bộ này. [CSV](test-cases.csv) có các cột ghi trạng thái, thực tế, lỗi và bằng chứng để mở bằng Excel. P0: phân quyền, mất dữ liệu, sai tồn/trạng thái; P1: chức năng và validation.

## Chuẩn bị và quy ước

- Dùng môi trường test riêng, không dùng dữ liệu vận hành. Chuẩn bị tài khoản qua đăng ký/API quản trị, không sửa trực tiếp DB. Lấy thông tin đăng nhập thử từ nguồn cục bộ an toàn, không đưa mật khẩu thật vào báo cáo.
- Đặt base URL theo môi trường; tất cả đường dẫn API trong bảng có tiền tố `/api/v1`. Dùng Postman hoặc HTTP client có cookie jar; mỗi USER/ADMIN một jar riêng. Với ca UI, thực hiện thao tác tương ứng trên màn hình.
- `<run>` là mã lượt chạy duy nhất. U1/U2: hai độc giả; A1: quản trị viên thử. B1/B2: sách tạo riêng với mã `bb_<run>_*`. R1/R2: ID lấy từ phản hồi tạo yêu cầu, không đoán ID.
- D là ngày hợp lệ, mặc định ngày thực hiện cộng 1 ngày, D+1 là ngày kế tiếp theo lịch. Ngày cố định chỉ dùng cho ca lịch nhuận; hiện chưa có quy định bắt buộc ngày mượn không nằm trong quá khứ hoặc giới hạn số ngày mượn.
- Các biến thể trong một dòng là các lượt độc lập: chỉ thay trường được nêu, giữ các trường khác hợp lệ; tạo username/mã sách mới cho mỗi lượt tạo thành công. Ghi kết quả riêng từng biến thể, chỉ đánh dấu dòng Pass khi mọi biến thể đạt.
- Tạo tiền điều kiện qua API: duyệt yêu cầu để tạo sách đang mượn; chuẩn bị yêu cầu PENDING rồi cho USER khác mượn cuốn cuối để tạo tình huống hết tồn. Ghi nhận trước/sau bằng GET sách và lịch sử.
- Ca đồng thời cần công cụ gửi song song có điểm bắt đầu chung, không bấm tuần tự. Ghi cả hai phản hồi và trạng thái sau cùng.
- Kiểm tra lỗi API: mã HTTP đúng, `success=false`, thông báo có nghĩa, không lộ mật khẩu/hash/token/SQL/stack. Với yêu cầu lỗi, xác minh không có thay đổi nghiệp vụ ngoài ý muốn bằng API đọc.
- Dọn đúng dữ liệu thử khi không còn ràng buộc. Ca có lịch sử không xóa được theo nghiệp vụ: giữ trong môi trường test hoặc dùng cơ chế reset môi trường test đã được cho phép; không xóa volume chứa dữ liệu cần giữ.

## Kỹ thuật thiết kế

Phân vùng tương đương cho dữ liệu đúng/sai, vai trò và đối tượng tồn tại/không tồn tại. Giá trị biên cho độ dài, phân trang, số lượng và ngày. Bảng quyết định cho quyền và tồn kho. Chuyển trạng thái theo `tạo → PENDING → APPROVED hoặc DENIED`; trạng thái cuối không được xử lý lần nữa. Với tồn kho bằng 0, APPROVE thất bại và vẫn PENDING, DENY vẫn được phép.

## Test case


| ID | FR | Tình huống | Ưu tiên / Kỹ thuật | Tiền điều kiện | Dữ liệu và bước | Kết quả mong đợi |
| --- | --- | --- | --- | --- | --- | --- |
| BB-001 | FR-01 | Đăng ký hợp lệ | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | POST /auth/register với username=bb_<run>_u1, fullName=Nguyễn An, password=Abcd1234; sau đó đăng nhập | 201; tài khoản đăng nhập được và role=USER |
| BB-002 | FR-01 | Thiếu trường bắt buộc | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Lần lượt bỏ username, fullName, password khỏi payload hợp lệ | Mỗi lần 400; không tạo tài khoản |
| BB-003 | FR-01 | Biên độ dài username | P1 / Giá trị biên | Chưa đăng nhập; cookie jar mới | Mỗi lần dùng username mới gồm 0, 1, 64, 65 ký tự ASCII hợp lệ; giữ các trường khác hợp lệ | 0/65: 400; 1/64: 201 |
| BB-004 | FR-01 | Ký tự username | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Đăng ký lần lượt tên chứa dấu cách, ký tự @; đối chứng tên chứa a-Z_0.9- | Tên sai: 400; tên đúng và chưa tồn tại: 201 |
| BB-005 | FR-01 | Biên độ dài mật khẩu | P0 / Giá trị biên | Chưa đăng nhập; cookie jar mới | Đăng ký tài khoản mới cho từng mật khẩu dài 7, 8, 128, 129 ký tự ASCII | 7/129: 400; 8/128: 201 |
| BB-006 | FR-01 | Biên họ tên | P1 / Giá trị biên | Chưa đăng nhập; cookie jar mới | Đăng ký riêng từng họ tên dài 0, 1, 150, 151 ký tự | 0/151: 400; 1/150: 201 |
| BB-007 | FR-01 | Trùng username | P1 / Phân vùng tương đương | Đã có bb_<run>_u1 | Đăng ký lại đúng username đã có | 409; không tạo thêm tài khoản |
| BB-008 | FR-01 | Email tùy chọn và định dạng | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Đăng ký tên mới với email bị bỏ qua, rỗng, null, bb_<run>@example.com, abc@ | Ba biến thể thiếu email và email hợp lệ: 201; abc@: 400 |
| BB-009 | FR-01 | Email trùng | P1 / Phân vùng tương đương | Đã có tài khoản dùng bb_<run>@example.com | Đăng ký username khác, cùng email | 409; không tạo tài khoản thứ hai |
| BB-010 | FR-01 | Chèn quyền khi đăng ký | P0 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Thêm role=ADMIN vào payload đăng ký hợp lệ | 400; không tạo ADMIN |
| BB-011 | FR-02 | Đăng nhập đúng vai trò | P0 / Bảng quyết định | Có U1 và A1 với mật khẩu thử đã biết | Đăng nhập lần lượt bằng hai cookie jar riêng; GET /me | 200; /me trả đúng tài khoản và role; cookie HttpOnly, SameSite=Strict |
| BB-012 | FR-02 | Sai mật khẩu hoặc tên không tồn tại | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Đăng nhập U1 với mật khẩu sai; đăng nhập tên chưa tồn tại | Cả hai 401; không tạo phiên đăng nhập |
| BB-013 | FR-02 | Đăng nhập rỗng | P1 / Phân vùng tương đương | Chưa đăng nhập; cookie jar mới | Gửi username hoặc password rỗng; lần lượt bỏ từng trường | 400; không đăng nhập |
| BB-014 | FR-02 | Giới hạn auth | P1 / Giá trị biên | Môi trường test riêng; bộ đếm IP sạch | Gửi 101 yêu cầu đăng nhập sai trong 15 phút từ cùng IP | 100 yêu cầu đầu 401; yêu cầu 101 trả 429; không lộ thông tin nhạy cảm |
| BB-015 | FR-03 | Chặn Guest đọc sách | P0 / Bảng quyết định | Chưa đăng nhập; cookie jar mới | GET /books và GET /books/{B1} | 401; không trả dữ liệu sách |
| BB-016 | FR-03 | Tìm theo tên/tác giả/mã | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | GET /books?q= lần lượt với chuỗi con duy nhất của tên, tác giả, mã B1 | 200; có B1; mọi kết quả phù hợp tiêu chí |
| BB-017 | FR-03 | Tìm không phân biệt hoa và dấu | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Tìm cùng tên tiếng Việt B1 bằng bản gốc, chữ hoa và không dấu | 200; đều tìm thấy B1 theo quy tắc tìm kiếm đã công bố |
| BB-018 | FR-03 | Không có kết quả | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Tìm q=bb_<run>_notfound, bảo đảm không có sách khớp | 200; danh sách rỗng; UI hiện trạng thái không có kết quả |
| BB-019 | FR-03 | Lọc kết hợp tìm kiếm | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Tạo B1/B2 khác thể loại; tìm chuỗi chung và category của B1 | Chỉ có sách thỏa cả chuỗi tìm và thể loại |
| BB-020 | FR-03 | Sắp xếp | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | GET /books với sort=newest, title, available trên bộ sách có giá trị khác nhau | 200; thứ tự đúng lựa chọn hiển thị; không yêu cầu thứ tự giữa các bản ghi bằng nhau |
| BB-021 | FR-03 | Biên phân trang | P1 / Giá trị biên | Đăng nhập USER U1; dữ liệu thử riêng | GET /books với page=0,1; pageSize=0,1,100,101; mỗi lần chỉ đổi một tham số | page=0, pageSize=0/101: 400; các giá trị hợp lệ: 200, số mục không vượt pageSize |
| BB-022 | FR-03 | Độ dài và sort sai | P1 / Giá trị biên | Đăng nhập USER U1; dữ liệu thử riêng | Lần lượt gửi q dài 255/256; category dài 100/101; sort=invalid | 255/100: 200; 256/101 và sort sai: 400 |
| BB-023 | FR-04 | Chi tiết tồn tại và không tồn tại | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | GET /books/{B1}; GET /books/{ID dương xác nhận không tồn tại} | B1: 200, đúng thông tin; ID không tồn tại: 404 |
| BB-024 | FR-04 | ID không hợp lệ | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | GET /books/0, /books/-1, /books/abc | 400; không trả chi tiết sách |
| BB-025 | FR-05 | Gửi yêu cầu hợp lệ | P0 / Chuyển trạng thái | Đăng nhập USER U1; dữ liệu thử riêng; B1 có sẵn; U1 chưa có PENDING với B1 | POST /borrow-requests với bookId=B1, borrowDate=D, dueDate=D+1; đọc lịch sử và sách | 201; yêu cầu thuộc U1, trạng thái PENDING; tồn khả dụng không giảm |
| BB-026 | FR-05 | Biên ngày trả | P0 / Giá trị biên | Đăng nhập USER U1; dữ liệu thử riêng; mỗi lượt dùng sách hoặc USER mới | Gửi lần lượt dueDate=D-1, D, D+1 với borrowDate=D | D-1/D: 400; D+1: 201 |
| BB-027 | FR-05 | Ngày không hợp lệ | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Lần lượt gửi 2027-02-29, 2028-02-30, 31/12/2028, chuỗi rỗng; giữ trường còn lại hợp lệ | 400; không tạo yêu cầu |
| BB-028 | FR-05 | Ngày nhuận hợp lệ | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng; chưa có yêu cầu trùng | Gửi borrowDate=2028-02-29, dueDate=2028-03-01 | 201; đọc lại không đổi ngày theo múi giờ |
| BB-029 | FR-05 | Sách không tồn tại | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Gửi bookId dương đã xác nhận không tồn tại, ngày hợp lệ | 404; không tạo yêu cầu |
| BB-030 | FR-05 | Giả mạo chủ sở hữu/trạng thái | P0 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Lần lượt thêm userId=U2, status=APPROVED, reviewedBy=A1 vào payload hợp lệ | 400; không tạo yêu cầu với trường giả mạo |
| BB-031 | FR-05 | Trùng yêu cầu đang chờ | P0 / Chuyển trạng thái | Đăng nhập USER U1; dữ liệu thử riêng; có PENDING của U1 với B1 | Gửi lại yêu cầu cùng U1/B1 với ngày hợp lệ | 409; vẫn chỉ một yêu cầu PENDING |
| BB-032 | FR-05 | ADMIN không được mượn | P1 / Bảng quyết định | Đăng nhập ADMIN A1; dữ liệu thử riêng | POST /borrow-requests với dữ liệu hợp lệ | 403; không tạo yêu cầu |
| BB-033 | FR-06 | Hồ sơ đúng người | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | GET /me bằng cookie U1 rồi U2 | 200; mỗi phiên chỉ trả hồ sơ chính nó; không có password/passwordHash/token |
| BB-034 | FR-07 | Cách ly lịch sử | P0 / Bảng quyết định | Đăng nhập USER U1; dữ liệu thử riêng; U1/U2 có các yêu cầu riêng | GET /me/borrow-requests bằng U1; thử thêm userId=U2 vào query | Không trả yêu cầu của U2; tham số ngoài hợp đồng không được làm đổi chủ sở hữu |
| BB-035 | FR-07 | Lọc trạng thái | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng; có đủ PENDING/APPROVED/DENIED | GET /me/borrow-requests với từng status và status=INVALID | Các trạng thái hợp lệ: 200 và đúng bộ lọc; INVALID: 400 |
| BB-036 | FR-07 | Lịch sử rỗng | P1 / Phân vùng tương đương | USER mới chưa có yêu cầu | Mở Sách của tôi và GET /me/borrow-requests | 200; danh sách rỗng, UI không lỗi |
| BB-037 | FR-08 | Đăng xuất vô hiệu phiên | P0 / Chuyển trạng thái | Đăng nhập USER U1; dữ liệu thử riêng | Lưu cookie test riêng; POST /auth/logout; dùng lại cookie cũ gọi GET /me | Đăng xuất thành công; cookie cũ trả 401 |
| BB-038 | FR-09 | Phân quyền quản trị | P0 / Bảng quyết định | Có cookie Guest, U1, A1 | GET /admin/stats bằng từng vai trò; U1 thử các API quản trị sách/người dùng/yêu cầu | Guest: 401; U1: 403; A1 xem thống kê 200; không có mutation trái phép |
| BB-039 | FR-09 | Thống kê thay đổi đúng | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng; ghi nhận thống kê trước | Tạo một sách tổng 3; đọc thống kê; tạo và duyệt một yêu cầu qua U1/A1; đọc lại | Các chỉ số tương ứng tăng đúng dữ liệu vừa tạo; tổng số cuốn không đổi khi duyệt; số khả dụng giảm 1 nếu chỉ số đó được cung cấp |
| BB-040 | FR-10 | Thêm sách hợp lệ | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng | POST /admin/books với mã mới, title=T, author=A, totalQuantity=2; không gửi availableQuantity | 201; đọc lại total=2, available=2 |
| BB-041 | FR-10 | Trùng mã sách | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng; đã có mã B1 | POST /admin/books với bookCode của B1 và dữ liệu còn lại hợp lệ | 409; không tạo bản sao |
| BB-042 | FR-10 | Biên chuỗi sách | P1 / Giá trị biên | Đăng nhập ADMIN A1; dữ liệu thử riêng | Tạo sách với bookCode dài 0/1/50/51; title và author lần lượt 0/1/255/256; mỗi lần chỉ đổi một trường | 0 hoặc vượt tối đa: 400; biên hợp lệ: 201 với mã mới |
| BB-043 | FR-10 | Biên số lượng | P1 / Giá trị biên | Đăng nhập ADMIN A1; dữ liệu thử riêng | Tạo lần lượt totalQuantity=-1,0,1,1.5; mã mới mỗi lượt | -1/1.5: 400; 0/1: 201 |
| BB-044 | FR-10 | Quan hệ tồn khả dụng | P1 / Bảng quyết định | Đăng nhập ADMIN A1; dữ liệu thử riêng | Tạo sách totalQuantity=2, availableQuantity lần lượt -1,0,2,3; mã mới mỗi lượt | -1/3: 400; 0/2: 201 |
| BB-045 | FR-10 | Sửa tổng khi đang có sách mượn | P0 / Giá trị biên | Đăng nhập ADMIN A1; dữ liệu thử riêng; B1 total=3, available=1, có 2 yêu cầu APPROVED | PUT B1 với đầy đủ trường bắt buộc và total=4, bỏ available; sau đó thử total=1 | Lần đầu thành công, total=4/available=2; lần sau bị từ chối xung đột, dữ liệu giữ 4/2 |
| BB-046 | FR-10 | Xóa sách và ràng buộc lịch sử | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng; B0 chưa có lịch sử; B1 có lịch sử | DELETE B0 rồi GET B0; DELETE B1 rồi đọc lại | B0: 204 rồi 404; B1: 409 và vẫn tồn tại |
| BB-047 | FR-11 | Duyệt khi còn sách | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; R1 PENDING, sách available=1 | PATCH /admin/borrow-requests/{R1} với decision=APPROVE, note=Đồng ý; đọc lại lịch sử và sách | Thành công; R1 APPROVED, có người/thời điểm xét duyệt và ghi chú; available=0 |
| BB-048 | FR-11 | Từ chối yêu cầu | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; R1 PENDING; ghi nhận tồn trước | PATCH R1 với decision=DENY và note=Từ chối; đọc lại | R1 DENIED; lưu ghi chú; tồn không đổi |
| BB-049 | FR-11 | Duyệt khi hết sách | P0 / Bảng quyết định | Đăng nhập ADMIN A1; dữ liệu thử riêng; R1 PENDING, available=0 | PATCH R1 với decision=APPROVE; đọc lại | 409; R1 vẫn PENDING; tồn bằng 0 |
| BB-050 | FR-11 | Không xử lý lại trạng thái cuối | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; có R2 APPROVED và R3 DENIED | Với mỗi R2/R3, thử APPROVE và DENY; ghi nhận tồn trước/sau | Cả 4 tổ hợp: 409; trạng thái và tồn không đổi |
| BB-051 | FR-11 | Hai lần duyệt đồng thời cùng yêu cầu | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; R1 PENDING, available=2; hai cookie jar ADMIN | Gửi đồng thời hai PATCH APPROVE đến R1; đọc lại | Một thành công, một 409; R1 APPROVED; tồn chỉ giảm 1 |
| BB-052 | FR-11 | Hai yêu cầu tranh cuốn cuối | P0 / Bảng quyết định | Đăng nhập ADMIN A1; dữ liệu thử riêng; U1/U2 có R1/R2 PENDING cùng sách available=1 | Gửi đồng thời APPROVE cho R1 và R2; đọc lại cả hai và sách | Một thành công, một 409; một APPROVED, một PENDING; available=0 |
| BB-053 | FR-11 | Biên ghi chú và quyết định sai | P1 / Giá trị biên | Đăng nhập ADMIN A1; dữ liệu thử riêng; dùng R PENDING mới cho mỗi lượt hợp lệ | Thử note dài 0/500/501; thử decision=INVALID; giữ trường khác hợp lệ | 0/500 được chấp nhận; 501 và decision sai: 400; lượt lỗi không đổi trạng thái |
| BB-054 | FR-05/11 | Gửi lại sau khi đã xử lý | P1 / Chuyển trạng thái | Đăng nhập USER U1; dữ liệu thử riêng; yêu cầu cũ của U1/B1 đã DENIED | Gửi yêu cầu mới cùng U1/B1 với ngày hợp lệ | 201; có yêu cầu mới PENDING; lịch sử cũ được giữ |
| BB-055 | FR-12 | CRUD người dùng | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng | Tạo tài khoản mới qua POST /admin/users; đọc danh sách; PUT sửa fullName với đủ username/fullName; DELETE khi chưa có lịch sử | Tạo 201; sửa đọc lại đúng; xóa 204; không còn trong danh sách |
| BB-056 | FR-12 | Trùng thông tin người dùng | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng; có U1/U2 | Thử tạo username/email trùng U1; thử sửa U2 thành username/email U1; mỗi lượt chỉ gây một xung đột | 409; U1/U2 giữ thông tin cũ |
| BB-057 | FR-12 | Đổi mật khẩu thu hồi phiên | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; U1 có phiên đang hoạt động | PUT U1 với username/fullName hiện tại, password mới hợp lệ; dùng cookie cũ gọi /me; đăng nhập bằng mật khẩu cũ/mới | Phiên cũ 401; mật khẩu cũ 401; mật khẩu mới đăng nhập được |
| BB-058 | FR-12 | Đổi quyền thu hồi phiên | P0 / Chuyển trạng thái | Đăng nhập ADMIN A1; dữ liệu thử riêng; U2 đang đăng nhập USER, không phải A1 | PUT U2 với đủ username/fullName, role=ADMIN; thử cookie cũ; đăng nhập lại U2 | Cookie cũ 401; phiên mới có quyền ADMIN |
| BB-059 | FR-12 | Ngăn tự xóa/tự hạ quyền | P0 / Bảng quyết định | Đăng nhập ADMIN A1; dữ liệu thử riêng | DELETE chính A1; PUT chính A1 với đủ trường và role=USER | Bị từ chối xung đột; A1 vẫn tồn tại và giữ ADMIN |
| BB-060 | FR-12 | Không xóa người có lịch sử | P1 / Phân vùng tương đương | Đăng nhập ADMIN A1; dữ liệu thử riêng; U1 có lịch sử mượn | DELETE /admin/users/{U1}; đọc danh sách và lịch sử | 409; tài khoản và lịch sử vẫn tồn tại |
| BB-061 | BR/Auth | Phiên hết hạn | P1 / Giá trị biên | Phiên test có thời điểm đăng nhập ghi nhận; cấu hình SESSION_HOURS=8 | Không đăng nhập lại; gọi /me ngay trước và ngay sau mốc 8 giờ; không chỉnh DB để giả lập | Trước hạn còn dùng được; sau hạn 401; ghi rõ sai số thời gian đo |
| BB-062 | BR/Security | Origin khác nguồn | P0 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Gửi POST /borrow-requests hợp lệ kèm cookie U1 và Origin=https://other.example | 403; không tạo yêu cầu |
| BB-063 | BR/Security | Chuỗi SQL và HTML | P1 / Phân vùng tương đương | Đăng nhập USER U1; dữ liệu thử riêng | Tìm q bằng chuỗi SQL-like; ADMIN tạo sách thử có title=<script>alert(1)</script>; USER mở danh sách/chi tiết | Tìm kiếm chỉ xử lý như dữ liệu, không trả lỗi SQL; tiêu đề được hiển thị như văn bản, không thực thi script |
| BB-064 | UI | Responsive và phản hồi lỗi | P1 / Phân vùng tương đương | Trình duyệt desktop 1440x1060 và mobile 390x844 | Đăng nhập; tìm sách; mở chi tiết; mở menu quản trị; gửi form thiếu dữ liệu | Không tràn ngang; nút/form dùng được; lỗi dễ hiểu; không lộ stack trace; không mất phiên ngoài dự kiến |

## Thực hiện và đánh giá

Chạy P0 trước, sau đó P1; nhóm xác thực → tra cứu → tạo yêu cầu → xét duyệt → quản trị. Chạy rate limit cuối hoặc trên instance test riêng để không làm nhiễu ca đăng nhập. Ca hết hạn 8 giờ cần một lượt theo dõi riêng, không coi là đã đạt nếu chưa đợi đủ thời gian.

Pass: toàn bộ quan sát khớp kết quả mong đợi. Fail: có sai khác tái hiện được. Blocked: thiếu tiền điều kiện/công cụ. Not run: chưa thực hiện. Lưu phiên bản ứng dụng, cấu hình liên quan không chứa secret, trình duyệt, ngày giờ, dữ liệu thử, phản hồi HTTP hoặc ảnh chụp, mã lỗi. Không ghi Pass chỉ vì HTTP 200 nếu dữ liệu/trạng thái sai.

## Giới hạn và điểm cần làm rõ

Không bao gồm trả sách, gia hạn, phạt, thanh toán vì ngoài phạm vi hiện tại. Chưa đặt ngưỡng hiệu năng, SLA hoặc RPO/RTO nên không tự tạo tiêu chí nghiệm thu cho chúng. Bảo vệ ADMIN cuối cùng cần xác nhận quy tắc giữa nhiều ADMIN và cách tạo tiền điều kiện qua giao diện công khai; không giả lập bằng sửa DB. Không kiểm tra audit/rollback bằng chèn lỗi nội bộ trong bộ hộp đen này; nếu cần nghiệm thu phải có cơ chế gây lỗi qua môi trường được hỗ trợ và đầu ra quan sát được. Hướng sắp xếp cụ thể và quy tắc thứ tự khi bằng nhau cần đối chiếu nhãn UI/SRS; không suy ra chỉ từ tên enum.

## Truy vết


- FR-01: BB-001, BB-002, BB-003, BB-004, BB-005, BB-006, BB-007, BB-008, BB-009, BB-010
- FR-02: BB-011, BB-012, BB-013, BB-014
- FR-03: BB-015, BB-016, BB-017, BB-018, BB-019, BB-020, BB-021, BB-022
- FR-04: BB-023, BB-024
- FR-05: BB-025, BB-026, BB-027, BB-028, BB-029, BB-030, BB-031, BB-032, BB-054
- FR-06: BB-033
- FR-07: BB-034, BB-035, BB-036
- FR-08: BB-037
- FR-09: BB-038, BB-039
- FR-10: BB-040, BB-041, BB-042, BB-043, BB-044, BB-045, BB-046
- FR-11: BB-047, BB-048, BB-049, BB-050, BB-051, BB-052, BB-053, BB-054
- FR-12: BB-055, BB-056, BB-057, BB-058, BB-059, BB-060
