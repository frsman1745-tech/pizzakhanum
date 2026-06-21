import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PizzaImg from "./components/PizzaImg.jsx";
import Header from "./components/Header.jsx";
import DeliveryMap from "./components/DeliveryMap.jsx";
import FeaturedSlider from "./components/FeaturedSlider.jsx";
import ExtrasSelector from "./components/ExtrasSelector.jsx";
import FlavorGrid from "./components/FlavorGrid.jsx";
import { useCart } from "./hooks/useCart.js";
import { useSettings } from "./contexts/SettingsContext.jsx";
import { t } from "./translations.js";
import { translateFullData } from "./lib/translate.js";

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
  const { theme, lang, toggleTheme, toggleLang } = useSettings();
  const { cart, cartTotal, addToCart, updateQty, removeItem } = useCart();
  const [builderExtras, setBuilderExtras]   = useState({});
  const [phone,         setPhone]          = useState("");
  const [deliveryType,  setDeliveryType]   = useState("");
  const [locationTxt,   setLocationTxt]    = useState("");
  const [mapCoords,     setMapCoords]      = useState(null);
  const [errors,        setErrors]         = useState({});
  const [activeSection, setActiveSection]  = useState("");
  const [translating,   setTranslating]    = useState(false);
  const [translated,    setTranslated]     = useState(null);

  useEffect(() => {
    if (lang === "ar" || loading) { setTranslated(null); setTranslating(false); return; }
    if (!pizzasMenu.length) return;
    let cancelled = false;
    setTranslating(true);
    (async () => {
      try {
        const result = await translateFullData(
          { menu: pizzasMenu, featured, sections: menuSections },
          lang
        );
        if (!cancelled && result) {
          setTranslated({
            menu: result.menu?.length ? result.menu : pizzasMenu,
            featured: result.featured?.length ? result.featured : featured,
            sections: result.sections?.length ? result.sections : menuSections,
          });
        }
      } catch (e) { console.error("[translate]", e); }
      if (!cancelled) setTranslating(false);
    })();
    return () => { cancelled = true; };
  }, [lang, loading, pizzasMenu, featured, menuSections]);

  const displayFeatured = translated?.featured || featured;
  const displayMenu = translated?.menu || pizzasMenu;
  const displaySectionsArr = translated?.sections || menuSections;

  const [siteName, setSiteName] = useState(() => {
    try { const v = localStorage.getItem("site_name"); return v ? JSON.parse(v) : null; } catch {}
    return "بيتزا خانم";
  });
  const [slogan, setSlogan] = useState(() => {
    try { const v = localStorage.getItem("site_slogan"); return v ? JSON.parse(v) : null; } catch {}
    return t("site_slogan", lang);
  });
  const [wappNum, setWappNum] = useState(() => {
    try { const v = localStorage.getItem("site_whatsapp"); return v ? JSON.parse(v) : null; } catch {}
    return "963998950904";
  });

  const flavors = useMemo(()=>
    displayMenu
      .filter(p => p.flavorImageUrl && p.flavorImageUrl.trim() !== "")
      .map(p=>({id:p.id||p._id,label:p.label,comingSoon:p.comingSoon,flavorImageUrl:p.flavorImageUrl})),
  [displayMenu]);

  const sectionRefs = useRef({});
  const menuScrollRef = useRef(null);

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

  useEffect(()=>{
    fetch("/api/settings").then(r=>r.json()).then(j=>{
      if(!j.success) return;
      const d = j.data;
      if (d.siteName)    { setSiteName(d.siteName);    try{localStorage.setItem("site_name",JSON.stringify(d.siteName))}catch{} }
      if (d.siteSlogan)  { setSlogan(d.siteSlogan);    try{localStorage.setItem("site_slogan",JSON.stringify(d.siteSlogan))}catch{} }
      if (d.siteWhatsapp){ setWappNum(d.siteWhatsapp); try{localStorage.setItem("site_whatsapp",JSON.stringify(d.siteWhatsapp))}catch{} }
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(screen!=="menu") return;
    const scrollTimer = setTimeout(()=>{
      const secObs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting) setActiveSection(e.target.dataset.sectionId||""); });
      },{rootMargin:"-15% 0px -75% 0px",threshold:0});
      Object.values(sectionRefs.current).forEach(el=>{ if(el) secObs.observe(el); });
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
    return()=>clearTimeout(scrollTimer);
  },[screen,displaySectionsArr,displayMenu]);

  function scrollToSection(id){
    const el=sectionRefs.current[id];
    if(el){
      const yOffset = -120;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top:y, behavior:"smooth"});
    }
    setActiveSection(id);
  }

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

  function toggleSlice(idx){setSelectedSlices(p=>{const n=new Set(p);n.has(idx)?n.delete(idx):n.add(idx);return n;});}
  function applyFlavor(fid){if(!selectedSlices.size)return;setSliceFlavors(p=>{const n={...p};selectedSlices.forEach(i=>{n[i]=fid;});return n;});setSelectedSlices(new Set());}

  function addBuilderToCart(){
    const perSlice=Object.entries(sliceFlavors).map(([i,fid])=>`${lang==="ar"?`شريحة ${+i+1}`:`Slice ${+i+1}`}: ${flavors.find(f=>f.id===fid)?.label}`).join(lang==="ar"?"، ":", ");
    const eExtra=extrasTotal(builderPizza,builderExtras);
    const eSummary=extrasSummary(builderPizza,builderExtras);
    const details=[perSlice||"—",eSummary].filter(Boolean).join(" · ");
    addToCart({label:builderPizza.label,size:"",details,priceOld:builderPizza.priceOld,priceNew:builderPizza.priceNew,numericPrice:builderPizza.numericPrice+eExtra});
    setSliceFlavors({});setSelectedSlices(new Set());setBuilderExtras({});setScreen("menu");
  }

  function addKhanamToCart(fid){
    const f=flavors.find(x=>x.id===fid);
    const eExtra=extrasTotal(builderPizza,builderExtras);
    const eSummary=extrasSummary(builderPizza,builderExtras);
    const details=[lang==="ar"?`المنتصف: ${f?.label} • الأطراف: جبنة شيدر`:`Center: ${f?.label} • Edges: Cheddar`,eSummary].filter(Boolean).join(" · ");
    addToCart({label:`${lang==="ar"?"بيتزا خانم":"Pizza Khanum"} — ${khanamSize.label}`,size:khanamSize.label,details,priceOld:khanamSize.priceOld,priceNew:khanamSize.priceNew,numericPrice:getNum(khanamSize)+eExtra});
    setKhanamSize(null);setBuilderExtras({});setScreen("menu");
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
    const isEn = lang === "en";
    const lines=cart.map(i=>`• ${i.label}${i.size?` (${i.size})`:""} × ${i.qty}\n  ${i.details}\n  ${isEn?"Price":`السعر`}: ${i.priceOld||fmt(i.numericPrice)} SYP`).join("\n\n");
    const msg=isEn
      ? [`Hello Pizza Khanum 🍕`,"",`📋 Order:`,lines,"",`💰 Total: ${fmt(cartTotal)} SYP`,`🚗 ${deliveryType==="pickup"?"Pickup from branch":"Delivery"}`,deliveryType==="delivery"?`📍 ${locationTxt}${mapCoords?`\n🗺 https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`:""}`:""," ",`📞 ${phone}`]
      : ["مرحباً بيتزا خانم 🍕","","📋 الطلب:",lines,"",`💰 المجموع: ${fmt(cartTotal)} ل.س`,`🚗 ${deliveryType==="pickup"?"استلام من الفرع":"توصيل"}`,deliveryType==="delivery"?`📍 ${locationTxt}${mapCoords?`\n🗺 https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`:""}`:""," ",`📞 ${phone}`];
    window.open(`https://wa.me/${wappNum}?text=${encodeURIComponent(msg.filter(Boolean).join("\n"))}`,`_blank`);
  }

  const phoneValid  = /^\d{10}$/.test(phone.trim());
  const canCheckout = phoneValid && deliveryType && (deliveryType!=="delivery"||locationTxt.trim());

  /* ════ LOADING ════ */
  if(loading)return(
    <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,color:"var(--text-gold)"}}>
      <div style={{width:36,height:36,border:"3px solid var(--gold-22)",borderTopColor:"var(--text-gold)",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{fontSize:".82rem",opacity:.5}}>{t("loading_menu", lang)}</p>
    </div>
  );

  /* ════ LANDING ════ */
  if(screen==="landing")return(
    <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)"}}>
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--gradient-page)",position:"relative",overflow:"hidden",textAlign:"center",padding:24}}>
        {FLOATERS.map((f,i)=>(<div key={i} style={{position:"absolute",fontSize:"1.7rem",opacity:.15,left:f.l,top:f.t,animation:`floatUp ${f.d}s ease-in-out ${f.dl}s infinite`,pointerEvents:"none"}}>{f.e}</div>))}
        <div className="fade-up" style={{maxWidth:400}}>
          <div style={{width:100,height:100,borderRadius:"50%",border:"2px solid var(--gold-33)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",animation:"glow 3s ease-in-out infinite",fontSize:"2.8rem"}}>🍕</div>
          <h1 style={{fontSize:"clamp(2.6rem,9vw,4rem)",fontWeight:900,background:"var(--gradient-brand-diag)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite",lineHeight:1.1,marginBottom:11}}>{siteName}</h1>
          <p style={{fontSize:"clamp(.85rem,3vw,.95rem)",color:"var(--text-secondary)",marginBottom:44,fontWeight:300,letterSpacing:".5px",lineHeight:1.8}}>{slogan}</p>
          <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"15px 48px",borderRadius:"50px",fontSize:"1rem",fontWeight:700,color:"var(--text-on-gold)",letterSpacing:"1px",animation:"glow 3s ease-in-out infinite"}}>{t("start_order", lang)}</button>
        </div>
      </div>
    </div>
  );

  /* ════ MENU ════ */
  if(screen==="menu"){
    const grouped = displaySectionsArr.map(sec => ({
      ...sec,
      items: displayMenu.filter(p=>p.menuSection===sec.id),
    }));
    const unsectioned = displayMenu.filter(p=>!p.menuSection||!displaySectionsArr.find(s=>s.id===p.menuSection));

    return(
      <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page)",minHeight:"100vh",color:"var(--text-primary)",paddingBottom:100}}>

        <div style={{position:"sticky",top:0,zIndex:30,background:"var(--bg-page)",borderBottom:"1px solid var(--border-input)"}}>
          <div style={{padding:"12px 15px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"1.1rem",fontWeight:900,background:"var(--gradient-brand)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{siteName}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <button onClick={toggleLang} style={{background:"var(--bg-card-hover)",border:"1px solid var(--gold-2a)",borderRadius:8,color:"var(--text-gold)",padding:"5px 9px",cursor:"pointer",fontSize:".7rem",fontWeight:700,fontFamily:"inherit", opacity:translating?0.5:1}}>
                {lang==="ar"?"EN":"AR"}
              </button>
              <button onClick={toggleTheme} style={{background:"var(--bg-card-hover)",border:"1px solid var(--gold-2a)",borderRadius:8,color:"var(--text-gold)",width:32,height:32,cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center"}}>
                {theme==="dark"?"🌙":"☀️"}
              </button>
              <button onClick={()=>setScreen("summary")} style={{position:"relative",background:"var(--bg-card-hover)",border:"1px solid var(--gold-2a)",borderRadius:9,color:"var(--text-gold)",padding:"7px 12px",cursor:"pointer",fontSize:".76rem",fontFamily:"inherit"}}>
                🧾 {t("order", lang)}
                {cart.length>0&&<span style={{position:"absolute",top:-5,left: lang==="ar"?-5:"auto",right: lang==="ar"?"auto":-5,background:"var(--bg-gold)",color:"var(--text-on-gold)",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".55rem",fontWeight:700}}>{cart.length}</span>}
              </button>
            </div>
          </div>
          {translating && (
            <div style={{height:2,background:"var(--gold-22)",overflow:"hidden"}}>
              <div style={{height:"100%",width:"30%",background:"var(--text-gold)",borderRadius:2,animation:"trSlide 1.2s linear infinite"}}/>
            </div>
          )}
        </div>

        <div style={{paddingTop:16}}>
          <p style={{fontSize:".6rem",color:"var(--gold-55)",letterSpacing:"3px",padding:"0 15px 9px"}}>⭐ {t("featured_title", lang)}</p>
          <FeaturedSlider featured={displayFeatured} lang={lang} onCardClick={fp=>{
            setBuilderExtras({});
            if(fp.sizes?.length&&!fp.sliceCount){setBuilderPizza(fp);setKhanamSize(null);setScreen("khanum");}
            else if(fp.sliceCount>0){setBuilderPizza(fp);setSliceFlavors({});setSelectedSlices(new Set());setScreen("builder");}
            else{setBuilderPizza(fp);setSliceFlavors({});setSelectedSlices(new Set());setScreen("builder");}
          }}/>
        </div>

        {displaySectionsArr.length>0&&(
          <div className="sec-tabs"
            style={{padding:"12px 15px 10px",position:"sticky",top:52,zIndex:25,
              background:"var(--gradient-fade)",backdropFilter:"blur(8px)"}}>
            {grouped.filter(s=>s.items.length>0).map(sec=>(
              <button key={sec.id}
                className={`sec-tab${activeSection===sec.id?" on":""}`}
                onClick={()=>scrollToSection(sec.id)}>
                <span>{sec.emoji}</span>{sec.label}
              </button>
            ))}
            {unsectioned.length>0&&(
              <button className={`sec-tab${activeSection==="__other__"?" on":""}`} onClick={()=>scrollToSection("__other__")}>
                {t("section_other", lang)}
              </button>
            )}
          </div>
        )}

        <div ref={menuScrollRef} style={{padding:"14px 15px 0"}}>

          {grouped.filter(s=>s.items.length>0).map(sec=>(
            <div key={sec.id} ref={el=>sectionRefs.current[sec.id]=el} data-section-id={sec.id} style={{marginBottom:28}}>
              <p style={{fontSize:".6rem",color:"var(--gold-55)",letterSpacing:"3px",marginBottom:12}}>{sec.emoji} {sec.label.toUpperCase()}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {sec.items.map((p,pi)=>(
                  <div key={p.id||p._id} className={`${p.comingSoon?"":"card-tap"} item-anim`} data-animate="1"
                    style={{background:"var(--bg-card-alt)",border:"1px solid var(--border-card)",borderRadius:"var(--radius-lg)",overflow:"hidden",cursor:p.comingSoon?"default":"pointer",opacity:p.comingSoon?.5:1}}
                    onClick={()=>{if(p.comingSoon)return;setDetailPizza(p);setDetailSize(null);setExtraSels({});setScreen("pizza_detail");}}>
                    <PizzaImg imageUrl={p.imageUrl} label={p.label} style={{width:"100%",height:88,borderRadius:0}}/>
                    <div style={{padding:"8px 8px 10px"}}>
                      <p style={{fontSize:".74rem",fontWeight:600,color:p.comingSoon?"var(--text-muted-2)":"var(--text-primary)",marginBottom:3}}>{p.label}</p>
                      {p.comingSoon?<span style={{fontSize:".55rem",background:"var(--bg-gold-dim)",color:"var(--gold-77)",padding:"2px 7px",borderRadius:19}}>{t("coming_soon", lang)}</span>
                        :<p style={{fontSize:".58rem",color:"var(--text-muted-2)",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {unsectioned.length>0&&(
            <div ref={el=>sectionRefs.current["__other__"]=el} data-section-id="__other__" style={{marginBottom:28}}>
              <p style={{fontSize:".6rem",color:"var(--gold-55)",letterSpacing:"3px",marginBottom:12}}>🍕 {t("menu", lang)}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {unsectioned.map((p,pi)=>(
                  <div key={p.id||p._id} className={`${p.comingSoon?"":"card-tap"} item-anim`} data-animate="1"
                    style={{background:"var(--bg-card-alt)",border:"1px solid var(--border-card)",borderRadius:"var(--radius-lg)",overflow:"hidden",cursor:p.comingSoon?"default":"pointer",opacity:p.comingSoon?.5:1}}
                    onClick={()=>{if(p.comingSoon)return;setDetailPizza(p);setDetailSize(null);setExtraSels({});setScreen("pizza_detail");}}>
                    <PizzaImg imageUrl={p.imageUrl} label={p.label} style={{width:"100%",height:88,borderRadius:0}}/>
                    <div style={{padding:"8px 8px 10px"}}>
                      <p style={{fontSize:".74rem",fontWeight:600,color:p.comingSoon?"var(--text-muted-2)":"var(--text-primary)",marginBottom:3}}>{p.label}</p>
                      {p.comingSoon?<span style={{fontSize:".55rem",background:"var(--bg-gold-dim)",color:"var(--gold-77)",padding:"2px 7px",borderRadius:19}}>{t("coming_soon", lang)}</span>
                        :<p style={{fontSize:".58rem",color:"var(--text-muted-2)",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {cart.length>0&&(
          <div style={{position:"fixed",bottom:18,left:"50%",transform:"translateX(-50%)",zIndex:40}}>
            <button className="btn-gold pop-in" onClick={()=>setScreen("summary")} style={{padding:"12px 24px",borderRadius:"50px",fontSize:".86rem",fontWeight:700,color:"var(--text-on-gold)",boxShadow:"0 8px 28px #00000099",display:"flex",alignItems:"center",gap:9}}>
              <span>🧾 {t("order", lang)}</span>
              <span style={{background:"rgba(0,0,0,.133)",borderRadius:20,padding:"2px 9px",fontSize:".78rem"}}>{fmt(cartTotal)} {t("syp", lang)}</span>
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
    const bHasExtras=(builderPizza.extras||[]).length>0;
    const bExtraTotal=extrasTotal(builderPizza,builderExtras);
    const bTotalNow=builderPizza.numericPrice+bExtraTotal;
    return(
      <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page-alt)",minHeight:"100vh",color:"var(--text-primary)",paddingBottom:120}}>
        <div style={{position:"sticky",top:0,zIndex:20,background:"var(--bg-page-alt)",borderBottom:"1px solid var(--border-input)",padding:"12px 15px",display:"flex",alignItems:"center",gap:11}}>
          <button onClick={()=>setScreen("menu")} style={{background:"none",border:"none",color:"var(--text-gold)",cursor:"pointer",fontSize:"1.5rem",lineHeight:1,padding:0}}>‹</button>
          <div style={{flex:1}}>
            <h2 style={{fontSize:".92rem",fontWeight:700,color:"var(--text-primary)"}}>{builderPizza.label}</h2>
            <p style={{fontSize:".63rem",color:"var(--text-secondary)"}}>{selectedSlices.size>0?`${selectedSlices.size} ${t("slice_selected", lang)}`:`${filledCount}/${sliceCount} ${t("slices", lang)}`}</p>
          </div>
          <div style={{display:"flex",gap:3}}>{Array.from({length:sliceCount},(_,i)=>(<div key={i} style={{width:6,height:6,borderRadius:"50%",background:sliceFlavors[i]?"var(--text-gold)":"var(--bg-card-hover)",transition:"background .3s"}}/>))}</div>
        </div>
        <div style={{padding:"13px 15px 0"}}>
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border-light)",borderRadius:"var(--radius-md)",padding:"8px 13px",marginBottom:13,display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:"1rem"}}>{selectedSlices.size===0?"☝️":"🎨"}</span>
            <p style={{fontSize:".7rem",color:"var(--text-secondary)",lineHeight:1.5}}>{selectedSlices.size===0?t("tap_slice", lang):`${selectedSlices.size} ${t("slice_pick", lang)}`}</p>
          </div>
          <div style={{background:"var(--gradient-card)",border:"2px solid var(--gold-1a)",borderRadius:"var(--radius-lg)",padding:11,marginBottom:15}}>
            <p style={{fontSize:".56rem",color:"var(--gold-2a)",textAlign:"center",marginBottom:9,letterSpacing:"2px"}}>{builderPizza.label}</p>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:5}}>
              {Array.from({length:sliceCount},(_,i)=>{
                const fid=sliceFlavors[i];const fi=fid?flavors.find(f=>f.id===fid):null;const isSel=selectedSlices.has(i);
                return(
                  <div key={i} className={`slice-cell${isSel?" sel":fid?" fld":""}`} onClick={()=>toggleSlice(i)}>
                    {fid?<><PizzaImg imageUrl={fi?.flavorImageUrl||""} label="" style={{width:"100%",height:28,borderRadius:3}}/><span style={{fontSize:".48rem",color:"var(--text-gold)",fontWeight:700,textAlign:"center",lineHeight:1.2}}>{fi?.label}</span></>
                       :<><div style={{width:16,height:16,borderRadius:3,border:`1.5px ${isSel?"solid #4DA6FF":"dashed var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<div style={{width:7,height:7,borderRadius:"50%",background:"#4DA6FF"}}/>}</div><span style={{fontSize:".48rem",color:"var(--text-chips)"}}>{i+1}</span></>}
                  </div>
                );
              })}
            </div>
          </div>
          {bHasExtras&&(<>
            <div style={{height:1,background:"var(--border-light)",marginBottom:14}}/>
            <p style={{fontSize:".6rem",color:"var(--gold-66)",letterSpacing:"2px",marginBottom:11}}>{t("extras", lang)}</p>
<ExtrasSelector extras={builderPizza.extras} lang={lang} selections={builderExtras} onChange={(gid,val)=>setBuilderExtras(p=>({...p,[gid]:val===null?undefined:val}))}/>
            </>)}
          {/* انتقاء النكهات للشرائح */}
          <div style={{height:1,background:"var(--border-light)",marginBottom:14}}/>
          <p style={{fontSize:".6rem",color:"var(--gold-66)",letterSpacing:"2px",marginBottom:11}}>{t("choose_flavors", lang)}</p>
          <FlavorGrid flavors={flavors} lang={lang} usedMap={usedMap} onPick={applyFlavor}/>
          {/* إضافة إلى السلة */}
          <div style={{height:1,background:"var(--border-light)",margin:14}}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontSize:".78rem",color:"var(--text-secondary)"}}>{t("total_price", lang)}</span>
            <span style={{fontSize:"1.1rem",fontWeight:900,color:"var(--text-gold)"}}>{fmt(bTotalNow)} {t("syp", lang)}</span>
          </div>
          <button className="btn-gold" disabled={filledCount!==sliceCount} onClick={addBuilderToCart}
            style={{width:"100%",padding:"13px",borderRadius:"var(--radius-md)",fontSize:".9rem",fontWeight:700,color:"var(--text-on-gold)",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
            🛒 {t("add_to_cart", lang)}
          </button>
        </div>
      </div>
    );
  }

  /* ════ KHANUM ════ */
  if(screen==="khanum"&&builderPizza){
    const bHasExtras=(builderPizza.extras||[]).length>0;
    const bExtraTotal=extrasTotal(builderPizza,builderExtras);
    const sizes = builderPizza.sizes || [];
    return(
      <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page-alt)",minHeight:"100vh",color:"var(--text-primary)",paddingBottom:120}}>
        <div style={{position:"sticky",top:0,zIndex:20,background:"var(--bg-page-alt)",borderBottom:"1px solid var(--border-input)",padding:"12px 15px",display:"flex",alignItems:"center",gap:11}}>
          <button onClick={()=>setScreen("menu")} style={{background:"none",border:"none",color:"var(--text-gold)",cursor:"pointer",fontSize:"1.5rem",lineHeight:1,padding:0}}>‹</button>
          <div style={{flex:1}}>
            <h2 style={{fontSize:".92rem",fontWeight:700,color:"var(--text-primary)"}}>{builderPizza.label}</h2>
            <p style={{fontSize:".63rem",color:"var(--text-secondary)"}}>{khanamSize?khanamSize.label:t("choose_size", lang)}</p>
          </div>
        </div>
        <div style={{padding:"13px 15px 0"}}>
          {!khanamSize?(
            <div style={{display:"flex",gap:9,marginBottom:18}}>
              {sizes.map(sz=>(
                <button key={sz.id}
                  className="size-btn"
                  onClick={()=>setKhanamSize(sz)}
                  style={{padding:"12px 10px"}}>
                  <div style={{fontSize:".82rem",fontWeight:700,color:"var(--text-primary)",marginBottom:3}}>{sz.label}</div>
                  <div style={{fontSize:".68rem",color:"var(--text-gold)",fontWeight:600}}>{sz.priceOld} {t("syp", lang)}</div>
                </button>
              ))}
            </div>
          ):(
            <>
              {bHasExtras&&(<>
                <p style={{fontSize:".6rem",color:"var(--gold-66)",letterSpacing:"2px",marginBottom:11}}>{t("extras", lang)}</p>
                <ExtrasSelector extras={builderPizza.extras} lang={lang} selections={builderExtras} onChange={(gid,val)=>setBuilderExtras(p=>({...p,[gid]:val===null?undefined:val}))}/>
              </>)}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
                <p style={{fontSize:".6rem",color:"var(--text-secondary)",letterSpacing:"2px"}}>{t("center_flavor", lang)}</p>
                <button onClick={()=>setKhanamSize(null)} style={{fontSize:".66rem",color:"var(--text-muted-2)",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>← {t("change_size", lang)}</button>
              </div>
              <FlavorGrid flavors={flavors} lang={lang} onPick={addKhanamToCart}/>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ════ PIZZA DETAIL ════ */
  if(screen==="pizza_detail"&&detailPizza){
    const sizes=detailPizza.sizes||DEFAULT_SIZES;
    const hasExtras=(detailPizza.extras||[]).length>0;
    const eTotal=extrasTotal(detailPizza,extraSels);
    return(
      <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page-alt)",minHeight:"100vh",color:"var(--text-primary)",paddingBottom:120}}>
        <Header title={detailPizza.label} onBack={()=>setScreen("menu")}/>
        <PizzaImg imageUrl={detailPizza.imageUrl} label={detailPizza.label} style={{width:"100%",height:170,borderRadius:0}}/>
        <div style={{padding:"16px 15px 0"}}>
          <p style={{fontSize:".72rem",color:"var(--text-secondary)",lineHeight:1.7,marginBottom:16}}>{detailPizza.details}</p>

          <p style={{fontSize:".6rem",color:"var(--gold-66)",letterSpacing:"2px",marginBottom:9}}>{t("size_select", lang)}</p>
          <div style={{display:"flex",gap:9,marginBottom:18}}>
            {sizes.map(sz=>{
              const isOn=detailSize?.id===sz.id;
              return(
                <button key={sz.id}
                  className={`size-btn${isOn?" on":""}`}
                  onClick={()=>{setDetailSize(sz);setExtraSels({});setErrors(e=>({...e,size:false}));}}>
                  <div style={{fontSize:".82rem",fontWeight:700,color:isOn?"var(--text-on-gold)":"var(--text-primary)",marginBottom:3}}>{sz.label}</div>
                  <div style={{fontSize:".68rem",color:isOn?"var(--text-on-gold)":"var(--text-gold)",fontWeight:600}}>{sz.priceOld} {t("syp", lang)}</div>
                </button>
              );
            })}
          </div>

          {hasExtras&&detailSize&&(<>
            <div style={{height:1,background:"var(--border-light)",marginBottom:14}}/>
            <p style={{fontSize:".6rem",color:"var(--gold-66)",letterSpacing:"2px",marginBottom:11}}>{t("extras", lang)}</p>
            <ExtrasSelector extras={detailPizza.extras} lang={lang} selections={extraSels} onChange={(gid,val)=>setExtraSels(p=>({...p,[gid]:val===null?undefined:val}))}/>
          </>)}

          {detailSize&&(
            <>
              <div style={{height:1,background:"var(--border-light)",margin:10}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <span style={{fontSize:".78rem",color:"var(--text-secondary)"}}>{t("total_price", lang)}</span>
                <span style={{fontSize:"1.1rem",fontWeight:900,color:"var(--text-gold)"}}>{fmt(getNum(detailSize)+eTotal)} {t("syp", lang)}</span>
              </div>
              <button className="btn-gold" disabled={!extrasValid} onClick={addDetailToCart}
                style={{width:"100%",padding:"13px",borderRadius:"var(--radius-md)",fontSize:".9rem",fontWeight:700,color:"var(--text-on-gold)",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
                🛒 {t("add_to_cart", lang)}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ════ SUMMARY ════ */
  if(screen==="summary")return(
    <div dir={lang==="ar"?"rtl":"ltr"} style={{fontFamily:"var(--ff)",background:"var(--bg-page-alt)",minHeight:"100vh",color:"var(--text-primary)",paddingBottom:50}}>
      <Header title={t("order_summary", lang)} onBack={()=>setScreen("menu")}/>
      <div style={{padding:"16px 15px"}}>
        {cart.length===0?(
          <div style={{textAlign:"center",padding:"56px 20px"}}>
            <div style={{fontSize:"3.5rem",marginBottom:12,opacity:.16}}>🛒</div>
            <p style={{color:"var(--text-secondary)",fontSize:".85rem",marginBottom:18}}>{t("no_orders", lang)}</p>
            <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"11px 26px",borderRadius:30,fontSize:".83rem",fontWeight:700,color:"var(--text-on-gold)"}}>{t("browse_menu", lang)}</button>
          </div>
        ):(
          <>
            <p style={{fontSize:".6rem",color:"var(--text-secondary)",letterSpacing:"2px",marginBottom:11}}>{t("orders_label", lang)} ({cart.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:18}}>
              {cart.map(item=>(
                <div key={item.uid} style={{background:"var(--bg-card)",border:"1px solid var(--border-light)",borderRadius:"var(--radius-lg)",padding:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
                    <div style={{flex:1}}><p style={{fontWeight:600,color:"var(--text-primary)",fontSize:".84rem"}}>{item.label}{item.size&&` (${item.size})`}</p><p style={{fontSize:".6rem",color:"var(--text-muted-2)",marginTop:2,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.details}</p></div>
                    <div style={{textAlign:"left",marginRight:9,flexShrink:0}}><div style={{fontSize:".78rem",fontWeight:700,color:"var(--text-gold)"}}>{fmt(item.numericPrice)} {t("syp", lang)}</div></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",border:"1px solid var(--border)",borderRadius:9,overflow:"hidden"}}>
                      <button onClick={()=>updateQty(item.uid,-1)} style={{background:"none",border:"none",color:"var(--text-gold)",cursor:"pointer",width:32,height:30,fontSize:"1rem",fontFamily:"inherit"}}>−</button>
                      <span style={{width:28,textAlign:"center",fontSize:".82rem",fontWeight:600,color:"var(--text-primary)"}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item.uid,+1)} style={{background:"none",border:"none",color:"var(--text-gold)",cursor:"pointer",width:32,height:30,fontSize:"1rem",fontFamily:"inherit"}}>+</button>
                    </div>
                    <span style={{fontSize:".78rem",color:"var(--text-gold)",fontWeight:700}}>{fmt(item.numericPrice*item.qty)} {t("syp", lang)}</span>
                    <button onClick={()=>removeItem(item.uid)} style={{background:"var(--bg-red)",border:"1px solid var(--border-red)",borderRadius:7,color:"var(--text-dark-red)",cursor:"pointer",width:30,height:30,fontSize:".8rem",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{borderTop:"1px solid var(--border-input)",paddingTop:13,marginBottom:18,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"var(--text-secondary)",fontSize:".83rem"}}>{t("total_price", lang)}</span>
              <div style={{textAlign:"left"}}><div style={{fontSize:"1.2rem",fontWeight:900,color:"var(--text-gold)"}}>{fmt(cartTotal)} {t("syp", lang)}</div></div>
            </div>

            <p style={{fontSize:".6rem",color:errors.delivery?"var(--text-red)":"var(--gold-66)",letterSpacing:"2px",marginBottom:9}}>{errors.delivery?t("delivery_required", lang):t("delivery_method", lang)}</p>
            <div style={{display:"flex",gap:9,marginBottom:14}}>
              {[{v:"pickup",l:`🏪 ${t("pickup", lang)}`},{v:"delivery",l:`🛵 ${t("delivery", lang)}`}].map(o=>(
                <button key={o.v} className={`del-btn${deliveryType===o.v?" on":""}`}
                  onClick={()=>{setDeliveryType(o.v);setErrors(e=>({...e,delivery:false}));}}>
                  {o.l}
                </button>
              ))}
            </div>

            {deliveryType==="pickup"&&(
              <div style={{marginBottom:18}}>
                <div style={{background:"var(--bg-card)",border:"1px solid var(--gold-1a)",borderRadius:"var(--radius-lg)",padding:14}}>
                  <p style={{fontSize:".82rem",fontWeight:700,color:"var(--text-gold)",marginBottom:3}}>{t("branch_name", lang)}</p>
                  <p style={{fontSize:".68rem",color:"var(--text-secondary)",marginBottom:14}}>{t("branch_address", lang)}</p>
                  <a href={BRANCH.googleMaps} target="_blank" rel="noopener noreferrer"
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      padding:"12px",borderRadius:"var(--radius-md)",
                      background:"var(--gradient-green)",
                      border:"1px solid var(--border-green)",color:"var(--text-green)",
                      fontSize:".86rem",fontWeight:700,fontFamily:"inherit",textDecoration:"none"}}>
                    🗺 {t("go_to_maps", lang)}
                  </a>
                </div>
              </div>
            )}

            {deliveryType==="delivery"&&(
              <div style={{marginBottom:16}}>
                <p style={{fontSize:".6rem",color:errors.location?"var(--text-red)":"var(--gold-66)",letterSpacing:"2px",marginBottom:9}}>{errors.location?t("location_required", lang):`📍 ${t("select_location", lang)}`}</p>
                <DeliveryMap lang={lang} onSelect={coords=>{setMapCoords(coords);setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`);setErrors(ev=>({...ev,location:false}));}}/>
                {mapCoords&&<div style={{background:"var(--bg-green)",border:"1px solid var(--border-green)",borderRadius:9,padding:"7px 12px",marginBottom:9,fontSize:".7rem",color:"var(--text-green)"}}>{t("location_confirmed", lang)}</div>}
                <p style={{fontSize:".62rem",color:"var(--text-muted-2)",marginBottom:7}}>{t("or_write_address", lang)}</p>
                <textarea rows={2} placeholder={lang==="ar"?"المحافظة، الحي، الشارع...":"Governorate, district, street..."} value={mapCoords?"":locationTxt}
                  onChange={e=>{setLocationTxt(e.target.value);setMapCoords(null);setErrors(ev=>({...ev,location:false}));}}
                  style={{resize:"none",width:"100%",padding:"10px 12px",background:"var(--bg-input)",border:`1px solid ${errors.location?"var(--text-red)":"var(--border-input)"}`,borderRadius:"var(--radius-md)",color:"var(--text-primary)",fontFamily:"inherit",fontSize:".82rem",outline:"none"}}/>
              </div>
            )}

            <p style={{fontSize:".6rem",color:errors.phone?"var(--text-red)":"var(--gold-66)",letterSpacing:"2px",marginBottom:7}}>{errors.phone?t("phone_must_10", lang):t("phone_label", lang)}</p>
            <input type="tel" placeholder={t("phone_placeholder", lang)} value={phone} maxLength={10}
              onChange={e=>{const v=e.target.value.replace(/\D/g,"");setPhone(v);setErrors(ev=>({...ev,phone:false}));}}
              style={{width:"100%",padding:"10px 12px",background:"var(--bg-input)",border:`1px solid ${errors.phone||(phone.length>0&&phone.length!==10)?"var(--text-red)":"var(--border-input)"}`,borderRadius:"var(--radius-md)",color:"var(--text-primary)",fontFamily:"inherit",fontSize:".86rem",outline:"none",marginBottom:4}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
              <p style={{fontSize:".58rem",color:"var(--text-chips-2)"}}>{t("phone_exact", lang)}</p>
              <span style={{fontSize:".58rem",fontWeight:700,color:phone.length===0?"var(--border)":phone.length===10?"var(--text-green)":"var(--text-red)"}}>{phone.length}/10</span>
            </div>

            <button className="btn-gold" disabled={!canCheckout} onClick={checkout}
              style={{width:"100%",padding:"13px",borderRadius:"var(--radius-md)",fontSize:".9rem",fontWeight:700,color:"var(--text-on-gold)",display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
              <span style={{fontSize:"1rem"}}>📲</span>{t("send_whatsapp", lang)}
            </button>
            {!canCheckout&&<p style={{textAlign:"center",fontSize:".6rem",color:"var(--text-chips-2)",marginTop:7}}>
              {!phoneValid?phone.length===0?t("enter_phone", lang):t("phone_must_10", lang):!deliveryType?t("choose_method", lang):t("enter_location_prompt", lang)}
            </p>}
          </>
        )}
      </div>
    </div>
  );

  return null;
}
