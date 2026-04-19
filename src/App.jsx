// pages/index.js
import { useState, useRef, useEffect } from “react”;

/* ═══════════════════════════ DATA ═══════════════════════════════ */
const FEATURED = [
{
id: “meter”, label: “بيتزا المتر”,
priceOld: “150,000”, priceNew: “1,500”, numericPrice: 150000,
sliceCount: 6, cols: 6,                       // ← 6 قطع، صف واحد
desc: “متر كامل من الشهية المتنوعة لتشاركه مع أحبّك”,
},
{
id: “sixtyforty”, label: “بيتزا 60×40”,
priceOld: “140,000”, priceNew: “1,400”, numericPrice: 140000,
sliceCount: 6, cols: 6,
desc: “الحجم العائلي المثالي للتجمعات”,
},
{
id: “khanum”, label: “بيتزا خانم”,
priceOld: null, priceNew: null,
desc: “كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨”,
sizes: [
{ id: “sm”, label: “صغيرة”, priceOld: “45,000”, priceNew: “450”, numericPrice: 45000 },
{ id: “lg”, label: “كبيرة”, priceOld: “60,000”, priceNew: “600”, numericPrice: 60000 },
],
},
];

const FLAVORS = [
{ id: “4seasons”,      label: “الفصول الأربعة” },
{ id: “margarita”,    label: “مارغريتا” },
{ id: “hawaii”,       label: “هاواي” },
{ id: “teamscheese”,  label: “التيمات تشيز” },
{ id: “supersupreme”, label: “سوبر سوبريم” },
{ id: “chickenbbq”,   label: “تشيكن باربيكيو” },
{ id: “peperoni”,     label: “ببروني” },
{ id: “salami”,       label: “سلامي” },
{ id: “hotdog”,       label: “هوت دوغ” },
{ id: “smokedchicken”,label: “دجاج مدخن” },
{ id: “fajita”,       label: “فاهيتا” },
{ id: “cs1”, label: “بيتزا الكريمة”, comingSoon: true },
{ id: “cs2”, label: “الثلاثي”,        comingSoon: true },
{ id: “cs3”, label: “بيتزا البحر”,   comingSoon: true },
{ id: “cs4”, label: “المكسيكية”,      comingSoon: true },
{ id: “cs5”, label: “بيتزا الخضار”,  comingSoon: true },
];

const PIZZAS_MENU = [
{ id: “4seasons”,      label: “الفصول الأربعة”,  details: “جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء بالإضافة إلى حبات الطماطم والذرة.” },
{ id: “margarita”,    label: “مارغريتا”,          details: “جبنة القشقوان مع الصلصة الحمراء.” },
{ id: “hawaii”,       label: “هاواي”,             details: “جبنة القشقوان مع الموزريلا وقطع البيروني بالإضافة إلى شرائح الأناناس.” },
{ id: “teamscheese”,  label: “التيمات تشيز”,      details: “جبنة القشقوان مع موزريلا بالإضافة لكرات الطماطم والريحان.” },
{ id: “supersupreme”, label: “سوبر سوبريم”,       details: “المزيج المشهور والشهي من البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود.” },
{ id: “chickenbbq”,   label: “تشيكن باربيكيو”,   details: “شرائح الدجاج مغمورة بصوص الباربيكيو اللذيذ وجبنة القشقوان مع شرائح البصل.” },
{ id: “peperoni”,     label: “ببروني”,            details: “جبنة القشقوان مع المزيج الشهي من شرائح البيروني لحم البقر مع الثوم والكزبرة.” },
{ id: “salami”,       label: “سلامي”,             details: “جبنة القشقوان مع شرائح لحم البقر.” },
{ id: “hotdog”,       label: “هوت دوغ”,           details: “جبنة القشقوان مع حبات الهوت دوغ المدخن.” },
{ id: “smokedchicken”,label: “دجاج مدخن”,         details: “جبنة القشقوان مع شرائح دجاج الحبش المدخن.” },
{ id: “fajita”,       label: “فاهيتا”,            details: “جبنة القشقوان مع قطع دجاج الفاهيتا والماشروم والفلفل الأخضر بالإضافة إلى حبات الذرة.” },
{ id: “cs1”, label: “بيتزا الكريمة”, comingSoon: true },
{ id: “cs2”, label: “الثلاثي”,        comingSoon: true },
{ id: “cs3”, label: “بيتزا البحر”,   comingSoon: true },
{ id: “cs4”, label: “المكسيكية”,      comingSoon: true },
{ id: “cs5”, label: “بيتزا الخضار”,  comingSoon: true },
];

const SIZES_REGULAR = [
{ id: “sm”, label: “صغير”, priceOld: “35,000”, priceNew: “350”, numericPrice: 35000 },
{ id: “md”, label: “وسط”,  priceOld: “50,000”, priceNew: “500”, numericPrice: 50000 },
{ id: “lg”, label: “كبير”, priceOld: “65,000”, priceNew: “650”, numericPrice: 65000 },
];

const FLOATERS = [
{ e: “🍕”, l: “5%”,  t: “14%”, d: 7,   dl: 0   },
{ e: “🌶️”, l: “11%”, t: “71%”, d: 9,   dl: 1   },
{ e: “🧀”, l: “83%”, t: “11%”, d: 8,   dl: 2   },
{ e: “🍅”, l: “87%”, t: “64%”, d: 6,   dl: 0.5 },
{ e: “🫒”, l: “50%”, t: “87%”, d: 10,  dl: 3   },
{ e: “🥓”, l: “72%”, t: “39%”, d: 7.5, dl: 1.5 },
];

const HAMA = [35.1318, 36.7551];

