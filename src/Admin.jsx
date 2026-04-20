import { useState, useRef } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

/* ══════ DEFAULT DATA ══════ */
const DEFAULT_FEATURED = [
  { id:"meter",      label:"بيتزا المتر",  priceOld:"150,000", priceNew:"1,500", numericPrice:150000, sliceCount:8, cols:4, desc:"متر كامل من الشهية المتنوعة لتشاركه مع أحبّك" },
  { id:"sixtyforty", label:"بيتزا 60×40", priceOld:"140,000", priceNew:"1,400", numericPrice:140000, sliceCount:6, cols:3, desc:"الحجم العائلي المثالي للتجمعات" },
  { id:"khanum",     label:"بيتزا خانم",  priceOld:null, priceNew:null, desc:"كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨",
    sizes:[{id:"sm",label:"صغيرة",priceOld:"45,000",priceNew:"450",numericPrice:45000},{id:"lg",label:"كبيرة",priceOld:"60,000",priceNew:"600",numericPrice:60000}] },
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

/* ══════ HELPERS ══════ */
function ls(key, fb) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fb; } catch { return fb; } }
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function imgKey(id) { return `pizza_img_${id}`; }
function getImg(id) { return localStorage.getItem(imgKey(id)) || null; }
function setImg(id, b64) { if (b64) localStorage.setItem(imgKey(id), b64); else localStorage.removeItem(imgKey(id)); }

