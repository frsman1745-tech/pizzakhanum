// lib/models/Pizza.js
import mongoose from "mongoose";

/* ──────────────── SUB-SCHEMAS ──────────────── */

// حجم البيتزا (صغير / وسط / كبير)
const SizeSchema = new mongoose.Schema({
  id:           { type: String, required: true },          // "sm" | "md" | "lg"
  label:        { type: String, required: true },          // "صغير"
  priceOld:     { type: String, required: true },          // "35,000"  (بالليرة القديمة)
  priceNew:     { type: String, required: true },          // "350"     (بالليرة الجديدة)
  numericPrice: { type: Number, required: true },          // 35000     (للحساب)
}, { _id: false });

/* ──────────────── MAIN SCHEMA ──────────────── */

const PizzaSchema = new mongoose.Schema(
  {
    // ── معلومات أساسية ──────────────────────────
    name:        { type: String, required: true, trim: true },   // "مارغريتا"
    category:    {                                               // "menu" | "featured"
      type: String,
      enum: ["menu", "featured"],
      default: "menu",
    },
    description: { type: String, default: "" },                  // وصف مختصر
    details:     { type: String, default: "" },                  // المكونات التفصيلية

    // ── حالة العرض ──────────────────────────────
    isActive:    { type: Boolean, default: true },               // ظاهر / مخفي
    comingSoon:  { type: Boolean, default: false },              // قريباً

    // ── صورة ────────────────────────────────────
    imageUrl:    { type: String, default: "" },                  // رابط الصورة

    // ── الأسعار ─────────────────────────────────
    // للعروض المميزة (ثمن ثابت مثل المتر)
    fixedPriceOld:     { type: String, default: "" },            // "150,000"
    fixedPriceNew:     { type: String, default: "" },            // "1,500"
    fixedNumericPrice: { type: Number, default: 0 },             // 150000

    // للبيتزا العادية (أحجام متعددة)
    sizes: { type: [SizeSchema], default: [] },

    // ── خاص بالعروض المميزة ──────────────────────
    // بيتزا المتر و 60×40
    sliceCount: { type: Number, default: 0 },                    // عدد الشرائح
    cols:       { type: Number, default: 0 },                    // أعمدة الشبكة

    // بيتزا خانم
    khanamSizes: { type: [SizeSchema], default: [] },            // أحجام خاصة بخانم

    // ── الترتيب في الواجهة ───────────────────────
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,   // createdAt / updatedAt تلقائياً
    collection: "pizzas",
  }
);

// نمنع إعادة تعريف الموديل عند Hot Reload في development
export default mongoose.models.Pizza || mongoose.model("Pizza", PizzaSchema);
