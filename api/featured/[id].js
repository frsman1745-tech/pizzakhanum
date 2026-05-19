// api/featured/[id].js
import { connectDB }       from "../../src/lib/mongodb.js";
import Featured            from "../../src/lib/models/Featured.js";
import { UpdateFeaturedSchema, PatchFeaturedSchema } from "../../src/lib/validators/pizza.schema.js";
import { verifyAdminToken } from "../auth/verify.js";
import { toFrontend }      from "./index.js";

const ORIGIN = process.env.APP_ORIGIN || "*";

function toModelPartial(data) {
  const r = {};
  if (data.label          !== undefined) r.name               = data.label;
  if (data.desc           !== undefined) r.desc               = data.desc;
  if (data.imageUrl       !== undefined) r.imageUrl           = data.imageUrl;
  if (data.flavorImageUrl !== undefined) r.flavorImageUrl     = data.flavorImageUrl;
  if (data.priceOld       !== undefined) r.fixedPriceOld      = data.priceOld;
  if (data.priceNew       !== undefined) r.fixedPriceNew      = data.priceNew;
  if (data.numericPrice   !== undefined) r.fixedNumericPrice  = data.numericPrice;
  if (data.sizes          !== undefined) r.sizes              = data.sizes;
  if (data.extras         !== undefined) r.extras             = data.extras;
  if (data.sliceCount     !== undefined) r.sliceCount         = data.sliceCount;
  if (data.cols           !== undefined) r.cols               = data.cols;
  if (data.sortOrder      !== undefined) r.sortOrder          = data.sortOrder;
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

  if (req.method === "GET") {
    try {
      const item = await Featured.findById(id).lean();
      if (!item) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(item) });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  try { await verifyAdminToken(req); }
  catch (e) { return res.status(401).json({ success: false, error: e.message }); }

  if (req.method === "PUT") {
    const parsed = UpdateFeaturedSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });
    try {
      const item = await Featured.findByIdAndUpdate(id, toModelPartial(parsed.data), { new: true, runValidators: true }).lean();
      if (!item) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(item) });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  if (req.method === "PATCH") {
    const parsed = PatchFeaturedSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });
    try {
      const item = await Featured.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
      if (!item) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(item) });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  if (req.method === "DELETE") {
    try {
      const item = await Featured.findByIdAndDelete(id).lean();
      if (!item) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, message: "تم الحذف" });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }

  res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
