import { t } from "../translations.js";

export default function ExtrasSelector({ extras, selections, onChange, lang = "ar" }) {
  if (!extras || extras.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {extras.map(group => (
        <div key={group.id} style={{ marginBottom: 16 }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 8
          }}>
            <p style={{ fontSize: ".63rem", color: "#C8A96A66", letterSpacing: "2px" }}>
              {group.name.toUpperCase()}
              {group.required && <span style={{ color: "#ef444466" }}> *</span>}
            </p>
            <p style={{ fontSize: ".57rem", color: "#333" }}>
              {group.type === "single" ? t("single_choice", lang) : t("multi_choice", lang)}
            </p>
          </div>
          {(group.options || []).map(opt => {
            const groupSel = selections[group.id] || [];
            const isSel = Array.isArray(groupSel)
              ? groupSel.includes(opt.id)
              : groupSel === opt.id;

            return (
              <div key={opt.id}
                className={`extra-opt${isSel ? " sel" : ""}`}
                onClick={() => {
                  if (group.type === "single") {
                    onChange(group.id, isSel ? null : opt.id, "single");
                  } else {
                    const cur = selections[group.id] || [];
                    onChange(
                      group.id,
                      isSel ? cur.filter(x => x !== opt.id) : [...cur, opt.id],
                      "multi"
                    );
                  }
                }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: ".82rem", fontWeight: 600,
                    color: isSel ? "#E5D3B3" : "#888"
                  }}>{opt.label}</p>
                  {+opt.numericPrice > 0 && (
                    <p style={{
                      fontSize: ".64rem",
                      color: isSel ? "#C8A96A" : "#444",
                      marginTop: 2
                    }}>+ {opt.priceOld} {t("syp", lang)}</p>
                  )}
                </div>
                {group.type === "single" ? (
                  <div className={`extra-check${isSel ? " on" : ""}`}>
                    {isSel && (
                      <span style={{
                        fontSize: ".55rem", color: "#0f0f0f", fontWeight: 900
                      }}>✓</span>
                    )}
                  </div>
                ) : (
                  <div className={`extra-check-sq${isSel ? " on" : ""}`}>
                    {isSel && (
                      <span style={{
                        fontSize: ".55rem", color: "#0f0f0f", fontWeight: 900
                      }}>✓</span>
                    )}
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
