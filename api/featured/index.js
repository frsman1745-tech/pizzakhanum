// api/featured/index.js
import { connectDB } from "../../src/lib/mongodb.js";
import Featured from "../../src/lib/models/Featured.js";
import { CreateFeaturedSchema } from "../../src/lib/validators/pizza.schema.js";
import { verifyAdminToken } from "../auth/verify.js";

const ORIGIN = process.env.APP_ORIGIN || "*";

export function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id:             String(o._id),
    label:          o.name,
    desc:           o.desc           || "",
    imageUrl:       o.imageUrl       || "",
    flavorImageUrl: o.flavorImageUrl || "",
    priceOld:       o.fixedPriceOld  || "",
    priceNew:       o.fixedPriceNew  || "",
    numericPrice:   o.fixedNumericPrice || 0,
    sizes:          o.sizes          || [],
    extras:         o.extras         || [],
    sliceCount:     o.sliceCount     || 0,
    cols:           o.cols           || 0,
    sortOrder:      o.sortOrder      || 0,
  };
}

function toModel(data) {
  return {
    name:               data.label,
    desc:               data.desc            || "",
    imageUrl:           data.imageUrl        || "",
    flavorImageUrl:     data.flavorImageUrl  || "",
    fixedPriceOld:      data.priceOld        || "",
    fixedPriceNew:      data.priceNew        || "",
    fixedNumericPrice:  data.numericPrice     || 0,
    sizes:              data.sizes           || [],
    extras:             data.extras          || [],
    sliceCount:         data.sliceCount      || 0,
    cols:               data.cols            || 0,
    sortOrder:          data.sortOrder       || 0,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }); }

  if (req.method === "GET") {
    try {
      const items = await Featured.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
      return res.status(200).json({ success: true, data: items.map(toFrontend) });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "POST") {
    try { await verifyAdminToken(req); } catch (e) { return res.status(401).json({ success: false, error: e.message }); }
    const parsed = CreateFeaturedSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });
    try {
      const item = await Featured.create(toModel(parsed.data));
      return res.status(201).json({ success: true, data: toFrontend(item) });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
