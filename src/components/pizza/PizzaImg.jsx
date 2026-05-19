// src/components/pizza/PizzaImg.jsx
// Renders a pizza image or a branded placeholder.
// Previously duplicated inline in App.jsx.

/**
 * @param {{ imageUrl?: string, label?: string, style?: React.CSSProperties }} props
 */
export default function PizzaImg({ imageUrl, label, style }) {
  if (imageUrl) {
    return (
      <div style={{ overflow: "hidden", flexShrink: 0, ...style }}>
        <img
          src={imageUrl}
          alt={label || ""}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#1c1208,#111)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px dashed var(--gold-alpha-10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          opacity: 0.3,
        }}
      >
        🍕
      </div>
      {label && (
        <span
          style={{
            fontSize: ".5rem",
            color: "var(--gold-alpha-10)",
            textAlign: "center",
            padding: "0 6px",
            lineHeight: 1.3,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
