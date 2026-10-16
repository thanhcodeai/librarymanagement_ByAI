import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { pool, transaction } from "./db.js";
import { hashPassword, verifyPassword, tokenHash } from "./security.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.set("X-Request-Id", req.requestId);
  next();
});
app.use(express.json({ limit: "32kb" }));
function fail(status, code, message) {
  throw Object.assign(Error(message), { status, code });
}
function success(req, res, data, status = 200) {
  res
    .status(status)
    .json({ success: true, data, meta: { requestId: req.requestId } });
}
const str = (max) => z.string().trim().min(1).max(max);
const password = z
  .string()
  .min(Number(process.env.MIN_PASSWORD_LENGTH || 8))
  .max(128);
const email = z
  .union([z.email().max(254), z.literal("")])
  .optional()
  .nullable();
const userSchema = z
  .object({
    username: str(64).regex(/^[a-zA-Z0-9_.-]+$/),
    fullName: str(150),
    email,
    password,
    role: z.enum(["USER", "ADMIN"]).optional(),
  })
  .strict();
const registerSchema = userSchema.omit({ role: true });
const bookSchema = z
  .object({
    bookCode: str(50),
    title: str(255),
    author: str(255),
    category: z.string().trim().max(100).optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
    totalQuantity: z.number().int().min(0).max(1000000),
    availableQuantity: z.number().int().min(0).optional(),
  })
  .strict();
