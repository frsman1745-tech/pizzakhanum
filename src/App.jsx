import { useState, useRef, useEffect, useCallback } from "react";

/* ══════ IMAGE HELPERS ══════ */
function getImg(id, type="pizza") { return localStorage.getItem(`${type}_img_${id}`) || null; }
function ls(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}

/* ══════ DEFAULT DATA ══════ */
const DEFAULT_FEATURED=[
  {id:"meter",label:"بيتزا المتر",priceOld:"150,000",priceNew:"1,500",numericPrice:150000,sliceCount:8,cols:4,desc:"متر كامل من الشهية المتنوعة لتشاركه مع أحبّك"},
  {id:"sixtyforty",label:"بيتزا 60×40",priceOld:"140,000",priceNew:"1,400",numericPrice:140000,sliceCount:6,cols:3,desc:"الحجم العائلي المثالي للتجمعات"},
  {id:"khanum",label:"بيتزا خانم",priceOld:null,priceNew:null,desc:"كرات العجين محشية بجبنة الشيدر على الأطراف، والمنتصف حسب رغبتك ✨",
    sizes:[{id:"sm",label:"صغيرة",priceOld:"45,000",priceNew:"450",numericPrice:45000},{id:"lg",label:"كبيرة",priceOld:"60,000",priceNew:"600",numericPrice:60000}]},
];
const DEFAULT_MENU=[
  {id:"4seasons",label:"الفصول الأربعة",details:"جبنة القشقوان مع الماشروم والزيتون الأسود والفليفلة الخضراء.",comingSoon:false},
  {id:"margarita",label:"مارغريتا",details:"جبنة القشقوان مع الصلصة الحمراء.",comingSoon:false},
  {id:"hawaii",label:"هاواي",details:"جبنة القشقوان مع الموزريلا وشرائح الأناناس.",comingSoon:false},
  {id:"teamscheese",label:"التيمات تشيز",details:"جبنة القشقوان مع موزريلا وكرات الطماطم والريحان.",comingSoon:false},
  {id:"supersupreme",label:"سوبر سوبريم",details:"البيروني مع جبنة القشقوان والماشروم والفلفل الأخضر والزيتون الأسود.",comingSoon:false},
  {id:"chickenbbq",label:"تشيكن باربيكيو",details:"شرائح الدجاج بصوص الباربيكيو وجبنة القشقوان مع البصل.",comingSoon:false},
  {id:"peperoni",label:"ببروني",details:"جبنة القشقوان مع شرائح البيروني لحم البقر والثوم والكزبرة.",comingSoon:false},
  {id:"salami",label:"سلامي",details:"جبنة القشقوان مع شرائح لحم البقر.",comingSoon:false},
  {id:"hotdog",label:"هوت دوغ",details:"جبنة القشقوان مع حبات الهوت دوغ المدخن.",comingSoon:false},
  {id:"smokedchicken",label:"دجاج مدخن",details:"جبنة القشقوان مع شرائح دجاج الحبش المدخن.",comingSoon:false},
  {id:"fajita",label:"فاهيتا",details:"جبنة القشقوان مع دجاج الفاهيتا والماشروم والفلفل الأخضر والذرة.",comingSoon:false},
  {id:"cs1",label:"بيتزا الكريمة",details:"",comingSoon:true},
  {id:"cs2",label:"الثلاثي",details:"",comingSoon:true},
  {id:"cs3",label:"بيتزا البحر",details:"",comingSoon:true},
  {id:"cs4",label:"المكسيكية",details:"",comingSoon:true},
  {id:"cs5",label:"بيتزا الخضار",details:"",comingSoon:true},
];
const FLAVORS=[
  {id:"4seasons",label:"الفصول الأربعة"},{id:"margarita",label:"مارغريتا"},
  {id:"hawaii",label:"هاواي"},{id:"teamscheese",label:"التيمات تشيز"},
  {id:"supersupreme",label:"سوبر سوبريم"},{id:"chickenbbq",label:"تشيكن باربيكيو"},
  {id:"peperoni",label:"ببروني"},{id:"salami",label:"سلامي"},
  {id:"hotdog",label:"هوت دوغ"},{id:"smokedchicken",label:"دجاج مدخن"},
  {id:"fajita",label:"فاهيتا"},
  {id:"cs1",label:"بيتزا الكريمة",comingSoon:true},{id:"cs2",label:"الثلاثي",comingSoon:true},
  {id:"cs3",label:"بيتزا البحر",comingSoon:true},{id:"cs4",label:"المكسيكية",comingSoon:true},
  {id:"cs5",label:"بيتزا الخضار",comingSoon:true},
];
const SIZES_REGULAR=[
  {id:"sm",label:"صغير",priceOld:"35,000",priceNew:"350",numericPrice:35000},
  {id:"md",label:"وسط",priceOld:"50,000",priceNew:"500",numericPrice:50000},
  {id:"lg",label:"كبير",priceOld:"65,000",priceNew:"650",numericPrice:65000},
];
const FLOATERS=[
  {e:"🍕",l:"6%",t:"18%",d:7,dl:0},{e:"🌶️",l:"14%",t:"72%",d:9,dl:1},
  {e:"🧀",l:"82%",t:"14%",d:8,dl:2},{e:"🍅",l:"88%",t:"65%",d:6,dl:.5},
  {e:"🫒",l:"50%",t:"88%",d:10,dl:3},{e:"🥓",l:"72%",t:"42%",d:7.5,dl:1.5},
];

