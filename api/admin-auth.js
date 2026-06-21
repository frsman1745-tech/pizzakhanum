import { corsHeaders, handleOptions, rateLimit, timingSafeEqual, generateToken } from "../src/lib/auth.js";

export default function handler(req, res) {
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (rateLimit(ip, "auth")) {
    return res.status(429).json({ success: false, error: "محاولات كثيرة — انتظر 15 دقيقة" });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "كلمة المرور مطلوبة" });
  }

  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) {
    return res.status(500).json({ success: false, error: "Server configuration error" });
  }

  if (!timingSafeEqual(password, correct)) {
    return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
  }

  const token = generateToken(correct);
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  corsHeaders(res);
  return res.status(200).json({ success: true, token, expiresAt });
}
