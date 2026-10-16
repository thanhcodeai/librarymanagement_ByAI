import { app } from "./app.js";
import { pool } from "./db.js";
const port = Number(process.env.PORT || 3000);
const server = app.listen(port, "0.0.0.0", (error) => {
  if (error) {
    console.error(
      JSON.stringify({ event: "STARTUP_FAILED", code: error.code }),
    );
    process.exitCode = 1;
    return;
  }
  console.log(`Library server listening on port ${port}`);
});
function shutdown() {
  server.close(async () => {
    await pool.end();
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
