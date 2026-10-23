# Bộ test case cơ bản — 30 ca

Ưu tiên thao tác thủ công trên web, bám SRS gốc và màn hình đã code. Đây là bộ kiểm tra rút gọn, không thay bộ nghiệm thu đầy đủ.

[Excel30 ca](simple-test-cases.xlsx) · [CSV](simple-test-cases.csv) · [Bộ chi tiết226 ca](test-cases.xlsx) · [Báo cáo SRS/code](srs-code-review.md)

## Hướng dẫn

**Bộ kiểm thử:** 30 test case cơ bản: 29 ca thao tác web, 1 ca API kiểm tra phân quyền. Phủ 12 nhóm FR; là bộ kiểm tra chức năng chính, không tuyên bố nghiệm thu đầy đủ mọi SRS/NFR.

**Căn cứ:** SRS gốc v1.0 ngày16/10/2026 do người dùng gửi; đối chiếu src/main.jsx, server/app.js và quyết định trong docs/decisions.md. Báo cáo chi tiết: docs/blackbox/srs-code-review.md.

**Nguồn SRS:** Đặc tả yêu cầu phần mềm website quản lý thư viện — SRS.docx; SHA-256 a440fa65c73192e27e82b27dee6a8bbef78505d31ae98023388250db3356e703.

**Chuẩn bị:** Dùng môi trường test, không dùng production. A1=ADMIN, U1/U2=hai USER riêng. Dùng username/mật khẩu thực đã có, không đăng nội dung .env, mật khẩu hoặc cookie vào báo cáo/Git.

**Dữ liệu:** RUN là mã chữ/số riêng cho lượt chạy, ví dụ20261023A; thay RUN trong dữ liệu trước khi nhập. B1/R1 là tên gọi đối tượng, lấy đúng sách/yêu cầu đã chuẩn bị; mỗi ca chuẩn bị theo tiền điều kiện, không phụ thuộc kết quả ca trước.

**Tạo dữ liệu:** A1 tạo sách và người dùng qua màn hình quản trị. USER tạo yêu cầu; ADMIN duyệt/từ chối để dựng lịch sử. Giữ nguyên số liệu đúng tiền điều kiện trước ca; dùng sách thử riêng cho ca thay đổi tồn.

**Mật khẩu ví dụ:** Abcd1234 chỉ là dữ liệu cho tài khoản thử tạo mới, không phải mật khẩu mặc định của tài khoản seed hay tài khoản thật.

**Cách ghi kết quả:** Pass: làm đủ bước và mọi kết quả đúng. Fail: có sai khác. Blocked: thiếu dữ liệu/công cụ. Chưa chạy: chưa thực hiện. Điền cột Kết quả thực tế và Ghi chú/bằng chứng; không tự lấy kết quả test cũ làm Pass.

**Trạng thái bộ mới:** Tất cả Chưa chạy. Việc bộ chi tiết từng có kiểm tra bổ trợ không có nghĩa 30 ca này đã được thực hiện đầy đủ.

**Điểm SRS còn TBD:** Auth/session/timeout, password, email optional, quyền Guest, duplicatePENDING, giới hạn mượn và quyền ADMIN khác vẫn TBD trong SRS. Ca có phụ thuộc cấu hình hiện tại được ghi ở cột Ghi chú, không gọi là yêu cầu đã chốt của SRS.

**Lỗi web đã biết:** FR-02: email hợp lệ83 ký tự đăng nhập API được nhưng ô đăng nhập UI chỉ giữ64 ký tự. Lỗi vẫn chưa sửa. Bộ rút gọn dùng username cho ca cơ bản; lỗi email vẫn ghi nhận tại đây, không bị xóa khỏi báo cáo chi tiết.

**Sắp xếp chưa chốt:** Nhãn Mới cập nhật hiện sắp theo ID tạo mới. Vì SRS chưa chốt tạo mới hay lần chỉnh sửa, không đưa cách hiểu này làm tiêu chí Pass của bộ cơ bản.

**Không có trong 30 ca:** Biên độ dài/kiểu dữ liệu chi tiết, API malformed/not-found, fake session/spoof, đồng thời, rollback, replay cookie, rate-limit, chờ8giờ, mọi tổ hợp CRUD/role. Tham khảo bộ226 ca và báo cáo nếu cần kiểm tra sâu. Không kết luận toàn bộ các phần này đạt.

