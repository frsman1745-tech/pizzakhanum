import { connectDB } from "../../src/lib/mongodb.js";
import Pizza        from "../../src/lib/models/Pizza.js";
import { toFrontend, toBackendPartial } from "../../src/lib/api.js";
import { corsHeaders, handleOptions, rateLimit, requireAdmin, sanitizeError, isValidObjectId } from "../../src/lib/auth.js";

const ALLOWED_FIELDS = [
  "label", "type", "menuSection", "details", "desc",
  "comingSoon", "imageUrl", "flavorImageUrl",
  "priceOld", "priceNew", "numericPrice",
  "sizes", "khanamSizes", "extras", "sliceCount", "cols", "sortOrder",
];

function sanitizeBody(body) {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  corsHeaders(res);

  if (!["GET", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try { await connectDB(); }
  catch (e) {
    console.error("[pizzas/id] MongoDB connection error:", e);
    return res.status(500).json({ success: false, error: "Database connection failed" });
  }

  const { id } = req.query;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ success: false, error: "معرف غير صالح" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";

  if (req.method === "GET") {
    if (rateLimit(ip, "read")) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    try {
      const p = await Pizza.findById(id);
      if (!p) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(p) });
    } catch (e) {
      console.error("[pizzas/id] GET error:", e);
      return res.status(400).json({ success: false, error: sanitizeError(e) });
    }
  }

  if (["PUT", "PATCH", "DELETE"].includes(req.method)) {
    if (rateLimit(ip, "write")) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    if (!requireAdmin(req, res)) return;
  }

  if (req.method === "PUT") {
    try {
      const p = await Pizza.findByIdAndUpdate(id, toBackendPartial(sanitizeBody(req.body)), { new: true, runValidators: true });
      if (!p) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(p) });
    } catch (e) {
      console.error("[pizzas/id] PUT error:", e);
      return res.status(400).json({ success: false, error: sanitizeError(e) });
    }
  }

  if (req.method === "PATCH") {
    try {
      const p = await Pizza.findByIdAndUpdate(id, toBackendPartial(sanitizeBody(req.body)), { new: true });
      if (!p) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, data: toFrontend(p) });
    } catch (e) {
      console.error("[pizzas/id] PATCH error:", e);
      return res.status(400).json({ success: false, error: sanitizeError(e) });
    }
  }

  if (req.method === "DELETE") {
    try {
      const p = await Pizza.findByIdAndDelete(id);
      if (!p) return res.status(404).json({ success: false, error: "غير موجود" });
      return res.status(200).json({ success: true, message: "تم الحذف" });
    } catch (e) {
      console.error("[pizzas/id] DELETE error:", e);
      return res.status(400).json({ success: false, error: sanitizeError(e) });
    }
  }
}
