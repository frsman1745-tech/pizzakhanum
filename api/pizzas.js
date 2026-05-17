// api/pizzas.js — Vercel Serverless Function
// GET  /api/pizzas          ← جلب كل البيتزا (أو حسب category)
// POST /api/pizzas          ← إضافة بيتزا جديدة

import { connectDB } from "../src/lib/mongodb.js";
import Pizza from "../src/lib/models/Pizza.js";

/* ── تحويل MongoDB → الواجهة الأمامية ─────────────────────────────────────── */
function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    // الحقول الأساسية
    id:             String(o._id),
    label:          o.name,
    type:           o.category,
    details:        o.details        || "",
    desc:           o.desc           || "",
    comingSoon:     o.comingSoon      || false,
    isActive:       o.isActive        !== false,
    sortOrder:      o.sortOrder       || 0,

    // الصور
    imageUrl:       o.imageUrl        || "",
    flavorImageUrl: o.flavorImageUrl  || "",

    // الأسعار الثابتة (للمميزة)
    priceOld:       o.fixedPriceOld   || "",
    priceNew:       o.fixedPriceNew   || "",
    numericPrice:   o.fixedNumericPrice || 0,

    // الأحجام
    sizes:          o.khanamSizes?.length ? o.khanamSizes : (o.sizes || []),

    // خاص بالـ Builder
    sliceCount:     o.sliceCount      || 0,
    cols:           o.cols            || 0,
  };
}

/* ── تحويل الواجهة الأمامية → MongoDB ─────────────────────────────────────── */
function toBackend(body) {
  return {
    name:              body.label            || body.name         || "بيتزا جديدة",
    category:          body.type             || body.category     || "menu",
    details:           body.details          || "",
    desc:              body.desc             || "",
    comingSoon:        body.comingSoon        ?? false,
    isActive:          body.isActive          ?? true,
    imageUrl:          body.imageUrl          || "",
    flavorImageUrl:    body.flavorImageUrl    || "",
    fixedPriceOld:     body.priceOld          || "",
    fixedPriceNew:     body.priceNew          || "",
    fixedNumericPrice: Number(String(body.numericPrice || 0).replace(/,/g, "")) || 0,
    sizes:             body.sizes             || [],
    khanamSizes:       body.khanamSizes       || [],
    sliceCount:        body.sliceCount        || 0,
    cols:              body.cols              || 0,
    sortOrder:         body.sortOrder         || 0,
  };
}

export default async function handler(req, res) {
  // ── CORS ──
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // ── اتصال DB ──
  try {
    await connectDB();
  } catch (err) {
    console.error("[DB Connect]", err.message);
    return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" });
  }

  // ── GET /api/pizzas ──
  if (req.method === "GET") {
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;

      const pizzas = await Pizza.find(filter).sort({ sortOrder: 1, createdAt: -1 });
      return res.status(200).json({ success: true, data: pizzas.map(toFrontend) });
    } catch (err) {
      console.error("[GET /api/pizzas]", err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── POST /api/pizzas ──
  if (req.method === "POST") {
    try {
      const pizza = await Pizza.create(toBackend(req.body));
      return res.status(201).json({ success: true, data: toFrontend(pizza) });
    } catch (err) {
      console.error("[POST /api/pizzas]", err.message);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
