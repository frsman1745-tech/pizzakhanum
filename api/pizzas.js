// api/pizzas.js
import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";

function parseNum(v) { return Number(String(v||0).replace(/,/g,""))||0; }

function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : {...doc};
  return {
    id:             String(o._id),
    label:          o.name,
    type:           o.category,
    menuSection:    o.menuSection    || "",
    details:        o.details        || "",
    desc:           o.desc           || "",
    comingSoon:     o.comingSoon     || false,
    isActive:       o.isActive       !== false,
    sortOrder:      o.sortOrder      || 0,
    imageUrl:       o.imageUrl       || "",
    flavorImageUrl: o.flavorImageUrl || "",
    priceOld:       o.fixedPriceOld  || "",
    priceNew:       o.fixedPriceNew  || "",
    numericPrice:   o.fixedNumericPrice || 0,
    sizes:          o.khanamSizes?.length ? o.khanamSizes : (o.sizes||[]),
    extras:         o.extras         || [],
    sliceCount:     o.sliceCount     || 0,
    cols:           o.cols           || 0,
    sections:       o.sections       || [],
  };
}

function toBackend(body) {
  return {
    name:              body.label        || body.name    || "جديد",
    category:          body.type         || body.category|| "menu",
    menuSection:       body.menuSection  || "",
    details:           body.details      || "",
    desc:              body.desc         || "",
    comingSoon:        body.comingSoon   ?? false,
    isActive:          body.isActive     ?? true,
    imageUrl:          body.imageUrl     || "",
    flavorImageUrl:    body.flavorImageUrl||"",
    fixedPriceOld:     body.priceOld     || "",
    fixedPriceNew:     body.priceNew     || "",
    fixedNumericPrice: parseNum(body.numericPrice),
    sizes:             body.sizes        || [],
    khanamSizes:       body.khanamSizes  || [],
    extras:            body.extras       || [],
    sliceCount:        body.sliceCount   || 0,
    cols:              body.cols         || 0,
    sections:          body.sections     || [],
    sortOrder:         body.sortOrder    || 0,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method==="OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch(e){ return res.status(500).json({success:false,error:"فشل الاتصال بقاعدة البيانات"}); }

  if (req.method==="GET") {
    try {
      const filter={};
      if (req.query.category) filter.category=req.query.category;
      const items = await Pizza.find(filter).sort({sortOrder:1,createdAt:-1});
      return res.status(200).json({success:true, data:items.map(toFrontend)});
    } catch(e){ return res.status(500).json({success:false,error:e.message}); }
  }

  if (req.method==="POST") {
    try {
      const p = await Pizza.create(toBackend(req.body));
      return res.status(201).json({success:true, data:toFrontend(p)});
    } catch(e){ return res.status(400).json({success:false,error:e.message}); }
  }

  res.setHeader("Allow",["GET","POST"]);
  return res.status(405).json({success:false,error:`Method ${req.method} غير مدعوم`});
}
