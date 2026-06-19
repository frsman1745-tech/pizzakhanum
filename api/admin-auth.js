import crypto from "crypto";

const attempts = new Map();

export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method Not Allowed" });

  // Rate limit
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const data = attempts.get(ip);
  if (data && now < data.resetAt && data.count > 10) {
    return res.status(429).json({ success: false, error: "محاولات كثيرة — انتظر 15 دقيقة" });
  }
  if (!data || now > data.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    data.count++;
  }

  const { password } = req.body || {};
  const correct = process.env.ADMIN_PASSWORD;

  if (!correct) {
    console.error("[admin-auth] ADMIN_PASSWORD غير محدد");
    return res.status(500).json({ success: false, error: "Server misconfigured" });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, error: "كلمة المرور مطلوبة" });
  }

  if (password !== correct) {
    return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
  }

  const ts = Date.now().toString();
  const hmac = crypto.createHmac("sha256", correct).update(ts).digest("hex");
  const token = `${ts}.${hmac}`;
  const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000; // سنة

  return res.status(200).json({ success: true, token, expiresAt });
}
