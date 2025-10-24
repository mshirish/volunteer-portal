import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";

// 🧑 Volunteer sends request
export const registerForEvent = async (req, res) => {
  const { event_id } = req.body;
  const user_id = req.user.id; // from JWT middleware

  try {
    // Check if already registered
    const existing = await pool.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND event_id = $2",
      [user_id, event_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "You already registered for this event." });
    }

    const result = await pool.query(
      "INSERT INTO registrations (user_id, event_id) VALUES ($1, $2) RETURNING *",
      [user_id, event_id]
    );

    res.status(201).json({
      message: "Registration request sent successfully.",
      registration: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 👩‍💼 Admin views all requests
export const getAllRegistrations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.registration_id, r.registration_status, r.registered_at,
             u.first_name, u.last_name, e.title
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      JOIN events e ON r.event_id = e.event_id
      ORDER BY r.registered_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin updates registration status
export const updateRegistrationStatus = async (req, res) => {
  const { registration_id } = req.params;
  const { registration_status } = req.body;

  try {
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(registration_status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const result = await pool.query(
      "UPDATE registrations SET registration_status = $1 WHERE registration_id = $2 RETURNING *",
      [registration_status, registration_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Registration not found" });
    }

    const registration = result.rows[0];

    // ✅ Fetch volunteer email
    const userResult = await pool.query(
      "SELECT email, first_name FROM users WHERE user_id = $1",
      [registration.user_id]
    );

    if (userResult.rows.length > 0) {
      const { email, first_name } = userResult.rows[0];

      const subject =
        registration_status === "approved"
          ? "Your Volunteer Registration is Approved 🎉"
          : "Your Volunteer Registration was Declined ❌";

      const message =
        registration_status === "approved"
          ? `Hi ${first_name}, your volunteer registration request has been approved. Welcome aboard!`
          : `Hi ${first_name}, unfortunately, your volunteer registration request was declined.`;

      // ✅ Send email
      await sendEmail(email, subject, message);
    }

    res.json({
      message: `Registration ${registration_status} successfully.`,
      registration,
    });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