**Ngoài phạm vi:** Không thêm trả sách, gia hạn, phạt, thanh toán vì SRS chưa đưa vào phạm vi. Hiệu năng, SLA, HTTPS production, backup/RPO/RTO không được nghiệm thu bằng bộ cơ bản này.

**Giữ bản chi tiết:** Bộ226 ca vẫn ở docs/blackbox/test-cases.xlsx. File TEST_CASE_HOP_DEN.xlsx tại thư mục gốc bây giờ là bản30 ca đơn giản.

**Dọn dữ liệu:** Chỉ xóa tài khoản/sách thử chưa có lịch sử bằng UI sau khi lưu bằng chứng. Dữ liệu đã có lịch sử giữ trong môi trường test; không xóa database/volume để dọn tùy tiện.

## Test case

### TC-01 — Đăng ký hợp lệ
**SRS:** FR-01
**Tiền điều kiện/dữ liệu:** Chưa đăng nhập. Username=readerRUN chưa tồn tại; họ tên=Nguyễn An; mật khẩu thử=Abcd1234. Email có thể để trống theo cấu hình web.

1. Bấm Đăng ký độc giả.
2. Nhập dữ liệu trên, bấm Tạo tài khoản.
3. Đăng nhập tài khoản vừa tạo.

**Mong đợi:** Thông báo đăng ký thành công; đăng nhập được và vào Khám phá sách với quyền độc giả.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Email tùy chọn và mật khẩu tối thiểu8 thuộc quyết định triển khai, SRS còn TBD.

### TC-02 — Bỏ trống trường bắt buộc
**SRS:** FR-01
**Tiền điều kiện/dữ liệu:** Chưa đăng nhập; họ tên=Nguyễn An, mật khẩu thử=Abcd1234; bỏ trống tên đăng nhập.

1. Mở Đăng ký độc giả.
2. Điền họ tên/mật khẩu, để trống tên đăng nhập.
3. Bấm Tạo tài khoản.

**Mong đợi:** Không tạo tài khoản; form chỉ ra tên đăng nhập bắt buộc; không vào màn hình đã đăng nhập.
**Trạng thái:** Chưa chạy.


### TC-03 — Tên đăng nhập đã tồn tại
**SRS:** FR-01
**Tiền điều kiện/dữ liệu:** Chưa đăng nhập; đã có tài khoản readerRUN.

1. Mở Đăng ký độc giả.
2. Dùng username readerRUN, họ tên/mật khẩu hợp lệ.
3. Bấm Tạo tài khoản.

**Mong đợi:** Hiện lỗi thông tin đã tồn tại; không tạo tài khoản thứ hai và không đổi tài khoản cũ.
**Trạng thái:** Chưa chạy.


### TC-04 — Đăng nhập độc giả
**SRS:** FR-02
**Tiền điều kiện/dữ liệu:** U1 là tài khoản USER có mật khẩu thử đã biết; hiện chưa đăng nhập.

1. Nhập username/mật khẩu đúng của U1.
2. Bấm Đăng nhập.

**Mong đợi:** Vào Khám phá sách; có Sách của tôi và Hồ sơ cá nhân; hiển thị đúng người đăng nhập.
**Trạng thái:** Chưa chạy.


### TC-05 — Đăng nhập quản trị viên
**SRS:** FR-02
**Tiền điều kiện/dữ liệu:** A1 là tài khoản ADMIN có mật khẩu thử đã biết; hiện chưa đăng nhập.

1. Nhập username/mật khẩu đúng của A1.
2. Bấm Đăng nhập.

**Mong đợi:** Vào Tổng quan thư viện; có Quản lý sách, Yêu cầu mượn, Người dùng.
**Trạng thái:** Chưa chạy.


### TC-06 — Đăng nhập sai mật khẩu
**SRS:** FR-02
**Tiền điều kiện/dữ liệu:** Chưa đăng nhập; U1 tồn tại.

1. Nhập username U1, mật khẩu sai.
2. Bấm Đăng nhập.

**Mong đợi:** Báo tên đăng nhập hoặc mật khẩu không đúng; vẫn ở màn hình đăng nhập.
**Trạng thái:** Chưa chạy.


