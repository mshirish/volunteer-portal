import pool from "../config/db.js";

// 🟢 Create Event (Admin only)
export const createEvent = async (req, res) => {
  try {
    const { title, description, location, start_date, end_date } = req.body;

    const result = await pool.query(
      `INSERT INTO events (title, description, location, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, location, start_date, end_date]
    );

    res.status(201).json({
      message: "Event created successfully",
      event: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error creating event:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY start_date ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching events:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Get Single Event
export const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM events WHERE event_id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Event not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching event:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Update Event (Admin only)
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, location, start_date, end_date, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events
       SET title = $1, description = $2, location = $3,
           start_date = $4, end_date = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       WHERE event_id = $7
       RETURNING *`,
      [title, description, location, start_date, end_date, status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event updated successfully", event: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating event:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Delete Event (Admin only)
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM events WHERE event_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting event:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
