// api/pizzas/[id].js — Vercel Serverless Function
// GET   /api/pizzas/:id   ← جلب بيتزا واحدة
// PUT   /api/pizzas/:id   ← تعديل كامل
// PATCH /api/pizzas/:id   ← تعديل جزئي (مثل comingSoon)
// DELETE /api/pizzas/:id  ← حذف

import { connectDB } from "../../src/lib/mongodb.js";
import Pizza from "../../src/lib/models/Pizza.js";

function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id:             String(o._id),
    label:          o.name,
    type:           o.category,
    details:        o.details         || "",
    desc:           o.desc            || "",
    comingSoon:     o.comingSoon       || false,
    isActive:       o.isActive         !== false,
    sortOrder:      o.sortOrder        || 0,
    imageUrl:       o.imageUrl         || "",
    flavorImageUrl: o.flavorImageUrl   || "",
    priceOld:       o.fixedPriceOld    || "",
    priceNew:       o.fixedPriceNew    || "",
    numericPrice:   o.fixedNumericPrice || 0,
    sizes:          o.khanamSizes?.length ? o.khanamSizes : (o.sizes || []),
    sliceCount:     o.sliceCount       || 0,
    cols:           o.cols             || 0,
  };
}

function toBackend(body) {
  const result = {};
  if (body.label       !== undefined) result.name              = body.label || body.name;
  if (body.name        !== undefined) result.name              = body.name;
  if (body.type        !== undefined) result.category          = body.type;
  if (body.category    !== undefined) result.category          = body.category;
  if (body.details     !== undefined) result.details           = body.details;
  if (body.desc        !== undefined) result.desc              = body.desc;
  if (body.comingSoon  !== undefined) result.comingSoon        = body.comingSoon;
  if (body.isActive    !== undefined) result.isActive          = body.isActive;
  if (body.imageUrl    !== undefined) result.imageUrl          = body.imageUrl;
  if (body.flavorImageUrl !== undefined) result.flavorImageUrl = body.flavorImageUrl;
  if (body.priceOld    !== undefined) result.fixedPriceOld     = body.priceOld;
  if (body.priceNew    !== undefined) result.fixedPriceNew     = body.priceNew;
  if (body.numericPrice !== undefined)
    result.fixedNumericPrice = Number(String(body.numericPrice).replace(/,/g, "")) || 0;
  if (body.sizes       !== undefined) result.sizes             = body.sizes;
  if (body.khanamSizes !== undefined) result.khanamSizes       = body.khanamSizes;
  if (body.sliceCount  !== undefined) result.sliceCount        = body.sliceCount;
  if (body.cols        !== undefined) result.cols              = body.cols;
  if (body.sortOrder   !== undefined) result.sortOrder         = body.sortOrder;
  return result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" });
  }

  const { id } = req.query;

  // ── GET ──
  if (req.method === "GET") {
    try {
      const pizza = await Pizza.findById(id);
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // ── PUT (تعديل كامل) ──
  if (req.method === "PUT") {
    try {
      const pizza = await Pizza.findByIdAndUpdate(
        id,
        toBackend(req.body),
        { new: true, runValidators: true }
      );
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // ── PATCH (تعديل جزئي مثل comingSoon أو sortOrder) ──
  if (req.method === "PATCH") {
    try {
      const pizza = await Pizza.findByIdAndUpdate(
        id,
        toBackend(req.body),
        { new: true }
      );
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // ── DELETE ──
  if (req.method === "DELETE") {
    try {
      const pizza = await Pizza.findByIdAndDelete(id);
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
