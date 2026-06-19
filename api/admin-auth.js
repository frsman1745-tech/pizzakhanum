import crypto from "crypto";
import { getIP, isRateLimited, setCORS, handleOptions } from "../src/lib/auth.js";

const attempts = new Map();

export default function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCORS(res, "POST,OPTIONS");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const ip = getIP(req);
  if (isRateLimited(ip, "admin")) {
    return res.status(429).json({
      success: false,
      error: "محاولات كثيرة — انتظر 15 دقيقة",
    });
  }

  const { password } = req.body || {};
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (!correctPassword) {
    console.error("[admin-auth] ADMIN_PASSWORD غير محدد في متغيرات البيئة");
    return res.status(500).json({ success: false, error: "Server misconfigured" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "كلمة المرور مطلوبة" });
  }

  const inputHash   = crypto.createHash("sha256").update(password).digest("hex");
  const correctHash = crypto.createHash("sha256").update(correctPassword).digest("hex");
  const isValid     = crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(correctHash)
  );

  if (!isValid) {
    return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
  }

  const ts    = Date.now().toString();
  const hmac  = crypto.createHmac("sha256", correctPassword).update(ts).digest("hex");
  const token = `${ts}.${hmac}`;
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  return res.status(200).json({ success: true, token, expiresAt });
}
