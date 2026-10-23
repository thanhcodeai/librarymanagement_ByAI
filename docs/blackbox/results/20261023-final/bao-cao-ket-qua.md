# Kết quả kiểm thử hộp đen — Lá Thư Viện

**Run:** `20261023-final`. **Kết quả:** 30 Pass, 0 Fail, 0 Blocked, 0 chưa chạy; tỷ lệ đạt 100.0% trong30 ca đã chọn.

## Môi trường, phương pháp và phạm vi

- **Hệ thống:** Lá Thư Viện
- **Loại kiểm thử:** Hộp đen chức năng: thao tác qua Chromium cho29 ca;1 ca HTTP kiểm tra quyền. Playwright mô phỏng các bước của bộ TC thủ công.
- **Bộ TC:** 30 ca trong docs/blackbox/simple-test-cases.csv; không phải bộ226 ca.
- **SRS:** Bản gốc v1.0 ngày16/10/2026 do người dùng gửi; xem srs-code-review.md về các TBD.
- **Mã ứng dụng:** d4f2e3852cefad8a40037eee7af9b2d8fd2ed60b
- **Run ID:** 20261023-final
- **Bắt đầu / kết thúc:** 23/10/2026 09:24:58 – 23/10/2026 09:26:49 (Asia/Saigon)
- **Thời lượng:** 111.42 giây (không tính cài đặt/dựng database ban đầu)
- **Môi trường:** Node v24.19.0; Chromium 154.0.8037.57; MySQL8.4; viewport1440×1060; database riêng library_blackbox_acceptance_test
- **Dữ liệu:** Fixture riêng theo từng ca, dựng qua API công khai trước bước thử; tác vụ mục tiêu29 ca đi qua UI. Không dùng hoặc sửa dữ liệu vận hành. Hồ sơ thử có lịch sử được giữ trong DB test để truy vết.
- **Tổng / thực hiện:** 30 / 30
- **Pass:** 30
- **Fail:** 0
- **Blocked:** 0
- **Chưa chạy:** 0
- **Tỷ lệ đạt:** 100.0% trên30 ca đã chọn
- **Bằng chứng:** docs/blackbox/results/20261023-final/results.json và ảnh PNG từng ca; TC-30 có body HTTP đã loại thông tin xác thực.
- **Lưu ý HTTP:** 400/401/403/409/404 xuất hiện ở ca âm có thể là kết quả mong đợi; không tự coi mọi HTTP4xx là test Fail.
- **Lượt chốt:** Báo cáo tổng hợp1 lượt đủ30 ca và1 lượt chạy lại riêngTC-18/TC-27. Kết quả gốc từng lượt được giữ trong sourceRuns của results.json; ghi chú retest có ở hai dòng tương ứng. Các lượt chuẩn bị có lỗi locator/thiết lập kịch bản đã được chẩn đoán và chạy lại sau sửa runner; không tính lỗi công cụ thành lỗi website. Không sửa mã ứng dụng hoặc đổi kỳ vọng để làm test đạt.
- **Lỗi ngoài bộ30:** BUG-01 đã xác nhận ở lượt đối chiếu trước: email hợp lệ83 ký tự bị form cắt còn64; API login200 nhưng UI401. Chưa sửa; không nằm trong30 ca và không tính thêm vào mẫu số30.
- **Điểm cần chốt:** UX-02: nhãn Mới cập nhật dùng thứ tự tạo; các TBD của SRS về password/session/email/Guest/giới hạn mượn vẫn cần quyết định bổ sung.
- **Chưa bao phủ:** Không thực thi toàn bộ226 ca, mọi biên/kiểu dữ liệu, đồng thời, fault-injection rollback, chờ8giờ, rate-limit, load/backup/restore, productionHTTPS. Không coi pass30 là đạt toàn bộ SRS hay hết lỗi.
- **Kết luận:** Các chức năng cơ bản trong30 ca đạt trên môi trường thử.

## Kết quả từng ca

