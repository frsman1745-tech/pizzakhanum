import { useState, useRef, useEffect, useCallback } from "react";
import PizzaImg from "./PizzaImg.jsx";

export default function FeaturedSlider({ featured, onCardClick }) {
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

  function manualNav(idx) {
    paused.current = true;
    clearInterval(timer.current);
    scrollTo(idx);
    timer.current = setTimeout(() => {
      paused.current = false;
      timer.current = setInterval(next, 3000);
    }, 10000);
  }

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

  return (
    <div>
      <div className="featured-scroll" ref={scrollRef} onScroll={onScroll}>
        {featured.map((fp, i) => (
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
                <h3 style={{ fontSize: ".92rem", fontWeight: 700, color: "#E5D3B3" }}>
                  {fp.label}
                </h3>
                <div style={{ textAlign: "left", flexShrink: 0, marginRight: 8 }}>
                  {fp.priceOld ? (
                    <>
                      <div style={{
                        fontSize: ".8rem", fontWeight: 900,
                        color: "#C8A96A", whiteSpace: "nowrap"
                      }}>{fp.priceOld} ل.س</div>
                      <div style={{ fontSize: ".58rem", color: "#8B6B4A" }}>
                        {fp.priceNew} ل.ج
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: ".66rem", color: "#8B6B4A" }}>حسب الحجم</div>
                  )}
                </div>
              </div>
              <p style={{
                fontSize: ".66rem", color: "#8B6B4A",
                lineHeight: 1.55, marginBottom: 9
              }}>{fp.desc}</p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#C8A96A14", border: "1px solid #C8A96A2a",
                borderRadius: 20, padding: "4px 11px"
              }}>
                <span style={{ fontSize: ".66rem", color: "#C8A96A" }}>اختر النكهات</span>
                <span style={{ color: "#C8A96A", fontSize: ".78rem" }}>←</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {Array.from({ length: count }, (_, i) => (
            <button key={i} onClick={() => manualNav(i)}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                border: "none", cursor: "pointer",
                background: i === active ? "#C8A96A" : "#1a1a1a",
                padding: 0, transition: "background .25s"
              }} />
          ))}
        </div>
      )}
    </div>
  );
}
