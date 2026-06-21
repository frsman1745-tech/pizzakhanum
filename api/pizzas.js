import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";
import { toFrontend, toBackend } from "../src/lib/api.js";
import { corsHeaders, handleOptions, rateLimit, requireAdmin, sanitizeError } from "../src/lib/auth.js";

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

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try { await connectDB(); }
  catch (e) {
    console.error("[pizzas] MongoDB connection error:", e);
    return res.status(500).json({ success: false, error: "Database connection failed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";

  if (req.method === "GET") {
    if (rateLimit(ip, "read")) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      const items = await Pizza.find(filter).sort({ sortOrder: 1, createdAt: -1 });
      return res.status(200).json({ success: true, data: items.map(toFrontend) });
    } catch (e) {
      console.error("[pizzas] GET error:", e);
      return res.status(500).json({ success: false, error: sanitizeError(e) });
    }
  }

  if (req.method === "POST") {
    if (rateLimit(ip, "write")) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    if (!requireAdmin(req, res)) return;
    try {
      const p = await Pizza.create(toBackend(sanitizeBody(req.body)));
      return res.status(201).json({ success: true, data: toFrontend(p) });
    } catch (e) {
      console.error("[pizzas] POST error:", e);
      return res.status(400).json({ success: false, error: sanitizeError(e) });
    }
  }
}
