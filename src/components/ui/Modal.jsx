// src/components/ui/Modal.jsx

/**
 * Bottom-sheet modal (like the original .mbg / .mbox pattern),
 * now as a reusable component with accessibility basics.
 *
 * @param {{ children: React.ReactNode, onClose: () => void, variant?: "sheet"|"centered", zIndex?: number }} props
 */
export default function Modal({ children, onClose, variant = "sheet", zIndex = 1000 }) {
  return (
    <div
      className="modal-backdrop"
      style={{ zIndex, alignItems: variant === "centered" ? "center" : "flex-end" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className={variant === "centered" ? "modal-centered anim-in" : "modal-sheet anim-in"}>
        {children}
      </div>
    </div>
  );
}
