const attempts = new Map();

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method Not Allowed" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const d = attempts.get(ip);
  if (d && now < d.resetAt && d.count > 10) {
    return res.status(429).json({ success: false, error: "محاولات كثيرة — انتظر 15 دقيقة" });
  }
  if (!d || now > d.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    d.count++;
  }

  const { password } = req.body || {};
  const correct = process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!correct) return res.status(500).json({ success: false, error: "Server misconfigured" });
  if (password !== correct) return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });

  return res.status(200).json({ success: true, token: password });
}
