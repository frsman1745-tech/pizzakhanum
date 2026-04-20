import { useState, useRef } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "pizza2024";

/* ══════ IMAGE KEYS ══════
   pizza_img_{id}  → صورة الكارد (تظهر في القائمة والعروض والتفاصيل)
   flavor_img_{id} → صورة النكهة (تظهر داخل اختيار النكهات في البانيه)
*/
function getImg(id, type="pizza") { return localStorage.getItem(`${type}_img_${id}`) || null; }
function setImg(id, type, b64)    { if (b64) localStorage.setItem(`${type}_img_${id}`, b64); else localStorage.removeItem(`${type}_img_${id}`); }

/* ══════ DATA ══════ */
const DEFAULT_FEATURED = [
  { id:"meter",      label:"بيتزا المتر",  priceOld:"150,000", priceNew:"1,500", numericPrice:150000, sliceCount:8, cols:4, desc:"متر كامل من الشهية المتنوعة لتشاركه مع أحبّك" },
  { id:"sixtyforty", label:"بيتزا 60×40", priceOld:"140,000", priceNew:"1,400", numericPrice:140000, sliceCount:6, cols:3, desc:"الحجم العائلي المثالي للتجمعات" },
  { id:"khanum",     label:"بيتزا خانم",  priceOld:null, priceNew:null, desc:"كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨",
    sizes:[{id:"sm",label:"صغيرة",priceOld:"45,000",priceNew:"450",numericPrice:45000},{id:"lg",label:"كبيرة",priceOld:"60,000",priceNew:"600",numericPrice:60000}] },
];
const DEFAULT_MENU = [
  { id:"4seasons",      label:"الفصول الأربعة",  details:"جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء.", comingSoon:false },
  { id:"margarita",    label:"مارغريتا",          details:"جبنة القشقوان مع الصلصة الحمراء.", comingSoon:false },
  { id:"hawaii",       label:"هاواي",             details:"جبنة القشقوان مع الموزريلا وشرائح الأناناس.", comingSoon:false },
  { id:"teamscheese",  label:"التيمات تشيز",      details:"جبنة القشقوان مع موزريلا وكرات الطماطم والريحان.", comingSoon:false },
  { id:"supersupreme", label:"سوبر سوبريم",       details:"البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود.", comingSoon:false },
  { id:"chickenbbq",   label:"تشيكن باربيكيو",   details:"شرائح الدجاج بصوص الباربيكيو وجبنة القشقوان مع البصل.", comingSoon:false },
  { id:"peperoni",     label:"ببروني",            details:"جبنة القشقوان مع شرائح البيروني لحم البقر والثوم والكزبرة.", comingSoon:false },
  { id:"salami",       label:"سلامي",             details:"جبنة القشقوان مع شرائح لحم البقر.", comingSoon:false },
  { id:"hotdog",       label:"هوت دوغ",           details:"جبنة القشقوان مع حبات الهوت دوغ المدخن.", comingSoon:false },
  { id:"smokedchicken",label:"دجاج مدخن",         details:"جبنة القشقوان مع شرائح دجاج الحبش المدخن.", comingSoon:false },
  { id:"fajita",       label:"فاهيتا",            details:"جبنة القشقوان مع دجاج الفاهيتا والماشروم والفلفل الأخضر والذرة.", comingSoon:false },
  { id:"cs1", label:"بيتزا الكريمة", details:"", comingSoon:true },
  { id:"cs2", label:"الثلاثي",        details:"", comingSoon:true },
  { id:"cs3", label:"بيتزا البحر",   details:"", comingSoon:true },
  { id:"cs4", label:"المكسيكية",      details:"", comingSoon:true },
  { id:"cs5", label:"بيتزا الخضار",  details:"", comingSoon:true },
];