### TC-07 — Tìm thấy sách
**SRS:** FR-03
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; có sách tên=KiemThuRUN thuộc bộ dữ liệu thử.

1. Ở Khám phá sách, nhập KiemThuRUN vào ô Tìm sách.
2. Chờ danh sách cập nhật.

**Mong đợi:** Danh sách có sách KiemThuRUN; các kết quả khớp từ khóa trong tên/tác giả/mã sách.
**Trạng thái:** Chưa chạy.


### TC-08 — Tìm không có kết quả
**SRS:** FR-03
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; không có sách chứa token chữ/số ZZZRUNNoMatch999.

1. Tìm ZZZRUNNoMatch999.
2. Chờ danh sách cập nhật.

**Mong đợi:** Hiện trạng thái không có kết quả; không báo lỗi hệ thống và không hiển thị sách không khớp.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Không dùng % hoặc _ vì web hiện coi chúng là wildcard.

### TC-09 — Lọc thể loại
**SRS:** FR-03
**Tiền điều kiện/dữ liệu:** Đăng nhập U1. Có B1 thể loại CAT-RUN-A và B2 thể loại CAT-RUN-B.

1. Xóa từ khóa tìm kiếm cũ.
2. Chọn thể loại CAT-RUN-A.

**Mong đợi:** Có B1, không có B2; mọi sách trong danh sách thuộc CAT-RUN-A.
**Trạng thái:** Chưa chạy.


### TC-10 — Chuyển trang danh sách
**SRS:** FR-03
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; có13 sách thử trong thể loại PAGE-RUN, không có sách khác thuộc thể loại này.

1. Lọc PAGE-RUN.
2. Ghi ID/mã sách trang1.
3. Bấm trang kế tiếp.
4. Quay lại trang1.

**Mong đợi:** Trang1 có12 sách, trang2 có1 sách; không trùng/mất sách giữa hai trang; quay lại đúng danh sách ban đầu.
**Trạng thái:** Chưa chạy.
**Ghi chú:** 12 sách/trang là cấu hình web hiện tại, không phải con số đã chốt trong SRS.

### TC-11 — Xem chi tiết sách
**SRS:** FR-04
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; B1 có tên, tác giả, mã, thể loại, mô tả và tồn đã biết.

1. Tìm B1.
2. Bấm xem sách.

**Mong đợi:** Mở Chi tiết sách; tên/tác giả/mã/thể loại/mô tả và số có sẵn/tổng khớp dữ liệu B1.
**Trạng thái:** Chưa chạy.


### TC-12 — Gửi yêu cầu mượn hợp lệ
**SRS:** FR-05
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; B1 có sẵn2 cuốn; U1 chưa có yêu cầu chờ duyệt B1. D là ngày mai, D+1 là ngày kế tiếp.

1. Mở B1, bấm Gửi yêu cầu mượn.
2. Nhập ngày mượn D, ngày trả D+1.
3. Gửi; mở Sách của tôi.
4. Mở lại chi tiết B1.

**Mong đợi:** Báo gửi thành công; có yêu cầu mới Chờ duyệt với đúng sách/ngày; B1 vẫn có sẵn2 cuốn.
**Trạng thái:** Chưa chạy.


### TC-13 — Ngày trả bằng ngày mượn
**SRS:** FR-05 / BR-05
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; B1 tồn tại; chưa có yêu cầu chờ duyệt cùng sách. D là ngày mai.

1. Mở form mượn B1.
2. Đặt cả ngày mượn và ngày trả là D.
3. Bấm Gửi yêu cầu; kiểm tra Sách của tôi.

**Mong đợi:** Không tạo yêu cầu; báo ngày trả phải sau ngày mượn; tồn sách không đổi.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Chọn một giá trị đại diện nhóm ngày sai; các biên khác ở bộ chi tiết.

### TC-14 — Xem hồ sơ cá nhân
**SRS:** FR-06
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; biết họ tên, username, email và role của U1.

1. Mở Hồ sơ cá nhân.
2. So sánh thông tin với tài khoản U1.

**Mong đợi:** Đúng hồ sơ U1; không hiển thị mật khẩu hoặc password hash.
**Trạng thái:** Chưa chạy.


### TC-15 — Chỉ xem lịch sử của mình
**SRS:** FR-07 / BR-03
**Tiền điều kiện/dữ liệu:** U1 có yêu cầu R1, U2 có yêu cầu R2 khác nhau. Biết mã yêu cầu; dùng hai phiên trình duyệt riêng.

