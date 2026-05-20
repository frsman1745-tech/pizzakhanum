// src/App.jsx — واجهة الزبون v3
// ✅ أقسام القائمة مع Scroll Spy (يتغير التبويب تلقائياً بالتمرير)
// ✅ خريطة حماة — عند الاستلام يظهر موقع الفرع مع زر ذهاب
// ✅ بيانات الأقسام من Admin

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ══ بيانات افتراضية ══════════════════════════════════════════════════════ */
const DEFAULT_FEATURED = [
  { id:"meter",      label:"بيتزا المتر",  priceOld:"150,000",priceNew:"1,500",numericPrice:150000,sliceCount:8,cols:4,desc:"متر كامل من الشهية المتنوعة",imageUrl:"",flavorImageUrl:"",extras:[] },
  { id:"sixtyforty", label:"بيتزا 60×40", priceOld:"140,000",priceNew:"1,400",numericPrice:140000,sliceCount:6,cols:3,desc:"الحجم العائلي المثالي",imageUrl:"",flavorImageUrl:"",extras:[] },
  { id:"khanum",     label:"بيتزا خانم",  priceOld:null,priceNew:null,desc:"كرات العجين محشية بجبنة الشيدر على الأطراف ✨",
    sizes:[{id:"sm",label:"صغيرة",priceOld:"45,000",priceNew:"450",numericPrice:45000},{id:"lg",label:"كبيرة",priceOld:"60,000",priceNew:"600",numericPrice:60000}],imageUrl:"",flavorImageUrl:"",extras:[] },
];
const DEFAULT_MENU = [
  { id:"margarita",  label:"مارغريتا",        details:"جبنة القشقوان مع الصلصة الحمراء.",comingSoon:false,imageUrl:"",flavorImageUrl:"",sizes:[],extras:[],menuSection:"" },
  { id:"hawaii",     label:"هاواي",           details:"جبنة القشقوان مع الأناناس.",comingSoon:false,imageUrl:"",flavorImageUrl:"",sizes:[],extras:[],menuSection:"" },
  { id:"peperoni",   label:"ببروني",          details:"جبنة القشقوان مع شرائح البيروني.",comingSoon:false,imageUrl:"",flavorImageUrl:"",sizes:[],extras:[],menuSection:"" },
  { id:"chickenbbq", label:"تشيكن باربيكيو", details:"دجاج بصوص الباربيكيو وبصل.",comingSoon:false,imageUrl:"",flavorImageUrl:"",sizes:[],extras:[],menuSection:"" },
  { id:"cs1",        label:"بيتزا الكريمة",  details:"",comingSoon:true,imageUrl:"",flavorImageUrl:"",sizes:[],extras:[],menuSection:"" },
];
const DEFAULT_SIZES = [
  {id:"sm",label:"صغير",priceOld:"35,000",priceNew:"350",numericPrice:35000},
  {id:"md",label:"وسط", priceOld:"50,000",priceNew:"500",numericPrice:50000},
  {id:"lg",label:"كبير",priceOld:"65,000",priceNew:"650",numericPrice:65000},
];
const DEFAULT_SECTIONS = [
  {id:"pizza",label:"بيتزا",   emoji:"🍕",sortOrder:0},
  {id:"drinks",label:"مشروبات",emoji:"🥤",sortOrder:1},
];

// موقع الفرع الرئيسي في حماة
const BRANCH = {
  lat:  35.1318,
  lng:  36.7580,
  name: "بيتزا خانم — حماة",
  googleMaps: "https://maps.app.goo.gl/P5b4Ba5nxhZJQv967?g_st=ic",
};

const FLOATERS = [
  {e:"🍕",l:"6%", t:"18%",d:7, dl:0  },
  {e:"🌶️",l:"14%",t:"72%",d:9, dl:1  },
  {e:"🧀",l:"82%",t:"14%",d:8, dl:2  },
  {e:"🍅",l:"88%",t:"65%",d:6, dl:.5 },
  {e:"🫒",l:"50%",t:"88%",d:10,dl:3  },
  {e:"🥓",l:"72%",t:"42%",d:7.5,dl:1.5},
];