/* ══════ PIZZA IMAGE COMPONENT ══════ */
/* type="pizza" → صورة الكارد   |   type="flavor" → صورة النكهة */
function PizzaImg({id, label, type="pizza", style}){
  const [src,setSrc]=useState(()=>id?getImg(id,type):null);
  useEffect(()=>{if(id)setSrc(getImg(id,type));},[id,type]);
  if(src)return(
    <div style={{overflow:"hidden",flexShrink:0,...style}}>
      <img src={src} alt={label||""} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
    </div>
  );
  return(
    <div style={{background:"linear-gradient(135deg,#1c1208,#111)",backgroundImage:"repeating-linear-gradient(45deg,transparent,transparent 7px,rgba(200,169,106,.04) 7px,rgba(200,169,106,.04) 8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5,overflow:"hidden",flexShrink:0,...style}}>
      <div style={{width:28,height:28,borderRadius:"50%",border:"1px dashed #C8A96A2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,opacity:.3}}>🍕</div>
      {label&&<span style={{fontSize:".5rem",color:"#C8A96A2a",textAlign:"center",padding:"0 6px",lineHeight:1.3}}>{label}</span>}
    </div>
  );
}

/* ══════ CSS ══════ */
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;600;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:#0a0a0a}
  ::-webkit-scrollbar-thumb{background:#C8A96A2a;border-radius:2px}

  @keyframes floatUp{0%,100%{transform:translateY(0) rotate(0);opacity:.12}50%{transform:translateY(-26px) rotate(7deg);opacity:.2}}
  @keyframes fadeUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes glow   {0%,100%{box-shadow:0 0 18px #C8A96A44,0 0 40px #C8A96A22}50%{box-shadow:0 0 32px #C8A96A88,0 0 70px #C8A96A44}}
  @keyframes popIn  {0%{opacity:0;transform:scale(.88)}60%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

  .fade-up {animation:fadeUp  .42s ease forwards}
  .pop-in  {animation:popIn   .3s  ease forwards}
  .slide-in{animation:slideIn .34s ease forwards}

  .btn-gold{background:linear-gradient(135deg,#C8A96A,#8B6B4A,#C8A96A);background-size:200% auto;border:none;cursor:pointer;font-family:inherit;transition:background-position .4s,transform .2s,box-shadow .3s}
  .btn-gold:hover{background-position:right center;transform:translateY(-2px) scale(1.02);box-shadow:0 8px 28px #C8A96A55}
  .btn-gold:active{transform:scale(.97)}
  .btn-gold:disabled{opacity:.35;cursor:not-allowed;transform:none!important;box-shadow:none!important}

  .card-tap{transition:transform .2s,box-shadow .2s,border-color .2s;cursor:pointer}
  .card-tap:hover{transform:translateY(-3px) scale(1.015);box-shadow:0 10px 36px rgba(200,169,106,.14)}
  .card-tap:active{transform:scale(.98)}

  .featured-scroll{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:0 16px 8px;scrollbar-width:none}
  .featured-scroll::-webkit-scrollbar{display:none}
  .featured-card{flex:0 0 78vw;max-width:300px;scroll-snap-align:start;border-radius:20px;overflow:hidden;border:1px solid #222;transition:border-color .25s,transform .25s;cursor:pointer;background:#121212}
  .featured-card:hover{border-color:#C8A96A44;transform:scale(1.02)}
  .featured-card:active{transform:scale(.98)}
  .featured-card.acard{border-color:#C8A96A33}

  .dot-wrap{display:flex;gap:7px;justify-content:center;padding:10px 0 2px}
  .dot{width:7px;height:7px;border-radius:50%;transition:all .3s;cursor:pointer;border:none;padding:0;outline:none}
  .dot.on{width:22px;border-radius:4px;background:#C8A96A}
  .dot.off{background:#1e1e1e}

  .slice-cell{cursor:pointer;border:1.5px solid #222;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:62px;padding:6px 4px;gap:3px;background:linear-gradient(135deg,#1c0e05,#120a02);transition:all .17s}
  .slice-cell:hover{border-color:#C8A96A33;background:#1f1008}
  .slice-cell.sel{border-color:#4DA6FF!important;background:#06111f!important;box-shadow:0 0 12px #4DA6FF33}
  .slice-cell.fld{border-color:#C8A96A55;background:linear-gradient(135deg,#2a1508,#1a0e05)}

  .flavor-btn{cursor:pointer;border:1px solid #1a1a1a;background:#141414;border-radius:12px;overflow:hidden;transition:all .17s}
  .flavor-btn:hover:not(.cs){border-color:#C8A96A44;background:#1a1408}
  .flavor-btn.hfl{border-color:#C8A96A44}
  .flavor-btn.cs{cursor:not-allowed;opacity:.4}

  .size-btn{flex:1;padding:12px 6px;border-radius:12px;cursor:pointer;font-family:inherit;font-size:.8rem;font-weight:600;border:1px solid #222;background:#141414;color:#E5D3B3;transition:all .2s;text-align:center}
  .size-btn:hover{border-color:#C8A96A44}
  .size-btn.on{background:#C8A96A;border-color:#C8A96A;color:#0f0f0f}

  .del-btn{border:1px solid #222;border-radius:12px;cursor:pointer;font-family:inherit;font-size:.85rem;font-weight:600;transition:all .2s;flex:1;padding:13px;text-align:center;background:#141414;color:#444}
  .del-btn.on{border-color:#C8A96A;background:#1c1308;color:#C8A96A}
  .del-btn:hover:not(.on){border-color:#C8A96A22}

  input,textarea{background:#161616;border:1px solid #252525;border-radius:12px;color:#E5D3B3;font-size:.9rem;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s;width:100%;padding:12px 14px}
  input:focus,textarea:focus{border-color:#C8A96A;box-shadow:0 0 0 3px #C8A96A0f}
  .err{border-color:#ef4444!important}

  .noise{background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");background-repeat:repeat}

  /* Leaflet fix inside app */
  .leaflet-container{font-family:'Noto Kufi Arabic',sans-serif!important}
`;

/* ══════ LOCATION PICKER — fixed ══════ */
function LocationPicker({onSelect}){
  const divRef=useRef(null);
  const mapRef=useRef(null);
  const markerRef=useRef(null);
  const tileRef=useRef(null);
  const[mapType,setMapType]=useState("street");
  const[search,setSearch]=useState("");
  const[busy,setBusy]=useState(false);
  const[ready,setReady]=useState(false);

  const TILES={
    street:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  useEffect(()=>{
    // Wait for Leaflet — it's loaded via <script> in index.html
    function tryInit(){
      if(mapRef.current) return; // already init
      if(!window.L){setTimeout(tryInit,200);return;}
      if(!divRef.current) return;
      try{
        const map=window.L.map(divRef.current,{zoomControl:true,attributionControl:false}).setView([33.51,36.29],12);
        tileRef.current=window.L.tileLayer(TILES.street,{attribution:"© OpenStreetMap"}).addTo(map);
        map.on("click",e=>place(map,e.latlng.lat,e.latlng.lng));
        mapRef.current=map;
        setReady(true);
        // invalidate after paint
        setTimeout(()=>map.invalidateSize(),300);
      }catch(err){console.error("Map init error",err);}
    }
    tryInit();
    return()=>{
      if(mapRef.current){try{mapRef.current.remove();}catch{}mapRef.current=null;}
    };
  },[]);

  function place(map,lat,lng){
    if(markerRef.current){try{markerRef.current.remove();}catch{}}
    markerRef.current=window.L.marker([lat,lng],{draggable:true}).addTo(map).bindPopup("موقعك ✓").openPopup();
    markerRef.current.on("dragend",ev=>{const p=ev.target.getLatLng();onSelect({lat:p.lat.toFixed(5),lng:p.lng.toFixed(5)});});
    onSelect({lat:lat.toFixed(5),lng:lng.toFixed(5)});
  }

  function switchLayer(t){
    if(!mapRef.current||t===mapType)return;
    if(tileRef.current){try{tileRef.current.remove();}catch{}}
    tileRef.current=window.L.tileLayer(TILES[t],{attribution:t==="street"?"© OpenStreetMap":"© Esri"}).addTo(mapRef.current);
    setMapType(t);
  }

  async function doSearch(e){
    e.preventDefault();
    if(!search.trim()||!mapRef.current)return;
    setBusy(true);
    try{
      const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`);
      const d=await r.json();
      if(d[0]){const{lat,lon}=d[0];mapRef.current.flyTo([+lat,+lon],15,{duration:1.2});place(mapRef.current,+lat,+lon);}
    }finally{setBusy(false);}
  }

  return(
    <div>
      <form onSubmit={doSearch} style={{display:"flex",gap:8,marginBottom:8}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن موقع... (مثال: دمشق)" style={{flex:1,padding:"9px 12px",fontSize:".82rem"}}/>
        <button type="submit" disabled={busy} style={{padding:"9px 14px",background:"#C8A96A",border:"none",borderRadius:10,color:"#0f0f0f",cursor:"pointer",fontWeight:700,fontFamily:"inherit",fontSize:".8rem",flexShrink:0,opacity:busy?.6:1}}>{busy?"...":"بحث"}</button>
      </form>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {[["street","🗺 عادية"],["satellite","🛰 قمر صناعي"]].map(([k,l])=>(
          <button key={k} onClick={()=>switchLayer(k)} style={{flex:1,padding:"7px",background:mapType===k?"#C8A96A1a":"#141414",border:`1px solid ${mapType===k?"#C8A96A":"#252525"}`,borderRadius:8,color:mapType===k?"#C8A96A":"#444",cursor:"pointer",fontFamily:"inherit",fontSize:".74rem",fontWeight:600,transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      <div ref={divRef} style={{width:"100%",height:260,borderRadius:14,border:"1px solid #C8A96A22",overflow:"hidden",marginBottom:10,background:"#111"}}>
        {!ready&&<div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#333",fontSize:".8rem"}}>جاري تحميل الخريطة...</div>}
      </div>
    </div>
  );
}

/* ══════ FEATURED SLIDER ══════ */
function FeaturedSlider({featured,onCardClick}){
  const[active,setActive]=useState(0);
  const scrollRef=useRef(null);
  const timer=useRef(null);
  const paused=useRef(false);
  const count=featured.length;

  const scrollTo=useCallback((idx)=>{
    if(!scrollRef.current)return;
    const el=scrollRef.current;
    const card=el.children[idx];
    if(card)el.scrollTo({left:card.offsetLeft-16,behavior:"smooth"});
    setActive(idx);
  },[]);

  const next=useCallback(()=>{
    if(paused.current)return;
    setActive(prev=>{const n=(prev+1)%count;scrollTo(n);return n;});
  },[count,scrollTo]);

  useEffect(()=>{
    timer.current=setInterval(next,3000);
    return()=>clearInterval(timer.current);
  },[next]);

  function manualNav(idx){
    paused.current=true;clearInterval(timer.current);scrollTo(idx);
    timer.current=setTimeout(()=>{paused.current=false;timer.current=setInterval(next,3000);},10000);
  }

  function onScroll(){
    if(!scrollRef.current)return;
    const el=scrollRef.current;
    const cw=el.offsetWidth||1;
    const idx=Math.round(el.scrollLeft/cw);
    const c=Math.max(0,Math.min(count-1,idx));
    if(c!==active){
      paused.current=true;clearInterval(timer.current);setActive(c);
      timer.current=setTimeout(()=>{paused.current=false;timer.current=setInterval(next,3000);},10000);
    }
  }

  return(
    <div>
      <div className="featured-scroll" ref={scrollRef} onScroll={onScroll}>
        {featured.map((fp,i)=>(
          <div key={fp.id} className={`featured-card${i===active?" acard":""}`} onClick={()=>onCardClick(fp)}>
            {/* صورة الكارد */}
            <PizzaImg id={fp.id} label={fp.label} type="pizza" style={{width:"100%",height:160,borderRadius:0}}/>
            <div style={{padding:"12px 13px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <h3 style={{fontSize:".95rem",fontWeight:700,color:"#E5D3B3"}}>{fp.label}</h3>
                <div style={{textAlign:"left",flexShrink:0,marginRight:8}}>
                  {fp.priceOld?<><div style={{fontSize:".82rem",fontWeight:900,color:"#C8A96A",whiteSpace:"nowrap"}}>{fp.priceOld} ل.س</div><div style={{fontSize:".6rem",color:"#8B6B4A"}}>{fp.priceNew} ل.ج</div></>:<div style={{fontSize:".68rem",color:"#8B6B4A"}}>حسب الحجم</div>}
                </div>
              </div>
              <p style={{fontSize:".68rem",color:"#8B6B4A",lineHeight:1.55,marginBottom:10}}>{fp.desc}</p>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#C8A96A14",border:"1px solid #C8A96A2a",borderRadius:20,padding:"4px 12px"}}>
                <span style={{fontSize:".68rem",color:"#C8A96A"}}>اختر النكهات</span>
                <span style={{color:"#C8A96A",fontSize:".8rem"}}>←</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="dot-wrap">
        {featured.map((_,i)=>(<button key={i} className={`dot ${i===active?"on":"off"}`} onClick={()=>manualNav(i)}/>))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function PizzaKhanum(){
  const[featured,setFeatured]=useState(()=>ls("admin_featured",DEFAULT_FEATURED));
  const[pizzasMenu,setPizzasMenu]=useState(()=>ls("admin_menu",DEFAULT_MENU));

  useEffect(()=>{
    function sync(){setFeatured(ls("admin_featured",DEFAULT_FEATURED));setPizzasMenu(ls("admin_menu",DEFAULT_MENU));}
    window.addEventListener("focus",sync);
    return()=>window.removeEventListener("focus",sync);
  },[]);

  const[screen,setScreen]=useState("landing");
  const[builderPizza,setBuilderPizza]=useState(null);
  const[khanamSize,setKhanamSize]=useState(null);
  const[selectedSlices,setSelectedSlices]=useState(new Set());
  const[sliceFlavors,setSliceFlavors]=useState({});
  const[detailPizza,setDetailPizza]=useState(null);
  const[detailSize,setDetailSize]=useState(null);
  const[cart,setCart]=useState([]);
  const[phone,setPhone]=useState("");
  const[deliveryType,setDeliveryType]=useState("");
  const[locationTxt,setLocationTxt]=useState("");
  const[errors,setErrors]=useState({});
  const[mapCoords,setMapCoords]=useState(null);

  const fmt=n=>n.toLocaleString("ar-EG");
  const cartTotal=cart.reduce((s,i)=>s+i.numericPrice*i.qty,0);

  function addToCart(item){setCart(p=>[...p,{...item,qty:1,uid:Date.now()+Math.random()}]);}
  function updateQty(uid,d){setCart(p=>p.map(i=>i.uid===uid?{...i,qty:Math.max(1,i.qty+d)}:i));}
  function removeItem(uid){setCart(p=>p.filter(i=>i.uid!==uid));}
  function toggleSlice(idx){setSelectedSlices(p=>{const n=new Set(p);n.has(idx)?n.delete(idx):n.add(idx);return n;});}

  function applyFlavor(fid){
    if(!selectedSlices.size)return;
    setSliceFlavors(p=>{const n={...p};selectedSlices.forEach(i=>{n[i]=fid;});return n;});
    setSelectedSlices(new Set());
  }

  function addBuilderToCart(){
    const perSlice=Object.entries(sliceFlavors).map(([i,fid])=>`شريحة ${+i+1}: ${FLAVORS.find(f=>f.id===fid)?.label}`).join("، ");
    addToCart({label:builderPizza.label,size:"",details:perSlice||"—",priceOld:builderPizza.priceOld,priceNew:builderPizza.priceNew,numericPrice:builderPizza.numericPrice});
    setSliceFlavors({});setSelectedSlices(new Set());setScreen("menu");
  }
  function addKhanamToCart(fid){
    const f=FLAVORS.find(x=>x.id===fid);
    addToCart({label:`بيتزا خانم — ${khanamSize.label}`,size:khanamSize.label,details:`المنتصف: ${f?.label} • الأطراف: جبنة شيدر`,priceOld:khanamSize.priceOld,priceNew:khanamSize.priceNew,numericPrice:khanamSize.numericPrice});
    setKhanamSize(null);setScreen("menu");
  }
  function addDetailToCart(){
    if(!detailSize)return;
    addToCart({label:detailPizza.label,size:detailSize.label,details:detailPizza.details,priceOld:detailSize.priceOld,priceNew:detailSize.priceNew,numericPrice:detailSize.numericPrice});
    setDetailSize(null);setScreen("menu");
  }

  function checkout(){
    const errs={};
    if(!phoneValid)errs.phone=true;
    if(!deliveryType)errs.delivery=true;
    if(deliveryType==="delivery"&&!locationTxt.trim())errs.location=true;
    if(Object.keys(errs).length){setErrors(errs);return;}
    const wapp=ls("site_whatsapp","963998950904");
    const lines=cart.map(i=>`• ${i.label}${i.size?` (${i.size})`:""} × ${i.qty}\n  ${i.details}\n  السعر: ${i.priceOld} ل.س`).join("\n\n");
    const msg=["مرحباً بيتزا خانم 🍕","","📋 الطلب:",lines,"",`💰 المجموع: ${fmt(cartTotal)} ل.س`,`🚗 ${deliveryType==="pickup"?"استلام من الفرع":"توصيل"}`,deliveryType==="delivery"?`📍 ${locationTxt}${mapCoords?`\n🗺 https://maps.google.com/?q=${mapCoords.lat},${mapCoords.lng}`:""}`:""," ",`📞 ${phone}`].filter(Boolean).join("\n");
    window.open(`https://wa.me/${wapp}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const phoneValid=/^\d{10}$/.test(phone.trim());
  const canCheckout=phoneValid&&deliveryType&&(deliveryType!=="delivery"||locationTxt.trim());

  function Header({title,onBack}){
    return(
      <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.6rem",lineHeight:1,padding:0}}>‹</button>
        <h2 style={{fontSize:".95rem",fontWeight:700,color:"#E5D3B3"}}>{title}</h2>
      </div>
    );
  }

  /* FlavorGrid — uses flavor_img for each flavor button */
  function FlavorGrid({onPick,usedMap={}}){
    return(
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {FLAVORS.map(f=>{
          const cnt=usedMap[f.id]||0;
          return(
            <div key={f.id} className={`flavor-btn${f.comingSoon?" cs":cnt>0?" hfl":""}`} onClick={()=>{if(f.comingSoon)return;onPick(f.id);}}>
              {/* صورة النكهة (flavor_img) */}
              <PizzaImg id={f.id} label="" type="flavor" style={{width:"100%",height:72,borderRadius:0}}/>
              <div style={{padding:"7px 10px 9px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:".72rem",fontWeight:600,color:f.comingSoon?"#444":"#E5D3B3"}}>{f.label}</span>
                {f.comingSoon&&<span style={{fontSize:".54rem",background:"#C8A96A14",color:"#C8A96A77",padding:"1px 6px",borderRadius:10}}>قريباً</span>}
                {cnt>0&&<span style={{fontSize:".6rem",background:"#C8A96A",color:"#0f0f0f",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cnt}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ════════ LANDING ════════ */
  if(screen==="landing")return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif"}}>
      <style>{CSS}</style>
      <div className="noise" style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 30% 40%,#1f1508,#0f0f0f 60%,#0a0a0a)",position:"relative",overflow:"hidden",textAlign:"center",padding:24}}>
        {FLOATERS.map((f,i)=>(<div key={i} style={{position:"absolute",fontSize:"1.8rem",opacity:.15,left:f.l,top:f.t,animation:`floatUp ${f.d}s ease-in-out ${f.dl}s infinite`,pointerEvents:"none",filter:"blur(.4px)"}}>{f.e}</div>))}
        <div className="fade-up" style={{maxWidth:400}}>
          <div style={{width:108,height:108,borderRadius:"50%",border:"2px solid #C8A96A33",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 26px",animation:"glow 3s ease-in-out infinite",fontSize:"3rem"}}>🍕</div>
          <h1 style={{fontSize:"clamp(2.8rem,9vw,4.2rem)",fontWeight:900,background:"linear-gradient(135deg,#C8A96A,#E5D3B3,#8B6B4A,#C8A96A)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 4s linear infinite",lineHeight:1.1,marginBottom:12}}>
            {ls("site_name","بيتزا خانم")}
          </h1>
          <p style={{fontSize:"clamp(.88rem,3vw,.98rem)",color:"#8B6B4A",marginBottom:46,fontWeight:300,letterSpacing:".5px",lineHeight:1.8}}>{ls("site_slogan","كُل لتعيش · وعِش لأجل البيتزا")}</p>
          <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"16px 52px",borderRadius:"50px",fontSize:"1.05rem",fontWeight:700,color:"#0f0f0f",letterSpacing:"1px",animation:"glow 3s ease-in-out infinite"}}>ابدأ الطلب ✨</button>
          <p style={{marginTop:16,fontSize:".66rem",color:"#1a1a1a",letterSpacing:"3px"}}>PIZZA KHANUM • منذ 2020</p>
        </div>
      </div>
    </div>
  );

  /* ════════ MENU ════════ */
  if(screen==="menu")return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0f0f0f",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
      <style>{CSS}</style>
      <div style={{position:"sticky",top:0,zIndex:30,background:"linear-gradient(180deg,#0f0f0f 85%,transparent)",padding:"13px 16px 11px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #161616"}}>
        <span style={{fontSize:"1.2rem",fontWeight:900,background:"linear-gradient(90deg,#C8A96A,#E5D3B3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{ls("site_name","بيتزا خانم")}</span>
        <button onClick={()=>setScreen("summary")} style={{position:"relative",background:"#1a1a1a",border:"1px solid #C8A96A2a",borderRadius:10,color:"#C8A96A",padding:"8px 13px",cursor:"pointer",fontSize:".78rem",fontFamily:"inherit"}}>
          🧾 الطلب
          {cart.length>0&&<span style={{position:"absolute",top:-6,left:-6,background:"#C8A96A",color:"#0f0f0f",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:".58rem",fontWeight:700}}>{cart.length}</span>}
        </button>
      </div>

      {/* Featured */}
      <div style={{paddingTop:18}}>
        <p style={{fontSize:".63rem",color:"#C8A96A55",letterSpacing:"3px",padding:"0 16px 10px"}}>⭐ العروض المميّزة</p>
        <FeaturedSlider featured={featured} onCardClick={fp=>{
          if(fp.id==="khanum"){setBuilderPizza(fp);setKhanamSize(null);setScreen("khanum");}
          else{setBuilderPizza(fp);setSliceFlavors({});setSelectedSlices(new Set());setScreen("builder");}
        }}/>
      </div>

      {/* Menu grid — uses pizza_img */}
      <div style={{padding:"24px 16px 0"}}>
        <p style={{fontSize:".63rem",color:"#C8A96A55",letterSpacing:"3px",marginBottom:12}}>🍕 قائمة البيتزا</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {pizzasMenu.map(p=>(
            <div key={p.id} className={p.comingSoon?"":"card-tap"}
              style={{background:"#131313",border:"1px solid #1c1c1c",borderRadius:14,overflow:"hidden",cursor:p.comingSoon?"default":"pointer",opacity:p.comingSoon?0.5:1}}
              onClick={()=>{if(p.comingSoon)return;setDetailPizza(p);setDetailSize(null);setScreen("pizza_detail");}}>
              <PizzaImg id={p.id} label={p.label} type="pizza" style={{width:"100%",height:92,borderRadius:0}}/>
              <div style={{padding:"9px 9px 11px"}}>
                <p style={{fontSize:".76rem",fontWeight:600,color:p.comingSoon?"#444":"#E5D3B3",marginBottom:4}}>{p.label}</p>
                {p.comingSoon
                  ?<span style={{fontSize:".57rem",background:"#C8A96A14",color:"#C8A96A77",padding:"2px 8px",borderRadius:20}}>قريباً</span>
                  :<p style={{fontSize:".6rem",color:"#444",lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.details}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {cart.length>0&&(
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",zIndex:40}}>
          <button className="btn-gold pop-in" onClick={()=>setScreen("summary")} style={{padding:"13px 26px",borderRadius:"50px",fontSize:".88rem",fontWeight:700,color:"#0f0f0f",boxShadow:"0 8px 28px #00000099",display:"flex",alignItems:"center",gap:10}}>
            <span>🧾 عرض الطلب</span>
            <span style={{background:"#0f0f0f22",borderRadius:20,padding:"2px 10px",fontSize:".8rem"}}>{fmt(cartTotal)} ل.س</span>
          </button>
        </div>
      )}
    </div>
  );

  /* ════════ BUILDER ════════ */
  if(screen==="builder"&&builderPizza){
    const{sliceCount,cols}=builderPizza;
    const filledCount=Object.keys(sliceFlavors).length;
    const usedMap=FLAVORS.reduce((a,f)=>({...a,[f.id]:Object.values(sliceFlavors).filter(v=>v===f.id).length}),{});
    return(
      <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:120}}>
        <style>{CSS}</style>
        <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setScreen("menu")} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.6rem",lineHeight:1,padding:0}}>‹</button>
          <div style={{flex:1}}>
            <h2 style={{fontSize:".95rem",fontWeight:700,color:"#E5D3B3"}}>{builderPizza.label}</h2>
            <p style={{fontSize:".65rem",color:"#8B6B4A"}}>{selectedSlices.size>0?`${selectedSlices.size} شريحة محددة — اختر نكهة`:`${filledCount}/${sliceCount} شرائح`}</p>
          </div>
          <div style={{display:"flex",gap:4}}>
            {Array.from({length:sliceCount},(_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:sliceFlavors[i]?"#C8A96A":"#1a1a1a",transition:"background .3s"}}/>))}
          </div>
        </div>
        <div style={{padding:"14px 16px 0"}}>
          <div style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:12,padding:"9px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:"1.1rem"}}>{selectedSlices.size===0?"☝️":"🎨"}</span>
            <p style={{fontSize:".72rem",color:"#8B6B4A",lineHeight:1.5}}>{selectedSlices.size===0?"اضغط على شريحة أو أكثر، ثم اختر النكهة":`${selectedSlices.size} شريحة — اضغط على نكهة`}</p>
          </div>
          <div style={{background:"linear-gradient(135deg,#1c1008,#100a04)",border:"2px solid #C8A96A1a",borderRadius:16,padding:12,marginBottom:16}}>
            <p style={{fontSize:".58rem",color:"#C8A96A2a",textAlign:"center",marginBottom:10,letterSpacing:"2px"}}>{builderPizza.label}</p>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap:6}}>
              {Array.from({length:sliceCount},(_,i)=>{
                const fid=sliceFlavors[i];const flbl=fid?FLAVORS.find(f=>f.id===fid)?.label:null;
                const isSel=selectedSlices.has(i);
                return(
                  <div key={i} className={`slice-cell${isSel?" sel":fid?" fld":""}`} onClick={()=>toggleSlice(i)}>
                    {fid
                      ?<><PizzaImg id={fid} label="" type="flavor" style={{width:"100%",height:30,borderRadius:4}}/><span style={{fontSize:".5rem",color:"#C8A96A",fontWeight:700,textAlign:"center",lineHeight:1.3}}>{flbl}</span></>
                      :<><div style={{width:18,height:18,borderRadius:4,border:`1.5px ${isSel?"solid #4DA6FF":"dashed #222"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<div style={{width:8,height:8,borderRadius:"50%",background:"#4DA6FF"}}/>}</div><span style={{fontSize:".5rem",color:"#1e1e1e"}}>{i+1}</span></>
                    }
                  </div>
                );
              })}
            </div>
          </div>
          {filledCount>0&&<div className="pop-in" style={{marginBottom:12}}><button className="btn-gold" onClick={addBuilderToCart} style={{width:"100%",padding:"12px",borderRadius:12,fontSize:".88rem",fontWeight:700,color:"#0f0f0f"}}>إضافة للطلب — {builderPizza.priceOld} ل.س</button></div>}
          <p style={{fontSize:".63rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:10}}>النكهات المتاحة</p>
          <FlavorGrid onPick={applyFlavor} usedMap={usedMap}/>
          {filledCount>0&&<button onClick={()=>{setSliceFlavors({});setSelectedSlices(new Set());}} style={{marginTop:12,width:"100%",padding:10,background:"none",border:"1px solid #1a1a1a",borderRadius:12,color:"#333",cursor:"pointer",fontFamily:"inherit",fontSize:".75rem"}}>🔄 إعادة التعيين</button>}
        </div>
      </div>
    );
  }

  /* ════════ KHANUM ════════ */
  if(screen==="khanum"&&builderPizza)return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
      <style>{CSS}</style>
      <div style={{position:"sticky",top:0,zIndex:20,background:"#0d0d0d",borderBottom:"1px solid #161616",padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setScreen("menu");setKhanamSize(null);}} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",fontSize:"1.6rem",lineHeight:1,padding:0}}>‹</button>
        <div><h2 style={{fontSize:".95rem",fontWeight:700,color:"#E5D3B3"}}>بيتزا خانم</h2><p style={{fontSize:".65rem",color:"#8B6B4A"}}>{khanamSize?"اختر نكهة المنتصف":"اختر الحجم أولاً"}</p></div>
      </div>
      <div style={{padding:"18px 16px"}}>
        <div style={{background:"#141414",border:"1px solid #C8A96A1a",borderRadius:16,padding:14,marginBottom:20,display:"flex",gap:14,alignItems:"flex-start"}}>
          <PizzaImg id={builderPizza.id} label="" type="pizza" style={{width:80,height:80,borderRadius:12,flexShrink:0}}/>
          <div><p style={{fontSize:".9rem",fontWeight:700,color:"#C8A96A",marginBottom:6}}>بيتزا خانم</p><p style={{fontSize:".7rem",color:"#8B6B4A",lineHeight:1.6}}>{builderPizza.desc}</p></div>
        </div>
        {!khanamSize&&(<div className="slide-in">
          <p style={{fontSize:".63rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:12}}>اختر الحجم</p>
          <div style={{display:"flex",gap:10}}>
            {builderPizza.sizes?.map(sz=>(<button key={sz.id} className="size-btn" onClick={()=>setKhanamSize(sz)} style={{padding:"16px 8px"}}>
              <div style={{fontSize:"1.4rem",marginBottom:6}}>{sz.id==="sm"?"🔸":"🔶"}</div>
              <div style={{color:"#E5D3B3",marginBottom:5}}>{sz.label}</div>
              <div style={{fontSize:".82rem",fontWeight:700,color:"#C8A96A"}}>{sz.priceOld} ل.س</div>
              <div style={{fontSize:".6rem",color:"#8B6B4A"}}>{sz.priceNew} ل.ج</div>
            </button>))}
          </div>
        </div>)}
        {khanamSize&&(<div className="slide-in">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <p style={{fontSize:".63rem",color:"#8B6B4A",letterSpacing:"2px"}}>نكهة المنتصف</p>
            <button onClick={()=>setKhanamSize(null)} style={{fontSize:".68rem",color:"#444",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>← تغيير الحجم</button>
          </div>
          <FlavorGrid onPick={addKhanamToCart}/>
        </div>)}
      </div>
    </div>
  );

  /* ════════ PIZZA DETAIL ════════ */
  if(screen==="pizza_detail"&&detailPizza)return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:100}}>
      <style>{CSS}</style>
      <Header title={detailPizza.label} onBack={()=>setScreen("menu")}/>
      <div style={{padding:"18px 16px"}}>
        <PizzaImg id={detailPizza.id} label={detailPizza.label} type="pizza" style={{width:"100%",height:200,borderRadius:18,marginBottom:20}}/>
        <h2 style={{fontSize:"1.15rem",fontWeight:700,color:"#E5D3B3",marginBottom:8}}>{detailPizza.label}</h2>
        <p style={{fontSize:".78rem",color:"#8B6B4A",lineHeight:1.7,marginBottom:26,borderRight:"2px solid #C8A96A2a",paddingRight:12}}>{detailPizza.details}</p>
        <p style={{fontSize:".63rem",color:"#C8A96A66",letterSpacing:"2px",marginBottom:12}}>اختر الحجم</p>
        <div style={{display:"flex",gap:10,marginBottom:22}}>
          {SIZES_REGULAR.map(sz=>(<button key={sz.id} className={`size-btn${detailSize?.id===sz.id?" on":""}`} onClick={()=>setDetailSize(sz)}>
            <div style={{marginBottom:4,fontWeight:700}}>{sz.label}</div>
            <div style={{fontSize:".8rem",fontWeight:700,color:detailSize?.id===sz.id?"#0f0f0f":"#C8A96A"}}>{sz.priceOld} ل.س</div>
            <div style={{fontSize:".6rem",opacity:.7,marginTop:2}}>{sz.priceNew} ل.ج</div>
          </button>))}
        </div>
        <button className="btn-gold" disabled={!detailSize} onClick={addDetailToCart} style={{width:"100%",padding:"14px",borderRadius:12,fontSize:".92rem",fontWeight:700,color:"#0f0f0f"}}>
          {detailSize?`إضافة للطلب — ${detailSize.priceOld} ل.س`:"اختر الحجم أولاً"}
        </button>
      </div>
    </div>
  );

  /* ════════ SUMMARY ════════ */
  if(screen==="summary")return(
    <div dir="rtl" style={{fontFamily:"'Noto Kufi Arabic',sans-serif",background:"#0d0d0d",minHeight:"100vh",color:"#E5D3B3",paddingBottom:50}}>
      <style>{CSS}</style>
      <Header title="ملخّص الطلب" onBack={()=>setScreen("menu")}/>
      <div style={{padding:"18px 16px"}}>
        {cart.length===0?(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:"4rem",marginBottom:14,opacity:.18}}>🛒</div>
            <p style={{color:"#8B6B4A",fontSize:".88rem",marginBottom:20}}>لا يوجد طلبات بعد</p>
            <button className="btn-gold" onClick={()=>setScreen("menu")} style={{padding:"12px 28px",borderRadius:30,fontSize:".85rem",fontWeight:700,color:"#0f0f0f"}}>تصفّح القائمة</button>
          </div>
        ):(<>
          <p style={{fontSize:".63rem",color:"#8B6B4A",letterSpacing:"2px",marginBottom:12}}>الطلبات ({cart.length})</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {cart.map(item=>(
              <div key={item.uid} style={{background:"#141414",border:"1px solid #1a1a1a",borderRadius:14,padding:"13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1}}><p style={{fontWeight:600,color:"#E5D3B3",fontSize:".86rem"}}>{item.label}</p><p style={{fontSize:".62rem",color:"#444",marginTop:3,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{item.details}</p></div>
                  <div style={{textAlign:"left",marginRight:10,flexShrink:0}}><div style={{fontSize:".8rem",fontWeight:700,color:"#C8A96A"}}>{item.priceOld} ل.س</div><div style={{fontSize:".58rem",color:"#8B6B4A"}}>{item.priceNew} ل.ج</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",border:"1px solid #222",borderRadius:10,overflow:"hidden"}}>
                    <button onClick={()=>updateQty(item.uid,-1)} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",width:34,height:32,fontSize:"1rem",fontFamily:"inherit"}}>−</button>
                    <span style={{width:30,textAlign:"center",fontSize:".84rem",fontWeight:600,color:"#E5D3B3"}}>{item.qty}</span>
                    <button onClick={()=>updateQty(item.uid,+1)} style={{background:"none",border:"none",color:"#C8A96A",cursor:"pointer",width:34,height:32,fontSize:"1rem",fontFamily:"inherit"}}>+</button>
                  </div>
                  <span style={{fontSize:".8rem",color:"#C8A96A",fontWeight:700}}>{fmt(item.numericPrice*item.qty)} ل.س</span>
                  <button onClick={()=>removeItem(item.uid)} style={{background:"#180f0f",border:"1px solid #2a1818",borderRadius:8,color:"#6a2a2a",cursor:"pointer",width:32,height:32,fontSize:".82rem",display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{borderTop:"1px solid #161616",paddingTop:14,marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#8B6B4A",fontSize:".85rem"}}>المجموع</span>
            <div style={{textAlign:"left"}}><div style={{fontSize:"1.25rem",fontWeight:900,color:"#C8A96A"}}>{fmt(cartTotal)} ل.س</div><div style={{fontSize:".64rem",color:"#8B6B4A"}}>{fmt(cartTotal/100)} ل.ج</div></div>
          </div>

          <p style={{fontSize:".63rem",color:errors.delivery?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:10}}>{errors.delivery?"⚠ هذا الحقل إلزامي":"طريقة الاستلام *"}</p>
          <div style={{display:"flex",gap:10,marginBottom:deliveryType==="delivery"?14:20}}>
            {[{v:"pickup",l:"🏪 استلام من الفرع"},{v:"delivery",l:"🛵 توصيل"}].map(o=>(
              <button key={o.v} className={`del-btn${deliveryType===o.v?" on":""}`} onClick={()=>{setDeliveryType(o.v);setErrors(e=>({...e,delivery:false}));}}>{o.l}</button>
            ))}
          </div>

          {deliveryType==="delivery"&&(
            <div className="pop-in" style={{marginBottom:16}}>
              <p style={{fontSize:".63rem",color:errors.location?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:10}}>{errors.location?"⚠ حدد موقعك أو اكتب العنوان":"📍 حدد موقعك على الخريطة *"}</p>
              <LocationPicker onSelect={coords=>{setMapCoords(coords);setLocationTxt(`https://maps.google.com/?q=${coords.lat},${coords.lng}`);setErrors(ev=>({...ev,location:false}));}}/>
              {mapCoords&&<div style={{background:"#0d1a0d",border:"1px solid #4CAF5033",borderRadius:10,padding:"8px 13px",marginBottom:10,fontSize:".72rem",color:"#4CAF50"}}>✓ تم تحديد الموقع</div>}
              <p style={{fontSize:".62rem",color:"#333",marginBottom:8}}>أو اكتب العنوان يدوياً</p>
              <textarea className={errors.location?"err":""} rows={2} placeholder="المحافظة، الحي، الشارع..." value={mapCoords?"":locationTxt} onChange={e=>{setLocationTxt(e.target.value);setMapCoords(null);setErrors(ev=>({...ev,location:false}));}} style={{resize:"none"}}/>
            </div>
          )}

          <p style={{fontSize:".63rem",color:errors.phone?"#ef4444":"#C8A96A66",letterSpacing:"2px",marginBottom:8}}>{errors.phone?"⚠ رقم الهاتف إلزامي":"رقم الهاتف للتواصل *"}</p>
          <input type="tel" className={errors.phone||(phone.length>0&&phone.length!==10)?"err":""} placeholder="09xxxxxxxx" value={phone} maxLength={10} onChange={e=>{const v=e.target.value.replace(/\D/g,"");setPhone(v);setErrors(ev=>({...ev,phone:false}));}} style={{marginBottom:4}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <p style={{fontSize:".6rem",color:"#252525"}}>يجب أن يكون 10 أرقام بالضبط</p>
            <span style={{fontSize:".6rem",fontWeight:700,color:phone.length===0?"#222":phone.length===10?"#4CAF50":"#ef4444"}}>{phone.length}/10</span>
          </div>
          {phone.length>0&&phone.length<10&&<p style={{fontSize:".62rem",color:"#ef4444",marginBottom:12,marginTop:-8}}>⚠ الرقم ناقص — أدخل {10-phone.length} أرقام إضافية</p>}

          <button className="btn-gold" disabled={!canCheckout} onClick={checkout} style={{width:"100%",padding:"14px",borderRadius:13,fontSize:".92rem",fontWeight:700,color:"#0f0f0f",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            <span style={{fontSize:"1.1rem"}}>📲</span>إرسال الطلب عبر واتساب
          </button>
          {!canCheckout&&<p style={{textAlign:"center",fontSize:".63rem",color:"#252525",marginTop:8}}>{!phoneValid?phone.length===0?"أدخل رقم هاتفك":`الرقم يجب أن يكون 10 أرقام (أدخلت ${phone.length})`:!deliveryType?"اختر طريقة الاستلام":"أدخل موقعك لإتمام الطلب"}</p>}
        </>)}
      </div>
    </div>
  );

  return null;
}
