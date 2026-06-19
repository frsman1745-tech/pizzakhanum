import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";
import { toFrontend, toBackend } from "../src/lib/api.js";
import { getIP, isRateLimited, setCORS, requireAdmin, handleOptions } from "../src/lib/auth.js";

const createLimiter = new Map();

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCORS(res, "GET,POST,OPTIONS");

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({success:false,error:`Method ${req.method} غير مدعوم`});
  }

  try { await connectDB(); }
  catch(e){ return res.status(500).json({success:false,error:"فشل الاتصال بقاعدة البيانات"}); }

  if (req.method === "GET") {
    const ip = getIP(req);
    if (isRateLimited(ip, "read")) {
      return res.status(429).json({success:false,error:"طلبات كثيرة — تأنى قليلاً"});
    }
    try {
      const filter={};
      if (req.query.category) filter.category=req.query.category;
      const items = await Pizza.find(filter).sort({sortOrder:1,createdAt:-1});
      return res.status(200).json({success:true, data:items.map(toFrontend)});
    } catch(e){ return res.status(500).json({success:false,error:e.message}); }
  }

  if (req.method === "POST") {
    const ip = getIP(req);
    if (isRateLimited(ip, "write")) {
      return res.status(429).json({success:false,error:"طلبات كثيرة — تأنى قليلاً"});
    }
    if (!requireAdmin(req, res)) return;
    try {
      const p = await Pizza.create(toBackend(req.body));
      return res.status(201).json({success:true, data:toFrontend(p)});
    } catch(e){ return res.status(400).json({success:false,error:e.message}); }
  }
}