/* ═══════════════════════════ CSS ════════════════════════════════ */
const CSS = `
@import url(‘https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap’);
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #C8A96A33; border-radius: 2px; }

@keyframes floatUp  { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.12} 50%{transform:translateY(-26px) rotate(6deg);opacity:.22} }
@keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes glow     { 0%,100%{box-shadow:0 0 18px #C8A96A44,0 0 40px #C8A96A22} 50%{box-shadow:0 0 32px #C8A96A88,0 0 70px #C8A96A44} }
@keyframes popIn    { 0%{opacity:0;transform:scale(.86)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
@keyframes slideIn  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes slideUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

.fade-up  { animation: fadeUp  .45s ease forwards; }
.pop-in   { animation: popIn   .35s ease forwards; }
.slide-in { animation: slideIn .38s ease forwards; }
.slide-up { animation: slideUp .3s ease forwards; }

.btn-gold {
background: linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A);
background-size: 200% auto; border: none; cursor: pointer; font-family: inherit;
transition: background-position .4s, transform .18s, box-shadow .3s;
}
.btn-gold:hover   { background-position: right center; transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 28px #C8A96A55; }
.btn-gold:active  { transform: scale(.97) !important; }
.btn-gold:disabled{ opacity: .35; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

.card-tap { transition: transform .2s, box-shadow .2s, border-color .2s; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.card-tap:hover  { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200,169,106,.15); border-color: #C8A96A55 !important; }
.card-tap:active { transform: scale(.97) !important; }

/* ── Slice cells ── */
.sc { cursor:pointer; border:1.5px solid #2a2a2a; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:8px 4px; gap:4px; background:linear-gradient(135deg,#1c0e05,#120a02); transition:all .18s; -webkit-tap-highlight-color:transparent; aspect-ratio:1; }
.sc:hover  { border-color:#C8A96A44; background:#1f1008; }
.sc:active { transform:scale(.93); }
.sc.sel    { border-color:#4DA6FF !important; background:#06111f !important; box-shadow:0 0 14px #4DA6FF55; }
.sc.done   { border-color:#C8A96A77; background:linear-gradient(135deg,#2a1508,#1a0e05); }

/* ── Flavor btn ── */
.fb { cursor:pointer; border:1px solid #1e1e1e; background:#141414; border-radius:12px; overflow:hidden; transition:all .18s; -webkit-tap-highlight-color:transparent; }
.fb:hover:not(.cs) { border-color:#C8A96A55; background:#1a1408; transform:scale(1.02); }
.fb:active:not(.cs){ transform:scale(.95); }
.fb.used { border-color:#C8A96A55; }
.fb.cs   { cursor:not-allowed; opacity:.48; }

.size-btn { flex:1; padding:12px 6px; border-radius:12px; cursor:pointer; font-family:inherit; font-size:.8rem; font-weight:600; border:1px solid #252525; background:#141414; color:#E5D3B3; transition:all .2s; text-align:center; -webkit-tap-highlight-color:transparent; }
.size-btn:hover  { border-color:#C8A96A55; }
.size-btn:active { transform:scale(.95); }
.size-btn.active { background:#C8A96A; border-color:#C8A96A; color:#0f0f0f; }

.del-btn { border:1px solid #252525; border-radius:12px; cursor:pointer; font-family:inherit; font-size:.85rem; font-weight:600; transition:all .2s; flex:1; padding:13px; text-align:center; background:#141414; color:#666; -webkit-tap-highlight-color:transparent; }
.del-btn.active { border-color:#C8A96A; background:#1c1308; color:#C8A96A; }
.del-btn:active { transform:scale(.97); }

input, textarea { background:#161616; border:1px solid #2a2a2a; border-radius:12px; color:#E5D3B3; font-size:.9rem; font-family:inherit; outline:none; transition:border-color .2s,box-shadow .2s; width:100%; padding:12px 14px; }
input:focus, textarea:focus { border-color:#C8A96A; box-shadow:0 0 0 3px #C8A96A12; }
.err { border-color:#ef4444 !important; box-shadow:0 0 0 3px #ef444412 !important; }

.noise-bg { background-image:url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 200 200’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘n’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.85’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23n)’ opacity=‘0.04’/%3E%3C/svg%3E”); background-repeat:repeat; }

/* ── Leaflet ── */
.leaflet-container { font-family:‘Noto Kufi Arabic’,sans-serif !important; }
.leaflet-popup-content-wrapper { border-radius:12px !important; background:#1e1e1e !important; color:#E5D3B3 !important; border:1px solid #C8A96A33 !important; box-shadow:0 8px 24px #00000099 !important; }
.leaflet-popup-tip { background:#1e1e1e !important; }
.leaflet-control-zoom a { background:#1e1e1e !important; color:#C8A96A !important; border-color:#2a2a2a !important; }
.leaflet-control-zoom a:hover { background:#252525 !important; }
.leaflet-bar { border:1px solid #2a2a2a !important; border-radius:10px !important; overflow:hidden; }
`;