/* ══════ CSS ══════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeIn {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes toastIn{from{opacity:0;transform:translate(-50%,-14px)}to{opacity:1;transform:translate(-50%,0)}}
  .fadein  {animation:fadeIn  .28s ease forwards}
  .slideup {animation:slideUp .32s ease forwards}
  .toastin {animation:toastIn .28s ease forwards}

  .ai { width:100%;padding:10px 14px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;color:#E5D3B3;font-family:inherit;font-size:.88rem;outline:none;transition:border-color .2s,box-shadow .2s;margin-top:6px; }
  .ai:focus{border-color:#C8A96A55;box-shadow:0 0 0 3px #C8A96A11}

  .row{background:#141414;border:1px solid #1e1e1e;border-radius:14px;padding:12px 14px;margin-bottom:9px;display:flex;align-items:center;gap:10px;transition:border-color .2s,transform .15s}
  .row:hover{border-color:#2a2a2a;transform:translateX(-2px)}

  .tb{padding:8px 14px;border-radius:10px;border:1px solid #252525;background:#141414;color:#555;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:700;transition:all .2s}
  .tb:hover{border-color:#C8A96A44;color:#C8A96A}
  .tb.on{background:#C8A96A;border-color:#C8A96A;color:#0f0f0f}

  .ib{padding:7px 12px;border-radius:9px;border:1px solid transparent;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:700;transition:all .18s;display:inline-flex;align-items:center;gap:5px}
  .ib:hover{transform:translateY(-1px)}
  .ib:active{transform:scale(.96)}

  .modal-bg{position:fixed;inset:0;background:#000c;display:flex;align-items:center;justify-content:center;z-index:999;padding:14px}
  .modal{background:#141414;border:1px solid #C8A96A33;border-radius:18px;width:min(540px,100%);max-height:92vh;overflow-y:auto;padding:22px}
  .modal::-webkit-scrollbar{width:3px}
  .modal::-webkit-scrollbar-thumb{background:#C8A96A33;border-radius:2px}

  .sl{font-size:.67rem;color:#C8A96A55;letter-spacing:2px;display:block;margin-top:16px;margin-bottom:3px;font-weight:700}

  .pill{display:inline-flex;align-items:center;gap:7px;background:#1a1a1a;border:1px solid #252525;border-radius:30px;padding:7px 14px;cursor:pointer;transition:all .2s;margin-top:8px;font-family:inherit;font-size:.8rem;color:#555;font-weight:600}
  .pill.on {background:#0d1a0d;border-color:#4CAF5066;color:#4CAF50}
  .pill.warn{background:#1a0d0d;border-color:#ef444466;color:#ef4444}

  .img-drop{width:100%;height:140px;border:2px dashed #2a2a2a;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;margin-top:8px;position:relative;overflow:hidden;background:#111}
  .img-drop:hover{border-color:#C8A96A44;background:#141414}
  .img-drop img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .img-drop .overlay{position:absolute;inset:0;background:#00000066;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
  .img-drop:hover .overlay{opacity:1}

  .thumb{width:44px;height:44px;border-radius:9px;object-fit:cover;flex-shrink:0;border:1px solid #2a2a2a}
  .thumb-ph{width:44px;height:44px;border-radius:9px;background:#1a1a1a;border:1px dashed #2a2a2a;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}

  .stat{background:#141414;border:1px solid #1e1e1e;border-radius:13px;padding:14px 10px;text-align:center}
  .hist{font-size:.7rem;color:#3a3a3a;padding:7px 0;border-bottom:1px solid #1a1a1a;display:flex;justify-content:space-between;gap:10px}
  .hist:last-child{border-bottom:none}

  .badge{font-size:.58rem;padding:2px 8px;border-radius:20px;font-weight:700;flex-shrink:0}
  .bg{background:#4CAF5022;color:#4CAF50}
  .br{background:#ef444422;color:#ef4444}
  .bo{background:#C8A96A22;color:#C8A96A}
  .bb{background:#4DA6FF22;color:#4DA6FF}

  .search{width:100%;padding:10px 14px;background:#141414;border:1px solid #1e1e1e;border-radius:12px;color:#E5D3B3;font-family:inherit;font-size:.85rem;outline:none;transition:border-color .2s;margin-bottom:12px}
  .search:focus{border-color:#C8A96A44}
`;

/* ══════════════════════════════════════════════ */
export default function AdminPage() {
  const [authed,   setAuthed]   = useState(false);
  const [pass,     setPass]     = useState("");
  const [authErr,  setAuthErr]  = useState("");

  const [menu,     setMenu]     = useState(()=>ls("admin_menu",     DEFAULT_MENU));
  const [featured, setFeatured] = useState(()=>ls("admin_featured", DEFAULT_FEATURED));
  const [tab,      setTab]      = useState("menu");
  const [search,   setSearch]   = useState("");
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({});
  const [formImg,  setFormImg]  = useState(null);   // base64 preview while editing
  const [toast,    setToast]    = useState(null);
  const [history,  setHistory]  = useState(()=>ls("admin_history",[]));
  const [dragIdx,  setDragIdx]  = useState(null);
  const [imgTick,  setImgTick]  = useState(0);      // force re-render after img save

  // Settings
  const [siteName,  setSiteName]  = useState(()=>ls("site_name",     "بيتزا خانم"));
  const [slogan,    setSlogan]    = useState(()=>ls("site_slogan",   "كُل لتعيش · وعِش لأجل البيتزا"));
  const [whatsapp,  setWhatsapp]  = useState(()=>ls("site_whatsapp","963998950904"));

  const fileRef = useRef();

  /* ── helpers ── */
  function toast_(msg, type="ok") { setToast({msg,type}); setTimeout(()=>setToast(null),2600); }
  function log(action) { const e={action,time:new Date().toLocaleString("ar-EG")}; const u=[e,...history].slice(0,40); setHistory(u); lsSet("admin_history",u); }

  /* ── login ── */
  function login(e) { e.preventDefault(); if(pass===ADMIN_PASSWORD){setAuthed(true);setAuthErr("");}else setAuthErr("كلمة المرور غلط"); }

  /* ── image upload ── */
  function handleImgFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setFormImg(ev.target.result);
    reader.readAsDataURL(file);
  }

  /* ── open edit ── */
  function openEdit(type, idx) {
    const item = type==="menu" ? menu[idx] : featured[idx];
    setForm({...item, _sizes: item.sizes ? item.sizes.map(s=>({...s})) : undefined});
    setFormImg(getImg(item.id));
    setEditing({type, idx});
  }

  /* ── save edit ── */
  function saveEdit() {
    const saved = {...form};
    if (saved._sizes) { saved.sizes = saved._sizes; delete saved._sizes; }
    setImg(saved.id, formImg);
    setImgTick(t=>t+1);
    if (editing.type==="menu") {
      const u = menu.map((it,i)=>i===editing.idx?saved:it);
      setMenu(u); lsSet("admin_menu",u);
    } else {
      const u = featured.map((it,i)=>i===editing.idx?saved:it);
      setFeatured(u); lsSet("admin_featured",u);
    }
    log(`تعديل: ${saved.label}`);
    setEditing(null);
    toast_("✓ تم الحفظ");
  }

  /* ── toggle visibility ── */
  function toggleCS(idx) {
    const u = menu.map((it,i)=>i===idx?{...it,comingSoon:!it.comingSoon}:it);
    setMenu(u); lsSet("admin_menu",u);
    log(`تغيير حالة: ${menu[idx].label}`);
    toast_(u[idx].comingSoon?"⏳ أُخفي الصنف":"✅ ظهر الصنف", u[idx].comingSoon?"warn":"ok");
  }

  /* ── add ── */
  function addItem() {
    const newItem = {id:Date.now().toString(), label:"صنف جديد", details:"", comingSoon:false};
    const u = [...menu, newItem];
    setMenu(u); lsSet("admin_menu",u);
    log("إضافة صنف جديد");
    openEdit("menu", u.length-1);
  }

  /* ── duplicate ── */
  function dupItem(type, idx) {
    const src = type==="menu" ? menu[idx] : featured[idx];
    const copy = {...src, id:Date.now().toString(), label:src.label+" (نسخة)"};
    const srcImg = getImg(src.id);
    if (srcImg) setImg(copy.id, srcImg);
    if (type==="menu") { const u=[...menu,copy]; setMenu(u); lsSet("admin_menu",u); }
    else { const u=[...featured,copy]; setFeatured(u); lsSet("admin_featured",u); }
    log(`نسخ: ${src.label}`);
    toast_("📋 تم نسخ الصنف");
    setImgTick(t=>t+1);
  }

  /* ── delete ── */
  function delItem(type, idx) {
    const name = type==="menu" ? menu[idx].label : featured[idx].label;
    if (!confirm(`تحذف "${name}"؟`)) return;
    if (type==="menu") { const u=menu.filter((_,i)=>i!==idx); setMenu(u); lsSet("admin_menu",u); }
    else { const u=featured.filter((_,i)=>i!==idx); setFeatured(u); lsSet("admin_featured",u); }
    log(`حذف: ${name}`);
    toast_("🗑 تم الحذف","warn");
  }

  /* ── delete image ── */
  function delImg() { setFormImg(null); }

  /* ── reorder ── */
  function move(type, from, to) {
    const arr = type==="menu" ? [...menu] : [...featured];
    if (to<0||to>=arr.length) return;
    const [m]=arr.splice(from,1); arr.splice(to,0,m);
    if (type==="menu") { setMenu(arr); lsSet("admin_menu",arr); }
    else { setFeatured(arr); lsSet("admin_featured",arr); }
  }
  function onDragStart(i)   { setDragIdx(i); }
  function onDragOver(e,i)  { e.preventDefault(); if(dragIdx!==null&&dragIdx!==i){move(tab,dragIdx,i);setDragIdx(i);} }
  function onDragEnd()      { setDragIdx(null); }

  /* ── reset ── */
  function reset() {
    if (!confirm("إرجاع كل البيانات للافتراضية؟")) return;
    setMenu(DEFAULT_MENU); lsSet("admin_menu",DEFAULT_MENU);
    setFeatured(DEFAULT_FEATURED); lsSet("admin_featured",DEFAULT_FEATURED);
    log("إرجاع للافتراضي"); toast_("↺ تم الإرجاع","warn");
  }

  /* ── export / import ── */
  function exportData() {
    const data = JSON.stringify({menu,featured,exportedAt:new Date().toISOString()},null,2);
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([data],{type:"application/json"})),download:"pizzakhanum.json"});
    a.click(); toast_("📦 تم التصدير");
  }
  function importData(e) {
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{ try { const p=JSON.parse(ev.target.result); if(p.menu){setMenu(p.menu);lsSet("admin_menu",p.menu);} if(p.featured){setFeatured(p.featured);lsSet("admin_featured",p.featured);} log("استيراد بيانات"); toast_("📥 تم الاستيراد"); } catch{toast_("⚠ الملف غير صالح","err");} };
    r.readAsText(file); e.target.value="";
  }

  /* ── save settings ── */
  function saveSettings() {
    lsSet("site_name",siteName); lsSet("site_slogan",slogan); lsSet("site_whatsapp",whatsapp);
    log("تعديل الإعدادات"); toast_("⚙️ تم حفظ الإعدادات");
  }

  const src = tab==="menu" ? menu : featured;
  const items = src.filter(it=>!search||it.label.includes(search)||(it.details||it.desc||"").includes(search));

  /* ════════ LOGIN ════════ */
  if (!authed) return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      <div className="slideup" style={{background:"#141414",border:"1px solid #C8A96A22",borderRadius:20,padding:"36px 30px",width:"min(350px,95vw)",textAlign:"center"}}>
        <div style={{fontSize:"3rem",marginBottom:10}}>🍕</div>
        <h1 style={{color:"#C8A96A",fontSize:"1.25rem",marginBottom:4}}>بيتزا خانم</h1>
        <p style={{fontSize:".72rem",color:"#444",marginBottom:26}}>لوحة التحكم — أدمن فقط</p>
        {authErr&&<div style={{background:"#1a0808",border:"1px solid #ef444433",borderRadius:9,padding:"8px 13px",marginBottom:14,fontSize:".8rem",color:"#ef4444"}}>⚠ {authErr}</div>}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} className="ai" required/>
          <button type="submit" style={{width:"100%",marginTop:14,padding:"12px",background:"linear-gradient(135deg,#C8A96A,#8B6B4A)",border:"none",borderRadius:11,fontSize:".9rem",fontWeight:700,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit"}}>دخول →</button>
        </form>
      </div>
    </div>
  );

  /* ════════ EDIT MODAL ════════ */
  const Modal = editing!==null && (
    <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)setEditing(null)}}>
      <div className="modal slideup">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{color:"#C8A96A",fontSize:".98rem"}}>✏️ {form.label}</h2>
          <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:"1.4rem",lineHeight:1}}>×</button>
        </div>

        {/* ── صورة الصنف ── */}
        <span className="sl">صورة الصنف</span>
        <div className="img-drop" onClick={()=>fileRef.current.click()}>
          {formImg && <img src={formImg} alt=""/>}
          <div className="overlay">
            <span style={{fontSize:"1.6rem"}}>📷</span>
            <span style={{fontSize:".72rem",color:"#fff",marginTop:4}}>تغيير الصورة</span>
          </div>
          {!formImg && <>
            <span style={{fontSize:"2rem",opacity:.3}}>🖼</span>
            <span style={{fontSize:".75rem",color:"#444",marginTop:6}}>اضغط لرفع صورة</span>
            <span style={{fontSize:".65rem",color:"#2a2a2a",marginTop:3}}>JPG / PNG / WEBP</span>
          </>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImgFile(e.target.files[0])}/>
        {formImg && (
          <button onClick={delImg} style={{marginTop:6,background:"none",border:"1px solid #2a2a2a",borderRadius:8,color:"#555",cursor:"pointer",padding:"5px 12px",fontSize:".72rem",fontFamily:"inherit"}}>
            🗑 حذف الصورة
          </button>
        )}

        {/* ── اسم ── */}
        <span className="sl">اسم الصنف</span>
        <input className="ai" value={form.label||""} onChange={e=>setForm(p=>({...p,label:e.target.value}))}/>

        {editing.type==="menu" && <>
          <span className="sl">الوصف والمكونات</span>
          <textarea className="ai" rows={4} style={{resize:"vertical"}} value={form.details||""} onChange={e=>setForm(p=>({...p,details:e.target.value}))} placeholder="اكتب المكونات..."/>
          <span className="sl">الحالة</span>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className={`pill${!form.comingSoon?" on":""}`} onClick={()=>setForm(p=>({...p,comingSoon:false}))}>✅ ظاهر</button>
            <button className={`pill${form.comingSoon?" warn":""}`} onClick={()=>setForm(p=>({...p,comingSoon:true}))}>⏳ قريباً</button>
          </div>
        </>}

        {editing.type==="featured" && <>
          <span className="sl">الوصف</span>
          <textarea className="ai" rows={3} style={{resize:"vertical"}} value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/>
          {form.priceOld!==null&&form.priceOld!==undefined&&<>
            <span className="sl">الأسعار</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
              <div><p style={{fontSize:".67rem",color:"#555",marginBottom:3}}>السعر القديم (ل.س)</p>
                <input className="ai" style={{marginTop:0}} value={form.priceOld||""} onChange={e=>setForm(p=>({...p,priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||p.numericPrice}))} placeholder="150,000"/></div>
              <div><p style={{fontSize:".67rem",color:"#555",marginBottom:3}}>السعر الجديد (ل.ج)</p>
                <input className="ai" style={{marginTop:0}} value={form.priceNew||""} onChange={e=>setForm(p=>({...p,priceNew:e.target.value}))} placeholder="1,500"/></div>
            </div>
          </>}
          {form._sizes&&<>
            <span className="sl">أحجام بيتزا خانم</span>
            {form._sizes.map((sz,si)=>(
              <div key={sz.id} style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:11,padding:12,marginTop:8}}>
                <p style={{fontSize:".73rem",color:"#C8A96A88",marginBottom:8,fontWeight:700}}>{sz.label}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><p style={{fontSize:".64rem",color:"#444",marginBottom:3}}>القديم</p>
                    <input className="ai" style={{marginTop:0}} value={sz.priceOld||""} onChange={e=>setForm(p=>{const s=[...p._sizes];s[si]={...s[si],priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||s[si].numericPrice};return{...p,_sizes:s};})}/></div>
                  <div><p style={{fontSize:".64rem",color:"#444",marginBottom:3}}>الجديد</p>
                    <input className="ai" style={{marginTop:0}} value={sz.priceNew||""} onChange={e=>setForm(p=>{const s=[...p._sizes];s[si]={...s[si],priceNew:e.target.value};return{...p,_sizes:s};})}/></div>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* معاينة */}
        <div style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:12,padding:14,marginTop:18,overflow:"hidden"}}>
          <p style={{fontSize:".6rem",color:"#2a2a2a",marginBottom:8,letterSpacing:"2px"}}>معاينة مباشرة</p>
          {formImg && <img src={formImg} alt="" style={{width:"100%",height:110,objectFit:"cover",borderRadius:9,marginBottom:10}}/>}
          <p style={{fontWeight:700,color:"#E5D3B3",fontSize:".88rem",marginBottom:3}}>{form.label||"—"}</p>
          <p style={{fontSize:".7rem",color:"#555",lineHeight:1.5}}>{form.details||form.desc||"—"}</p>
          {(form.priceOld||form.priceNew)&&<p style={{fontSize:".76rem",color:"#C8A96A",marginTop:5,fontWeight:700}}>{form.priceOld} ل.س {form.priceNew&&`/ ${form.priceNew} ل.ج`}</p>}
        </div>

        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={saveEdit} style={{flex:1,padding:"12px",background:"#C8A96A",border:"none",borderRadius:10,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit",fontSize:".88rem",fontWeight:700}}>💾 حفظ</button>
          <button onClick={()=>setEditing(null)} style={{padding:"12px 16px",background:"#1e1e1e",border:"none",borderRadius:10,color:"#666",cursor:"pointer",fontFamily:"inherit"}}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ════════ DASHBOARD ════════ */
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#E5D3B3",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      {Modal}

      {/* Toast */}
      {toast&&(
        <div className="toastin" style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:toast.type==="err"?"#1a0808":toast.type==="warn"?"#1a1408":"#0d1a0d",border:`1px solid ${toast.type==="err"?"#ef4444":toast.type==="warn"?"#C8A96A":"#4CAF50"}`,borderRadius:11,padding:"10px 20px",zIndex:2000,color:toast.type==="err"?"#ef4444":toast.type==="warn"?"#C8A96A":"#4CAF50",fontSize:".82rem",fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 8px 28px #00000099"}}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{background:"#111",borderBottom:"1px solid #1a1a1a",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:"1.4rem"}}>🍕</span>
          <div><h1 style={{fontSize:".92rem",fontWeight:900,color:"#C8A96A"}}>بيتزا خانم</h1><p style={{fontSize:".58rem",color:"#333"}}>لوحة التحكم</p></div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button className="ib" onClick={exportData} style={{background:"#141414",border:"1px solid #252525",color:"#777"}}>📦</button>
          <label className="ib" style={{background:"#141414",border:"1px solid #252525",color:"#777",cursor:"pointer"}}>
            📥<input type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
          </label>
          <button className="ib" onClick={reset} style={{background:"#1a1a0a",border:"1px solid #C8A96A22",color:"#8B6B4A"}}>↺</button>
          <button className="ib" onClick={()=>setAuthed(false)} style={{background:"#1a1010",border:"1px solid #ef444422",color:"#666"}}>خروج</button>
        </div>
      </div>

      <div style={{padding:"18px 18px 60px",maxWidth:740,margin:"0 auto"}}>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:20}}>
          {[
            {label:"القائمة", value:menu.length,                          color:"#C8A96A",icon:"🍕"},
            {label:"ظاهر",    value:menu.filter(p=>!p.comingSoon).length, color:"#4CAF50",icon:"✅"},
            {label:"قريباً",  value:menu.filter(p=>p.comingSoon).length,  color:"#ef4444",icon:"⏳"},
            {label:"المميزة", value:featured.length,                      color:"#4DA6FF",icon:"⭐"},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div style={{fontSize:"1rem",marginBottom:3}}>{s.icon}</div>
              <div style={{fontSize:"1.45rem",fontWeight:900,color:s.color}}>{s.value}</div>
              <div style={{fontSize:".6rem",color:"#3a3a3a",marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
          {[["menu","🍕 القائمة"],["featured","⭐ المميزة"],["history","📋 السجل"],["settings","⚙️ الإعدادات"]].map(([k,l])=>(
            <button key={k} className={`tb${tab===k?" on":""}`} onClick={()=>{setTab(k);setSearch("");}}>{l}</button>
          ))}
          {tab==="menu"&&(
            <button className="ib" onClick={addItem} style={{background:"#0d1a0d",border:"1px solid #4CAF5033",color:"#4CAF50",marginRight:"auto"}}>+ إضافة صنف</button>
          )}
        </div>

        {/* ═══ MENU / FEATURED ═══ */}
        {(tab==="menu"||tab==="featured")&&(<>
          <input className="search" placeholder={`🔍  ابحث...`} value={search} onChange={e=>setSearch(e.target.value)}/>

          {tab==="menu"&&(
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
              {[["","الكل",menu.length],["__v","ظاهر",menu.filter(p=>!p.comingSoon).length],["__h","قريباً",menu.filter(p=>p.comingSoon).length]].map(([q,l,c])=>(
                <button key={q} onClick={()=>setSearch(q)} style={{padding:"4px 11px",background:search===q?"#C8A96A22":"#141414",border:`1px solid ${search===q?"#C8A96A44":"#1e1e1e"}`,borderRadius:20,color:search===q?"#C8A96A":"#3a3a3a",cursor:"pointer",fontFamily:"inherit",fontSize:".7rem"}}>
                  {l} ({c})
                </button>
              ))}
            </div>
          )}

          <p style={{fontSize:".62rem",color:"#222",marginBottom:9}}>⠿ اسحب لإعادة الترتيب · ▲▼ تحريك سريع</p>

          {(tab==="menu"
            ? (search==="__v"?menu.filter(p=>!p.comingSoon):search==="__h"?menu.filter(p=>p.comingSoon):items)
            : items
          ).map((item)=>{
            const ri = src.indexOf(item);
            const thumb = getImg(item.id);   // imgTick triggers re-read
            void imgTick;
            return (
              <div key={item.id||ri} className="row fadein"
                draggable onDragStart={()=>onDragStart(ri)} onDragOver={e=>onDragOver(e,ri)} onDragEnd={onDragEnd}
                style={{borderColor:dragIdx===ri?"#C8A96A44":""}}>

                <span style={{color:"#252525",fontSize:"1.1rem",cursor:"grab",userSelect:"none",padding:"3px"}}>⠿</span>

                {/* thumbnail */}
                {thumb
                  ? <img src={thumb} alt="" className="thumb"/>
                  : <div className="thumb-ph">🍕</div>
                }

                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,color:"#E5D3B3",fontSize:".86rem"}}>{item.label}</span>
                    {tab==="menu"&&(item.comingSoon?<span className="badge br">قريباً</span>:<span className="badge bg">ظاهر</span>)}
                    {tab==="featured"&&item.priceOld&&<span className="badge bo">{item.priceOld} ل.س</span>}
                    {tab==="featured"&&item.sizes&&<span className="badge bb">حسب الحجم</span>}
                    {thumb&&<span style={{fontSize:".55rem",color:"#4DA6FF55",marginRight:2}}>📷</span>}
                  </div>
                  <p style={{fontSize:".68rem",color:"#2e2e2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.details||item.desc||"—"}</p>
                </div>

                <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <button onClick={()=>move(tab,ri,ri-1)} style={{background:"none",border:"none",color:"#252525",cursor:"pointer",fontSize:".72rem",lineHeight:1,padding:"2px 4px"}}>▲</button>
                    <button onClick={()=>move(tab,ri,ri+1)} style={{background:"none",border:"none",color:"#252525",cursor:"pointer",fontSize:".72rem",lineHeight:1,padding:"2px 4px"}}>▼</button>
                  </div>
                  {tab==="menu"&&(
                    <button onClick={()=>toggleCS(ri)} style={{padding:"5px 9px",background:item.comingSoon?"#1a0d0d":"#0d1a0d",border:`1px solid ${item.comingSoon?"#ef444433":"#4CAF5033"}`,borderRadius:7,color:item.comingSoon?"#ef4444":"#4CAF50",cursor:"pointer",fontSize:".7rem",fontWeight:700,fontFamily:"inherit"}}>
                      {item.comingSoon?"إظهار":"إخفاء"}
                    </button>
                  )}
                  <button className="ib" onClick={()=>openEdit(tab,ri)} style={{background:"#1a1a1a",border:"1px solid #252525",color:"#C8A96A"}}>✏️</button>
                  <button className="ib" onClick={()=>dupItem(tab,ri)} style={{background:"#111",border:"1px solid #1e1e1e",color:"#3a3a3a"}} title="نسخ">📋</button>
                  <button className="ib" onClick={()=>delItem(tab,ri)} style={{background:"#1a0d0d",border:"1px solid #ef444422",color:"#ef4444"}}>🗑</button>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ═══ HISTORY ═══ */}
        {tab==="history"&&(
          <div style={{background:"#141414",border:"1px solid #1e1e1e",borderRadius:14,padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontSize:".88rem",color:"#C8A96A"}}>📋 سجل التعديلات</h2>
              <button onClick={()=>{setHistory([]);lsSet("admin_history",[]);}} style={{background:"none",border:"1px solid #1e1e1e",borderRadius:8,color:"#3a3a3a",cursor:"pointer",padding:"4px 10px",fontSize:".7rem",fontFamily:"inherit"}}>مسح</button>
            </div>
            {history.length===0
              ? <p style={{color:"#222",fontSize:".8rem",textAlign:"center",padding:"20px 0"}}>لا يوجد سجل بعد</p>
              : history.map((h,i)=>(<div key={i} className="hist"><span>{h.action}</span><span style={{color:"#222",flexShrink:0}}>{h.time}</span></div>))
            }
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {tab==="settings"&&(
          <div style={{background:"#141414",border:"1px solid #1e1e1e",borderRadius:14,padding:22}}>
            <h2 style={{fontSize:".88rem",color:"#C8A96A",marginBottom:18}}>⚙️ إعدادات الموقع</h2>
            <span className="sl">اسم المطعم</span>
            <input className="ai" value={siteName} onChange={e=>setSiteName(e.target.value)}/>
            <span className="sl">الشعار (tagline)</span>
            <input className="ai" value={slogan} onChange={e=>setSlogan(e.target.value)}/>
            <span className="sl">رقم واتساب (بدون +)</span>
            <input className="ai" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} dir="ltr"/>
            <button onClick={saveSettings} style={{marginTop:20,width:"100%",padding:"12px",background:"#C8A96A",border:"none",borderRadius:11,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit",fontSize:".88rem",fontWeight:700}}>💾 حفظ الإعدادات</button>
            <div style={{marginTop:18,background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:11,padding:14}}>
              <p style={{fontSize:".68rem",color:"#2a2a2a",marginBottom:10}}>⚠️ منطقة خطر</p>
              <button onClick={reset} style={{width:"100%",padding:"10px",background:"#1a0808",border:"1px solid #ef444433",borderRadius:9,color:"#ef4444",cursor:"pointer",fontFamily:"inherit",fontSize:".8rem",fontWeight:700}}>↺ إرجاع كل البيانات للافتراضية</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
