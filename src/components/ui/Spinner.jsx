// src/components/ui/Spinner.jsx

/**
 * @param {{ size?: number, color?: string, borderWidth?: number }} props
 */
export default function Spinner({ size = 28, color = "var(--gold)", borderWidth = 3 }) {
  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: `${borderWidth}px solid rgba(200,169,106,.22)`,
        borderTopColor: color,
      }}
    />
  );
}
