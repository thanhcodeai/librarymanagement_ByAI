import { pool, transaction } from "./db.js";
import { hashPassword } from "./security.js";
export const sampleBooks = [
  [
    "LTV-001",
    "Nhà giả kim",
    "Paulo Coelho",
    "Văn học",
    "Một chuyến đi tìm kho báu, và hành trình lắng nghe tiếng nói của trái tim.",
    12,
  ],
  [
    "LTV-002",
    "Rừng Na Uy",
    "Haruki Murakami",
    "Văn học",
    "Câu chuyện về tuổi trẻ, tình yêu và những ký ức không phai.",
    8,
  ],
  [
    "LTV-003",
    "Đắc nhân tâm",
    "Dale Carnegie",
    "Kỹ năng sống",
    "Những nguyên tắc giao tiếp và xây dựng các mối quan hệ bền vững.",
    15,
  ],
  [
    "LTV-004",
    "Lược sử loài người",
    "Yuval Noah Harari",
    "Lịch sử",
    "Hành trình khám phá những bước ngoặt làm nên thế giới con người.",
    6,
  ],
  [
    "LTV-005",
    "Tôi thấy hoa vàng trên cỏ xanh",
    "Nguyễn Nhật Ánh",
    "Văn học",
    "Một miền ký ức trong trẻo về tuổi thơ, tình bạn và gia đình.",
    10,
  ],
  [
    "LTV-006",
    "Tư duy nhanh và chậm",
    "Daniel Kahneman",
    "Tâm lý học",
    "Khám phá hai hệ thống tư duy chi phối những lựa chọn mỗi ngày.",
    7,
  ],
  [
    "LTV-007",
    "Clean Code",
    "Robert C. Martin",
    "Công nghệ",
    "Các nguyên tắc để viết mã nguồn rõ ràng, dễ bảo trì.",
    5,
  ],
  [
    "LTV-008",
    "Đi tìm lẽ sống",
    "Viktor E. Frankl",
    "Tâm lý học",
    "Sức mạnh của ý nghĩa và hy vọng trong những hoàn cảnh khắc nghiệt.",
    9,
  ],
  [
    "LTV-009",
    "Vũ trụ trong vỏ hạt dẻ",
    "Stephen Hawking",
    "Khoa học",
    "Một cánh cửa mở vào những bí ẩn kỳ diệu của không gian và thời gian.",
    4,
  ],
  [
    "LTV-010",
    "Bước chậm lại giữa thế gian vội vã",
    "Hae Min",
    "Kỹ năng sống",
    "Dành một khoảng lặng để thấu hiểu bản thân và cuộc sống.",
    11,
  ],
  [
    "LTV-011",
    "Dế Mèn phiêu lưu ký",
    "Tô Hoài",
    "Thiếu nhi",
    "Cuộc phiêu lưu đầy màu sắc về lòng dũng cảm và tình bạn.",
    14,
  ],
  [
    "LTV-012",
    "Hoàng tử bé",
    "Antoine de Saint-Exupéry",
    "Văn học",
    "Chỉ trái tim mới nhìn thấy những điều vô hình trước đôi mắt.",
    13,
  ],
];
try {
  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_USER_PASSWORD)
    throw Error(
      "Set SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD before seeding.",
    );
  await transaction(async (c) => {
    for (const [username, name, role, password] of [
      ["admin", "Quản trị thư viện", "ADMIN", process.env.SEED_ADMIN_PASSWORD],
      ["docgia", "Nguyễn An", "USER", process.env.SEED_USER_PASSWORD],
    ]) {
      const hash = await hashPassword(password);
      await c.execute(
        "INSERT IGNORE INTO users(username,full_name,role,password_hash) VALUES(?,?,?,?)",
        [username, name, role, hash],
      );
    }
    for (const [
      code,
      title,
      author,
      category,
      description,
      quantity,
    ] of sampleBooks)
      await c.execute(
        "INSERT IGNORE INTO books(book_code,title,author,category,description,total_quantity,available_quantity) VALUES(?,?,?,?,?,?,?)",
        [code, title, author, category, description, quantity, quantity],
      );
  });
  console.log("Sample books and accounts seeded (existing data preserved).");
} finally {
  await pool.end();
}
