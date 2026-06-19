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
            <p style={{ fontSize: ".63rem", color: "var(--text-gold)", opacity: .4, letterSpacing: "2px" }}>
              {group.name.toUpperCase()}
              {group.required && <span style={{ color: "var(--text-red)", opacity: .4 }}> *</span>}
            </p>
            <p style={{ fontSize: ".57rem", color: "var(--text-muted-2)" }}>
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
                    color: isSel ? "var(--text-primary)" : "var(--text-soft)"
                  }}>{opt.label}</p>
                  {+opt.numericPrice > 0 && (
                    <p style={{
                      fontSize: ".64rem",
                      color: isSel ? "var(--text-gold)" : "var(--text-muted-2)",
                      marginTop: 2
                    }}>+ {opt.priceOld} {t("syp", lang)}</p>
                  )}
                </div>
                {group.type === "single" ? (
                  <div className={`extra-check${isSel ? " on" : ""}`}>
                    {isSel && (
                      <span style={{
                        fontSize: ".55rem", color: "var(--text-on-gold)", fontWeight: 900
                      }}>✓</span>
                    )}
                  </div>
                ) : (
                  <div className={`extra-check-sq${isSel ? " on" : ""}`}>
                    {isSel && (
                      <span style={{
                        fontSize: ".55rem", color: "var(--text-on-gold)", fontWeight: 900
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
