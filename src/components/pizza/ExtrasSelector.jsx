// src/components/pizza/ExtrasSelector.jsx
// Renders extra option groups (single-select or multi-select).

/**
 * @param {{
 *   extras: any[],
 *   selections: Record<string, string | string[] | null>,
 *   onChange: (groupId: string, value: string | string[] | null, type: "single"|"multi") => void
 * }} props
 */
export default function ExtrasSelector({ extras, selections, onChange }) {
  if (!extras || extras.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {extras.map((group) => (
        <div key={group.id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: ".63rem", color: "var(--gold-alpha-30)", letterSpacing: "2px" }}>
              {group.name.toUpperCase()}{" "}
              {group.required && <span style={{ color: "rgba(239,68,68,.4)" }}>*</span>}
            </p>
            <p style={{ fontSize: ".57rem", color: "var(--text-muted)" }}>
              {group.type === "single" ? "اختيار واحد" : "يمكن تعدد الاختيارات"}
            </p>
          </div>

          {(group.options || []).map((opt) => {
            const groupSel = selections[group.id] || [];
            const isSel = Array.isArray(groupSel)
              ? groupSel.includes(opt.id)
              : groupSel === opt.id;

            return (
              <div
                key={opt.id}
                className={`extra-opt${isSel ? " is-selected" : ""}`}
                onClick={() => {
                  if (group.type === "single") {
                    onChange(group.id, isSel ? null : opt.id, "single");
                  } else {
                    const cur = selections[group.id] || [];
                    onChange(
                      group.id,
                      isSel
                        ? cur.filter((x) => x !== opt.id)
                        : [...cur, opt.id],
                      "multi"
                    );
                  }
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: ".82rem", fontWeight: 600, color: isSel ? "var(--text-primary)" : "#888" }}>
                    {opt.label}
                  </p>
                  {+opt.numericPrice > 0 && (
                    <p style={{ fontSize: ".64rem", color: isSel ? "var(--gold)" : "var(--text-muted)", marginTop: 2 }}>
                      + {opt.priceOld} ل.س
                    </p>
                  )}
                </div>

                {group.type === "single" ? (
                  <div className={`check-circle${isSel ? " checked" : ""}`}>
                    {isSel && <span style={{ fontSize: ".55rem", color: "#0f0f0f", fontWeight: 900 }}>✓</span>}
                  </div>
                ) : (
                  <div className={`check-square${isSel ? " checked" : ""}`}>
                    {isSel && <span style={{ fontSize: ".55rem", color: "#0f0f0f", fontWeight: 900 }}>✓</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
