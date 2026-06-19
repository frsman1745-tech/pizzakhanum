import { connectDB } from "../../src/lib/mongodb.js";
import Pizza        from "../../src/lib/models/Pizza.js";
import { toFrontend, toBackendPartial } from "../../src/lib/api.js";
import { getIP, isRateLimited, setCORS, requireAdmin, handleOptions } from "../../src/lib/auth.js";

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCORS(res, "GET,PUT,PATCH,DELETE,OPTIONS");

  if (!["GET","PUT","PATCH","DELETE"].includes(req.method)) {
    return res.status(405).json({success:false,error:`Method ${req.method} غير مدعوم`});
  }

  try { await connectDB(); }
  catch(e){ return res.status(500).json({success:false,error:"فشل الاتصال بقاعدة البيانات"}); }

  const {id}=req.query;

  if (req.method==="GET") {
    const ip = getIP(req);
    if (isRateLimited(ip, "read")) {
      return res.status(429).json({success:false,error:"طلبات كثيرة — تأنى قليلاً"});
    }
    try{
      const p=await Pizza.findById(id);
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }

  if (["PUT","PATCH","DELETE"].includes(req.method)) {
    const ip = getIP(req);
    if (isRateLimited(ip, "write")) {
      return res.status(429).json({success:false,error:"طلبات كثيرة — تأنى قليلاً"});
    }
    if (!requireAdmin(req, res)) return;
  }

  if (req.method==="PUT"){
    try{
      const p=await Pizza.findByIdAndUpdate(id,toBackendPartial(req.body),{new:true,runValidators:true});
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
  if (req.method==="PATCH"){
    try{
      const p=await Pizza.findByIdAndUpdate(id,toBackendPartial(req.body),{new:true});
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
  if (req.method==="DELETE"){
    try{
      const p=await Pizza.findByIdAndDelete(id);
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,message:"تم الحذف"});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
}
