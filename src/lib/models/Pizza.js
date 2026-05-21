// src/lib/models/Pizza.js
import mongoose from "mongoose";

/* ── خيار واحد في مجموعة الإضافات ─────────────────────────────────────────── */
const ExtraOptionSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },
    label:        { type: String, required: true, trim: true },
    priceOld:     { type: String, default: "0" },
    priceNew:     { type: String, default: "0" },
    numericPrice: { type: Number, default: 0   },
    sortOrder:    { type: Number, default: 0   },
  },
  { _id: false }
);

/* ── مجموعة إضافات (عجينة / إضافات / ...) ──────────────────────────────────── */
const ExtraGroupSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    name:      { type: String, required: true, trim: true },
    type:      { type: String, enum: ["single","multi"], default: "single" },
    required:  { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    options:   { type: [ExtraOptionSchema], default: [] },
  },
  { _id: false }
);

/* ── حجم واحد ────────────────────────────────────────────────────────────────── */
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

/* ── قسم القائمة (بيتزا / مشروبات / ...) ───────────────────────────────────── */
const MenuSectionSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    label:     { type: String, required: true, trim: true },
    emoji:     { type: String, default: "🍕" },
    sortOrder: { type: Number, default: 0    },
  },
  { _id: false }
);

/* ══ الموديل الرئيسي ════════════════════════════════════════════════════════ */
const PizzaSchema = new mongoose.Schema(
  {
    // ── معلومات أساسية ──────────────────────────────────────────────────────
    name:     { type: String, required: true, trim: true },

    // category: "menu" أو "featured" أو "section"
    // section = سطر يخزّن أقسام القائمة (بيتزا، مشروبات...)
    category: { type: String, enum: ["menu","featured","section"], default: "menu" },

    // قسم القائمة الذي تنتمي له هذه البيتزا (id من وثيقة section)
    menuSection: { type: String, default: "" },

    details:  { type: String, default: "" },
    desc:     { type: String, default: "" },

    comingSoon: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true  },

    // ── الصور ────────────────────────────────────────────────────────────────
    imageUrl:       { type: String, default: "" },
    flavorImageUrl: { type: String, default: "" },

    // ── أسعار ثابتة (للمميزة) ───────────────────────────────────────────────
    fixedPriceOld:     { type: String, default: ""  },
    fixedPriceNew:     { type: String, default: ""  },
    fixedNumericPrice: { type: Number, default: 0   },

    // ── الأحجام (للقائمة) ────────────────────────────────────────────────────
    sizes: { type: [SizeSchema], default: [] },

    // ── الإضافات (عجينة، جبن إضافي...) ──────────────────────────────────────
    extras: { type: [ExtraGroupSchema], default: [] },

    // ── Builder: المتر / 60×40 ────────────────────────────────────────────────
    sliceCount: { type: Number, default: 0 },
    cols:       { type: Number, default: 0 },

    // ── خانم ─────────────────────────────────────────────────────────────────
    khanamSizes: { type: [SizeSchema], default: [] },

    // ── أقسام القائمة (category=section فقط) ─────────────────────────────────
    sections: { type: [MenuSectionSchema], default: [] },

    // ── الترتيب ──────────────────────────────────────────────────────────────
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "pizzas" }
);

export default mongoose.models.Pizza || mongoose.model("Pizza", PizzaSchema);
