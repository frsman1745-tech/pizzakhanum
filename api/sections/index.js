// api/sections/index.js
// Single GET/PUT endpoint for the sections document.
// GET is public. PUT is admin-only.

import { connectDB } from "../../src/lib/mongodb.js";
import MenuSection from "../../src/lib/models/MenuSection.js";
import { SaveSectionsSchema } from "../../src/lib/validators/pizza.schema.js";
import { verifyAdminToken } from "../auth/verify.js";

const ORIGIN = process.env.APP_ORIGIN || "*";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  try { await connectDB(); }
  catch (e) { return res.status(500).json({ success: false, error: "فشل الاتصال بقاعدة البيانات" }); }

  if (req.method === "GET") {
    try {
      const doc = await MenuSection.findOne({}).lean();
      const sections = (doc?.sections || []).sort((a, b) => a.sortOrder - b.sortOrder);
      return res.status(200).json({ success: true, data: sections });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method === "PUT") {
    try { await verifyAdminToken(req); } catch (e) { return res.status(401).json({ success: false, error: e.message }); }
    const parsed = SaveSectionsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.errors.map(e => e.message).join(", ") });

    try {
      // Map to model shape (sectionId field)
      const sections = parsed.data.sections.map((s, i) => ({
        sectionId: s.id,
        label: s.label,
        emoji: s.emoji,
        sortOrder: i,
      }));

      const doc = await MenuSection.findOneAndUpdate(
        {},
        { $set: { sections } },
        { new: true, upsert: true }
      ).lean();

      return res.status(200).json({ success: true, data: doc.sections });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ success: false, error: `Method ${req.method} غير مدعوم` });
}
