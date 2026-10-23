# Kết quả kiểm thử hộp đen — bộ 30 ca

Đọc [báo cáo kết quả cuối cùng](20261023-final/bao-cao-ket-qua.md), [Excel](20261023-final/KET_QUA_KIEM_THU_HOP_DEN.xlsx) hoặc [Word](20261023-final/BAO_CAO_KIEM_THU_HOP_DEN.docx).

Ngày thực hiện:23/10/2026. Kết quả chốt: **30 Pass / 0 Fail / 0 Blocked**, trong phạm vi30 ca cơ bản; không có nghĩa website không còn lỗi hoặc đạt toàn bộ SRS.

Bằng chứng được giữ nguyên theo lượt:

- `20261023022458-2a8adc`: lượt đủ30 ca;28 Pass, TC-18 vướng phép cộng chuỗi trong runner, TC-27 vướng locator dropdown.
- `20261023022645-f74a15`: chỉ chạy lại TC-18 và TC-27 sau sửa runner; cả hai Pass. Mã website và kỳ vọng TC không thay đổi.
- `20261023-final`: tổng hợp kết quả cuối theo ID; JSON trỏ về bằng chứng từng lượt và giữ thông tin chạy lại.

Các lượt chẩn đoán thiết lập trước đó được giữ cục bộ tại `/workspace/scratch/blackbox-runner-debug`, không dùng làm kết luận lỗi sản phẩm. Bộ mẫu30 ca ở `../simple-test-cases.xlsx` vẫn giữ trạng thái Chưa chạy; kết quả thực thi nằm trong các file kết quả riêng.

Lỗi email dài hơn64 ký tự và điểm chưa rõ về nhãn sắp xếp vẫn còn được ghi trong báo cáo. Chúng không nằm trong mẫu số30 của lần thực thi này.

Chạy lại cần môi trường test riêng, MySQL/schema/seed, Chromium và server trỏ đúng DB test:

```bash
DB_NAME=library_blackbox_acceptance_test PORT=3002 npm start
```

Trong terminal khác, từ thư mục gốc repository:

```bash
DB_NAME=library_blackbox_acceptance_test TEST_BASE_URL=http://127.0.0.1:3002 node docs/blackbox/run-simple-blackbox.mjs
```

Runner tạo thư mục bằng chứng mới cho mỗi lần chạy; dùng `ONLY_CASES=TC-18,TC-27` khi chỉ cần kiểm tra lại hai ca đó. Không chạy các lệnh này trên server production. `DB_NAME` phía runner là guard, không tự xác minh DB của server; người chạy phải khởi động server bằng cùng cấu hình test như trên. Báo cáo được sinh từ JSON đã hoàn thành, không tạo kết quả giả định.
