# Rà soát thiết kế test case — phiên bản 2.0

Đã sửa gộp biến thể, bổ sung tiền điều kiện/fixture và dữ liệu nền, tách các hành vi độc lập, chuẩn hóa HTTP/field/status và kiểm tra trạng thái trước/sau. CSV và hai bản Excel được sinh từ cùng một nguồn; không có kết quả thực thi giả định.

- Tách chuỗi/độ dài, trường thiếu, ngày, phân trang, vai trò, trạng thái và quyết định thành từng TC.
- Thay chuỗi tìm rỗng có wildcard bằng token chữ/số; ghi rõ vai trò tạo fixture và vai trò gọi request.
- Bổ sung phân trang liên tiếp/trang cuối/vượt trang, DENY khi hết tồn, tổng bằng số đang mượn, ghi đè availableQuantity, xử lý ID không tồn tại, gửi lại sau APPROVED và DENIED, API quản trị bị chặn theo từng operation.
- Tách thống kê thành ba biến đổi có delta rõ; PUT giữ các trường không thử, tránh vô tình xóa email.
- Tách responsive theo vai trò/viewport; tách SQL input và HTML; ghi điều kiện rate-limit và session để tránh false pass.
- Ghi riêng các khoảng trống đặc tả, nhất là sort=newest, query ngoài hợp đồng và ADMIN cuối. Không tự xác nhận yêu cầu chưa chốt.

## Kiểm tra tài liệu đã thực hiện

Kiểm tra ID duy nhất, đủ các cột thiết kế bắt buộc, trạng thái đều Chưa chạy, ánh xạ toàn bộ 64 ID cũ, truy vết FR-01…12, đọc lại XLSX bằng openpyxl, CSV round-trip và hai file XLSX giống nhau. Đây là kiểm tra cấu trúc tài liệu, không phải chạy TC trên ứng dụng.
