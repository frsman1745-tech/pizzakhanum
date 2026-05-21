// api/pizzas.js
import { connectDB } from "../src/lib/mongodb.js";
import Pizza        from "../src/lib/models/Pizza.js";
import { toFrontend, toBackend } from "../src/lib/api.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method==="OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch(e){ return res.status(500).json({success:false,error:"فشل الاتصال بقاعدة البيانات"}); }

  if (req.method==="GET") {
    try {
      const filter={};
      if (req.query.category) filter.category=req.query.category;
      const items = await Pizza.find(filter).sort({sortOrder:1,createdAt:-1});
      return res.status(200).json({success:true, data:items.map(toFrontend)});
    } catch(e){ return res.status(500).json({success:false,error:e.message}); }
  }

  if (req.method==="POST") {
    try {
      const p = await Pizza.create(toBackend(req.body));
      return res.status(201).json({success:true, data:toFrontend(p)});
    } catch(e){ return res.status(400).json({success:false,error:e.message}); }
  }

  res.setHeader("Allow",["GET","POST"]);
  return res.status(405).json({success:false,error:`Method ${req.method} غير مدعوم`});
}
