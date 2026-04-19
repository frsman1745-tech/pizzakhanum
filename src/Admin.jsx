import { useState } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

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

export default function AdminPage() {
  const [authed,  setAuthed]  = useState(false);
  const [pass,    setPass]    = useState("");
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("menu");
  const [menu,    setMenu]    = useState(() => loadLS("admin_menu",     DEFAULT_MENU));
  const [featured,setFeatured]= useState(() => loadLS("admin_featured", DEFAULT_FEATURED));
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState({});
  const [saved,   setSaved]   = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    if (pass === ADMIN_PASSWORD) { setAuthed(true); setError(""); }
    else setError("كلمة المرور غلط");
  }

  function openEdit(type, index) {
    const item = type==="menu" ? menu[index] : featured[index];
    setForm({ ...item }); setEditing({ type, index });
  }

  function saveEdit() {
    if (editing.type==="menu") {
      const updated = menu.map((it,i) => i===editing.index ? {...form} : it);
      setMenu(updated); saveLS("admin_menu", updated);
    } else {
      const updated = featured.map((it,i) => i===editing.index ? {...form} : it);
      setFeatured(updated); saveLS("admin_featured", updated);
    }
    setEditing(null);
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }

  function addMenuItem() {
    const newItem = { id:Date.now().toString(), label:"صنف جديد", details:"", comingSoon:false };
    const updated = [...menu, newItem];
    setMenu(updated); saveLS("admin_menu", updated);
    openEdit("menu", updated.length-1);
  }

  function deleteItem(type, index) {
    if (!confirm("تحذف هذا الصنف؟")) return;
    if (type==="menu") {
      const updated = menu.filter((_,i)=>i!==index);
      setMenu(updated); saveLS("admin_menu", updated);
    } else {
      const updated = featured.filter((_,i)=>i!==index);
      setFeatured(updated); saveLS("admin_featured", updated);
    }
  }

  function resetToDefault() {
    if (!confirm("تريد إرجاع كل البيانات للافتراضية؟")) return;
    setMenu(DEFAULT_MENU); saveLS("admin_menu", DEFAULT_MENU);
    setFeatured(DEFAULT_FEATURED); saveLS("admin_featured", DEFAULT_FEATURED);
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  }

  const S = {
    page:  { minHeight:"100vh", background:"#0a0a0a", color:"#E5D3B3", fontFamily:"'Noto Kufi Arabic', sans-serif", direction:"rtl" },
    card:  { background:"#141414", border:"1px solid #252525", borderRadius:14, padding:20, marginBottom:12 },
    input: { width:"100%", padding:"10px 14px", background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:10, color:"#E5D3B3", fontFamily:"inherit", fontSize:".88rem", outline:"none", marginTop:6 },
    btn:   (bg,color) => ({ padding:"9px 18px", background:bg, border:"none", borderRadius:10, color, cursor:"pointer", fontFamily:"inherit", fontSize:".82rem", fontWeight:700 }),
    label: { fontSize:".72rem", color:"#C8A96A88", letterSpacing:"1px", display:"block", marginTop:14 },
  };

  const CSS = `@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}`;

  /* ── صفحة الدخول ── */
  if (!authed) return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div style={{ ...S.card, width:340, textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:10 }}>🍕</div>
        <h1 style={{ color:"#C8A96A", marginBottom:6, fontSize:"1.2rem" }}>بيتزا خانم</h1>
        <p style={{ fontSize:".72rem", color:"#555", marginBottom:24 }}>لوحة تحكم الأدمن</p>
        {error && <p style={{ color:"#ef4444", marginBottom:14, fontSize:".82rem", background:"#1a0808", padding:"8px 12px", borderRadius:8 }}>⚠ {error}</p>}
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} style={S.input} required />
          <button type="submit" style={{ ...S.btn("linear-gradient(135deg,#C8A96A,#8B6B4A)","#0f0f0f"), width:"100%", marginTop:16, padding:13, fontSize:".92rem" }}>دخول →</button>
        </form>
      </div>
    </div>
  );

  const items = tab==="menu" ? menu : featured;

  /* ── نافذة التعديل ── */
  const EditModal = editing!==null && (
    <div style={{ position:"fixed", inset:0, background:"#000b", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
      <div style={{ ...S.card, width:"min(500px,95vw)", maxHeight:"88vh", overflowY:"auto", border:"1px solid #C8A96A44" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ color:"#C8A96A", fontSize:"1rem" }}>✏️ تعديل الصنف</h2>
          <button onClick={()=>setEditing(null)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"1.3rem" }}>×</button>
        </div>

        <label style={S.label}>الاسم</label>
        <input style={S.input} value={form.label||""} onChange={e=>setForm(p=>({...p,label:e.target.value}))} />

        {editing.type==="menu" && <>
          <label style={S.label}>الوصف / المكونات</label>
          <textarea style={{ ...S.input, minHeight:90, resize:"vertical" }} value={form.details||""} onChange={e=>setForm(p=>({...p,details:e.target.value}))} />
          <label style={S.label}>الحالة</label>
          <select style={S.input} value={form.comingSoon?"yes":"no"} onChange={e=>setForm(p=>({...p,comingSoon:e.target.value==="yes"}))}>
            <option value="no">✅ يظهر في القائمة</option>
            <option value="yes">⏳ قريباً — مخفي</option>
          </select>
        </>}

        {editing.type==="featured" && <>
          <label style={S.label}>الوصف</label>
          <textarea style={{ ...S.input, minHeight:80, resize:"vertical" }} value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} />
          {form.priceOld!==null && <>
            <label style={S.label}>السعر القديم (بالليرة السورية)</label>
            <input style={S.input} value={form.priceOld||""} onChange={e=>setForm(p=>({...p,priceOld:e.target.value}))} placeholder="مثال: 150,000" />
            <label style={S.label}>السعر الجديد (بالليرة الجديدة)</label>
            <input style={S.input} value={form.priceNew||""} onChange={e=>setForm(p=>({...p,priceNew:e.target.value}))} placeholder="مثال: 1,500" />
          </>}
          {/* أحجام بيتزا خانم */}
          {form.sizes && <>
            <p style={{ ...S.label, marginTop:18, color:"#C8A96A66", fontSize:".68rem" }}>أحجام خانم</p>
            {form.sizes.map((sz,si)=>(
              <div key={sz.id} style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:10, padding:"12px", marginTop:8 }}>
                <p style={{ fontSize:".7rem", color:"#555", marginBottom:8 }}>{sz.label}</p>
                <input style={{ ...S.input, marginTop:0, marginBottom:6 }} value={sz.priceOld||""} onChange={e=>setForm(p=>{ const s=[...p.sizes]; s[si]={...s[si],priceOld:e.target.value}; return {...p,sizes:s}; })} placeholder="السعر القديم" />
                <input style={{ ...S.input, marginTop:0 }} value={sz.priceNew||""} onChange={e=>setForm(p=>{ const s=[...p.sizes]; s[si]={...s[si],priceNew:e.target.value}; return {...p,sizes:s}; })} placeholder="السعر الجديد" />
              </div>
            ))}
          </>}
        </>}

        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          <button onClick={saveEdit} style={S.btn("#C8A96A","#0f0f0f")}>💾 حفظ التغييرات</button>
          <button onClick={()=>setEditing(null)} style={S.btn("#1e1e1e","#888")}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ── الداشبورد ── */
  return (
    <div style={S.page}>
      <style>{CSS}</style>
      {EditModal}

      {/* Toast */}
      {saved && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", background:"#0d1a0d", border:"1px solid #4CAF50", borderRadius:10, padding:"10px 20px", color:"#4CAF50", fontSize:".82rem", zIndex:1000, fontWeight:600 }}>
          ✓ تم الحفظ — التغييرات ظاهرة للزوار
        </div>
      )}

      {/* Header */}
      <div style={{ background:"#111", borderBottom:"1px solid #1e1e1e", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"1.4rem" }}>🍕</span>
          <div><h1 style={{ fontSize:".95rem", fontWeight:700, color:"#C8A96A" }}>بيتزا خانم</h1><p style={{ fontSize:".62rem", color:"#555" }}>لوحة التحكم</p></div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={resetToDefault} style={S.btn("#1a1a0a","#8B6B4A")}>↺ إرجاع</button>
          <button onClick={()=>setAuthed(false)} style={S.btn("#1e1e1e","#666")}>خروج</button>
        </div>
      </div>

      <div style={{ padding:24 }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"إجمالي القائمة",  value:menu.length,                          color:"#C8A96A" },
            { label:"ظاهر",            value:menu.filter(p=>!p.comingSoon).length, color:"#4CAF50" },
            { label:"قريباً",          value:menu.filter(p=>p.comingSoon).length,  color:"#ef4444" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#141414", border:"1px solid #1e1e1e", borderRadius:14, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:"1.6rem", fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:".68rem", color:"#555", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          {[["menu","🍕 قائمة البيتزا"],["featured","⭐ العروض المميزة"]].map(([key,lbl])=>(
            <button key={key} onClick={()=>setTab(key)} style={{ ...S.btn(tab===key?"#C8A96A":"#141414", tab===key?"#0f0f0f":"#666"), border:`1px solid ${tab===key?"#C8A96A":"#252525"}` }}>{lbl}</button>
          ))}
          {tab==="menu" && (
            <button onClick={addMenuItem} style={{ ...S.btn("#0d1a0d","#4CAF50"), border:"1px solid #4CAF5044", marginRight:"auto" }}>+ إضافة صنف</button>
          )}
        </div>

        {/* Items */}
        {items.map((item,i)=>(
          <div key={item.id||i} style={{ ...S.card, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <p style={{ fontWeight:700, color:"#E5D3B3", fontSize:".9rem" }}>{item.label}</p>
                {item.comingSoon && <span style={{ fontSize:".6rem", color:"#C8A96A", background:"#C8A96A22", padding:"2px 8px", borderRadius:20, flexShrink:0 }}>قريباً</span>}
                {!item.comingSoon && tab==="menu" && <span style={{ fontSize:".6rem", color:"#4CAF50", background:"#4CAF5022", padding:"2px 8px", borderRadius:20, flexShrink:0 }}>ظاهر</span>}
              </div>
              <p style={{ fontSize:".72rem", color:"#444", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.details||item.desc||"—"}</p>
              {item.priceOld && <p style={{ fontSize:".72rem", color:"#C8A96A", marginTop:4 }}>{item.priceOld} ل.س</p>}
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={()=>openEdit(tab,i)} style={S.btn("#1a1a1a","#C8A96A")}>✏️ تعديل</button>
              <button onClick={()=>deleteItem(tab,i)} style={S.btn("#1a0d0d","#ef4444")}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
