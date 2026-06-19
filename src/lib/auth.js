import crypto from "crypto";

const RATE_LIMITS = {
  admin:  { max: 10,  windowMs: 15 * 60 * 1000 },
  write:  { max: 30,  windowMs: 60 * 1000 },
  read:   { max: 120, windowMs: 60 * 1000 },
};

const rateMaps = { admin: new Map(), write: new Map(), read: new Map() };

export function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

export function isRateLimited(ip, tier = "read") {
  const cfg = RATE_LIMITS[tier] || RATE_LIMITS.read;
  const map = rateMaps[tier];
  const now = Date.now();
  const data = map.get(ip);
  if (!data || now > data.resetAt) {
    map.set(ip, { count: 1, resetAt: now + cfg.windowMs });
    return false;
  }
  data.count++;
  return data.count > cfg.max;
}

export function setCORS(res, methods = "GET,OPTIONS") {
  const siteUrl = process.env.SITE_URL || process.env.VERCEL_URL;
  const origin = siteUrl ? `https://${siteUrl}` : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

export function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const correctPassword = process.env.ADMIN_PASSWORD;
  if (!correctPassword) {
    res.status(500).json({ success: false, error: "Server misconfigured" });
    return false;
  }
  if (!token) {
    res.status(401).json({ success: false, error: "التوكن مطلوب" });
    return false;
  }
  try {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("invalid token");
    const ts = parts[0];
    const sig = parts.slice(1).join(".");
    const expected = crypto.createHmac("sha256", correctPassword).update(ts).digest("hex");
    if (Date.now() > Number(ts) + 8 * 60 * 60 * 1000) {
      res.status(401).json({ success: false, error: "انتهت صلاحية التوكن" });
      return false;
    }
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      res.status(401).json({ success: false, error: "توكن غير صالح" });
      return false;
    }
    return true;
  } catch {
    res.status(401).json({ success: false, error: "توكن غير صالح" });
    return false;
  }
}

export function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    setCORS(res, "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.status(200).end();
    return true;
  }
  return false;
}
