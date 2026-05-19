// src/components/ui/Toast.jsx
// Replaces the inline toast JSX that was in Admin.jsx's return statement.

/**
 * @param {{ toast: {message: string, type: "ok"|"err"|"warn"} | null }} props
 */
export default function Toast({ toast }) {
  if (!toast) return null;

  const colors = {
    ok:   { bg: "#0d1a0d",  border: "var(--green)", text: "var(--green)" },
    err:  { bg: "#1a0808",  border: "var(--red)",   text: "var(--red)"   },
    warn: { bg: "#1a1408",  border: "var(--gold)",  text: "var(--gold)"  },
  };
  const c = colors[toast.type] || colors.ok;

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 11,
        padding: "9px 18px",
        zIndex: "var(--z-toast)",
        color: c.text,
        fontSize: ".79rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 28px #00000099",
        animation: "toastIn .22s ease forwards",
        fontFamily: "var(--font)",
      }}
    >
      {toast.message}
    </div>
  );
}
