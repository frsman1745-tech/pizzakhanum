// src/lib/models/Pizza.js
import mongoose from "mongoose";

// ── حجم واحد (صغير / وسط / كبير) ──────────────────────────────────────────
const SizeSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },   // "sm" | "md" | "lg"
    label:        { type: String, required: true },   // "صغير"
    priceOld:     { type: String, default: "" },      // "35,000"
    priceNew:     { type: String, default: "" },      // "350"
    numericPrice: { type: Number, default: 0 },       // 35000
  },
  { _id: false }
);

// ── الموديل الرئيسي ─────────────────────────────────────────────────────────
const PizzaSchema = new mongoose.Schema(
  {
    // معلومات أساسية
    name:        { type: String, required: true, trim: true },
    category:    { type: String, enum: ["menu", "featured"], default: "menu" },
    details:     { type: String, default: "" },  // المكونات (للقائمة)
    desc:        { type: String, default: "" },  // وصف قصير (للمميزة)

    // الحالة
    comingSoon:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },

    // الصور — روابط Cloudinary
    imageUrl:       { type: String, default: "" }, // صورة الكارد
    flavorImageUrl: { type: String, default: "" }, // صورة داخل اختيار النكهات

    // الأسعار الثابتة (للمميزة — مثل المتر وبيتزا 60×40)
    fixedPriceOld:     { type: String, default: "" },   // "150,000"
    fixedPriceNew:     { type: String, default: "" },   // "1,500"
    fixedNumericPrice: { type: Number, default: 0 },    // 150000

    // الأحجام (للقائمة العادية)
    sizes:       { type: [SizeSchema], default: [] },

    // خاص ببيتزا المتر وبيتزا 60×40 (builder)
    sliceCount:  { type: Number, default: 0 },
    cols:        { type: Number, default: 0 },

    // خاص ببيتزا خانم فقط
    khanamSizes: { type: [SizeSchema], default: [] },

    // الترتيب في الواجهة
    sortOrder:   { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "pizzas",
  }
);

export default mongoose.models.Pizza || mongoose.model("Pizza", PizzaSchema);
