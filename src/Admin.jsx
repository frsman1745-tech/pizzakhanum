// src/Admin.jsx — لوحة تحكم بيتزا خانم
// ✅ جميع useState قبل useEffect (يحل خطأ "Cannot access before initialization")
// ✅ Cloudinary عبر متغيرات البيئة (لا قيم مكتوبة بالكود)
// ✅ CRUD كامل مع MongoDB عبر /api/pizzas
// ✅ الصور من Cloudinary — لا localStorage — لا Base64

import { useState, useRef, useEffect, useCallback } from "react";

/* ══ CSS ═══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #C8A96A2a; border-radius: 2px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn   { 0% { opacity:0; transform:scale(.9); } 60% { transform:scale(1.03); } 100% { opacity:1; transform:scale(1); } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes toast-in{ from { opacity:0; transform:translateX(-50%) translateY(-12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

  .au  { animation: fadeUp .35s ease forwards; }
  .apu { animation: popIn .3s ease forwards; }

  /* inputs */
  .ai {
    display: block; width: 100%; padding: 10px 13px; margin-top: 6px;
    background: #141414; border: 1px solid #252525; border-radius: 11px;
    color: #E5D3B3; font-size: .84rem; font-family: inherit; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .ai:focus { border-color: #C8A96A; box-shadow: 0 0 0 3px #C8A96A0f; }

  /* tabs */
  .tb {
    padding: 7px 14px; border-radius: 20px; border: 1px solid #1a1a1a;
    background: #141414; color: #2e2e2e; cursor: pointer; font-family: inherit;
    font-size: .78rem; font-weight: 600; transition: all .2s;
  }
  .tb:hover { color: #C8A96A44; border-color: #C8A96A1a; }
  .tb.on { background: #C8A96A1a; border-color: #C8A96A33; color: #C8A96A; }

  /* icon button */
  .ib {
    padding: 7px 10px; border-radius: 9px; cursor: pointer; font-family: inherit;
    font-size: .78rem; border: 1px solid #1e1e1e; background: #141414;
    transition: all .18s;
  }
  .ib:hover { border-color: #C8A96A22; background: #1a1408; }

  /* stat card */
  .stat {
    background: #141414; border: 1px solid #1a1a1a; border-radius: 13px;
    padding: 11px 8px; text-align: center;
  }

  /* list row */
  .row {
    background: #131313; border: 1px solid #1a1a1a; border-radius: 13px;
    padding: 11px 12px; display: flex; align-items: center; gap: 10px;
    margin-bottom: 8px; transition: border-color .2s;
  }
  .row:hover { border-color: #C8A96A1a; }

  /* search */
  .srch {
    display: block; width: 100%; padding: 10px 14px; margin-bottom: 10px;
    background: #141414; border: 1px solid #1a1a1a; border-radius: 11px;
    color: #E5D3B3; font-size: .84rem; font-family: inherit; outline: none;
    transition: border-color .2s;
  }
  .srch:focus { border-color: #C8A96A33; }

  /* modal */
  .mbg {
    position: fixed; inset: 0; background: rgba(0,0,0,.75);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 1000; backdrop-filter: blur(4px);
  }
  .mbox {
    background: #161616; border: 1px solid #222; border-radius: 22px 22px 0 0;
    width: min(520px, 100vw); max-height: 92vh; overflow-y: auto;
    padding: 22px 20px 36px;
  }
  .cbox {
    background: #161616; border: 1px solid #222; border-radius: 18px;
    width: min(340px, 94vw); padding: 24px 22px; margin-bottom: 32px;
  }

  /* image zone */
  .imgzone {
    width: 100%; aspect-ratio: 16/9; border-radius: 12px;
    border: 1.5px dashed #252525; background: #111;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; cursor: pointer; overflow: hidden; position: relative;
    transition: border-color .2s;
  }
  .imgzone:hover { border-color: #C8A96A44; }
  .imgzone img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; }
  .ov {
    position: absolute; inset: 0; background: rgba(0,0,0,.55);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; opacity: 0; transition: opacity .2s;
  }
  .imgzone:hover .ov { opacity: 1; }

  /* thumbnail in list */
  .thumb { width:44px; height:44px; border-radius:9px; object-fit:cover; flex-shrink:0; }
  .thumbph {
    width:44px; height:44px; border-radius:9px; background:#1a1008;
    display:flex; align-items:center; justify-content:center;
    font-size:1.2rem; flex-shrink:0; border:1px solid #1e1e1e;
  }

  /* section label */
  .sl { display:block; font-size:.62rem; color:#C8A96A66; letter-spacing:2px; margin-top:14px; margin-bottom:0; }

  /* badge */
  .badge {
    font-size:.52rem; padding:2px 7px; border-radius:10px; font-weight:700;
    font-family:'Noto Kufi Arabic',sans-serif;
  }
  .bg { background:#0d1a0d; color:#4CAF50; border:1px solid #4CAF5022; }
  .br { background:#1a0d0d; color:#ef4444; border:1px solid #ef444422; }
  .bo { background:#1a1408; color:#C8A96A; border:1px solid #C8A96A22; }
  .bb { background:#06111f; color:#4DA6FF; border:1px solid #4DA6FF22; }

  /* pill status toggle */
  .pill {
    flex:1; padding:8px; border-radius:10px; cursor:pointer; font-family:inherit;
    font-size:.76rem; font-weight:600; border:1px solid #1e1e1e;
    background:#141414; color:#444; transition:all .2s;
  }
  .pill.on  { background:#0d1a0d; border-color:#4CAF5033; color:#4CAF50; }
  .pill.off { background:#1a0d0d; border-color:#ef444433; color:#ef4444; }

  /* delete btn */
  .delbtn {
    display:block; margin-top:5px; font-size:.62rem; color:#6a2a2a;
    background:none; border:none; cursor:pointer; font-family:inherit;
    padding:0; text-decoration:underline;
  }

  /* history row */
  .hrow {
    display:flex; justify-content:space-between; align-items:center;
    padding:7px 0; border-bottom:1px solid #161616; font-size:.72rem; color:#8B6B4A;
  }

  /* upload overlay */
  .upl-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,.7);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:8px; border-radius:12px;
  }
  .upl-spinner {
    width:22px; height:22px; border:2px solid #C8A96A33;
    border-top-color:#C8A96A; border-radius:50%;
    animation:spin .6s linear infinite;
  }
`;

/* ══ HELPERS ════════════════════════════════════════════════════════════════ */
function lsGet(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } }
function lsSet(k, v)   { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

/* ══ CLOUDINARY UPLOAD ══════════════════════════════════════════════════════ */
async function uploadToCloudinary(file) {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("أضف VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في ملف .env");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  fd.append("folder", "pizza-khanum");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Cloudinary خطأ ${res.status}`);
  }
  const data = await res.json();
  return data.secure_url;
}

/* ══ ADMIN COMPONENT ════════════════════════════════════════════════════════ */
export default function Admin() {

  /* ──────────────────────────────────────────────────────────────────────────
     ⚠️  جميع useState يجب أن تكون هنا قبل أي useEffect
     هذا يحل خطأ: "Cannot access 'oe' before initialization"
  ────────────────────────────────────────────────────────────────────────── */

  // المصادقة
  const [authed,   setAuthed]   = useState(() => lsGet("admin_authed", false));
  const [pass,     setPass]     = useState("");
  const [authErr,  setAuthErr]  = useState("");

  // البيانات
  const [menu,     setMenu]     = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tick,     setTick]     = useState(0); // ← يجب أن يكون قبل useEffect

  // واجهة
  const [tab,      setTab]      = useState("menu");
  const [search,   setSearch]   = useState("");

  // المودال
  const [editing,  setEditing]  = useState(null); // { type, id } أو null
  const [form,     setForm]     = useState({});
  const [imgP,     setImgP]     = useState(null); // رابط صورة الكارد
  const [imgF,     setImgF]     = useState(null); // رابط صورة النكهة
  const [uploadingP, setUploadingP] = useState(false);
  const [uploadingF, setUploadingF] = useState(false);
  const [saving,   setSaving]   = useState(false);

  // Confirm dialog
  const [confirmDlg, setConfirmDlg] = useState(null);

  // Toast
  const [toast,    setToast]    = useState(null);

  // السجل
  const [history,  setHistory]  = useState(() => lsGet("admin_history", []));

  // Drag & drop
  const [dragId,   setDragId]   = useState(null);

  // الإعدادات
  const [siteName, setSiteName] = useState(() => lsGet("site_name",    "بيتزا خانم"));
  const [slogan,   setSlogan]   = useState(() => lsGet("site_slogan",  "كُل لتعيش · وعِش لأجل البيتزا"));
  const [wapp,     setWapp]     = useState(() => lsGet("site_whatsapp","963998950904"));

  // Refs
  const pRef   = useRef();
  const fRef   = useRef();
  const impRef = useRef();

  /* ══ useEffect — يأتي بعد جميع useState ════════════════════════════════ */
  const fetchData = useCallback(async () => {
    if (!authed) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/pizzas");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      const data = json.data || [];
      setMenu(    data.filter(item => item.type === "menu"     || item.category === "menu"));
      setFeatured(data.filter(item => item.type === "featured" || item.category === "featured"));
    } catch (err) {
      console.error("[Admin fetchData]", err);
      toast_("❌ فشل جلب البيانات: " + err.message, "err");
    } finally {
      setLoading(false);
    }
  }, [authed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData, tick]);

  /* ══ HELPERS ════════════════════════════════════════════════════════════ */
  function toast_(m, t = "ok") {
    setToast({ m, t });
    setTimeout(() => setToast(null), 3000);
  }

  function log(a) {
    const entry = { a, t: new Date().toLocaleTimeString("ar-EG") };
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 60);
      lsSet("admin_history", next);
      return next;
    });
  }

  function confirm_(msg, onOk) { setConfirmDlg({ msg, onOk }); }

  /* ══ AUTH ════════════════════════════════════════════════════════════════ */
  function login(e) {
    e.preventDefault();
    if (pass === ADMIN_PWD) {
      setAuthed(true); lsSet("admin_authed", true); setAuthErr("");
    } else {
      setAuthErr("كلمة المرور غير صحيحة");
    }
  }

  /* ══ CRUD ════════════════════════════════════════════════════════════════ */

  // فتح مودال التعديل
  function openEdit(type, id) {
    const list = type === "menu" ? menu : featured;
    const item = list.find(x => x.id === id || x._id === id);
    if (!item) return;
    setForm({
      ...item,
      _sizes: item.sizes ? item.sizes.map(s => ({ ...s })) : undefined,
    });
    // استخدام روابط Cloudinary من قاعدة البيانات
    setImgP(item.imageUrl       || null);
    setImgF(item.flavorImageUrl || null);
    setEditing({ type, id: item._id || item.id, isNew: false });
  }

  // إضافة صنف جديد — يفتح المودال بنموذج فارغ
  function addItem() {
    setForm({ label: "", details: "", comingSoon: false });
    setImgP(null);
    setImgF(null);
    setEditing({ type: "menu", id: null, isNew: true });
    log("فتح نموذج إضافة صنف");
  }

  // حفظ (إنشاء أو تعديل)
  async function saveEdit() {
    if (!form.label?.trim()) { toast_("⚠ اسم الصنف مطلوب", "err"); return; }
    setSaving(true);
    try {
      const payload = {
        label:          form.label,
        type:           editing.type,
        details:        form.details  || "",
        desc:           form.desc     || "",
        comingSoon:     form.comingSoon ?? false,
        imageUrl:       imgP           || "",
        flavorImageUrl: imgF           || "",
        // الأسعار الثابتة (للمميزة)
        priceOld:       form.priceOld  || "",
        priceNew:       form.priceNew  || "",
        numericPrice:   form.numericPrice || 0,
        // الأحجام
        sizes:          form._sizes    || form.sizes || [],
        khanamSizes:    form.khanamSizes || [],
        sliceCount:     form.sliceCount  || 0,
        cols:           form.cols        || 0,
        sortOrder:      form.sortOrder   || 0,
      };

      let res;
      if (editing.isNew) {
        res = await fetch("/api/pizzas", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/pizzas/${editing.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      toast_(editing.isNew ? "✅ تم إضافة الصنف" : "✅ تم التعديل");
      log(editing.isNew ? `إضافة: ${form.label}` : `تعديل: ${form.label}`);
      setEditing(null);
      setTick(t => t + 1); // إعادة جلب البيانات
    } catch (err) {
      console.error("[saveEdit]", err);
      toast_("❌ " + err.message, "err");
    } finally {
      setSaving(false);
    }
  }

  // حذف
  function deleteItem(type, id) {
    const list = type === "menu" ? menu : featured;
    const item = list.find(x => x.id === id || x._id === id);
    confirm_(`حذف "${item?.label}"؟ هذه العملية لا يمكن التراجع عنها.`, async () => {
      try {
        const dbId = item?._id || id;
        const res  = await fetch(`/api/pizzas/${dbId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        toast_("🗑 تم الحذف");
        log(`حذف: ${item?.label}`);
        setTick(t => t + 1);
      } catch (err) {
        toast_("❌ فشل الحذف: " + err.message, "err");
      }
    });
  }

  // تبديل comingSoon
  async function toggleCS(id) {
    const item = menu.find(x => x.id === id || x._id === id);
    if (!item) return;
    try {
      const res = await fetch(`/api/pizzas/${item._id || id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ comingSoon: !item.comingSoon }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      log(`${item.comingSoon ? "إظهار" : "إخفاء"}: ${item.label}`);
      setTick(t => t + 1);
    } catch (err) {
      toast_("❌ " + err.message, "err");
    }
  }

  // نسخ
  async function dupItem(type, id) {
    const list = type === "menu" ? menu : featured;
    const item = list.find(x => x.id === id || x._id === id);
    if (!item) return;
    try {
      const res = await fetch("/api/pizzas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...item, label: item.label + " — نسخة", _id: undefined, id: undefined }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      toast_("📋 تم النسخ");
      log(`نسخ: ${item.label}`);
      setTick(t => t + 1);
    } catch (err) {
      toast_("❌ فشل النسخ: " + err.message, "err");
    }
  }

  // ترتيب بالسحب
  async function onDragOver(e, type, overId) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const list   = type === "menu" ? [...menu] : [...featured];
    const setFn  = type === "menu" ? setMenu  : setFeatured;
    const fromIdx = list.findIndex(x => (x.id || x._id) === dragId);
    const toIdx   = list.findIndex(x => (x.id || x._id) === overId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...list];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setFn(next);
  }

  // حفظ الترتيب في DB
  async function onDragEnd() {
    setDragId(null);
    const list = tab === "menu" ? menu : featured;
    // نرسل PATCH لكل عنصر بـ sortOrder جديد
    try {
      await Promise.all(
        list.map((item, idx) =>
          fetch(`/api/pizzas/${item._id || item.id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ sortOrder: idx }),
          })
        )
      );
      log("ترتيب القائمة");
    } catch (err) {
      console.error("[sort save]", err);
    }
  }

  // تحريك بالأسهم
  async function move(type, id, dir) {
    const list   = type === "menu" ? [...menu] : [...featured];
    const setFn  = type === "menu" ? setMenu  : setFeatured;
    const idx    = list.findIndex(x => (x.id || x._id) === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    const next   = [...list];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setFn(next);
    try {
      await Promise.all([
        fetch(`/api/pizzas/${next[idx]._id || next[idx].id}`,    { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: idx })    }),
        fetch(`/api/pizzas/${next[newIdx]._id || next[newIdx].id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sortOrder: newIdx }) }),
      ]);
    } catch (err) { console.error("[move]", err); }
  }

  // رفع صورة
  async function handleImgUpload(file, which) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast_("⚠ يجب اختيار ملف صورة", "err"); return; }
    if (file.size > 5 * 1024 * 1024)    { toast_("⚠ الصورة أكبر من 5 MB",  "err"); return; }
    const setUploading = which === "p" ? setUploadingP : setUploadingF;
    const setImg       = which === "p" ? setImgP       : setImgF;
    setUploading(true);
    toast_("⏳ جاري رفع الصورة...");
    try {
      const url = await uploadToCloudinary(file);
      setImg(url);
      toast_("✅ تم رفع الصورة");
    } catch (err) {
      toast_("❌ " + err.message, "err");
    } finally {
      setUploading(false);
    }
  }

  // تصدير البيانات
  function exportData() {
    const d = JSON.stringify({ menu, featured, exportedAt: new Date().toISOString() }, null, 2);
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(new Blob([d], { type: "application/json" })),
      download: "pizzakhanum-backup.json",
    });
    a.click();
    toast_("📦 تم تصدير البيانات");
  }

  // استيراد (يُحدّث DB)
  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        const items  = [...(parsed.menu || []), ...(parsed.featured || [])];
        let created  = 0;
        for (const item of items) {
          const res = await fetch("/api/pizzas", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(item),
          });
          if (res.ok) created++;
        }
        toast_(`📥 تم استيراد ${created} صنف`);
        log("استيراد بيانات");
        setTick(t => t + 1);
      } catch {
        toast_("⚠ ملف غير صالح", "err");
      }
    };
    r.readAsText(file);
    e.target.value = "";
  }

  // حفظ الإعدادات
  function saveSettings() {
    lsSet("site_name",      siteName);
    lsSet("site_slogan",    slogan);
    lsSet("site_whatsapp",  wapp);
    log("تعديل الإعدادات");
    toast_("⚙️ تم حفظ الإعدادات");
  }

  /* ══ FILTERED LIST ══════════════════════════════════════════════════════ */
  const src = tab === "menu" ? menu : featured;
  const displayItems =
    tab === "menu" && search === "__v" ? menu.filter(p => !p.comingSoon) :
    tab === "menu" && search === "__h" ? menu.filter(p =>  p.comingSoon) :
    src.filter(it =>
      !search ||
      (it.label || "").includes(search) ||
      (it.details || it.desc || "").includes(search)
    );

  /* ════════════════════════════════════════════════════════════════════════
     ══ LOGIN SCREEN ══
  ════════════════════════════════════════════════════════════════════════ */
  if (!authed) return (
    <div style={{ minHeight:"100vh", background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Noto Kufi Arabic',sans-serif", direction:"rtl" }}>
      <style>{CSS}</style>
      <div className="au" style={{ background:"#141414", border:"1px solid #C8A96A1a", borderRadius:20, padding:"34px 28px", width:"min(340px,95vw)", textAlign:"center" }}>
        <div style={{ fontSize:"2.8rem", marginBottom:10 }}>🍕</div>
        <h1 style={{ color:"#C8A96A", fontSize:"1.2rem", marginBottom:4 }}>بيتزا خانم</h1>
        <p style={{ fontSize:".7rem", color:"#333", marginBottom:24 }}>لوحة التحكم — أدمن فقط</p>
        {authErr && (
          <div style={{ background:"#1a0808", border:"1px solid #ef444422", borderRadius:9, padding:"8px 12px", marginBottom:14, fontSize:".8rem", color:"#ef4444" }}>
            ⚠ {authErr}
          </div>
        )}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e => setPass(e.target.value)} className="ai" required style={{ marginBottom:0 }}/>
          <button type="submit" style={{ width:"100%", marginTop:14, padding:"12px", background:"linear-gradient(135deg,#C8A96A,#8B6B4A)", border:"none", borderRadius:11, fontSize:".9rem", fontWeight:700, color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit" }}>
            دخول →
          </button>
        </form>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ CONFIRM DIALOG ══
  ════════════════════════════════════════════════════════════════════════ */
  const ConfirmDlg = confirmDlg && (
    <div className="mbg" style={{ zIndex:1100 }} onClick={e => { if (e.target === e.currentTarget) setConfirmDlg(null); }}>
      <div className="cbox apu">
        <div style={{ fontSize:"2rem", marginBottom:10 }}>🗑</div>
        <p style={{ color:"#E5D3B3", fontSize:".88rem", marginBottom:20, lineHeight:1.6 }}>{confirmDlg.msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={() => { confirmDlg.onOk(); setConfirmDlg(null); }} style={{ padding:"10px 22px", background:"#ef4444", border:"none", borderRadius:10, color:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:".85rem", fontWeight:700 }}>
            تأكيد الحذف
          </button>
          <button onClick={() => setConfirmDlg(null)} style={{ padding:"10px 22px", background:"#1e1e1e", border:"1px solid #252525", borderRadius:10, color:"#666", cursor:"pointer", fontFamily:"inherit", fontSize:".85rem" }}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ EDIT MODAL ══
  ════════════════════════════════════════════════════════════════════════ */
  const EditModal = editing && (
    <div className="mbg" onClick={e => { if (e.target === e.currentTarget && !saving) setEditing(null); }}>
      <div className="mbox au">

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h2 style={{ color:"#C8A96A", fontSize:".95rem" }}>
            {editing.isNew ? "✨ إضافة صنف جديد" : `✏️ ${form.label}`}
          </h2>
          <button onClick={() => { if (!saving) setEditing(null); }} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:"1.4rem", lineHeight:1 }}>×</button>
        </div>

        {/* ─ الصور ─ */}
        <span className="sl">الصور</span>
        <div style={{ display:"grid", gridTemplateColumns: editing.type === "menu" ? "1fr 1fr" : "1fr", gap:12, marginTop:6 }}>

          {/* صورة الكارد */}
          <div>
            <p style={{ fontSize:".64rem", color:"#555", marginBottom:3 }}>📷 صورة الكارد</p>
            <div className="imgzone" style={{ position:"relative" }} onClick={() => !uploadingP && pRef.current.click()}>
              {imgP && <img src={imgP} alt="preview"/>}
              <div className="ov">
                <span style={{ fontSize:"1.3rem" }}>📷</span>
                <span style={{ fontSize:".66rem", color:"#ddd", marginTop:3 }}>تغيير</span>
              </div>
              {!imgP && (
                <><span style={{ fontSize:"1.6rem", opacity:.2 }}>🖼</span><span style={{ fontSize:".7rem", color:"#2a2a2a", marginTop:5 }}>اضغط لرفع صورة</span></>
              )}
              {uploadingP && (
                <div className="upl-overlay">
                  <div className="upl-spinner"/>
                  <span style={{ fontSize:".7rem", color:"#C8A96A" }}>جاري الرفع...</span>
                </div>
              )}
            </div>
            <input ref={pRef} type="file" accept="image/*" style={{ display:"none" }}
              onChange={e => handleImgUpload(e.target.files[0], "p")} />
            {imgP && <button className="delbtn" onClick={() => setImgP(null)}>× حذف الصورة</button>}
          </div>

          {/* صورة النكهة — للقائمة فقط */}
          {editing.type === "menu" && (
            <div>
              <p style={{ fontSize:".64rem", color:"#555", marginBottom:3 }}>🎨 صورة النكهة</p>
              <div className="imgzone" style={{ position:"relative" }} onClick={() => !uploadingF && fRef.current.click()}>
                {imgF && <img src={imgF} alt="flavor preview"/>}
                <div className="ov">
                  <span style={{ fontSize:"1.3rem" }}>🎨</span>
                  <span style={{ fontSize:".66rem", color:"#ddd", marginTop:3 }}>تغيير</span>
                </div>
                {!imgF && (
                  <><span style={{ fontSize:"1.6rem", opacity:.2 }}>🎨</span><span style={{ fontSize:".7rem", color:"#2a2a2a", marginTop:5 }}>صورة النكهة</span></>
                )}
                {uploadingF && (
                  <div className="upl-overlay">
                    <div className="upl-spinner"/>
                    <span style={{ fontSize:".7rem", color:"#C8A96A" }}>جاري الرفع...</span>
                  </div>
                )}
              </div>
              <input ref={fRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={e => handleImgUpload(e.target.files[0], "f")} />
              {imgF && <button className="delbtn" onClick={() => setImgF(null)}>× حذف الصورة</button>}
            </div>
          )}
        </div>

        {/* ─ الاسم ─ */}
        <span className="sl">اسم الصنف *</span>
        <input className="ai" value={form.label || ""} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="مثال: مارغريتا"/>

        {/* ─ القائمة ─ */}
        {editing.type === "menu" && (
          <>
            <span className="sl">المكونات والوصف</span>
            <textarea className="ai" rows={4} style={{ resize:"vertical" }} value={form.details || ""} onChange={e => setForm(p => ({ ...p, details: e.target.value }))} placeholder="جبنة القشقوان مع الصلصة الحمراء..."/>

            <span className="sl">الحالة</span>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button className={`pill${!form.comingSoon ? " on" : ""}`} onClick={() => setForm(p => ({ ...p, comingSoon: false }))}>✅ ظاهر</button>
              <button className={`pill${form.comingSoon  ? " off" : ""}`} onClick={() => setForm(p => ({ ...p, comingSoon: true  }))}>⏳ قريباً</button>
            </div>
          </>
        )}

        {/* ─ المميزة ─ */}
        {editing.type === "featured" && (
          <>
            <span className="sl">الوصف القصير</span>
            <textarea className="ai" rows={3} style={{ resize:"vertical" }} value={form.desc || ""} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}/>

            {/* الأسعار الثابتة */}
            {(form.priceOld !== undefined && form.priceOld !== null) && (
              <>
                <span className="sl">الأسعار</span>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:5 }}>
                  <div>
                    <p style={{ fontSize:".63rem", color:"#333", marginBottom:3 }}>القديم (ل.س)</p>
                    <input className="ai" style={{ marginTop:0 }} value={form.priceOld || ""} onChange={e => setForm(p => ({ ...p, priceOld: e.target.value, numericPrice: parseInt(e.target.value.replace(/,/g,"")) || p.numericPrice }))} placeholder="150,000"/>
                  </div>
                  <div>
                    <p style={{ fontSize:".63rem", color:"#333", marginBottom:3 }}>الجديد (ل.ج)</p>
                    <input className="ai" style={{ marginTop:0 }} value={form.priceNew || ""} onChange={e => setForm(p => ({ ...p, priceNew: e.target.value }))} placeholder="1,500"/>
                  </div>
                </div>
              </>
            )}

            {/* أحجام بيتزا خانم */}
            {form._sizes && (
              <>
                <span className="sl">أحجام بيتزا خانم</span>
                {form._sizes.map((sz, si) => (
                  <div key={sz.id} style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:11, padding:12, marginTop:7 }}>
                    <p style={{ fontSize:".7rem", color:"#C8A96A66", marginBottom:8, fontWeight:700 }}>{sz.label}</p>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <div>
                        <p style={{ fontSize:".62rem", color:"#333", marginBottom:3 }}>القديم</p>
                        <input className="ai" style={{ marginTop:0 }} value={sz.priceOld || ""}
                          onChange={e => setForm(p => { const s=[...p._sizes]; s[si]={...s[si],priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||s[si].numericPrice}; return{...p,_sizes:s}; })}/>
                      </div>
                      <div>
                        <p style={{ fontSize:".62rem", color:"#333", marginBottom:3 }}>الجديد</p>
                        <input className="ai" style={{ marginTop:0 }} value={sz.priceNew || ""}
                          onChange={e => setForm(p => { const s=[...p._sizes]; s[si]={...s[si],priceNew:e.target.value}; return{...p,_sizes:s}; })}/>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ─ معاينة مباشرة ─ */}
        <div style={{ background:"#0f0f0f", border:"1px solid #161616", borderRadius:12, padding:13, marginTop:15, overflow:"hidden" }}>
          <p style={{ fontSize:".57rem", color:"#1e1e1e", marginBottom:7, letterSpacing:"2px" }}>معاينة مباشرة</p>
          {imgP && <img src={imgP} alt="" style={{ width:"100%", height:96, objectFit:"cover", borderRadius:8, marginBottom:8 }}/>}
          <p style={{ fontWeight:700, color:"#E5D3B3", fontSize:".87rem", marginBottom:3 }}>{form.label || "—"}</p>
          <p style={{ fontSize:".69rem", color:"#444", lineHeight:1.5 }}>{form.details || form.desc || "—"}</p>
          {(form.priceOld || form.priceNew) && (
            <p style={{ fontSize:".74rem", color:"#C8A96A", marginTop:5, fontWeight:700 }}>
              {form.priceOld} ل.س {form.priceNew && `/ ${form.priceNew} ل.ج`}
            </p>
          )}
        </div>

        {/* ─ أزرار ─ */}
        <div style={{ display:"flex", gap:10, marginTop:15 }}>
          <button
            onClick={saveEdit}
            disabled={saving || uploadingP || uploadingF}
            style={{ flex:1, padding:"12px", background: saving ? "#555" : "#C8A96A", border:"none", borderRadius:10, color:"#0f0f0f", cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit", fontSize:".87rem", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {saving
              ? <><div style={{ width:14,height:14,border:"2px solid #0f0f0f33",borderTopColor:"#0f0f0f",borderRadius:"50%",animation:"spin .6s linear infinite" }}/> جاري الحفظ...</>
              : "💾 حفظ"
            }
          </button>
          <button onClick={() => { if (!saving) setEditing(null); }} style={{ padding:"12px 16px", background:"#1a1a1a", border:"none", borderRadius:10, color:"#555", cursor:"pointer", fontFamily:"inherit" }}>
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ DASHBOARD ══
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", color:"#E5D3B3", fontFamily:"'Noto Kufi Arabic',sans-serif", direction:"rtl" }}>
      <style>{CSS}</style>
      {ConfirmDlg}
      {EditModal}

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:16, left:"50%",
          transform:"translateX(-50%)",
          background: toast.t==="err" ? "#1a0808" : toast.t==="warn" ? "#1a1408" : "#0d1a0d",
          border:`1px solid ${toast.t==="err" ? "#ef4444" : toast.t==="warn" ? "#C8A96A" : "#4CAF50"}`,
          borderRadius:12, padding:"10px 20px", zIndex:2000,
          color: toast.t==="err" ? "#ef4444" : toast.t==="warn" ? "#C8A96A" : "#4CAF50",
          fontSize:".81rem", fontWeight:600, whiteSpace:"nowrap",
          boxShadow:"0 8px 28px #00000099",
          animation:"toast-in .25s ease forwards",
        }}>
          {toast.m}
        </div>
      )}

      {/* ─ Header ─ */}
      <div style={{ background:"#111", borderBottom:"1px solid #161616", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"1.4rem" }}>🍕</span>
          <div>
            <h1 style={{ fontSize:".9rem", fontWeight:900, color:"#C8A96A" }}>بيتزا خانم</h1>
            <p style={{ fontSize:".57rem", color:"#252525" }}>لوحة التحكم</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="ib" onClick={exportData} title="تصدير">📦</button>
          <label className="ib" style={{ cursor:"pointer" }} title="استيراد">
            📥
            <input ref={impRef} type="file" accept=".json" onChange={importData} style={{ display:"none" }}/>
          </label>
          <button className="ib" onClick={() => setTick(t => t+1)} title="تحديث" style={{ color:"#C8A96A" }}>🔄</button>
          <button className="ib" onClick={() => { setAuthed(false); lsSet("admin_authed", false); }} style={{ background:"#1a1010", border:"1px solid #ef44441a", color:"#444" }}>خروج</button>
        </div>
      </div>

      <div style={{ padding:"16px 15px 60px", maxWidth:720, margin:"0 auto" }}>

        {/* ─ Stats ─ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
          {[
            { l:"القائمة",  v:menu.length,                           c:"#C8A96A", i:"🍕" },
            { l:"ظاهر",     v:menu.filter(p => !p.comingSoon).length, c:"#4CAF50", i:"✅" },
            { l:"قريباً",   v:menu.filter(p =>  p.comingSoon).length, c:"#ef4444", i:"⏳" },
            { l:"المميزة",  v:featured.length,                        c:"#4DA6FF", i:"⭐" },
          ].map(s => (
            <div key={s.l} className="stat">
              <div style={{ fontSize:".95rem", marginBottom:2 }}>{s.i}</div>
              <div style={{ fontSize:"1.4rem", fontWeight:900, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:".58rem", color:"#2e2e2e", marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* ─ Tabs ─ */}
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {[["menu","🍕 القائمة"],["featured","⭐ المميزة"],["history","📋 السجل"],["settings","⚙️ الإعدادات"]].map(([k,l]) => (
            <button key={k} className={`tb${tab===k?" on":""}`} onClick={() => { setTab(k); setSearch(""); }}>{l}</button>
          ))}
          {tab === "menu" && (
            <button className="ib" onClick={addItem} style={{ background:"#0d1a0d", border:"1px solid #4CAF5022", color:"#4CAF50", marginRight:"auto" }}>
              + إضافة
            </button>
          )}
        </div>

        {/* ─ Loading ─ */}
        {loading && (
          <div style={{ textAlign:"center", padding:"36px", color:"#C8A96A44" }}>
            <div style={{ width:32, height:32, border:"3px solid #C8A96A22", borderTopColor:"#C8A96A", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }}/>
            <p style={{ fontSize:".78rem" }}>جاري تحميل البيانات...</p>
          </div>
        )}

        {/* ─ MENU / FEATURED ─ */}
        {!loading && (tab === "menu" || tab === "featured") && (
          <>
            <input className="srch" placeholder="🔍  ابحث..." value={search === "__v" || search === "__h" ? "" : search} onChange={e => setSearch(e.target.value)}/>

            {tab === "menu" && (
              <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                {[
                  ["",    "الكل",   menu.length],
                  ["__v", "ظاهر",   menu.filter(p=>!p.comingSoon).length],
                  ["__h", "قريباً", menu.filter(p=> p.comingSoon).length],
                ].map(([q,l,c]) => (
                  <button key={q} onClick={() => setSearch(q)} style={{ padding:"4px 10px", background:search===q?"#C8A96A1a":"#111", border:`1px solid ${search===q?"#C8A96A33":"#1a1a1a"}`, borderRadius:20, color:search===q?"#C8A96A":"#2e2e2e", cursor:"pointer", fontFamily:"inherit", fontSize:".69rem" }}>
                    {l} ({c})
                  </button>
                ))}
              </div>
            )}

            <p style={{ fontSize:".58rem", color:"#1a1a1a", marginBottom:8 }}>⠿ اسحب لترتيب · ▲▼ تحريك</p>

            {displayItems.length === 0 && (
              <div style={{ textAlign:"center", padding:"28px", color:"#1e1e1e", fontSize:".82rem" }}>لا توجد نتائج</div>
            )}

            {displayItems.map(item => {
              // الصورة من Cloudinary أولاً
              const imgSrc = item.imageUrl || null;
              const hasFlavor = !!item.flavorImageUrl;
              return (
                <div
                  key={item._id || item.id}
                  className="row"
                  draggable
                  onDragStart={() => setDragId(item._id || item.id)}
                  onDragOver={e => onDragOver(e, tab, item._id || item.id)}
                  onDragEnd={onDragEnd}
                  style={{ borderColor: dragId === (item._id || item.id) ? "#C8A96A33" : "" }}
                >
                  <span style={{ color:"#1e1e1e", fontSize:"1rem", cursor:"grab", userSelect:"none", padding:"3px 2px" }}>⠿</span>

                  {imgSrc
                    ? <img src={imgSrc} alt="" className="thumb"/>
                    : <div className="thumbph">🍕</div>
                  }

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3, flexWrap:"wrap" }}>
                      <span style={{ fontWeight:700, color:"#E5D3B3", fontSize:".85rem" }}>{item.label}</span>
                      {tab === "menu" && (
                        item.comingSoon
                          ? <span className="badge br">قريباً</span>
                          : <span className="badge bg">ظاهر</span>
                      )}
                      {tab === "featured" && item.priceOld  && <span className="badge bo">{item.priceOld}</span>}
                      {tab === "featured" && item.sizes?.length > 0 && <span className="badge bb">أحجام</span>}
                      {imgSrc    && <span style={{ fontSize:".5rem", color:"#4DA6FF44" }}>📷</span>}
                      {hasFlavor && <span style={{ fontSize:".5rem", color:"#C8A96A44" }}>🎨</span>}
                    </div>
                    <p style={{ fontSize:".66rem", color:"#222", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.details || item.desc || "—"}
                    </p>
                  </div>

                  <div style={{ display:"flex", gap:4, flexShrink:0, alignItems:"center" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                      <button onClick={() => move(tab, item._id || item.id, -1)} style={{ background:"none", border:"none", color:"#1e1e1e", cursor:"pointer", fontSize:".68rem", lineHeight:1, padding:"2px 4px" }}>▲</button>
                      <button onClick={() => move(tab, item._id || item.id, +1)} style={{ background:"none", border:"none", color:"#1e1e1e", cursor:"pointer", fontSize:".68rem", lineHeight:1, padding:"2px 4px" }}>▼</button>
                    </div>

                    {tab === "menu" && (
                      <button onClick={() => toggleCS(item._id || item.id)} style={{ padding:"5px 8px", background:item.comingSoon?"#1a0d0d":"#0d1a0d", border:`1px solid ${item.comingSoon?"#ef444422":"#4CAF5022"}`, borderRadius:7, color:item.comingSoon?"#ef4444":"#4CAF50", cursor:"pointer", fontSize:".69rem", fontWeight:700, fontFamily:"inherit" }}>
                        {item.comingSoon ? "إظهار" : "إخفاء"}
                      </button>
                    )}

                    <button className="ib" onClick={() => openEdit(tab, item._id || item.id)} style={{ background:"#1a1a1a", border:"1px solid #222", color:"#C8A96A" }}>✏️</button>
                    <button className="ib" onClick={() => dupItem(tab, item._id || item.id)} style={{ background:"#111", border:"1px solid #1a1a1a", color:"#2e2e2e" }} title="نسخ">📋</button>
                    <button className="ib" onClick={() => deleteItem(tab, item._id || item.id)} style={{ background:"#1a0d0d", border:"1px solid #ef444422", color:"#ef4444" }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ─ HISTORY ─ */}
        {tab === "history" && (
          <div style={{ background:"#141414", border:"1px solid #1a1a1a", borderRadius:14, padding:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
              <h2 style={{ fontSize:".87rem", color:"#C8A96A" }}>📋 سجل التعديلات</h2>
              <button onClick={() => { setHistory([]); lsSet("admin_history",[]); }} style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:8, color:"#2e2e2e", cursor:"pointer", padding:"4px 9px", fontSize:".68rem", fontFamily:"inherit" }}>مسح</button>
            </div>
            {history.length === 0
              ? <p style={{ color:"#1e1e1e", fontSize:".79rem", textAlign:"center", padding:"16px 0" }}>لا يوجد سجل بعد</p>
              : history.map((h,i) => (
                  <div key={i} className="hrow"><span>{h.a}</span><span style={{ color:"#1e1e1e", flexShrink:0 }}>{h.t}</span></div>
                ))
            }
          </div>
        )}

        {/* ─ SETTINGS ─ */}
        {tab === "settings" && (
          <div style={{ background:"#141414", border:"1px solid #1a1a1a", borderRadius:14, padding:20 }}>
            <h2 style={{ fontSize:".87rem", color:"#C8A96A", marginBottom:16 }}>⚙️ إعدادات الموقع</h2>
            <span className="sl">اسم المطعم</span>
            <input className="ai" value={siteName} onChange={e => setSiteName(e.target.value)}/>
            <span className="sl">الشعار</span>
            <input className="ai" value={slogan} onChange={e => setSlogan(e.target.value)}/>
            <span className="sl">رقم واتساب (بدون +)</span>
            <input className="ai" value={wapp} onChange={e => setWapp(e.target.value)} dir="ltr"/>
            <button onClick={saveSettings} style={{ marginTop:18, width:"100%", padding:"12px", background:"#C8A96A", border:"none", borderRadius:11, color:"#0f0f0f", cursor:"pointer", fontFamily:"inherit", fontSize:".87rem", fontWeight:700 }}>
              💾 حفظ الإعدادات
            </button>
            <div style={{ marginTop:14, background:"#0f0f0f", border:"1px solid #161616", borderRadius:11, padding:14 }}>
              <p style={{ fontSize:".65rem", color:"#1e1e1e", marginBottom:10 }}>⚠️ منطقة خطر</p>
              <button onClick={() => confirm_("حذف كل البيانات من قاعدة البيانات؟ هذا لا يمكن التراجع عنه!", async () => {
                const all = [...menu, ...featured];
                for (const item of all) {
                  await fetch(`/api/pizzas/${item._id || item.id}`, { method:"DELETE" }).catch(()=>{});
                }
                toast_("↺ تم مسح كل البيانات", "warn");
                log("مسح كل البيانات");
                setTick(t => t+1);
              })} style={{ width:"100%", padding:"10px", background:"#1a0808", border:"1px solid #ef444422", borderRadius:9, color:"#ef4444", cursor:"pointer", fontFamily:"inherit", fontSize:".79rem", fontWeight:700 }}>
                ↺ مسح كل البيانات من قاعدة البيانات
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
