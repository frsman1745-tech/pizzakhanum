import { useState, useRef, useEffect, useCallback } from "react";
import PizzaImg from "./PizzaImg.jsx";
import { t } from "../translations.js";

export default function FeaturedSlider({ featured, onCardClick, lang = "ar" }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);
  const timer = useRef(null);
  const paused = useRef(false);
  const count = featured.length;

  const scrollTo = useCallback((idx) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const card = el.children[idx];
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    if (paused.current) return;
    setActive(p => { const n = (p + 1) % count; scrollTo(n); return n; });
  }, [count, scrollTo]);

  useEffect(() => {
    timer.current = setInterval(next, 3000);
    return () => clearInterval(timer.current);
  }, [next]);

  function onScroll() {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollLeft / (el.offsetWidth || 1));
    const c = Math.max(0, Math.min(count - 1, idx));
    if (c !== active) {
      paused.current = true;
      clearInterval(timer.current);
      setActive(c);
      timer.current = setTimeout(() => {
        paused.current = false;
        timer.current = setInterval(next, 3000);
      }, 10000);
    }
  }

  const fmt = n => Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");

  return (
    <div>
      <div className="featured-scroll" ref={scrollRef} onScroll={onScroll}>
        {featured.map((fp, i) => {
          const hasPrice = fp.priceOld || fp.numericPrice;
          return (
          <div key={fp.id || fp._id}
            className={`featured-card${i === active ? " acard" : ""}`}
            onClick={() => onCardClick(fp)}>
            <PizzaImg imageUrl={fp.imageUrl} label={fp.label}
              style={{ width: "100%", height: 155, borderRadius: 0 }} />
            <div style={{ padding: "11px 12px 13px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 5
              }}>
                <h3 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {fp.label}
                </h3>
                <div style={{ textAlign: "left", flexShrink: 0, marginRight: 8 }}>
                  {hasPrice ? (
                    <>
                      <div style={{
                        fontSize: ".8rem", fontWeight: 900,
                        color: "var(--text-gold)", whiteSpace: "nowrap"
                      }}>{fp.priceOld || fmt(fp.numericPrice)} {t("syp", lang)}</div>
                      {fp.priceNew && (
                        <div style={{ fontSize: ".58rem", color: "var(--text-secondary)" }}>
                          {fp.priceNew} {t("sp", lang)}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: ".66rem", color: "var(--text-secondary)" }}>{t("per_size", lang)}</div>
                  )}
                </div>
              </div>
              <p style={{
                fontSize: ".66rem", color: "var(--text-secondary)",
                lineHeight: 1.55, marginBottom: 9
              }}>{fp.desc}</p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "var(--bg-gold-dim)", border: "1px solid var(--border-gold)",
                borderRadius: 20, padding: "4px 11px"
              }}>
                <span style={{ fontSize: ".66rem", color: "var(--text-gold)" }}>{t("choose_flavors", lang)}</span>
                <span style={{ color: "var(--text-gold)", fontSize: ".78rem" }}>←</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
