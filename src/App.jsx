import { useState, useRef, useEffect } from "react";

/* ─────────────────────────── DATA ─────────────────────────── */
const FEATURED = [
  {
    id: "meter", label: "بيتزا المتر",
    priceOld: "150,000", priceNew: "1,500", numericPrice: 150000,
    sliceCount: 8, cols: 4,
    desc: "متر كامل من الشهية المتنوعة لتشاركه مع أحبّك",
  },
  {
    id: "sixtyforty", label: "بيتزا 60×40",
    priceOld: "140,000", priceNew: "1,400", numericPrice: 140000,
    sliceCount: 6, cols: 3,
    desc: "الحجم العائلي المثالي للتجمعات",
  },
  {
    id: "khanum", label: "بيتزا خانم",
    priceOld: null, priceNew: null,
    desc: "كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨",
    sizes: [
      { id: "sm", label: "صغيرة", priceOld: "45,000", priceNew: "450", numericPrice: 45000 },
      { id: "lg", label: "كبيرة", priceOld: "60,000", priceNew: "600", numericPrice: 60000 },
    ],
  },
];

const FLAVORS = [
  { id: "4seasons",      label: "الفصول الأربعة" },
  { id: "margarita",    label: "مارغريتا" },
  { id: "hawaii",       label: "هاواي" },
  { id: "teamscheese",  label: "التيمات تشيز" },
  { id: "supersupreme", label: "سوبر سوبريم" },
  { id: "chickenbbq",   label: "تشيكن باربيكيو" },
  { id: "peperoni",     label: "ببروني" },
  { id: "salami",       label: "سلامي" },
  { id: "hotdog",       label: "هوت دوغ" },
  { id: "smokedchicken",label: "دجاج مدخن" },
  { id: "fajita",       label: "فاهيتا" },
  { id: "cs1", label: "بيتزا الكريمة",  comingSoon: true },
  { id: "cs2", label: "الثلاثي",         comingSoon: true },
  { id: "cs3", label: "بيتزا البحر",    comingSoon: true },
  { id: "cs4", label: "المكسيكية",       comingSoon: true },
  { id: "cs5", label: "بيتزا الخضار",   comingSoon: true },
];

const PIZZAS_MENU = [
  { id: "4seasons",      label: "الفصول الأربعة",   details: "جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء بالإضافة إلى حبات الطماطم والذرة." },
  { id: "margarita",    label: "مارغريتا",           details: "جبنة القشقوان مع الصلصة الحمراء." },
  { id: "hawaii",       label: "هاواي",              details: "جبنة القشقوان مع الموزريلا وقطع البيروني بالإضافة إلى شرائح الأناناس." },
  { id: "teamscheese",  label: "التيمات تشيز",       details: "جبنة القشقوان مع موزريلا بالإضافة لكرات الطماطم والريحان." },
  { id: "supersupreme", label: "سوبر سوبريم",        details: "المزيج المشهور والشهي من البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود." },
  { id: "chickenbbq",   label: "تشيكن باربيكيو",    details: "شرائح الدجاج مغمورة بصوص الباربيكيو اللذيذ وجبنة القشقوان مع شرائح البصل." },
  { id: "peperoni",     label: "ببروني",             details: "جبنة القشقوان مع المزيج الشهي من شرائح البيروني لحم البقر مع الثوم والكزبرة." },
  { id: "salami",       label: "سلامي",              details: "جبنة القشقوان مع شرائح لحم البقر." },
  { id: "hotdog",       label: "هوت دوغ",            details: "جبنة القشقوان مع حبات الهوت دوغ المدخن." },
  { id: "smokedchicken",label: "دجاج مدخن",          details: "جبنة القشقوان مع شرائح دجاج الحبش المدخن." },
  { id: "fajita",       label: "فاهيتا",             details: "جبنة القشقوان مع قطع دجاج الفاهيتا والماشروم والفلفل الأخضر بالإضافة إلى حبات الذرة." },
  { id: "cs1", label: "بيتزا الكريمة",  comingSoon: true },
  { id: "cs2", label: "الثلاثي",         comingSoon: true },
  { id: "cs3", label: "بيتزا البحر",    comingSoon: true },
  { id: "cs4", label: "المكسيكية",       comingSoon: true },
  { id: "cs5", label: "بيتزا الخضار",   comingSoon: true },
];

