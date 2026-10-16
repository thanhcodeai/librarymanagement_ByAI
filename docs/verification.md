# Kết quả xác minh — 16/10/2026

## Môi trường thực tế

Node.js 24.19.0, MySQL 8.4 trong Docker, React 19/Express 5, Chromium hệ thống qua Playwright. Cài bằng lockfile, không bỏ TLS/checksum verification. Dữ liệu ứng dụng nằm trong MySQL, không có fallback sang mock/localStorage.

## Đã thực thi

| Kiểm tra | Kết quả |
|---|---|
| `bash scripts/setup.sh` | PASS: npm ci, MySQL readiness, migration, seed giữ dữ liệu cũ, frontend production build |
| `npm run build` | PASS: Vite production bundle |
| `npm run test:db` | PASS: 19 tests (18 subtests và 1 parent), 0 fail/skip; database `library_management_test` riêng |
| Đồng thời cùng yêu cầu | Một 200, một 409; tồn chỉ giảm một |
| Hai yêu cầu tranh cuốn cuối | Một 200, một 409; tồn không âm |
| Giả lập driver lỗi ghi audit sau cập nhật tồn | API 500; transaction khôi phục trạng thái PENDING và số lượng ban đầu |
| `npm run test:browser` | PASS: đăng nhập User, tìm/xem sách, gửi mượn, lịch sử, đăng xuất, Admin dashboard, duyệt, tạo/xóa sách, danh sách người dùng, hồ sơ |
| Responsive | Desktop 1440×1060 và mobile 390×844; không tràn ngang trang tại 390px, menu mobile hoạt động |
| Browser runtime | Không có pageerror trong các luồng kiểm tra |
| `npm run format:check` | PASS |
| `npm audit --omit=dev --audit-level=moderate` | 0 vulnerability tại thời điểm kiểm tra |
| Health sau khởi động | `/api/v1/health` trả success/status ok và DB query thành công |

Kiểm tra rollback sử dụng MySQL thật và giả lập lỗi write ở lớp driver, không sửa production code để bỏ qua assertion. Việc tạo SQL trigger bị giới hạn quyền SUPER của MySQL được thay bằng cách giả lập driver; không hạ chính sách bảo mật DB.

Ảnh giao diện được tạo trong `/workspace/artifacts`: `library-login-desktop.png`, `library-catalog-desktop.png`, `library-admin-desktop.png`, `library-history-desktop.png`, `library-reader-mobile.png`, `library-catalog-mobile.png`. Bìa là minh họa CSS. Browser test dọn request/book của chính nó sau khi chạy; audit được giữ để truy vết.

## Giới hạn

Đây là xác minh trong máy hiện tại, chưa phải triển khai production hoặc kiểm tra khôi phục trong cloud task mới. Chưa nghiệm thu HTTPS/domain, tải lớn, backup/restore, RPO/RTO, SLA, log retention. Không bảo đảm phần mềm tuyệt đối không có lỗi; dùng RTM và bộ test làm bằng chứng cho các trường hợp đã chạy. Những điểm SRS còn TBD được ghi riêng trong `decisions.md`.
