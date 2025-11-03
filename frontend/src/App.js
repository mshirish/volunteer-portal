import React, { useEffect, useState } from "react";

// -------------------- Styles --------------------
const styles = {
  app: { fontFamily: "Arial, Helvetica, sans-serif", padding: 16, maxWidth: 1000, margin: "0 auto" },
  card: { background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", marginBottom: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  btn: { padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
  primary: { background: "#2563eb", color: "#fff" },
  secondary: { background: "#e5e7eb", color: "#111" },
  danger: { background: "#ef4444", color: "#fff" },
  field: { display: "flex", flexDirection: "column", marginBottom: 8 },
  input: { padding: 8, borderRadius: 6, border: "1px solid #d1d5db" },
  error: { color: "#ef4444", fontSize: 12 }
};

// -------------------- Helpers --------------------
const uid = () => Math.random().toString(36).slice(2, 9);
const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

// Seed mock events
function seedMockEvents() {
  const existing = storage.get("events", null);
  if (existing) return;
  const events = [
    { id: "e1", title: "Assist Visiting Families at Clark University", date: "2025-10-13", type: "indoor", location: "Clark University Main Campus", description: "Help show visiting parents and kids around campus.", slots: 10 },
    { id: "e2", title: "Community Cleanup Day", date: "2025-10-20", type: "outdoor", location: "Main Street Park", description: "Park cleanup and environmental awareness.", slots: 25 },
    { id: "e3", title: "Food Pantry Support", date: "2025-11-05", type: "indoor", location: "Community Center", description: "Sorting and packing food donations.", slots: 15 }
  ];
  storage.set("events", events);
}

// -------------------- Auth Hook --------------------
function useAuth() {
  const [user, setUser] = useState(storage.get("sessionUser", null));

  useEffect(() => { storage.set("sessionUser", user); }, [user]);

  function register({ username, email, password }) {
    const users = storage.get("users", []);
    if (users.find(u => u.email === email)) throw new Error("Email already registered");
    const newUser = { id: uid(), username, email, password, profile: { name: username, phone: "", age: "", contact: "" } };
    users.push(newUser);
    storage.set("users", users);
    setUser({ id: newUser.id, email: newUser.email });
    return newUser;
  }

  function login({ email, password }) {
    const users = storage.get("users", []);
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    setUser({ id: found.id, email: found.email });
    return found;
  }

  function logout() { setUser(null); }

  function updateProfile(profile) {
    if (!user) return;
    const users = storage.get("users", []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx].profile = { ...users[idx].profile, ...profile };
    storage.set("users", users);
    setUser({ id: users[idx].id, email: users[idx].email });
  }

  function resetPassword(email, newPassword) {
    const users = storage.get("users", []);
    const idx = users.findIndex(u => u.email === email);
    if (idx === -1) throw new Error("No account with that email");
    users[idx].password = newPassword;
    storage.set("users", users);
    return true;
  }

  function getCurrentFullUser() {
    if (!user) return null;
    const users = storage.get("users", []);
    return users.find(u => u.id === user.id) || null;
  }

  return { user, register, login, logout, updateProfile, resetPassword, getCurrentFullUser };
}

// -------------------- Notifications --------------------
function Notifications({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;
  return (
    <div style={{ position: "fixed", right: 20, top: 20, width: 320, zIndex: 9999 }}>
      {notifications.map(n => (
        <div key={n.id} style={{ ...styles.card, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{n.title}</strong>
            <button style={{ ...styles.btn }} onClick={() => onDismiss(n.id)}>✕</button>
          </div>
          <div style={{ fontSize: 13 }}>{n.message}</div>
        </div>
      ))}
    </div>
  );
}

// -------------------- App --------------------
export default function App() {
  seedMockEvents();
  const auth = useAuth();
  const [view, setView] = useState(auth.user ? "dashboard" : "auth");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const events = storage.get("events", []);
    const today = new Date();
    const soon = events.filter(ev => {
      const d = new Date(ev.date + "T00:00:00");
      const diff = (d - today) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 14;
    });
    const notes = soon.map(ev => ({ id: uid(), title: "Upcoming Event: " + ev.title, message: `Date: ${ev.date} — Location: ${ev.location}` }));
    setNotifications(notes);
  }, []);

  function dismissNotification(id) { setNotifications(prev => prev.filter(p => p.id !== id)); }
  function handleLogin() { setView("dashboard"); }
  function handleLogout() { auth.logout(); setView("auth"); }

  return (
    <div style={styles.app}>
      <Notifications notifications={notifications} onDismiss={dismissNotification} />

      <div style={{ ...styles.card }}>
        <div style={styles.header}>
          <h2>Volunteer Portal</h2>
          <div>
            {auth.user && <button style={{ ...styles.btn, ...styles.secondary, marginRight: 8 }} onClick={() => setView("profile")}>Profile</button>}
            {auth.user && <button style={{ ...styles.btn, ...styles.secondary, marginRight: 8 }} onClick={() => setView("registerEvent")}>Register</button>}
            {auth.user && <button style={{ ...styles.btn, ...styles.secondary, marginRight: 8 }} onClick={() => setView("applications")}>My Applications</button>}
            {auth.user ? (
              <button style={{ ...styles.btn, ...styles.danger }} onClick={handleLogout}>Logout</button>
            ) : (
              <button style={{ ...styles.btn, ...styles.primary }} onClick={() => setView("auth")}>Login / Register</button>
            )}
          </div>
        </div>

        <div>
          {view === "auth" && <AuthView auth={auth} onLoginSuccess={handleLogin} />}
          {view === "dashboard" && <DashboardView auth={auth} />}
          {view === "profile" && <ProfileView auth={auth} onBack={() => setView("dashboard")} />}
          {view === "registerEvent" && <EventRegistrationView auth={auth} onBack={() => setView("dashboard")} addNotification={(n) => setNotifications(prev => [n, ...prev])} />}
          {view === "applications" && <ApplicationsView auth={auth} />}
        </div>
      </div>
    </div>
  );
}

// -------------------- Auth View --------------------
function AuthView({ auth, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        auth.login({ email: form.email, password: form.password });
        onLoginSuccess();
      } else {
        if (!form.username) throw new Error("请输入用户名");
        auth.register({ username: form.username, email: form.email, password: form.password });
        onLoginSuccess();
      }
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h3>{isLogin ? "Login" : "Register"}</h3>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={styles.field}>
            <label>Username</label>
            <input style={styles.input} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
        )}
        <div style={styles.field}>
          <label>Email</label>
          <input style={styles.input} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div style={styles.field}>
          <label>Password</label>
          <input style={styles.input} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button style={{ ...styles.btn, ...styles.primary }} type="submit">{isLogin ? "Login" : "Register"}</button>
          <button style={{ ...styles.btn, marginLeft: 8 }} type="button" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Go to Register" : "Go to Login"}</button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        <PasswordReset auth={auth} />
      </div>
    </div>
  );
}