const SIZES_REGULAR = [
  { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
  { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
  { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
];

const FLOATERS = [
  { e: "🍕", l: "6%",  t: "18%", d: 7,   dl: 0 },
  { e: "🌶️", l: "14%", t: "72%", d: 9,   dl: 1 },
  { e: "🧀", l: "82%", t: "14%", d: 8,   dl: 2 },
  { e: "🍅", l: "88%", t: "65%", d: 6,   dl: .5 },
  { e: "🫒", l: "50%", t: "88%", d: 10,  dl: 3 },
  { e: "🥓", l: "72%", t: "42%", d: 7.5, dl: 1.5 },
];

/* ─────────────────────── COMPONENTS ────────────────────────── */
function PizzaImg({ label, style }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#1c1208,#111)",
      backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 7px,rgba(200,169,106,.04) 7px,rgba(200,169,106,.04) 8px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 5, overflow: "hidden",
      ...style,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1px dashed #C8A96A33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, opacity: .4 }}>🍕</div>
      {label && <span style={{ fontSize: ".52rem", color: "#C8A96A44", textAlign: "center", padding: "0 4px", lineHeight: 1.3 }}>{label}</span>}
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:#0a0a0a}
  ::-webkit-scrollbar-thumb{background:#C8A96A33;border-radius:2px}

  @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0);opacity:.12}50%{transform:translateY(-28px) rotate(7deg);opacity:.21}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes glow{0%,100%{box-shadow:0 0 18px #C8A96A44,0 0 40px #C8A96A22}50%{box-shadow:0 0 32px #C8A96A88,0 0 70px #C8A96A44}}
  @keyframes popIn{0%{opacity:0;transform:scale(.88)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}

  .fade-up{animation:fadeUp .45s ease forwards}
  .pop-in{animation:popIn .35s ease forwards}
  .slide-in{animation:slideIn .38s ease forwards}

  .btn-gold{
    background:linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A);
    background-size:200% auto;border:none;cursor:pointer;
    font-family:inherit;transition:background-position .4s,transform .2s,box-shadow .3s;
  }
  .btn-gold:hover{background-position:right center;transform:translateY(-2px) scale(1.02);box-shadow:0 8px 28px #C8A96A55}
  .btn-gold:active{transform:scale(.97)}
  .btn-gold:disabled{opacity:.35;cursor:not-allowed;transform:none !important;box-shadow:none !important}

  .card-tap{transition:transform .2s,box-shadow .2s,border-color .2s;cursor:pointer}
  .card-tap:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 10px 36px rgba(200,169,106,.18)}
  .card-tap:active{transform:scale(.98)}

  .featured-scroll{
    display:flex;gap:14px;overflow-x:auto;
    scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;
    padding:0 16px 8px;scrollbar-width:none;
  }
  .featured-scroll::-webkit-scrollbar{display:none}

  .featured-card{
    flex:0 0 78vw;max-width:300px;
    scroll-snap-align:start;border-radius:20px;overflow:hidden;
    border:1px solid #252525;transition:border-color .2s,transform .2s;cursor:pointer;
    background:#121212;
  }
  .featured-card:hover{border-color:#C8A96A55;transform:scale(1.02)}
  .featured-card:active{transform:scale(.98)}

  .slice-cell{
    cursor:pointer;border:1.5px solid #242424;border-radius:8px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:62px;padding:6px 4px;gap:3px;
    background:linear-gradient(135deg,#1c0e05,#120a02);
    transition:all .17s;
  }
  .slice-cell:hover{border-color:#C8A96A44;background:#1f1008}
  .slice-cell.selected{border-color:#4DA6FF !important;background:#06111f !important;box-shadow:0 0 12px #4DA6FF44}
  .slice-cell.flavored{border-color:#C8A96A66;background:linear-gradient(135deg,#2a1508,#1a0e05)}

  .flavor-btn{
    cursor:pointer;border:1px solid #1e1e1e;background:#141414;
    border-radius:12px;overflow:hidden;transition:all .17s;
  }
  .flavor-btn:hover:not(.cs){border-color:#C8A96A55;background:#1a1408}
  .flavor-btn.has-fl{border-color:#C8A96A55}
  .flavor-btn.cs{cursor:not-allowed;opacity:.5}

  .size-btn{
    flex:1;padding:12px 6px;border-radius:12px;cursor:pointer;
    font-family:inherit;font-size:.8rem;font-weight:600;
    border:1px solid #252525;background:#141414;color:#E5D3B3;
    transition:all .2s;text-align:center;
  }
  .size-btn:hover{border-color:#C8A96A55}
  .size-btn.active{background:#C8A96A;border-color:#C8A96A;color:#0f0f0f}

  .del-btn{
    background:delivery-btn;border:1px solid #252525;border-radius:12px;
    cursor:pointer;font-family:inherit;font-size:.85rem;font-weight:600;
    transition:all .2s;flex:1;padding:13px;text-align:center;
    background:#141414;color:#666;
  }
  .del-btn.active{border-color:#C8A96A;background:#1c1308;color:#C8A96A}
  .del-btn:hover:not(.active){border-color:#C8A96A33}

  input,textarea{
    background:#161616;border:1px solid #2a2a2a;border-radius:12px;
    color:#E5D3B3;font-size:.9rem;font-family:inherit;outline:none;
    transition:border-color .2s,box-shadow .2s;width:100%;padding:12px 14px;
  }
  input:focus,textarea:focus{border-color:#C8A96A;box-shadow:0 0 0 3px #C8A96A12}
  .err-field{border-color:#ef4444 !important}

  .noise-bg{
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    background-repeat:repeat;
  }
`;

/* ─────────────────── LOCATION PICKER ───────────────────────── */
function LocationPicker({ onSelect }) {
  const mapRef         = useRef(null);
  const markerRef      = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!window.L) return;

    const map = window.L.map(mapRef.current).setView([33.51, 36.29], 12);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();

      markerRef.current = window.L.marker([lat, lng], { draggable: true })
        .addTo(map)
        .bindPopup("موقعك المحدد ✓")
        .openPopup();

      markerRef.current.on("dragend", (ev) => {
        const pos = ev.target.getLatLng();
        onSelect({ lat: pos.lat.toFixed(5), lng: pos.lng.toFixed(5) });
      });

      onSelect({ lat: lat.toFixed(5), lng: lng.toFixed(5) });
    });

    mapInstanceRef.current = map;
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%", height: 260, borderRadius: 14,
        border: "1px solid #C8A96A33", overflow: "hidden", marginBottom: 10,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function PizzaKhanum() {
  const [screen, setScreen]           = useState("landing");
  const [builderPizza, setBuilderPizza] = useState(null);
  const [khanamSize,   setKhanamSize]   = useState(null);
  const [selectedSlices, setSelectedSlices] = useState(new Set());
  const [sliceFlavors,   setSliceFlavors]   = useState({});
  const [detailPizza,  setDetailPizza]  = useState(null);
  const [detailSize,   setDetailSize]   = useState(null);
  const [cart,         setCart]         = useState([]);
  const [phone,        setPhone]        = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [locationTxt,  setLocationTxt]  = useState("");
  const [errors,       setErrors]       = useState({});
  const [mapCoords,    setMapCoords]     = useState(null);

  const cartTotal = cart.reduce((s, i) => s + i.numericPrice * i.qty, 0);
  const fmt = n => n.toLocaleString("ar-EG");

  function addToCart(item) {
    setCart(prev => [...prev, { ...item, qty: 1, uid: Date.now() + Math.random() }]);
  }
  function updateQty(uid, d) {
    setCart(prev => prev.map(i => i.uid === uid ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  }
  function removeItem(uid) {
    setCart(prev => prev.filter(i => i.uid !== uid));
  }

  function toggleSlice(idx) {
    setSelectedSlices(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  }

  function applyFlavor(fid) {
    if (selectedSlices.size === 0) return;
    setSliceFlavors(prev => {
      const n = { ...prev };
      selectedSlices.forEach(i => { n[i] = fid; });
      return n;
    });
    setSelectedSlices(new Set());
  }

  function addBuilderToCart() {
    const perSlice = Object.entries(sliceFlavors)
      .map(([i, fid]) => `شريحة ${+i + 1}: ${FLAVORS.find(f => f.id === fid)?.label}`)
      .join("، ");
    addToCart({
      label: builderPizza.label, size: "",
      details: perSlice || "—",
      priceOld: builderPizza.priceOld, priceNew: builderPizza.priceNew,
      numericPrice: builderPizza.numericPrice,
    });
    setSliceFlavors({}); setSelectedSlices(new Set()); setScreen("menu");
  }

  function addKhanamToCart(fid) {
    const f = FLAVORS.find(x => x.id === fid);
    addToCart({
      label: `بيتزا خانم — ${khanamSize.label}`, size: khanamSize.label,
      details: `المنتصف: ${f?.label} • الأطراف: جبنة شيدر`,
      priceOld: khanamSize.priceOld, priceNew: khanamSize.priceNew,
      numericPrice: khanamSize.numericPrice,
    });
    setKhanamSize(null); setScreen("menu");
  }

  function addDetailToCart() {
    if (!detailSize) return;
    addToCart({
      label: detailPizza.label, size: detailSize.label,
      details: detailPizza.details,
      priceOld: detailSize.priceOld, priceNew: detailSize.priceNew,
      numericPrice: detailSize.numericPrice,
    });
    setDetailSize(null); setScreen("menu");
  }

  function checkout() {
    const errs = {};
    if (!phoneValid)       errs.phone    = true;
    if (!deliveryType)       errs.delivery = true;
    if (deliveryType === "delivery" && !locationTxt.trim()) errs.location = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const lines = cart.map(i => `• ${i.label}${i.size ? ` (${i.size})` : ""} × ${i.qty}\n  ${i.details}\n  السعر: ${i.priceOld} ل.س / ${i.priceNew} ل.ج`).join("\n\n");
    const msg = [
      "مرحباً بيتزا خانم 🍕",
      "",
      "📋 تفاصيل الطلب:",
      lines,
      "",
      `💰 المجموع: ${fmt(cartTotal)} ل.س / ${fmt(cartTotal / 100)} ل.ج`,
      "",
      `🚗 طريقة الاستلام: ${deliveryType === "pickup" ? "استلام من الفرع" : "توصيل"}`,
      deliveryType === "delivery"
        ? `📍 الموقع: ${locationTxt}${mapCoords ? `\n🗺 خريطة: https://maps.google.com/?q=${mapCoords.lat},${mapCoords.lng}` : ""}`
        : "",
      "",
      `📞 رقم التواصل: ${phone}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/963998950904?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const phoneValid  = /^\d{10}$/.test(phone.trim());
  const canCheckout = phoneValid && deliveryType && (deliveryType !== "delivery" || locationTxt.trim());

  /* ─── Header util ─────────────────────────────────── */
  function Header({ title, onBack }) {
    return (
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
        <h2 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>{title}</h2>
      </div>
    );
  }

  /* ─── Flavor grid (shared) ───────────────────────── */
  function FlavorGrid({ onPick, usedMap = {} }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
        {FLAVORS.map(f => {
          const cnt = usedMap[f.id] || 0;
          return (
            <div key={f.id}
              className={`flavor-btn${f.comingSoon ? " cs" : cnt > 0 ? " has-fl" : ""}`}
              onClick={() => { if (f.comingSoon) return; onPick(f.id); }}
            >
              <PizzaImg label="" style={{ width: "100%", height: 68, borderRadius: 0 }} />
              <div style={{ padding: "7px 10px 9px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: ".72rem", fontWeight: 600, color: f.comingSoon ? "#555" : "#E5D3B3" }}>{f.label}</span>
                {f.comingSoon && <span style={{ fontSize: ".55rem", background: "#C8A96A22", color: "#C8A96A88", padding: "1px 6px", borderRadius: 10, flexShrink: 0 }}>قريباً</span>}
                {cnt > 0 && <span style={{ fontSize: ".6rem", background: "#C8A96A", color: "#0f0f0f", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{cnt}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ════════════════ SCREENS ═══════════════════════════ */

  /* ── LANDING ───────────────────────────────────────── */
  if (screen === "landing") return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif" }}>
      <style>{CSS}</style>
      <div className="noise-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)", position: "relative", overflow: "hidden", textAlign: "center", padding: 24 }}>
        {FLOATERS.map((f, i) => (
          <div key={i} style={{ position: "absolute", fontSize: "1.8rem", opacity: .17, left: f.l, top: f.t, animation: `floatUp ${f.d}s ease-in-out ${f.dl}s infinite`, pointerEvents: "none", filter: "blur(.4px)" }}>{f.e}</div>
        ))}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,#C8A96A08,transparent 70%)", pointerEvents: "none" }} />
        <div className="fade-up" style={{ maxWidth: 400 }}>
          <div style={{ width: 106, height: 106, borderRadius: "50%", border: "2px solid #C8A96A44", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", animation: "glow 3s ease-in-out infinite", fontSize: "3rem" }}>🍕</div>
          <h1 style={{ fontSize: "clamp(2.8rem,9vw,4.2rem)", fontWeight: 900, background: "linear-gradient(135deg,#C8A96A,#E5D3B3,#8B6B4A,#C8A96A)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite", lineHeight: 1.1, marginBottom: 14 }}>
            بيتزا خانم
          </h1>
          <p style={{ fontSize: "clamp(.9rem,3vw,1rem)", color: "#8B6B4A", marginBottom: 48, fontWeight: 300, letterSpacing: ".5px", lineHeight: 1.8 }}>
            كُل لتعيش<span style={{ color: "#C8A96A33", margin: "0 10px" }}>·</span>وعِش لأجل البيتزا
          </p>
          <button className="btn-gold" onClick={() => setScreen("menu")} style={{ padding: "16px 52px", borderRadius: "50px", fontSize: "1.05rem", fontWeight: 700, color: "#0f0f0f", letterSpacing: "1px", animation: "glow 3s ease-in-out infinite" }}>
            ابدأ الطلب ✨
          </button>
          <p style={{ marginTop: 18, fontSize: ".68rem", color: "#2a2a2a", letterSpacing: "3px" }}>PIZZA KHANUM • منذ 2020</p>
        </div>
      </div>
    </div>
  );

  /* ── MENU ──────────────────────────────────────────── */
  if (screen === "menu") return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", background: "#0f0f0f", minHeight: "100vh", color: "#E5D3B3", paddingBottom: 100 }}>
      <style>{CSS}</style>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: "linear-gradient(180deg,#0f0f0f 88%,transparent)", padding: "14px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #181818" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 900, background: "linear-gradient(90deg,#C8A96A,#E5D3B3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>بيتزا خانم</span>
        <button onClick={() => setScreen("summary")} style={{ position: "relative", background: "#1a1a1a", border: "1px solid #C8A96A33", borderRadius: 10, color: "#C8A96A", padding: "8px 14px", cursor: "pointer", fontSize: ".78rem", fontFamily: "inherit" }}>
          🧾 الطلب
          {cart.length > 0 && <span style={{ position: "absolute", top: -6, left: -6, background: "#C8A96A", color: "#0f0f0f", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".58rem", fontWeight: 700 }}>{cart.length}</span>}
        </button>
      </div>

      {/* Featured slider */}
      <div style={{ paddingTop: 20 }}>
        <p style={{ fontSize: ".65rem", color: "#C8A96A77", letterSpacing: "3px", padding: "0 16px 12px" }}>⭐ العروض المميّزة</p>
        <div className="featured-scroll">
          {FEATURED.map(fp => (
            <div key={fp.id} className="featured-card"
              onClick={() => {
                if (fp.id === "khanum") { setBuilderPizza(fp); setKhanamSize(null); setScreen("khanum"); }
                else { setBuilderPizza(fp); setSliceFlavors({}); setSelectedSlices(new Set()); setScreen("builder"); }
              }}
            >
              <PizzaImg label={fp.label} style={{ width: "100%", height: 155, borderRadius: 0 }} />
              <div style={{ padding: "12px 13px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h3 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>{fp.label}</h3>
                  <div style={{ textAlign: "left", flexShrink: 0, marginRight: 8 }}>
                    {fp.priceOld
                      ? <><div style={{ fontSize: ".82rem", fontWeight: 900, color: "#C8A96A", whiteSpace: "nowrap" }}>{fp.priceOld} ل.س</div>
                          <div style={{ fontSize: ".6rem", color: "#8B6B4A" }}>{fp.priceNew} ل.ج</div></>
                      : <div style={{ fontSize: ".68rem", color: "#8B6B4A" }}>حسب الحجم</div>
                    }
                  </div>
                </div>
                <p style={{ fontSize: ".68rem", color: "#8B6B4A", lineHeight: 1.5, marginBottom: 10 }}>{fp.desc}</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#C8A96A18", border: "1px solid #C8A96A33", borderRadius: 20, padding: "4px 12px" }}>
                  <span style={{ fontSize: ".68rem", color: "#C8A96A" }}>اختر النكهات</span>
                  <span style={{ color: "#C8A96A", fontSize: ".8rem" }}>←</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pizza menu */}
      <div style={{ padding: "28px 16px 0" }}>
        <p style={{ fontSize: ".65rem", color: "#C8A96A77", letterSpacing: "3px", marginBottom: 14 }}>🍕 قائمة البيتزا</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {PIZZAS_MENU.map(p => (
            <div key={p.id}
              className={p.comingSoon ? "" : "card-tap"}
              style={{ background: "#131313", border: "1px solid #1c1c1c", borderRadius: 14, overflow: "hidden", cursor: p.comingSoon ? "default" : "pointer", opacity: p.comingSoon ? .55 : 1 }}
              onClick={() => { if (p.comingSoon) return; setDetailPizza(p); setDetailSize(null); setScreen("pizza_detail"); }}
            >
              <PizzaImg label={p.label} style={{ width: "100%", height: 88, borderRadius: 0 }} />
              <div style={{ padding: "9px 9px 11px" }}>
                <p style={{ fontSize: ".76rem", fontWeight: 600, color: p.comingSoon ? "#555" : "#E5D3B3", marginBottom: 4 }}>{p.label}</p>
                {p.comingSoon
                  ? <span style={{ fontSize: ".58rem", background: "#C8A96A22", color: "#C8A96A88", padding: "2px 8px", borderRadius: 20 }}>قريباً</span>
                  : <p style={{ fontSize: ".6rem", color: "#555", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.details}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cart */}
      {cart.length > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40 }}>
          <button className="btn-gold pop-in" onClick={() => setScreen("summary")} style={{ padding: "13px 28px", borderRadius: "50px", fontSize: ".88rem", fontWeight: 700, color: "#0f0f0f", boxShadow: "0 8px 28px #00000099", display: "flex", alignItems: "center", gap: 10 }}>
            <span>🧾 عرض الطلب</span>
            <span style={{ background: "#0f0f0f22", borderRadius: 20, padding: "2px 10px", fontSize: ".8rem" }}>{fmt(cartTotal)} ل.س</span>
          </button>
        </div>
      )}
    </div>
  );

  /* ── BUILDER (المتر / 60×40) ────────────────────────── */
  if (screen === "builder" && builderPizza) {
    const { sliceCount, cols } = builderPizza;
    const filledCount = Object.keys(sliceFlavors).length;
    const usedMap = FLAVORS.reduce((acc, f) => {
      acc[f.id] = Object.values(sliceFlavors).filter(v => v === f.id).length;
      return acc;
    }, {});

    return (
      <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", background: "#0d0d0d", minHeight: "100vh", color: "#E5D3B3", paddingBottom: 120 }}>
        <style>{CSS}</style>
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setScreen("menu")} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>{builderPizza.label}</h2>
            <p style={{ fontSize: ".66rem", color: "#8B6B4A" }}>
              {selectedSlices.size > 0 ? `${selectedSlices.size} شريحة محددة — اختر نكهة من الأسفل` : `${filledCount}/${sliceCount} شرائح`}
            </p>
          </div>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: sliceCount }, (_, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: sliceFlavors[i] ? "#C8A96A" : "#222", transition: "background .3s" }} />
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          {/* Hint */}
          <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 12, padding: "9px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.1rem" }}>{selectedSlices.size === 0 ? "☝️" : "🎨"}</span>
            <p style={{ fontSize: ".72rem", color: "#8B6B4A", lineHeight: 1.5 }}>
              {selectedSlices.size === 0
                ? "اضغط على شريحة أو أكثر لتحديدها، ثم اختر النكهة"
                : `${selectedSlices.size} شريحة محددة — اضغط على نكهة لتطبيقها`}
            </p>
          </div>

          {/* Rectangular pizza */}
          <div style={{ background: "linear-gradient(135deg,#1c1008,#100a04)", border: "2px solid #C8A96A22", borderRadius: 16, padding: 12, marginBottom: 18 }}>
            <p style={{ fontSize: ".6rem", color: "#C8A96A44", textAlign: "center", marginBottom: 10, letterSpacing: "2px" }}>{builderPizza.label} · اضغط لتحديد الشرائح</p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 7 }}>
              {Array.from({ length: sliceCount }, (_, i) => {
                const fid   = sliceFlavors[i];
                const flbl  = fid ? FLAVORS.find(f => f.id === fid)?.label : null;
                const isSel = selectedSlices.has(i);
                const isFilled = !!fid;
                return (
                  <div key={i} className={`slice-cell${isSel ? " selected" : isFilled ? " flavored" : ""}`} onClick={() => toggleSlice(i)}>
                    {isFilled
                      ? <><PizzaImg label="" style={{ width: "100%", height: 28, borderRadius: 4 }} />
                          <span style={{ fontSize: ".52rem", color: "#C8A96A", fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{flbl}</span></>
                      : <><div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px ${isSel ? "solid #4DA6FF" : "dashed #333"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isSel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4DA6FF" }} />}
                          </div>
                          <span style={{ fontSize: ".5rem", color: "#333" }}>{i + 1}</span>
                        </>
                    }
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add to cart */}
          {filledCount > 0 && (
            <div className="pop-in" style={{ marginBottom: 14 }}>
              <button className="btn-gold" onClick={addBuilderToCart} style={{ width: "100%", padding: "12px", borderRadius: 12, fontSize: ".88rem", fontWeight: 700, color: "#0f0f0f" }}>
                إضافة للطلب — {builderPizza.priceOld} ل.س
              </button>
            </div>
          )}

          {/* Flavors */}
          <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px", marginBottom: 12 }}>النكهات المتاحة</p>
          <FlavorGrid onPick={applyFlavor} usedMap={usedMap} />

          {filledCount > 0 && (
            <button onClick={() => { setSliceFlavors({}); setSelectedSlices(new Set()); }} style={{ marginTop: 14, width: "100%", padding: 10, background: "none", border: "1px solid #1e1e1e", borderRadius: 12, color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: ".75rem" }}>
              🔄 إعادة التعيين
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── KHANUM (size → single flavor) ─────────────────── */
  if (screen === "khanum" && builderPizza) return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", background: "#0d0d0d", minHeight: "100vh", color: "#E5D3B3", paddingBottom: 100 }}>
      <style>{CSS}</style>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => { setScreen("menu"); setKhanamSize(null); }} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
        <div>
          <h2 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>بيتزا خانم</h2>
          <p style={{ fontSize: ".66rem", color: "#8B6B4A" }}>{khanamSize ? "اختر نكهة المنتصف" : "اختر الحجم أولاً"}</p>
        </div>
      </div>

      <div style={{ padding: "18px 16px" }}>
        {/* Info card */}
        <div style={{ background: "#141414", border: "1px solid #C8A96A22", borderRadius: 16, padding: 14, marginBottom: 22, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <PizzaImg label="" style={{ width: 76, height: 76, borderRadius: 12, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: ".88rem", fontWeight: 700, color: "#C8A96A", marginBottom: 6 }}>بيتزا خانم</p>
            <p style={{ fontSize: ".7rem", color: "#8B6B4A", lineHeight: 1.6 }}>{builderPizza.desc}</p>
          </div>
        </div>

        {/* Size selector */}
        {!khanamSize && (
          <div className="slide-in">
            <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px", marginBottom: 12 }}>اختر الحجم</p>
            <div style={{ display: "flex", gap: 10 }}>
              {builderPizza.sizes.map(sz => (
                <button key={sz.id} className="size-btn" onClick={() => setKhanamSize(sz)}
                  style={{ padding: "16px 8px" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{sz.id === "sm" ? "🔸" : "🔶"}</div>
                  <div style={{ color: "#E5D3B3", marginBottom: 5 }}>{sz.label}</div>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#C8A96A" }}>{sz.priceOld} ل.س</div>
                  <div style={{ fontSize: ".62rem", color: "#8B6B4A" }}>{sz.priceNew} ل.ج</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flavor picker */}
        {khanamSize && (
          <div className="slide-in">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px" }}>نكهة المنتصف</p>
              <button onClick={() => setKhanamSize(null)} style={{ fontSize: ".68rem", color: "#555", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>← تغيير الحجم</button>
            </div>
            <FlavorGrid onPick={addKhanamToCart} />
          </div>
        )}
      </div>
    </div>
  );

  /* ── PIZZA DETAIL ────────────────────────────────────── */
  if (screen === "pizza_detail" && detailPizza) return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", background: "#0d0d0d", minHeight: "100vh", color: "#E5D3B3", paddingBottom: 100 }}>
      <style>{CSS}</style>
      <Header title={detailPizza.label} onBack={() => setScreen("menu")} />

      <div style={{ padding: "18px 16px" }}>
        <PizzaImg label={detailPizza.label} style={{ width: "100%", height: 195, borderRadius: 18, marginBottom: 20 }} />
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#E5D3B3", marginBottom: 8 }}>{detailPizza.label}</h2>
        <p style={{ fontSize: ".78rem", color: "#8B6B4A", lineHeight: 1.7, marginBottom: 26, borderRight: "2px solid #C8A96A33", paddingRight: 12 }}>{detailPizza.details}</p>

        <p style={{ fontSize: ".65rem", color: "#C8A96A88", letterSpacing: "2px", marginBottom: 12 }}>اختر الحجم</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {SIZES_REGULAR.map(sz => (
            <button key={sz.id} className={`size-btn${detailSize?.id === sz.id ? " active" : ""}`} onClick={() => setDetailSize(sz)}>
              <div style={{ marginBottom: 4, fontWeight: 700 }}>{sz.label}</div>
              <div style={{ fontSize: ".8rem", fontWeight: 700, color: detailSize?.id === sz.id ? "#0f0f0f" : "#C8A96A" }}>{sz.priceOld} ل.س</div>
              <div style={{ fontSize: ".6rem", opacity: .75, marginTop: 2 }}>{sz.priceNew} ل.ج</div>
            </button>
          ))}
        </div>

        <button className="btn-gold" disabled={!detailSize} onClick={addDetailToCart} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: ".92rem", fontWeight: 700, color: "#0f0f0f" }}>
          {detailSize ? `إضافة للطلب — ${detailSize.priceOld} ل.س` : "اختر الحجم أولاً"}
        </button>
      </div>
    </div>
  );

  /* ── SUMMARY ──────────────────────────────────────────── */
  if (screen === "summary") return (
    <div dir="rtl" style={{ fontFamily: "'Noto Kufi Arabic',sans-serif", background: "#0d0d0d", minHeight: "100vh", color: "#E5D3B3", paddingBottom: 50 }}>
      <style>{CSS}</style>
      <Header title="ملخّص الطلب" onBack={() => setScreen("menu")} />

      <div style={{ padding: "18px 16px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "4rem", marginBottom: 14, opacity: .22 }}>🛒</div>
            <p style={{ color: "#8B6B4A", fontSize: ".88rem", marginBottom: 20 }}>لا يوجد طلبات بعد</p>
            <button className="btn-gold" onClick={() => setScreen("menu")} style={{ padding: "12px 28px", borderRadius: 30, fontSize: ".85rem", fontWeight: 700, color: "#0f0f0f" }}>تصفّح القائمة</button>
          </div>
        ) : (<>
          {/* Items */}
          <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px", marginBottom: 12 }}>الطلبات ({cart.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {cart.map(item => (
              <div key={item.uid} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 14, padding: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: "#E5D3B3", fontSize: ".86rem" }}>{item.label}</p>
                    <p style={{ fontSize: ".63rem", color: "#555", marginTop: 3, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.details}</p>
                  </div>
                  <div style={{ textAlign: "left", marginRight: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: ".8rem", fontWeight: 700, color: "#C8A96A" }}>{item.priceOld} ل.س</div>
                    <div style={{ fontSize: ".58rem", color: "#8B6B4A" }}>{item.priceNew} ل.ج</div>
                  </div>
                </div>
                {/* Qty + delete */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #242424", borderRadius: 10, overflow: "hidden" }}>
                    <button onClick={() => updateQty(item.uid, -1)} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", width: 34, height: 32, fontSize: "1rem", fontFamily: "inherit" }}>−</button>
                    <span style={{ width: 30, textAlign: "center", fontSize: ".84rem", fontWeight: 600, color: "#E5D3B3" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.uid, +1)} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", width: 34, height: 32, fontSize: "1rem", fontFamily: "inherit" }}>+</button>
                  </div>
                  <span style={{ fontSize: ".8rem", color: "#C8A96A", fontWeight: 700 }}>{fmt(item.numericPrice * item.qty)} ل.س</span>
                  <button onClick={() => removeItem(item.uid)} style={{ background: "#180f0f", border: "1px solid #2a1818", borderRadius: 8, color: "#6a2a2a", cursor: "pointer", width: 32, height: 32, fontSize: ".82rem", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14, marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#8B6B4A", fontSize: ".85rem" }}>المجموع</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#C8A96A" }}>{fmt(cartTotal)} ل.س</div>
              <div style={{ fontSize: ".66rem", color: "#8B6B4A" }}>{fmt(cartTotal / 100)} ل.ج</div>
            </div>
          </div>

          {/* Delivery */}
          <p style={{ fontSize: ".65rem", color: errors.delivery ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 10 }}>
            {errors.delivery ? "⚠ هذا الحقل إلزامي" : "طريقة الاستلام *"}
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: deliveryType === "delivery" ? 14 : 22 }}>
            {[{ v: "pickup", l: "🏪 استلام من الفرع" }, { v: "delivery", l: "🛵 توصيل" }].map(o => (
              <button key={o.v} className={`del-btn${deliveryType === o.v ? " active" : ""}`}
                onClick={() => { setDeliveryType(o.v); setErrors(e => ({ ...e, delivery: false })); }}>
                {o.l}
              </button>
            ))}
          </div>

          {/* Location */}
          {deliveryType === "delivery" && (
            <div className="pop-in" style={{ marginBottom: 18 }}>
              <p style={{ fontSize: ".65rem", color: errors.location ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 10 }}>
                {errors.location ? "⚠ حدد موقعك أو اكتب العنوان" : "📍 حدد موقعك على الخريطة *"}
              </p>

              <LocationPicker onSelect={(coords) => {
                setMapCoords(coords);
                setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`);
                setErrors(ev => ({ ...ev, location: false }));
              }} />

              {mapCoords && (
                <div style={{ background: "#0d1a0d", border: "1px solid #4CAF5044", borderRadius: 10, padding: "9px 14px", marginBottom: 12, fontSize: ".72rem", color: "#4CAF50" }}>
                  ✓ تم تحديد الموقع — يمكنك سحب الدبوس لتعديله
                </div>
              )}

              <p style={{ fontSize: ".63rem", color: "#555", marginBottom: 8 }}>أو اكتب العنوان يدوياً</p>
              <textarea
                className={errors.location ? "err-field" : ""}
                rows={2}
                placeholder="المحافظة، الحي، الشارع، أقرب نقطة دالة..."
                value={mapCoords ? "" : locationTxt}
                onChange={e => {
                  setLocationTxt(e.target.value);
                  setMapCoords(null);
                  setErrors(ev => ({ ...ev, location: false }));
                }}
                style={{ resize: "none" }}
              />
            </div>
          )}

          {/* Phone */}
          <p style={{ fontSize: ".65rem", color: errors.phone ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 8 }}>
            {errors.phone ? "⚠ رقم الهاتف إلزامي" : "رقم الهاتف للتواصل *"}
          </p>
          <input
            type="tel"
            className={errors.phone || (phone.length > 0 && phone.length !== 10) ? "err-field" : ""}
            placeholder="09xxxxxxxx"
            value={phone}
            maxLength={10}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, "");
              setPhone(val);
              setErrors(ev => ({ ...ev, phone: false }));
            }}
            style={{ marginBottom: 4 }}
          />
          {/* Live digit counter */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <p style={{ fontSize: ".62rem", color: "#383838" }}>هذا الحقل إلزامي، يجب أن يكون 10 أرقام بالضبط</p>
            <span style={{
              fontSize: ".62rem", fontWeight: 700,
              color: phone.length === 0 ? "#333" : phone.length === 10 ? "#4CAF50" : "#ef4444"
            }}>
              {phone.length}/10
            </span>
          </div>
          {phone.length > 0 && phone.length < 10 && (
            <p style={{ fontSize: ".62rem", color: "#ef4444", marginBottom: 12, marginTop: -12 }}>
              ⚠ الرقم ناقص — أدخل {10 - phone.length} أرقام إضافية
            </p>
          )}

          {/* Checkout */}
          <button className="btn-gold" disabled={!canCheckout} onClick={checkout}
            style={{ width: "100%", padding: "14px", borderRadius: 13, fontSize: ".92rem", fontWeight: 700, color: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ fontSize: "1.1rem" }}>📲</span>
            إرسال الطلب عبر واتساب
          </button>
          {!canCheckout && (
            <p style={{ textAlign: "center", fontSize: ".65rem", color: "#333", marginTop: 8 }}>
              {!phoneValid
                ? phone.length === 0 ? "أدخل رقم هاتفك لإتمام الطلب" : `الرقم يجب أن يكون 10 أرقام (أدخلت ${phone.length})`
                : !deliveryType ? "اختر طريقة الاستلام"
                : "أدخل موقعك لإتمام الطلب"}
            </p>
          )}
        </>)}
      </div>
    </div>
  );

  return null;
}
