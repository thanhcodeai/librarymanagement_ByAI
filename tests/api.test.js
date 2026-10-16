import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomBytes } from "node:crypto";
import { app } from "../server/app.js";
import { pool } from "../server/db.js";
import { hashPassword } from "../server/security.js";
if (!process.env.DB_NAME?.endsWith("_test"))
  throw Error("Tests require a separate DB_NAME ending in _test.");
const tag = "test_" + randomBytes(5).toString("hex"),
  pass = randomBytes(16).toString("hex");
const admin = request.agent(app),
  user = request.agent(app),
  other = request.agent(app);
let bookId, requestId, userId, adminId;
const data = (r) => r.body.data;
after(async () => {
  const c = await pool.getConnection();
  try {
    await c.query(
      "DELETE FROM borrow_requests WHERE user_id IN(SELECT id FROM users WHERE username LIKE ?)",
      [tag + "%"],
    );
    await c.query("DELETE FROM books WHERE book_code LIKE ?", [tag + "%"]);
    await c.query("DELETE FROM users WHERE username LIKE ?", [tag + "%"]);
  } finally {
    c.release();
    await pool.end();
  }
});
test("SRS functional and security acceptance against MySQL", async (t) => {
  await t.test("setup isolated accounts", async () => {
    const [r] = await pool.execute(
      "INSERT INTO users(username,full_name,password_hash,role) VALUES(?,?,?,'ADMIN')",
      [tag + "_admin", "Test admin", await hashPassword(pass)],
    );
    adminId = r.insertId;
    await admin
      .post("/api/v1/auth/login")
      .send({ username: tag + "_admin", password: pass })
      .expect(200);
  });
  await t.test("FR01 rejects role injection and missing fields", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ username: tag, fullName: "An", password: pass, role: "ADMIN" })
      .expect(400);
    await request(app)
      .post("/api/v1/auth/register")
      .send({ username: tag })
      .expect(400);
  });
  await t.test("FR01 register and duplicate", async () => {
    const r = await request(app)
      .post("/api/v1/auth/register")
      .send({ username: tag, fullName: "Độc giả thử nghiệm", password: pass })
      .expect(201);
    userId = data(r).id;
    assert.equal(data(r).role, "USER");
    assert.ok(!JSON.stringify(r.body).includes("password"));
    await request(app)
      .post("/api/v1/auth/register")
      .send({ username: tag, fullName: "An", password: pass })
      .expect(409);
    await request(app)
      .post("/api/v1/auth/register")
      .send({ username: tag + "_other", fullName: "Other", password: pass })
      .expect(201);
  });
  await t.test("FR02 login invalid and valid; HTTP-only cookie", async () => {
    await user
      .post("/api/v1/auth/login")
      .send({ username: tag, password: "bad" })
      .expect(401);
    await user
      .post("/api/v1/auth/login")
      .send({ username: tag + "_missing", password: pass })
      .expect(401);
    const r = await user
      .post("/api/v1/auth/login")
      .send({ username: tag, password: pass })
      .expect(200);
    assert.match(r.headers["set-cookie"][0], /HttpOnly/);
    assert.match(r.headers["set-cookie"][0], /SameSite=Strict/);
    await other
      .post("/api/v1/auth/login")
      .send({ username: tag + "_other", password: pass })
      .expect(200);
  });
  await t.test("FR06 profile and auth boundary", async () => {
    await request(app).get("/api/v1/me").expect(401);
    const r = await user.get("/api/v1/me").expect(200);
    assert.equal(data(r).id, userId);
    assert.ok(!JSON.stringify(r.body).includes("password"));
    for (const path of [
      "/admin/stats",
      "/admin/books",
      "/admin/users",
      "/admin/borrow-requests",
    ])
      await user.get("/api/v1" + path).expect(403);
  });
  const book = {
    bookCode: tag + "_book",
    title: "Kiểm thử sách",
    author: "Tác giả",
    category: "Kiểm thử",
    description: "Mô tả",
    totalQuantity: 1,
  };
  await t.test("FR10 create validate duplicate", async () => {
    await admin
      .post("/api/v1/admin/books")
      .send({ ...book, totalQuantity: -1 })
      .expect(400);
    await admin
      .post("/api/v1/admin/books")
      .send({ ...book, availableQuantity: 2 })
      .expect(400);
    const r = await admin.post("/api/v1/admin/books").send(book).expect(201);
    bookId = data(r).id;
    await admin.post("/api/v1/admin/books").send(book).expect(409);
  });
  await t.test("FR03/04 search pagination detail and unknown", async () => {
    await request(app).get("/api/v1/books").expect(401);
    const r = await user.get("/api/v1/books?q=" + tag).expect(200);
    assert.equal(data(r).total, 1);
    await user.get("/api/v1/books?page=0").expect(400);
    const empty = await user
      .get("/api/v1/books?q=" + tag + "_noresult")
      .expect(200);
    assert.deepEqual(data(empty).items, []);
    await user.get("/api/v1/books/" + bookId).expect(200);
    await user.get("/api/v1/books/2147483647").expect(404);
    await user.get("/api/v1/books/not-id").expect(400);
  });
  const dates = { borrowDate: "2026-10-16", dueDate: "2026-10-30" };
  await t.test("FR05 invalid dates spoofing and unknown book", async () => {
    for (const dueDate of ["2026-10-16", "2026-10-15", "2026-02-30"])
      await user
        .post("/api/v1/borrow-requests")
        .send({ bookId, ...dates, dueDate })
        .expect(400);
    await user
      .post("/api/v1/borrow-requests")
      .send({ bookId, ...dates, userId: adminId })
      .expect(400);
    await user
      .post("/api/v1/borrow-requests")
      .send({ bookId: 2147483647, ...dates })
      .expect(404);
  });
  await t.test(
    "FR05 pending creation does not reduce inventory; duplicate blocked",
    async () => {
      const r = await user
        .post("/api/v1/borrow-requests")
        .send({ bookId, ...dates })
        .expect(201);
      requestId = data(r).id;
      assert.equal(data(r).status, "PENDING");
      const b = await user.get("/api/v1/books/" + bookId);
      assert.equal(data(b).availableQuantity, 1);
      await user
        .post("/api/v1/borrow-requests")
        .send({ bookId, ...dates })
        .expect(409);
    },
  );
  await t.test("FR07 own history and filters", async () => {
    const mine = await user
      .get("/api/v1/me/borrow-requests?userId=" + adminId)
      .expect(200);
    assert.equal(data(mine).items[0].user.id, userId);
    const theirs = await other.get("/api/v1/me/borrow-requests").expect(200);
    assert.equal(data(theirs).total, 0);
    await user.get("/api/v1/me/borrow-requests?status=INVALID").expect(400);
  });
  await t.test(
    "FR11 concurrent approval same request decrements once",
    async () => {
      const rs = await Promise.all(
        [1, 2].map(() =>
          admin
            .patch("/api/v1/admin/borrow-requests/" + requestId)
            .send({ decision: "APPROVE" }),
        ),
      );
      assert.deepEqual(rs.map((r) => r.status).sort(), [200, 409]);
      const b = await user.get("/api/v1/books/" + bookId);
      assert.equal(data(b).availableQuantity, 0);
    },
  );
  await t.test(
    "FR11 out-of-stock rollback, deny unchanged and terminal reject",
    async () => {
      const r = await other
        .post("/api/v1/borrow-requests")
        .send({ bookId, ...dates })
        .expect(201);
      const rid = data(r).id;
      await admin
        .patch("/api/v1/admin/borrow-requests/" + rid)
        .send({ decision: "APPROVE" })
        .expect(409);
      const [[row]] = await pool.execute(
        "SELECT status FROM borrow_requests WHERE id=?",
        [rid],
      );
      assert.equal(row.status, "PENDING");
      await admin
        .patch("/api/v1/admin/borrow-requests/" + rid)
        .send({ decision: "DENY", note: "Hết sách" })
        .expect(200);
      await admin
        .patch("/api/v1/admin/borrow-requests/" + rid)
        .send({ decision: "DENY" })
        .expect(409);
      const b = await user.get("/api/v1/books/" + bookId);
      assert.equal(data(b).availableQuantity, 0);
    },
  );
  await t.test(
    "FR11 competing requests for last copy and forced DB rollback",
    async () => {
      const b = await admin
        .post("/api/v1/admin/books")
        .send({ ...book, bookCode: tag + "_race" })
        .expect(201);
      const bid = data(b).id;
      const ra = await user
        .post("/api/v1/borrow-requests")
        .send({ bookId: bid, ...dates })
        .expect(201);
      const rb = await other
        .post("/api/v1/borrow-requests")
        .send({ bookId: bid, ...dates })
        .expect(201);
      const results = await Promise.all(
        [data(ra).id, data(rb).id].map((rid) =>
          admin
            .patch("/api/v1/admin/borrow-requests/" + rid)
            .send({ decision: "APPROVE" }),
        ),
      );
      assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
      const b2 = await admin
        .post("/api/v1/admin/books")
        .send({ ...book, bookCode: tag + "_rollback" })
        .expect(201);
      const bid2 = data(b2).id;
      const r = await user
        .post("/api/v1/borrow-requests")
        .send({ bookId: bid2, ...dates })
        .expect(201);
      const rid = data(r).id;
      const original = pool.getConnection;
      pool.getConnection = async () => {
        const c = await original.call(pool);
        return new Proxy(c, {
          get(target, key) {
            if (key === "execute")
              return async (sql, args) => {
                if (
                  sql.startsWith("INSERT INTO audit_logs") &&
                  args[1] === "BORROW_APPROVED" &&
                  args[3] === String(rid)
                )
                  throw Error("Simulated audit write failure");
                return target.execute(sql, args);
              };
            const value = target[key];
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
      };
      try {
        await admin
          .patch("/api/v1/admin/borrow-requests/" + rid)
          .send({ decision: "APPROVE" })
          .expect(500);
        const [[stored]] = await pool.execute(
          "SELECT status FROM borrow_requests WHERE id=?",
          [rid],
        );
        assert.equal(stored.status, "PENDING");
        const [[inventory]] = await pool.execute(
          "SELECT available_quantity FROM books WHERE id=?",
          [bid2],
        );
        assert.equal(inventory.available_quantity, 1);
      } finally {
        pool.getConnection = original;
      }
    },
  );
  await t.test(
    "FR10 update stock preserves approved loans and FK delete",
    async () => {
      await admin
        .put("/api/v1/admin/books/" + bookId)
        .send({ ...book, totalQuantity: 0 })
        .expect(409);
      const r = await admin
        .put("/api/v1/admin/books/" + bookId)
        .send({ ...book, totalQuantity: 3 })
        .expect(200);
      assert.equal(data(r).availableQuantity, 2);
      await admin.delete("/api/v1/admin/books/" + bookId).expect(409);
      const fresh = await admin
        .post("/api/v1/admin/books")
        .send({ ...book, bookCode: tag + "_delete" })
        .expect(201);
      await admin.delete("/api/v1/admin/books/" + data(fresh).id).expect(204);
    },
  );
  await t.test(
    "FR12 user CRUD duplicate, history restrictions and self protection",
    async () => {
      const d = {
        username: tag + "_new",
        fullName: "New user",
        password: pass,
        role: "USER",
        email: tag + "@example.com",
      };
      const r = await admin.post("/api/v1/admin/users").send(d).expect(201);
      const uid = data(r).id;
      await admin.post("/api/v1/admin/users").send(d).expect(409);
      await admin
        .put("/api/v1/admin/users/" + uid)
        .send({ ...d, fullName: "Updated" })
        .expect(200);
      await admin.get("/api/v1/admin/users?q=" + tag).expect(200);
      await admin.delete("/api/v1/admin/users/" + uid).expect(204);
      await admin.delete("/api/v1/admin/users/" + userId).expect(409);
      await admin.delete("/api/v1/admin/users/" + adminId).expect(409);
    },
  );
  await t.test("FR09 actual database totals and audit", async () => {
    const r = await admin.get("/api/v1/admin/stats").expect(200);
    const [[counts]] = await pool.query("SELECT COUNT(*) total FROM books");
    assert.equal(data(r).totalBooks, counts.total);
    const [[a]] = await pool.execute(
      "SELECT COUNT(*) total FROM audit_logs WHERE entity_id=? AND event_type='BORROW_APPROVED'",
      [String(requestId)],
    );
    assert.equal(a.total, 1);
  });
  await t.test("CSRF origin rejection and no stack leaks", async () => {
    await user
      .post("/api/v1/borrow-requests")
      .set("Origin", "https://evil.example")
      .send({ bookId, ...dates })
      .expect(403);
    const r = await user.get("/api/v1/books/invalid").expect(400);
    assert.ok(r.body.requestId);
    assert.ok(!JSON.stringify(r.body).includes("stack"));
  });
  await t.test("FR08 logout immediately invalidates session", async () => {
    await user.post("/api/v1/auth/logout").expect(204);
    await user.get("/api/v1/me").expect(401);
  });
});
