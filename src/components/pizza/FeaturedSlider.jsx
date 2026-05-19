// src/components/pizza/FeaturedSlider.jsx
// Auto-playing carousel with dot pagination.
// Previously defined directly inside App.jsx.

import { useState, useRef, useCallback, useEffect } from "react";
import PizzaImg from "./PizzaImg.jsx";

/**
 * @param {{ featured: any[], onCardClick: (pizza: any) => void }} props
 */
export default function FeaturedSlider({ featured, onCardClick }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);
  const timerRef  = useRef(null);
  const paused    = useRef(false);
  const count     = featured.length;

  const scrollTo = useCallback((idx) => {
    if (!scrollRef.current) return;
    const el   = scrollRef.current;
    const card = el.children[idx];
    if (card) el.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
    setActive(idx);
  }, []);

  const next = useCallback(() => {
    if (paused.current) return;
    setActive((p) => {
      const n = (p + 1) % count;
      scrollTo(n);
      return n;
    });
  }, [count, scrollTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 3000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  function manualNav(idx) {
    paused.current = true;
    clearInterval(timerRef.current);
    scrollTo(idx);
    timerRef.current = setTimeout(() => {
      paused.current = false;
      timerRef.current = setInterval(next, 3000);
    }, 10_000);
  }

  function onScroll() {
    if (!scrollRef.current) return;
    const el  = scrollRef.current;
    const idx = Math.round(el.scrollLeft / (el.offsetWidth || 1));
    const c   = Math.max(0, Math.min(count - 1, idx));
    if (c !== active) {
      paused.current = true;
      clearInterval(timerRef.current);
      setActive(c);
      timerRef.current = setTimeout(() => {
        paused.current = false;
        timerRef.current = setInterval(next, 3000);
      }, 10_000);
    }
  }

  return (
    <div>
      <div className="featured-scroll" ref={scrollRef} onScroll={onScroll}>
        {featured.map((fp, i) => (
          <div
            key={fp.id || fp._id}
            className={`featured-card${i === active ? " is-active" : ""}`}
            onClick={() => onCardClick(fp)}
          >
            <PizzaImg imageUrl={fp.imageUrl} label={fp.label} style={{ width: "100%", height: 155, borderRadius: 0 }} />
            <div style={{ padding: "11px 12px 13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                <h3 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-primary)" }}>{fp.label}</h3>
                <div style={{ textAlign: "left", flexShrink: 0, marginRight: 8 }}>
                  {fp.priceOld
                    ? <>
                        <div style={{ fontSize: ".8rem", fontWeight: 900, color: "var(--gold)", whiteSpace: "nowrap" }}>{fp.priceOld} ل.س</div>
                        <div style={{ fontSize: ".58rem", color: "var(--gold-dark)" }}>{fp.priceNew} ل.ج</div>
                      </>
                    : <div style={{ fontSize: ".66rem", color: "var(--gold-dark)" }}>حسب الحجم</div>
                  }
                </div>
              </div>
              <p style={{ fontSize: ".66rem", color: "var(--gold-dark)", lineHeight: 1.55, marginBottom: 9 }}>{fp.desc}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold-alpha-10)", border: "1px solid var(--gold-alpha-10)", borderRadius: 20, padding: "4px 11px" }}>
                <span style={{ fontSize: ".66rem", color: "var(--gold)" }}>اختر النكهات</span>
                <span style={{ color: "var(--gold)", fontSize: ".78rem" }}>←</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="dot-wrap">
        {featured.map((_, i) => (
          <button
            key={i}
            className={`dot${i === active ? " is-active" : ""}`}
            onClick={() => manualNav(i)}
            aria-label={`الشريحة ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
