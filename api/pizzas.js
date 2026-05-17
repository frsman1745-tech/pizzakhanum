// api/pizzas.js — GET /api/pizzas  +  POST /api/pizzas
import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";

/* ── MongoDB → الواجهة الأمامية ─────────────────────────────────────────── */
function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id:             String(o._id),
    label:          o.name,
    type:           o.category,
    details:        o.details          || "",
    desc:           o.desc             || "",
    comingSoon:     o.comingSoon        || false,
    isActive:       o.isActive          !== false,
    sortOrder:      o.sortOrder         || 0,
    imageUrl:       o.imageUrl          || "",
    flavorImageUrl: o.flavorImageUrl    || "",
    // أسعار ثابتة (مميزة)
    priceOld:       o.fixedPriceOld     || "",
    priceNew:       o.fixedPriceNew     || "",
    numericPrice:   o.fixedNumericPrice || 0,
    // أحجام
    sizes:          o.khanamSizes?.length ? o.khanamSizes : (o.sizes || []),
    // إضافات
    extras:         o.extras            || [],
    // Builder
    sliceCount:     o.sliceCount        || 0,
    cols:           o.cols              || 0,
  };
}

/* ── الواجهة الأمامية → MongoDB ─────────────────────────────────────────── */
function toBackend(body) {
  return {
    name:              body.label            || body.name      || "بيتزا جديدة",
    category:          body.type             || body.category  || "menu",
    details:           body.details          || "",
    desc:              body.desc             || "",
    comingSoon:        body.comingSoon        ?? false,
    isActive:          body.isActive          ?? true,
    imageUrl:          body.imageUrl          || "",
    flavorImageUrl:    body.flavorImageUrl    || "",
    fixedPriceOld:     body.priceOld          || "",
    fixedPriceNew:     body.priceNew          || "",
    fixedNumericPrice: parseNum(body.numericPrice),
    sizes:             body.sizes             || [],
    khanamSizes:       body.khanamSizes       || [],
    extras:            body.extras            || [],
    sliceCount:        body.sliceCount        || 0,
    cols:              body.cols              || 0,
    sortOrder:         body.sortOrder         || 0,
  };
}

function parseNum(v) {
  return Number(String(v || 0).replace(/,/g, "")) || 0;
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success:false, error:"فشل الاتصال بقاعدة البيانات" }); }

  /* GET */
  if (req.method === "GET") {
    try {
      const filter = req.query.category ? { category: req.query.category } : {};
      const items  = await Pizza.find(filter).sort({ sortOrder:1, createdAt:-1 });
      return res.status(200).json({ success:true, data: items.map(toFrontend) });
    } catch (e) { return res.status(500).json({ success:false, error:e.message }); }
  }

  /* POST */
  if (req.method === "POST") {
    try {
      const pizza = await Pizza.create(toBackend(req.body));
      return res.status(201).json({ success:true, data: toFrontend(pizza) });
    } catch (e) { return res.status(400).json({ success:false, error:e.message }); }
  }

  res.setHeader("Allow", ["GET","POST"]);
  return res.status(405).json({ success:false, error:`Method ${req.method} غير مدعوم` });
}
