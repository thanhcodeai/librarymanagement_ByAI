import { pool } from "./db.js";
import { readFile } from "node:fs/promises";
try {
  const sql = await readFile(
    new URL("../db/001_initial.sql", import.meta.url),
    "utf8",
  );
  for (const statement of sql.split(";").filter((s) => s.trim()))
    await pool.query(statement);
  console.log("Schema ready");
} finally {
  await pool.end();
}