/* ═══════════════════════ IMAGE PLACEHOLDER ══════════════════════ */
function PizzaImg({ label, style }) {
return (
<div style={{
background: “linear-gradient(135deg,#1c1208,#111)”,
backgroundImage: “repeating-linear-gradient(45deg,transparent,transparent 7px,rgba(200,169,106,.04) 7px,rgba(200,169,106,.04) 8px)”,
display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”,
gap: 5, overflow: “hidden”, flexShrink: 0, …style,
}}>
<div style={{ width: 26, height: 26, borderRadius: “50%”, border: “1px dashed #C8A96A33”, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 12, opacity: .35 }}>🍕</div>
{label && <span style={{ fontSize: “.5rem”, color: “#C8A96A33”, textAlign: “center”, padding: “0 4px”, lineHeight: 1.3 }}>{label}</span>}
</div>
);
}

/* ═══════════════════════ CAROUSEL ═══════════════════════════════
الحل الصحيح لـ RTL:

- نغلّف track داخل dir=“ltr” حتى يعمل translateX بشكل طبيعي
- محتوى كل كارد يبقى dir=“rtl”
- تقنية الاستنساخ: [clone_last | item0 | item1 | item2 | clone_first]
- نبدأ من index=1 (item0 الحقيقي)
- عند وصول idx=total-1 → نقفز فوراً لـ idx=1 (بدون أنيميشن)
- عند وصول idx=0      → نقفز فوراً لـ idx=count (بدون أنيميشن)
  ══════════════════════════════════════════════════════════════════ */
  function Carousel({ items, onSelect }) {
  const count  = items.length;
  // slides = [آخر عنصر مكرر, …العناصر الحقيقية, أول عنصر مكرر]
  const slides = [items[count - 1], …items, items[0]];
  const N      = slides.length;

const [idx,       setIdx]      = useState(1);      // نبدأ بالكارد الأول الحقيقي
const [animated,  setAnimated] = useState(true);   // هل يوجد CSS transition
const [dotIdx,    setDotIdx]   = useState(0);      // للنقاط في الأسفل

const pauseRef   = useRef(false);
const resumeRef  = useRef(null);
const timerRef   = useRef(null);
const isDragging = useRef(false);
const startX     = useRef(0);
const startY     = useRef(0);
const deltaX     = useRef(0);
const isVScroll  = useRef(false);

/* تحويل idx الكلي → dotIdx الحقيقي */
function toDot(i) {
if (i === 0)     return count - 1;
if (i === N - 1) return 0;
return i - 1;
}

/* الانتقال لـ slide معين */
function moveTo(newIdx, manual = false) {
setAnimated(true);
setIdx(newIdx);
setDotIdx(toDot(newIdx));
if (manual) {
pauseRef.current = true;
clearTimeout(resumeRef.current);
resumeRef.current = setTimeout(() => {
pauseRef.current = false;
jumpTo(1);   // بعد 20 ثانية يبدأ من الأول
}, 20000);
}
}

/* قفزة فورية بدون animation */
function jumpTo(newIdx) {
setAnimated(false);
setIdx(newIdx);
setDotIdx(toDot(newIdx));
}

/* بعد انتهاء الـ transition: معالجة الـ clones */
function onTransEnd() {
if (idx === N - 1) jumpTo(1);       // كنا على clone الأول → اقفز للأول الحقيقي
if (idx === 0)     jumpTo(count);   // كنا على clone الأخير → اقفز للأخير الحقيقي
}

/* Auto-advance كل 3 ثواني */
useEffect(() => {
timerRef.current = setInterval(() => {
if (!pauseRef.current && !isDragging.current) {
setIdx(prev => {
const next = prev + 1;
setDotIdx(toDot(next));
setAnimated(true);
return next;
});
}
}, 3000);
return () => {
clearInterval(timerRef.current);
clearTimeout(resumeRef.current);
};
}, []);

/* ── Swipe handlers ── */
function onTouchStart(e) {
startX.current   = e.touches[0].clientX;
startY.current   = e.touches[0].clientY;
deltaX.current   = 0;
isVScroll.current = false;
isDragging.current = true;
}
function onTouchMove(e) {
if (!isDragging.current) return;
const dx = e.touches[0].clientX - startX.current;
const dy = e.touches[0].clientY - startY.current;
if (!isVScroll.current && Math.abs(dy) > Math.abs(dx) + 6) {
isVScroll.current  = true;
isDragging.current = false;
return;
}
if (isVScroll.current) return;
if (e.cancelable) e.preventDefault();
deltaX.current = dx;
}
function onTouchEnd(e) {
if (!isDragging.current || isVScroll.current) { isDragging.current = false; return; }
isDragging.current = false;
const w = e.currentTarget.offsetWidth;
const d = deltaX.current;
deltaX.current = 0;
// في RTL: سحب لليسار (dx < 0) يعني النكهة التالية
if (d < -(w * 0.2)) moveTo(idx + 1, true);
else if (d > w * 0.2) moveTo(idx - 1, true);
}
function onMouseDown(e) { startX.current = e.clientX; deltaX.current = 0; isDragging.current = true; }
function onMouseMove(e) { if (!isDragging.current) return; deltaX.current = e.clientX - startX.current; }
function onMouseUp(e) {
if (!isDragging.current) return;
isDragging.current = false;
const w = e.currentTarget.offsetWidth;
const d = deltaX.current;
deltaX.current = 0;
if (d < -(w * 0.2)) moveTo(idx + 1, true);
else if (d > w * 0.2) moveTo(idx - 1, true);
}

return (
<div style={{ paddingTop: 22 }}>
<p style={{ fontSize: “.65rem”, color: “#C8A96A77”, letterSpacing: “3px”, padding: “0 16px 14px” }}>⭐ العروض المميّزة</p>

```
  {/*
    ✅ المفتاح: dir="ltr" على wrapper الكاروسيل
    هذا يجعل translateX يعمل بالاتجاه الصحيح
    بينما محتوى الكارد بداخله dir="rtl"
  */}
  <div dir="ltr" style={{ overflow: "hidden", padding: "0 16px 4px", cursor: "grab", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}
    onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    onMouseDown={onMouseDown}   onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
  >
    <div style={{
      display: "flex",
      transform: `translateX(${idx * 100}%)`,
      transition: animated ? "transform .44s cubic-bezier(.25,.46,.45,.94)" : "none",
      willChange: "transform",
    }}
      onTransitionEnd={onTransEnd}
    >
      {slides.map((fp, i) => (
        <div key={i} dir="rtl" style={{ flex: "0 0 100%", padding: "0 0 4px" }}>
          <div
            style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #252525", background: "#121212", cursor: "pointer", transition: "border-color .25s" }}
            onClick={() => { if (Math.abs(deltaX.current) > 6) return; onSelect(fp); }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#C8A96A55"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#252525"}
          >
            <PizzaImg label={fp.label} style={{ width: "100%", height: 170, borderRadius: 0 }} />
            <div style={{ padding: "16px 18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#E5D3B3" }}>{fp.label}</h3>
                <div style={{ textAlign: "left", flexShrink: 0, marginRight: 10 }}>
                  {fp.priceOld
                    ? <><div style={{ fontSize: ".88rem", fontWeight: 900, color: "#C8A96A", whiteSpace: "nowrap" }}>{fp.priceOld} ل.س</div>
                        <div style={{ fontSize: ".63rem", color: "#8B6B4A", marginTop: 2 }}>{fp.priceNew} ل.ج</div></>
                    : <div style={{ fontSize: ".72rem", color: "#8B6B4A" }}>حسب الحجم</div>
                  }
                </div>
              </div>
              <p style={{ fontSize: ".72rem", color: "#8B6B4A", lineHeight: 1.65, marginBottom: 14 }}>{fp.desc}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#C8A96A18", border: "1px solid #C8A96A33", borderRadius: 20, padding: "6px 14px" }}>
                <span style={{ fontSize: ".7rem", color: "#C8A96A" }}>اختر النكهات</span>
                <span style={{ color: "#C8A96A" }}>←</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* النقاط */}
  <div style={{ display: "flex", justifyContent: "center", gap: 7, paddingTop: 14 }}>
    {items.map((_, i) => (
      <div key={i}
        onClick={() => moveTo(i + 1, true)}
        style={{
          width: dotIdx === i ? 26 : 7, height: 7, borderRadius: 4,
          background: dotIdx === i ? "#C8A96A" : "#2a2a2a",
          transition: "all .4s cubic-bezier(.25,.46,.45,.94)",
          cursor: "pointer",
        }}
      />
    ))}
  </div>
</div>
```

);
}

/* ═══════════════════════ MAP PICKER ═════════════════════════════ */
function LocationPicker({ onSelect }) {
const mapRef      = useRef(null);
const mapInst     = useRef(null);
const markerRef   = useRef(null);
const normalLayer = useRef(null);
const satLayer    = useRef(null);
const debRef      = useRef(null);

const [status,   setStatus]   = useState(“loading”);
const [isSat,    setIsSat]    = useState(false);
const [query,    setQuery]    = useState(””);
const [results,  setResults]  = useState([]);
const [loading,  setLoading]  = useState(false);

useEffect(() => {
if (!document.getElementById(“lf-css”)) {
const l = document.createElement(“link”);
l.id = “lf-css”; l.rel = “stylesheet”;
l.href = “https://unpkg.com/leaflet@1.9.4/dist/leaflet.css”;
document.head.appendChild(l);
}

```
function mkIcon(L) {
  return L.divIcon({
    html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#C8A96A,#8B6B4A);border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 14px #00000099"></div>`,
    iconSize: [34, 34], iconAnchor: [17, 34], className: "",
  });
}

function placePin(L, map, lat, lng, label) {
  if (markerRef.current) markerRef.current.remove();
  markerRef.current = L.marker([lat, lng], { icon: mkIcon(L), draggable: true })
    .addTo(map)
    .bindPopup(`<div dir="rtl" style="font-size:13px;color:#E5D3B3">📍 ${label || "موقعك المحدد"}<br><small style="color:#888">اسحب لضبط الموقع</small></div>`)
    .openPopup();
  markerRef.current.on("dragend", ev => {
    const p = ev.target.getLatLng();
    onSelect({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) });
  });
  onSelect({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
}

function init() {
  if (mapInst.current || !mapRef.current) return;
  try {
    const L   = window.L;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView(HAMA, 13);
    normalLayer.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    satLayer.current    = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 });
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    map.on("click", e => placePin(L, map, e.latlng.lat, e.latlng.lng));
    mapInst.current = map;
    setStatus("ready");
    setTimeout(() => map.invalidateSize(), 300);
  } catch { setStatus("error"); }
}

if (window.L) { init(); }
else {
  const s = document.createElement("script");
  s.id = "lf-js"; s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  s.onload = init; s.onerror = () => setStatus("error");
  document.head.appendChild(s);
}
return () => { if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
```

}, []);

function toggleSat() {
if (!mapInst.current) return;
if (!isSat) { normalLayer.current.remove(); satLayer.current.addTo(mapInst.current); }
else         { satLayer.current.remove();   normalLayer.current.addTo(mapInst.current); }
setIsSat(v => !v);
}

function onType(val) {
setQuery(val);
clearTimeout(debRef.current);
if (val.length < 2) { setResults([]); return; }
debRef.current = setTimeout(async () => {
setLoading(true);
try {
const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + " سوريا")}&format=json&limit=5`, { headers: { “Accept-Language”: “ar” } });
const data = await res.json();
setResults(data);
} catch { setResults([]); }
setLoading(false);
}, 500);
}

function pick(item) {
const lat = parseFloat(item.lat), lng = parseFloat(item.lon);
if (!mapInst.current) return;
mapInst.current.setView([lat, lng], 16, { animate: true });
const L = window.L;
if (markerRef.current) markerRef.current.remove();
const icon = L.divIcon({ html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#C8A96A,#8B6B4A);border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 14px #00000099"></div>`, iconSize:[34,34], iconAnchor:[17,34], className:”” });
markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapInst.current)
.bindPopup(`<div dir="rtl" style="font-size:13px;color:#E5D3B3">📍 ${item.display_name.split(",")[0]}</div>`).openPopup();
markerRef.current.on(“dragend”, ev => {
const p = ev.target.getLatLng();
onSelect({ lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) });
});
onSelect({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
setQuery(item.display_name.split(”,”)[0]);
setResults([]);
}

return (
<div style={{ marginBottom: 10 }}>
{status === “ready” && (
<div style={{ position: “relative”, marginBottom: 8 }}>
<div style={{ display: “flex”, gap: 8 }}>
<div style={{ position: “relative”, flex: 1 }}>
<input
placeholder=“ابحث عن موقعك في حماة…”
value={query}
onChange={e => onType(e.target.value)}
onKeyDown={e => e.key === “Escape” && setResults([])}
style={{ paddingLeft: 36, background: “#1a1a1a”, border: “1px solid #C8A96A33” }}
/>
<span style={{ position: “absolute”, left: 11, top: “50%”, transform: “translateY(-50%)”, fontSize: “.85rem”, opacity: .5 }}>
{loading ? “⏳” : “🔍”}
</span>
</div>
<button onClick={toggleSat} style={{ background: isSat ? “#C8A96A” : “#1a1a1a”, border: `1px solid ${isSat ? "#C8A96A" : "#2a2a2a"}`, borderRadius: 12, padding: “0 14px”, cursor: “pointer”, color: isSat ? “#0f0f0f” : “#C8A96A”, fontFamily: “inherit”, fontSize: “.78rem”, fontWeight: 600, transition: “all .2s”, whiteSpace: “nowrap” }}>
🛰 {isSat ? “عادية” : “أقمار”}
</button>
</div>
{results.length > 0 && (
<div style={{ position: “absolute”, top: “calc(100% + 5px)”, left: 0, right: 0, zIndex: 999, background: “#1a1a1a”, border: “1px solid #C8A96A33”, borderRadius: 12, overflow: “hidden”, boxShadow: “0 10px 28px #00000099” }}>
{results.map((s, i) => (
<div key={i} onClick={() => pick(s)}
style={{ padding: “10px 14px”, cursor: “pointer”, fontSize: “.77rem”, color: “#E5D3B3”, borderBottom: i < results.length - 1 ? “1px solid #1e1e1e” : “none”, transition: “background .15s” }}
onMouseEnter={e => e.currentTarget.style.background = “#252525”}
onMouseLeave={e => e.currentTarget.style.background = “transparent”}
>
<span style={{ marginLeft: 8, opacity: .7 }}>📍</span>
{s.display_name.split(”,”).slice(0, 3).join(”، “)}
</div>
))}
</div>
)}
</div>
)}

```
  <div style={{ position: "relative" }}>
    {status === "loading" && (
      <div style={{ height: 275, borderRadius: 14, background: "#141414", border: "1px solid #C8A96A22", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", border: "3px solid #C8A96A22", borderTopColor: "#C8A96A", animation: "spin .8s linear infinite" }} />
        <span style={{ fontSize: ".72rem", color: "#8B6B4A" }}>جارٍ تحميل الخريطة...</span>
      </div>
    )}
    {status === "error" && (
      <div style={{ height: 180, borderRadius: 14, border: "1px solid #3a1a1a", background: "#141414", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: "2rem" }}>⚠️</span>
        <p style={{ fontSize: ".75rem", color: "#8B6B4A", textAlign: "center" }}>تعذّر تحميل الخريطة<br /><span style={{ color: "#444", fontSize: ".65rem" }}>استخدم العنوان اليدوي</span></p>
      </div>
    )}
    <div ref={mapRef} style={{ width: "100%", height: 275, borderRadius: 14, border: "1px solid #C8A96A33", overflow: "hidden", display: status === "error" ? "none" : "block" }} />
    {status === "ready" && (
      <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 500, background: "#000000aa", backdropFilter: "blur(6px)", borderRadius: 8, padding: "5px 10px", fontSize: ".6rem", color: "#C8A96A99", pointerEvents: "none" }}>
        اضغط لتثبيت الدبوس
      </div>
    )}
  </div>
</div>
```

);
}

/* ═══════════════════════ MAIN APP ═══════════════════════════════ */
export default function PizzaKhanum() {
const [screen,         setScreen]         = useState(“landing”);
const [builderPizza,   setBuilderPizza]    = useState(null);
const [khanamSize,     setKhanamSize]      = useState(null);
const [selectedSlices, setSelectedSlices]  = useState(new Set());
const [sliceFlavors,   setSliceFlavors]    = useState({});
const [detailPizza,    setDetailPizza]     = useState(null);
const [detailSize,     setDetailSize]      = useState(null);
const [cart,           setCart]            = useState([]);
const [phone,          setPhone]           = useState(””);
const [deliveryType,   setDeliveryType]    = useState(””);
const [locationTxt,    setLocationTxt]     = useState(””);
const [mapCoords,      setMapCoords]       = useState(null);
const [errors,         setErrors]          = useState({});

const cartTotal  = cart.reduce((s, i) => s + i.numericPrice * i.qty, 0);
const phoneValid = /^\d{10}$/.test(phone.trim());
const canCheckout = phoneValid && deliveryType && (deliveryType !== “delivery” || locationTxt.trim());
const fmt = n => n.toLocaleString(“ar-EG”);

const addToCart  = item => setCart(p => […p, { …item, qty: 1, uid: Date.now() + Math.random() }]);
const updateQty  = (uid, d) => setCart(p => p.map(i => i.uid === uid ? { …i, qty: Math.max(1, i.qty + d) } : i));
const removeItem = uid => setCart(p => p.filter(i => i.uid !== uid));

function toggleSlice(idx) {
setSelectedSlices(p => { const n = new Set(p); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
}
function applyFlavor(fid) {
if (!selectedSlices.size) return;
setSliceFlavors(p => { const n = { …p }; selectedSlices.forEach(i => { n[i] = fid; }); return n; });
setSelectedSlices(new Set());
}
function addBuilderToCart() {
const details = Object.entries(sliceFlavors).map(([i, fid]) => `شريحة ${+i + 1}: ${FLAVORS.find(f => f.id === fid)?.label}`).join(”، “);
addToCart({ label: builderPizza.label, size: “”, details: details || “—”, priceOld: builderPizza.priceOld, priceNew: builderPizza.priceNew, numericPrice: builderPizza.numericPrice });
setSliceFlavors({}); setSelectedSlices(new Set()); setScreen(“menu”);
}
function addKhanamToCart(fid) {
const f = FLAVORS.find(x => x.id === fid);
addToCart({ label: `بيتزا خانم — ${khanamSize.label}`, size: khanamSize.label, details: `المنتصف: ${f?.label} • الأطراف: جبنة شيدر`, priceOld: khanamSize.priceOld, priceNew: khanamSize.priceNew, numericPrice: khanamSize.numericPrice });
setKhanamSize(null); setScreen(“menu”);
}
function addDetailToCart() {
if (!detailSize) return;
addToCart({ label: detailPizza.label, size: detailSize.label, details: detailPizza.details, priceOld: detailSize.priceOld, priceNew: detailSize.priceNew, numericPrice: detailSize.numericPrice });
setDetailSize(null); setScreen(“menu”);
}
function checkout() {
const errs = {};
if (!phoneValid)   errs.phone    = true;
if (!deliveryType) errs.delivery = true;
if (deliveryType === “delivery” && !locationTxt.trim()) errs.location = true;
if (Object.keys(errs).length) { setErrors(errs); return; }
const lines = cart.map(i => `• ${i.label}${i.size ? ` (${i.size})` : ""} × ${i.qty}\n  ${i.details}\n  ${i.priceOld} ل.س / ${i.priceNew} ل.ج`).join(”\n\n”);
const msg = [
“مرحباً بيتزا خانم 🍕”, “”,
“📋 الطلب:”, lines, “”,
`💰 المجموع: ${fmt(cartTotal)} ل.س / ${fmt(cartTotal / 100)} ل.ج`, “”,
`🚗 ${deliveryType === "pickup" ? "استلام من الفرع" : "توصيل"}`,
deliveryType === “delivery” ? `📍 ${locationTxt}${mapCoords ? `\n🗺 https://maps.google.com/?q=${mapCoords.lat},${mapCoords.lng}` : ""}` : “”,
“”, `📞 ${phone}`,
].filter(Boolean).join(”\n”);
window.open(`https://wa.me/963998950904?text=${encodeURIComponent(msg)}`, “_blank”);
}

function Header({ title, onBack, extra }) {
return (
<div style={{ position: “sticky”, top: 0, zIndex: 20, background: “#0d0d0d”, borderBottom: “1px solid #1a1a1a”, padding: “13px 16px”, display: “flex”, alignItems: “center”, gap: 12 }}>
<button onClick={onBack} style={{ background: “none”, border: “none”, color: “#C8A96A”, cursor: “pointer”, fontSize: “1.5rem”, lineHeight: 1, padding: 0 }}>‹</button>
<h2 style={{ fontSize: “.95rem”, fontWeight: 700, color: “#E5D3B3”, flex: 1 }}>{title}</h2>
{extra}
</div>
);
}

function FlavorGrid({ onPick, usedMap = {} }) {
return (
<div style={{ display: “grid”, gridTemplateColumns: “repeat(2,1fr)”, gap: 8 }}>
{FLAVORS.map(f => {
const cnt = usedMap[f.id] || 0;
return (
<div key={f.id} className={`fb${f.comingSoon ? " cs" : cnt > 0 ? " used" : ""}`}
onClick={() => { if (f.comingSoon) return; onPick(f.id); }}
>
<PizzaImg label=”” style={{ width: “100%”, height: 64, borderRadius: 0 }} />
<div style={{ padding: “7px 10px 9px”, display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<span style={{ fontSize: “.72rem”, fontWeight: 600, color: f.comingSoon ? “#555” : “#E5D3B3” }}>{f.label}</span>
{f.comingSoon && <span style={{ fontSize: “.55rem”, background: “#C8A96A22”, color: “#C8A96A88”, padding: “1px 6px”, borderRadius: 10, flexShrink: 0 }}>قريباً</span>}
{cnt > 0 && <span style={{ fontSize: “.6rem”, background: “#C8A96A”, color: “#0f0f0f”, borderRadius: “50%”, width: 18, height: 18, display: “flex”, alignItems: “center”, justifyContent: “center”, fontWeight: 700, flexShrink: 0 }}>{cnt}</span>}
</div>
</div>
);
})}
</div>
);
}

const base = { fontFamily: “‘Noto Kufi Arabic’,sans-serif”, background: “#0d0d0d”, minHeight: “100vh”, color: “#E5D3B3”, paddingBottom: 110 };

/* ══════ LANDING ════════════════════════════════════════════════ */
if (screen === “landing”) return (
<div dir=“rtl” style={{ fontFamily: “‘Noto Kufi Arabic’,sans-serif” }}>
<style>{CSS}</style>
<div className=“noise-bg” style={{ minHeight: “100vh”, display: “flex”, flexDirection: “column”, alignItems: “center”, justifyContent: “center”, background: “radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)”, position: “relative”, overflow: “hidden”, textAlign: “center”, padding: 24 }}>
{FLOATERS.map((f, i) => (
<div key={i} style={{ position: “absolute”, fontSize: “1.8rem”, opacity: .16, left: f.l, top: f.t, animation: `floatUp ${f.d}s ease-in-out ${f.dl}s infinite`, pointerEvents: “none”, filter: “blur(.4px)” }}>{f.e}</div>
))}
<div style={{ position: “absolute”, width: 600, height: 600, borderRadius: “50%”, background: “radial-gradient(circle,#C8A96A08,transparent 70%)”, pointerEvents: “none” }} />
<div className=“fade-up” style={{ maxWidth: 400 }}>
<div style={{ width: 112, height: 112, borderRadius: “50%”, border: “2px solid #C8A96A44”, display: “flex”, alignItems: “center”, justifyContent: “center”, margin: “0 auto 30px”, animation: “glow 3s ease-in-out infinite”, fontSize: “3.2rem” }}>🍕</div>
<h1 style={{ fontSize: “clamp(3rem,9vw,4.5rem)”, fontWeight: 900, background: “linear-gradient(135deg,#C8A96A,#E5D3B3,#8B6B4A,#C8A96A)”, backgroundSize: “200% auto”, WebkitBackgroundClip: “text”, WebkitTextFillColor: “transparent”, backgroundClip: “text”, animation: “shimmer 4s linear infinite”, lineHeight: 1.1, marginBottom: 16 }}>
بيتزا خانم
</h1>
<p style={{ fontSize: “clamp(.9rem,3vw,1rem)”, color: “#8B6B4A”, marginBottom: 52, fontWeight: 300, letterSpacing: “.5px”, lineHeight: 1.9 }}>
كُل لتعيش<span style={{ color: “#C8A96A22”, margin: “0 12px” }}>·</span>وعِش لأجل البيتزا
</p>
<button className=“btn-gold” onClick={() => setScreen(“menu”)} style={{ padding: “16px 56px”, borderRadius: “50px”, fontSize: “1.05rem”, fontWeight: 700, color: “#0f0f0f”, letterSpacing: “1px”, animation: “glow 3s ease-in-out infinite” }}>
ابدأ الطلب ✨
</button>
<p style={{ marginTop: 20, fontSize: “.66rem”, color: “#222”, letterSpacing: “3px” }}>PIZZA KHANUM • منذ 2020</p>
</div>
</div>
</div>
);

/* ══════ MENU ═══════════════════════════════════════════════════ */
if (screen === “menu”) return (
<div dir=“rtl” style={{ …base, background: “#0f0f0f” }}>
<style>{CSS}</style>
<div style={{ position: “sticky”, top: 0, zIndex: 30, background: “linear-gradient(180deg,#0f0f0f 90%,transparent)”, padding: “14px 16px 12px”, display: “flex”, alignItems: “center”, justifyContent: “space-between”, borderBottom: “1px solid #181818” }}>
<span style={{ fontSize: “1.3rem”, fontWeight: 900, background: “linear-gradient(90deg,#C8A96A,#E5D3B3)”, WebkitBackgroundClip: “text”, WebkitTextFillColor: “transparent”, backgroundClip: “text” }}>بيتزا خانم</span>
<button onClick={() => setScreen(“summary”)} style={{ position: “relative”, background: “#1a1a1a”, border: “1px solid #C8A96A33”, borderRadius: 10, color: “#C8A96A”, padding: “8px 16px”, cursor: “pointer”, fontSize: “.78rem”, fontFamily: “inherit” }}>
🧾 الطلب
{cart.length > 0 && <span style={{ position: “absolute”, top: -6, left: -6, background: “#C8A96A”, color: “#0f0f0f”, borderRadius: “50%”, width: 18, height: 18, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “.58rem”, fontWeight: 700 }}>{cart.length}</span>}
</button>
</div>

```
  <Carousel items={FEATURED} onSelect={fp => {
    if (fp.id === "khanum") { setBuilderPizza(fp); setKhanamSize(null); setScreen("khanum"); }
    else { setBuilderPizza(fp); setSliceFlavors({}); setSelectedSlices(new Set()); setScreen("builder"); }
  }} />

  <div style={{ padding: "28px 16px 0" }}>
    <p style={{ fontSize: ".65rem", color: "#C8A96A77", letterSpacing: "3px", marginBottom: 14 }}>🍕 قائمة البيتزا</p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {PIZZAS_MENU.map(p => (
        <div key={p.id} className={p.comingSoon ? "" : "card-tap"}
          style={{ background: "#131313", border: "1px solid #1c1c1c", borderRadius: 14, overflow: "hidden", cursor: p.comingSoon ? "default" : "pointer", opacity: p.comingSoon ? .52 : 1 }}
          onClick={() => { if (p.comingSoon) return; setDetailPizza(p); setDetailSize(null); setScreen("pizza_detail"); }}
        >
          <PizzaImg label={p.label} style={{ width: "100%", height: 88, borderRadius: 0 }} />
          <div style={{ padding: "9px 10px 12px" }}>
            <p style={{ fontSize: ".76rem", fontWeight: 600, color: p.comingSoon ? "#555" : "#E5D3B3", marginBottom: 4 }}>{p.label}</p>
            {p.comingSoon
              ? <span style={{ fontSize: ".58rem", background: "#C8A96A22", color: "#C8A96A88", padding: "2px 8px", borderRadius: 20 }}>قريباً</span>
              : <p style={{ fontSize: ".61rem", color: "#555", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.details}</p>
            }
          </div>
        </div>
      ))}
    </div>
  </div>

  {cart.length > 0 && (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(50%)", zIndex: 40 }}>
      <button className="btn-gold pop-in" onClick={() => setScreen("summary")} style={{ padding: "13px 30px", borderRadius: "50px", fontSize: ".88rem", fontWeight: 700, color: "#0f0f0f", boxShadow: "0 8px 30px #00000099", display: "flex", alignItems: "center", gap: 10 }}>
        <span>🧾 عرض الطلب</span>
        <span style={{ background: "#0f0f0f22", borderRadius: 20, padding: "2px 10px", fontSize: ".8rem" }}>{fmt(cartTotal)} ل.س</span>
      </button>
    </div>
  )}
</div>
```

);

/* ══════ BUILDER ════════════════════════════════════════════════ */
if (screen === “builder” && builderPizza) {
const { sliceCount, cols } = builderPizza;
const filled  = Object.keys(sliceFlavors).length;
const usedMap = FLAVORS.reduce((a, f) => { a[f.id] = Object.values(sliceFlavors).filter(v => v === f.id).length; return a; }, {});

```
return (
  <div dir="rtl" style={base}>
    <style>{CSS}</style>
    {/* Header */}
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", padding: "13px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={() => setScreen("menu")} style={{ background: "none", border: "none", color: "#C8A96A", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1, padding: 0 }}>‹</button>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: ".95rem", fontWeight: 700, color: "#E5D3B3" }}>{builderPizza.label}</h2>
        <p style={{ fontSize: ".66rem", color: "#8B6B4A" }}>
          {selectedSlices.size > 0 ? `${selectedSlices.size} شريحة محددة — اختر نكهة` : `${filled}/${sliceCount} شرائح مضافة`}
        </p>
      </div>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 5 }}>
        {Array.from({ length: sliceCount }, (_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: sliceFlavors[i] ? "#C8A96A" : selectedSlices.has(i) ? "#4DA6FF" : "#222", transition: "background .25s", boxShadow: sliceFlavors[i] ? "0 0 6px #C8A96A88" : "none" }} />
        ))}
      </div>
    </div>

    <div style={{ padding: "16px 16px 0" }}>
      {/* Hint */}
      <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: "1.1rem" }}>{selectedSlices.size === 0 ? "☝️" : "🎨"}</span>
        <p style={{ fontSize: ".72rem", color: "#8B6B4A", lineHeight: 1.5 }}>
          {selectedSlices.size === 0
            ? "اضغط على شريحة أو أكثر لتحديدها، ثم اختر النكهة من الأسفل"
            : `${selectedSlices.size} شريحة محددة — اضغط على نكهة لتطبيقها`}
        </p>
      </div>

      {/* ── Pizza grid: صف واحد × 6 أعمدة ── */}
      <div style={{ background: "linear-gradient(135deg,#1c1008,#100a04)", border: "2px solid #C8A96A22", borderRadius: 18, padding: 14, marginBottom: 18 }}>
        <p style={{ fontSize: ".6rem", color: "#C8A96A44", textAlign: "center", marginBottom: 12, letterSpacing: "2px" }}>{builderPizza.label} — اضغط لتحديد الشريحة</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
          {Array.from({ length: sliceCount }, (_, i) => {
            const fid  = sliceFlavors[i];
            const flbl = fid ? FLAVORS.find(f => f.id === fid)?.label : null;
            const isSel = selectedSlices.has(i);
            return (
              <div key={i} className={`sc${isSel ? " sel" : fid ? " done" : ""}`} onClick={() => toggleSlice(i)}>
                {fid ? (
                  <>
                    <div style={{ fontSize: ".85rem", marginBottom: 2 }}>✓</div>
                    <span style={{ fontSize: ".48rem", color: "#C8A96A", fontWeight: 700, textAlign: "center", lineHeight: 1.3, padding: "0 2px" }}>{flbl}</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px ${isSel ? "solid #4DA6FF" : "dashed #333"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSel && <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#4DA6FF" }} />}
                    </div>
                    <span style={{ fontSize: ".55rem", color: "#444", fontWeight: 600 }}>{i + 1}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {/* Price badge */}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span style={{ fontSize: ".72rem", color: "#C8A96A88" }}>{builderPizza.priceOld} ل.س</span>
        </div>
      </div>

      {/* Add to cart */}
      {filled > 0 && (
        <div className="pop-in" style={{ marginBottom: 16 }}>
          <button className="btn-gold" onClick={addBuilderToCart} style={{ width: "100%", padding: "13px", borderRadius: 12, fontSize: ".9rem", fontWeight: 700, color: "#0f0f0f" }}>
            ✓ إضافة للطلب — {builderPizza.priceOld} ل.س
          </button>
        </div>
      )}

      {/* Flavors */}
      <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px", marginBottom: 12 }}>اختر النكهة</p>
      <FlavorGrid onPick={applyFlavor} usedMap={usedMap} />

      {filled > 0 && (
        <button onClick={() => { setSliceFlavors({}); setSelectedSlices(new Set()); }} style={{ marginTop: 14, width: "100%", padding: 10, background: "none", border: "1px solid #1e1e1e", borderRadius: 12, color: "#555", cursor: "pointer", fontFamily: "inherit", fontSize: ".75rem" }}>
          🔄 إعادة التعيين
        </button>
      )}
    </div>
  </div>
);
```

}

/* ══════ KHANUM ═════════════════════════════════════════════════ */
if (screen === “khanum” && builderPizza) return (
<div dir="rtl" style={base}>
<style>{CSS}</style>
<Header title=“بيتزا خانم” onBack={() => { setScreen(“menu”); setKhanamSize(null); }} />
<div style={{ padding: “18px 16px” }}>
<div style={{ background: “#141414”, border: “1px solid #C8A96A22”, borderRadius: 16, padding: 16, marginBottom: 22, display: “flex”, gap: 14, alignItems: “flex-start” }}>
<PizzaImg label=”” style={{ width: 76, height: 76, borderRadius: 12, flexShrink: 0 }} />
<div>
<p style={{ fontSize: “.9rem”, fontWeight: 700, color: “#C8A96A”, marginBottom: 6 }}>بيتزا خانم</p>
<p style={{ fontSize: “.7rem”, color: “#8B6B4A”, lineHeight: 1.65 }}>{builderPizza.desc}</p>
</div>
</div>

```
    {!khanamSize ? (
      <div className="slide-in">
        <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px", marginBottom: 12 }}>اختر الحجم</p>
        <div style={{ display: "flex", gap: 10 }}>
          {builderPizza.sizes.map(sz => (
            <button key={sz.id} className="size-btn" onClick={() => setKhanamSize(sz)} style={{ padding: "16px 8px" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 6 }}>{sz.id === "sm" ? "🔸" : "🔶"}</div>
              <div>{sz.label}</div>
              <div style={{ fontSize: ".82rem", fontWeight: 700, color: "#C8A96A", marginTop: 5 }}>{sz.priceOld} ل.س</div>
              <div style={{ fontSize: ".62rem", color: "#8B6B4A" }}>{sz.priceNew} ل.ج</div>
            </button>
          ))}
        </div>
      </div>
    ) : (
      <div className="slide-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ fontSize: ".65rem", color: "#8B6B4A", letterSpacing: "2px" }}>نكهة المنتصف</p>
          <button onClick={() => setKhanamSize(null)} style={{ fontSize: ".68rem", color: "#555", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>← تغيير الحجم</button>
        </div>
        <FlavorGrid onPick={addKhanamToCart} />
      </div>
    )}
  </div>
</div>
```

);

/* ══════ PIZZA DETAIL ═══════════════════════════════════════════ */
if (screen === “pizza_detail” && detailPizza) return (
<div dir="rtl" style={base}>
<style>{CSS}</style>
<Header title={detailPizza.label} onBack={() => setScreen(“menu”)} />
<div style={{ padding: “18px 16px” }}>
<PizzaImg label={detailPizza.label} style={{ width: “100%”, height: 200, borderRadius: 18, marginBottom: 20 }} />
<h2 style={{ fontSize: “1.15rem”, fontWeight: 700, color: “#E5D3B3”, marginBottom: 8 }}>{detailPizza.label}</h2>
<p style={{ fontSize: “.78rem”, color: “#8B6B4A”, lineHeight: 1.7, marginBottom: 28, borderRight: “2px solid #C8A96A33”, paddingRight: 12 }}>{detailPizza.details}</p>
<p style={{ fontSize: “.65rem”, color: “#C8A96A88”, letterSpacing: “2px”, marginBottom: 12 }}>اختر الحجم</p>
<div style={{ display: “flex”, gap: 10, marginBottom: 22 }}>
{SIZES_REGULAR.map(sz => (
<button key={sz.id} className={`size-btn${detailSize?.id === sz.id ? " active" : ""}`} onClick={() => setDetailSize(sz)}>
<div style={{ fontWeight: 700, marginBottom: 4 }}>{sz.label}</div>
<div style={{ fontSize: “.8rem”, fontWeight: 700, color: detailSize?.id === sz.id ? “#0f0f0f” : “#C8A96A” }}>{sz.priceOld} ل.س</div>
<div style={{ fontSize: “.6rem”, opacity: .75, marginTop: 2 }}>{sz.priceNew} ل.ج</div>
</button>
))}
</div>
<button className=“btn-gold” disabled={!detailSize} onClick={addDetailToCart} style={{ width: “100%”, padding: “14px”, borderRadius: 12, fontSize: “.92rem”, fontWeight: 700, color: “#0f0f0f” }}>
{detailSize ? `إضافة للطلب — ${detailSize.priceOld} ل.س` : “اختر الحجم أولاً”}
</button>
</div>
</div>
);

/* ══════ SUMMARY ════════════════════════════════════════════════ */
if (screen === “summary”) return (
<div dir=“rtl” style={{ …base, paddingBottom: 50 }}>
<style>{CSS}</style>
<Header title=“ملخّص الطلب” onBack={() => setScreen(“menu”)} />
<div style={{ padding: “18px 16px” }}>
{cart.length === 0 ? (
<div style={{ textAlign: “center”, padding: “60px 20px” }}>
<div style={{ fontSize: “4rem”, marginBottom: 14, opacity: .2 }}>🛒</div>
<p style={{ color: “#8B6B4A”, fontSize: “.88rem”, marginBottom: 20 }}>لا يوجد طلبات بعد</p>
<button className=“btn-gold” onClick={() => setScreen(“menu”)} style={{ padding: “12px 28px”, borderRadius: 30, fontSize: “.85rem”, fontWeight: 700, color: “#0f0f0f” }}>تصفّح القائمة</button>
</div>
) : (<>
<p style={{ fontSize: “.65rem”, color: “#8B6B4A”, letterSpacing: “2px”, marginBottom: 12 }}>الطلبات ({cart.length})</p>
<div style={{ display: “flex”, flexDirection: “column”, gap: 10, marginBottom: 22 }}>
{cart.map(item => (
<div key={item.uid} style={{ background: “#141414”, border: “1px solid #1e1e1e”, borderRadius: 14, padding: 13 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, marginBottom: 10 }}>
<div style={{ flex: 1 }}>
<p style={{ fontWeight: 600, color: “#E5D3B3”, fontSize: “.86rem” }}>{item.label}</p>
<p style={{ fontSize: “.63rem”, color: “#555”, marginTop: 3, lineHeight: 1.4, display: “-webkit-box”, WebkitLineClamp: 2, WebkitBoxOrient: “vertical”, overflow: “hidden” }}>{item.details}</p>
</div>
<div style={{ textAlign: “left”, marginRight: 10, flexShrink: 0 }}>
<div style={{ fontSize: “.8rem”, fontWeight: 700, color: “#C8A96A” }}>{item.priceOld} ل.س</div>
<div style={{ fontSize: “.58rem”, color: “#8B6B4A” }}>{item.priceNew} ل.ج</div>
</div>
</div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between” }}>
<div style={{ display: “flex”, alignItems: “center”, border: “1px solid #242424”, borderRadius: 10, overflow: “hidden” }}>
<button onClick={() => updateQty(item.uid, -1)} style={{ background: “none”, border: “none”, color: “#C8A96A”, cursor: “pointer”, width: 34, height: 32, fontSize: “1rem”, fontFamily: “inherit” }}>−</button>
<span style={{ width: 30, textAlign: “center”, fontSize: “.84rem”, fontWeight: 600, color: “#E5D3B3” }}>{item.qty}</span>
<button onClick={() => updateQty(item.uid, +1)} style={{ background: “none”, border: “none”, color: “#C8A96A”, cursor: “pointer”, width: 34, height: 32, fontSize: “1rem”, fontFamily: “inherit” }}>+</button>
</div>
<span style={{ fontSize: “.8rem”, color: “#C8A96A”, fontWeight: 700 }}>{fmt(item.numericPrice * item.qty)} ل.س</span>
<button onClick={() => removeItem(item.uid)} style={{ background: “#180f0f”, border: “1px solid #2a1818”, borderRadius: 8, color: “#6a2a2a”, cursor: “pointer”, width: 32, height: 32, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: “.82rem” }}>🗑</button>
</div>
</div>
))}
</div>

```
      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 14, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#8B6B4A" }}>المجموع</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#C8A96A" }}>{fmt(cartTotal)} ل.س</div>
          <div style={{ fontSize: ".66rem", color: "#8B6B4A" }}>{fmt(cartTotal / 100)} ل.ج</div>
        </div>
      </div>

      <p style={{ fontSize: ".65rem", color: errors.delivery ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 10 }}>{errors.delivery ? "⚠ هذا الحقل إلزامي" : "طريقة الاستلام *"}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: deliveryType === "delivery" ? 14 : 22 }}>
        {[{ v: "pickup", l: "🏪 استلام من الفرع" }, { v: "delivery", l: "🛵 توصيل" }].map(o => (
          <button key={o.v} className={`del-btn${deliveryType === o.v ? " active" : ""}`} onClick={() => { setDeliveryType(o.v); setErrors(e => ({ ...e, delivery: false })); }}>{o.l}</button>
        ))}
      </div>

      {deliveryType === "delivery" && (
        <div className="pop-in" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: ".65rem", color: errors.location ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 10 }}>{errors.location ? "⚠ حدد موقعك أو اكتب العنوان" : "📍 حدد موقعك على الخريطة *"}</p>
          <LocationPicker onSelect={coords => { setMapCoords(coords); setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`); setErrors(ev => ({ ...ev, location: false })); }} />
          {mapCoords && <div style={{ background: "#0d1a0d", border: "1px solid #4CAF5044", borderRadius: 10, padding: "9px 14px", marginBottom: 12, fontSize: ".72rem", color: "#4CAF50" }}>✓ تم تحديد الموقع — يمكنك سحب الدبوس لتعديله</div>}
          <p style={{ fontSize: ".63rem", color: "#555", marginBottom: 7 }}>أو اكتب العنوان يدوياً</p>
          <textarea className={errors.location ? "err" : ""} rows={2} placeholder="الحي، الشارع، أقرب نقطة دالة..." value={mapCoords ? "" : locationTxt} onChange={e => { setLocationTxt(e.target.value); setMapCoords(null); setErrors(ev => ({ ...ev, location: false })); }} style={{ resize: "none" }} />
        </div>
      )}

      <p style={{ fontSize: ".65rem", color: errors.phone ? "#ef4444" : "#C8A96A88", letterSpacing: "2px", marginBottom: 8 }}>{errors.phone ? "⚠ رقم الهاتف إلزامي" : "رقم الهاتف للتواصل *"}</p>
      <input type="tel" className={errors.phone || (phone.length > 0 && phone.length !== 10) ? "err" : ""} placeholder="09xxxxxxxx" value={phone} maxLength={10} onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErrors(ev => ({ ...ev, phone: false })); }} style={{ marginBottom: 4 }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: phone.length > 0 && phone.length < 10 ? 6 : 22 }}>
        <p style={{ fontSize: ".62rem", color: "#333" }}>10 أرقام إلزامية</p>
        <span style={{ fontSize: ".62rem", fontWeight: 700, color: phone.length === 0 ? "#333" : phone.length === 10 ? "#4CAF50" : "#ef4444" }}>{phone.length}/10</span>
      </div>
      {phone.length > 0 && phone.length < 10 && <p style={{ fontSize: ".62rem", color: "#ef4444", marginBottom: 18 }}>⚠ ناقص {10 - phone.length} أرقام</p>}

      <button className="btn-gold" disabled={!canCheckout} onClick={checkout} style={{ width: "100%", padding: "15px", borderRadius: 13, fontSize: ".92rem", fontWeight: 700, color: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: "1.1rem" }}>📲</span>إرسال الطلب عبر واتساب
      </button>
      {!canCheckout && (
        <p style={{ textAlign: "center", fontSize: ".65rem", color: "#333", marginTop: 8 }}>
          {!phoneValid ? (phone.length === 0 ? "أدخل رقم هاتفك" : `الرقم يجب 10 أرقام (أدخلت ${phone.length})`)
            : !deliveryType ? "اختر طريقة الاستلام"
            : "أدخل موقعك أو حدده على الخريطة"}
        </p>
      )}
    </>)}
  </div>
</div>
```

);

return null;
}
