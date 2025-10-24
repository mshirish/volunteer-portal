import pool from "./db.js";

(async () => {
  console.log("Attempting to connect using config:", pool.options);
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected:", res.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    process.exit();
  }
})();
