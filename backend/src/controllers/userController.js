import pool from "../config/db.js";
import bcrypt from "bcrypt";

// ✅ Get user profile (self)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT user_id, first_name, last_name, email, phone, role, status, created_at, updated_at FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update user profile (self)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING user_id, first_name, last_name, email, phone, updated_at;`,
      [first_name, last_name, phone, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Change password
export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;

  try {
    // Check existing password
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [userId]
    );

    if (userResult.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password_hash
    );
    if (!validPassword)
      return res.status(400).json({ message: "Old password is incorrect" });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
      [newHash, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error changing password:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
