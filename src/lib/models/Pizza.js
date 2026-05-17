// src/lib/models/Pizza.js
import mongoose from "mongoose";

/* ── خيار واحد داخل مجموعة الإضافات ────────────────────────────────────────
   مثال: { id:"thin", label:"رفيعة", numericPrice:0, priceOld:"0", priceNew:"0" }
───────────────────────────────────────────────────────────────────────────── */
const ExtraOptionSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },
    label:        { type: String, required: true, trim: true },
    priceOld:     { type: String, default: "0" },     // "5,000" ل.س
    priceNew:     { type: String, default: "0" },     // "50"    ل.ج
    numericPrice: { type: Number, default: 0  },      // 5000   (للحسابات)
    sortOrder:    { type: Number, default: 0  },
  },
  { _id: false }
);

/* ── مجموعة إضافات ───────────────────────────────────────────────────────────
   مثال: { id:"dough", name:"العجينة", type:"single", required:true, options:[...] }
───────────────────────────────────────────────────────────────────────────── */
const ExtraGroupSchema = new mongoose.Schema(
  {
    id:       { type: String, required: true },
    name:     { type: String, required: true, trim: true },  // "العجينة" / "الإضافات"
    type:     { type: String, enum: ["single","multi"], default: "single" },
    required: { type: Boolean, default: false },
    sortOrder:{ type: Number, default: 0 },
    options:  { type: [ExtraOptionSchema], default: [] },
  },
  { _id: false }
);

/* ── حجم واحد (صغير / وسط / كبير) ──────────────────────────────────────────*/
const SizeSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },
    label:        { type: String, required: true },
    priceOld:     { type: String, default: "" },
    priceNew:     { type: String, default: "" },
    numericPrice: { type: Number, default: 0  },
    sortOrder:    { type: Number, default: 0  },
  },
  { _id: false }
);

/* ── الموديل الرئيسي ─────────────────────────────────────────────────────── */
const PizzaSchema = new mongoose.Schema(
  {
    // معلومات أساسية
    name:     { type: String, required: true, trim: true },
    category: { type: String, enum: ["menu","featured"], default: "menu" },
    details:  { type: String, default: "" },   // المكونات (للقائمة)
    desc:     { type: String, default: "" },   // وصف قصير  (للمميزة)

    // الحالة
    comingSoon: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true  },

    // الصور — روابط Cloudinary
    imageUrl:       { type: String, default: "" },
    flavorImageUrl: { type: String, default: "" },

    // الأسعار الثابتة (للمميزة — المتر / 60×40)
    fixedPriceOld:     { type: String, default: ""  },
    fixedPriceNew:     { type: String, default: ""  },
    fixedNumericPrice: { type: Number, default: 0   },

    // الأحجام (للقائمة العادية) — يُعرَّفها الأدمن
    sizes: { type: [SizeSchema], default: [] },

    // الإضافات — مجموعات يُعرّفها الأدمن (عجينة، إضافات...)
    extras: { type: [ExtraGroupSchema], default: [] },

    // خاص بـ Builder (المتر / 60×40)
    sliceCount: { type: Number, default: 0 },
    cols:       { type: Number, default: 0 },

    // خاص ببيتزا خانم
    khanamSizes: { type: [SizeSchema], default: [] },

    // الترتيب في الواجهة
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "pizzas",
  }
);

export default mongoose.models.Pizza || mongoose.model("Pizza", PizzaSchema);
