import crypto from "crypto";
import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";
import { toFrontend, toBackend } from "../src/lib/api.js";

const readLimiter = new Map();
const writeLimiter = new Map();

function getIP(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.headers["x-real-ip"] || "unknown";
}

function isLimited(map, max, windowMs, ip) {
  const now = Date.now();
  const d = map.get(ip);
  if (!d || now > d.resetAt) { map.set(ip, { count: 1, resetAt: now + windowMs }); return false; }
  d.count++;
  return d.count > max;
}

function verifyAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) { res.status(500).json({ success: false, error: "Server misconfigured" }); return false; }
  try {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error();
    const ts = parts[0];
    const sig = parts.slice(1).join(".");
    const expected = crypto.createHmac("sha256", correct).update(ts).digest("hex");
    if (Date.now() > Number(ts) + 365 * 24 * 60 * 60 * 1000) {
      res.status(401).json({ success: false, error: "انتهت صلاحية التوكن" }); return false;
    }
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      res.status(401).json({ success: false, error: "توكن غير صالح" }); return false;
    }
    return true;
  } catch {
    res.status(401).json({ success: false, error: "توكن غير صالح" }); return false;
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
  }

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }); }

  const ip = getIP(req);

  if (req.method === "GET") {
    if (isLimited(readLimiter, 120, 60000, ip)) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      const items = await Pizza.find(filter).sort({ sortOrder: 1, createdAt: -1 });
      return res.status(200).json({ success: true, data: items.map(toFrontend) });
    } catch (e) { return res.status(500).json({ success: false, error: e.message }); }
  }

  if (req.method === "POST") {
    if (isLimited(writeLimiter, 30, 60000, ip)) {
      return res.status(429).json({ success: false, error: "طلبات كثيرة — تأنى قليلاً" });
    }
    if (!verifyAdmin(req, res)) return;
    try {
      const p = await Pizza.create(toBackend(req.body));
      return res.status(201).json({ success: true, data: toFrontend(p) });
    } catch (e) { return res.status(400).json({ success: false, error: e.message }); }
  }
}