function lsGet(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSet(k,v){localStorage.setItem(k,JSON.stringify(v));}

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
  @keyframes toastIn{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
  .af{animation:fadeIn .25s ease forwards}
  .au{animation:slideUp .3s ease forwards}
  .at{animation:toastIn .25s ease forwards}

  .ai{width:100%;padding:10px 13px;background:#1a1a1a;border:1px solid #252525;border-radius:10px;color:#E5D3B3;font-family:inherit;font-size:.86rem;outline:none;transition:border-color .2s,box-shadow .2s;margin-top:5px}
  .ai:focus{border-color:#C8A96A44;box-shadow:0 0 0 3px #C8A96A0c}

  .row{background:#141414;border:1px solid #1a1a1a;border-radius:13px;padding:11px 13px;margin-bottom:8px;display:flex;align-items:center;gap:10px;transition:border-color .18s,transform .15s}
  .row:hover{border-color:#222;transform:translateX(-2px)}

  .tb{padding:8px 14px;border-radius:10px;border:1px solid #1e1e1e;background:#141414;color:#444;cursor:pointer;font-family:inherit;font-size:.79rem;font-weight:700;transition:all .2s;white-space:nowrap}
  .tb:hover{border-color:#C8A96A33;color:#C8A96A88}
  .tb.on{background:#C8A96A;border-color:#C8A96A;color:#0f0f0f}

  .ib{padding:6px 11px;border-radius:9px;border:1px solid transparent;cursor:pointer;font-family:inherit;font-size:.76rem;font-weight:700;transition:all .18s;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
  .ib:hover{transform:translateY(-1px)}
  .ib:active{transform:scale(.96)}

  .mbg{position:fixed;inset:0;background:#000d;display:flex;align-items:center;justify-content:center;z-index:900;padding:12px}
  .mbox{background:#141414;border:1px solid #C8A96A22;border-radius:18px;width:min(540px,100%);max-height:92vh;overflow-y:auto;padding:20px}
  .mbox::-webkit-scrollbar{width:3px}
  .mbox::-webkit-scrollbar-thumb{background:#C8A96A22;border-radius:2px}
  .cbox{background:#1a1a1a;border:1px solid #ef444422;border-radius:14px;padding:22px;width:min(300px,95vw);text-align:center}

  .sl{font-size:.64rem;color:#C8A96A44;letter-spacing:2px;display:block;margin-top:15px;margin-bottom:3px;font-weight:700}
  .pill{display:inline-flex;align-items:center;gap:7px;background:#1a1a1a;border:1px solid #252525;border-radius:30px;padding:7px 14px;cursor:pointer;transition:all .2s;font-family:inherit;font-size:.79rem;color:#444;font-weight:600}
  .pill.on{background:#0d1a0d;border-color:#4CAF5044;color:#4CAF50}
  .pill.off{background:#1a0d0d;border-color:#ef444444;color:#ef4444}

  .imgzone{width:100%;height:120px;border:2px dashed #252525;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;background:#111;margin-top:6px}
  .imgzone:hover{border-color:#C8A96A44}
  .imgzone img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
  .imgzone .ov{position:absolute;inset:0;background:#000000aa;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}
  .imgzone:hover .ov{opacity:1}

  .thumb{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;border:1px solid #252525}
  .thumbph{width:42px;height:42px;border-radius:8px;background:#1a1a1a;border:1px dashed #222;display:flex;align-items:center;justify-content:center;font-size:.95rem;flex-shrink:0;color:#2a2a2a}
  .stat{background:#141414;border:1px solid #1a1a1a;border-radius:13px;padding:13px 8px;text-align:center}
  .hrow{font-size:.68rem;color:#2e2e2e;padding:7px 0;border-bottom:1px solid #161616;display:flex;justify-content:space-between;gap:8px}
  .hrow:last-child{border-bottom:none}
  .badge{font-size:.56rem;padding:2px 8px;border-radius:20px;font-weight:700;flex-shrink:0}
  .bg{background:#4CAF5015;color:#4CAF50}.br{background:#ef444415;color:#ef4444}.bo{background:#C8A96A15;color:#C8A96A}.bb{background:#4DA6FF15;color:#4DA6FF}
  .srch{width:100%;padding:10px 13px;background:#111;border:1px solid #1a1a1a;border-radius:12px;color:#E5D3B3;font-family:inherit;font-size:.83rem;outline:none;transition:border-color .2s;margin-bottom:10px}
  .srch:focus{border-color:#C8A96A33}
  .delbtn{padding:5px 9px;border-radius:7px;background:none;border:1px solid #252525;color:#3a3a3a;cursor:pointer;font-size:.68rem;font-family:inherit;transition:all .2s;margin-top:5px}
  .delbtn:hover{border-color:#ef444433;color:#ef4444}
`;

export default function AdminPage(){
  const[authed,setAuthed]=useState(false);
  const[pass,setPass]=useState("");
  const[authErr,setAuthErr]=useState("");
  const[menu,setMenu]=useState(()=>lsGet("admin_menu",DEFAULT_MENU));
  const[featured,setFeatured]=useState(()=>lsGet("admin_featured",DEFAULT_FEATURED));
  const[tab,setTab]=useState("menu");
  const[search,setSearch]=useState("");
  const[editing,setEditing]=useState(null);
  const[form,setForm]=useState({});
  const[imgP,setImgP]=useState(null);
  const[imgF,setImgF]=useState(null);
  const[confirmDlg,setConfirmDlg]=useState(null);
  const[toast,setToast]=useState(null);
  const[history,setHistory]=useState(()=>lsGet("admin_history",[]));
  const[dragId,setDragId]=useState(null);
  const[tick,setTick]=useState(0);
  const[siteName,setSiteName]=useState(()=>lsGet("site_name","بيتزا خانم"));
  const[slogan,setSlogan]=useState(()=>lsGet("site_slogan","كُل لتعيش · وعِش لأجل البيتزا"));
  const[wapp,setWapp]=useState(()=>lsGet("site_whatsapp","963998950904"));
  const pRef=useRef(),fRef=useRef(),impRef=useRef();

  function toast_(m,t="ok"){setToast({m,t});setTimeout(()=>setToast(null),2700);}
  function confirm_(msg,onOk){setConfirmDlg({msg,onOk});}
  function log(a){const e={a,t:new Date().toLocaleString("ar-EG")};const u=[e,...history].slice(0,40);setHistory(u);lsSet("admin_history",u);}
  function readFile(file,cb){if(!file)return;const r=new FileReader();r.onload=ev=>cb(ev.target.result);r.readAsDataURL(file);}

  function login(e){e.preventDefault();if(pass===ADMIN_PASSWORD){setAuthed(true);setAuthErr("");}else setAuthErr("كلمة المرور غلط");}

  function openEdit(type,id){
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id);if(!item)return;
    setForm({...item,_sizes:item.sizes?item.sizes.map(s=>({...s})):undefined});
    setImgP(getImg(item.id,"pizza"));
    setImgF(getImg(item.id,"flavor"));
    setEditing({type,id});
  }

  function saveEdit(){
    const saved={...form};
    if(saved._sizes){saved.sizes=saved._sizes;delete saved._sizes;}
    setImg(saved.id,"pizza",imgP);
    setImg(saved.id,"flavor",imgF);
    setTick(t=>t+1);
    if(editing.type==="menu"){const u=menu.map(it=>it.id===editing.id?saved:it);setMenu(u);lsSet("admin_menu",u);}
    else{const u=featured.map(it=>it.id===editing.id?saved:it);setFeatured(u);lsSet("admin_featured",u);}
    log(`تعديل: ${saved.label}`);
    setEditing(null);
    toast_("✓ تم الحفظ");
  }

  function toggleCS(id){
    const u=menu.map(it=>it.id===id?{...it,comingSoon:!it.comingSoon}:it);
    setMenu(u);lsSet("admin_menu",u);
    const it=u.find(x=>x.id===id);
    log(`تغيير حالة: ${it.label}`);
    toast_(it.comingSoon?"⏳ أُخفي":"✅ ظهر",it.comingSoon?"warn":"ok");
  }

  function addItem(){
    const id=Date.now().toString();
    const n={id,label:"صنف جديد",details:"",comingSoon:false};
    const u=[...menu,n];setMenu(u);lsSet("admin_menu",u);
    log("إضافة صنف");openEdit("menu",id);
  }

  function dupItem(type,id){
    const list=type==="menu"?menu:featured;
    const src=list.find(x=>x.id===id);if(!src)return;
    const nid=Date.now().toString();
    const copy={...src,id:nid,label:src.label+" (نسخة)"};
    const pi=getImg(src.id,"pizza");const fi=getImg(src.id,"flavor");
    if(pi)setImg(nid,"pizza",pi);if(fi)setImg(nid,"flavor",fi);
    if(type==="menu"){const u=[...menu,copy];setMenu(u);lsSet("admin_menu",u);}
    else{const u=[...featured,copy];setFeatured(u);lsSet("admin_featured",u);}
    log(`نسخ: ${src.label}`);toast_("📋 تم نسخ الصنف");setTick(t=>t+1);
  }

  /* ✅ الحذف باستخدام id ومع custom confirm بدل window.confirm */
  function deleteItem(type,id){
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id);if(!item)return;
    confirm_(`تحذف "${item.label}"؟`,()=>{
      if(type==="menu"){const u=menu.filter(x=>x.id!==id);setMenu(u);lsSet("admin_menu",u);}
      else{const u=featured.filter(x=>x.id!==id);setFeatured(u);lsSet("admin_featured",u);}
      setImg(id,"pizza",null);setImg(id,"flavor",null);
      log(`حذف: ${item.label}`);toast_("🗑 تم الحذف","warn");
    });
  }

  function move(type,id,dir){
    const arr=type==="menu"?[...menu]:[...featured];
    const i=arr.findIndex(x=>x.id===id);const j=i+dir;
    if(j<0||j>=arr.length)return;
    [arr[i],arr[j]]=[arr[j],arr[i]];
    if(type==="menu"){setMenu(arr);lsSet("admin_menu",arr);}
    else{setFeatured(arr);lsSet("admin_featured",arr);}
  }
  function onDragStart(id){setDragId(id);}
  function onDragOver(e,type,id){
    e.preventDefault();if(!dragId||dragId===id)return;
    const arr=type==="menu"?[...menu]:[...featured];
    const fi=arr.findIndex(x=>x.id===dragId);const ti=arr.findIndex(x=>x.id===id);
    if(fi<0||ti<0)return;[arr[fi],arr[ti]]=[arr[ti],arr[fi]];
    if(type==="menu"){setMenu(arr);lsSet("admin_menu",arr);}
    else{setFeatured(arr);lsSet("admin_featured",arr);}
    setDragId(id);
  }
  function onDragEnd(){setDragId(null);}

  function resetAll(){
    confirm_("إرجاع كل البيانات للافتراضية؟",()=>{
      setMenu(DEFAULT_MENU);lsSet("admin_menu",DEFAULT_MENU);
      setFeatured(DEFAULT_FEATURED);lsSet("admin_featured",DEFAULT_FEATURED);
      log("إرجاع للافتراضي");toast_("↺ تم الإرجاع","warn");
    });
  }

  function exportData(){
    const d=JSON.stringify({menu,featured,exportedAt:new Date().toISOString()},null,2);
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([d],{type:"application/json"})),download:"pizzakhanum.json"});
    a.click();toast_("📦 تم التصدير");
  }
  function importData(e){
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=ev=>{try{const p=JSON.parse(ev.target.result);if(p.menu){setMenu(p.menu);lsSet("admin_menu",p.menu);}if(p.featured){setFeatured(p.featured);lsSet("admin_featured",p.featured);}log("استيراد");toast_("📥 تم الاستيراد");}catch{toast_("⚠ ملف غير صالح","err");}};
    r.readAsText(file);e.target.value="";
  }
  function saveSettings(){lsSet("site_name",siteName);lsSet("site_slogan",slogan);lsSet("site_whatsapp",wapp);log("تعديل الإعدادات");toast_("⚙️ تم الحفظ");}

  const src=tab==="menu"?menu:featured;
  const displayItems=
    tab==="menu"&&search==="__v"?menu.filter(p=>!p.comingSoon):
    tab==="menu"&&search==="__h"?menu.filter(p=>p.comingSoon):
    src.filter(it=>!search||it.label.includes(search)||(it.details||it.desc||"").includes(search));

  /* ── LOGIN ── */
  if(!authed)return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      <div className="au" style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:20,padding:"34px 28px",width:"min(340px,95vw)",textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:10}}>🍕</div>
        <h1 style={{color:"#C8A96A",fontSize:"1.2rem",marginBottom:4}}>بيتزا خانم</h1>
        <p style={{fontSize:".7rem",color:"#333",marginBottom:24}}>لوحة التحكم — أدمن فقط</p>
        {authErr&&<div style={{background:"#1a0808",border:"1px solid #ef444422",borderRadius:9,padding:"8px 12px",marginBottom:14,fontSize:".8rem",color:"#ef4444"}}>⚠ {authErr}</div>}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} className="ai" required/>
          <button type="submit" style={{width:"100%",marginTop:14,padding:"12px",background:"linear-gradient(135deg,#C8A96A,#8B6B4A)",border:"none",borderRadius:11,fontSize:".9rem",fontWeight:700,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit"}}>دخول →</button>
        </form>
      </div>
    </div>
  );

  /* ── CONFIRM DIALOG ── */
  const ConfirmDlg=confirmDlg&&(
    <div className="mbg" style={{zIndex:1100}} onClick={e=>{if(e.target===e.currentTarget)setConfirmDlg(null);}}>
      <div className="cbox au">
        <div style={{fontSize:"2rem",marginBottom:10}}>🗑</div>
        <p style={{color:"#E5D3B3",fontSize:".88rem",marginBottom:20,lineHeight:1.6}}>{confirmDlg.msg}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={()=>{confirmDlg.onOk();setConfirmDlg(null);}} style={{padding:"10px 22px",background:"#ef4444",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:".85rem",fontWeight:700}}>تأكيد الحذف</button>
          <button onClick={()=>setConfirmDlg(null)} style={{padding:"10px 22px",background:"#1e1e1e",border:"1px solid #252525",borderRadius:10,color:"#666",cursor:"pointer",fontFamily:"inherit",fontSize:".85rem"}}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ── EDIT MODAL ── */
  const EditModal=editing&&(
    <div className="mbg" onClick={e=>{if(e.target===e.currentTarget)setEditing(null);}}>
      <div className="mbox au">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <h2 style={{color:"#C8A96A",fontSize:".95rem"}}>✏️ {form.label}</h2>
          <button onClick={()=>setEditing(null)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"1.4rem",lineHeight:1}}>×</button>
        </div>

        {/* ═ IMAGES ═ */}
        <span className="sl">الصور</span>
        <div style={{display:"grid",gridTemplateColumns:editing.type==="menu"?"1fr 1fr":"1fr",gap:12,marginTop:6}}>
          {/* صورة الكارد */}
          <div>
            <p style={{fontSize:".64rem",color:"#555",marginBottom:3}}>📷 صورة الكارد</p>
            <div className="imgzone" onClick={()=>pRef.current.click()}>
              {imgP&&<img src={imgP} alt=""/>}
              <div className="ov"><span style={{fontSize:"1.3rem"}}>📷</span><span style={{fontSize:".66rem",color:"#ddd",marginTop:3}}>تغيير</span></div>
              {!imgP&&<><span style={{fontSize:"1.6rem",opacity:.2}}>🖼</span><span style={{fontSize:".7rem",color:"#2a2a2a",marginTop:5}}>اضغط لرفع صورة</span></>}
            </div>
            <input ref={pRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile(e.target.files[0],setImgP)}/>
            {imgP&&<button className="delbtn" onClick={()=>setImgP(null)}>× حذف</button>}
          </div>

          {/* صورة النكهة — للقائمة فقط */}
          {editing.type==="menu"&&(
            <div>
              <p style={{fontSize:".64rem",color:"#555",marginBottom:3}}>🎨 صورة داخل النكهات</p>
              <div className="imgzone" onClick={()=>fRef.current.click()}>
                {imgF&&<img src={imgF} alt=""/>}
                <div className="ov"><span style={{fontSize:"1.3rem"}}>🎨</span><span style={{fontSize:".66rem",color:"#ddd",marginTop:3}}>تغيير</span></div>
                {!imgF&&<><span style={{fontSize:"1.6rem",opacity:.2}}>🎨</span><span style={{fontSize:".7rem",color:"#2a2a2a",marginTop:5}}>صورة النكهة</span></>}
              </div>
              <input ref={fRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>readFile(e.target.files[0],setImgF)}/>
              {imgF&&<button className="delbtn" onClick={()=>setImgF(null)}>× حذف</button>}
            </div>
          )}
        </div>

        {/* اسم */}
        <span className="sl">اسم الصنف</span>
        <input className="ai" value={form.label||""} onChange={e=>setForm(p=>({...p,label:e.target.value}))}/>

        {/* قائمة البيتزا */}
        {editing.type==="menu"&&<>
          <span className="sl">الوصف والمكونات</span>
          <textarea className="ai" rows={4} style={{resize:"vertical"}} value={form.details||""} onChange={e=>setForm(p=>({...p,details:e.target.value}))} placeholder="المكونات..."/>
          <span className="sl">الحالة</span>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <button className={`pill${!form.comingSoon?" on":""}`} onClick={()=>setForm(p=>({...p,comingSoon:false}))}>✅ ظاهر</button>
            <button className={`pill${form.comingSoon?" off":""}`} onClick={()=>setForm(p=>({...p,comingSoon:true}))}>⏳ قريباً</button>
          </div>
        </>}

        {/* العروض المميزة */}
        {editing.type==="featured"&&<>
          <span className="sl">الوصف</span>
          <textarea className="ai" rows={3} style={{resize:"vertical"}} value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/>
          {form.priceOld!==null&&form.priceOld!==undefined&&<>
            <span className="sl">الأسعار</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:5}}>
              <div><p style={{fontSize:".63rem",color:"#333",marginBottom:3}}>القديم (ل.س)</p><input className="ai" style={{marginTop:0}} value={form.priceOld||""} onChange={e=>setForm(p=>({...p,priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||p.numericPrice}))} placeholder="150,000"/></div>
              <div><p style={{fontSize:".63rem",color:"#333",marginBottom:3}}>الجديد (ل.ج)</p><input className="ai" style={{marginTop:0}} value={form.priceNew||""} onChange={e=>setForm(p=>({...p,priceNew:e.target.value}))} placeholder="1,500"/></div>
            </div>
          </>}
          {form._sizes&&<>
            <span className="sl">أحجام بيتزا خانم</span>
            {form._sizes.map((sz,si)=>(
              <div key={sz.id} style={{background:"#111",border:"1px solid #1a1a1a",borderRadius:11,padding:12,marginTop:7}}>
                <p style={{fontSize:".7rem",color:"#C8A96A66",marginBottom:8,fontWeight:700}}>{sz.label}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div><p style={{fontSize:".62rem",color:"#333",marginBottom:3}}>القديم</p><input className="ai" style={{marginTop:0}} value={sz.priceOld||""} onChange={e=>setForm(p=>{const s=[...p._sizes];s[si]={...s[si],priceOld:e.target.value,numericPrice:parseInt(e.target.value.replace(/,/g,""))||s[si].numericPrice};return{...p,_sizes:s};})}/></div>
                  <div><p style={{fontSize:".62rem",color:"#333",marginBottom:3}}>الجديد</p><input className="ai" style={{marginTop:0}} value={sz.priceNew||""} onChange={e=>setForm(p=>{const s=[...p._sizes];s[si]={...s[si],priceNew:e.target.value};return{...p,_sizes:s};})}/></div>
                </div>
              </div>
            ))}
          </>}
        </>}

        {/* معاينة */}
        <div style={{background:"#0f0f0f",border:"1px solid #161616",borderRadius:12,padding:13,marginTop:15,overflow:"hidden"}}>
          <p style={{fontSize:".57rem",color:"#1e1e1e",marginBottom:7,letterSpacing:"2px"}}>معاينة مباشرة</p>
          {imgP&&<img src={imgP} alt="" style={{width:"100%",height:96,objectFit:"cover",borderRadius:8,marginBottom:8}}/>}
          <p style={{fontWeight:700,color:"#E5D3B3",fontSize:".87rem",marginBottom:3}}>{form.label||"—"}</p>
          <p style={{fontSize:".69rem",color:"#444",lineHeight:1.5}}>{form.details||form.desc||"—"}</p>
          {(form.priceOld||form.priceNew)&&<p style={{fontSize:".74rem",color:"#C8A96A",marginTop:5,fontWeight:700}}>{form.priceOld} ل.س {form.priceNew&&`/ ${form.priceNew} ل.ج`}</p>}
        </div>

        <div style={{display:"flex",gap:10,marginTop:15}}>
          <button onClick={saveEdit} style={{flex:1,padding:"12px",background:"#C8A96A",border:"none",borderRadius:10,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit",fontSize:".87rem",fontWeight:700}}>💾 حفظ</button>
          <button onClick={()=>setEditing(null)} style={{padding:"12px 16px",background:"#1a1a1a",border:"none",borderRadius:10,color:"#555",cursor:"pointer",fontFamily:"inherit"}}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ════════ DASHBOARD ════════ */
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#E5D3B3",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      {ConfirmDlg}
      {EditModal}

      {toast&&<div className="at" style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:toast.t==="err"?"#1a0808":toast.t==="warn"?"#1a1408":"#0d1a0d",border:`1px solid ${toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50"}`,borderRadius:12,padding:"10px 20px",zIndex:2000,color:toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50",fontSize:".81rem",fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 8px 28px #00000099"}}>{toast.m}</div>}

      {/* Header */}
      <div style={{background:"#111",borderBottom:"1px solid #161616",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:"1.4rem"}}>🍕</span>
          <div><h1 style={{fontSize:".9rem",fontWeight:900,color:"#C8A96A"}}>بيتزا خانم</h1><p style={{fontSize:".57rem",color:"#252525"}}>لوحة التحكم</p></div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button className="ib" onClick={exportData} style={{background:"#141414",border:"1px solid #1e1e1e",color:"#555"}}>📦</button>
          <label className="ib" style={{background:"#141414",border:"1px solid #1e1e1e",color:"#555",cursor:"pointer"}}>📥<input ref={impRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/></label>
          <button className="ib" onClick={resetAll} style={{background:"#1a1a0a",border:"1px solid #C8A96A1a",color:"#5a4020"}}>↺</button>
          <button className="ib" onClick={()=>setAuthed(false)} style={{background:"#1a1010",border:"1px solid #ef44441a",color:"#444"}}>خروج</button>
        </div>
      </div>

      <div style={{padding:"16px 15px 60px",maxWidth:720,margin:"0 auto"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
          {[{l:"القائمة",v:menu.length,c:"#C8A96A",i:"🍕"},{l:"ظاهر",v:menu.filter(p=>!p.comingSoon).length,c:"#4CAF50",i:"✅"},{l:"قريباً",v:menu.filter(p=>p.comingSoon).length,c:"#ef4444",i:"⏳"},{l:"المميزة",v:featured.length,c:"#4DA6FF",i:"⭐"}].map(s=>(
            <div key={s.l} className="stat"><div style={{fontSize:".95rem",marginBottom:2}}>{s.i}</div><div style={{fontSize:"1.4rem",fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:".58rem",color:"#2e2e2e",marginTop:2}}>{s.l}</div></div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {[["menu","🍕 القائمة"],["featured","⭐ المميزة"],["history","📋 السجل"],["settings","⚙️ الإعدادات"]].map(([k,l])=>(
            <button key={k} className={`tb${tab===k?" on":""}`} onClick={()=>{setTab(k);setSearch("");}}>{l}</button>
          ))}
          {tab==="menu"&&<button className="ib" onClick={addItem} style={{background:"#0d1a0d",border:"1px solid #4CAF5022",color:"#4CAF50",marginRight:"auto"}}>+ إضافة</button>}
        </div>

        {/* MENU / FEATURED */}
        {(tab==="menu"||tab==="featured")&&<>
          <input className="srch" placeholder="🔍  ابحث..." value={search==="__v"||search==="__h"?"":search} onChange={e=>setSearch(e.target.value)}/>
          {tab==="menu"&&(
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {[["","الكل",menu.length],["__v","ظاهر",menu.filter(p=>!p.comingSoon).length],["__h","قريباً",menu.filter(p=>p.comingSoon).length]].map(([q,l,c])=>(
                <button key={q} onClick={()=>setSearch(q)} style={{padding:"4px 10px",background:search===q?"#C8A96A1a":"#111",border:`1px solid ${search===q?"#C8A96A33":"#1a1a1a"}`,borderRadius:20,color:search===q?"#C8A96A":"#2e2e2e",cursor:"pointer",fontFamily:"inherit",fontSize:".69rem"}}>{l} ({c})</button>
              ))}
            </div>
          )}
          <p style={{fontSize:".58rem",color:"#1a1a1a",marginBottom:8}}>⠿ اسحب لترتيب · ▲▼ تحريك</p>
          {displayItems.length===0&&<div style={{textAlign:"center",padding:"28px",color:"#1e1e1e",fontSize:".82rem"}}>لا توجد نتائج</div>}
          {displayItems.map(item=>{
            const pt=getImg(item.id,"pizza"); void tick;
            const hf=!!getImg(item.id,"flavor");
            return(
              <div key={item.id} className="row af" draggable
                onDragStart={()=>onDragStart(item.id)}
                onDragOver={e=>onDragOver(e,tab,item.id)}
                onDragEnd={onDragEnd}
                style={{borderColor:dragId===item.id?"#C8A96A33":""}}>
                <span style={{color:"#1e1e1e",fontSize:"1rem",cursor:"grab",userSelect:"none",padding:"3px 2px"}}>⠿</span>
                {pt?<img src={pt} alt="" className="thumb"/>:<div className="thumbph">🍕</div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,color:"#E5D3B3",fontSize:".85rem"}}>{item.label}</span>
                    {tab==="menu"&&(item.comingSoon?<span className="badge br">قريباً</span>:<span className="badge bg">ظاهر</span>)}
                    {tab==="featured"&&item.priceOld&&<span className="badge bo">{item.priceOld}</span>}
                    {tab==="featured"&&item.sizes&&<span className="badge bb">أحجام</span>}
                    {pt&&<span style={{fontSize:".5rem",color:"#4DA6FF44"}}>📷</span>}
                    {hf&&<span style={{fontSize:".5rem",color:"#C8A96A44"}}>🎨</span>}
                  </div>
                  <p style={{fontSize:".66rem",color:"#222",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.details||item.desc||"—"}</p>
                </div>
                <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"center"}}>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    <button onClick={()=>move(tab,item.id,-1)} style={{background:"none",border:"none",color:"#1e1e1e",cursor:"pointer",fontSize:".68rem",lineHeight:1,padding:"2px 4px"}}>▲</button>
                    <button onClick={()=>move(tab,item.id,+1)} style={{background:"none",border:"none",color:"#1e1e1e",cursor:"pointer",fontSize:".68rem",lineHeight:1,padding:"2px 4px"}}>▼</button>
                  </div>
                  {tab==="menu"&&(
                    <button onClick={()=>toggleCS(item.id)} style={{padding:"5px 8px",background:item.comingSoon?"#1a0d0d":"#0d1a0d",border:`1px solid ${item.comingSoon?"#ef444422":"#4CAF5022"}`,borderRadius:7,color:item.comingSoon?"#ef4444":"#4CAF50",cursor:"pointer",fontSize:".69rem",fontWeight:700,fontFamily:"inherit"}}>
                      {item.comingSoon?"إظهار":"إخفاء"}
                    </button>
                  )}
                  <button className="ib" onClick={()=>openEdit(tab,item.id)} style={{background:"#1a1a1a",border:"1px solid #222",color:"#C8A96A"}}>✏️</button>
                  <button className="ib" onClick={()=>dupItem(tab,item.id)} style={{background:"#111",border:"1px solid #1a1a1a",color:"#2e2e2e"}} title="نسخ">📋</button>
                  <button className="ib" onClick={()=>deleteItem(tab,item.id)} style={{background:"#1a0d0d",border:"1px solid #ef444422",color:"#ef4444"}}>🗑</button>
                </div>
              </div>
            );
          })}
        </>}

        {/* HISTORY */}
        {tab==="history"&&(
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:14,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
              <h2 style={{fontSize:".87rem",color:"#C8A96A"}}>📋 سجل التعديلات</h2>
              <button onClick={()=>{setHistory([]);lsSet("admin_history",[]);}} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:8,color:"#2e2e2e",cursor:"pointer",padding:"4px 9px",fontSize:".68rem",fontFamily:"inherit"}}>مسح</button>
            </div>
            {history.length===0?<p style={{color:"#1e1e1e",fontSize:".79rem",textAlign:"center",padding:"16px 0"}}>لا يوجد سجل بعد</p>:history.map((h,i)=>(<div key={i} className="hrow"><span>{h.a}</span><span style={{color:"#1e1e1e",flexShrink:0}}>{h.t}</span></div>))}
          </div>
        )}

        {/* SETTINGS */}
        {tab==="settings"&&(
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:14,padding:20}}>
            <h2 style={{fontSize:".87rem",color:"#C8A96A",marginBottom:16}}>⚙️ إعدادات الموقع</h2>
            <span className="sl">اسم المطعم</span><input className="ai" value={siteName} onChange={e=>setSiteName(e.target.value)}/>
            <span className="sl">الشعار</span><input className="ai" value={slogan} onChange={e=>setSlogan(e.target.value)}/>
            <span className="sl">رقم واتساب (بدون +)</span><input className="ai" value={wapp} onChange={e=>setWapp(e.target.value)} dir="ltr"/>
            <button onClick={saveSettings} style={{marginTop:18,width:"100%",padding:"12px",background:"#C8A96A",border:"none",borderRadius:11,color:"#0f0f0f",cursor:"pointer",fontFamily:"inherit",fontSize:".87rem",fontWeight:700}}>💾 حفظ الإعدادات</button>
            <div style={{marginTop:14,background:"#0f0f0f",border:"1px solid #161616",borderRadius:11,padding:14}}>
              <p style={{fontSize:".65rem",color:"#1e1e1e",marginBottom:10}}>⚠️ منطقة خطر</p>
              <button onClick={resetAll} style={{width:"100%",padding:"10px",background:"#1a0808",border:"1px solid #ef444422",borderRadius:9,color:"#ef4444",cursor:"pointer",fontFamily:"inherit",fontSize:".79rem",fontWeight:700}}>↺ إرجاع كل البيانات للافتراضية</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
