// src/components/pizza/FlavorGrid.jsx
// 2-column grid of flavor buttons. Previously defined as a nested function
// inside App.jsx (a React anti-pattern that causes unmount on every render).

import PizzaImg from "./PizzaImg.jsx";

/**
 * @param {{
 *   flavors: { id: string, label: string, comingSoon: boolean, flavorImageUrl: string }[],
 *   onPick: (flavorId: string) => void,
 *   usedMap?: Record<string, number>
 * }} props
 */
export default function FlavorGrid({ flavors, onPick, usedMap = {} }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
      {flavors.map((f) => {
        const cnt = usedMap[f.id] || 0;
        return (
          <div
            key={f.id}
            className={`flavor-btn${f.comingSoon ? " is-coming-soon" : ""}`}
            onClick={() => { if (!f.comingSoon) onPick(f.id); }}
          >
            <PizzaImg imageUrl={f.flavorImageUrl} label="" style={{ width: "100%", height: 68, borderRadius: 0 }} />
            <div style={{ padding: "6px 9px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: ".7rem", fontWeight: 600, color: f.comingSoon ? "var(--text-muted)" : "var(--text-primary)" }}>
                {f.label}
              </span>
              {f.comingSoon && (
                <span style={{ fontSize: ".52rem", background: "var(--gold-alpha-10)", color: "rgba(200,169,106,.47)", padding: "1px 5px", borderRadius: 9 }}>
                  قريباً
                </span>
              )}
              {cnt > 0 && (
                <span style={{ fontSize: ".58rem", background: "var(--gold)", color: "#0f0f0f", borderRadius: "50%", width: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {cnt}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
