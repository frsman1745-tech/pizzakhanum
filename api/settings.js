import { connectDB } from "../src/lib/mongodb.js";
import Settings from "../src/lib/models/Settings.js";
import { corsHeaders, handleOptions, rateLimit, requireAdmin } from "../src/lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  corsHeaders(res);

  if (!["GET", "POST"].includes(req.method)) {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try { await connectDB(); }
  catch (e) {
    console.error("[settings] MongoDB error:", e);
    return res.status(500).json({ success: false, error: "Database connection failed" });
  }

  if (req.method === "GET") {
    try {
      let s = await Settings.findOne({ key: "global" });
      if (!s) {
        s = await Settings.create({ key: "global" });
      }
      return res.status(200).json({
        success: true,
        data: {
          siteName: s.name,
          siteSlogan: s.slogan,
          siteWhatsapp: s.whatsapp,
        },
      });
    } catch (e) {
      console.error("[settings] GET error:", e);
      return res.status(500).json({ success: false, error: "خطأ في جلب الإعدادات" });
    }
  }

  if (req.method === "POST") {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
    if (rateLimit(ip, "write")) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة" });
    }
    if (!requireAdmin(req, res)) return;

    const { siteName, siteSlogan, siteWhatsapp } = req.body || {};

    try {
      const s = await Settings.findOneAndUpdate(
        { key: "global" },
        { name: siteName, slogan: siteSlogan, whatsapp: siteWhatsapp },
        { new: true, upsert: true }
      );
      return res.status(200).json({
        success: true,
        data: {
          siteName: s.name,
          siteSlogan: s.slogan,
          siteWhatsapp: s.whatsapp,
        },
      });
    } catch (e) {
      console.error("[settings] POST error:", e);
      return res.status(400).json({ success: false, error: "خطأ في حفظ الإعدادات" });
    }
  }
}
