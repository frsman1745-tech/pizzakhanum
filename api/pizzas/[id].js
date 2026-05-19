// api/pizzas/[id].js
// GET (public), PUT/PATCH/DELETE (admin-only, JWT required).
// toFrontend imported from index to avoid duplication.

import { connectDB } from "../../src/lib/mongodb.js";
import Pizza from "../../src/lib/models/Pizza.js";
import { UpdatePizzaSchema, PatchPizzaSchema } from "../../src/lib/validators/pizza.schema.js";
import { verifyAdminToken } from "../auth/verify.js";
import { toFrontend } from "./index.js";

const ORIGIN = process.env.APP_ORIGIN || "*";

function toModelPartial(data) {
  const r = {};
  if (data.label          !== undefined) r.name           = data.label;
  if (data.details        !== undefined) r.details         = data.details;
  if (data.menuSection    !== undefined) r.menuSection     = data.menuSection;
  if (data.comingSoon     !== undefined) r.comingSoon      = data.comingSoon;
  if (data.isActive       !== undefined) r.isActive        = data.isActive;
  if (data.imageUrl       !== undefined) r.imageUrl        = data.imageUrl;
  if (data.flavorImageUrl !== undefined) r.flavorImageUrl  = data.flavorImageUrl;
  if (data.sizes          !== undefined) r.sizes           = data.sizes;
  if (data.extras         !== undefined) r.extras          = data.extras;
  if (data.sortOrder      !== undefined) r.sortOrder       = data.sortOrder;
  return r;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }); }

  const { id } = req.query;

  // ── GET (public) ─────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const pizza = await Pizza.findById(id).lean();
      if (!pizza) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  // All write methods require admin JWT
  try { await verifyAdminToken(req); }
  catch (e) { return res.status(401).json({ success: false, error: e.message }); }

  // ── PUT (full replace) ───────────────────────────────────────────────────
  if (req.method === "PUT") {
    const parsed = UpdatePizzaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });
    }
    try {
      const pizza = await Pizza.findByIdAndUpdate(id, toModelPartial(parsed.data), { new: true, runValidators: true }).lean();
      if (!pizza) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  // ── PATCH (partial update: comingSoon toggle, sortOrder) ─────────────────
  if (req.method === "PATCH") {
    const parsed = PatchPizzaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });
    }
    try {
      const pizza = await Pizza.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
      if (!pizza) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(pizza) });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    try {
      const pizza = await Pizza.findByIdAndDelete(id).lean();
      if (!pizza) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, message: "تم الحذف" });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
