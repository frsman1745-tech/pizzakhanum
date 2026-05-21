import { useState } from "react";

export default function PizzaImg({ imageUrl, label, style }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (imageUrl && !error) {
    return (
      <div style={{ overflow: "hidden", flexShrink: 0, position: "relative", ...style }}>
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0,
            background: "var(--gradient-card-3)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              border: "2px solid var(--border-gold)", borderTopColor: "var(--text-gold)",
              animation: "spin .7s linear infinite"
            }} />
          </div>
        )}
        <img src={imageUrl} alt={label || ""} loading="lazy"
          onLoad={() => setLoaded(true)} onError={() => setError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: loaded ? 1 : 0, transition: "opacity .3s" }} />
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--gradient-card-3)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 5, overflow: "hidden", flexShrink: 0, ...style
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "1px dashed var(--border-gold)", display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 13, opacity: .3
      }}>🍕</div>
      {label && (
        <span style={{ fontSize: ".5rem", color: "var(--text-gold)", opacity: .3, textAlign: "center", padding: "0 6px", lineHeight: 1.3 }}>
          {label}
        </span>
      )}
    </div>
  );
}
