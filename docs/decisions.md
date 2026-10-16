# Quyết định triển khai và phạm vi nghiệm thu

Nguồn: SRS 1.0 do người dùng đính kèm, ngày 16/10/2026. Đây là bản triển khai baseline, không phải xác nhận toàn bộ các NFR/TBD đã được nghiệm thu.

## Được người dùng xác nhận trong cuộc trò chuyện

- Server-side session trong MySQL, cookie HttpOnly + SameSite=Strict, hết hạn tuyệt đối sau 8 giờ. Production thêm Secure và bắt buộc đặt sau HTTPS. Logout xóa session ngay lập tức. Không dùng JWT hoặc refresh token.
- Mật khẩu 8–128 ký tự; tối thiểu 8 đã được xác nhận, tối đa 128 là giới hạn kỹ thuật đầu vào. Không tự áp đặt quy tắc viết hoa/ký tự đặc biệt.
- Email tùy chọn, kiểm tra định dạng và duy nhất khi được cung cấp.
- Guest không xem/tìm sách. User và Admin được tra cứu; chỉ USER tạo yêu cầu mượn.
- Chưa đặt giới hạn số sách hoặc số ngày mượn; ngày trả dự kiến phải sau ngày mượn.
- Chặn yêu cầu PENDING trùng User + sách bằng khóa dòng User trong transaction. Các yêu cầu đã xử lý không ngăn gửi yêu cầu mới.

## Lựa chọn kỹ thuật được công khai để có thể điều chỉnh

- React + Vite, Node.js 24 LTS + Express 5, MySQL 8.4/InnoDB. Không dùng dữ liệu giả ở frontend, localStorage hoặc SQLite thay MySQL.
- Scrypt với salt ngẫu nhiên 128 bit, khóa 512 bit; mật khẩu và cookie thô không được ghi log. Session lưu SHA-256 của token ngẫu nhiên 256 bit.
- Đăng nhập giới hạn 100 yêu cầu/15 phút/IP trên nhóm auth. Bộ đếm này trong tiến trình: khi triển khai nhiều instance cần shared store và cấu hình trusted proxy cụ thể; không bật trust proxy tùy tiện.
- API same-origin; cookie SameSite Strict và kiểm tra Origin cho mutation chống CSRF. Không hỗ trợ cross-origin credential. Production cần TLS reverse proxy; backend để trong mạng riêng. Không tuyên bố HTTPS đã được triển khai trong môi trường phát triển.
- Hard delete theo BR-15: FK RESTRICT khi có lịch sử. Admin không được tự xóa/tự hạ quyền hoặc xóa/hạ quyền Admin cuối cùng. Đây là bảo vệ tạm thời cho TBD-ADMIN/TBD-DELETE; cần chủ sản phẩm duyệt trước vận hành.
- `totalQuantity` và `availableQuantity`; backend giữ nguyên số cuốn đang mượn khi sửa tổng. Khi tạo qua API có thể nhập availableQuantity trong [0,total], UI khởi tạo bằng tổng. Khi sửa, không cho ghi đè availableQuantity tùy ý. Không thêm chức năng trả sách ngoài phạm vi.
- Phân trang mặc định 12, tối đa 100, page bắt đầu 1. Sort allowlist newest/title/available. MySQL utf8mb4_0900_ai_ci tìm không phân biệt hoa thường/dấu; LIKE tìm chuỗi con theo title, author, bookCode. Ký tự %/_ có nghĩa wildcard SQL LIKE (không gây SQL injection vì dùng parameters).
- Ngày mượn/trả là DATE, không đổi theo múi giờ. Thời điểm hệ thống lưu/đọc UTC, giao diện ngày dd/mm/yyyy. Ngày hiển thị ở thanh đầu theo múi giờ trình duyệt.
- Bìa sách minh họa bằng CSS từ tiêu đề/tác giả, không phải ảnh bìa thương mại gốc. Seed 12 đầu sách mẫu để thử nghiệm; không phải dữ liệu thư viện thật.
- Audit ghi login thành công, đăng ký, CRUD book/user, thay đổi role, tạo và quyết định mượn; không ghi body chứa credential. Khi audit thất bại, mutation cùng transaction rollback. Request ID được tạo server và trả header/envelope.

## Chưa chốt / chưa nghiệm thu production

SLA, p95, số người dùng đồng thời, lịch/retention backup, RPO/RTO, thời hạn lưu audit, HTTPS/domain thực tế, điều kiện quản trị giữa các Admin. Chưa load-test hay diễn tập phục hồi. Không có trả sách, gia hạn, giữ chỗ, phạt, thanh toán, email/SMS, barcode hoặc nhiều chi nhánh.

## An toàn dữ liệu triển khai

Không dùng database thật khi chạy test: API test yêu cầu DB_NAME kết thúc `_test`. Browser test dùng tài khoản seed và API đang chạy; tự dọn đúng request/book do nó tạo, không chạy với server production. Không đưa `.env`, password hoặc database volume vào Git. Không đổi password trong `.env` sau khi đã tạo volume rồi mong MySQL tự cập nhật: phải đổi password tại DB theo quy trình quản trị. Không xóa volume để giải quyết lỗi xác thực khi có dữ liệu cần giữ.
