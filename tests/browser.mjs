import "dotenv/config";
import { pool, transaction } from "../server/db.js";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1060 } });
let createdRequestId = null,
  createdBookId = null;
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
try {
  await page.goto(base);
  await page
    .getByRole("heading", { name: "Thật vui khi gặp lại bạn." })
    .waitFor();
  await page.screenshot({
    path: "/workspace/artifacts/library-login-desktop.png",
    fullPage: true,
  });
  await page.getByRole("textbox", { name: "Tên đăng nhập" }).fill("docgia");
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.SEED_USER_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByRole("heading", { name: "Khám phá sách." }).waitFor();
  await page.getByRole("button", { name: "Xem Nhà giả kim" }).waitFor();
  await page.screenshot({
    path: "/workspace/artifacts/library-catalog-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("textbox", { name: "Tìm sách", exact: true })
    .fill("Nhà giả kim");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Xem Nhà giả kim" }).click();
  await page.getByRole("dialog").waitFor();
  await page
    .getByRole("button", { name: "Gửi yêu cầu mượn", exact: true })
    .click();
  await page.getByLabel("Ngày mượn", { exact: true }).fill("2026-10-16");
  await page.getByLabel("Ngày trả dự kiến", { exact: true }).fill("2026-10-30");
  const createdResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/borrow-requests") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Gửi yêu cầu", exact: true }).click();
  createdRequestId = (await (await createdResponse).json()).data.id;
  await page
    .getByRole("status")
    .filter({ hasText: "Đã gửi yêu cầu mượn" })
    .waitFor();
  await page.getByRole("button", { name: "Sách của tôi", exact: true }).click();
  await page.getByText("Chờ duyệt", { exact: true }).last().waitFor();
  await page.screenshot({
    path: "/workspace/artifacts/library-history-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Khám phá sách", exact: true })
    .click();
  await page.getByRole("button", { name: "Xem Nhà giả kim" }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "/workspace/artifacts/library-reader-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.setViewportSize({ width: 1440, height: 1060 });
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await page.getByRole("textbox", { name: "Tên đăng nhập" }).fill("admin");
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.SEED_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.getByRole("heading", { name: "Tổng quan thư viện." }).waitFor();
  await page.screenshot({
    path: "/workspace/artifacts/library-admin-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Yêu cầu mượn", exact: true }).click();
  await page
    .getByRole("button", { name: "Duyệt", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Ghi chú cho độc giả (tùy chọn)")
    .fill("Bạn có thể đến thư viện nhận sách.");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Đã xử lý" }).waitFor();
  await page.getByRole("button", { name: "Quản lý sách", exact: true }).click();
  await page
    .getByRole("button", { name: "Thêm sách mới", exact: true })
    .click();
  await page.getByLabel("Mã sách", { exact: true }).fill("UI-" + Date.now());
  await page
    .getByLabel("Tên sách", { exact: true })
    .fill("Sách kiểm thử giao diện");
  await page.getByLabel("Tác giả", { exact: true }).fill("QA");
  const bookResponse = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/admin/books") &&
      r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  createdBookId = (await (await bookResponse).json()).data.id;
  await page
    .getByRole("status")
    .filter({ hasText: "Đã lưu thông tin sách" })
    .waitFor();
  await page
    .getByRole("button", { name: "Xóa Sách kiểm thử giao diện", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận xóa", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Đã xóa dữ liệu" })
    .waitFor();
  await page.getByRole("button", { name: "Người dùng", exact: true }).click();
  await page.getByRole("heading", { name: "Quản lý người dùng." }).waitFor();
  await page
    .getByRole("button", { name: "Khám phá sách", exact: true })
    .click();
  await page.getByRole("button", { name: "Xem Nhà giả kim" }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await page.screenshot({
    path: "/workspace/artifacts/library-catalog-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "No page overflow at mobile width",
  );
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await page.getByRole("button", { name: "Quản lý sách", exact: true }).click();
  await page.getByRole("button", { name: "Hồ sơ", exact: true }).click();
  await page.getByRole("heading", { name: "Hồ sơ cá nhân." }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: browser reader borrow, admin approve, book create/delete, users, profile, mobile layout; no browser runtime errors.",
  );
} finally {
  await browser.close();
  await transaction(async (c) => {
    if (createdRequestId) {
      const [[r]] = await c.execute(
        "SELECT * FROM borrow_requests WHERE id=? FOR UPDATE",
        [createdRequestId],
      );
      if (r) {
        if (r.status === "APPROVED")
          await c.execute(
            "UPDATE books SET available_quantity=available_quantity+1 WHERE id=?",
            [r.book_id],
          );
        await c.execute("DELETE FROM borrow_requests WHERE id=?", [r.id]);
      }
    }
    if (createdBookId)
      await c.execute("DELETE FROM books WHERE id=?", [createdBookId]);
  });
  await pool.end();
}
