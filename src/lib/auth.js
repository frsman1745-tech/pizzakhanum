import crypto from "crypto";

const TOKEN_TTL = 8 * 60 * 60 * 1000;

const RATE_MAPS = {};

export function generateToken(secret) {
  const ts = Date.now().toString();
  const hmac = crypto.createHmac("sha256", secret).update(ts).digest("hex");
  return `${ts}.${hmac}`;
}

export function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const ts = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (Date.now() > Number(ts) + TOKEN_TTL) return false;
  const expected = crypto.createHmac("sha256", secret).update(ts).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function timingSafeEqual(a, b) {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(String(a)),
      Buffer.from(String(b))
    );
  } catch {
    return false;
  }
}

export function corsHeaders(res) {
  const origin = process.env.SITE_URL
    ? `https://${process.env.SITE_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
}

export function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  corsHeaders(res);
  res.status(200).end();
  return true;
}

export function rateLimit(ip, tier = "write") {
  const limits = { write: { max: 30, window: 60000 }, read: { max: 120, window: 60000 }, auth: { max: 10, window: 900000 } };
  const cfg = limits[tier] || limits.write;
  if (!RATE_MAPS[tier]) RATE_MAPS[tier] = {};
  const map = RATE_MAPS[tier];
  const now = Date.now();
  const entry = map[ip];
  if (!entry || now > entry.resetAt) {
    map[ip] = { count: 1, resetAt: now + cfg.window };
    return false;
  }
  entry.count++;
  return entry.count > cfg.max;
}

export function sanitizeError(e) {
  const msg = String(e?.message || e || "Unknown error");
  if (msg.includes("ENOENT") || msg.includes("EACCES") || msg.includes("EADDRINUSE")) {
    return "Internal server error";
  }
  if (msg.includes("validation failed") || msg.includes("ValidatorError")) {
    return "البيانات المدخلة غير صالحة";
  }
  return msg;
}

export function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(String(id));
}

export function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    res.status(500).json({ success: false, error: "Server configuration error" });
    return false;
  }
  if (!verifyToken(token, secret)) {
    res.status(401).json({ success: false, error: "غير مصرح" });
    return false;
  }
  return true;
}