function id(value) {
  return z.coerce.number().int().positive().max(2147483647).parse(value);
}
function page(query) {
  return {
    page: z.coerce.number().int().min(1).default(1).parse(query.page),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(12)
      .parse(query.pageSize),
  };
}
function paging(items, total, p) {
  return {
    items,
    total: Number(total),
    ...p,
    totalPages: Math.ceil(Number(total) / p.pageSize),
  };
}
const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  fullName: u.full_name,
  role: u.role,
  createdAt: u.created_at,
});
const book = (b) => ({
  id: b.id,
  bookCode: b.book_code,
  title: b.title,
  author: b.author,
  category: b.category,
  description: b.description,
  totalQuantity: b.total_quantity,
  availableQuantity: b.available_quantity,
  createdAt: b.created_at,
});
async function audit(c, req, event, entity, entityId, details = {}) {
  await c.execute(
    "INSERT INTO audit_logs(actor_user_id,event_type,entity_type,entity_id,request_id,details) VALUES(?,?,?,?,?,?)",
    [
      req.user?.id || null,
      event,
      entity,
      String(entityId),
      req.requestId,
      JSON.stringify(details),
    ],
  );
}
function cookieToken(req) {
  const match = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("library_session="));
  return match?.slice(16);
}
async function auth(req, res, next) {
  const token = cookieToken(req);
  if (!token) fail(401, "UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục.");
  const [rows] = await pool.execute(
    "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()",
    [tokenHash(token)],
  );
  if (!rows[0]) fail(401, "UNAUTHENTICATED", "Phiên đăng nhập đã hết hạn.");
  req.user = rows[0];
  next();
}
function admin(req, res, next) {
  if (req.user.role !== "ADMIN")
    fail(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
  next();
}
function reader(req, res, next) {
  if (req.user.role !== "USER")
    fail(403, "FORBIDDEN", "Chức năng này dành cho độc giả.");
  next();
}
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  const origin = req.headers.origin;
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && origin) {
    try {
      if (new URL(origin).host !== req.headers.host)
        fail(403, "ORIGIN_REJECTED", "Nguồn yêu cầu không hợp lệ.");
    } catch (e) {
      if (e.status) throw e;
      fail(403, "ORIGIN_REJECTED", "Nguồn yêu cầu không hợp lệ.");
    }
  }
  next();
});
app.get("/api/v1/health", async (req, res) => {
  await pool.query("SELECT 1");
  success(req, res, { status: "ok" });
});
app.use(
  "/api/v1/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Quá nhiều lần thử. Vui lòng thử lại sau.",
        },
        requestId: req.requestId,
      }),
  }),
);
app.post("/api/v1/auth/register", async (req, res) => {
  const d = registerSchema.parse(req.body);
  const hash = await hashPassword(d.password);
  const result = await transaction(async (c) => {
    const [r] = await c.execute(
      "INSERT INTO users(username,full_name,email,password_hash,role) VALUES(?,?,?,?,'USER')",
      [d.username, d.fullName, d.email || null, hash],
    );
    await audit(c, req, "USER_REGISTER", "USER", r.insertId);
    return r.insertId;
  });
  const [[u]] = await pool.execute("SELECT * FROM users WHERE id=?", [result]);
  success(req, res, publicUser(u), 201);
});
app.post("/api/v1/auth/login", async (req, res) => {
  const d = z
    .object({ username: str(254), password: z.string().min(1).max(128) })
    .strict()
    .parse(req.body);
  const [[u]] = await pool.execute(
    "SELECT * FROM users WHERE username=? OR email=? LIMIT 1",
    [d.username, d.username],
  );
  const valid = await verifyPassword(
    d.password,
    u?.password_hash ||
      "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  );
  if (!u || !valid)
    fail(401, "INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không đúng.");
  const token = randomBytes(32).toString("hex");
  const hours = Number(process.env.SESSION_HOURS || 8);
  await transaction(async (c) => {
    await c.execute("DELETE FROM sessions WHERE expires_at<=UTC_TIMESTAMP()");
    await c.execute(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
      [tokenHash(token), u.id, new Date(Date.now() + hours * 3600000)],
    );
    await audit(c, { ...req, user: u }, "LOGIN_SUCCESS", "USER", u.id);
  });
  res.cookie("library_session", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: hours * 3600000,
    path: "/",
  });
  success(req, res, { user: publicUser(u) });
});
app.post("/api/v1/auth/logout", async (req, res) => {
  const t = cookieToken(req);
  if (t)
    await pool.execute("DELETE FROM sessions WHERE token_hash=?", [
      tokenHash(t),
    ]);
  res.clearCookie("library_session", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.sendStatus(204);
});
app.use("/api/v1", auth);
app.get("/api/v1/me", (req, res) => success(req, res, publicUser(req.user)));
async function listBooks(req, res) {
  const p = page(req.query);
  const q = z.string().max(255).default("").parse(req.query.q);
  const category = z.string().max(100).default("").parse(req.query.category);
  const sort = z
    .enum(["newest", "title", "available"])
    .default("newest")
    .parse(req.query.sort);
  const where =
    " WHERE (title LIKE ? OR author LIKE ? OR book_code LIKE ?)" +
    (category ? " AND category=?" : "");
  const params = [
    `%${q}%`,
    `%${q}%`,
    `%${q}%`,
    ...(category ? [category] : []),
  ];
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) total FROM books" + where,
    params,
  );
  const [rows] = await pool.query(
    "SELECT * FROM books" +
      where +
      " ORDER BY " +
      {
        newest: "id DESC",
        title: "title ASC",
        available: "available_quantity DESC,id DESC",
      }[sort] +
      " LIMIT ? OFFSET ?",
    [...params, p.pageSize, (p.page - 1) * p.pageSize],
  );
  const [categories] = await pool.query(
    "SELECT DISTINCT category FROM books WHERE category IS NOT NULL AND category<>'' ORDER BY category",
  );
  success(req, res, {
    ...paging(rows.map(book), total, p),
    categories: categories.map((c) => c.category),
  });
}
app.get("/api/v1/books", listBooks);
app.get("/api/v1/books/:id", async (req, res) => {
  const [[b]] = await pool.execute("SELECT * FROM books WHERE id=?", [
    id(req.params.id),
  ]);
  if (!b) fail(404, "BOOK_NOT_FOUND", "Không tìm thấy sách.");
  success(req, res, book(b));
});
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    "Ngày không hợp lệ",
  );
