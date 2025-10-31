import pool from "../config/db.js";

// ✅ Create announcement
export const createAnnouncement = async (req, res) => {
  const { event_id, title, content, visibility } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO announcements (event_id, title, content, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [event_id, title, content, visibility]
    );

    res.status(201).json({
      message: "Announcement created successfully",
      announcement: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating announcement:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all announcements (filter by visibility or role)
export const getAnnouncements = async (req, res) => {
  const userRole = req.user?.role || "public";
  const filter = req.query.filter || "all";

  try {
    let query = `
      SELECT a.*, e.title AS event_title
      FROM announcements a
      LEFT JOIN events e ON e.event_id = a.event_id
    `;

    // 🧮 Filtering logic
    if (userRole === "admin") {
      if (filter === "registered") query += ` WHERE a.visibility = 'registered'`;
      else if (filter === "private") query += ` WHERE a.visibility = 'private'`;
      // "all" → show everything for admin
    } else {
      // For volunteers/public users
      if (filter === "registered") query += ` WHERE a.visibility = 'registered'`;
      else if (filter === "all") query += ` WHERE a.visibility IN ('public', 'registered')`;
      else if (filter === "private") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    query += " ORDER BY a.created_at DESC";

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching announcements:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get announcements for a specific event
export const getAnnouncementsByEvent = async (req, res) => {
  const { event_id } = req.params;
  const userRole = req.user?.role || "public";

  try {
    let query = `
      SELECT *
      FROM announcements
      WHERE event_id = $1
    `;

    if (userRole !== "admin") {
      query += ` AND visibility IN ('public', 'registered')`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, [event_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching event announcements:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update announcement
export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, visibility } = req.body;

  try {
    const result = await pool.query(
      `UPDATE announcements
       SET title = $1, content = $2, visibility = $3, updated_at = NOW()
       WHERE announcement_id = $4 RETURNING *`,
      [title, content, visibility, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Announcement not found" });

    res.json({
      message: "Announcement updated successfully",
      announcement: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating announcement:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete announcement
export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM announcements WHERE announcement_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Announcement not found" });

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting announcement:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
