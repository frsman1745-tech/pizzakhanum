import PizzaImg from "./PizzaImg.jsx";
import { t } from "../translations.js";

export default function FlavorGrid({ flavors, onPick, usedMap = {}, lang = "ar" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
      {flavors.map(f => {
        const cnt = usedMap[f.id] || 0;
        return (
          <div key={f.id}
            className={`flavor-btn${f.comingSoon ? " cs" : cnt > 0 ? " hfl" : ""}`}
            onClick={() => { if (!f.comingSoon) onPick(f.id); }}>
            <PizzaImg imageUrl={f.flavorImageUrl} label=""
              style={{ width: "100%", height: 68, borderRadius: 0 }} />
            <div style={{
              padding: "6px 9px 8px", display: "flex",
              alignItems: "center", justifyContent: "space-between"
            }}>
              <span style={{
                fontSize: ".7rem", fontWeight: 600,
                color: f.comingSoon ? "var(--text-muted-2)" : "var(--text-primary)"
              }}>{f.label}</span>
              {f.comingSoon && (
                <span style={{
                  fontSize: ".52rem", background: "var(--bg-gold-dim)",
                  color: "var(--text-gold)", opacity: .47, padding: "1px 5px", borderRadius: 9
                }}>{t("coming_soon", lang)}</span>
              )}
              {cnt > 0 && (
                <span style={{
                  fontSize: ".58rem", background: "var(--bg-gold)",
                  color: "var(--text-on-gold)", borderRadius: "50%",
                  width: 17, height: 17, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontWeight: 700
                }}>{cnt}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
