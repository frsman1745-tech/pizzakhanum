// src/Admin.jsx — النسخة الكاملة v3
// ✅ تحرير كامل للمميزة (أحجام، شرائح، أعمدة، إضافات، أسعار)
// ✅ إدارة أقسام القائمة (بيتزا، مشروبات...) مع Emoji وترتيب
// ✅ كل عنصر يُنسَب لقسم معين
// ✅ جميع useState قبل useEffect

import { useState, useRef, useEffect, useCallback } from "react";

/* ══ HELPERS ════════════════════════════════════════════════════════════════ */
const lsGet = (k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{return d;} };
const lsSet = (k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} };
const uid   = ()=>Math.random().toString(36).slice(2,8);
const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD||"pizza2024";

async function uploadToCloudinary(file){
  const cloud=import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset=import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  if(!cloud||!preset) throw new Error("أضف VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في .env");
  const fd=new FormData();
  fd.append("file",file); fd.append("upload_preset",preset); fd.append("folder","pizza-khanum");
  const res=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`,{method:"POST",body:fd});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error?.message||`Cloudinary ${res.status}`);}
  return (await res.json()).secure_url;
}

/* ══ CSS ════════════════════════════════════════════════════════════════════ */
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-thumb{background:#C8A96A22;border-radius:2px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn{0%{opacity:0;transform:scale(.91)}60%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  .au{animation:fadeUp .32s ease forwards}
  .apu{animation:popIn .28s ease forwards}
  .ai{display:block;width:100%;padding:9px 12px;background:#141414;border:1px solid #252525;border-radius:10px;color:#E5D3B3;font-size:.83rem;font-family:inherit;outline:none;transition:border-color .18s,box-shadow .18s}
  .ai:focus{border-color:#C8A96A;box-shadow:0 0 0 3px #C8A96A0e}
  .ai.sm{padding:7px 10px;font-size:.78rem}
  textarea.ai{resize:vertical;min-height:64px}
  .tb{padding:6px 13px;border-radius:20px;border:1px solid #1a1a1a;background:#141414;color:#2e2e2e;cursor:pointer;font-family:inherit;font-size:.76rem;font-weight:600;transition:all .18s;white-space:nowrap}
  .tb:hover{color:#C8A96A44;border-color:#C8A96A1a}
  .tb.on{background:#C8A96A1a;border-color:#C8A96A33;color:#C8A96A}
  .ib{padding:6px 9px;border-radius:8px;cursor:pointer;font-family:inherit;font-size:.76rem;border:1px solid #1e1e1e;background:#141414;transition:all .15s}
  .ib:hover{border-color:#C8A96A22;background:#1a1408}
  .ib:disabled{opacity:.3;cursor:not-allowed}
  .bp{padding:10px 18px;background:#C8A96A;border:none;border-radius:10px;color:#0f0f0f;cursor:pointer;font-family:inherit;font-size:.84rem;font-weight:700;transition:background .18s,transform .1s}
  .bp:hover{background:#b8956a;transform:translateY(-1px)}
  .bp:disabled{opacity:.45;cursor:not-allowed;transform:none}
  .bd{padding:8px 14px;background:#1a0808;border:1px solid #ef444422;border-radius:9px;color:#ef4444;cursor:pointer;font-family:inherit;font-size:.78rem;transition:all .15s}
  .bd:hover{background:#2a0808}
  .bg_{padding:8px 14px;background:transparent;border:1px solid #252525;border-radius:9px;color:#555;cursor:pointer;font-family:inherit;font-size:.8rem}
  .bg_:hover{background:#1a1a1a}
  .stat{background:#141414;border:1px solid #1a1a1a;border-radius:12px;padding:10px 7px;text-align:center}
  .row{background:#131313;border:1px solid #1a1a1a;border-radius:12px;padding:10px 11px;display:flex;align-items:center;gap:9px;margin-bottom:7px;transition:border-color .18s}
  .row:hover{border-color:#C8A96A1a}
  .row.dragging{border-color:#C8A96A44;opacity:.7}
  .sl{display:block;font-size:.6rem;color:#C8A96A55;letter-spacing:2px;margin-top:14px;margin-bottom:5px;text-transform:uppercase}
  .badge{font-size:.5rem;padding:2px 6px;border-radius:8px;font-weight:700}
  .bgg{background:#0d1a0d;color:#4CAF50;border:1px solid #4CAF5022}
  .brr{background:#1a0d0d;color:#ef4444;border:1px solid #ef444422}
  .boo{background:#1a1408;color:#C8A96A;border:1px solid #C8A96A22}
  .bbb{background:#06111f;color:#4DA6FF;border:1px solid #4DA6FF22}
  .pill{flex:1;padding:7px;border-radius:9px;cursor:pointer;font-family:inherit;font-size:.74rem;font-weight:600;border:1px solid #1e1e1e;background:#141414;color:#444;transition:all .18s}
  .pill.on{background:#0d1a0d;border-color:#4CAF5033;color:#4CAF50}
  .pill.off{background:#1a0d0d;border-color:#ef444433;color:#ef4444}
  .imgzone{width:100%;aspect-ratio:16/9;border-radius:11px;border:1.5px dashed #252525;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;position:relative;transition:border-color .18s}
  .imgzone:hover{border-color:#C8A96A44}
  .imgzone img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .ov{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;opacity:0;transition:opacity .18s}
  .imgzone:hover .ov{opacity:1}
  .upl-ov{position:absolute;inset:0;background:rgba(0,0,0,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:11px}
  .spinner{width:20px;height:20px;border:2px solid #C8A96A33;border-top-color:#C8A96A;border-radius:50%;animation:spin .6s linear infinite}
  .thumb{width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0}
  .thumbph{width:42px;height:42px;border-radius:8px;background:#1a1008;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;border:1px solid #1e1e1e}
  .mbg{position:fixed;inset:0;background:rgba(0,0,0,.78);display:flex;align-items:flex-end;justify-content:center;z-index:1000;backdrop-filter:blur(5px)}
  .mbox{background:#161616;border:1px solid #222;border-radius:22px 22px 0 0;width:min(600px,100vw);max-height:94vh;overflow-y:auto;padding:22px 18px 40px}
  .mbox-center{background:#161616;border:1px solid #222;border-radius:18px;width:min(380px,94vw);padding:24px 20px}
  .eg{background:#111;border:1px solid #1a1a1a;border-radius:12px;padding:13px;margin-top:8px}
  .eg-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
  .eo{display:flex;align-items:center;gap:7px;background:#161616;border:1px solid #1e1e1e;border-radius:9px;padding:7px 9px;margin-bottom:6px}
  .handle{color:#2a2a2a;cursor:grab;user-select:none;font-size:.9rem;padding:2px 4px;flex-shrink:0}
  .handle:active{cursor:grabbing}
  .srch{display:block;width:100%;padding:9px 13px;margin-bottom:9px;background:#141414;border:1px solid #1a1a1a;border-radius:10px;color:#E5D3B3;font-size:.83rem;font-family:inherit;outline:none;transition:border-color .18s}
  .srch:focus{border-color:#C8A96A33}
  .hrow{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #161616;font-size:.7rem;color:#8B6B4A}
  .sec-card{background:#141414;border:1px solid #1a1a1a;border-radius:11px;padding:11px 12px;margin-bottom:7px;display:flex;align-items:center;gap:10px}
  .chip{padding:3px 9px;border-radius:20px;font-size:.68rem;cursor:pointer;border:1px solid #1a1a1a;background:#111;color:#444;font-family:inherit;transition:all .15s;white-space:nowrap}
  .chip.on{background:#C8A96A1a;border-color:#C8A96A33;color:#C8A96A}
`;

/* ══ ADMIN ══════════════════════════════════════════════════════════════════ */
export default function Admin(){

  /* ── AUTH ── */
  const [authed,  setAuthed]  = useState(()=>lsGet("admin_authed",false));
  const [pass,    setPass]    = useState("");
  const [authErr, setAuthErr] = useState("");

  /* ── DATA ── */
  const [menu,     setMenu]     = useState([]);
  const [featured, setFeatured] = useState([]);
  const [sections, setSections] = useState([]); // أقسام القائمة
  const [loading,  setLoading]  = useState(true);
  const [tick,     setTick]     = useState(0);  // ← قبل useEffect

  /* ── UI ── */
  const [tab,    setTab]    = useState("menu");
  const [search, setSearch] = useState("");
  const [secFilter, setSecFilter] = useState(""); // فلتر القسم في القائمة

  /* ── MODAL ── */
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState({});
  const [imgP,       setImgP]       = useState(null);
  const [imgF,       setImgF]       = useState(null);
  const [uploadingP, setUploadingP] = useState(false);
  const [uploadingF, setUploadingF] = useState(false);
  const [saving,     setSaving]     = useState(false);

  /* ── SECTIONS MODAL ── */
  const [secModal,    setSecModal]    = useState(false);
  const [secForm,     setSecForm]     = useState([]);
  const [savingSec,   setSavingSec]   = useState(false);

  /* ── MISC ── */
  const [confirmDlg, setConfirmDlg] = useState(null);
  const [toast,      setToast]      = useState(null);
  const [history,    setHistory]    = useState(()=>lsGet("admin_history",[]));
  const [dragId,     setDragId]     = useState(null);
  const [siteName,   setSiteName]   = useState(()=>lsGet("site_name","بيتزا خانم"));
  const [slogan,     setSlogan]     = useState(()=>lsGet("site_slogan","كُل لتعيش · وعِش لأجل البيتزا"));
  const [wapp,       setWapp]       = useState(()=>lsGet("site_whatsapp","963998950904"));

  const pRef=useRef(); const fRef=useRef(); const impRef=useRef();

  /* ══ FETCH ══════════════════════════════════════════════════════════════ */
  const fetchData = useCallback(async()=>{
    if(!authed){setLoading(false);return;}
    setLoading(true);
    try{
      const res=await fetch("/api/pizzas");
      if(!res.ok) throw new Error("HTTP "+res.status);
      const {data}=await res.json();
      const all=data||[];
      setMenu(    all.filter(i=>i.type==="menu"    ||i.category==="menu"));
      setFeatured(all.filter(i=>i.type==="featured"||i.category==="featured"));
      // الأقسام محفوظة في وثيقة category=section واحدة
      const secDoc=all.find(i=>i.type==="section"||i.category==="section");
      setSections(secDoc?.sections||[]);
    }catch(e){toast_("❌ "+e.message,"err");}
    finally{setLoading(false);}
  },[authed]); // eslint-disable-line

  useEffect(()=>{fetchData();},[fetchData,tick]);

  /* ══ HELPERS ════════════════════════════════════════════════════════════ */
  function toast_(m,t="ok"){setToast({m,t});setTimeout(()=>setToast(null),3200);}
  function log(a){const e={a,t:new Date().toLocaleTimeString("ar-EG")};setHistory(p=>{const n=[e,...p].slice(0,60);lsSet("admin_history",n);return n;});}
  function confirm_(msg,onOk){setConfirmDlg({msg,onOk});}

  /* ══ AUTH ════════════════════════════════════════════════════════════════ */
  function login(e){
    e.preventDefault();
    if(pass===ADMIN_PWD){setAuthed(true);lsSet("admin_authed",true);setAuthErr("");}
    else setAuthErr("كلمة المرور غير صحيحة");
  }

  /* ══ SECTIONS (أقسام القائمة) ═══════════════════════════════════════════ */
  function openSecModal(){
    setSecForm(sections.map(s=>({...s})));
    setSecModal(true);
  }
  function addSec(){setSecForm(p=>[...p,{id:uid(),label:"قسم جديد",emoji:"🍕",sortOrder:p.length}]);}
  function removeSec(id){setSecForm(p=>p.filter(s=>s.id!==id));}
  function updateSec(id,key,val){setSecForm(p=>p.map(s=>s.id===id?{...s,[key]:val}:s));}
  function moveSec(id,dir){setSecForm(p=>{const a=[...p];const i=a.findIndex(s=>s.id===id);const t=i+dir;if(t<0||t>=a.length)return p;[a[i],a[t]]=[a[t],a[i]];return a;});}

  async function saveSections(){
    setSavingSec(true);
    try{
      // نحفظ الأقسام في وثيقة واحدة category=section
      const existing=await fetch("/api/pizzas?category=section").then(r=>r.json());
      const secDoc=(existing.data||[])[0];
      const payload={label:"__sections__",type:"section",sections:secForm.map((s,i)=>({...s,sortOrder:i}))};
      if(secDoc){
        await fetch(`/api/pizzas/${secDoc.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      } else {
        await fetch("/api/pizzas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      }
      toast_("✅ تم حفظ الأقسام");
      log("تعديل أقسام القائمة");
      setSecModal(false);
      setTick(t=>t+1);
    }catch(e){toast_("❌ "+e.message,"err");}
    finally{setSavingSec(false);}
  }

  /* ══ EXTRAS HELPERS ════════════════════════════════════════════════════ */
  function addExtraGroup(){
    const g={id:uid(),name:"مجموعة جديدة",type:"single",required:false,sortOrder:(form.extras||[]).length,options:[]};
    setForm(p=>({...p,extras:[...(p.extras||[]),g]}));
  }
  function removeExtraGroup(gid){setForm(p=>({...p,extras:(p.extras||[]).filter(g=>g.id!==gid)}));}
  function updateGroup(gid,key,val){setForm(p=>({...p,extras:(p.extras||[]).map(g=>g.id===gid?{...g,[key]:val}:g)}));}
  function addOption(gid){
    const o={id:uid(),label:"خيار جديد",priceOld:"0",priceNew:"0",numericPrice:0,sortOrder:0};
    setForm(p=>({...p,extras:(p.extras||[]).map(g=>g.id===gid?{...g,options:[...(g.options||[]),o]}:g)}));
  }
  function removeOption(gid,oid){setForm(p=>({...p,extras:(p.extras||[]).map(g=>g.id===gid?{...g,options:(g.options||[]).filter(o=>o.id!==oid)}:g)}));}
  function updateOption(gid,oid,key,val){
    setForm(p=>({...p,extras:(p.extras||[]).map(g=>g.id===gid?{...g,options:(g.options||[]).map(o=>{
      if(o.id!==oid)return o;
      const u={...o,[key]:val};
      if(key==="priceOld")u.numericPrice=Number(String(val).replace(/,/g,""))||0;
      return u;
    })}:g)}));
  }
  function moveGroup(gid,dir){setForm(p=>{const a=[...(p.extras||[])];const i=a.findIndex(g=>g.id===gid);const t=i+dir;if(t<0||t>=a.length)return p;[a[i],a[t]]=[a[t],a[i]];return{...p,extras:a};});}
  function moveOption(gid,oid,dir){setForm(p=>({...p,extras:(p.extras||[]).map(g=>{if(g.id!==gid)return g;const a=[...g.options];const i=a.findIndex(o=>o.id===oid);const t=i+dir;if(t<0||t>=a.length)return g;[a[i],a[t]]=[a[t],a[i]];return{...g,options:a};})}));}

  /* ══ SIZES HELPERS ════════════════════════════════════════════════════ */
  function addSize(key="_sizes"){
    const s={id:uid(),label:"حجم جديد",priceOld:"0",priceNew:"0",numericPrice:0,sortOrder:(form[key]||[]).length};
    setForm(p=>({...p,[key]:[...(p[key]||[]),s]}));
  }
  function removeSize(sid,key="_sizes"){setForm(p=>({...p,[key]:(p[key]||[]).filter(s=>s.id!==sid)}));}
  function updateSize(sid,fkey,val,key="_sizes"){
    setForm(p=>({...p,[key]:(p[key]||[]).map(s=>{if(s.id!==sid)return s;const u={...s,[fkey]:val};if(fkey==="priceOld")u.numericPrice=Number(String(val).replace(/,/g,""))||0;return u;})}));
  }
  function moveSize(sid,dir,key="_sizes"){
    setForm(p=>{const a=[...(p[key]||[])];const i=a.findIndex(s=>s.id===sid);const t=i+dir;if(t<0||t>=a.length)return p;[a[i],a[t]]=[a[t],a[i]];return{...p,[key]:a};});
  }

  /* ══ CRUD ════════════════════════════════════════════════════════════════ */
  function openEdit(type,id){
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id||x._id===id);
    if(!item)return;
    setForm({
      ...item,
      _sizes:(item.sizes||[]).map(s=>({...s})),
      _khanamSizes:(item.khanamSizes||item.sizes||[]).map(s=>({...s})),
      extras:(item.extras||[]).map(g=>({...g,options:(g.options||[]).map(o=>({...o}))})),
    });
    setImgP(item.imageUrl||null);
    setImgF(item.flavorImageUrl||null);
    setEditing({type,id:item._id||item.id,isNew:false});
  }

  function addItem(){
    setForm({label:"",details:"",comingSoon:false,menuSection:secFilter||"",_sizes:[],extras:[],sliceCount:0,cols:0,_khanamSizes:[]});
    setImgP(null);setImgF(null);
    setEditing({type:"menu",id:null,isNew:true});
  }

  function addFeatured(){
    setForm({label:"",desc:"",priceOld:"",priceNew:"",numericPrice:0,sliceCount:0,cols:0,_sizes:[],extras:[]});
    setImgP(null);setImgF(null);
    setEditing({type:"featured",id:null,isNew:true});
  }

  async function saveEdit(){
    if(!form.label?.trim()){toast_("⚠ الاسم مطلوب","err");return;}
    setSaving(true);
    try{
      const isFeat=editing.type==="featured";
      const payload={
        label:          form.label,
        type:           editing.type,
        menuSection:    form.menuSection||"",
        details:        form.details||"",
        desc:           form.desc||"",
        comingSoon:     form.comingSoon??false,
        imageUrl:       imgP||"",
        flavorImageUrl: imgF||"",
        priceOld:       form.priceOld||"",
        priceNew:       form.priceNew||"",
        numericPrice:   form.numericPrice||0,
        sizes:          (form._sizes||[]).map((s,i)=>({...s,sortOrder:i})),
        khanamSizes:    (form._khanamSizes||[]).map((s,i)=>({...s,sortOrder:i})),
        extras:         (form.extras||[]).map((g,i)=>({...g,sortOrder:i,options:(g.options||[]).map((o,j)=>({...o,sortOrder:j}))})),
        sliceCount:     Number(form.sliceCount)||0,
        cols:           Number(form.cols)||0,
        sortOrder:      form.sortOrder||0,
      };
      const url=editing.isNew?"/api/pizzas":`/api/pizzas/${editing.id}`;
      const method=editing.isNew?"POST":"PUT";
      const res=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error||`HTTP ${res.status}`);}
      toast_(editing.isNew?"✅ تم الإضافة":"✅ تم التعديل");
      log(editing.isNew?`إضافة: ${form.label}`:`تعديل: ${form.label}`);
      setEditing(null);setTick(t=>t+1);
    }catch(e){toast_("❌ "+e.message,"err");}
    finally{setSaving(false);}
  }

  function deleteItem(type,id){
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id||x._id===id);
    confirm_(`حذف "${item?.label}"؟`,async()=>{
      try{
        const res=await fetch(`/api/pizzas/${item?._id||id}`,{method:"DELETE"});
        if(!res.ok)throw new Error("HTTP "+res.status);
        toast_("🗑 تم الحذف");log(`حذف: ${item?.label}`);setTick(t=>t+1);
      }catch(e){toast_("❌ "+e.message,"err");}
    });
  }

  async function toggleCS(id){
    const item=menu.find(x=>x.id===id||x._id===id);
    if(!item)return;
    try{
      await fetch(`/api/pizzas/${item._id||id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({comingSoon:!item.comingSoon})});
      log(`${item.comingSoon?"إظهار":"إخفاء"}: ${item.label}`);setTick(t=>t+1);
    }catch(e){toast_("❌ "+e.message,"err");}
  }

  async function dupItem(type,id){
    const list=type==="menu"?menu:featured;
    const item=list.find(x=>x.id===id||x._id===id);
    if(!item)return;
    try{
      const res=await fetch("/api/pizzas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...item,label:item.label+" — نسخة",_id:undefined,id:undefined})});
      if(!res.ok)throw new Error("HTTP "+res.status);
      toast_("📋 تم النسخ");log(`نسخ: ${item.label}`);setTick(t=>t+1);
    }catch(e){toast_("❌ "+e.message,"err");}
  }

  function onDragOver(e,type,overId){
    e.preventDefault();if(!dragId||dragId===overId)return;
    const setFn=type==="menu"?setMenu:setFeatured;
    setFn(prev=>{const a=[...prev];const fi=a.findIndex(x=>(x.id||x._id)===dragId);const ti=a.findIndex(x=>(x.id||x._id)===overId);if(fi<0||ti<0)return prev;const n=[...a];const[m]=n.splice(fi,1);n.splice(ti,0,m);return n;});
  }

  async function onDragEnd(type){
    setDragId(null);
    const list=type==="menu"?menu:featured;
    try{await Promise.all(list.map((item,idx)=>fetch(`/api/pizzas/${item._id||item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sortOrder:idx})})));log("ترتيب القائمة");}
    catch(e){console.error("[sort]",e);}
  }

  async function moveItem(type,id,dir){
    const setFn=type==="menu"?setMenu:setFeatured;
    let nl;
    setFn(prev=>{const a=[...prev];const i=a.findIndex(x=>(x.id||x._id)===id);const t=i+dir;if(t<0||t>=a.length)return prev;const n=[...a];[n[i],n[t]]=[n[t],n[i]];nl=n;return n;});
    setTimeout(async()=>{if(!nl)return;await Promise.all(nl.map((item,idx)=>fetch(`/api/pizzas/${item._id||item.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sortOrder:idx})})));},100);
  }

  async function handleImg(file,which){
    if(!file)return;
    if(!file.type.startsWith("image/")){toast_("⚠ اختر صورة","err");return;}
    if(file.size>5*1024*1024){toast_("⚠ الصورة أكبر من 5 MB","err");return;}
    const setUpl=which==="p"?setUploadingP:setUploadingF;
    const setImg=which==="p"?setImgP:setImgF;
    setUpl(true);toast_("⏳ جاري رفع الصورة...");
    try{const url=await uploadToCloudinary(file);setImg(url);toast_("✅ تم رفع الصورة");}
    catch(e){toast_("❌ "+e.message,"err");}
    finally{setUpl(false);}
  }

  function exportData(){
    const d=JSON.stringify({menu,featured,sections,exportedAt:new Date().toISOString()},null,2);
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([d],{type:"application/json"})),download:"pizzakhanum-backup.json"});
    a.click();toast_("📦 تم التصدير");
  }

  function importData(e){
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=async ev=>{
      try{
        const p=JSON.parse(ev.target.result);
        const items=[...(p.menu||[]),...(p.featured||[])];
        let c=0;
        for(const item of items){const res=await fetch("/api/pizzas",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});if(res.ok)c++;}
        toast_(`📥 تم استيراد ${c} صنف`);log("استيراد");setTick(t=>t+1);
      }catch{toast_("⚠ ملف غير صالح","err");}
    };
    r.readAsText(file);e.target.value="";
  }

  function saveSettings(){lsSet("site_name",siteName);lsSet("site_slogan",slogan);lsSet("site_whatsapp",wapp);log("تعديل الإعدادات");toast_("⚙️ تم حفظ الإعدادات");}

  /* فلترة */
  const src=tab==="menu"?menu:featured;
  const displayItems=src.filter(it=>{
    const matchSec=!secFilter||it.menuSection===secFilter;
    const matchSearch=!search||(it.label||"").includes(search)||(it.details||it.desc||"").includes(search);
    return matchSec&&matchSearch;
  });

  /* ════ LOGIN ════════════════════════════════════════════════════════════ */
  if(!authed)return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0a0a0a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      <div className="au" style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:20,padding:"34px 28px",width:"min(340px,95vw)",textAlign:"center"}}>
        <div style={{fontSize:"2.8rem",marginBottom:10}}>🍕</div>
        <h1 style={{color:"#C8A96A",fontSize:"1.1rem",marginBottom:4}}>بيتزا خانم</h1>
        <p style={{fontSize:".68rem",color:"#333",marginBottom:22}}>لوحة التحكم</p>
        {authErr&&<div style={{background:"#1a0808",border:"1px solid #ef444422",borderRadius:9,padding:"8px 12px",marginBottom:14,fontSize:".78rem",color:"#ef4444"}}>⚠ {authErr}</div>}
        <form onSubmit={login}>
          <input type="password" placeholder="كلمة المرور" value={pass} onChange={e=>setPass(e.target.value)} className="ai" required style={{marginBottom:12}}/>
          <button type="submit" className="bp" style={{width:"100%",padding:"11px"}}>دخول →</button>
        </form>
      </div>
    </div>
  );

  /* ════ CONFIRM ════════════════════════════════════════════════════════════ */
  const ConfirmDlg=confirmDlg&&(
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

  /* ════ SECTIONS MODAL ════════════════════════════════════════════════════ */
  const SecModal=secModal&&(
    <div className="mbg" style={{zIndex:1050}} onClick={e=>{if(e.target===e.currentTarget&&!savingSec)setSecModal(false);}}>
      <div className="mbox au">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{color:"#C8A96A",fontSize:".93rem"}}>📂 إدارة أقسام القائمة</h2>
          <button onClick={()=>setSecModal(false)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"1.3rem",lineHeight:1}}>×</button>
        </div>
        <p style={{fontSize:".66rem",color:"#555",marginBottom:13,lineHeight:1.6}}>كل قسم يظهر كتبويب في صفحة القائمة. الزبون يتصفح أفقياً ويتغير العنوان تلقائياً عند التمرير.</p>

        {secForm.map((s,si)=>(
          <div key={s.id} className="sec-card">
            <span className="handle">⠿</span>
            <input className="ai sm" style={{width:46}} value={s.emoji} onChange={e=>updateSec(s.id,"emoji",e.target.value)} placeholder="🍕"/>
            <input className="ai sm" style={{flex:1}} value={s.label} onChange={e=>updateSec(s.id,"label",e.target.value)} placeholder="اسم القسم"/>
            <div style={{display:"flex",gap:3}}>
              <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveSec(s.id,-1)} disabled={si===0}>▲</button>
              <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveSec(s.id,+1)} disabled={si===secForm.length-1}>▼</button>
              <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"3px 6px"}} onClick={()=>removeSec(s.id)}>🗑</button>
            </div>
          </div>
        ))}

        <button onClick={addSec} style={{width:"100%",padding:"8px",background:"#111",border:"1px dashed #1e1e1e",borderRadius:9,color:"#2a2a2a",cursor:"pointer",fontFamily:"inherit",fontSize:".72rem",marginTop:4,marginBottom:16}}>+ إضافة قسم جديد</button>

        <div style={{display:"flex",gap:9}}>
          <button className="bp" style={{flex:1}} onClick={saveSections} disabled={savingSec}>
            {savingSec?"جاري الحفظ...":"💾 حفظ الأقسام"}
          </button>
          <button className="bg_" onClick={()=>setSecModal(false)}>إلغاء</button>
        </div>
      </div>
    </div>
  );

  /* ════ EDIT MODAL ════════════════════════════════════════════════════════ */
  const isFeat=editing?.type==="featured";

  /* مكوّن مشترك: صور */
  function ImgPair(){
    const pairs=[
      {which:"p",ref:pRef,img:imgP,setImg:setImgP,upl:uploadingP,label:"📷 صورة الكارد"},
      ...(editing?.type==="menu"?[{which:"f",ref:fRef,img:imgF,setImg:setImgF,upl:uploadingF,label:"🎨 صورة النكهة"}]:[]),
    ];
    return(
      <div style={{display:"grid",gridTemplateColumns:editing?.type==="menu"?"1fr 1fr":"1fr",gap:10,marginTop:6}}>
        {pairs.map(({which,ref,img,setImg,upl,label})=>(
          <div key={which}>
            <p style={{fontSize:".62rem",color:"#555",marginBottom:3}}>{label}</p>
            <div className="imgzone" onClick={()=>!upl&&ref.current.click()}>
              {img&&<img src={img} alt=""/>}
              <div className="ov"><span style={{fontSize:"1.2rem"}}>📷</span><span style={{fontSize:".62rem",color:"#ccc",marginTop:3}}>تغيير</span></div>
              {!img&&<><span style={{fontSize:"1.5rem",opacity:.2}}>🖼</span><span style={{fontSize:".65rem",color:"#2a2a2a",marginTop:4}}>اضغط للرفع</span></>}
              {upl&&<div className="upl-ov"><div className="spinner"/><span style={{fontSize:".66rem",color:"#C8A96A"}}>جاري الرفع...</span></div>}
            </div>
            <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleImg(e.target.files[0],which)}/>
            {img&&<button style={{fontSize:".6rem",color:"#6a2a2a",background:"none",border:"none",cursor:"pointer",marginTop:3,fontFamily:"inherit"}} onClick={()=>setImg(null)}>× حذف</button>}
          </div>
        ))}
      </div>
    );
  }

  /* مكوّن مشترك: الأحجام */
  function SizesBlock({stateKey="_sizes",title="📏 الأحجام والأسعار",placeholder="صغير / وسط / كبير"}){
    return(
      <div style={{marginTop:14,background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:13}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <span style={{fontSize:".72rem",fontWeight:700,color:"#C8A96A"}}>{title}</span>
          <button className="ib" style={{color:"#4CAF50",borderColor:"#4CAF5022",background:"#0d1a0d",fontSize:".72rem"}} onClick={()=>addSize(stateKey)}>+ إضافة حجم</button>
        </div>
        {!(form[stateKey]||[]).length&&<p style={{fontSize:".68rem",color:"#252525",textAlign:"center",padding:"7px 0"}}>لا توجد أحجام — اضغط لإضافة</p>}
        {(form[stateKey]||[]).map((sz,si)=>(
          <div key={sz.id} style={{background:"#141414",border:"1px solid #1e1e1e",borderRadius:10,padding:"9px 10px",marginBottom:7}}>
            <div style={{display:"flex",gap:7,marginBottom:7,alignItems:"center"}}>
              <span className="handle">⠿</span>
              <input className="ai sm" style={{flex:1}} value={sz.label} onChange={e=>updateSize(sz.id,"label",e.target.value,stateKey)} placeholder={placeholder}/>
              <div style={{display:"flex",gap:3}}>
                <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveSize(sz.id,-1,stateKey)} disabled={si===0}>▲</button>
                <button className="ib" style={{padding:"3px 6px",fontSize:".6rem"}} onClick={()=>moveSize(sz.id,+1,stateKey)} disabled={si===(form[stateKey]||[]).length-1}>▼</button>
                <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"3px 6px"}} onClick={()=>removeSize(sz.id,stateKey)}>🗑</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><p style={{fontSize:".58rem",color:"#333",marginBottom:3}}>السعر ل.س القديمة</p><input className="ai sm" value={sz.priceOld} onChange={e=>updateSize(sz.id,"priceOld",e.target.value,stateKey)} placeholder="35,000"/></div>
              <div><p style={{fontSize:".58rem",color:"#333",marginBottom:3}}>السعر ل.ج الجديدة</p><input className="ai sm" value={sz.priceNew} onChange={e=>updateSize(sz.id,"priceNew",e.target.value,stateKey)} placeholder="350"/></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* مكوّن مشترك: الإضافات */
  function ExtrasBlock(){
    return(
      <div style={{marginTop:12,background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:13,padding:13}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:".72rem",fontWeight:700,color:"#C8A96A"}}>🧩 مجموعات الإضافات</span>
          <button className="ib" style={{color:"#4DA6FF",borderColor:"#4DA6FF22",background:"#06111f",fontSize:".72rem"}} onClick={addExtraGroup}>+ إضافة مجموعة</button>
        </div>
        <p style={{fontSize:".61rem",color:"#252525",marginBottom:8}}>مثال: العجينة (اختيار واحد) · الجبن الإضافي (متعدد)</p>
        {!(form.extras||[]).length&&<p style={{fontSize:".68rem",color:"#1e1e1e",textAlign:"center",padding:"7px 0"}}>لا توجد مجموعات</p>}
        {(form.extras||[]).map((g,gi)=>(
          <div key={g.id} className="eg">
            <div className="eg-header">
              <span className="handle">⠿</span>
              <input className="ai sm" style={{flex:1}} value={g.name} onChange={e=>updateGroup(g.id,"name",e.target.value)} placeholder="اسم المجموعة"/>
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
            <label style={{display:"flex",alignItems:"center",gap:7,fontSize:".68rem",color:"#555",cursor:"pointer",marginBottom:8}}>
              <input type="checkbox" checked={g.required||false} onChange={e=>updateGroup(g.id,"required",e.target.checked)} style={{accentColor:"#C8A96A"}}/>
              إلزامي
            </label>
            {(g.options||[]).map((opt,oi)=>(
              <div key={opt.id} className="eo">
                <span className="handle" style={{fontSize:".7rem"}}>⠿</span>
                <input className="ai sm" style={{flex:1,minWidth:0}} value={opt.label} onChange={e=>updateOption(g.id,opt.id,"label",e.target.value)} placeholder="اسم الخيار"/>
                <input className="ai sm" style={{width:80}} value={opt.priceOld} onChange={e=>updateOption(g.id,opt.id,"priceOld",e.target.value)} placeholder="ل.س"/>
                <input className="ai sm" style={{width:65}} value={opt.priceNew} onChange={e=>updateOption(g.id,opt.id,"priceNew",e.target.value)} placeholder="ل.ج"/>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <button className="ib" style={{padding:"2px 5px",fontSize:".55rem"}} onClick={()=>moveOption(g.id,opt.id,-1)} disabled={oi===0}>▲</button>
                  <button className="ib" style={{padding:"2px 5px",fontSize:".55rem"}} onClick={()=>moveOption(g.id,opt.id,+1)} disabled={oi===(g.options||[]).length-1}>▼</button>
                </div>
                <button className="ib" style={{background:"#1a0808",border:"1px solid #ef444422",color:"#ef4444",padding:"3px 6px"}} onClick={()=>removeOption(g.id,opt.id)}>🗑</button>
              </div>
            ))}
            <button onClick={()=>addOption(g.id)} style={{width:"100%",marginTop:6,padding:"6px",background:"#111",border:"1px dashed #1e1e1e",borderRadius:8,color:"#2a2a2a",cursor:"pointer",fontFamily:"inherit",fontSize:".68rem"}}>+ إضافة خيار</button>
          </div>
        ))}
      </div>
    );
  }

  const EditModal=editing&&(
    <div className="mbg" onClick={e=>{if(e.target===e.currentTarget&&!saving)setEditing(null);}}>
      <div className="mbox au">

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{color:"#C8A96A",fontSize:".93rem"}}>{editing.isNew?(isFeat?"✨ إضافة عرض مميز":"✨ إضافة صنف"):`✏️ ${form.label||"تعديل"}`}</h2>
          <button onClick={()=>{if(!saving)setEditing(null);}} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"1.3rem",lineHeight:1}}>×</button>
        </div>

        {/* الصور */}
        <span className="sl">الصور</span>
        <ImgPair/>

        {/* الاسم */}
        <span className="sl">الاسم *</span>
        <input className="ai" value={form.label||""} onChange={e=>setForm(p=>({...p,label:e.target.value}))} placeholder={isFeat?"بيتزا المتر":"مارغريتا"}/>

        {/* ══ قائمة عادية ══ */}
        {!isFeat&&(<>
          <span className="sl">القسم</span>
          <select className="ai" value={form.menuSection||""} onChange={e=>setForm(p=>({...p,menuSection:e.target.value}))}>
            <option value="">بدون قسم</option>
            {sections.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
          </select>

          <span className="sl">المكونات</span>
          <textarea className="ai" rows={3} value={form.details||""} onChange={e=>setForm(p=>({...p,details:e.target.value}))} placeholder="جبنة القشقوان مع الصلصة الحمراء..."/>

          <span className="sl">الحالة</span>
          <div style={{display:"flex",gap:8,marginTop:6}}>
            <button className={`pill${!form.comingSoon?" on":""}`} onClick={()=>setForm(p=>({...p,comingSoon:false}))}>✅ ظاهر</button>
            <button className={`pill${form.comingSoon?" off":""}`} onClick={()=>setForm(p=>({...p,comingSoon:true}))}>⏳ قريباً</button>
          </div>

          <SizesBlock stateKey="_sizes" title="📏 الأحجام والأسعار" placeholder="صغير / وسط / كبير"/>
          <ExtrasBlock/>
        </>)}

        {/* ══ مميزة ══ */}
        {isFeat&&(<>
          <span className="sl">الوصف القصير</span>
          <textarea className="ai" rows={3} value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder="متر كامل من النكهات المتنوعة..."/>

          {/* نوع المميزة */}
          <span className="sl">نوع العرض المميز</span>
          <div style={{display:"flex",gap:7,marginTop:6,flexWrap:"wrap"}}>
            {[
              {v:"fixed",  l:"💲 ثمن ثابت",    active:!form.sliceCount&&!(form._khanamSizes||[]).length},
              {v:"builder",l:"🍕 Builder (شرائح)",active:form.sliceCount>0},
              {v:"khanum", l:"👑 بيتزا خانم",   active:(form._khanamSizes||[]).length>0},
            ].map(o=>(
              <button key={o.v} className={`chip${o.active?" on":""}`} onClick={()=>{
                if(o.v==="fixed")  setForm(p=>({...p,sliceCount:0,cols:0,_khanamSizes:[]}));
                if(o.v==="builder")setForm(p=>({...p,sliceCount:p.sliceCount||8,cols:p.cols||4,_khanamSizes:[]}));
                if(o.v==="khanum") setForm(p=>({...p,sliceCount:0,cols:0}));
              }}>{o.l}</button>
            ))}
          </div>

          {/* ثمن ثابت */}
          {!form.sliceCount&&!(form._khanamSizes||[]).length&&(<>
            <span className="sl">الأسعار</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
              {[["priceOld","السعر ل.س","150,000"],["priceNew","السعر ل.ج","1,500"]].map(([k,l,ph])=>(
                <div key={k}><p style={{fontSize:".6rem",color:"#333",marginBottom:3}}>{l}</p>
                  <input className="ai sm" value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
            </div>
          </>)}

          {/* Builder */}
          {form.sliceCount>0&&(<>
            <span className="sl">إعداد الشبكة</span>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:6}}>
              <div>
                <p style={{fontSize:".6rem",color:"#333",marginBottom:3}}>عدد الشرائح الكلي</p>
                <input className="ai sm" type="number" min={1} max={24} value={form.sliceCount||8} onChange={e=>setForm(p=>({...p,sliceCount:Number(e.target.value)}))} placeholder="8"/>
                <p style={{fontSize:".55rem",color:"#252525",marginTop:3}}>مثال: المتر = 8 ، 60×40 = 6</p>
              </div>
              <div>
                <p style={{fontSize:".6rem",color:"#333",marginBottom:3}}>عدد الأعمدة</p>
                <input className="ai sm" type="number" min={1} max={8} value={form.cols||4} onChange={e=>setForm(p=>({...p,cols:Number(e.target.value)}))} placeholder="4"/>
                <p style={{fontSize:".55rem",color:"#252525",marginTop:3}}>مثال: المتر = 4 ، 60×40 = 3</p>
              </div>
            </div>
            {/* معاينة الشبكة */}
            <div style={{marginTop:10,background:"#0f0f0f",borderRadius:10,padding:10,border:"1px solid #1a1a1a"}}>
              <p style={{fontSize:".57rem",color:"#1e1e1e",marginBottom:7,letterSpacing:"2px"}}>معاينة الشبكة</p>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(form.cols||4,8)},1fr)`,gap:4}}>
                {Array.from({length:Math.min(form.sliceCount||8,24)},(_,i)=>(
                  <div key={i} style={{background:"linear-gradient(135deg,#1c0e05,#120a02)",border:"1px solid #222",borderRadius:5,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:".48rem",color:"#333"}}>{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
              {[["priceOld","السعر ل.س","150,000"],["priceNew","السعر ل.ج","1,500"]].map(([k,l,ph])=>(
                <div key={k}><p style={{fontSize:".6rem",color:"#333",marginBottom:3}}>{l}</p>
                  <input className="ai sm" value={form[k]||""} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
            </div>
          </>)}

          {/* خانم */}
          {(form._khanamSizes||[]).length>0||(!form.sliceCount&&(form._khanamSizes||[]).length===0&&form._khanamSizes!==undefined&&editing&&!editing.isNew&&featured.find(f=>(f._id||f.id)===editing.id)?.label?.includes("خانم"))?(
            <SizesBlock stateKey="_khanamSizes" title="👑 أحجام بيتزا خانم" placeholder="صغيرة / كبيرة"/>
          ):null}
          {/* زر إضافة أحجام خانم لو اختار نوع خانم */}
          {!(form._khanamSizes||[]).length&&!form.sliceCount&&(
            <button onClick={()=>addSize("_khanamSizes")} style={{marginTop:8,width:"100%",padding:"7px",background:"#111",border:"1px dashed #1e1e1e",borderRadius:9,color:"#2a2a2a",cursor:"pointer",fontFamily:"inherit",fontSize:".7rem"}}>+ إضافة أحجام خانم</button>
          )}

          {/* الإضافات للمميزة أيضاً */}
          <ExtrasBlock/>
        </>)}

        {/* معاينة */}
        <div style={{background:"#0f0f0f",border:"1px solid #161616",borderRadius:11,padding:12,marginTop:14,overflow:"hidden"}}>
          <p style={{fontSize:".55rem",color:"#1a1a1a",marginBottom:7,letterSpacing:"2px"}}>معاينة مباشرة</p>
          {imgP&&<img src={imgP} alt="" style={{width:"100%",height:84,objectFit:"cover",borderRadius:8,marginBottom:8}}/>}
          <p style={{fontWeight:700,color:"#E5D3B3",fontSize:".85rem",marginBottom:3}}>{form.label||"—"}</p>
          <p style={{fontSize:".67rem",color:"#444",lineHeight:1.5}}>{form.details||form.desc||"—"}</p>
          {(form.priceOld||form.priceNew)&&<p style={{fontSize:".72rem",color:"#C8A96A",marginTop:4,fontWeight:700}}>{form.priceOld} ل.س {form.priceNew&&`/ ${form.priceNew} ل.ج`}</p>}
          {(form._sizes||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>{(form._sizes||[]).map(s=><span key={s.id} style={{fontSize:".52rem",background:"#C8A96A1a",color:"#C8A96A",border:"1px solid #C8A96A22",borderRadius:5,padding:"1px 6px"}}>{s.label} {s.priceOld&&`— ${s.priceOld}`}</span>)}</div>}
          {form.sliceCount>0&&<p style={{fontSize:".6rem",color:"#8B6B4A",marginTop:4}}>{form.sliceCount} شريحة · {form.cols} أعمدة</p>}
          {(form.extras||[]).length>0&&<p style={{fontSize:".57rem",color:"#4DA6FF55",marginTop:4}}>{(form.extras||[]).map(g=>g.name).join(" · ")}</p>}
        </div>

        <div style={{display:"flex",gap:9,marginTop:14}}>
          <button className="bp" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7}} onClick={saveEdit} disabled={saving||uploadingP||uploadingF}>
            {saving?<><div className="spinner" style={{width:13,height:13,borderWidth:2}}/> جاري الحفظ...</>:"💾 حفظ"}
          </button>
          <button className="bg_" onClick={()=>{if(!saving)setEditing(null);}}>إلغاء</button>
        </div>

      </div>
    </div>
  );

  /* ════ DASHBOARD ════════════════════════════════════════════════════════ */
  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#E5D3B3",fontFamily:"'Noto Kufi Arabic',sans-serif",direction:"rtl"}}>
      <style>{CSS}</style>
      {ConfirmDlg}{SecModal}{EditModal}

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:toast.t==="err"?"#1a0808":toast.t==="warn"?"#1a1408":"#0d1a0d",border:`1px solid ${toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50"}`,borderRadius:11,padding:"9px 18px",zIndex:2000,color:toast.t==="err"?"#ef4444":toast.t==="warn"?"#C8A96A":"#4CAF50",fontSize:".79rem",fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 8px 28px #00000099",animation:"toastIn .22s ease forwards"}}>
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
            {l:"القائمة",v:menu.length,          c:"#C8A96A",i:"🍕"},
            {l:"ظاهر",   v:menu.filter(p=>!p.comingSoon).length,c:"#4CAF50",i:"✅"},
            {l:"قريباً", v:menu.filter(p=> p.comingSoon).length,c:"#ef4444",i:"⏳"},
            {l:"المميزة",v:featured.length,       c:"#4DA6FF",i:"⭐"},
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
            <button key={k} className={`tb${tab===k?" on":""}`} onClick={()=>{setTab(k);setSearch("");setSecFilter("");}}>{l}</button>
          ))}
          <div style={{marginRight:"auto",display:"flex",gap:5}}>
            {tab==="menu"&&(
              <>
                <button className="ib" onClick={openSecModal} style={{color:"#8B6B4A",fontSize:".72rem"}} title="إدارة الأقسام">📂 أقسام</button>
                <button className="ib" onClick={addItem} style={{background:"#0d1a0d",border:"1px solid #4CAF5022",color:"#4CAF50",fontSize:".76rem"}}>+ إضافة صنف</button>
              </>
            )}
            {tab==="featured"&&(
              <button className="ib" onClick={addFeatured} style={{background:"#06111f",border:"1px solid #4DA6FF22",color:"#4DA6FF",fontSize:".76rem"}}>+ إضافة مميز</button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{textAlign:"center",padding:"32px",color:"#C8A96A44"}}>
            <div style={{width:28,height:28,border:"3px solid #C8A96A22",borderTopColor:"#C8A96A",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/>
            <p style={{fontSize:".75rem"}}>جاري التحميل...</p>
          </div>
        )}

        {/* ── MENU ── */}
        {!loading&&tab==="menu"&&(<>
          <input className="srch" placeholder="🔍  ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/>

          {/* فلتر الأقسام */}
          {sections.length>0&&(
            <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>
              <button className={`chip${!secFilter?" on":""}`} onClick={()=>setSecFilter("")}>الكل ({menu.length})</button>
              {sections.map(s=>{
                const cnt=menu.filter(p=>p.menuSection===s.id).length;
                return(<button key={s.id} className={`chip${secFilter===s.id?" on":""}`} onClick={()=>setSecFilter(s.id)}>{s.emoji} {s.label} ({cnt})</button>);
              })}
              <button className={`chip${secFilter==="none"?" on":""}`} onClick={()=>setSecFilter("none")}>بدون قسم ({menu.filter(p=>!p.menuSection).length})</button>
            </div>
          )}

          <p style={{fontSize:".57rem",color:"#1a1a1a",marginBottom:7}}>⠿ اسحب للترتيب · ▲▼ تحريك</p>

          {displayItems.length===0&&<div style={{textAlign:"center",padding:"26px",color:"#1e1e1e",fontSize:".8rem"}}>لا توجد نتائج</div>}

          {displayItems.map(item=>{
            const iid=item._id||item.id;
            const sec=sections.find(s=>s.id===item.menuSection);
            return(
              <div key={iid} className={`row${dragId===iid?" dragging":""}`} draggable
                onDragStart={()=>setDragId(iid)} onDragOver={e=>onDragOver(e,"menu",iid)} onDragEnd={()=>onDragEnd("menu")}>
                <span className="handle">⠿</span>
                {item.imageUrl?<img src={item.imageUrl} alt="" className="thumb"/>:<div className="thumbph">🍕</div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,color:"#E5D3B3",fontSize:".83rem"}}>{item.label}</span>
                    {item.comingSoon?<span className="badge brr">قريباً</span>:<span className="badge bgg">ظاهر</span>}
                    {sec&&<span className="badge boo">{sec.emoji} {sec.label}</span>}
                    {(item.sizes||[]).length>0&&<span className="badge boo">{(item.sizes||[]).length} حجم</span>}
                    {(item.extras||[]).length>0&&<span className="badge bbb">{(item.extras||[]).length} إضافة</span>}
                  </div>
                  <p style={{fontSize:".63rem",color:"#222",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.details||"—"}</p>
                </div>
                <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                  <div style={{display:"flex",flexDirection:"column",gap:1}}>
                    <button onClick={()=>moveItem("menu",iid,-1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▲</button>
                    <button onClick={()=>moveItem("menu",iid,+1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▼</button>
                  </div>
                  <button onClick={()=>toggleCS(iid)} style={{padding:"4px 7px",background:item.comingSoon?"#1a0d0d":"#0d1a0d",border:`1px solid ${item.comingSoon?"#ef444422":"#4CAF5022"}`,borderRadius:6,color:item.comingSoon?"#ef4444":"#4CAF50",cursor:"pointer",fontSize:".66rem",fontWeight:700,fontFamily:"inherit"}}>
                    {item.comingSoon?"إظهار":"إخفاء"}
                  </button>
                  <button className="ib" onClick={()=>openEdit("menu",iid)} style={{background:"#1a1a1a",border:"1px solid #222",color:"#C8A96A"}}>✏️</button>
                  <button className="ib" onClick={()=>dupItem("menu",iid)} style={{color:"#2e2e2e"}} title="نسخ">📋</button>
                  <button className="ib" onClick={()=>deleteItem("menu",iid)} style={{background:"#1a0d0d",border:"1px solid #ef444422",color:"#ef4444"}}>🗑</button>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ── FEATURED ── */}
        {!loading&&tab==="featured"&&(<>
          <input className="srch" placeholder="🔍  ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <p style={{fontSize:".57rem",color:"#1a1a1a",marginBottom:7}}>⠿ اسحب للترتيب · ▲▼ تحريك</p>
          {displayItems.length===0&&<div style={{textAlign:"center",padding:"26px",color:"#1e1e1e",fontSize:".8rem"}}>لا توجد عروض مميزة</div>}
          {displayItems.map(item=>{
            const iid=item._id||item.id;
            const isBuilder=item.sliceCount>0;
            const isKhanum=(item.khanamSizes||item.sizes||[]).length>0&&!isBuilder;
            return(
              <div key={iid} className={`row${dragId===iid?" dragging":""}`} draggable
                onDragStart={()=>setDragId(iid)} onDragOver={e=>onDragOver(e,"featured",iid)} onDragEnd={()=>onDragEnd("featured")}>
                <span className="handle">⠿</span>
                {item.imageUrl?<img src={item.imageUrl} alt="" className="thumb"/>:<div className="thumbph">⭐</div>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontWeight:700,color:"#E5D3B3",fontSize:".83rem"}}>{item.label}</span>
                    {isBuilder&&<span className="badge boo">🍕 {item.sliceCount} شريحة</span>}
                    {isKhanum&&<span className="badge boo">👑 خانم</span>}
                    {item.priceOld&&<span className="badge boo">{item.priceOld} ل.س</span>}
                    {(item.extras||[]).length>0&&<span className="badge bbb">{(item.extras||[]).length} إضافة</span>}
                  </div>
                  <p style={{fontSize:".63rem",color:"#222",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.desc||"—"}</p>
                </div>
                <div style={{display:"flex",gap:3,alignItems:"center",flexShrink:0}}>
                  <div style={{display:"flex",flexDirection:"column",gap:1}}>
                    <button onClick={()=>moveItem("featured",iid,-1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▲</button>
                    <button onClick={()=>moveItem("featured",iid,+1)} style={{background:"none",border:"none",color:"#2a2a2a",cursor:"pointer",fontSize:".65rem",lineHeight:1,padding:"2px 4px"}}>▼</button>
                  </div>
                  <button className="ib" onClick={()=>openEdit("featured",iid)} style={{background:"#1a1a1a",border:"1px solid #222",color:"#C8A96A"}}>✏️</button>
                  <button className="ib" onClick={()=>dupItem("featured",iid)} style={{color:"#2e2e2e"}}>📋</button>
                  <button className="ib" onClick={()=>deleteItem("featured",iid)} style={{background:"#1a0d0d",border:"1px solid #ef444422",color:"#ef4444"}}>🗑</button>
                </div>
              </div>
            );
          })}
        </>)}

        {/* ── HISTORY ── */}
        {tab==="history"&&(
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:13,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
              <h2 style={{fontSize:".85rem",color:"#C8A96A"}}>📋 سجل التعديلات</h2>
              <button onClick={()=>{setHistory([]);lsSet("admin_history",[]);}} style={{background:"none",border:"1px solid #1a1a1a",borderRadius:7,color:"#2e2e2e",cursor:"pointer",padding:"3px 8px",fontSize:".66rem",fontFamily:"inherit"}}>مسح</button>
            </div>
            {history.length===0?<p style={{color:"#1e1e1e",fontSize:".76rem",textAlign:"center",padding:"14px 0"}}>لا يوجد سجل</p>
              :history.map((h,i)=><div key={i} className="hrow"><span>{h.a}</span><span style={{color:"#1e1e1e",flexShrink:0}}>{h.t}</span></div>)}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==="settings"&&(
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:13,padding:18}}>
            <h2 style={{fontSize:".85rem",color:"#C8A96A",marginBottom:14}}>⚙️ إعدادات الموقع</h2>
            {[["اسم المطعم",siteName,setSiteName,false],["الشعار",slogan,setSlogan,false],["رقم واتساب",wapp,setWapp,true]].map(([l,v,s,ltr])=>(
              <div key={l} style={{marginBottom:11}}>
                <span className="sl" style={{marginTop:0}}>{l}</span>
                <input className="ai" value={v} onChange={e=>s(e.target.value)} dir={ltr?"ltr":"rtl"}/>
              </div>
            ))}
            <button className="bp" style={{width:"100%",marginTop:6}} onClick={saveSettings}>💾 حفظ الإعدادات</button>
            <div style={{marginTop:13,background:"#0f0f0f",border:"1px solid #161616",borderRadius:10,padding:13}}>
              <p style={{fontSize:".62rem",color:"#1e1e1e",marginBottom:9}}>⚠️ منطقة خطر</p>
              <button className="bd" style={{width:"100%",padding:"10px"}} onClick={()=>confirm_("حذف كل البيانات؟ لا يمكن التراجع!",async()=>{
                for(const item of [...menu,...featured]){await fetch(`/api/pizzas/${item._id||item.id}`,{method:"DELETE"}).catch(()=>{});}
                toast_("↺ تم مسح كل البيانات","warn");log("مسح كل البيانات");setTick(t=>t+1);
              })}>↺ مسح كل البيانات من قاعدة البيانات</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
