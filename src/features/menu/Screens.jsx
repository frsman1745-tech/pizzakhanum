// src/features/menu/BuilderScreen.jsx

import { useState, useMemo } from "react";
import useUiStore   from "../../store/uiStore.js";
import useCartStore from "../../store/cartStore.js";
import { useMenu }  from "../../hooks/usePizzas.js";
import { DEFAULT_MENU } from "../../constants/defaults.js";
import PizzaImg    from "../../components/pizza/PizzaImg.jsx";
import FlavorGrid  from "../../components/pizza/FlavorGrid.jsx";

function ScreenHeader({ title, subtitle, onBack, extra }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid var(--border-subtle)", padding: "12px 15px", display: "flex", alignItems: "center", gap: 11 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: ".63rem", color: "var(--gold-dark)" }}>{subtitle}</p>}
      </div>
      {extra}
    </div>
  );
}

export function BuilderScreen() {
  const { builderPizza, goToMenu } = useUiStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: menuData } = useMenu();

  const flavors = useMemo(
    () => (menuData || DEFAULT_MENU).map((p) => ({ id: p.id || p._id, label: p.label, comingSoon: p.comingSoon, flavorImageUrl: p.flavorImageUrl || "" })),
    [menuData]
  );

  const [selectedSlices, setSelectedSlices] = useState(new Set());
  const [sliceFlavors,   setSliceFlavors]   = useState({});

  if (!builderPizza) return null;

  const { sliceCount, cols } = builderPizza;
  const filledCount = Object.keys(sliceFlavors).length;
  const usedMap = flavors.reduce((a, f) => ({ ...a, [f.id]: Object.values(sliceFlavors).filter((v) => v === f.id).length }), {});

  function toggleSlice(idx) {
    setSelectedSlices((p) => { const n = new Set(p); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
  }

  function applyFlavor(fid) {
    if (!selectedSlices.size) return;
    setSliceFlavors((p) => { const n = { ...p }; selectedSlices.forEach((i) => { n[i] = fid; }); return n; });
    setSelectedSlices(new Set());
  }

  function addToCart() {
    const perSlice = Object.entries(sliceFlavors).map(([i, fid]) => `شريحة ${+i + 1}: ${flavors.find((f) => f.id === fid)?.label}`).join("، ");
    addItem({ label: builderPizza.label, size: "", details: perSlice || "—", priceOld: builderPizza.priceOld, priceNew: builderPizza.priceNew, numericPrice: builderPizza.numericPrice });
    goToMenu();
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", paddingBottom: 120 }}>
      <ScreenHeader
        title={builderPizza.label}
        subtitle={selectedSlices.size > 0 ? `${selectedSlices.size} شريحة محددة — اختر نكهة` : `${filledCount}/${sliceCount} شرائح`}
        onBack={goToMenu}
        extra={
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: sliceCount }, (_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: sliceFlavors[i] ? "var(--gold)" : "#1a1a1a", transition: "background .3s" }} />
            ))}
          </div>
        }
      />

      <div style={{ padding: "13px 15px 0" }}>
        <div style={{ background: "#141414", border: "1px solid var(--border-subtle)", borderRadius: 11, padding: "8px 13px", marginBottom: 13, display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: "1rem" }}>{selectedSlices.size === 0 ? "☝️" : "🎨"}</span>
          <p style={{ fontSize: ".7rem", color: "var(--gold-dark)", lineHeight: 1.5 }}>
            {selectedSlices.size === 0 ? "اضغط على شريحة أو أكثر، ثم اختر النكهة" : `${selectedSlices.size} شريحة — اضغط على نكهة`}
          </p>
        </div>

        {/* Slice grid */}
        <div style={{ background: "linear-gradient(135deg,#1c1008,#100a04)", border: "2px solid var(--gold-alpha-10)", borderRadius: 15, padding: 11, marginBottom: 15 }}>
          <p style={{ fontSize: ".56rem", color: "var(--gold-alpha-10)", textAlign: "center", marginBottom: 9, letterSpacing: "2px" }}>{builderPizza.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap: 5 }}>
            {Array.from({ length: sliceCount }, (_, i) => {
              const fid = sliceFlavors[i];
              const fi  = fid ? flavors.find((f) => f.id === fid) : null;
              const isSel = selectedSlices.has(i);
              return (
                <div key={i} className={`slice-cell${isSel ? " is-selected" : fid ? " is-filled" : ""}`} onClick={() => toggleSlice(i)}>
                  {fid
                    ? <><PizzaImg imageUrl={fi?.flavorImageUrl || ""} label="" style={{ width: "100%", height: 28, borderRadius: 3 }} /><span style={{ fontSize: ".48rem", color: "var(--gold)", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{fi?.label}</span></>
                    : <><div style={{ width: 16, height: 16, borderRadius: 3, border: `1.5px ${isSel ? "solid var(--blue)" : "dashed #222"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isSel && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--blue)" }} />}</div><span style={{ fontSize: ".48rem", color: "#1e1e1e" }}>{i + 1}</span></>
                  }
                </div>
              );
            })}
          </div>
        </div>

        {filledCount > 0 && (
          <div className="pop-in" style={{ marginBottom: 11 }}>
            <button className="btn-gold" onClick={addToCart} style={{ width: "100%", padding: "11px", borderRadius: 11, fontSize: ".86rem", fontWeight: 700, color: "#0f0f0f" }}>
              إضافة للطلب — {builderPizza.priceOld} ل.س
            </button>
          </div>
        )}

        <p style={{ fontSize: ".6rem", color: "var(--gold-dark)", letterSpacing: "2px", marginBottom: 9 }}>النكهات المتاحة</p>
        <FlavorGrid flavors={flavors} onPick={applyFlavor} usedMap={usedMap} />

        {filledCount > 0 && (
          <button onClick={() => { setSliceFlavors({}); setSelectedSlices(new Set()); }}
            style={{ marginTop: 11, width: "100%", padding: 9, background: "none", border: "1px solid var(--border-subtle)", borderRadius: 11, color: "#333", cursor: "pointer", fontFamily: "var(--font)", fontSize: ".72rem" }}>
            🔄 إعادة التعيين
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// src/features/menu/KhanamScreen.jsx
export function KhanamScreen() {
  const { builderPizza, khanamSize, setKhanamSize, goToMenu } = useUiStore();
  const addItem = useCartStore((s) => s.addItem);
  const { data: menuData } = useMenu();
  const flavors = useMemo(
    () => (menuData || DEFAULT_MENU).map((p) => ({ id: p.id || p._id, label: p.label, comingSoon: p.comingSoon, flavorImageUrl: p.flavorImageUrl || "" })),
    [menuData]
  );

  if (!builderPizza) return null;

  function addToCart(fid) {
    const f = flavors.find((x) => x.id === fid);
    addItem({ label: `بيتزا خانم — ${khanamSize.label}`, size: khanamSize.label, details: `المنتصف: ${f?.label} • الأطراف: جبنة شيدر`, priceOld: khanamSize.priceOld, priceNew: khanamSize.priceNew, numericPrice: khanamSize.numericPrice });
    setKhanamSize(null);
    goToMenu();
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", paddingBottom: 100 }}>
      <ScreenHeader title="بيتزا خانم" subtitle={khanamSize ? "اختر نكهة المنتصف" : "اختر الحجم أولاً"} onBack={() => { goToMenu(); setKhanamSize(null); }} />
      <div style={{ padding: "16px 15px" }}>
        <div style={{ background: "#141414", border: "1px solid var(--gold-alpha-10)", borderRadius: 15, padding: 13, marginBottom: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <PizzaImg imageUrl={builderPizza.imageUrl} label="" style={{ width: 76, height: 76, borderRadius: 11, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: ".87rem", fontWeight: 700, color: "var(--gold)", marginBottom: 5 }}>بيتزا خانم</p>
            <p style={{ fontSize: ".68rem", color: "var(--gold-dark)", lineHeight: 1.6 }}>{builderPizza.desc}</p>
          </div>
        </div>

        {!khanamSize && (
          <div>
            <p style={{ fontSize: ".6rem", color: "var(--gold-dark)", letterSpacing: "2px", marginBottom: 11 }}>اختر الحجم</p>
            <div style={{ display: "flex", gap: 9 }}>
              {(builderPizza.sizes || []).map((sz) => (
                <button key={sz.id} className="size-btn" onClick={() => setKhanamSize(sz)} style={{ padding: "14px 8px" }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: 5 }}>{sz.id === "sm" ? "🔸" : "🔶"}</div>
                  <div style={{ color: "var(--text-primary)", marginBottom: 4 }}>{sz.label}</div>
                  <div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--gold)" }}>{sz.priceOld} ل.س</div>
                  <div style={{ fontSize: ".58rem", color: "var(--gold-dark)" }}>{sz.priceNew} ل.ج</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {khanamSize && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
              <p style={{ fontSize: ".6rem", color: "var(--gold-dark)", letterSpacing: "2px" }}>نكهة المنتصف</p>
              <button onClick={() => setKhanamSize(null)} style={{ fontSize: ".66rem", color: "#444", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font)" }}>← تغيير الحجم</button>
            </div>
            <FlavorGrid flavors={flavors} onPick={addToCart} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// src/features/menu/PizzaDetailScreen.jsx
import { useState as useState2, useMemo as useMemo2 } from "react";
import ExtrasSelector from "../../components/pizza/ExtrasSelector.jsx";
import { DEFAULT_SIZES } from "../../constants/defaults.js";

export function PizzaDetailScreen() {
  const { detailPizza, goToMenu } = useUiStore();
  const addItem = useCartStore((s) => s.addItem);

  const [detailSize, setDetailSize] = useState2(null);
  const [extraSels,  setExtraSels]  = useState2({});

  if (!detailPizza) return null;

  const sizes = detailPizza.sizes?.length ? detailPizza.sizes : DEFAULT_SIZES;

  function extrasTotal() {
    let t = 0;
    (detailPizza.extras || []).forEach((g) => {
      const sel = extraSels[g.id];
      if (!sel) return;
      const ids = Array.isArray(sel) ? sel : [sel];
      ids.forEach((oid) => { const opt = (g.options || []).find((o) => o.id === oid); if (opt) t += opt.numericPrice || 0; });
    });
    return t;
  }

  function extrasSummary() {
    const parts = [];
    (detailPizza.extras || []).forEach((g) => {
      const sel = extraSels[g.id];
      if (!sel) return;
      const ids = Array.isArray(sel) ? sel : [sel];
      const labels = ids.map((oid) => (g.options || []).find((o) => o.id === oid)?.label).filter(Boolean);
      if (labels.length) parts.push(`${g.name}: ${labels.join("، ")}`);
    });
    return parts.join(" · ");
  }

  const extrasValid = useMemo2(
    () => (detailPizza.extras || []).every((g) => { if (!g.required) return true; const sel = extraSels[g.id]; return Array.isArray(sel) ? sel.length > 0 : !!sel; }),
    [detailPizza, extraSels]
  );

  const eTotal    = extrasTotal();
  const totalNow  = (detailSize?.numericPrice || 0) + eTotal;
  const hasExtras = (detailPizza.extras || []).length > 0;

  function addToCart() {
    if (!detailSize) return;
    const details = [detailPizza.details, extrasSummary()].filter(Boolean).join(" · ");
    addItem({ label: detailPizza.label, size: detailSize.label, details, priceOld: detailSize.priceOld, priceNew: detailSize.priceNew, numericPrice: totalNow });
    goToMenu();
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", paddingBottom: 100 }}>
      <ScreenHeader title={detailPizza.label} onBack={goToMenu} />
      <div style={{ padding: "16px 15px" }}>
        <PizzaImg imageUrl={detailPizza.imageUrl} label={detailPizza.label} style={{ width: "100%", height: 195, borderRadius: 16, marginBottom: 18 }} />
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 7 }}>{detailPizza.label}</h2>
        {detailPizza.details && <p style={{ fontSize: ".76rem", color: "var(--gold-dark)", lineHeight: 1.7, marginBottom: 22, borderRight: "2px solid var(--gold-alpha-10)", paddingRight: 11 }}>{detailPizza.details}</p>}

        <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 11 }}>اختر الحجم</p>
        <div style={{ display: "flex", gap: 9, marginBottom: 22 }}>
          {sizes.map((sz) => (
            <button key={sz.id} className={`size-btn${detailSize?.id === sz.id ? " is-active" : ""}`} onClick={() => setDetailSize(sz)}>
              <div style={{ marginBottom: 3, fontWeight: 700 }}>{sz.label}</div>
              <div style={{ fontSize: ".78rem", fontWeight: 700, color: detailSize?.id === sz.id ? "#0f0f0f" : "var(--gold)" }}>{sz.priceOld} ل.س</div>
              <div style={{ fontSize: ".58rem", opacity: .7, marginTop: 2 }}>{sz.priceNew} ل.ج</div>
            </button>
          ))}
        </div>

        {hasExtras && (<>
          <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 20 }} />
          <p style={{ fontSize: ".6rem", color: "var(--gold-alpha-30)", letterSpacing: "2px", marginBottom: 14 }}>الإضافات</p>
          <ExtrasSelector extras={detailPizza.extras} selections={extraSels} onChange={(gid, val) => setExtraSels((p) => ({ ...p, [gid]: val === null ? undefined : val }))} />
        </>)}

        {detailSize && eTotal > 0 && (
          <div style={{ background: "#141414", border: "1px solid var(--gold-alpha-10)", borderRadius: 11, padding: "10px 13px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--gold-dark)", marginBottom: 4 }}><span>البيتزا</span><span>{detailSize.priceOld} ل.س</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: "var(--gold-dark)", marginBottom: 6 }}><span>الإضافات</span><span>+ {eTotal.toLocaleString()} ل.س</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", fontWeight: 700, color: "var(--gold)", borderTop: "1px solid var(--border-default)", paddingTop: 6 }}><span>المجموع</span><span>{totalNow.toLocaleString()} ل.س</span></div>
          </div>
        )}

        <button className="btn-gold" disabled={!detailSize || !extrasValid} onClick={addToCart} style={{ width: "100%", padding: "13px", borderRadius: 11, fontSize: ".9rem", fontWeight: 700, color: "#0f0f0f" }}>
          {!detailSize ? "اختر الحجم أولاً" : !extrasValid ? "أكمل الإضافات الإلزامية" : `إضافة للطلب — ${totalNow.toLocaleString()} ل.س`}
        </button>
      </div>
    </div>
  );
}
