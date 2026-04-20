import { useState } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

/* ══════════════════ DEFAULT DATA ══════════════════ */
const DEFAULT_FEATURED = [
  { id:"meter",      label:"بيتزا المتر",  priceOld:"150,000", priceNew:"1,500", numericPrice:150000, sliceCount:8, cols:4, desc:"متر كامل من الشهية المتنوعة لتشاركه مع أحبّك" },
  { id:"sixtyforty", label:"بيتزا 60×40", priceOld:"140,000", priceNew:"1,400", numericPrice:140000, sliceCount:6, cols:3, desc:"الحجم العائلي المثالي للتجمعات" },
  { id:"khanum",     label:"بيتزا خانم",  priceOld:null, priceNew:null, desc:"كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨",
    sizes:[ { id:"sm", label:"صغيرة", priceOld:"45,000", priceNew:"450", numericPrice:45000 }, { id:"lg", label:"كبيرة", priceOld:"60,000", priceNew:"600", numericPrice:60000 } ] },
];

const DEFAULT_MENU = [
  { id:"4seasons",      label:"الفصول الأربعة",  details:"جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء بالإضافة إلى حبات الطماطم والذرة.", comingSoon:false },
  { id:"margarita",    label:"مارغريتا",          details:"جبنة القشقوان مع الصلصة الحمراء.", comingSoon:false },
  { id:"hawaii",       label:"هاواي",             details:"جبنة القشقوان مع الموزريلا وقطع البيروني بالإضافة إلى شرائح الأناناس.", comingSoon:false },
  { id:"teamscheese",  label:"التيمات تشيز",      details:"جبنة القشقوان مع موزريلا بالإضافة لكرات الطماطم والريحان.", comingSoon:false },
  { id:"supersupreme", label:"سوبر سوبريم",       details:"المزيج المشهور والشهي من البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود.", comingSoon:false },
  { id:"chickenbbq",   label:"تشيكن باربيكيو",   details:"شرائح الدجاج مغمورة بصوص الباربيكيو اللذيذ وجبنة القشقوان مع شرائح البصل.", comingSoon:false },
  { id:"peperoni",     label:"ببروني",            details:"جبنة القشقوان مع المزيج الشهي من شرائح البيروني لحم البقر مع الثوم والكزبرة.", comingSoon:false },
  { id:"salami",       label:"سلامي",             details:"جبنة القشقوان مع شرائح لحم البقر.", comingSoon:false },
  { id:"hotdog",       label:"هوت دوغ",           details:"جبنة القشقوان مع حبات الهوت دوغ المدخن.", comingSoon:false },
  { id:"smokedchicken",label:"دجاج مدخن",         details:"جبنة القشقوان مع شرائح دجاج الحبش المدخن.", comingSoon:false },
  { id:"fajita",       label:"فاهيتا",            details:"جبنة القشقوان مع قطع دجاج الفاهيتا والماشروم والفلفل الأخضر بالإضافة إلى حبات الذرة.", comingSoon:false },
  { id:"cs1", label:"بيتزا الكريمة", details:"", comingSoon:true },
  { id:"cs2", label:"الثلاثي",        details:"", comingSoon:true },
  { id:"cs3", label:"بيتزا البحر",   details:"", comingSoon:true },
  { id:"cs4", label:"المكسيكية",      details:"", comingSoon:true },
  { id:"cs5", label:"بيتزا الخضار",  details:"", comingSoon:true },
];

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ══════════════════ CSS ══════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes toastIn { from{opacity:0;transform:translate(-50%,-16px)} to{opacity:1;transform:translate(-50%,0)} }

  .fade-in  { animation: fadeIn  .3s ease forwards; }
  .slide-up { animation: slideUp .35s ease forwards; }
  .toast-anim { animation: toastIn .3s ease forwards; }

  .admin-input {
    width:100%; padding:10px 14px;
    background:#1a1a1a; border:1px solid #2a2a2a; border-radius:10px;
    color:#E5D3B3; font-family:inherit; font-size:.88rem; outline:none;
    transition: border-color .2s, box-shadow .2s; margin-top:6px;
  }
  .admin-input:focus { border-color:#C8A96A55; box-shadow:0 0 0 3px #C8A96A11; }

  .item-row {
    background:#141414; border:1px solid #1e1e1e; border-radius:14px;
    padding:14px 16px; margin-bottom:10px;
    display:flex; align-items:center; gap:12px;
    transition: border-color .2s, transform .15s;
  }
  .item-row:hover { border-color:#2a2a2a; transform: translateX(-2px); }

  .tab-btn {
    padding:9px 16px; border-radius:10px; border:1px solid #252525;
    background:#141414; color:#555; cursor:pointer;
    font-family:inherit; font-size:.8rem; font-weight:700;
    transition: all .2s;
  }
  .tab-btn:hover { border-color:#C8A96A44; color:#C8A96A; }
  .tab-btn.active { background:#C8A96A; border-color:#C8A96A; color:#0f0f0f; }

  .icon-btn {
    padding:7px 12px; border-radius:9px; border:1px solid transparent;
    cursor:pointer; font-family:inherit; font-size:.78rem; font-weight:700;
    transition: all .18s; display:inline-flex; align-items:center; gap:5px;
  }
  .icon-btn:hover { transform: translateY(-1px); }
  .icon-btn:active { transform: scale(.96); }

  .search-box {
    width:100%; padding:10px 14px 10px 14px;
    background:#141414; border:1px solid #1e1e1e; border-radius:12px;
    color:#E5D3B3; font-family:inherit; font-size:.85rem; outline:none;
    transition: border-color .2s;
  }
  .search-box:focus { border-color:#C8A96A44; }

  .modal-overlay {
    position:fixed; inset:0; background:#000c;
    display:flex; align-items:center; justify-content:center;
    z-index:999; padding:16px;
  }
  .modal-box {
    background:#141414; border:1px solid #C8A96A33; border-radius:18px;
    width:min(520px,100%); max-height:90vh; overflow-y:auto; padding:24px;
  }
  .modal-box::-webkit-scrollbar { width:3px; }
  .modal-box::-webkit-scrollbar-thumb { background:#C8A96A33; border-radius:2px; }

  .section-label {
    font-size:.68rem; color:#C8A96A66; letter-spacing:2px;
    display:block; margin-top:18px; margin-bottom:4px; font-weight:600;
  }

  .toggle-pill {
    display:inline-flex; align-items:center; gap:8px;
    background:#1a1a1a; border:1px solid #252525; border-radius:30px;
    padding:7px 16px; cursor:pointer; transition:all .2s; margin-top:8px;
    font-family:inherit; font-size:.8rem; color:#555; font-weight:600;
  }
  .toggle-pill.on  { background:#0d1a0d; border-color:#4CAF5066; color:#4CAF50; }
  .toggle-pill.warn{ background:#1a0d0d; border-color:#ef444466; color:#ef4444; }

  .badge {
    font-size:.58rem; padding:2px 9px; border-radius:20px;
    font-weight:700; letter-spacing:.5px; flex-shrink:0;
  }
  .badge-green { background:#4CAF5022; color:#4CAF50; }
  .badge-gold  { background:#C8A96A22; color:#C8A96A; }
  .badge-red   { background:#ef444422; color:#ef4444; }
  .badge-blue  { background:#4DA6FF22; color:#4DA6FF; }

  .stat-card {
    background:#141414; border:1px solid #1e1e1e; border-radius:14px;
    padding:14px 10px; text-align:center;
  }
  .history-entry {
    font-size:.72rem; color:#444; padding:8px 0;
    border-bottom:1px solid #1a1a1a; display:flex; justify-content:space-between; gap:10px;
  }
  .history-entry:last-child { border-bottom:none; }

  .preview-box {
    background:#0f0f0f; border:1px solid #1a1a1a; border-radius:12px; padding:14px; margin-top:20px;
  }
`;

/* ══════════════════ COMPONENT ══════════════════ */
export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false);
  const [pass,      setPass]      = useState("");
  const [authError, setAuthError] = useState("");

  const [menu,     setMenu]     = useState(() => loadLS("admin_menu",     DEFAULT_MENU));
  const [featured, setFeatured] = useState(() => loadLS("admin_featured", DEFAULT_FEATURED));

  const [tab,     setTab]     = useState("menu");
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({});
  const [toast,   setToast]   = useState(null);
  const [history, setHistory] = useState(() => loadLS("admin_history", []));
  const [dragIdx, setDragIdx] = useState(null);

  // Settings
  const [siteName,   setSiteName]   = useState(() => loadLS("site_name",      "بيتزا خانم"));
  const [siteSlogan, setSiteSlogan] = useState(() => loadLS("site_slogan",    "كُل لتعيش · وعِش لأجل البيتزا"));
  const [whatsapp,   setWhatsapp]   = useState(() => loadLS("site_whatsapp",  "963998950904"));
  const [showNew,    setShowNew]    = useState(() => loadLS("show_price_new", true));

  /* ── toast ── */
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  /* ── history ── */
  function logHistory(action) {
    const entry  = { action, time: new Date().toLocaleString("ar-EG") };
    const updated = [entry, ...history].slice(0, 40);
    setHistory(updated); saveLS("admin_history", updated);
  }

  /* ── auth ── */
  function handleLogin(e) {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setAuthError(""); }
    else setAuthError("كلمة المرور غلط");
  }

  /* ── edit ── */
  function openEdit(type, index) {
    const item = type === "menu" ? menu[index] : featured[index];
    setForm({ ...item, _sizes: item.sizes ? item.sizes.map(s => ({ ...s })) : undefined });
    setEditing({ type, index });
  }

  function saveEdit() {
    const saved = { ...form };
    if (saved._sizes) { saved.sizes = saved._sizes; delete saved._sizes; }
    if (editing.type === "menu") {
      const u = menu.map((it, i) => i === editing.index ? saved : it);
      setMenu(u); saveLS("admin_menu", u);
    } else {
      const u = featured.map((it, i) => i === editing.index ? saved : it);
      setFeatured(u); saveLS("admin_featured", u);
    }
    logHistory(`تعديل: ${saved.label}`);
    setEditing(null);
    showToast("✓ تم الحفظ — التغييرات ظاهرة للزوار");
  }

  /* ── toggle visibility ── */
  function toggleComingSoon(index) {
    const u = menu.map((it, i) => i === index ? { ...it, comingSoon: !it.comingSoon } : it);
    setMenu(u); saveLS("admin_menu", u);
    logHistory(`تغيير حالة: ${menu[index].label}`);
    showToast(u[index].comingSoon ? "⏳ أُخفي الصنف" : "✅ ظهر الصنف", u[index].comingSoon ? "warn" : "success");
  }

  /* ── add ── */
  function addMenuItem() {
    const newItem = { id: Date.now().toString(), label: "صنف جديد", details: "", comingSoon: false };
    const u = [...menu, newItem];
    setMenu(u); saveLS("admin_menu", u);
    logHistory("إضافة صنف جديد");
    openEdit("menu", u.length - 1);
  }

  /* ── duplicate ── */
  function duplicateItem(type, index) {
    const src  = type === "menu" ? menu[index] : featured[index];
    const copy = { ...src, id: Date.now().toString(), label: src.label + " (نسخة)" };
    if (type === "menu") {
      const u = [...menu, copy]; setMenu(u); saveLS("admin_menu", u);
    } else {
      const u = [...featured, copy]; setFeatured(u); saveLS("admin_featured", u);
    }
    logHistory(`نسخ: ${src.label}`);
    showToast("📋 تم نسخ الصنف");
  }

  /* ── delete ── */
  function deleteItem(type, index) {
    const name = type === "menu" ? menu[index].label : featured[index].label;
    if (!confirm(`تحذف "${name}"؟`)) return;
    if (type === "menu") {
      const u = menu.filter((_, i) => i !== index); setMenu(u); saveLS("admin_menu", u);
    } else {
      const u = featured.filter((_, i) => i !== index); setFeatured(u); saveLS("admin_featured", u);
    }
    logHistory(`حذف: ${name}`);
    showToast("🗑 تم الحذف", "warn");
  }

  /* ── reorder ── */
  function moveItem(type, from, to) {
    const arr = type === "menu" ? [...menu] : [...featured];
    if (to < 0 || to >= arr.length) return;
    const [moved] = arr.splice(from, 1); arr.splice(to, 0, moved);
    if (type === "menu") { setMenu(arr); saveLS("admin_menu", arr); }
    else { setFeatured(arr); saveLS("admin_featured", arr); }
  }

  function onDragStart(i)   { setDragIdx(i); }
  function onDragOver(e, i) { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) { moveItem(tab, dragIdx, i); setDragIdx(i); } }
  function onDragEnd()      { setDragIdx(null); }

  /* ── reset ── */
  function resetToDefault() {
    if (!confirm("إرجاع كل البيانات للافتراضية؟")) return;
    setMenu(DEFAULT_MENU); saveLS("admin_menu", DEFAULT_MENU);
    setFeatured(DEFAULT_FEATURED); saveLS("admin_featured", DEFAULT_FEATURED);
    logHistory("إرجاع للافتراضي");
    showToast("↺ تم الإرجاع", "warn");
  }

  /* ── export / import ── */
  function exportData() {
    const data = JSON.stringify({ menu, featured, exportedAt: new Date().toISOString() }, null, 2);
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([data], { type: "application/json" })), download: "pizzakhanum-data.json" });
    a.click();
    showToast("📦 تم تصدير البيانات");
  }

  function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    new FileReader().onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (p.menu)     { setMenu(p.menu);         saveLS("admin_menu",     p.menu); }
        if (p.featured) { setFeatured(p.featured);  saveLS("admin_featured", p.featured); }
        logHistory("استيراد بيانات");
        showToast("📥 تم الاستيراد");
      } catch { showToast("⚠ الملف غير صالح", "error"); }
    }, new FileReader().readAsText(file);
    // ← fix: proper reader
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const p = JSON.parse(ev.target.result);
        if (p.menu)     { setMenu(p.menu);        saveLS("admin_menu",     p.menu); }
        if (p.featured) { setFeatured(p.featured); saveLS("admin_featured", p.featured); }
        logHistory("استيراد بيانات"); showToast("📥 تم الاستيراد");
      } catch { showToast("⚠ الملف غير صالح", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  /* ── save settings ── */
  function saveSettings() {
    saveLS("site_name",      siteName);
    saveLS("site_slogan",    siteSlogan);
    saveLS("site_whatsapp",  whatsapp);
    saveLS("show_price_new", showNew);
    logHistory("تعديل الإعدادات");
    showToast("⚙️ تم حفظ الإعدادات");
  }

  /* ── filtered list ── */
  const sourceList = tab === "menu" ? menu : featured;
  const items = sourceList.filter(it =>
    !search || it.label.includes(search) || (it.details || it.desc || "").includes(search)
  );

  /* ══════════════ LOGIN ══════════════ */
  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Kufi Arabic',sans-serif", direction:"rtl" }}>
      <style>{CSS}</style>
      <div className="slide-up" style={{ background:"#141414", border:"1px solid #C8A96A22", borderRadius:20, padding:"36px 32px", width:"min(360px,95vw)", textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:12 }}>🍕</div>
        <h1 style={{ color:"#C8A96A", fontSize:"1.3rem", marginBottom:4 }}>بيتزا خانم</h1>
        <p style={{ fontSize:".72rem", color:"#444", marginBottom:28 }}>لوحة التحكم — أدمن فقط</p>
        {authError && <div style={{ background:"#1a0808", border:"1px solid #ef444433", borderRadius:10, padding:"9px 14px", marginBottom:16, fontSize:".8rem", color:"#ef4444" }}>⚠ {authError}</div>}
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} className="admin-input" required />
          <button type="submit" style={{ width:"100%", marginTop:16, padding:"13px", background:"linear-gradient(135deg,#C8A96A,#8B6B4A)", border:"none", borderRadius:12, fontSize:".92rem", fontWeight:700, color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit" }}>
            دخول →
          </button>
        </form>
      </div>
    </div>
  );

  /* ══════════════ EDIT MODAL ══════════════ */
  const EditModal = editing !== null && (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
      <div className="modal-box slide-up">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ color:"#C8A96A", fontSize:"1rem" }}>✏️ تعديل: {form.label}</h2>
          <button onClick={() => setEditing(null)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"1.4rem", lineHeight:1 }}>×</button>
        </div>

        <span className="section-label">اسم الصنف</span>
        <input className="admin-input" value={form.label || ""} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />

        {editing.type === "menu" && <>
          <span className="section-label">الوصف والمكونات</span>
          <textarea className="admin-input" rows={4} style={{ resize:"vertical" }} value={form.details || ""} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} placeholder="اكتب مكونات البيتزا..." />

          <span className="section-label">الحالة</span>
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button className={`toggle-pill ${!form.comingSoon ? "on" : ""}`} onClick={() => setForm(p => ({ ...p, comingSoon:false }))}>✅ ظاهر في القائمة</button>
            <button className={`toggle-pill ${form.comingSoon ? "warn" : ""}`} onClick={() => setForm(p => ({ ...p, comingSoon:true }))}>⏳ قريباً</button>
          </div>
        </>}

        {editing.type === "featured" && <>
          <span className="section-label">الوصف</span>
          <textarea className="admin-input" rows={3} style={{ resize:"vertical" }} value={form.desc || ""} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} />

          {form.priceOld !== null && form.priceOld !== undefined && <>
            <span className="section-label">الأسعار</span>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:6 }}>
              <div>
                <p style={{ fontSize:".68rem", color:"#555", marginBottom:4 }}>السعر القديم (ل.س)</p>
                <input className="admin-input" style={{ marginTop:0 }} value={form.priceOld || ""} onChange={e => setForm(p => ({ ...p, priceOld:e.target.value, numericPrice:parseInt(e.target.value.replace(/,/g,""))||p.numericPrice }))} placeholder="150,000" />
              </div>
              <div>
                <p style={{ fontSize:".68rem", color:"#555", marginBottom:4 }}>السعر الجديد (ل.ج)</p>
                <input className="admin-input" style={{ marginTop:0 }} value={form.priceNew || ""} onChange={e => setForm(p => ({ ...p, priceNew:e.target.value }))} placeholder="1,500" />
              </div>
            </div>
          </>}

          {form._sizes && <>
            <span className="section-label">أحجام بيتزا خانم</span>
            {form._sizes.map((sz, si) => (
              <div key={sz.id} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:12, padding:14, marginTop:8 }}>
                <p style={{ fontSize:".75rem", color:"#C8A96A88", marginBottom:10, fontWeight:700 }}>{sz.label}</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <p style={{ fontSize:".65rem", color:"#444", marginBottom:4 }}>السعر القديم</p>
                    <input className="admin-input" style={{ marginTop:0 }} value={sz.priceOld || ""} onChange={e => setForm(p => { const s=[...p._sizes]; s[si]={...s[si],priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||s[si].numericPrice}; return {...p,_sizes:s}; })} />
                  </div>
                  <div>
                    <p style={{ fontSize:".65rem", color:"#444", marginBottom:4 }}>السعر الجديد</p>
                    <input className="admin-input" style={{ marginTop:0 }} value={sz.priceNew || ""} onChange={e => setForm(p => { const s=[...p._sizes]; s[si]={...s[si],priceNew:e.target.value}; return {...p,_sizes:s}; })} />
                  </div>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* معاينة */}
        <div className="preview-box">
          <p style={{ fontSize:".6rem", color:"#2a2a2a", marginBottom:8, letterSpacing:"2px" }}>معاينة مباشرة</p>
          <p style={{ fontWeight:700, color:"#E5D3B3", fontSize:".9rem", marginBottom:4 }}>{form.label || "—"}</p>
          <p style={{ fontSize:".72rem", color:"#555", lineHeight:1.5 }}>{form.details || form.desc || "—"}</p>
          {(form.priceOld || form.priceNew) && (
            <p style={{ fontSize:".78rem", color:"#C8A96A", marginTop:6, fontWeight:700 }}>
              {form.priceOld} ل.س {form.priceNew && `/ ${form.priceNew} ل.ج`}
            </p>
          )}
          {form.comingSoon && <span className="badge badge-gold" style={{ marginTop:8, display:"inline-block" }}>قريباً</span>}
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={saveEdit} style={{ flex:1, padding:"12px", background:"#C8A96A", border:"none", borderRadius:10, color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit", fontSize:".88rem", fontWeight:700 }}>
            💾 حفظ التغييرات
          </button>
          <button onClick={() => setEditing(null)} style={{ padding:"12px 18px", background:"#1e1e1e", border:"none", borderRadius:10, color:"#666", cursor:"pointer", fontFamily:"inherit" }}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

  /* ══════════════ DASHBOARD ══════════════ */
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#E5D3B3", fontFamily:"'Noto Kufi Arabic',sans-serif", direction:"rtl" }}>
      <style>{CSS}</style>
      {EditModal}

      {/* Toast */}
      {toast && (
        <div className="toast-anim" style={{
          position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
          background: toast.type==="error"?"#1a0808":toast.type==="warn"?"#1a1408":"#0d1a0d",
          border:`1px solid ${toast.type==="error"?"#ef4444":toast.type==="warn"?"#C8A96A":"#4CAF50"}`,
          borderRadius:12, padding:"11px 22px", zIndex:2000,
          color: toast.type==="error"?"#ef4444":toast.type==="warn"?"#C8A96A":"#4CAF50",
          fontSize:".82rem", fontWeight:600, whiteSpace:"nowrap", boxShadow:"0 8px 32px #00000088",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background:"#111", borderBottom:"1px solid #1a1a1a", padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"1.5rem" }}>🍕</span>
          <div>
            <h1 style={{ fontSize:".95rem", fontWeight:900, color:"#C8A96A" }}>بيتزا خانم</h1>
            <p style={{ fontSize:".6rem", color:"#333" }}>لوحة التحكم</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:7, alignItems:"center", flexWrap:"wrap" }}>
          <button className="icon-btn" onClick={exportData} style={{ background:"#141414", border:"1px solid #252525", color:"#888" }}>📦 تصدير</button>
          <label className="icon-btn" style={{ background:"#141414", border:"1px solid #252525", color:"#888", cursor:"pointer" }}>
            📥 استيراد
            <input type="file" accept=".json" onChange={importData} style={{ display:"none" }} />
          </label>
          <button className="icon-btn" onClick={resetToDefault} style={{ background:"#1a1a0a", border:"1px solid #C8A96A22", color:"#8B6B4A" }}>↺</button>
          <button className="icon-btn" onClick={() => setAuthed(false)} style={{ background:"#1a1010", border:"1px solid #ef444422", color:"#666" }}>خروج</button>
        </div>
      </div>

      <div style={{ padding:"20px 20px 60px", maxWidth:760, margin:"0 auto" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
          {[
            { label:"القائمة",  value:menu.length,                          color:"#C8A96A", icon:"🍕" },
            { label:"ظاهر",     value:menu.filter(p=>!p.comingSoon).length, color:"#4CAF50", icon:"✅" },
            { label:"قريباً",   value:menu.filter(p=>p.comingSoon).length,  color:"#ef4444", icon:"⏳" },
            { label:"المميزة",  value:featured.length,                      color:"#4DA6FF", icon:"⭐" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize:"1.1rem", marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:"1.5rem", fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:".62rem", color:"#444", marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {[["menu","🍕 القائمة"],["featured","⭐ المميزة"],["history","📋 السجل"],["settings","⚙️ الإعدادات"]].map(([k,l]) => (
            <button key={k} className={`tab-btn ${tab===k?"active":""}`} onClick={() => { setTab(k); setSearch(""); }}>{l}</button>
          ))}
          {tab === "menu" && (
            <button className="icon-btn" onClick={addMenuItem} style={{ background:"#0d1a0d", border:"1px solid #4CAF5033", color:"#4CAF50", marginRight:"auto" }}>
              + إضافة صنف
            </button>
          )}
        </div>

        {/* ── TAB: MENU / FEATURED ── */}
        {(tab === "menu" || tab === "featured") && (<>
          <input className="search-box" placeholder={`🔍  ابحث في ${tab==="menu"?"القائمة":"العروض المميزة"}...`} value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:14 }} />

          {tab === "menu" && (
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              {[
                { label:`الكل (${menu.length})`,                         q:"" },
                { label:`ظاهر (${menu.filter(p=>!p.comingSoon).length})`, q:"__visible__" },
                { label:`قريباً (${menu.filter(p=>p.comingSoon).length})`, q:"__hidden__" },
              ].map(f => (
                <button key={f.q} onClick={() => setSearch(f.q)}
                  style={{ padding:"5px 12px", background:search===f.q?"#C8A96A22":"#141414", border:`1px solid ${search===f.q?"#C8A96A44":"#1e1e1e"}`, borderRadius:20, color:search===f.q?"#C8A96A":"#444", cursor:"pointer", fontFamily:"inherit", fontSize:".72rem" }}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* tip */}
          <p style={{ fontSize:".65rem", color:"#2a2a2a", marginBottom:10 }}>⠿ اسحب الصنف لإعادة الترتيب · ▲▼ للتحريك السريع</p>

          {(tab==="menu"
            ? (search==="__visible__" ? menu.filter(p=>!p.comingSoon) : search==="__hidden__" ? menu.filter(p=>p.comingSoon) : items)
            : items
          ).map((item, _i) => {
            const realIdx = sourceList.indexOf(item);
            return (
              <div key={item.id || realIdx} className="item-row fade-in"
                draggable onDragStart={() => onDragStart(realIdx)} onDragOver={e => onDragOver(e, realIdx)} onDragEnd={onDragEnd}
                style={{ borderColor: dragIdx === realIdx ? "#C8A96A44" : "" }}>

                <span style={{ color:"#2a2a2a", fontSize:"1.1rem", cursor:"grab", userSelect:"none", padding:"4px 2px" }} title="اسحب لإعادة الترتيب">⠿</span>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontWeight:700, color:"#E5D3B3", fontSize:".88rem" }}>{item.label}</span>
                    {tab === "menu" && (item.comingSoon
                      ? <span className="badge badge-gold">قريباً</span>
                      : <span className="badge badge-green">ظاهر</span>
                    )}
                    {tab === "featured" && item.priceOld && <span className="badge badge-gold">{item.priceOld} ل.س</span>}
                    {tab === "featured" && item.sizes   && <span className="badge badge-blue">حسب الحجم</span>}
                  </div>
                  <p style={{ fontSize:".7rem", color:"#333", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {item.details || item.desc || "—"}
                  </p>
                </div>

                <div style={{ display:"flex", gap:5, flexShrink:0, alignItems:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <button onClick={() => moveItem(tab, realIdx, realIdx-1)} style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontSize:".75rem", lineHeight:1, padding:"2px 5px" }}>▲</button>
                    <button onClick={() => moveItem(tab, realIdx, realIdx+1)} style={{ background:"none", border:"none", color:"#2a2a2a", cursor:"pointer", fontSize:".75rem", lineHeight:1, padding:"2px 5px" }}>▼</button>
                  </div>

                  {tab === "menu" && (
                    <button onClick={() => toggleComingSoon(realIdx)}
                      style={{ padding:"6px 10px", background:item.comingSoon?"#1a0d0d":"#0d1a0d", border:`1px solid ${item.comingSoon?"#ef444433":"#4CAF5033"}`, borderRadius:8, color:item.comingSoon?"#ef4444":"#4CAF50", cursor:"pointer", fontSize:".72rem", fontWeight:700, fontFamily:"inherit" }}>
                      {item.comingSoon ? "إظهار" : "إخفاء"}
                    </button>
                  )}

                  <button className="icon-btn" onClick={() => openEdit(tab, realIdx)} style={{ background:"#1a1a1a", border:"1px solid #252525", color:"#C8A96A" }}>✏️</button>
                  <button className="icon-btn" onClick={() => duplicateItem(tab, realIdx)} style={{ background:"#111", border:"1px solid #1e1e1e", color:"#444" }} title="نسخ">📋</button>
                  <button className="icon-btn" onClick={() => deleteItem(tab, realIdx)} style={{ background:"#1a0d0d", border:"1px solid #ef444422", color:"#ef4444" }}>🗑</button>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ── TAB: HISTORY ── */}
        {tab === "history" && (
          <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:14, padding:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h2 style={{ fontSize:".9rem", color:"#C8A96A" }}>📋 سجل التعديلات</h2>
              <button onClick={() => { setHistory([]); saveLS("admin_history",[]); }} style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:8, color:"#444", cursor:"pointer", padding:"5px 10px", fontSize:".72rem", fontFamily:"inherit" }}>
                مسح السجل
              </button>
            </div>
            {history.length === 0
              ? <p style={{ color:"#2a2a2a", fontSize:".8rem", textAlign:"center", padding:"24px 0" }}>لا يوجد سجل بعد</p>
              : history.map((h, i) => (
                <div key={i} className="history-entry">
                  <span>{h.action}</span>
                  <span style={{ color:"#2a2a2a", flexShrink:0 }}>{h.time}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* ── TAB: SETTINGS ── */}
        {tab === "settings" && (
          <div style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:14, padding:24 }}>
            <h2 style={{ fontSize:".9rem", color:"#C8A96A", marginBottom:20 }}>⚙️ إعدادات الموقع</h2>

            <span className="section-label">اسم المطعم</span>
            <input className="admin-input" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="بيتزا خانم" />

            <span className="section-label">الشعار (tagline)</span>
            <input className="admin-input" value={siteSlogan} onChange={e => setSiteSlogan(e.target.value)} placeholder="كُل لتعيش..." />

            <span className="section-label">رقم واتساب للطلبات (بدون +)</span>
            <input className="admin-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="963998950904" dir="ltr" />

            <span className="section-label">عرض السعر الجديد (ل.ج) للزوار</span>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button className={`toggle-pill ${showNew ? "on" : ""}`} onClick={() => setShowNew(true)}>✅ ظاهر</button>
              <button className={`toggle-pill ${!showNew ? "warn" : ""}`} onClick={() => setShowNew(false)}>❌ مخفي</button>
            </div>

            <button onClick={saveSettings} style={{ marginTop:24, width:"100%", padding:"13px", background:"#C8A96A", border:"none", borderRadius:12, color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit", fontSize:".9rem", fontWeight:700 }}>
              💾 حفظ الإعدادات
            </button>

            <div style={{ marginTop:20, background:"#0f0f0f", border:"1px solid #1a1a1a", borderRadius:12, padding:16 }}>
              <p style={{ fontSize:".7rem", color:"#333", marginBottom:12 }}>⚠️ منطقة خطر</p>
              <button onClick={resetToDefault} style={{ width:"100%", padding:"11px", background:"#1a0808", border:"1px solid #ef444433", borderRadius:10, color:"#ef4444", cursor:"pointer", fontFamily:"inherit", fontSize:".82rem", fontWeight:700 }}>
                ↺ إرجاع كل البيانات للافتراضية
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
