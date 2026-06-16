import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      localStorage.setItem("token", "demo-token");
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="qms-gradient-bg flex relative min-h-screen">
      <div style={leftPanel}>
        <div style={contentBlock}>
          <span style={{ ...badge, fontWeight: "bold" }}>QMS Management Portal</span>
          <h1 style={title}>
            QMS<br />
            <span style={titleAccent}>Made Intelligent</span>
          </h1>
          <p style={description}>
            Manage audits, CAPA processes, and compliance workflows in a centralized platform designed for operational excellence.
          </p>
          <div style={divider} />
          <h2 style={subtitle}>What’s new</h2>
          <p style={descriptionMuted}>
            Smart audit scheduling, automated reporting, and seamless integrations with tools like Online Forms and Calendar.
          </p>
        </div>
      </div>
      <div style={rightPanel}>
        <div style={glassCard}>
          <div style={cardHighlight} />
          <h3 style={cardTitle}>Welcome back</h3>
          <p style={cardSubtitle}>Login to QMS Portal</p>
          <form onSubmit={submit}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={glassInput}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={glassInput}
            />
            <button type="submit" style={buttonStyle}>
              Login →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Keeping the hard coded color rules
const leftPanel = { flex: 1, padding: "60px 80px", color: "#fff", display: "flex", alignItems: "center", zIndex: 1 };
const contentBlock = { maxWidth: 520, fontWeight: "bold" as const };
const badge = { padding: "6px 14px", borderRadius: 20, background: "rgba(255,255,255,0.2)" };
const title = { fontSize: 42, fontWeight: 800 };
const titleAccent = { color: "rgba(255,255,255,0.85)" };
const subtitle = { fontSize: 22 };
const description = { lineHeight: 1.6 };
const descriptionMuted = { opacity: 0.85 };
const divider = { height: 1, width: 120, background: "#fff", margin: "20px 0" };
const rightPanel = { flex: 1, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 };
const glassCard = { position: "relative" as const, width: "100%", maxWidth: 420, padding: 40, borderRadius: 28, background: "rgba(255,255,255,0.2)", boxSizing: "border-box" as const };
const cardTitle = { color: "#fff" };
const cardSubtitle = { color: "#eee" };
const glassInput = { width: "100%", padding: "13px 15px", marginBottom: 16, borderRadius: 15, border: "none", outline: "none", fontSize: 14, boxSizing: "border-box" as const, background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))" };
const buttonStyle = { width: "100%", padding: 14, borderRadius: 10, background: "#000", color: "#fff", border: "none", marginTop: 10, boxSizing: "border-box" as const };
const cardHighlight = { position: "absolute" as const, top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(180deg, rgba(255,255,255,0.45), transparent)" };

export default LoginPage;
