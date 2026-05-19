// src/components/admin/ItemRow.jsx
// Single draggable row in the admin menu/featured lists.
// Extracted from the inline JSX inside Admin.jsx's menu/featured tab rendering.

/**
 * @param {{
 *   item: any,
 *   type: "menu"|"featured",
 *   sections: any[],
 *   isDragging: boolean,
 *   onDragStart: () => void,
 *   onDragOver: (e: DragEvent) => void,
 *   onDragEnd: () => void,
 *   onEdit: () => void,
 *   onDuplicate: () => void,
 *   onDelete: () => void,
 *   onMoveUp: () => void,
 *   onMoveDown: () => void,
 *   onToggleCS?: () => void,   // menu items only
 * }} props
 */
export default function ItemRow({
  item,
  type,
  sections,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleCS,
}) {
  const isMenu = type === "menu";
  const sec = sections.find((s) => s.id === item.menuSection);
  const isBuilder = item.sliceCount > 0;
  const isKhanum  = (item.sizes || []).length > 0 && !isBuilder;

  return (
    <div
      className={`admin-row${isDragging ? " is-dragging" : ""}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <span className="drag-handle">⠿</span>

      {/* Thumbnail */}
      {item.imageUrl
        ? <img src={item.imageUrl} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
        : <div style={{ width: 42, height: 42, borderRadius: 8, background: "#1a1008", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, border: "1px solid var(--border-default)" }}>{isMenu ? "🍕" : "⭐"}</div>
      }

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: ".83rem" }}>{item.label}</span>

          {isMenu && (
            item.comingSoon
              ? <span className="badge badge-red">قريباً</span>
              : <span className="badge badge-green">ظاهر</span>
          )}
          {sec && <span className="badge badge-gold">{sec.emoji} {sec.label}</span>}
          {isBuilder && <span className="badge badge-gold">🍕 {item.sliceCount} شريحة</span>}
          {isKhanum  && <span className="badge badge-gold">👑 خانم</span>}
          {(item.sizes  || []).length > 0 && isMenu && <span className="badge badge-gold">{item.sizes.length} حجم</span>}
          {(item.extras || []).length > 0 && <span className="badge badge-blue">{item.extras.length} إضافة</span>}
          {item.priceOld && !isMenu && <span className="badge badge-gold">{item.priceOld} ل.س</span>}
        </div>
        <p style={{ fontSize: ".63rem", color: "var(--text-disabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.details || item.desc || "—"}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 3, alignItems: "center", flexShrink: 0 }}>
        {/* Move up/down */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <button onClick={onMoveUp}  style={{ background: "none", border: "none", color: "#2a2a2a", cursor: "pointer", fontSize: ".65rem", lineHeight: 1, padding: "2px 4px" }}>▲</button>
          <button onClick={onMoveDown} style={{ background: "none", border: "none", color: "#2a2a2a", cursor: "pointer", fontSize: ".65rem", lineHeight: 1, padding: "2px 4px" }}>▼</button>
        </div>

        {/* Toggle comingSoon (menu only) */}
        {isMenu && onToggleCS && (
          <button
            onClick={onToggleCS}
            style={{
              padding: "4px 7px",
              background: item.comingSoon ? "#1a0d0d" : "#0d1a0d",
              border: `1px solid ${item.comingSoon ? "var(--red-alpha)" : "var(--green-alpha)"}`,
              borderRadius: 6,
              color: item.comingSoon ? "var(--red)" : "var(--green)",
              cursor: "pointer",
              fontSize: ".66rem",
              fontWeight: 700,
              fontFamily: "var(--font)",
            }}
          >
            {item.comingSoon ? "إظهار" : "إخفاء"}
          </button>
        )}

        <button className="btn-icon" onClick={onEdit}      style={{ color: "var(--gold)" }}>✏️</button>
        <button className="btn-icon" onClick={onDuplicate} style={{ color: "#2e2e2e" }} title="نسخ">📋</button>
        <button className="btn-icon" onClick={onDelete}    style={{ background: "#1a0d0d", border: "1px solid var(--red-alpha)", color: "var(--red)" }}>🗑</button>
      </div>
    </div>
  );
}