app.post("/api/v1/borrow-requests", reader, async (req, res) => {
  const d = z
    .object({
      bookId: z.number().int().positive(),
      borrowDate: date,
      dueDate: date,
    })
    .strict()
    .parse(req.body);
  if (d.dueDate <= d.borrowDate)
    fail(400, "INVALID_DATES", "Ngày trả dự kiến phải sau ngày mượn.");
  const result = await transaction(async (c) => {
    await c.execute("SELECT id FROM users WHERE id=? FOR UPDATE", [
      req.user.id,
    ]);
    const [[b]] = await c.execute("SELECT id FROM books WHERE id=?", [
      d.bookId,
    ]);
    if (!b) fail(404, "BOOK_NOT_FOUND", "Không tìm thấy sách.");
    if (process.env.BLOCK_DUPLICATE_PENDING !== "false") {
      const [[existing]] = await c.execute(
        "SELECT id FROM borrow_requests WHERE user_id=? AND book_id=? AND status='PENDING'",
        [req.user.id, d.bookId],
      );
      if (existing)
        fail(
          409,
          "DUPLICATE_PENDING",
          "Bạn đã có yêu cầu chờ duyệt cho sách này.",
        );
    }
    const [r] = await c.execute(
      "INSERT INTO borrow_requests(user_id,book_id,borrow_date,due_date) VALUES(?,?,?,?)",
      [req.user.id, d.bookId, d.borrowDate, d.dueDate],
    );
    await audit(c, req, "BORROW_CREATE", "BORROW_REQUEST", r.insertId);
    return { id: r.insertId, ...d, status: "PENDING" };
  });
  success(req, res, result, 201);
});
async function listRequests(req, res, own = false) {
  const p = page(req.query);
  const status = z
    .enum(["PENDING", "APPROVED", "DENIED", ""])
    .default("")
    .parse(req.query.status);
  const conditions = [];
  const params = [];
  if (own) {
    conditions.push("r.user_id=?");
    params.push(req.user.id);
  }
  if (status) {
    conditions.push("r.status=?");
    params.push(status);
  }
  const where = conditions.length ? " WHERE " + conditions.join(" AND ") : "";
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) total FROM borrow_requests r" + where,
    params,
  );
  const [rows] = await pool.query(
    "SELECT r.*,b.title,b.book_code,u.full_name,u.username FROM borrow_requests r JOIN books b ON b.id=r.book_id JOIN users u ON u.id=r.user_id" +
      where +
      " ORDER BY r.id DESC LIMIT ? OFFSET ?",
    [...params, p.pageSize, (p.page - 1) * p.pageSize],
  );
  success(
    req,
    res,
    paging(
      rows.map((r) => ({
        id: r.id,
        book: { id: r.book_id, title: r.title, bookCode: r.book_code },
        user: { id: r.user_id, fullName: r.full_name, username: r.username },
        borrowDate: r.borrow_date,
        dueDate: r.due_date,
        status: r.status,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        decisionNote: r.decision_note,
        createdAt: r.created_at,
      })),
      total,
      p,
    ),
  );
}
app.get("/api/v1/me/borrow-requests", (req, res) =>
  listRequests(req, res, true),
);
app.use("/api/v1/admin", admin);
app.get("/api/v1/admin/stats", async (req, res) => {
  const [[b]] = await pool.query(
    "SELECT COUNT(*) totalBooks,COALESCE(SUM(total_quantity),0) totalCopies,COALESCE(SUM(available_quantity),0) availableCopies FROM books",
  );
  const [[u]] = await pool.query(
    "SELECT COUNT(*) totalUsers FROM users WHERE role='USER'",
  );
  const [[r]] = await pool.query(
    "SELECT COUNT(*) totalRequests,COALESCE(SUM(status='PENDING'),0) pending,COALESCE(SUM(status='APPROVED'),0) approved,COALESCE(SUM(status='DENIED'),0) denied FROM borrow_requests",
  );
  success(req, res, { ...b, ...u, ...r });
});
app.get("/api/v1/admin/books", listBooks);
app.post("/api/v1/admin/books", async (req, res) => {
  const d = bookSchema.parse(req.body);
  const available = d.availableQuantity ?? d.totalQuantity;
  if (available > d.totalQuantity)
    fail(
      400,
      "INVALID_QUANTITY",
      "Số lượng có sẵn không được vượt tổng số lượng.",
    );
  const result = await transaction(async (c) => {
    const [r] = await c.execute(
      "INSERT INTO books(book_code,title,author,category,description,total_quantity,available_quantity) VALUES(?,?,?,?,?,?,?)",
      [
        d.bookCode,
        d.title,
        d.author,
        d.category || null,
        d.description || null,
        d.totalQuantity,
        available,
      ],
    );
    await audit(c, req, "BOOK_CREATE", "BOOK", r.insertId);
    return r.insertId;
  });
  const [[b]] = await pool.execute("SELECT * FROM books WHERE id=?", [result]);
  success(req, res, book(b), 201);
});
app.put("/api/v1/admin/books/:id", async (req, res) => {
  const bookId = id(req.params.id),
    d = bookSchema.parse(req.body);
  await transaction(async (c) => {
    const [[b]] = await c.execute("SELECT * FROM books WHERE id=? FOR UPDATE", [
      bookId,
    ]);
    if (!b) fail(404, "BOOK_NOT_FOUND", "Không tìm thấy sách.");
    const onLoan = b.total_quantity - b.available_quantity;
    const available = d.totalQuantity - onLoan;
    if (available < 0)
      fail(
        409,
        "QUANTITY_CONFLICT",
        "Tổng số lượng không được thấp hơn số cuốn đang được mượn.",
      );
    if (d.availableQuantity !== undefined && d.availableQuantity !== available)
      fail(
        409,
        "QUANTITY_CONFLICT",
        "Số lượng có sẵn do hệ thống tính theo số cuốn đang được mượn.",
      );
    await c.execute(
      "UPDATE books SET book_code=?,title=?,author=?,category=?,description=?,total_quantity=?,available_quantity=? WHERE id=?",
      [
        d.bookCode,
        d.title,
        d.author,
        d.category || null,
        d.description || null,
        d.totalQuantity,
        available,
        bookId,
      ],
    );
    await audit(c, req, "BOOK_UPDATE", "BOOK", bookId);
  });
  const [[b]] = await pool.execute("SELECT * FROM books WHERE id=?", [bookId]);
  success(req, res, book(b));
});
app.delete("/api/v1/admin/books/:id", async (req, res) => {
  const bookId = id(req.params.id);
  await transaction(async (c) => {
    const [r] = await c.execute("DELETE FROM books WHERE id=?", [bookId]);
    if (!r.affectedRows) fail(404, "BOOK_NOT_FOUND", "Không tìm thấy sách.");
    await audit(c, req, "BOOK_DELETE", "BOOK", bookId);
  });
  res.sendStatus(204);
});
app.get("/api/v1/admin/borrow-requests", (req, res) => listRequests(req, res));
app.patch("/api/v1/admin/borrow-requests/:id", async (req, res) => {
  const requestId = id(req.params.id);
  const d = z
    .object({
      decision: z.enum(["APPROVE", "DENY"]),
      note: z.string().trim().max(500).optional(),
    })
    .strict()
    .parse(req.body);
  const result = await transaction(async (c) => {
    const [[r]] = await c.execute(
      "SELECT * FROM borrow_requests WHERE id=? FOR UPDATE",
      [requestId],
    );
    if (!r) fail(404, "REQUEST_NOT_FOUND", "Không tìm thấy yêu cầu.");
    if (r.status !== "PENDING")
      fail(
        409,
        "BORROW_REQUEST_ALREADY_PROCESSED",
        "Yêu cầu mượn đã được xử lý.",
      );
    const [[b]] = await c.execute("SELECT * FROM books WHERE id=? FOR UPDATE", [
      r.book_id,
    ]);
    if (d.decision === "APPROVE") {
      if (b.available_quantity < 1)
        fail(
          409,
          "OUT_OF_STOCK",
          "Sách đã hết. Yêu cầu vẫn được giữ chờ duyệt.",
        );
      const [changed] = await c.execute(
        "UPDATE books SET available_quantity=available_quantity-1 WHERE id=? AND available_quantity>0",
        [b.id],
      );
      if (changed.affectedRows !== 1)
        fail(409, "QUANTITY_CONFLICT", "Số lượng sách vừa thay đổi.");
    }
    const status = d.decision === "APPROVE" ? "APPROVED" : "DENIED";
    await c.execute(
      "UPDATE borrow_requests SET status=?,reviewed_by=?,reviewed_at=UTC_TIMESTAMP(),decision_note=? WHERE id=?",
      [status, req.user.id, d.note || null, requestId],
    );
    await audit(c, req, "BORROW_" + status, "BORROW_REQUEST", requestId);
    return { id: requestId, status, reviewedBy: req.user.id };
  });
  success(req, res, result);
});
app.get("/api/v1/admin/users", async (req, res) => {
  const p = page(req.query),
    q = z.string().max(255).default("").parse(req.query.q);
  const args = [`%${q}%`, `%${q}%`];
  const where = " WHERE username LIKE ? OR full_name LIKE ?";
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) total FROM users" + where,
    args,
  );
  const [rows] = await pool.query(
    "SELECT * FROM users" + where + " ORDER BY id DESC LIMIT ? OFFSET ?",
    [...args, p.pageSize, (p.page - 1) * p.pageSize],
  );
  success(req, res, paging(rows.map(publicUser), total, p));
});
app.post("/api/v1/admin/users", async (req, res) => {
  const d = userSchema.parse(req.body);
  const hash = await hashPassword(d.password);
  const userId = await transaction(async (c) => {
    const [r] = await c.execute(
      "INSERT INTO users(username,full_name,email,password_hash,role) VALUES(?,?,?,?,?)",
      [d.username, d.fullName, d.email || null, hash, d.role || "USER"],
    );
    await audit(c, req, "USER_CREATE", "USER", r.insertId);
    return r.insertId;
  });
  const [[u]] = await pool.execute("SELECT * FROM users WHERE id=?", [userId]);
  success(req, res, publicUser(u), 201);
});
app.put("/api/v1/admin/users/:id", async (req, res) => {
  const userId = id(req.params.id);
  const d = userSchema
    .extend({ password: password.optional() })
    .parse(req.body);
  const hash = d.password ? await hashPassword(d.password) : null;
  await transaction(async (c) => {
    const [admins] = await c.execute(
      "SELECT id FROM users WHERE role='ADMIN' ORDER BY id FOR UPDATE",
    );
    const [[u]] = await c.execute("SELECT * FROM users WHERE id=? FOR UPDATE", [
      userId,
    ]);
    if (!u) fail(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
    if (
      u.role === "ADMIN" &&
      d.role === "USER" &&
      (userId === req.user.id || admins.length <= 1)
    )
      fail(
        409,
        "ADMIN_PROTECTED",
        "Không thể tự hạ quyền hoặc hạ quyền quản trị viên cuối cùng.",
      );
    await c.execute(
      "UPDATE users SET username=?,full_name=?,email=?,role=?,password_hash=COALESCE(?,password_hash) WHERE id=?",
      [d.username, d.fullName, d.email || null, d.role || u.role, hash, userId],
    );
    if (hash || (d.role && d.role !== u.role))
      await c.execute("DELETE FROM sessions WHERE user_id=?", [userId]);
    await audit(c, req, "USER_UPDATE", "USER", userId, {
      role: d.role || u.role,
    });
  });
  const [[u]] = await pool.execute("SELECT * FROM users WHERE id=?", [userId]);
  success(req, res, publicUser(u));
});
app.delete("/api/v1/admin/users/:id", async (req, res) => {
  const userId = id(req.params.id);
  await transaction(async (c) => {
    const [admins] = await c.execute(
      "SELECT id FROM users WHERE role='ADMIN' ORDER BY id FOR UPDATE",
    );
    if (
      userId === req.user.id ||
      (admins.length <= 1 && admins.some((a) => a.id === userId))
    )
      fail(
        409,
        "ADMIN_PROTECTED",
        "Không thể xóa chính mình hoặc quản trị viên cuối cùng.",
      );
    const [r] = await c.execute("DELETE FROM users WHERE id=?", [userId]);
    if (!r.affectedRows)
      fail(404, "USER_NOT_FOUND", "Không tìm thấy người dùng.");
    await audit(c, req, "USER_DELETE", "USER", userId);
  });
  res.sendStatus(204);
});
app.use("/api", (req, res) =>
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Không tìm thấy API." },
    requestId: req.requestId,
  }),
);
app.use(express.static(path.join(root, "dist")));
app.get("/{*path}", (req, res) =>
  res.sendFile(path.join(root, "dist/index.html")),
);
app.use((err, req, res, next) => {
  let status = err.status || 500,
    code = err.code || "INTERNAL_ERROR",
    message = err.message,
    details;
  if (err instanceof z.ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.";
    details = err.issues.map((i) => ({
      field: i.path.join("."),
      reason: i.message,
    }));
  } else if (err.code === "ER_DUP_ENTRY") {
    status = 409;
    code = "DUPLICATE";
    message = "Mã sách, tên đăng nhập hoặc email đã tồn tại.";
  } else if (err.code === "ER_ROW_IS_REFERENCED_2") {
    status = 409;
    code = "HISTORY_CONFLICT";
    message = "Không thể xóa dữ liệu đã có lịch sử mượn.";
  } else if (["ER_LOCK_DEADLOCK", "ER_LOCK_WAIT_TIMEOUT"].includes(err.code)) {
    status = 409;
    code = "CONCURRENT_CHANGE";
    message = "Dữ liệu đang được cập nhật. Vui lòng thử lại.";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    code = "INVALID_JSON";
    message = "JSON không hợp lệ.";
  } else if (status >= 500) {
    code = "INTERNAL_ERROR";
    message = "Hệ thống tạm thời gặp sự cố. Vui lòng thử lại.";
    console.error(
      JSON.stringify({ requestId: req.requestId, code: err.code || err.name }),
    );
  }
  res.status(status).json({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
    requestId: req.requestId,
  });
});
