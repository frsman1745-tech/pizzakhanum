// api/pizzas/index.js
// GET (public) + POST (admin-only, JWT required).
// Uses Zod for validation. toFrontend/toBackend defined once here.

import { connectDB } from "../../src/lib/mongodb.js";
import Pizza from "../../src/lib/models/Pizza.js";
import { CreatePizzaSchema } from "../../src/lib/validators/pizza.schema.js";
import { verifyAdminToken } from "../auth/verify.js";

const ORIGIN = process.env.APP_ORIGIN || "*";

/** Map Mongoose doc → shape expected by the React frontend. */
export function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id:             String(o._id),
    label:          o.name,
    details:        o.details        || "",
    menuSection:    o.menuSection    || "",
    comingSoon:     o.comingSoon     || false,
    isActive:       o.isActive       !== false,
    imageUrl:       o.imageUrl       || "",
    flavorImageUrl: o.flavorImageUrl || "",
    sizes:          o.sizes          || [],
    extras:         o.extras         || [],
    sortOrder:      o.sortOrder      || 0,
  };
}

/** Map validated body → Mongoose document shape. */
function toModel(data) {
  return {
    name:           data.label,
    details:        data.details        || "",
    menuSection:    data.menuSection    || "",
    comingSoon:     data.comingSoon     ?? false,
    isActive:       data.isActive       ?? true,
    imageUrl:       data.imageUrl       || "",
    flavorImageUrl: data.flavorImageUrl || "",
    sizes:          data.sizes          || [],
    extras:         data.extras         || [],
    sortOrder:      data.sortOrder      || 0,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }); }

  // ── GET /api/pizzas ─────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const filter = {};
      if (req.query.menuSection) filter.menuSection = req.query.menuSection;
      // Only show active items to non-admin requests (no auth header = public)
      const isAdmin = !!req.headers.authorization;
      if (!isAdmin) filter.isActive = true;

      const items = await Pizza.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: items.map(toFrontend) });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // ── POST /api/pizzas — ADMIN ONLY ────────────────────────────────────────
  if (req.method === "POST") {
    try { await verifyAdminToken(req); }
    catch (e) { return res.status(401).json({ success: false, error: e.message }); }

    const parsed = CreatePizzaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      });
    }

    try {
      const pizza = await Pizza.create(toModel(parsed.data));
      return res.status(201).json({ success: true, data: toFrontend(pizza) });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
