export default function Header({ title, onBack, subtitle }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "var(--bg-page-alt)", borderBottom: "1px solid var(--border-input)",
      padding: "12px 15px", display: "flex", alignItems: "center", gap: 11
    }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "var(--text-gold)",
        cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0
      }}>‹</button>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: ".62rem", color: "var(--text-secondary)" }}>{subtitle}</p>}
      </div>
    </div>
  );
}