function PasswordReset({ auth }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [newPass, setNewPass] = useState("");

  function handleReset(e) {
    e.preventDefault();
    try {
      if (!email) throw new Error("请输入注册邮箱");
      if (!newPass) throw new Error("请输入新密码");
      auth.resetPassword(email, newPass);
      setMsg("密码重置成功（模拟）。请用新密码登录。");
    } catch (err) { setMsg(err.message); }
  }

  return (
    <form onSubmit={handleReset} style={{ marginTop: 8 }}>
      <h4>Reset Password (mock)</h4>
      <div style={styles.field}>
        <label>Registered Email</label>
        <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div style={styles.field}>
        <label>New Password</label>
        <input style={styles.input} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
      </div>
      <button style={{ ...styles.btn, ...styles.secondary }} type="submit">Reset</button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </form>
  );
}

// -------------------- Dashboard --------------------
function DashboardView({ auth }) {
  const events = storage.get("events", []);
  return (
    <div>
      <h3>Upcoming Events</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {events.map(ev => (
          <div key={ev.id} style={styles.card}>
            <h4>{ev.title}</h4>
            <div>Date: {ev.date}</div>
            <div>Location: {ev.location}</div>
            <div>Type: {ev.type}</div>
            <div>Slots: {ev.slots}</div>
            <div>{ev.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- Profile --------------------
function ProfileView({ auth, onBack }) {
  const full = auth.getCurrentFullUser() || {};
  const initialProfile = full.profile || { name: "", phone: "", age: "", contact: "" };
  const [profile, setProfile] = useState(initialProfile);
  const [msg, setMsg] = useState("");

  function handleSave(e) {
    e.preventDefault();
    if (!profile.name) return setMsg("姓名为必填项");
    auth.updateProfile(profile);
    setMsg("保存成功");
  }

  return (
    <div>
      <h3>Profile</h3>
      <form onSubmit={handleSave}>
        <div style={styles.field}>
          <label>Full name</label>
          <input
            style={styles.input}
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div style={styles.field}>
          <label>Phone</label>
          <input
            style={styles.input}
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>
        <div style={styles.field}>
          <label>Age</label>
          <input
            style={styles.input}
            value={profile.age || ""}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
          />
        </div>
        <div style={styles.field}>
          <label>Other contact info</label>
          <input
            style={styles.input}
            value={profile.contact || ""}
            onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
          />
        </div>
        <button style={{ ...styles.btn, ...styles.primary }} type="submit">Save Profile</button>
        <button style={{ ...styles.btn, marginLeft: 8 }} type="button" onClick={onBack}>Back</button>
        {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
      </form>
    </div>
  );
}

// -------------------- Event Registration --------------------
function EventRegistrationView({ auth, onBack, addNotification }) {
  const events = storage.get("events", []);
  const [selected, setSelected] = useState(events[0]?.id || "");
  const [msg, setMsg] = useState("");

  function handleRegister() {
    if (!selected) return;
    const applications = storage.get("applications", []);
    const full = auth.getCurrentFullUser();
    if (!full) return;
    if (applications.find(a => a.eventId === selected && a.userId === full.id)) {
      setMsg("你已经报名过这个活动了");
      return;
    }
    const newApp = { id: uid(), eventId: selected, userId: full.id, status: "Pending", date: new Date().toISOString() };
    applications.push(newApp);
    storage.set("applications", applications);
    setMsg("报名成功");
    addNotification({ id: uid(), title: "报名成功", message: `你已报名 ${events.find(ev => ev.id === selected)?.title}` });
  }

  return (
    <div>
      <h3>Register for Event</h3>
      <div style={styles.field}>
        <label>Select Event</label>
        <select style={styles.input} value={selected} onChange={(e) => setSelected(e.target.value)}>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>
      <button style={{ ...styles.btn, ...styles.primary }} onClick={handleRegister}>Register</button>
      <button style={{ ...styles.btn, marginLeft: 8 }} onClick={onBack}>Back</button>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}

// -------------------- Applications --------------------
function ApplicationsView({ auth }) {
  const full = auth.getCurrentFullUser();
  const applications = storage.get("applications", []).filter(a => a.userId === full?.id);
  const events = storage.get("events", []);

  if (!full) return <div>Loading...</div>;

  return (
    <div>
      <h3>My Applications</h3>
      {applications.length === 0 ? <div>No applications yet.</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #d1d5db", padding: 6 }}>Event</th>
              <th style={{ border: "1px solid #d1d5db", padding: 6 }}>Status</th>
              <th style={{ border: "1px solid #d1d5db", padding: 6 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(a => {
              const ev = events.find(e => e.id === a.eventId);
              return (
                <tr key={a.id}>
                  <td style={{ border: "1px solid #d1d5db", padding: 6 }}>{ev?.title || "Deleted"}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: 6 }}>{a.status}</td>
                  <td style={{ border: "1px solid #d1d5db", padding: 6 }}>{new Date(a.date).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
