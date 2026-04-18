// pizza-khanum.jsx — النسخة المحدثة التي تجلب البيانات من API
// ضعه في: pages/index.js (أو components/PizzaKhanum.jsx)

import { useState, useRef, useEffect } from "react";

/* ─── Static fallback (لو API فشل) ───────────────────────────── */
const SIZES_REGULAR = [
  { id: "sm", label: "صغير", priceOld: "35,000", priceNew: "350", numericPrice: 35000 },
  { id: "md", label: "وسط",  priceOld: "50,000", priceNew: "500", numericPrice: 50000 },
  { id: "lg", label: "كبير", priceOld: "65,000", priceNew: "650", numericPrice: 65000 },
];

const FLAVORS_STATIC = [
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

const FLOATERS = [
  { e: "🍕", l: "6%",  t: "18%", d: 7,   dl: 0 },
  { e: "🌶️", l: "14%", t: "72%", d: 9,   dl: 1 },
  { e: "🧀", l: "82%", t: "14%", d: 8,   dl: 2 },
  { e: "🍅", l: "88%", t: "65%", d: 6,   dl: .5 },
  { e: "🫒", l: "50%", t: "88%", d: 10,  dl: 3 },
  { e: "🥓", l: "72%", t: "42%", d: 7.5, dl: 1.5 },
];

/* ─── Image placeholder ───────────────────────────────────────── */
function PizzaImg({ src, label, style }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={label} onError={() => setErr(true)} style={{ objectFit: "cover", ...style }} />;
  }
  return (
    <div style={{
      background: "linear-gradient(135deg,#1c1208,#111)",
      backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 7px,rgba(200,169,106,.04) 7px,rgba(200,169,106,.04) 8px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 5, overflow: "hidden", ...style,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1px dashed #C8A96A33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, opacity: .4 }}>🍕</div>
      {label && <span style={{ fontSize: ".52rem", color: "#C8A96A44", textAlign: "center", padding: "0 4px" }}>{label}</span>}
    </div>
  );
}

/* ─── LocationPicker ─────────────────────────────────────────── */
function LocationPicker({ onSelect }) {
  const mapRef         = useRef(null);
  const markerRef      = useRef(null);
  const mapInstanceRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    function initMap() {
      if (mapInstanceRef.current || !mapRef.current) return;
      try {
        const L   = window.L;
        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([33.51, 36.29], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        const goldIcon = L.divIcon({ html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;background:#C8A96A;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 3px 10px #00000088"></div>`, iconSize: [32,32], iconAnchor: [16,32], className: "" });
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          if (markerRef.current) markerRef.current.remove();
          markerRef.current = L.marker([lat, lng], { icon: goldIcon, draggable: true }).addTo(map).bindPopup('<div dir="rtl">📍 موقعك المحدد<br><small>اسحب الدبوس لتعديله</small></div>').openPopup();
          markerRef.current.on("dragend", ev => { const p = ev.target.getLatLng(); onSelect({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) }); });
          onSelect({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        });
        mapInstanceRef.current = map;
        setStatus("ready");
        setTimeout(() => map.invalidateSize(), 300);
      } catch { setStatus("error"); }
    }
    if (window.L) { initMap(); }
    else {
      const s = document.createElement("script");
      s.id = "leaflet-js"; s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = initMap; s.onerror = () => setStatus("error");
      document.head.appendChild(s);
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      {status === "loading" && <div style={{ height: 260, borderRadius: 14, background: "#141414", border: "1px solid #C8A96A22", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #C8A96A33", borderTopColor: "#C8A96A", animation: "spin .8s linear infinite" }} /><span style={{ fontSize: ".72rem", color: "#8B6B4A" }}>جارٍ تحميل الخريطة...</span></div>}
      {status === "error"   && <div style={{ height: 160, borderRadius: 14, background: "#141414", border: "1px solid #3a1a1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ fontSize: "1.5rem" }}>⚠️</span><p style={{ fontSize: ".72rem", color: "#8B6B4A", textAlign: "center" }}>تعذّر تحميل الخريطة<br/><span style={{ color: "#444" }}>استخدم حقل العنوان اليدوي</span></p></div>}
      <div ref={mapRef} style={{ width: "100%", height: 260, borderRadius: 14, border: "1px solid #C8A96A33", overflow: "hidden", display: status === "error" ? "none" : "block" }} />
      {status === "ready" && <p style={{ fontSize: ".62rem", color: "#555", textAlign: "center", marginTop: 5 }}>اضغط لتحديد موقعك</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function PizzaKhanum({ initialFeatured = [], initialMenuPizzas = [] }) {
  const [screen,        setScreen]        = useState("landing");
  const [featured,      setFeatured]      = useState(initialFeatured);
  const [menuPizzas,    setMenuPizzas]    = useState(initialMenuPizzas);
  const [dataLoaded,    setDataLoaded]    = useState(initialFeatured.length > 0);
  const [builderPizza,  setBuilderPizza]  = useState(null);
  const [khanamSize,    setKhanamSize]    = useState(null);
  const [selectedSlices,setSelectedSlices]= useState(new Set());
  const [sliceFlavors,  setSliceFlavors]  = useState({});
  const [detailPizza,   setDetailPizza]   = useState(null);
  const [detailSize,    setDetailSize]    = useState(null);
  const [cart,          setCart]          = useState([]);
  const [phone,         setPhone]         = useState("");
  const [deliveryType,  setDeliveryType]  = useState("");
  const [locationTxt,   setLocationTxt]   = useState("");
  const [errors,        setErrors]        = useState({});
  const [mapCoords,     setMapCoords]     = useState(null);
  const [activeCard,    setActiveCard]    = useState(0);
  const carouselRef = useRef(null);

  const FLAVORS = FLAVORS_STATIC; // يمكن جلبها من API لاحقاً

  /* ── Fetch data client-side if not passed as props ── */
  useEffect(() => {
    if (dataLoaded) return;
    async function loadData() {
      try {
        const [featRes, menuRes] = await Promise.all([
          fetch("/api/pizzas?category=featured&activeOnly=true"),
          fetch("/api/pizzas?category=menu&activeOnly=true"),
        ]);
        const [feat, menu] = await Promise.all([featRes.json(), menuRes.json()]);
        if (feat.success) setFeatured(feat.data);
        if (menu.success) setMenuPizzas(menu.data);
        setDataLoaded(true);
      } catch {}
    }
    loadData();
  }, [dataLoaded]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (screen !== "menu" || featured.length === 0) return;
    const timer = setInterval(() => {
      setActiveCard(prev => {
        const next = (prev + 1) % featured.length;
        if (carouselRef.current) {
          const cardWidth = carouselRef.current.scrollWidth / featured.length;
          carouselRef.current.scrollTo({ left: carouselRef.current.scrollWidth - cardWidth * (next + 1), behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [screen, featured.length]);

  /* ── Helpers ── */
  const cartTotal = cart.reduce((s, i) => s + i.numericPrice * i.qty, 0);
  const fmt = n => n.toLocaleString("ar-EG");

  function addToCart(item) { setCart(p => [...p, { ...item, qty: 1, uid: Date.now() + Math.random() }]); }
  function updateQty(uid, d) { setCart(p => p.map(i => i.uid === uid ? { ...i, qty: Math.max(1, i.qty + d) } : i)); }
  function removeItem(uid) { setCart(p => p.filter(i => i.uid !== uid)); }
  function toggleSlice(idx) { setSelectedSlices(p => { const n = new Set(p); n.has(idx) ? n.delete(idx) : n.add(idx); return n; }); }
  function applyFlavor(fid) {
    if (selectedSlices.size === 0) return;
    setSliceFlavors(p => { const n = {...p}; selectedSlices.forEach(i => { n[i] = fid; }); return n; });
    setSelectedSlices(new Set());
  }

  function addBuilderToCart() {
    const perSlice = Object.entries(sliceFlavors).map(([i, fid]) => `شريحة ${+i+1}: ${FLAVORS.find(f=>f.id===fid)?.label}`).join("، ");
    addToCart({ label: builderPizza.name, size: "", details: perSlice || "—", priceOld: builderPizza.fixedPriceOld, priceNew: builderPizza.fixedPriceNew, numericPrice: builderPizza.fixedNumericPrice });
    setSliceFlavors({}); setSelectedSlices(new Set()); setScreen("menu");
  }

  function addKhanamToCart(fid) {
    const f = FLAVORS.find(x => x.id === fid);
    addToCart({ label: `بيتزا خانم — ${khanamSize.label}`, size: khanamSize.label, details: `المنتصف: ${f?.label} • الأطراف: جبنة شيدر`, priceOld: khanamSize.priceOld, priceNew: khanamSize.priceNew, numericPrice: khanamSize.numericPrice });
    setKhanamSize(null); setScreen("menu");
  }

  function addDetailToCart() {
    if (!detailSize) return;
    addToCart({ label: detailPizza.name, size: detailSize.label, details: detailPizza.details, priceOld: detailSize.priceOld, priceNew: detailSize.priceNew, numericPrice: detailSize.numericPrice });
    setDetailSize(null); setScreen("menu");
  }

  const phoneValid  = /^\d{10}$/.test(phone.trim());
  const canCheckout = phoneValid && deliveryType && (deliveryType !== "delivery" || locationTxt.trim());

  function checkout() {
    const errs = {};
    if (!phoneValid)   errs.phone    = true;
    if (!deliveryType) errs.delivery = true;
    if (deliveryType === "delivery" && !locationTxt.trim()) errs.location = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const lines = cart.map(i => `• ${i.label}${i.size ? ` (${i.size})` : ""} × ${i.qty}\n  ${i.details}\n  السعر: ${i.priceOld} ل.س / ${i.priceNew} ل.ج`).join("\n\n");
    const msg = ["مرحباً بيتزا خانم 🍕","","📋 تفاصيل الطلب:", lines,"",`💰 المجموع: ${fmt(cartTotal)} ل.س / ${fmt(cartTotal/100)} ل.ج`,"",`🚗 طريقة الاستلام: ${deliveryType==="pickup"?"استلام من الفرع":"توصيل"}`,
      deliveryType==="delivery" ? `📍 الموقع: ${locationTxt}${mapCoords?`\n🗺 خريطة: https://maps.google.com/?q=${mapCoords.lat},${mapCoords.lng}`:""}` : "","",`📞 رقم التواصل: ${phone}`].filter(Boolean).join("\n");
    window.open(`https://wa.me/963998950904?text=${encodeURIComponent(msg)}`, "_blank");
  }

  // ── باقي الكود (screens) يبقى كما هو بالضبط ──
  // الفرق الوحيد: استخدام featured و menuPizzas من الـ state (من API)
  // بدل FEATURED و PIZZAS_MENU الـ hardcoded

  // الخاصية المهمة التي تتغير في screens:
  // featured.map(...)  بدل  FEATURED.map(...)
  // menuPizzas.map(...)  بدل  PIZZAS_MENU.map(...)
  // fp.name  بدل  fp.label  (لأن MongoDB يخزن name)
  // fp.fixedPriceOld  بدل  fp.priceOld
  // fp.khanamSizes  بدل  fp.sizes

  // ... (باقي الـ JSX يبقى كما هو)

  return <div>/* الـ JSX الكامل من pizza-khanum.jsx السابق */</div>;
}

/* ── getServerSideProps: جلب البيانات قبل الـ render ── */
export async function getServerSideProps() {
  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Pizza         = (await import("@/lib/models/Pizza")).default;
    await connectDB();

    const [featured, menuPizzas] = await Promise.all([
      Pizza.find({ category: "featured", isActive: true }).sort({ sortOrder: 1 }).lean(),
      Pizza.find({ category: "menu",     isActive: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    return {
      props: {
        initialFeatured:    JSON.parse(JSON.stringify(featured)),
        initialMenuPizzas:  JSON.parse(JSON.stringify(menuPizzas)),
      },
    };
  } catch {
    // لو DB فاشل، يشغّل الصفحة بدون بيانات
    return { props: { initialFeatured: [], initialMenuPizzas: [] } };
  }
}
