export default function Header({ title, onBack, subtitle }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "#0d0d0d", borderBottom: "1px solid #161616",
      padding: "12px 15px", display: "flex", alignItems: "center", gap: 11
    }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#C8A96A",
        cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0
      }}>‹</button>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: ".92rem", fontWeight: 700, color: "#E5D3B3" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: ".62rem", color: "#8B6B4A" }}>{subtitle}</p>}
      </div>
    </div>
  );
}
