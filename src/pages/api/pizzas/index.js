// pages/api/pizzas/index.js
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import { connectDB }        from "@/lib/mongodb";
import Pizza                from "@/lib/models/Pizza";

export default async function handler(req, res) {
  await connectDB();

  /* ── GET /api/pizzas — جلب كل البيتزا ── */
  if (req.method === "GET") {
    try {
      const { category, activeOnly } = req.query;

      const filter = {};
      if (category)              filter.category = category;
      if (activeOnly === "true") filter.isActive = true;

      const pizzas = await Pizza.find(filter).sort({ sortOrder: 1, createdAt: -1 });
      return res.status(200).json({ success: true, data: pizzas });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /* ── POST /api/pizzas — إضافة بيتزا جديدة (أدمن فقط) ── */
  if (req.method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "admin") {
      return res.status(401).json({ success: false, error: "غير مصرح" });
    }

    try {
      const pizza = await Pizza.create(req.body);
      return res.status(201).json({ success: true, data: pizza });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
