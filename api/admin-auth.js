// api/admin-auth.js
// تحقق من كلمة المرور على السيرفر — ADMIN_PASSWORD لا VITE_ADMIN_PASSWORD
// لا تُكشف قيمة المتغير للمتصفح إطلاقاً

import crypto from "crypto";

// بسيط: rate limiting في الذاكرة (يُصفَّر عند إعادة تشغيل Function)
const attempts = new Map(); // ip → { count, resetAt }

function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const data = attempts.get(ip);
  if (!data || now > data.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 دقيقة
    return false;
  }
  data.count++;
  if (data.count > 10) return true; // حد أقصى 10 محاولات كل 15 دقيقة
  return false;
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ success: false, error: "Method Not Allowed" });

  const ip = getIP(req);

  if (isRateLimited(ip)) {
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

  // مقارنة ثابتة الوقت لمنع Timing Attacks
  const inputHash   = crypto.createHash("sha256").update(password).digest("hex");
  const correctHash = crypto.createHash("sha256").update(correctPassword).digest("hex");
  const isValid     = crypto.timingSafeEqual(
    Buffer.from(inputHash),
    Buffer.from(correctHash)
  );

  if (!isValid) {
    return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
  }

  // توليد token: HMAC(timestamp + secret)
  const ts    = Date.now().toString();
  const token = crypto
    .createHmac("sha256", correctPassword)
    .update(ts)
    .digest("hex");

  // Token صالح 8 ساعات
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;

  return res.status(200).json({ success: true, token, expiresAt });
}
