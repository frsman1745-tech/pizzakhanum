// api/pizzas/[id].js
import { connectDB } from "../../src/lib/mongodb.js";
import Pizza        from "../../src/lib/models/Pizza.js";
import { toFrontend, toBackendPartial } from "../../src/lib/api.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch(e){ return res.status(500).json({success:false,error:"فشل الاتصال بقاعدة البيانات"}); }

  const {id}=req.query;

  if(req.method==="GET"){
    try{
      const p=await Pizza.findById(id);
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
  if(req.method==="PUT"){
    try{
      const p=await Pizza.findByIdAndUpdate(id,toBackendPartial(req.body),{new:true,runValidators:true});
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
  if(req.method==="PATCH"){
    try{
      const p=await Pizza.findByIdAndUpdate(id,toBackendPartial(req.body),{new:true});
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,data:toFrontend(p)});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }
  if(req.method==="DELETE"){
    try{
      const p=await Pizza.findByIdAndDelete(id);
      if(!p) return res.status(404).json({success:false,error:"غير موجود"});
      return res.status(200).json({success:true,message:"تم الحذف"});
    }catch(e){return res.status(400).json({success:false,error:e.message});}
  }

  res.setHeader("Allow",["GET","PUT","PATCH","DELETE"]);
  return res.status(405).json({success:false,error:`Method ${req.method} غير مدعوم`});
}
