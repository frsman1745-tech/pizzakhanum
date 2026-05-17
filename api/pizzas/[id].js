// api/pizzas/[id].js — GET / PUT / PATCH / DELETE
import { connectDB } from "../../src/lib/mongodb.js";
import Pizza        from "../../src/lib/models/Pizza.js";

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
    priceOld:       o.fixedPriceOld     || "",
    priceNew:       o.fixedPriceNew     || "",
    numericPrice:   o.fixedNumericPrice || 0,
    sizes:          o.khanamSizes?.length ? o.khanamSizes : (o.sizes || []),
    extras:         o.extras            || [],
    sliceCount:     o.sliceCount        || 0,
    cols:           o.cols              || 0,
  };
}

function parseNum(v) {
  return Number(String(v || 0).replace(/,/g, "")) || 0;
}

function toBackend(body) {
  const r = {};
  if (body.label       !== undefined) r.name              = body.label || body.name;
  if (body.name        !== undefined) r.name              = body.name;
  if (body.type        !== undefined) r.category          = body.type;
  if (body.category    !== undefined) r.category          = body.category;
  if (body.details     !== undefined) r.details           = body.details;
  if (body.desc        !== undefined) r.desc              = body.desc;
  if (body.comingSoon  !== undefined) r.comingSoon        = body.comingSoon;
  if (body.isActive    !== undefined) r.isActive          = body.isActive;
  if (body.imageUrl    !== undefined) r.imageUrl          = body.imageUrl;
  if (body.flavorImageUrl !== undefined) r.flavorImageUrl = body.flavorImageUrl;
  if (body.priceOld    !== undefined) r.fixedPriceOld     = body.priceOld;
  if (body.priceNew    !== undefined) r.fixedPriceNew     = body.priceNew;
  if (body.numericPrice !== undefined) r.fixedNumericPrice = parseNum(body.numericPrice);
  if (body.sizes       !== undefined) r.sizes             = body.sizes;
  if (body.khanamSizes !== undefined) r.khanamSizes       = body.khanamSizes;
  if (body.extras      !== undefined) r.extras            = body.extras;
  if (body.sliceCount  !== undefined) r.sliceCount        = body.sliceCount;
  if (body.cols        !== undefined) r.cols              = body.cols;
  if (body.sortOrder   !== undefined) r.sortOrder         = body.sortOrder;
  return r;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success:false, error:"فشل الاتصال بقاعدة البيانات" }); }

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const p = await Pizza.findById(id);
      if (!p) return res.status(404).json({ success:false, error:"البيتزا غير موجودة" });
      return res.status(200).json({ success:true, data:toFrontend(p) });
    } catch (e) { return res.status(400).json({ success:false, error:e.message }); }
  }

  if (req.method === "PUT") {
    try {
      const p = await Pizza.findByIdAndUpdate(id, toBackend(req.body), { new:true, runValidators:true });
      if (!p) return res.status(404).json({ success:false, error:"البيتزا غير موجودة" });
      return res.status(200).json({ success:true, data:toFrontend(p) });
    } catch (e) { return res.status(400).json({ success:false, error:e.message }); }
  }

  if (req.method === "PATCH") {
    try {
      const p = await Pizza.findByIdAndUpdate(id, toBackend(req.body), { new:true });
      if (!p) return res.status(404).json({ success:false, error:"البيتزا غير موجودة" });
      return res.status(200).json({ success:true, data:toFrontend(p) });
    } catch (e) { return res.status(400).json({ success:false, error:e.message }); }
  }

  if (req.method === "DELETE") {
    try {
      const p = await Pizza.findByIdAndDelete(id);
      if (!p) return res.status(404).json({ success:false, error:"البيتزا غير موجودة" });
      return res.status(200).json({ success:true, message:"تم الحذف" });
    } catch (e) { return res.status(400).json({ success:false, error:e.message }); }
  }

  res.setHeader("Allow", ["GET","PUT","PATCH","DELETE"]);
  return res.status(405).json({ success:false, error:`Method ${req.method} غير مدعوم` });
}
