// src/config/createTables.js
import pool from "./db.js";

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) NOT NULL DEFAULT 'volunteer',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        location VARCHAR(200),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(20) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        registration_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
        registration_status VARCHAR(20) DEFAULT 'pending',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Announcements table
    await pool.query(`
      CREATE TABLE announcements (
       announcement_id SERIAL PRIMARY KEY,
       event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
       title VARCHAR(255) NOT NULL,
       message TEXT NOT NULL,
       visibility VARCHAR(20) CHECK (visibility IN ('public', 'registered')) DEFAULT 'public',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
};

createTables();