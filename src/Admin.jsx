// src/Admin.jsx — لوحة تحكم بيتزا خانم (النسخة الكاملة)
// ✅ جميع useState قبل useEffect
// ✅ ترتيب البيتزا بالسحب والأسهم
// ✅ إضافات قابلة للتخصيص (عجينة، إضافات، وأي مجموعة أخرى)
// ✅ كل مجموعة لها خيارات قابلة للترتيب والتسعير
// ✅ Cloudinary عبر متغيرات البيئة
// ✅ CRUD كامل مع MongoDB

import { useState, useRef, useEffect, useCallback } from "react";

/* ══ HELPERS ════════════════════════════════════════════════════════════════ */
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const uid   = ()    => Math.random().toString(36).slice(2, 8);
const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

/* ══ CLOUDINARY ════════════════════════════════════════════════════════════ */
async function uploadToCloudinary(file) {
  const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error("أضف VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في .env");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("folder", "pizza-khanum");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:"POST", body:fd });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error?.message || `Cloudinary ${res.status}`); }
  return (await res.json()).secure_url;
}

/* ══ CSS ════════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar { width:3px; height:3px; }
  ::-webkit-scrollbar-thumb { background:#C8A96A22; border-radius:2px; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn   { 0%{opacity:0;transform:scale(.91)} 60%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  .au  { animation:fadeUp .32s ease forwards }
  .apu { animation:popIn  .28s ease forwards }

  /* inputs */
  .ai { display:block; width:100%; padding:9px 12px; background:#141414;
    border:1px solid #252525; border-radius:10px; color:#E5D3B3;
    font-size:.83rem; font-family:inherit; outline:none; transition:border-color .18s,box-shadow .18s; }
  .ai:focus { border-color:#C8A96A; box-shadow:0 0 0 3px #C8A96A0e; }
  .ai.sm { padding:7px 10px; font-size:.78rem; }
  textarea.ai { resize:vertical; min-height:64px; }

  /* tabs */
  .tb { padding:6px 13px; border-radius:20px; border:1px solid #1a1a1a;
    background:#141414; color:#2e2e2e; cursor:pointer; font-family:inherit;
    font-size:.76rem; font-weight:600; transition:all .18s; white-space:nowrap; }
  .tb:hover { color:#C8A96A44; border-color:#C8A96A1a; }
  .tb.on { background:#C8A96A1a; border-color:#C8A96A33; color:#C8A96A; }

  /* icon button */
  .ib { padding:6px 9px; border-radius:8px; cursor:pointer; font-family:inherit;
    font-size:.76rem; border:1px solid #1e1e1e; background:#141414; transition:all .15s; }
  .ib:hover { border-color:#C8A96A22; background:#1a1408; }
  .ib:disabled { opacity:.3; cursor:not-allowed; }

  /* primary button */
  .bp { padding:10px 18px; background:#C8A96A; border:none; border-radius:10px;
    color:#0f0f0f; cursor:pointer; font-family:inherit; font-size:.84rem;
    font-weight:700; transition:background .18s,transform .1s; }
  .bp:hover { background:#b8956a; transform:translateY(-1px); }
  .bp:disabled { opacity:.45; cursor:not-allowed; transform:none; }

  /* danger button */
  .bd { padding:8px 14px; background:#1a0808; border:1px solid #ef444422;
    border-radius:9px; color:#ef4444; cursor:pointer; font-family:inherit;
    font-size:.78rem; transition:all .15s; }
  .bd:hover { background:#2a0808; }

  /* ghost button */
  .bg_ { padding:8px 14px; background:transparent; border:1px solid #252525;
    border-radius:9px; color:#555; cursor:pointer; font-family:inherit; font-size:.8rem; }
  .bg_:hover { background:#1a1a1a; }

  /* stat card */
  .stat { background:#141414; border:1px solid #1a1a1a; border-radius:12px; padding:10px 7px; text-align:center; }

  /* list row */
  .row { background:#131313; border:1px solid #1a1a1a; border-radius:12px;
    padding:10px 11px; display:flex; align-items:center; gap:9px;
    margin-bottom:7px; transition:border-color .18s; }
  .row:hover { border-color:#C8A96A1a; }
  .row.dragging { border-color:#C8A96A44; opacity:.7; }

  /* section label */
  .sl { display:block; font-size:.6rem; color:#C8A96A55; letter-spacing:2px;
    margin-top:14px; margin-bottom:5px; text-transform:uppercase; }

  /* badge */
  .badge { font-size:.5rem; padding:2px 6px; border-radius:8px; font-weight:700; }
  .bg { background:#0d1a0d; color:#4CAF50; border:1px solid #4CAF5022; }
  .br { background:#1a0d0d; color:#ef4444; border:1px solid #ef444422; }
  .bo { background:#1a1408; color:#C8A96A; border:1px solid #C8A96A22; }

  /* pill toggle */
  .pill { flex:1; padding:7px; border-radius:9px; cursor:pointer; font-family:inherit;
    font-size:.74rem; font-weight:600; border:1px solid #1e1e1e; background:#141414; color:#444; transition:all .18s; }
  .pill.on  { background:#0d1a0d; border-color:#4CAF5033; color:#4CAF50; }
  .pill.off { background:#1a0d0d; border-color:#ef444433; color:#ef4444; }
  .pill.bl  { background:#06111f; border-color:#4DA6FF33; color:#4DA6FF; }

  /* image zone */
  .imgzone { width:100%; aspect-ratio:16/9; border-radius:11px; border:1.5px dashed #252525;
    background:#111; display:flex; flex-direction:column; align-items:center;
    justify-content:center; cursor:pointer; overflow:hidden; position:relative; transition:border-color .18s; }
  .imgzone:hover { border-color:#C8A96A44; }
  .imgzone img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .ov { position:absolute; inset:0; background:rgba(0,0,0,.5); display:flex;
    flex-direction:column; align-items:center; justify-content:center;
    gap:4px; opacity:0; transition:opacity .18s; }
  .imgzone:hover .ov { opacity:1; }
  .upl-ov { position:absolute; inset:0; background:rgba(0,0,0,.65); display:flex;
    flex-direction:column; align-items:center; justify-content:center; gap:6px; border-radius:11px; }
  .spinner { width:20px; height:20px; border:2px solid #C8A96A33; border-top-color:#C8A96A; border-radius:50%; animation:spin .6s linear infinite; }

  /* thumbnail */
  .thumb { width:42px; height:42px; border-radius:8px; object-fit:cover; flex-shrink:0; }
  .thumbph { width:42px; height:42px; border-radius:8px; background:#1a1008;
    display:flex; align-items:center; justify-content:center; font-size:1.1rem;
    flex-shrink:0; border:1px solid #1e1e1e; }

  /* modal */
  .mbg { position:fixed; inset:0; background:rgba(0,0,0,.78); display:flex;
    align-items:flex-end; justify-content:center; z-index:1000; backdrop-filter:blur(5px); }
  .mbox { background:#161616; border:1px solid #222; border-radius:22px 22px 0 0;
    width:min(560px,100vw); max-height:94vh; overflow-y:auto; padding:22px 18px 40px; }
  .mbox-center { background:#161616; border:1px solid #222; border-radius:18px;
    width:min(380px,94vw); padding:24px 20px; }

  /* extras group card */
  .eg { background:#111; border:1px solid #1a1a1a; border-radius:12px; padding:13px; margin-top:8px; }
  .eg-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .eo { display:flex; align-items:center; gap:7px; background:#161616;
    border:1px solid #1e1e1e; border-radius:9px; padding:7px 9px; margin-bottom:6px; }

  /* sort handle */
  .handle { color:#2a2a2a; cursor:grab; user-select:none; font-size:.9rem; padding:2px 4px; flex-shrink:0; }
  .handle:active { cursor:grabbing; }

  /* search */
  .srch { display:block; width:100%; padding:9px 13px; margin-bottom:9px;
    background:#141414; border:1px solid #1a1a1a; border-radius:10px;
    color:#E5D3B3; font-size:.83rem; font-family:inherit; outline:none; transition:border-color .18s; }
  .srch:focus { border-color:#C8A96A33; }

  /* history row */
  .hrow { display:flex; justify-content:space-between; padding:6px 0;
    border-bottom:1px solid #161616; font-size:.7rem; color:#8B6B4A; }
`;

/* ══ ADMIN COMPONENT ════════════════════════════════════════════════════════ */
export default function Admin() {

  /* ─── AUTH ─────────────────────────────────────────────────────────────── */
  const [authed,  setAuthed]  = useState(() => lsGet("admin_authed", false));
  const [pass,    setPass]    = useState("");
  const [authErr, setAuthErr] = useState("");

  /* ─── DATA ─────────────────────────────────────────────────────────────── */
  const [menu,     setMenu]     = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tick,     setTick]     = useState(0); // ← يجب قبل useEffect

  /* ─── UI ────────────────────────────────────────────────────────────────── */
  const [tab,    setTab]    = useState("menu");
  const [search, setSearch] = useState("");

  /* ─── MODAL ─────────────────────────────────────────────────────────────── */
  const [editing,    setEditing]    = useState(null);  // { id, type, isNew }
  const [form,       setForm]       = useState({});
  const [imgP,       setImgP]       = useState(null);
  const [imgF,       setImgF]       = useState(null);
  const [uploadingP, setUploadingP] = useState(false);
  const [uploadingF, setUploadingF] = useState(false);
  const [saving,     setSaving]     = useState(false);

  /* ─── CONFIRM ────────────────────────────────────────────────────────────── */
  const [confirmDlg, setConfirmDlg] = useState(null);

  /* ─── TOAST ──────────────────────────────────────────────────────────────── */
  const [toast, setToast] = useState(null);

  /* ─── HISTORY + DRAG ─────────────────────────────────────────────────────── */
  const [history, setHistory] = useState(() => lsGet("admin_history", []));
  const [dragId,  setDragId]  = useState(null);

  /* ─── SETTINGS ───────────────────────────────────────────────────────────── */
  const [siteName, setSiteName] = useState(() => lsGet("site_name",    "بيتزا خانم"));
  const [slogan,   setSlogan]   = useState(() => lsGet("site_slogan",  "كُل لتعيش · وعِش لأجل البيتزا"));
  const [wapp,     setWapp]     = useState(() => lsGet("site_whatsapp","963998950904"));

  const pRef   = useRef();
  const fRef   = useRef();
  const impRef = useRef();

  /* ══ useEffect — بعد جميع useState ════════════════════════════════════════ */
  const fetchData = useCallback(async () => {
    if (!authed) { setLoading(false); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/pizzas");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const { data } = await res.json();
      setMenu(    (data||[]).filter(i => i.type==="menu"     || i.category==="menu"));
      setFeatured((data||[]).filter(i => i.type==="featured" || i.category==="featured"));
    } catch (e) {
      toast_("❌ فشل جلب البيانات: " + e.message, "err");
    } finally { setLoading(false); }
  }, [authed]); // eslint-disable-line

  useEffect(() => { fetchData(); }, [fetchData, tick]);

  /* ══ HELPERS ════════════════════════════════════════════════════════════════ */
  function toast_(m, t="ok") { setToast({m,t}); setTimeout(()=>setToast(null), 3200); }
  function log(a)   { const e={a,t:new Date().toLocaleTimeString("ar-EG")}; setHistory(p=>{ const n=[e,...p].slice(0,60); lsSet("admin_history",n); return n; }); }
  function confirm_(msg, onOk) { setConfirmDlg({msg,onOk}); }

  /* ══ AUTH ═══════════════════════════════════════════════════════════════════ */
  function login(e) {
    e.preventDefault();
    if (pass === ADMIN_PWD) { setAuthed(true); lsSet("admin_authed",true); setAuthErr(""); }
    else setAuthErr("كلمة المرور غير صحيحة");
  }

  /* ══ FORM EXTRAS HELPERS ════════════════════════════════════════════════════ */

  // إضافة مجموعة جديدة (عجينة / إضافات / ...)
  function addExtraGroup() {
    const group = { id:uid(), name:"مجموعة جديدة", type:"single", required:false, sortOrder: (form.extras||[]).length, options:[] };
    setForm(p => ({ ...p, extras: [...(p.extras||[]), group] }));
  }

  // حذف مجموعة
  function removeExtraGroup(gid) {
    setForm(p => ({ ...p, extras: (p.extras||[]).filter(g => g.id!==gid) }));
  }

  // تعديل حقل في مجموعة
  function updateGroup(gid, key, val) {
    setForm(p => ({ ...p, extras: (p.extras||[]).map(g => g.id===gid ? {...g,[key]:val} : g) }));
  }

  // إضافة خيار داخل مجموعة
  function addOption(gid) {
    const opt = { id:uid(), label:"خيار جديد", priceOld:"0", priceNew:"0", numericPrice:0, sortOrder:0 };
    setForm(p => ({ ...p, extras: (p.extras||[]).map(g =>
      g.id===gid ? {...g, options:[...(g.options||[]), opt]} : g
    )}));
  }

  // حذف خيار
  function removeOption(gid, oid) {
    setForm(p => ({ ...p, extras: (p.extras||[]).map(g =>
      g.id===gid ? {...g, options:(g.options||[]).filter(o=>o.id!==oid)} : g
    )}));
  }

  // تعديل حقل في خيار
  function updateOption(gid, oid, key, val) {
    setForm(p => ({ ...p, extras: (p.extras||[]).map(g =>
      g.id===gid ? {...g, options:(g.options||[]).map(o => {
        if (o.id!==oid) return o;
        const updated = {...o,[key]:val};
        // عند تغيير priceOld حدّث numericPrice تلقائياً
        if (key==="priceOld") updated.numericPrice = Number(String(val).replace(/,/g,""))||0;
        return updated;
      })} : g
    )}));
  }

  // تحريك خيار أو مجموعة للأعلى / الأسفل
  function moveGroup(gid, dir) {
    setForm(p => {
      const arr = [...(p.extras||[])];
      const idx = arr.findIndex(g=>g.id===gid);
      const to  = idx + dir;
      if (to<0||to>=arr.length) return p;
      [arr[idx],arr[to]] = [arr[to],arr[idx]];
      return {...p, extras:arr};
    });
  }

  function moveOption(gid, oid, dir) {
    setForm(p => ({ ...p, extras:(p.extras||[]).map(g => {
      if (g.id!==gid) return g;
      const arr=[...g.options]; const idx=arr.findIndex(o=>o.id===oid); const to=idx+dir;
      if(to<0||to>=arr.length) return g;
      [arr[idx],arr[to]]=[arr[to],arr[idx]];
      return {...g,options:arr};
    })}));
  }

  /* ══ SIZES HELPERS ══════════════════════════════════════════════════════════ */
  function addSize() {
    const s = { id:uid(), label:"حجم جديد", priceOld:"0", priceNew:"0", numericPrice:0, sortOrder:(form._sizes||[]).length };
    setForm(p=>({...p, _sizes:[...(p._sizes||[]),s]}));
  }
  function removeSize(sid) { setForm(p=>({...p,_sizes:(p._sizes||[]).filter(s=>s.id!==sid)})); }
  function updateSize(sid,key,val) {
    setForm(p=>({...p,_sizes:(p._sizes||[]).map(s=>{
      if(s.id!==sid) return s;
      const u={...s,[key]:val};
      if(key==="priceOld") u.numericPrice=Number(String(val).replace(/,/g,""))||0;
      return u;
    })}));
  }
  function moveSize(sid,dir) {
    setForm(p=>{
      const arr=[...(p._sizes||[])]; const idx=arr.findIndex(s=>s.id===sid); const to=idx+dir;
      if(to<0||to>=arr.length) return p;
      [arr[idx],arr[to]]=[arr[to],arr[idx]];
      return {...p,_sizes:arr};
    });
  }

  /* ══ CRUD ════════════════════════════════════════════════════════════════════ */
  function openEdit(type, id) {
    const list = type==="menu" ? menu : featured;
    const item = list.find(x => x.id===id || x._id===id);
    if (!item) return;
    setForm({ ...item, _sizes: (item.sizes||[]).map(s=>({...s})), extras: (item.extras||[]).map(g=>({...g,options:(g.options||[]).map(o=>({...o}))})) });
    setImgP(item.imageUrl       || null);
    setImgF(item.flavorImageUrl || null);
    setEditing({ type, id: item._id||item.id, isNew:false });
  }

  function addItem() {
    setForm({ label:"", details:"", comingSoon:false, _sizes:[], extras:[] });
    setImgP(null); setImgF(null);
    setEditing({ type:"menu", id:null, isNew:true });
  }

  async function saveEdit() {
    if (!form.label?.trim()) { toast_("⚠ اسم الصنف مطلوب","err"); return; }
    setSaving(true);
    try {
      const payload = {
        label:          form.label,
        type:           editing.type,
        details:        form.details      || "",
        desc:           form.desc         || "",
        comingSoon:     form.comingSoon    ?? false,
        imageUrl:       imgP              || "",
        flavorImageUrl: imgF              || "",
        priceOld:       form.priceOld     || "",
        priceNew:       form.priceNew     || "",
        numericPrice:   form.numericPrice || 0,
        sizes:          (form._sizes||[]).map((s,i)=>({...s,sortOrder:i})),
        extras:         (form.extras||[]).map((g,i)=>({...g,sortOrder:i,options:(g.options||[]).map((o,j)=>({...o,sortOrder:j}))})),
        sliceCount:     form.sliceCount   || 0,
        cols:           form.cols         || 0,
        sortOrder:      form.sortOrder    || 0,
      };
      const url    = editing.isNew ? "/api/pizzas"            : `/api/pizzas/${editing.id}`;
      const method = editing.isNew ? "POST"                   : "PUT";
      const res    = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      if (!res.ok) { const e=await res.json().catch(()=>({})); throw new Error(e.error||`HTTP ${res.status}`); }
      toast_(editing.isNew ? "✅ تم إضافة الصنف" : "✅ تم التعديل");
      log(editing.isNew ? `إضافة: ${form.label}` : `تعديل: ${form.label}`);
      setEditing(null);
      setTick(t=>t+1);
    } catch (e) { toast_("❌ "+e.message,"err"); }
    finally { setSaving(false); }
  }

  function deleteItem(type, id) {
    const list = type==="menu" ? menu : featured;
    const item = list.find(x=>x.id===id||x._id===id);
    confirm_(`حذف "${item?.label}"؟ لا يمكن التراجع.`, async()=>{
      try {
        const res = await fetch(`/api/pizzas/${item?._id||id}`,{method:"DELETE"});
        if(!res.ok) throw new Error("HTTP "+res.status);
        toast_("🗑 تم الحذف"); log(`حذف: ${item?.label}`); setTick(t=>t+1);
      } catch(e) { toast_("❌ "+e.message,"err"); }
    });
  }

  async function toggleCS(id) {
    const item = menu.find(x=>x.id===id||x._id===id);
    if(!item) return;
    try {
      await fetch(`/api/pizzas/${item._id||id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({comingSoon:!item.comingSoon})});
      log(`${item.comingSoon?"إظهار":"إخفاء"}: ${item.label}`);
      setTick(t=>t+1);
    } catch(e) { toast_("❌ "+e.message,"err"); }
  }

  async function dupItem(type, id) {
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id||x._id===id);
    if(!item) return;
    try {
      const res=await fetch("/api/pizzas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...item,label:item.label+" — نسخة",_id:undefined,id:undefined})});
      if(!res.ok) throw new Error("HTTP "+res.status);
      toast_("📋 تم النسخ"); log(`نسخ: ${item.label}`); setTick(t=>t+1);
    } catch(e) { toast_("❌ "+e.message,"err"); }
  }

  /* ── ترتيب البيتزا (سحب في الواجهة + حفظ في DB) ───────────────────── */
  function onDragOver(e, type, overId) {
    e.preventDefault();
    if(!dragId||dragId===overId) return;
    const setFn = type==="menu" ? setMenu : setFeatured;
    setFn(prev=>{
      const arr=[...prev];
      const fi=arr.findIndex(x=>(x.id||x._id)===dragId);
      const ti=arr.findIndex(x=>(x.id||x._id)===overId);
      if(fi<0||ti<0) return prev;
      const n=[...arr]; const [m]=n.splice(fi,1); n.splice(ti,0,m); return n;
    });
  }

  async function onDragEnd(type) {
    setDragId(null);
    const list = type==="menu" ? menu : featured;
    try {
      await Promise.all(list.map((item,idx)=>
        fetch(`/api/pizzas/${item._id||item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sortOrder:idx})})
      ));
      log("ترتيب القائمة");
    } catch(e) { console.error("[sort]",e); }
  }

  async function moveItem(type, id, dir) {
    const setFn = type==="menu" ? setMenu : setFeatured;
    let newList;
    setFn(prev=>{
      const arr=[...prev]; const idx=arr.findIndex(x=>(x.id||x._id)===id); const to=idx+dir;
      if(to<0||to>=arr.length) return prev;
      const n=[...arr]; [n[idx],n[to]]=[n[to],n[idx]]; newList=n; return n;
    });
    setTimeout(async()=>{
      if(!newList) return;
      await Promise.all(newList.map((item,idx)=>
        fetch(`/api/pizzas/${item._id||item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sortOrder:idx})})
      ));
    }, 100);
  }

  /* ── رفع صورة ──────────────────────────────────────────────────────── */
  async function handleImg(file, which) {
    if(!file) return;
    if(!file.type.startsWith("image/")) { toast_("⚠ اختر ملف صورة","err"); return; }
    if(file.size > 5*1024*1024)         { toast_("⚠ الصورة أكبر من 5 MB","err"); return; }
    const setUpl = which==="p" ? setUploadingP : setUploadingF;
    const setImg = which==="p" ? setImgP       : setImgF;
    setUpl(true); toast_("⏳ جاري رفع الصورة...");
    try { const url=await uploadToCloudinary(file); setImg(url); toast_("✅ تم رفع الصورة"); }
    catch(e) { toast_("❌ "+e.message,"err"); }
    finally  { setUpl(false); }
  }

  /* ── تصدير / استيراد ────────────────────────────────────────────────── */
  function exportData() {
    const d=JSON.stringify({menu,featured,exportedAt:new Date().toISOString()},null,2);
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([d],{type:"application/json"})),download:"pizzakhanum-backup.json"});
    a.click(); toast_("📦 تم التصدير");
  }

  function importData(e) {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=async ev=>{
      try {
        const parsed=JSON.parse(ev.target.result);
        const items=[...(parsed.menu||[]),...(parsed.featured||[])];
        let c=0;
        for(const item of items){
          const res=await fetch("/api/pizzas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});
          if(res.ok) c++;
        }
        toast_(`📥 تم استيراد ${c} صنف`); log("استيراد"); setTick(t=>t+1);
      } catch { toast_("⚠ ملف غير صالح","err"); }
    };
    r.readAsText(file); e.target.value="";
  }

  function saveSettings() {
    lsSet("site_name",siteName); lsSet("site_slogan",slogan); lsSet("site_whatsapp",wapp);
    log("تعديل الإعدادات"); toast_("⚙️ تم حفظ الإعدادات");
  }

  /* ── فلترة ──────────────────────────────────────────────────────────── */
  const src = tab==="menu" ? menu : featured;
  const displayItems = src.filter(it=>
    !search || (it.label||"").includes(search) || (it.details||it.desc||"").includes(search)
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ LOGIN ══
  ════════════════════════════════════════════════════════════════════════ */
  if (!authed) return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      <div className="au" style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:20,padding:"34px 28px",width:"min(340px,95vw)",textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:10}}>🍕</div>
        <h1 style={{color:"#C8A96A",fontSize:"1.1rem",marginBottom:4}}>بيتزا خانم</h1>
        <p style={{fontSize:".68rem",color:"#333",marginBottom:22}}>لوحة التحكم</p>
        {authErr && <div style={{background:"#1a0808",border:"1px solid #ef444422",borderRadius:9,padding:"8px 12px",marginBottom:14,fontSize:".78rem",color:"#ef4444"}}>⚠ {authErr}</div>}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} className="ai" required style={{marginBottom:12}}/>
          <button type="submit" className="bp" style={{width:"100%",padding:"11px"}}>دخول →</button>
        </form>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ CONFIRM DIALOG ══
  ════════════════════════════════════════════════════════════════════════ */
  const ConfirmDlg = confirmDlg && (
    <div className="mbg" style={{zIndex:1100,alignItems:"center"}} onClick={e=>{if(e.target===e.currentTarget)setConfirmDlg(null);}}>
      <div className="mbox-center apu">
        <p style={{fontSize:"1.6rem",marginBottom:10}}>🗑</p>
        <p style={{color:"#E5D3B3",fontSize:".86rem",marginBottom:20,lineHeight:1.6}}>{confirmDlg.msg}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="bd" style={{padding:"10px 20px",fontWeight:700}} onClick={()=>{confirmDlg.onOk();setConfirmDlg(null);}}>تأكيد الحذف</button>
          <button className="bg_" onClick={()=>setConfirmDlg(null)}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ EDIT MODAL ══
  ════════════════════════════════════════════════════════════════════════ */
  const EditModal = editing && (
    <div className="mbg" onClick={e=>{if(e.target===e.currentTarget&&!saving)setEditing(null);}}>
      <div className="mbox au">

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{color:"#C8A96A",fontSize:".93rem"}}>{editing.isNew?"✨ إضافة صنف جديد":`✏️ ${form.label||"تعديل"}`}</h2>
          <button onClick={()=>{if(!saving)setEditing(null);}} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"1.3rem",lineHeight:1}}>×</button>
        </div>

        {/* ─── الصور ─── */}
        <span className="sl">الصور</span>
        <div style={{display:"grid",gridTemplateColumns:editing.type==="menu"?"1fr 1fr":"1fr",gap:10,marginTop:6}}>
          {[
            {which:"p",ref:pRef,img:imgP,setImg:setImgP,upl:uploadingP,label:"📷 صورة الكارد"},
            ...(editing.type==="menu"?[{which:"f",ref:fRef,img:imgF,setImg:setImgF,upl:uploadingF,label:"🎨 صورة النكهة"}]:[]),
          ].map(({which,ref,img,setImg,upl,label})=>(
            <div key={which}>
              <p style={{fontSize:".62rem",color:"#555",marginBottom:3}}>{label}</p>
              <div className="imgzone" onClick={()=>!upl&&ref.current.click()}>
                {img && <img src={img} alt=""/>}
                <div className="ov"><span style={{fontSize:"1.2rem"}}>📷</span><span style={{fontSize:".62rem",color:"#ccc",marginTop:3}}>تغيير</span></div>
                {!img && <><span style={{fontSize:"1.5rem",opacity:.2}}>🖼</span><span style={{fontSize:".65rem",color:"#2a2a2a",marginTop:4}}>اضغط للرفع</span></>}
                {upl && <div className="upl-ov"><div className="spinner"/><span style={{fontSize:".66rem",color:"#C8A96A"}}>جاري الرفع...</span></div>}
              </div>
              <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImg(e.target.files[0],which)}/>
              {img && <button style={{fontSize:".6rem",color:"#6a2a2a",background:"none",border:"none",cursor:"pointer",marginTop:3,fontFamily:"inherit"}} onClick={()=>setImg(null)}>× حذف الصورة</button>}
            </div>
          ))}
        </div>

        {/* ─── الاسم ─── */}
        <span className="sl">اسم الصنف *</span>
        <input className="ai" value={form.label||""} onChange={e=>setForm(p=>({...p,label:e.target.value}))} placeholder="مثال: مارغريتا"/>

        {/* ─── القائمة العادية ─── */}
        {editing.type==="menu" && (<>
          <span className="sl">المكونات والوصف</span>
          <textarea className="ai" rows={3} value={form.details||""} onChange={e=>setForm(p=>({...p,details:e.target.value}))} placeholder="جبنة القشقوان مع الصلصة الحمراء..."/>

          <span className="sl">الحالة</span>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button className={`pill${!form.comingSoon?" on":""}`} onClick={()=>setForm(p=>({...p,comingSoon:false}))}>✅ ظاهر</button>
            <button className={`pill${form.comingSoon?" off":""}`} onClick={()=>setForm(p=>({...p,comingSoon:true}))}>⏳ قريباً</button>
          </div>

          {/* ══ الأحجام ══ */}
          <div style={{marginTop:16,background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:13}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:".72rem",fontWeight:700,color:"#C8A96A"}}>📏 الأحجام والأسعار</span>
              <button className="ib" style={{color:"#4CAF50",borderColor:"#4CAF5022",background:"#0d1a0d",fontSize:".72rem"}} onClick={addSize}>+ إضافة حجم</button>
            </div>
            {!(form._sizes||[]).length && <p style={{fontSize:".68rem",color:"#252525",textAlign:"center",padding:"8px 0"}}>لا يوجد أحجام — اضغط لإضافة</p>}
            {(form._sizes||[]).map((sz,si)=>(
              <div key={sz.id} style={{background:"#141414",border:"1px solid #1e1e1e",borderRadius:10,padding:"9px 10px",marginBottom:7}}>
                <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center"}}>
                  <span className="handle">⠿</span>
                  <input className="ai sm" style={{flex:1}} value={sz.label} onChange={e=>updateSize(sz.id,"label",e.target.value)} placeholder="اسم الحجم (صغير/وسط/كبير)"/>
                  <div style={{display:"flex",gap:3}}>
                    <button className="ib" style={{padding:"4px 7px",fontSize:".65rem"}} onClick={()=>moveSize(sz.id,-1)} disabled={si===0}>▲</button>
                    <button className="ib" style={{padding:"4px 7px",fontSize:".65rem"}} onClick={()=>moveSize(sz.id,+1)} disabled={si===(form._sizes||[]).length-1}>▼</button>
                    <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"4px 7px"}} onClick={()=>removeSize(sz.id)}>🗑</button>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <p style={{fontSize:".58rem",color:"#333",marginBottom:3}}>السعر (ل.س القديمة)</p>
                    <input className="ai sm" value={sz.priceOld} onChange={e=>updateSize(sz.id,"priceOld",e.target.value)} placeholder="35,000"/>
                  </div>
                  <div>
                    <p style={{fontSize:".58rem",color:"#333",marginBottom:3}}>السعر (ل.ج الجديدة)</p>
                    <input className="ai sm" value={sz.priceNew} onChange={e=>updateSize(sz.id,"priceNew",e.target.value)} placeholder="350"/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ══ الإضافات ══ */}
          <div style={{marginTop:12,background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:13}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:".72rem",fontWeight:700,color:"#C8A96A"}}>🧩 مجموعات الإضافات</span>
              <button className="ib" style={{color:"#4DA6FF",borderColor:"#4DA6FF22",background:"#06111f",fontSize:".72rem"}} onClick={addExtraGroup}>+ إضافة مجموعة</button>
            </div>
            <p style={{fontSize:".61rem",color:"#252525",marginBottom:8}}>مثال: العجينة (اختيار واحد) · الإضافات (متعدد)</p>

            {!(form.extras||[]).length && <p style={{fontSize:".68rem",color:"#1e1e1e",textAlign:"center",padding:"8px 0"}}>لا توجد مجموعات — اضغط لإضافة</p>}

            {(form.extras||[]).map((g,gi)=>(
              <div key={g.id} className="eg">
                {/* رأس المجموعة */}
                <div className="eg-header">
                  <span className="handle">⠿</span>
                  <input className="ai sm" style={{flex:1}} value={g.name} onChange={e=>updateGroup(g.id,"name",e.target.value)} placeholder="اسم المجموعة (العجينة / الإضافات...)"/>
                  <select className="ai sm" style={{width:110}} value={g.type} onChange={e=>updateGroup(g.id,"type",e.target.value)}>
                    <option value="single">اختيار واحد</option>
                    <option value="multi">متعدد</option>
                  </select>
                  <div style={{display:"flex",gap:3}}>
                    <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveGroup(g.id,-1)} disabled={gi===0}>▲</button>
                    <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveGroup(g.id,+1)} disabled={gi===(form.extras||[]).length-1}>▼</button>
                    <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"3px 6px"}} onClick={()=>removeExtraGroup(g.id)}>🗑</button>
                  </div>
                </div>

                {/* إلزامي أم لا */}
                <label style={{display:"flex",alignItems:"center",gap:7,fontSize:".68rem",color:"#555",cursor:"pointer",marginBottom:8}}>
                  <input type="checkbox" checked={g.required||false} onChange={e=>updateGroup(g.id,"required",e.target.checked)} style={{accentColor:"#C8A96A"}}/>
                  إلزامي (يجب اختيار خيار)
                </label>

                {/* الخيارات */}
                {(g.options||[]).map((opt,oi)=>(
                  <div key={opt.id} className="eo">
                    <span className="handle" style={{fontSize:".7rem"}}>⠿</span>
                    <input className="ai sm" style={{flex:1,minWidth:0}} value={opt.label} onChange={e=>updateOption(g.id,opt.id,"label",e.target.value)} placeholder="اسم الخيار"/>
                    <input className="ai sm" style={{width:80}} value={opt.priceOld} onChange={e=>updateOption(g.id,opt.id,"priceOld",e.target.value)} placeholder="السعر ل.س"/>
                    <input className="ai sm" style={{width:70}} value={opt.priceNew} onChange={e=>updateOption(g.id,opt.id,"priceNew",e.target.value)} placeholder="ل.ج"/>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      <button className="ib" style={{padding:"2px 5px",fontSize:".55rem"}} onClick={()=>moveOption(g.id,opt.id,-1)} disabled={oi===0}>▲</button>
                      <button className="ib" style={{padding:"2px 5px",fontSize:".55rem"}} onClick={()=>moveOption(g.id,opt.id,+1)} disabled={oi===(g.options||[]).length-1}>▼</button>
                    </div>
                    <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"3px 6px",fontSize:".7rem"}} onClick={()=>removeOption(g.id,opt.id)}>🗑</button>
                  </div>
                ))}

                <button onClick={()=>addOption(g.id)} style={{width:"100%",marginTop:6,padding:"6px",background:"#111",border:"1px dashed #1e1e1e",borderRadius:8,color:"#2a2a2a",cursor:"pointer",fontFamily:"inherit",fontSize:".68rem",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.target.style.borderColor="#C8A96A22"} onMouseLeave={e=>e.target.style.borderColor="#1e1e1e"}>
                  + إضافة خيار
                </button>
              </div>
            ))}
          </div>
        </>)}

        {/* ─── المميزة ─── */}
        {editing.type==="featured" && (<>
          <span className="sl">الوصف القصير</span>
          <textarea className="ai" rows={3} value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/>
          <span className="sl">الأسعار الثابتة</span>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
            {[["priceOld","السعر (ل.س)","150,000"],["priceNew","السعر (ل.ج)","1,500"]].map(([k,l,ph])=>(
              <div key={k}><p style={{fontSize:".6rem",color:"#333",marginBottom:3}}>{l}</p>
                <input className="ai sm" value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}/>
              </div>
            ))}
          </div>
        </>)}

        {/* ─── معاينة ─── */}
        <div style={{background:"#0f0f0f",border:"1px solid #161616",borderRadius:11,padding:12,marginTop:14,overflow:"hidden"}}>
          <p style={{fontSize:".55rem",color:"#1a1a1a",marginBottom:7,letterSpacing:"2px"}}>معاينة مباشرة</p>
          {imgP && <img src={imgP} alt="" style={{width:"100%",height:88,objectFit:"cover",borderRadius:8,marginBottom:8}}/>}
          <p style={{fontWeight:700,color:"#E5D3B3",fontSize:".85rem",marginBottom:3}}>{form.label||"—"}</p>
          <p style={{fontSize:".67rem",color:"#444",lineHeight:1.5}}>{form.details||form.desc||"—"}</p>
          {(form._sizes||[]).length>0 && (
            <div style={{marginTop:7,display:"flex",gap:5,flexWrap:"wrap"}}>
              {(form._sizes||[]).map(s=><span key={s.id} style={{fontSize:".55rem",background:"#C8A96A1a",color:"#C8A96A",border:"1px solid #C8A96A22",borderRadius:6,padding:"2px 7px"}}>{s.label} — {s.priceOld} ل.س</span>)}
            </div>
          )}
          {(form.extras||[]).length>0 && (
            <div style={{marginTop:7}}>
              {(form.extras||[]).map(g=>(
                <div key={g.id} style={{marginTop:4}}>
                  <p style={{fontSize:".58rem",color:"#C8A96A55",letterSpacing:"1px"}}>{g.name} ({g.type==="single"?"واحد":"متعدد"}) {g.required?"• إلزامي":""}</p>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:3}}>
                    {(g.options||[]).map(o=><span key={o.id} style={{fontSize:".52rem",background:"#1a1a1a",color:"#555",border:"1px solid #222",borderRadius:5,padding:"1px 6px"}}>{o.label}{+o.priceOld>0?` +${o.priceOld}`:""}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── أزرار الحفظ ─── */}
        <div style={{display:"flex",gap:9,marginTop:14}}>
          <button className="bp" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7}} onClick={saveEdit} disabled={saving||uploadingP||uploadingF}>
            {saving ? <><div className="spinner" style={{width:13,height:13,borderWidth:2}}/> جاري الحفظ...</> : "💾 حفظ"}
          </button>
          <button className="bg_" onClick={()=>{if(!saving)setEditing(null);}}>إلغاء</button>
        </div>

      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     ══ DASHBOARD ══
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#E5D3B3",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      {ConfirmDlg}
      {EditModal}

      {/* Toast */}
      {toast && (
        <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",
          background:toast.t==="err"?"#1a0808":toast.t==="warn"?"#1a1408":"#0d1a0d",
          border:`1px solid ${toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50"}`,
          borderRadius:11,padding:"9px 18px",zIndex:2000,
          color:toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50",
          fontSize:".79rem",fontWeight:600,whiteSpace:"nowrap",
          boxShadow:"0 8px 28px #00000099",animation:"toastIn .22s ease forwards"}}>
          {toast.m}
        </div>
      )}

      {/* Header */}
      <div style={{background:"#111",borderBottom:"1px solid #161616",padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1.3rem"}}>🍕</span>
          <div><h1 style={{fontSize:".88rem",fontWeight:900,color:"#C8A96A"}}>بيتزا خانم</h1><p style={{fontSize:".55rem",color:"#252525"}}>لوحة التحكم</p></div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <button className="ib" onClick={exportData} title="تصدير">📦</button>
          <label className="ib" style={{cursor:"pointer"}} title="استيراد">📥<input ref={impRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/></label>
          <button className="ib" onClick={()=>setTick(t=>t+1)} style={{color:"#C8A96A"}} title="تحديث">🔄</button>
          <button className="ib" onClick={()=>{setAuthed(false);lsSet("admin_authed",false);}} style={{background:"#1a1010",border:"1px solid #ef44441a",color:"#444"}}>خروج</button>
        </div>
      </div>

      <div style={{padding:"14px 14px 70px",maxWidth:720,margin:"0 auto"}}>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:14}}>
          {[
            {l:"القائمة",v:menu.length,c:"#C8A96A",i:"🍕"},
            {l:"ظاهر",   v:menu.filter(p=>!p.comingSoon).length,c:"#4CAF50",i:"✅"},
            {l:"قريباً", v:menu.filter(p=> p.comingSoon).length,c:"#ef4444",i:"⏳"},
            {l:"المميزة",v:featured.length,c:"#4DA6FF",i:"⭐"},
          ].map(s=>(
            <div key={s.l} className="stat">
              <div style={{fontSize:".9rem",marginBottom:2}}>{s.i}</div>
              <div style={{fontSize:"1.3rem",fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontSize:".56rem",color:"#2e2e2e",marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:5,marginBottom:11,flexWrap:"wrap",alignItems:"center"}}>
          {[["menu","🍕 القائمة"],["featured","⭐ المميزة"],["history","📋 السجل"],["settings","⚙️ الإعدادات"]].map(([k,l])=>(
            <button key={k} className={`tb${tab===k?" on":""}`} onClick={()=>{setTab(k);setSearch("");}}>{l}</button>
          ))}
          {tab==="menu" && (
            <button className="ib" onClick={addItem} style={{background:"#0d1a0d",border:"1px solid #4CAF5022",color:"#4CAF50",marginRight:"auto",fontSize:".76rem"}}>+ إضافة صنف</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{textAlign:"center",padding:"32px",color:"#C8A96A44"}}>
            <div style={{width:28,height:28,border:"3px solid #C8A96A22",borderTopColor:"#C8A96A",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{fontSize:".75rem"}}>جاري التحميل...</p>
          </div>
        )}

        {/* ─── قائمة / مميزة ─── */}
        {!loading && (tab==="menu"||tab==="featured") && (<>
          <input className="srch" placeholder="🔍  ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/>

          {tab==="menu" && (
            <div style={{display:"flex",gap:5,marginBottom:9,flexWrap:"wrap"}}>
              {[["","الكل",menu.length],["v","ظاهر",menu.filter(p=>!p.comingSoon).length],["h","قريباً",menu.filter(p=>p.comingSoon).length]].map(([q,l,c])=>(
                <button key={q} onClick={()=>setSearch(s=>s===q?"":q)} style={{padding:"3px 9px",background:search===q?"#C8A96A1a":"#111",border:`1px solid ${search===q?"#C8A96A33":"#1a1a1a"}`,borderRadius:20,color:search===q?"#C8A96A":"#2e2e2e",cursor:"pointer",fontFamily:"inherit",fontSize:".67rem"}}>
                  {l} ({c})
                </button>
              ))}
            </div>
          )}

          <p style={{fontSize:".57rem",color:"#1a1a1a",marginBottom:7}}>⠿ اسحب للترتيب · ▲▼ تحريك · الترتيب يُحفظ تلقائياً</p>

          {displayItems.length===0 && <div style={{textAlign:"center",padding:"26px",color:"#1e1e1e",fontSize:".8rem"}}>لا توجد نتائج</div>}

          {displayItems.map((item)=>{
            const iid = item._id||item.id;
            const extrasCount = (item.extras||[]).length;
            const sizesCount  = (item.sizes||[]).length;
            return (
              <div key={iid} className={`row${dragId===iid?" dragging":""}`}
                draggable onDragStart={()=>setDragId(iid)}
                onDragOver={e=>onDragOver(e,tab,iid)}
                onDragEnd={()=>onDragEnd(tab)}>
                <span className="handle">⠿</span>

                {item.imageUrl
                  ? <img src={item.imageUrl} alt="" className="thumb"/>
                  : <div className="thumbph">🍕</div>
                }

                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,color:"#E5D3B3",fontSize:".83rem"}}>{item.label}</span>
                    {tab==="menu" && (item.comingSoon
                      ? <span className="badge br">قريباً</span>
                      : <span className="badge bg">ظاهر</span>)}
                    {sizesCount>0  && <span className="badge bo">{sizesCount} حجم</span>}
                    {extrasCount>0 && <span className="badge" style={{background:"#06111f",color:"#4DA6FF",border:"1px solid #4DA6FF22"}}>{extrasCount} مجموعة</span>}
                  </div>
                  <p style={{fontSize:".63rem",color:"#222",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.details||item.desc||"—"}</p>
                </div>

                <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                  {/* أسهم الترتيب */}
                  <div style={{display:"flex",flexDirection:"column",gap:1}}>
                    <button onClick={()=>moveItem(tab,iid,-1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▲</button>
                    <button onClick={()=>moveItem(tab,iid,+1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▼</button>
                  </div>
                  {tab==="menu" && (
                    <button onClick={()=>toggleCS(iid)} style={{padding:"4px 7px",background:item.comingSoon?"#1a0d0d":"#0d1a0d",border:`1px solid ${item.comingSoon?"#ef444422":"#4CAF5022"}`,borderRadius:6,color:item.comingSoon?"#ef4444":"#4CAF50",cursor:"pointer",fontSize:".66rem",fontWeight:700,fontFamily:"inherit"}}>
                      {item.comingSoon?"إظهار":"إخفاء"}
                    </button>
                  )}
                  <button className="ib" onClick={()=>openEdit(tab,iid)} style={{background:"#1a1a1a",border:"1px solid #222",color:"#C8A96A"}}>✏️</button>
                  <button className="ib" onClick={()=>dupItem(tab,iid)} style={{color:"#2e2e2e"}} title="نسخ">📋</button>
                  <button className="ib" onClick={()=>deleteItem(tab,iid)} style={{background:"#1a0d0d",border:"1px solid #ef444422",color:"#ef4444"}}>🗑</button>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ─── السجل ─── */}
        {tab==="history" && (
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:13,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
              <h2 style={{fontSize:".85rem",color:"#C8A96A"}}>📋 سجل التعديلات</h2>
              <button onClick={()=>{setHistory([]);lsSet("admin_history",[]);}} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:7,color:"#2e2e2e",cursor:"pointer",padding:"3px 8px",fontSize:".66rem",fontFamily:"inherit"}}>مسح</button>
            </div>
            {history.length===0
              ? <p style={{color:"#1e1e1e",fontSize:".76rem",textAlign:"center",padding:"14px 0"}}>لا يوجد سجل بعد</p>
              : history.map((h,i)=><div key={i} className="hrow"><span>{h.a}</span><span style={{color:"#1e1e1e",flexShrink:0}}>{h.t}</span></div>)
            }
          </div>
        )}

        {/* ─── الإعدادات ─── */}
        {tab==="settings" && (
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:13,padding:18}}>
            <h2 style={{fontSize:".85rem",color:"#C8A96A",marginBottom:14}}>⚙️ إعدادات الموقع</h2>
            {[["اسم المطعم",siteName,setSiteName,false],["الشعار",slogan,setSlogan,false],["رقم واتساب (بدون +)",wapp,setWapp,true]].map(([l,v,s,ltr])=>(
              <div key={l} style={{marginBottom:11}}>
                <span className="sl" style={{marginTop:0}}>{l}</span>
                <input className="ai" value={v} onChange={e=>s(e.target.value)} dir={ltr?"ltr":"rtl"}/>
              </div>
            ))}
            <button className="bp" style={{width:"100%",marginTop:6}} onClick={saveSettings}>💾 حفظ الإعدادات</button>
            <div style={{marginTop:13,background:"#0f0f0f",border:"1px solid #161616",borderRadius:10,padding:13}}>
              <p style={{fontSize:".62rem",color:"#1e1e1e",marginBottom:9}}>⚠️ منطقة خطر</p>
              <button className="bd" style={{width:"100%",padding:"10px"}} onClick={()=>confirm_("حذف كل البيانات؟ لا يمكن التراجع!", async()=>{
                for(const item of [...menu,...featured]){
                  await fetch(`/api/pizzas/${item._id||item.id}`,{method:"DELETE"}).catch(()=>{});
                }
                toast_("↺ تم مسح كل البيانات","warn"); log("مسح كل البيانات"); setTick(t=>t+1);
              })}>↺ مسح كل البيانات من قاعدة البيانات</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
