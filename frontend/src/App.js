import React, { useState } from "react";
import "./App.css";

// ===== Login & Register Component =====
function LoginRegister({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(isLogin ? "Login successful!" : "Registration successful!");
    onLoginSuccess();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Volunteer Portal</h1>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                placeholder="Enter username"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter password"
              required
            />
          </div>
          <button className="btn-primary" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="switch-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            className="link-button"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Go to Register" : "Go to Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ===== Dashboard Component =====
function Dashboard({ onLogout }) {
  const upcomingEvents = [
    {
      title: "Assist Visiting Families at Clark University",
      date: "October 13, 2025 (Next Monday)",
      location: "Clark University Main Campus",
      description:
        "Volunteers will assist visiting parents and their children in touring the campus and learning about the university community.",
    },
    {
      title: "Community Cleanup Day",
      date: "October 20, 2025",
      location: "Main Street Park",
      description:
        "Join local residents to help clean the park and promote environmental awareness.",
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome to the Volunteer Dashboard</h1>
        <button className="btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="events-section">
        <h2>Upcoming Events</h2>
        <div className="events-list">
          {upcomingEvents.map((event, index) => (
            <div className="event-card" key={index}>
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Description:</strong> {event.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== Main App Component =====
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginRegister onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;


