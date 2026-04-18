// pages/api/pizzas/[id].js
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import { connectDB }        from "@/lib/mongodb";
import Pizza                from "@/lib/models/Pizza";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  // التحقق من الجلسة لعمليات التعديل والحذف
  const requireAdmin = async () => {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== "admin") {
      res.status(401).json({ success: false, error: "غير مصرح" });
      return false;
    }
    return true;
  };

  /* ── GET /api/pizzas/:id ── */
  if (req.method === "GET") {
    try {
      const pizza = await Pizza.findById(id);
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: pizza });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /* ── PUT /api/pizzas/:id — تعديل بيتزا ── */
  if (req.method === "PUT") {
    if (!(await requireAdmin())) return;

    try {
      const pizza = await Pizza.findByIdAndUpdate(
        id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: pizza });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /* ── DELETE /api/pizzas/:id — حذف بيتزا ── */
  if (req.method === "DELETE") {
    if (!(await requireAdmin())) return;

    try {
      const pizza = await Pizza.findByIdAndDelete(id);
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /* ── PATCH /api/pizzas/:id — تعديل جزئي (مثل تغيير isActive) ── */
  if (req.method === "PATCH") {
    if (!(await requireAdmin())) return;

    try {
      const pizza = await Pizza.findByIdAndUpdate(id, req.body, { new: true });
      if (!pizza) return res.status(404).json({ success: false, error: "البيتزا غير موجودة" });
      return res.status(200).json({ success: true, data: pizza });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE", "PATCH"]);
  res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