/* ══ CSS ══════════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-thumb{background:#C8A96A2a;border-radius:2px}
  @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0);opacity:.12}50%{transform:translateY(-26px) rotate(7deg);opacity:.2}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes glow{0%,100%{box-shadow:0 0 18px #C8A96A44,0 0 40px #C8A96A22}50%{box-shadow:0 0 32px #C8A96A88,0 0 70px #C8A96A44}}
  @keyframes popIn{0%{opacity:0;transform:scale(.88)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fade-up{animation:fadeUp .42s ease forwards}
  .pop-in{animation:popIn .3s ease forwards}
  .btn-gold{background:linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A);background-size:200% auto;border:none;cursor:pointer;font-family:inherit;transition:background-position .4s,transform .2s,box-shadow .3s}
  .btn-gold:hover{background-position:right center;transform:translateY(-2px) scale(1.02);box-shadow:0 8px 28px #C8A96A55}
  .btn-gold:active{transform:scale(.97)}
  .btn-gold:disabled{opacity:.35;cursor:not-allowed;transform:none!important;box-shadow:none!important}
  .card-tap{transition:transform .2s,box-shadow .2s;cursor:pointer}
  .card-tap:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 10px 36px rgba(200,169,106,.14)}
  .card-tap:active{transform:scale(.98)}
  .featured-scroll{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:0 16px 8px;scrollbar-width:none}
  .featured-scroll::-webkit-scrollbar{display:none}
  .featured-card{flex:0 0 78vw;max-width:300px;scroll-snap-align:start;border-radius:20px;overflow:hidden;border:1px solid #222;transition:border-color .25s,transform .25s;cursor:pointer;background:#121212}
  .featured-card:hover{border-color:#C8A96A44;transform:scale(1.02)}
  .featured-card.acard{border-color:#C8A96A33}

  /* Section tabs */
  .sec-tabs{display:flex;gap:8px;overflow-x:auto;padding:0 15px 1px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .sec-tabs::-webkit-scrollbar{display:none}
  .sec-tab{flex-shrink:0;display:flex;align-items:center;gap:5px;padding:7px 14px;border-radius:20px;border:1px solid #1e1e1e;background:#141414;color:#333;cursor:pointer;font-family:inherit;font-size:.76rem;font-weight:600;transition:all .2s;white-space:nowrap}
  .sec-tab:hover{color:#C8A96A44;border-color:#C8A96A1a}
  .sec-tab.on{background:#C8A96A1a;border-color:#C8A96A44;color:#C8A96A}
  /* slice builder */
  .slice-cell{cursor:pointer;border:1.5px solid #222;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:62px;padding:6px 4px;gap:3px;background:linear-gradient(135deg,#1c0e05,#120a02);transition:all .17s}
  .slice-cell:hover{border-color:#C8A96A33}
  .slice-cell.sel{border-color:#4DA6FF!important;background:#06111f!important;box-shadow:0 0 12px #4DA6FF33}
  .slice-cell.fld{border-color:#C8A96A55;background:linear-gradient(135deg,#2a1508,#1a0e05)}
  .flavor-btn{cursor:pointer;border:1px solid #1a1a1a;background:#141414;border-radius:12px;overflow:hidden;transition:all .17s}
  .flavor-btn:hover:not(.cs){border-color:#C8A96A44}
  .flavor-btn.cs{cursor:not-allowed;opacity:.4}
  .size-btn{flex:1;padding:11px 6px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:.78rem;font-weight:600;border:1px solid #222;background:#141414;color:#E5D3B3;transition:all .2s;text-align:center}
  .size-btn:hover{border-color:#C8A96A44}
  .size-btn.on{background:#C8A96A;border-color:#C8A96A;color:#0f0f0f}
  /* extras */
  .extra-opt{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;border-radius:10px;border:1px solid #1e1e1e;background:#141414;margin-bottom:6px;cursor:pointer;transition:all .15s}
  .extra-opt:hover{border-color:#C8A96A33}
  .extra-opt.sel{border-color:#C8A96A;background:#1c1408}
  .extra-check{width:18px;height:18px;border-radius:50%;border:1.5px solid #333;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
  .extra-check.on{border-color:#C8A96A;background:#C8A96A}
  .extra-check-sq{width:18px;height:18px;border-radius:5px;border:1.5px solid #333;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}
  .extra-check-sq.on{border-color:#C8A96A;background:#C8A96A}
  .del-btn{border:1px solid #222;border-radius:11px;cursor:pointer;font-family:inherit;font-size:.83rem;font-weight:600;transition:all .2s;flex:1;padding:12px;text-align:center;background:#141414;color:#444}
  .del-btn.on{border-color:#C8A96A;background:#1c1308;color:#C8A96A}
  /* item fade-in on scroll */
  @keyframes itemIn{from{opacity:0;transform:translateY(30px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  .item-anim{opacity:0;transform:translateY(30px) scale(.96);transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .5s cubic-bezier(.22,1,.36,1)}
  .item-anim.visible{opacity:1;transform:translateY(0) scale(1)}
`;

/* ══ PIZZA IMAGE ═════════════════════════════════════════════════════════ */
function PizzaImg({ imageUrl, label, style }) {
  if (imageUrl) return (
    <div style={{overflow:"hidden",flexShrink:0,...style}}>
      <img src={imageUrl} alt={label||""} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
    </div>
  );
  return (
    <div style={{background:"linear-gradient(135deg,#1c1208,#111)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,overflow:"hidden",flexShrink:0,...style}}>
      <div style={{width:28,height:28,borderRadius:"50%",border:"1px dashed #C8A96A2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,opacity:.3}}>🍕</div>
      {label&&<span style={{fontSize:".5rem",color:"#C8A96A2a",textAlign:"center",padding:"0 6px",lineHeight:1.3}}>{label}</span>}
    </div>
  );
}

/* BranchMap removed — using direct link instead */

/* ══ DELIVERY MAP (تحديد موقع التوصيل) ════════════════════════════════════ */
function DeliveryMap({ onSelect }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tileRef = useRef(null);
  const [mapType, setMapType] = useState("street");
  const [search, setSearch]   = useState("");
  const [busy,   setBusy]     = useState(false);
  const [ready,  setReady]    = useState(false);

  const TILES = {
    street:    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  useEffect(() => {
    function tryInit() {
      if (mapRef.current) return;
      if (!window.L) { setTimeout(tryInit, 200); return; }
      if (!divRef.current) return;
      try {
        // يبدأ الخريطة على حماة
        const map = window.L.map(divRef.current, {
          zoomControl: true, attributionControl: false,
        }).setView([BRANCH.lat, BRANCH.lng], 13);
        tileRef.current = window.L.tileLayer(TILES.street).addTo(map);
        map.on("click", e => place(map, e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        setReady(true);
        setTimeout(() => map.invalidateSize(), 300);
      } catch (e) { console.error("DeliveryMap", e); }
    }
    tryInit();
    return () => {
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    };
  }, []);

  function place(map, lat, lng) {
    if (markerRef.current) { try { markerRef.current.remove(); } catch {} }
    markerRef.current = window.L.marker([lat, lng], { draggable: true }).addTo(map)
      .bindPopup("موقعك ✓").openPopup();
    markerRef.current.on("dragend", ev => {
      const p = ev.target.getLatLng();
      onSelect({ lat: p.lat.toFixed(5), lng: p.lng.toFixed(5) });
    });
    onSelect({ lat: lat.toFixed(5), lng: lng.toFixed(5) });
  }

  function switchLayer(t) {
    if (!mapRef.current || t === mapType) return;
    if (tileRef.current) { try { tileRef.current.remove(); } catch {} }
    tileRef.current = window.L.tileLayer(TILES[t]).addTo(mapRef.current);
    setMapType(t);
  }

  async function doSearch(e) {
    e.preventDefault();
    if (!search.trim() || !mapRef.current) return;
    setBusy(true);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search+" حماة سوريا")}&limit=1`);
      const d = await r.json();
      if (d[0]) {
        const { lat, lon } = d[0];
        mapRef.current.flyTo([+lat, +lon], 16, { duration: 1.2 });
        place(mapRef.current, +lat, +lon);
      }
    } finally { setBusy(false); }
  }

  return (
    <div>
      <form onSubmit={doSearch} style={{display:"flex",gap:8,marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن منطقتك في حماة..."
          style={{flex:1,padding:"8px 12px",fontSize:".8rem",background:"#161616",border:"1px solid #252525",borderRadius:10,color:"#E5D3B3",fontFamily:"inherit",outline:"none"}}/>
        <button type="submit" disabled={busy}
          style={{padding:"8px 13px",background:"#C8A96A",border:"none",borderRadius:9,color:"#0f0f0f",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:".78rem",flexShrink:0,opacity:busy?.6:1}}>
          {busy?"...":"بحث"}
        </button>
      </form>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[["street","🗺 عادية"],["satellite","🛰 قمر"]].map(([k,l])=>(
          <button key={k} onClick={()=>switchLayer(k)}
            style={{flex:1,padding:"6px",background:mapType===k?"#C8A96A1a":"#141414",border:`1px solid ${mapType===k?"#C8A96A":"#252525"}`,borderRadius:7,color:mapType===k?"#C8A96A":"#444",cursor:"pointer",fontFamily:"inherit",fontSize:".72rem",fontWeight:600}}>
            {l}
          </button>
        ))}
      </div>
      <div ref={divRef} style={{width:"100%",height:230,borderRadius:13,border:"1px solid #C8A96A22",overflow:"hidden",background:"#111",marginBottom:8}}>
        {!ready&&<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:".78rem"}}>جاري تحميل الخريطة...</div>}
      </div>
    </div>
  );
}

/* ══ FEATURED SLIDER ═════════════════════════════════════════════════════ */
function FeaturedSlider({ featured, onCardClick }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef(null);
  const timer     = useRef(null);
  const paused    = useRef(false);
  const count     = featured.length;
  const scrollTo  = useCallback((idx)=>{
    if(!scrollRef.current)return;
    const el=scrollRef.current; const card=el.children[idx];
    if(card) el.scrollTo({left:card.offsetLeft-16,behavior:"smooth"});
    setActive(idx);
  },[]);
  const next=useCallback(()=>{if(paused.current)return;setActive(p=>{const n=(p+1)%count;scrollTo(n);return n;});},[count,scrollTo]);
  useEffect(()=>{timer.current=setInterval(next,3000);return()=>clearInterval(timer.current);},[next]);
  function manualNav(idx){paused.current=true;clearInterval(timer.current);scrollTo(idx);timer.current=setTimeout(()=>{paused.current=false;timer.current=setInterval(next,3000);},10000);}
  function onScroll(){if(!scrollRef.current)return;const el=scrollRef.current;const idx=Math.round(el.scrollLeft/(el.offsetWidth||1));const c=Math.max(0,Math.min(count-1,idx));if(c!==active){paused.current=true;clearInterval(timer.current);setActive(c);timer.current=setTimeout(()=>{paused.current=false;timer.current=setInterval(next,3000);},10000);}}
  return(
    <div>
      <div className="featured-scroll" ref={scrollRef} onScroll={onScroll}>
        {featured.map((fp,i)=>(
          <div key={fp.id||fp._id} className={`featured-card${i===active?" acard":""}`} onClick={()=>onCardClick(fp)}>
            <PizzaImg imageUrl={fp.imageUrl} label={fp.label} style={{width:"100%",height:155,borderRadius:0}}/>
            <div style={{padding:"11px 12px 13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                <h3 style={{fontSize:".92rem",fontWeight:700,color:"#E5D3B3"}}>{fp.label}</h3>
                <div style={{textAlign:"left",flexShrink:0,marginRight:8}}>
                  {fp.priceOld?<><div style={{fontSize:".8rem",fontWeight:900,color:"#C8A96A",whiteSpace:"nowrap"}}>{fp.priceOld} ل.س</div><div style={{fontSize:".58rem",color:"#8B6B4A"}}>{fp.priceNew} ل.ج</div></>:<div style={{fontSize:".66rem",color:"#8B6B4A"}}>حسب الحجم</div>}
                </div>
              </div>
              <p style={{fontSize:".66rem",color:"#8B6B4A",lineHeight:1.55,marginBottom:9}}>{fp.desc}</p>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#C8A96A14",border:"1px solid #C8A96A2a",borderRadius:20,padding:"4px 11px"}}>
                <span style={{fontSize:".66rem",color:"#C8A96A"}}>اختر النكهات</span>
                <span style={{color:"#C8A96A",fontSize:".78rem"}}>←</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

/* ══ EXTRAS SELECTOR ═════════════════════════════════════════════════════ */
function ExtrasSelector({ extras, selections, onChange }) {
  if (!extras || extras.length === 0) return null;
  return (
    <div style={{marginBottom:20}}>
      {extras.map(group => (
        <div key={group.id} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <p style={{fontSize:".63rem",color:"#C8A96A66",letterSpacing:"2px"}}>
              {group.name.toUpperCase()} {group.required&&<span style={{color:"#ef444466"}}>*</span>}
            </p>
            <p style={{fontSize:".57rem",color:"#333"}}>{group.type==="single"?"اختيار واحد":"يمكن تعدد الاختيارات"}</p>
          </div>
          {(group.options||[]).map(opt => {
            const groupSel=selections[group.id]||[];
            const isSel=Array.isArray(groupSel)?groupSel.includes(opt.id):groupSel===opt.id;
            return(
              <div key={opt.id} className={`extra-opt${isSel?" sel":""}`}
                onClick={()=>{
                  if(group.type==="single"){ onChange(group.id,isSel?null:opt.id,"single"); }
                  else{ const cur=selections[group.id]||[]; onChange(group.id,isSel?cur.filter(x=>x!==opt.id):[...cur,opt.id],"multi"); }
                }}>
                <div style={{flex:1}}>
                  <p style={{fontSize:".82rem",fontWeight:600,color:isSel?"#E5D3B3":"#888"}}>{opt.label}</p>
                  {+opt.numericPrice>0&&<p style={{fontSize:".64rem",color:isSel?"#C8A96A":"#444",marginTop:2}}>+ {opt.priceOld} ل.س</p>}
                </div>
                {group.type==="single"
                  ?<div className={`extra-check${isSel?" on":""}`}>{isSel&&<span style={{fontSize:".55rem",color:"#0f0f0f",fontWeight:900}}>✓</span>}</div>
                  :<div className={`extra-check-sq${isSel?" on":""}`}>{isSel&&<span style={{fontSize:".55rem",color:"#0f0f0f",fontWeight:900}}>✓</span>}</div>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ══ APP ══════════════════════════════════════════════════════════════════ */
export default function PizzaKhanum() {

  const [featured,      setFeatured]      = useState([]);
  const [pizzasMenu,    setPizzasMenu]     = useState([]);
  const [menuSections,  setMenuSections]   = useState([]);
  const [loading,       setLoading]        = useState(true);
  const [screen,        setScreen]         = useState("landing");
  const [builderPizza,  setBuilderPizza]   = useState(null);
  const [khanamSize,    setKhanamSize]     = useState(null);
  const [selectedSlices,setSelectedSlices] = useState(new Set());
  const [sliceFlavors,  setSliceFlavors]   = useState({});
  const [detailPizza,   setDetailPizza]    = useState(null);
  const [detailSize,    setDetailSize]     = useState(null);
  const [extraSels,     setExtraSels]      = useState({});
  const [cart,          setCart]           = useState([]);
  const [phone,         setPhone]          = useState("");
  const [deliveryType,  setDeliveryType]   = useState("");
  const [locationTxt,   setLocationTxt]    = useState("");
  const [mapCoords,     setMapCoords]      = useState(null);
  const [errors,        setErrors]         = useState({});
  const [activeSection, setActiveSection]  = useState(""); // للـ scroll spy

  const siteName = localStorage.getItem("site_name")    || "بيتزا خانم";
  const slogan   = localStorage.getItem("site_slogan")  || "كُل لتعيش · وعِش لأجل البيتزا";
  const wappNum  = localStorage.getItem("site_whatsapp")|| "963998950904";

  // فقط البيتزا التي لديها صورة نكهة (الصورة الثانية) تظهر في اختيار النكهات
  const flavors = useMemo(()=>
    pizzasMenu
      .filter(p => p.flavorImageUrl && p.flavorImageUrl.trim() !== "")
      .map(p=>({id:p.id||p._id,label:p.label,comingSoon:p.comingSoon,flavorImageUrl:p.flavorImageUrl})),
  [pizzasMenu]);

  /* ── refs for scroll spy ── */
  const sectionRefs = useRef({}); // { sectionId: DOMElement }
  const menuScrollRef = useRef(null);

  /* ── جلب البيانات ── */
  useEffect(()=>{
    async function load(){
      try{
        const [mRes,fRes,sRes]=await Promise.all([
          fetch("/api/pizzas?category=menu"),
          fetch("/api/pizzas?category=featured"),
          fetch("/api/pizzas?category=section"),
        ]);
        if(mRes.ok){const j=await mRes.json();const d=j.data||[];setPizzasMenu(d.length>0?d:DEFAULT_MENU);}else setPizzasMenu(DEFAULT_MENU);
        if(fRes.ok){const j=await fRes.json();const d=j.data||[];setFeatured(d.length>0?d:DEFAULT_FEATURED);}else setFeatured(DEFAULT_FEATURED);
        if(sRes.ok){const j=await sRes.json();const secDoc=(j.data||[])[0];setMenuSections(secDoc?.sections?.length?secDoc.sections.sort((a,b)=>a.sortOrder-b.sortOrder):DEFAULT_SECTIONS);}else setMenuSections(DEFAULT_SECTIONS);
      }catch(e){console.error(e);setPizzasMenu(DEFAULT_MENU);setFeatured(DEFAULT_FEATURED);setMenuSections(DEFAULT_SECTIONS);}
      finally{setLoading(false);}
    }
    load();
  },[]);

  /* ── IntersectionObserver: scroll spy + card animation ── */
  useEffect(()=>{
    if(screen!=="menu") return;
    // صغّر التأخير حتى تجد العناصر بعد الرندر
    const t = setTimeout(()=>{
      // (1) scroll spy للتبويبات
      const secObs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting) setActiveSection(e.target.dataset.sectionId||""); });
      },{rootMargin:"-15% 0px -75% 0px",threshold:0});
      Object.values(sectionRefs.current).forEach(el=>{ if(el) secObs.observe(el); });

      // (2) أنيميشن الكروت عند التمرير
      const cardObs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add("visible");
            cardObs.unobserve(e.target);
          }
        });
      },{threshold:0.06, rootMargin:"0px 0px -40px 0px"});
      document.querySelectorAll("[data-animate]").forEach(el=>cardObs.observe(el));

      return()=>{ secObs.disconnect(); cardObs.disconnect(); };
    },150);
    return()=>clearTimeout(t);
  },[screen,menuSections,pizzasMenu]);

  function scrollToSection(id){
    const el=sectionRefs.current[id];
    if(el){
      // offset لمراعاة الـ sticky header
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top:y, behavior:"smooth"});
    }
    setActiveSection(id);
  }

  /* ── helpers ── */
  // تنسيق الأرقام: 150000 → "150،000" (أرقام غربية + فاصلة عربية)
  // استخراج السعر الرقمي من priceOld لو numericPrice = 0
  const getNum = sz => {
    if(!sz) return 0;
    if(sz.numericPrice > 0) return sz.numericPrice;
    const parsed = Number(String(sz.priceOld||"0").replace(/[,،]/g,""));
    return isNaN(parsed) ? 0 : parsed;
  };

  const fmt = n => {
    if(n==null||isNaN(n)) return "0";
    return Math.round(Number(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,"،");
  };
  const cartTotal=cart.reduce((s,i)=>s+i.numericPrice*i.qty,0);

  function extrasTotal(pizza,sels){
    let t=0;
    (pizza.extras||[]).forEach(g=>{const sel=sels[g.id];if(!sel)return;const ids=Array.isArray(sel)?sel:[sel];ids.forEach(oid=>{const opt=(g.options||[]).find(o=>o.id===oid);if(opt)t+=opt.numericPrice||0;});});
    return t;
  }
  function extrasSummary(pizza,sels){
    const parts=[];
    (pizza.extras||[]).forEach(g=>{const sel=sels[g.id];if(!sel)return;const ids=Array.isArray(sel)?sel:[sel];const labels=ids.map(oid=>(g.options||[]).find(o=>o.id===oid)?.label).filter(Boolean);if(labels.length)parts.push(`${g.name}: ${labels.join("، ")}`);});
    return parts.join(" · ");
  }

  function addToCart(item){setCart(p=>[...p,{...item,qty:1,uid:Date.now()+Math.random()}]);}
  function updateQty(uid,d){setCart(p=>p.map(i=>i.uid===uid?{...i,qty:Math.max(1,i.qty+d)}:i));}
  function removeItem(uid){setCart(p=>p.filter(i=>i.uid!==uid));}
  function toggleSlice(idx){setSelectedSlices(p=>{const n=new Set(p);n.has(idx)?n.delete(idx):n.add(idx);return n;});}
  function applyFlavor(fid){if(!selectedSlices.size)return;setSliceFlavors(p=>{const n={...p};selectedSlices.forEach(i=>{n[i]=fid;});return n;});setSelectedSlices(new Set());}
  function addBuilderToCart(){
    const perSlice=Object.entries(sliceFlavors).map(([i,fid])=>`شريحة ${+i+1}: ${flavors.find(f=>f.id===fid)?.label}`).join("، ");
    addToCart({label:builderPizza.label,size:"",details:perSlice||"—",priceOld:builderPizza.priceOld,priceNew:builderPizza.priceNew,numericPrice:builderPizza.numericPrice});
    setSliceFlavors({});setSelectedSlices(new Set());setScreen("menu");
  }
  function addKhanamToCart(fid){
    const f=flavors.find(x=>x.id===fid);
    addToCart({label:`بيتزا خانم — ${khanamSize.label}`,size:khanamSize.label,details:`المنتصف: ${f?.label} • الأطراف: جبنة شيدر`,priceOld:khanamSize.priceOld,priceNew:khanamSize.priceNew,numericPrice:getNum(khanamSize)});
    setKhanamSize(null);setScreen("menu");
  }
  function addDetailToCart(){
    if(!detailSize)return;
    const eExtra=extrasTotal(detailPizza,extraSels);
    const eSummary=extrasSummary(detailPizza,extraSels);
    const totalNum=getNum(detailSize)+eExtra;
    const details=[detailPizza.details,eSummary].filter(Boolean).join(" · ");
    addToCart({label:detailPizza.label,size:detailSize.label,details,priceOld:detailSize.priceOld,priceNew:detailSize.priceNew,numericPrice:getNum(detailSize)+eExtra});
    setDetailSize(null);setExtraSels({});setScreen("menu");
  }

  const extrasValid=useMemo(()=>{
    if(!detailPizza)return true;
    return(detailPizza.extras||[]).every(g=>{if(!g.required)return true;const sel=extraSels[g.id];return Array.isArray(sel)?sel.length>0:!!sel;});
  },[detailPizza,extraSels]);

  function checkout(){
    const errs={};
    if(!/^\d{10}$/.test(phone.trim()))             errs.phone=true;
    if(!deliveryType)                               errs.delivery=true;
    if(deliveryType==="delivery"&&!locationTxt.trim()) errs.location=true;
    if(Object.keys(errs).length){setErrors(errs);return;}
    const lines=cart.map(i=>`• ${i.label}${i.size?` (${i.size})`:""} × ${i.qty}\n  ${i.details}\n  السعر: ${i.priceOld||fmt(i.numericPrice)} ل.س`).join("\n\n");
    const msg=["مرحباً بيتزا خانم 🍕","","📋 الطلب:",lines,"",`💰 المجموع: ${fmt(cartTotal)} ل.س`,`🚗 ${deliveryType==="pickup"?"استلام من الفرع":"توصيل"}`,deliveryType==="delivery"?`📍 ${locationTxt}${mapCoords?`\n🗺 https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`:""}`:""," ",`📞 ${phone}`].filter(Boolean).join("\n");
    window.open(`https://wa.me/${wappNum}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const phoneValid  = /^\d{10}$/.test(phone.trim());
  const canCheckout = phoneValid && deliveryType && (deliveryType!=="delivery"||locationTxt.trim());

  function Header({title,onBack}){
    return(
      <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"12px 15px",display:"flex",alignItems:"center",gap:11}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.5rem",lineHeight:1,padding:0}}>‹</button>
        <h2 style={{fontSize:".92rem",fontWeight:700,color:"#E5D3B3"}}>{title}</h2>
      </div>
    );
  }

  function FlavorGrid({onPick,usedMap={}}){
    return(
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {flavors.map(f=>{
          const cnt=usedMap[f.id]||0;
          return(
            <div key={f.id} className={`flavor-btn${f.comingSoon?" cs":cnt>0?" hfl":""}`} onClick={()=>{if(f.comingSoon)return;onPick(f.id);}}>
              <PizzaImg imageUrl={f.flavorImageUrl} label="" style={{width:"100%",height:68,borderRadius:0}}/>
              <div style={{padding:"6px 9px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".7rem",fontWeight:600,color:f.comingSoon?"#444":"#E5D3B3"}}>{f.label}</span>
                {f.comingSoon&&<span style={{fontSize:".52rem",background:"#C8A96A14",color:"#C8A96A77",padding:"1px 5px",borderRadius:9}}>قريباً</span>}
                {cnt>0&&<span style={{fontSize:".58rem",background:"#C8A96A",color:"#0f0f0f",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ════ LOADING ════ */
  if(loading)return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0f0f0f",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,color:"#C8A96A"}}>
      <style>{CSS}</style>
      <div style={{width:36,height:36,border:"3px solid #C8A96A22",borderTopColor:"#C8A96A",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{fontSize:".82rem",opacity:.5}}>جاري تحضير القائمة...</p>
    </div>
  );

  /* ════ LANDING ════ */
  if(screen==="landing")return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)",position:"relative",overflow:"hidden",textAlign:"center",padding:24}}>
        {FLOATERS.map((f,i)=>(<div key={i} style={{position:"absolute",fontSize:"1.7rem",opacity:.15,left:f.l,top:f.t,animation:`floatUp ${f.d}s ease-in-out ${f.dl}s infinite`,pointerEvents:"none"}}>{f.e}</div>))}
        <div className="fade-up" style={{maxWidth:400}}>
          <div style={{width:100,height:100,borderRadius:"50%",border:"2px solid #C8A96A33",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",animation:"glow 3s ease-in-out infinite",fontSize:"2.8rem"}}>🍕</div>
          <h1 style={{fontSize:"clamp(2.6rem,9vw,4rem)",fontWeight:900,background:"linear-gradient(135deg,#C8A96A,#E5D3B3,#8B6B4A,#C8A96A)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite",lineHeight:1.1,marginBottom:11}}>{siteName}</h1>
          <p style={{fontSize:"clamp(.85rem,3vw,.95rem)",color:"#8B6B4A",marginBottom:44,fontWeight:300,letterSpacing:".5px",lineHeight:1.8}}>{slogan}</p>
          <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"15px 48px",borderRadius:"50px",fontSize:"1rem",fontWeight:700,color:"#0f0f0f",letterSpacing:"1px",animation:"glow 3s ease-in-out infinite"}}>ابدأ الطلب ✨</button>
        </div>
      </div>
    </div>
  );

  /* ════ MENU ════ */
  if(screen==="menu"){
    // تجميع البيتزا حسب القسم
    const grouped = menuSections.map(sec => ({
      ...sec,
      items: pizzasMenu.filter(p=>p.menuSection===sec.id),
    }));
    // بيتزا بدون قسم محدد
    const unsectioned = pizzasMenu.filter(p=>!p.menuSection||!menuSections.find(s=>s.id===p.menuSection));

    return(
      <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0f0f0f",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
        <style>{CSS}</style>

        {/* ── Header ── */}
        <div style={{position:"sticky",top:0,zIndex:30,background:"#0f0f0f",borderBottom:"1px solid #161616"}}>
          <div style={{padding:"12px 15px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"1.1rem",fontWeight:900,background:"linear-gradient(90deg,#C8A96A,#E5D3B3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{siteName}</span>
            <button onClick={()=>setScreen("summary")} style={{position:"relative",background:"#1a1a1a",border:"1px solid #C8A96A2a",borderRadius:9,color:"#C8A96A",padding:"7px 12px",cursor:"pointer",fontSize:".76rem",fontFamily:"inherit"}}>
              🧾 الطلب
              {cart.length>0&&<span style={{position:"absolute",top:-5,left:-5,background:"#C8A96A",color:"#0f0f0f",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".55rem",fontWeight:700}}>{cart.length}</span>}
            </button>
          </div>


        </div>

        {/* ── العروض المميزة ── */}
        <div style={{paddingTop:16}}>
          <p style={{fontSize:".6rem",color:"#C8A96A55",letterSpacing:"3px",padding:"0 15px 9px"}}>⭐ العروض المميّزة</p>
          <FeaturedSlider featured={featured} onCardClick={fp=>{
            if(fp.sizes?.length&&!fp.sliceCount){setBuilderPizza(fp);setKhanamSize(null);setScreen("khanum");}
            else if(fp.sliceCount>0){setBuilderPizza(fp);setSliceFlavors({});setSelectedSlices(new Set());setScreen("builder");}
            else{setBuilderPizza(fp);setSliceFlavors({});setSelectedSlices(new Set());setScreen("builder");}
          }}/>
        </div>

        {/* ── أقسام القائمة — sticky تتبع الصفحة + تتغير مع التمرير ── */}
        {menuSections.length>0&&(
          <div className="sec-tabs"
            style={{padding:"12px 15px 10px",
              position:"sticky",top:52,zIndex:25,
              background:"linear-gradient(180deg,#0f0f0f 85%,transparent)",
              backdropFilter:"blur(8px)"}}>
            {grouped.filter(s=>s.items.length>0).map(sec=>(
              <button key={sec.id}
                className={`sec-tab${activeSection===sec.id?" on":""}`}
                onClick={()=>scrollToSection(sec.id)}>
                <span>{sec.emoji}</span>{sec.label}
              </button>
            ))}
            {unsectioned.length>0&&(
              <button className={`sec-tab${activeSection==="__other__"?" on":""}`} onClick={()=>scrollToSection("__other__")}>
                🍕 أخرى
              </button>
            )}
          </div>
        )}

        {/* ── القائمة مقسّمة بالأقسام ── */}
        <div ref={menuScrollRef} style={{padding:"14px 15px 0"}}>

          {grouped.filter(s=>s.items.length>0).map(sec=>(
            <div key={sec.id} ref={el=>sectionRefs.current[sec.id]=el} data-section-id={sec.id} style={{marginBottom:28}}>
              <p style={{fontSize:".6rem",color:"#C8A96A55",letterSpacing:"3px",marginBottom:12}}>{sec.emoji} {sec.label.toUpperCase()}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {sec.items.map((p,pi)=>(
                  <div key={p.id||p._id} className={`${p.comingSoon?"":"card-tap"} item-anim`} data-animate="1"
                    style={{background:"#131313",border:"1px solid #1c1c1c",borderRadius:13,overflow:"hidden",cursor:p.comingSoon?"default":"pointer",opacity:p.comingSoon?.5:1}}
                    onClick={()=>{if(p.comingSoon)return;setDetailPizza(p);setDetailSize(null);setExtraSels({});setScreen("pizza_detail");}}>
                    <PizzaImg imageUrl={p.imageUrl} label={p.label} style={{width:"100%",height:88,borderRadius:0}}/>
                    <div style={{padding:"8px 8px 10px"}}>
                      <p style={{fontSize:".74rem",fontWeight:600,color:p.comingSoon?"#444":"#E5D3B3",marginBottom:3}}>{p.label}</p>
                      {p.comingSoon?<span style={{fontSize:".55rem",background:"#C8A96A14",color:"#C8A96A77",padding:"2px 7px",borderRadius:19}}>قريباً</span>
                        :<p style={{fontSize:".58rem",color:"#444",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* بيتزا بدون قسم */}
          {unsectioned.length>0&&(
            <div ref={el=>sectionRefs.current["__other__"]=el} data-section-id="__other__" style={{marginBottom:28}}>
              <p style={{fontSize:".6rem",color:"#C8A96A55",letterSpacing:"3px",marginBottom:12}}>🍕 القائمة</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {unsectioned.map((p,pi)=>(
                  <div key={p.id||p._id} className={`${p.comingSoon?"":"card-tap"} item-anim`} data-animate="1"
                    style={{background:"#131313",border:"1px solid #1c1c1c",borderRadius:13,overflow:"hidden",cursor:p.comingSoon?"default":"pointer",opacity:p.comingSoon?.5:1}}
                    onClick={()=>{if(p.comingSoon)return;setDetailPizza(p);setDetailSize(null);setExtraSels({});setScreen("pizza_detail");}}>
                    <PizzaImg imageUrl={p.imageUrl} label={p.label} style={{width:"100%",height:88,borderRadius:0}}/>
                    <div style={{padding:"8px 8px 10px"}}>
                      <p style={{fontSize:".74rem",fontWeight:600,color:p.comingSoon?"#444":"#E5D3B3",marginBottom:3}}>{p.label}</p>
                      {p.comingSoon?<span style={{fontSize:".55rem",background:"#C8A96A14",color:"#C8A96A77",padding:"2px 7px",borderRadius:19}}>قريباً</span>
                        :<p style={{fontSize:".58rem",color:"#444",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cart.length>0&&(
          <div style={{position:"fixed",bottom:18,left:"50%",transform:"translateX(-50%)",zIndex:40}}>
            <button className="btn-gold pop-in" onClick={()=>setScreen("summary")} style={{padding:"12px 24px",borderRadius:"50px",fontSize:".86rem",fontWeight:700,color:"#0f0f0f",boxShadow:"0 8px 28px #00000099",display:"flex",alignItems:"center",gap:9}}>
              <span>🧾 عرض الطلب</span>
              <span style={{background:"#0f0f0f22",borderRadius:20,padding:"2px 9px",fontSize:".78rem"}}>{fmt(cartTotal)} ل.س</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ════ BUILDER ════ */
  if(screen==="builder"&&builderPizza){
    const{sliceCount,cols}=builderPizza;
    const filledCount=Object.keys(sliceFlavors).length;
    const usedMap=flavors.reduce((a,f)=>({...a,[f.id]:Object.values(sliceFlavors).filter(v=>v===f.id).length}),{});
    return(
      <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:120}}>
        <style>{CSS}</style>
        <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"12px 15px",display:"flex",alignItems:"center",gap:11}}>
          <button onClick={()=>setScreen("menu")} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.5rem",lineHeight:1,padding:0}}>‹</button>
          <div style={{flex:1}}>
            <h2 style={{fontSize:".92rem",fontWeight:700,color:"#E5D3B3"}}>{builderPizza.label}</h2>
            <p style={{fontSize:".63rem",color:"#8B6B4A"}}>{selectedSlices.size>0?`${selectedSlices.size} شريحة محددة — اختر نكهة`:`${filledCount}/${sliceCount} شرائح`}</p>
          </div>
          <div style={{display:"flex",gap:3}}>{Array.from({length:sliceCount},(_,i)=>(<div key={i} style={{width:6,height:6,borderRadius:"50%",background:sliceFlavors[i]?"#C8A96A":"#1a1a1a",transition:"background .3s"}}/>))}</div>
        </div>
        <div style={{padding:"13px 15px 0"}}>
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:11,padding:"8px 13px",marginBottom:13,display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:"1rem"}}>{selectedSlices.size===0?"☝️":"🎨"}</span>
            <p style={{fontSize:".7rem",color:"#8B6B4A",lineHeight:1.5}}>{selectedSlices.size===0?"اضغط على شريحة أو أكثر، ثم اختر النكهة":`${selectedSlices.size} شريحة — اضغط على نكهة`}</p>
          </div>
          <div style={{background:"linear-gradient(135deg,#1c1008,#100a04)",border:"2px solid #C8A96A1a",borderRadius:15,padding:11,marginBottom:15}}>
            <p style={{fontSize:".56rem",color:"#C8A96A2a",textAlign:"center",marginBottom:9,letterSpacing:"2px"}}>{builderPizza.label}</p>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:5}}>
              {Array.from({length:sliceCount},(_,i)=>{
                const fid=sliceFlavors[i];const fi=fid?flavors.find(f=>f.id===fid):null;const isSel=selectedSlices.has(i);
                return(
                  <div key={i} className={`slice-cell${isSel?" sel":fid?" fld":""}`} onClick={()=>toggleSlice(i)}>
                    {fid?<><PizzaImg imageUrl={fi?.flavorImageUrl||""} label="" style={{width:"100%",height:28,borderRadius:3}}/><span style={{fontSize:".48rem",color:"#C8A96A",fontWeight:700,textAlign:"center",lineHeight:1.2}}>{fi?.label}</span></>
                       :<><div style={{width:16,height:16,borderRadius:3,border:`1.5px ${isSel?"solid #4DA6FF":"dashed #222"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<div style={{width:7,height:7,borderRadius:"50%",background:"#4DA6FF"}}/>}</div><span style={{fontSize:".48rem",color:"#1e1e1e"}}>{i+1}</span></>}
                  </div>
                );
              })}
            </div>
          </div>
          {filledCount>0&&<div className="pop-in" style={{marginBottom:11}}><button className="btn-gold" onClick={addBuilderToCart} style={{width:"100%",padding:"11px",borderRadius:11,fontSize:".86rem",fontWeight:700,color:"#0f0f0f"}}>إضافة للطلب — {builderPizza.priceOld} ل.س</button></div>}
          <p style={{fontSize:".6rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:9}}>النكهات المتاحة</p>
          <FlavorGrid onPick={applyFlavor} usedMap={usedMap}/>
          {filledCount>0&&<button onClick={()=>{setSliceFlavors({});setSelectedSlices(new Set());}} style={{marginTop:11,width:"100%",padding:9,background:"none",border:"1px solid #1a1a1a",borderRadius:11,color:"#333",cursor:"pointer",fontFamily:"inherit",fontSize:".72rem"}}>🔄 إعادة التعيين</button>}
        </div>
      </div>
    );
  }

  /* ════ KHANUM ════ */
  if(screen==="khanum"&&builderPizza)return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
      <style>{CSS}</style>
      <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"12px 15px",display:"flex",alignItems:"center",gap:11}}>
        <button onClick={()=>{setScreen("menu");setKhanamSize(null);}} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.5rem",lineHeight:1,padding:0}}>‹</button>
        <div><h2 style={{fontSize:".92rem",fontWeight:700,color:"#E5D3B3"}}>بيتزا خانم</h2><p style={{fontSize:".62rem",color:"#8B6B4A"}}>{khanamSize?"اختر نكهة المنتصف":"اختر الحجم أولاً"}</p></div>
      </div>
      <div style={{padding:"16px 15px"}}>
        <div style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:15,padding:13,marginBottom:18,display:"flex",gap:12,alignItems:"flex-start"}}>
          <PizzaImg imageUrl={builderPizza.imageUrl} label="" style={{width:76,height:76,borderRadius:11,flexShrink:0}}/>
          <div><p style={{fontSize:".87rem",fontWeight:700,color:"#C8A96A",marginBottom:5}}>بيتزا خانم</p><p style={{fontSize:".68rem",color:"#8B6B4A",lineHeight:1.6}}>{builderPizza.desc}</p></div>
        </div>
        {!khanamSize&&(
          <div>
            <p style={{fontSize:".6rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:11}}>اختر الحجم</p>
            <div style={{display:"flex",gap:9}}>
              {(builderPizza.sizes||[]).map(sz=>(
                <button key={sz.id} className="size-btn" onClick={()=>setKhanamSize(sz)} style={{padding:"14px 8px"}}>
                  <div style={{fontSize:"1.3rem",marginBottom:5}}>{sz.id==="sm"?"🔸":"🔶"}</div>
                  <div style={{color:"#E5D3B3",marginBottom:4}}>{sz.label}</div>
                  <div style={{fontSize:".8rem",fontWeight:700,color:"#C8A96A"}}>{sz.priceOld} ل.س</div>
                  <div style={{fontSize:".58rem",color:"#8B6B4A"}}>{sz.priceNew} ل.ج</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {khanamSize&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
              <p style={{fontSize:".6rem",color:"#8B6B4A",letterSpacing:"2px"}}>نكهة المنتصف</p>
              <button onClick={()=>setKhanamSize(null)} style={{fontSize:".66rem",color:"#444",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>← تغيير الحجم</button>
            </div>
            <FlavorGrid onPick={addKhanamToCart}/>
          </div>
        )}
      </div>
    </div>
  );

  /* ════ PIZZA DETAIL ════ */
  if(screen==="pizza_detail"&&detailPizza){
    const sizes=detailPizza.sizes?.length?detailPizza.sizes:DEFAULT_SIZES;
    const hasExtras=(detailPizza.extras||[]).length>0;
    const eTotal=extrasTotal(detailPizza,extraSels);
    const totalNow=getNum(detailSize)+eTotal;
    return(
      <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
        <style>{CSS}</style>
        <Header title={detailPizza.label} onBack={()=>setScreen("menu")}/>
        <div style={{padding:"16px 15px"}}>
          <PizzaImg imageUrl={detailPizza.imageUrl} label={detailPizza.label} style={{width:"100%",height:195,borderRadius:16,marginBottom:18}}/>
          <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"#E5D3B3",marginBottom:7}}>{detailPizza.label}</h2>
          {detailPizza.details&&<p style={{fontSize:".76rem",color:"#8B6B4A",lineHeight:1.7,marginBottom:22,borderRight:"2px solid #C8A96A2a",paddingRight:11}}>{detailPizza.details}</p>}
          <p style={{fontSize:".6rem",color:"#C8A96A66",letterSpacing:"2px",marginBottom:11}}>اختر الحجم</p>
          <div style={{display:"flex",gap:9,marginBottom:22}}>
            {sizes.map(sz=>(
              <button key={sz.id} className={`size-btn${detailSize?.id===sz.id?" on":""}`} onClick={()=>setDetailSize(sz)}>
                <div style={{marginBottom:3,fontWeight:700}}>{sz.label}</div>
                <div style={{fontSize:".78rem",fontWeight:700,color:detailSize?.id===sz.id?"#0f0f0f":"#C8A96A"}}>{sz.priceOld||fmt(getNum(sz))} ل.س</div>
                <div style={{fontSize:".58rem",opacity:.7,marginTop:2}}>{sz.priceNew} ل.ج</div>
              </button>
            ))}
          </div>
          {hasExtras&&(<>
            <div style={{height:1,background:"#1a1a1a",marginBottom:20}}/>
            <p style={{fontSize:".6rem",color:"#C8A96A66",letterSpacing:"2px",marginBottom:14}}>الإضافات</p>
            <ExtrasSelector extras={detailPizza.extras} selections={extraSels} onChange={(gid,val)=>setExtraSels(p=>({...p,[gid]:val===null?undefined:val}))}/>
          </>)}
          {detailSize&&eTotal>0&&(
            <div style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:11,padding:"10px 13px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".72rem",color:"#8B6B4A",marginBottom:4}}><span>البيتزا</span><span>{detailSize.priceOld} ل.س</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".72rem",color:"#8B6B4A",marginBottom:6}}><span>الإضافات</span><span>+ {fmt(eTotal)} ل.س</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".84rem",fontWeight:700,color:"#C8A96A",borderTop:"1px solid #1e1e1e",paddingTop:6}}><span>المجموع</span><span>{fmt(totalNow)} ل.س</span></div>
            </div>
          )}
          <button className="btn-gold" disabled={!detailSize||!extrasValid} onClick={addDetailToCart} style={{width:"100%",padding:"13px",borderRadius:11,fontSize:".9rem",fontWeight:700,color:"#0f0f0f"}}>
            {!detailSize?"اختر الحجم أولاً":!extrasValid?"أكمل الإضافات الإلزامية":`إضافة للطلب — ${fmt(totalNow)} ل.س`}
          </button>
        </div>
      </div>
    );
  }

  /* ════ SUMMARY ════ */
  if(screen==="summary")return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:50}}>
      <style>{CSS}</style>
      <Header title="ملخّص الطلب" onBack={()=>setScreen("menu")}/>
      <div style={{padding:"16px 15px"}}>
        {cart.length===0?(
          <div style={{textAlign:"center",padding:"56px 20px"}}>
            <div style={{fontSize:"3.5rem",marginBottom:12,opacity:.16}}>🛒</div>
            <p style={{color:"#8B6B4A",fontSize:".85rem",marginBottom:18}}>لا يوجد طلبات بعد</p>
            <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"11px 26px",borderRadius:30,fontSize:".83rem",fontWeight:700,color:"#0f0f0f"}}>تصفّح القائمة</button>
          </div>
        ):(
          <>
            <p style={{fontSize:".6rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:11}}>الطلبات ({cart.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
              {cart.map(item=>(
                <div key={item.uid} style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:13,padding:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                    <div style={{flex:1}}><p style={{fontWeight:600,color:"#E5D3B3",fontSize:".84rem"}}>{item.label}{item.size&&` (${item.size})`}</p><p style={{fontSize:".6rem",color:"#444",marginTop:2,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.details}</p></div>
                    <div style={{textAlign:"left",marginRight:9,flexShrink:0}}><div style={{fontSize:".78rem",fontWeight:700,color:"#C8A96A"}}>{fmt(item.numericPrice)} ل.س</div></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",border:"1px solid #222",borderRadius:9,overflow:"hidden"}}>
                      <button onClick={()=>updateQty(item.uid,-1)} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",width:32,height:30,fontSize:"1rem",fontFamily:"inherit"}}>−</button>
                      <span style={{width:28,textAlign:"center",fontSize:".82rem",fontWeight:600,color:"#E5D3B3"}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.uid,+1)} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",width:32,height:30,fontSize:"1rem",fontFamily:"inherit"}}>+</button>
                    </div>
                    <span style={{fontSize:".78rem",color:"#C8A96A",fontWeight:700}}>{fmt(item.numericPrice*item.qty)} ل.س</span>
                    <button onClick={()=>removeItem(item.uid)} style={{background:"#180f0f",border:"1px solid #2a1818",borderRadius:7,color:"#6a2a2a",cursor:"pointer",width:30,height:30,fontSize:".8rem",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{borderTop:"1px solid #161616",paddingTop:13,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#8B6B4A",fontSize:".83rem"}}>المجموع</span>
              <div style={{textAlign:"left"}}><div style={{fontSize:"1.2rem",fontWeight:900,color:"#C8A96A"}}>{fmt(cartTotal)} ل.س</div></div>
            </div>

            {/* طريقة الاستلام */}
            <p style={{fontSize:".6rem",color:errors.delivery?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:9}}>{errors.delivery?"⚠ هذا الحقل إلزامي":"طريقة الاستلام *"}</p>
            <div style={{display:"flex",gap:9,marginBottom:14}}>
              {[{v:"pickup",l:"🏪 استلام من الفرع"},{v:"delivery",l:"🛵 توصيل"}].map(o=>(
                <button key={o.v} className={`del-btn${deliveryType===o.v?" on":""}`}
                  onClick={()=>{setDeliveryType(o.v);setErrors(e=>({...e,delivery:false}));}}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* استلام من الفرع: زر ذهاب فقط */}
            {deliveryType==="pickup"&&(
              <div style={{marginBottom:18}}>
                <div style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:13,padding:14}}>
                  <p style={{fontSize:".82rem",fontWeight:700,color:"#C8A96A",marginBottom:3}}>{BRANCH.name}</p>
                  <p style={{fontSize:".68rem",color:"#8B6B4A",marginBottom:14}}>حماة — سوريا</p>
                  <a href={BRANCH.googleMaps} target="_blank" rel="noopener noreferrer"
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      padding:"12px",borderRadius:11,
                      background:"linear-gradient(135deg,#1a3a1a,#0d1a0d)",
                      border:"1px solid #4CAF5033",color:"#4CAF50",
                      fontSize:".86rem",fontWeight:700,fontFamily:"inherit",textDecoration:"none"}}>
                    🗺 ذهاب للموقع على خرائط جوجل
                  </a>
                </div>
              </div>
            )}

            {/* توصيل: خريطة التوصيل */}
            {deliveryType==="delivery"&&(
              <div style={{marginBottom:16}}>
                <p style={{fontSize:".6rem",color:errors.location?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:9}}>{errors.location?"⚠ حدد موقعك":"📍 حدد موقعك على الخريطة *"}</p>
                <DeliveryMap onSelect={coords=>{setMapCoords(coords);setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`);setErrors(ev=>({...ev,location:false}));}}/>
                {mapCoords&&<div style={{background:"#0d1a0d",border:"1px solid #4CAF5033",borderRadius:9,padding:"7px 12px",marginBottom:9,fontSize:".7rem",color:"#4CAF50"}}>✓ تم تحديد موقعك</div>}
                <p style={{fontSize:".62rem",color:"#333",marginBottom:7}}>أو اكتب العنوان يدوياً</p>
                <textarea rows={2} placeholder="المحافظة، الحي، الشارع..." value={mapCoords?"":locationTxt}
                  onChange={e=>{setLocationTxt(e.target.value);setMapCoords(null);setErrors(ev=>({...ev,location:false}));}}
                  style={{resize:"none",width:"100%",padding:"10px 12px",background:"#161616",border:`1px solid ${errors.location?"#ef4444":"#252525"}`,borderRadius:10,color:"#E5D3B3",fontFamily:"inherit",fontSize:".82rem",outline:"none"}}/>
              </div>
            )}

            {/* رقم الهاتف */}
            <p style={{fontSize:".6rem",color:errors.phone?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:7}}>{errors.phone?"⚠ رقم الهاتف إلزامي":"رقم الهاتف *"}</p>
            <input type="tel" placeholder="09xxxxxxxx" value={phone} maxLength={10}
              onChange={e=>{const v=e.target.value.replace(/\D/g,"");setPhone(v);setErrors(ev=>({...ev,phone:false}));}}
              style={{width:"100%",padding:"10px 12px",background:"#161616",border:`1px solid ${errors.phone||(phone.length>0&&phone.length!==10)?"#ef4444":"#252525"}`,borderRadius:10,color:"#E5D3B3",fontFamily:"inherit",fontSize:".86rem",outline:"none",marginBottom:4}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <p style={{fontSize:".58rem",color:"#252525"}}>10 أرقام بالضبط</p>
              <span style={{fontSize:".58rem",fontWeight:700,color:phone.length===0?"#222":phone.length===10?"#4CAF50":"#ef4444"}}>{phone.length}/10</span>
            </div>

            <button className="btn-gold" disabled={!canCheckout} onClick={checkout}
              style={{width:"100%",padding:"13px",borderRadius:12,fontSize:".9rem",fontWeight:700,color:"#0f0f0f",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <span style={{fontSize:"1rem"}}>📲</span>إرسال الطلب عبر واتساب
            </button>
            {!canCheckout&&<p style={{textAlign:"center",fontSize:".6rem",color:"#252525",marginTop:7}}>
              {!phoneValid?phone.length===0?"أدخل رقم هاتفك":`الرقم يجب أن يكون 10 أرقام`:!deliveryType?"اختر طريقة الاستلام":"أدخل موقعك لإتمام الطلب"}
            </p>}
          </>
        )}
      </div>
    </div>
  );

  return null;
}