1. Đăng nhập U1, mở Sách của tôi, xem đủ các trang.
2. Ở phiên khác đăng nhập U2, làm tương tự.

**Mong đợi:** U1 thấy R1, không thấy R2; U2 thấy R2, không thấy R1; mỗi danh sách chỉ có yêu cầu của chính người đăng nhập.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Đây là quan sát UI; kiểm tra chống giả mạo API đầy đủ vẫn ở bộ chi tiết.

### TC-16 — Lọc lịch sử mượn
**SRS:** FR-07
**Tiền điều kiện/dữ liệu:** Đăng nhập U1; có ít nhất một yêu cầu Chờ duyệt và một yêu cầu Đã duyệt.

1. Mở Sách của tôi.
2. Chọn tab Chờ duyệt.

**Mong đợi:** Chỉ hiện yêu cầu Chờ duyệt của U1; không có yêu cầu đã duyệt/từ chối.
**Trạng thái:** Chưa chạy.


### TC-17 — Đăng xuất
**SRS:** FR-08
**Tiền điều kiện/dữ liệu:** Đăng nhập U1.

1. Bấm Đăng xuất.
2. Tải lại trang.

**Mong đợi:** Trở về màn hình đăng nhập; không tự vào lại tài khoản U1.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Ca cơ bản UI; kiểm tra gửi lại cookie cũ thuộc bộ chi tiết.

### TC-18 — Thống kê cập nhật sau thêm sách
**SRS:** FR-09
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; ghi số Đầu sách=N và tổng cuốn=M trên Tổng quan. Không có người khác thay đổi dữ liệu.

1. Vào Quản lý sách, thêm sách mới mã STATS-RUN, tổng2 cuốn; các trường bắt buộc hợp lệ.
2. Quay lại Tổng quan.

**Mong đợi:** Đầu sách=N+1; tổng cuốn=M+2; không tự tăng số Chờ duyệt/Đã duyệt.
**Trạng thái:** Chưa chạy.


### TC-19 — Thêm sách hợp lệ
**SRS:** FR-10
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; mã BK-TC19-RUN chưa tồn tại. Tên=Sach Thu RUN; tác giả=Tac Gia; thể loại=CAT-RUN; tổng3.

1. Mở Quản lý sách, bấm Thêm sách mới.
2. Điền dữ liệu; bấm Lưu thay đổi.
3. Tìm mã sách vừa tạo.

**Mong đợi:** Tạo thành công; đúng thông tin đã nhập; tổng3 và có sẵn3.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Tồn khởi tạo bằng tổng là cách web hiện triển khai.

### TC-20 — Không thêm trùng mã sách
**SRS:** FR-10
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; đã có sách mã BK-DUP-RUN.

1. Thêm sách mới dùng mã BK-DUP-RUN.
2. Các trường còn lại hợp lệ; bấm Lưu thay đổi.

**Mong đợi:** Báo mã sách đã tồn tại; không tạo bản sao, không đổi sách cũ.
**Trạng thái:** Chưa chạy.


### TC-21 — Sửa thông tin sách
**SRS:** FR-10
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; B1 có tổng3/có sẵn3, chưa có yêu cầu mượn.

1. Trong Quản lý sách, bấm Sửa B1.
2. Đổi tên thành Ten Moi RUN, giữ các trường khác.
3. Lưu; tìm và mở lại B1.

**Mong đợi:** Tên mới được lưu; mã/tác giả/tổng/có sẵn giữ nguyên.
**Trạng thái:** Chưa chạy.


### TC-22 — Xóa sách chưa có lịch sử
**SRS:** FR-10
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; B1 là sách thử không có bất kỳ yêu cầu mượn nào.

1. Bấm Xóa B1.
2. Xác nhận xóa.
3. Tìm lại đúng mã sách.

**Mong đợi:** Xóa thành công; không còn B1 trong danh sách/kết quả tìm.
**Trạng thái:** Chưa chạy.


### TC-23 — Không xóa sách có lịch sử
**SRS:** FR-10 / BR-15
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; B1 có ít nhất một yêu cầu đã từ chối, chưa bị xóa.

