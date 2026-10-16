# Lá Thư Viện

Website quản lý thư viện tiếng Việt theo SRS 1.0: React + Express + MySQL 8.4. Giao diện responsive, khu độc giả và khu quản trị, REST API `/api/v1`, session phía server, audit và transaction xét duyệt.

## Chạy nhanh

Yêu cầu Node.js 24 LTS, npm, Docker Engine và Docker Compose v2. Dùng checkout hiện tại; mỗi cloud task đã được cô lập, không cần tạo Git worktree.

```bash
cd /workspace/librarymanagement_ByAI
bash scripts/setup.sh
npm start
```

Server mặc định dùng cổng 3000. `setup.sh` cài đúng lockfile, tạo `.env` khi chưa có (không ghi đè), bật MySQL, chạy schema idempotent, seed không ghi đè dữ liệu và build frontend. Mọi dữ liệu nghiệp vụ lưu trong Docker volume `library_data`; process Node cần khởi động lại trong task mới.

Tài khoản mẫu: `admin` (quản trị), `docgia` (độc giả). Mật khẩu được tạo ngẫu nhiên riêng trên máy, nằm trong `.env` ở `SEED_ADMIN_PASSWORD` và `SEED_USER_PASSWORD`; không có mật khẩu mặc định công khai. Xem bằng trình soạn thảo cục bộ, không đưa nội dung file vào chat, log hoặc Git. Có thể đăng ký độc giả trực tiếp trên website. Nếu dùng `.env` tự chuẩn bị, điền các trường DB và hai mật khẩu seed trước `setup.sh`.

Để phát triển frontend có hot reload, giữ backend chạy và mở terminal thứ hai:

```bash
npx vite --host 0.0.0.0
```

Vite proxy `/api` tới backend cổng 3000. Chỉ thay cổng backend nếu đồng thời cập nhật proxy dev. Không trộn các hostname khi đăng nhập vì cookie ràng buộc host.

## Chức năng

- Đăng ký, đăng nhập, đăng xuất thu hồi session ngay lập tức.
- Tìm theo tên/tác giả/mã sách, lọc thể loại, sắp xếp, phân trang, xem chi tiết.
- Độc giả gửi yêu cầu với ngày mượn/trả dự kiến, xem hồ sơ và lịch sử riêng.
- Admin xem thống kê, CRUD sách và người dùng, lọc yêu cầu và duyệt/từ chối kèm ghi chú.
- Phân quyền server, hash scrypt, validation, lỗi nhất quán, audit, FK/CHECK.
- Duyệt và giảm tồn một cuốn trong cùng transaction với row locks; không duyệt lần hai, không âm tồn, lỗi giữa chừng rollback.

## Kiểm thử

```bash
bash scripts/test-db.sh
npm run build
node tests/browser.mjs
```

`test-db.sh` tạo database riêng `library_management_test`, chạy schema và bộ API test. Không dùng dữ liệu vận hành. Browser test cần server `npm start` chạy, Chromium hệ thống ở `/usr/bin/chromium` (hoặc đặt `CHROMIUM_PATH`), tài khoản seed còn nguyên mật khẩu trong `.env`. Ảnh kiểm tra ghi vào `/workspace/artifacts`. Test dùng dữ liệu riêng và dọn các bản ghi do nó tạo.

API test kiểm tra đăng ký/role injection, auth/ownership, search/pagination, ngày sai, CRUD/FK, duplicate pending, duyệt đồng thời, hết sách, transaction rollback khi giả lập lỗi ghi audit, thống kê, audit và logout. Kết quả cụ thể xem [báo cáo xác minh](docs/verification.md).

## API và truy vết

- [OpenAPI 3.1](docs/openapi.json): import vào Swagger Editor/Postman.
- [Postman Collection](docs/postman_collection.json): dùng cookie jar, đăng nhập trước khi gọi API bảo vệ; tự nhập username/password vào biến cục bộ, không commit giá trị thật.
- [Ma trận FR → API → test](docs/traceability.md).
- [Quyết định và các mục còn TBD](docs/decisions.md).

## Cấu hình và vận hành

`.env.example` liệt kê biến, `.env` là file bí mật local được bỏ qua bởi Git. `SESSION_HOURS=8`, `MIN_PASSWORD_LENGTH=8`, `BLOCK_DUPLICATE_PENDING=true` là cấu hình đã xác nhận. `npm run db:migrate` có thể chạy lặp. Seed dùng INSERT IGNORE, không thay mật khẩu của tài khoản đã tồn tại.

Production phải dùng HTTPS, `NODE_ENV=production`, thông tin DB riêng và bỏ dữ liệu demo. Giữ MySQL trong mạng riêng; cổng Compose chỉ bind loopback. Dùng service manager/container cho Node, proxy rate limit đúng IP, thiết lập backup/retention và kiểm tra restore theo RPO/RTO được chủ dự án chốt. Không dùng dev server hoặc cài đặt hiện tại làm bằng chứng đạt SLA. Quyền DB khi triển khai nên tách tài khoản migration và tài khoản chạy ứng dụng.

Không chạy `docker compose down -v` nếu cần giữ dữ liệu. `docker compose stop` chỉ dừng dịch vụ và giữ volume. Khi gặp lỗi xem `docker compose ps`, log DB không chứa password và endpoint `/api/v1/health`; không tắt TLS/signature verification để xử lý lỗi tải gói.