| ID | SRS | Nội dung | Kết quả thực tế | Kết luận | Bằng chứng |
| --- | --- | --- | --- | --- | --- |
| TC-01 | FR-01 | Đăng ký hợp lệ | Đăng ký201, thông báo thành công; đăng nhập200, role USER, vào Khám phá sách. | Pass | [../20261023022458-2a8adc/TC-01.png](../20261023022458-2a8adc/TC-01.png) |
| TC-02 | FR-01 | Bỏ trống trường bắt buộc | Browser báo thiếu tên đăng nhập; không gửi đăng ký; tổng tài khoản không đổi. | Pass | [../20261023022458-2a8adc/TC-02.png](../20261023022458-2a8adc/TC-02.png) |
| TC-03 | FR-01 | Tên đăng nhập đã tồn tại | HTTP409, hiện lỗi trùng; vẫn một tài khoản và hồ sơ cũ không đổi. | Pass | [../20261023022458-2a8adc/TC-03.png](../20261023022458-2a8adc/TC-03.png) |
| TC-04 | FR-02 | Đăng nhập độc giả | Đăng nhập200, đúng ID USER; có Khám phá sách, Sách của tôi, Hồ sơ cá nhân. | Pass | [../20261023022458-2a8adc/TC-04.png](../20261023022458-2a8adc/TC-04.png) |
| TC-05 | FR-02 | Đăng nhập quản trị viên | Đăng nhập200, role ADMIN; vào Tổng quan, đủ ba menu quản trị. | Pass | [../20261023022458-2a8adc/TC-05.png](../20261023022458-2a8adc/TC-05.png) |
| TC-06 | FR-02 | Đăng nhập sai mật khẩu | HTTP401; báo tên đăng nhập hoặc mật khẩu không đúng; vẫn ở form đăng nhập. | Pass | [../20261023022458-2a8adc/TC-06.png](../20261023022458-2a8adc/TC-06.png) |
| TC-07 | FR-03 | Tìm thấy sách | Tìm đúng sách KiemThu2a8adc; UI có1 kết quả khớp. | Pass | [../20261023022458-2a8adc/TC-07.png](../20261023022458-2a8adc/TC-07.png) |
| TC-08 | FR-03 | Tìm không có kết quả | Hiện Chưa có kết quả; 0 thẻ sách, không hiện lỗi hệ thống. | Pass | [../20261023022458-2a8adc/TC-08.png](../20261023022458-2a8adc/TC-08.png) |
| TC-09 | FR-03 | Lọc thể loại | Bộ lọc chỉ hiện B1 thuộc CAT2a8adcA; B2 bị loại. | Pass | [../20261023022458-2a8adc/TC-09.png](../20261023022458-2a8adc/TC-09.png) |
| TC-10 | FR-03 | Chuyển trang danh sách | Trang1 có12, trang2 có1; 13 mã không trùng/mất; quay lại trang1 giữ nguyên. | Pass | [../20261023022458-2a8adc/TC-10.png](../20261023022458-2a8adc/TC-10.png) |
| TC-11 | FR-04 | Xem chi tiết sách | Chi tiết đúng tên, tác giả, mã, thể loại, mô tả và tồn2/2. | Pass | [../20261023022458-2a8adc/TC-11.png](../20261023022458-2a8adc/TC-11.png) |
| TC-12 | FR-05 | Gửi yêu cầu mượn hợp lệ | Tạo request201, đúng ngày 2026-10-24/2026-10-25, Chờ duyệt; tồn vẫn2/2. | Pass | [../20261023022458-2a8adc/TC-12.png](../20261023022458-2a8adc/TC-12.png) |
| TC-13 | FR-05 / BR-05 | Ngày trả bằng ngày mượn | HTTP400, báo ngày trả phải sau ngày mượn; lịch sử0, tồn2 không đổi. | Pass | [../20261023022458-2a8adc/TC-13.png](../20261023022458-2a8adc/TC-13.png) |
| TC-14 | FR-06 | Xem hồ sơ cá nhân | Hồ sơ đúng ID, họ tên, username, email và vai trò; không có password/hash. | Pass | [../20261023022458-2a8adc/TC-14.png](../20261023022458-2a8adc/TC-14.png) |
| TC-15 | FR-07 / BR-03 | Chỉ xem lịch sử của mình | Hai phiên riêng: U1 chỉ thấy R21, U2 chỉ thấy R22; mỗi bên1 dòng. | Pass | [../20261023022458-2a8adc/TC-15.png](../20261023022458-2a8adc/TC-15.png) |
| TC-16 | FR-07 | Lọc lịch sử mượn | Lọc Chờ duyệt chỉ còn R23; R24 đã duyệt không xuất hiện. | Pass | [../20261023022458-2a8adc/TC-16.png](../20261023022458-2a8adc/TC-16.png) |
| TC-17 | FR-08 | Đăng xuất | Logout về form đăng nhập; tải lại vẫn chưa đăng nhập. | Pass | [../20261023022458-2a8adc/TC-17.png](../20261023022458-2a8adc/TC-17.png) |
| TC-18 | FR-09 | Thống kê cập nhật sau thêm sách | Đầu sách 99→100; tổng cuốn 289→291; Chờ duyệt/Đã duyệt không đổi. | Pass | [../20261023022645-f74a15/TC-18.png](../20261023022645-f74a15/TC-18.png) |
| TC-19 | FR-10 | Thêm sách hợp lệ | Tạo sách201, đúng mã/tên/tác giả/thể loại; bảng tổng3, có sẵn3. | Pass | [../20261023022458-2a8adc/TC-19.png](../20261023022458-2a8adc/TC-19.png) |
| TC-20 | FR-10 | Không thêm trùng mã sách | HTTP409, hiện lỗi trùng; số bản ghi và tên sách cũ không đổi. | Pass | [../20261023022458-2a8adc/TC-20.png](../20261023022458-2a8adc/TC-20.png) |
| TC-21 | FR-10 | Sửa thông tin sách | Sửa200, mở lại thấy tên mới; mã/tác giả/tổng3/có sẵn3 giữ nguyên. | Pass | [../20261023022458-2a8adc/TC-21.png](../20261023022458-2a8adc/TC-21.png) |
| TC-22 | FR-10 | Xóa sách chưa có lịch sử | Xóa204, tìm mã không có kết quả; GET sách đã xóa404. | Pass | [../20261023022458-2a8adc/TC-22.png](../20261023022458-2a8adc/TC-22.png) |
| TC-23 | FR-10 / BR-15 | Không xóa sách có lịch sử | HTTP409, báo có lịch sử; sách còn nguyên và R25 vẫn DENIED. | Pass | [../20261023022458-2a8adc/TC-23.png](../20261023022458-2a8adc/TC-23.png) |
| TC-24 | FR-11 / BR-08 | Duyệt yêu cầu khi còn sách | Xử lý200; trạng thái APPROVED, đúng ghi chú; có sẵn2→1, tổng2 giữ nguyên. | Pass | [../20261023022458-2a8adc/TC-24.png](../20261023022458-2a8adc/TC-24.png) |
| TC-25 | FR-11 / BR-09 | Từ chối yêu cầu | Xử lý200; trạng thái DENIED, đúng ghi chú; có sẵn2→2, tổng2 giữ nguyên. | Pass | [../20261023022458-2a8adc/TC-25.png](../20261023022458-2a8adc/TC-25.png) |
| TC-26 | FR-11 / BR-10 | Duyệt khi hết sách | HTTP409 OUT_OF_STOCK; UI báo hết sách; R28 vẫn PENDING, tồn0. | Pass | [../20261023022458-2a8adc/TC-26.png](../20261023022458-2a8adc/TC-26.png) |
| TC-27 | FR-12 | Thêm người dùng | Tạo user201; tìm đúng username/họ tên/role Độc giả; không trả mật khẩu. | Pass | [../20261023022645-f74a15/TC-27.png](../20261023022645-f74a15/TC-27.png) |
| TC-28 | FR-12 | Sửa người dùng | Sửa200, mở lại đúng họ tên mới; username/email/role giữ nguyên. | Pass | [../20261023022458-2a8adc/TC-28.png](../20261023022458-2a8adc/TC-28.png) |
| TC-29 | FR-12 | Xóa người dùng chưa có lịch sử | Xóa204; tìm username không có kết quả; tổng khớp0. | Pass | [../20261023022458-2a8adc/TC-29.png](../20261023022458-2a8adc/TC-29.png) |
| TC-30 | BR-04 / NFR-SEC-03 | Độc giả không gọi được API quản trị | USER gọi GET /api/v1/admin/stats: HTTP403, success=false, FORBIDDEN, không có data quản trị. | Pass | [HTTP JSON](results.json) |

## Tài liệu đính kèm

- [Excel kết quả](KET_QUA_KIEM_THU_HOP_DEN.xlsx)
- [Báo cáo Word](BAO_CAO_KIEM_THU_HOP_DEN.docx)
- [Bằng chứng JSON](results.json)
- [CSV](ket-qua-30-tc.csv)

Ảnh được chụp sau bước xác minh của từng ca; riêngTC-15 có hai phiên người dùng, mỗi phiên một ảnh. Mật khẩu/cookie không được lưu trong báo cáo. Dữ liệu nhận dạng trong ảnh là tài khoản thử.