1. Bấm Xóa B1.
2. Xác nhận.
3. Đọc lại sách và yêu cầu liên quan.

**Mong đợi:** Báo không thể xóa do có lịch sử; sách và yêu cầu cũ vẫn còn.
**Trạng thái:** Chưa chạy.


### TC-24 — Duyệt yêu cầu khi còn sách
**SRS:** FR-11 / BR-08
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; R1 đang Chờ duyệt cho B1; B1 có sẵn2 cuốn.

1. Vào Yêu cầu mượn, tìm R1.
2. Bấm Duyệt, ghi chú Dong y RUN; xác nhận.
3. Kiểm tra yêu cầu và số có sẵn của B1.

**Mong đợi:** R1 thành Đã duyệt, ghi chú được lưu; B1 có sẵn1 cuốn; tổng sách không đổi.
**Trạng thái:** Chưa chạy.


### TC-25 — Từ chối yêu cầu
**SRS:** FR-11 / BR-09
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; R1 đang Chờ duyệt; B1 có sẵn2 cuốn.

1. Tìm R1 trong Yêu cầu mượn.
2. Bấm Từ chối, ghi chú Ly do RUN; xác nhận.
3. Kiểm tra R1 và B1.

**Mong đợi:** R1 thành Từ chối, lưu ghi chú; B1 vẫn có sẵn2 cuốn.
**Trạng thái:** Chưa chạy.


### TC-26 — Duyệt khi hết sách
**SRS:** FR-11 / BR-10
**Tiền điều kiện/dữ liệu:** A1/U1/U2 có tài khoản. B1 ban đầu có1 cuốn; U1/U2 đã gửi R1/R2; A1 đã duyệt R2 nên B1 có sẵn0, R1 còn Chờ duyệt.

1. A1 tìm R1 trong Yêu cầu mượn.
2. Bấm Duyệt và xác nhận.
3. Kiểm tra R1 và B1.

**Mong đợi:** Báo sách đã hết; R1 vẫn Chờ duyệt; B1 có sẵn0, không âm.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Chuẩn bị dữ liệu qua web theo tiền điều kiện, không chỉnh trực tiếp database.

### TC-27 — Thêm người dùng
**SRS:** FR-12
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; username memberRUN chưa tồn tại; họ tên=Tran B; mật khẩu thử=Abcd1234; role=Độc giả.

1. Vào Người dùng, bấm Thêm người dùng.
2. Điền dữ liệu, lưu.
3. Tìm lại username memberRUN.

**Mong đợi:** Có tài khoản mới, đúng họ tên/username và vai trò Độc giả; không hiển thị mật khẩu.
**Trạng thái:** Chưa chạy.


### TC-28 — Sửa người dùng
**SRS:** FR-12
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; U2 là độc giả thử có thông tin đã biết.

1. Trong Người dùng, bấm Sửa U2.
2. Đổi họ tên thành Ten Moi RUN, giữ username/email/role, để trống mật khẩu mới.
3. Lưu và mở lại.

**Mong đợi:** Họ tên đổi đúng; username/email/role giữ nguyên.
**Trạng thái:** Chưa chạy.


### TC-29 — Xóa người dùng chưa có lịch sử
**SRS:** FR-12
**Tiền điều kiện/dữ liệu:** Đăng nhập A1; U2 là độc giả thử không có yêu cầu mượn, không phải A1.

1. Trong Người dùng, bấm Xóa U2.
2. Xác nhận.
3. Tìm lại username U2.

**Mong đợi:** Xóa thành công; danh sách không còn U2.
**Trạng thái:** Chưa chạy.


### TC-30 — Độc giả không gọi được API quản trị
**SRS:** BR-04 / NFR-SEC-03
**Tiền điều kiện/dữ liệu:** Có phiên đăng nhập U1 trong Postman hoặc HTTP client. Đây là ca API duy nhất của bộ rút gọn.

1. Bằng cookie phiên U1, gọi GET /api/v1/admin/stats.
2. Đọc HTTP và body, không dùng phiên ADMIN.

**Mong đợi:** HTTP403; success=false; không trả số liệu thống kê quản trị.
**Trạng thái:** Chưa chạy.
**Ghi chú:** Ẩn menu trên UI chưa đủ chứng minh phân quyền backend. Dùng client hỗ trợ cookie; không ghi cookie vào báo cáo.

