// src/lib/models/Featured.js
// Featured / hero items (المميزة) — separate collection from menu pizzas.

import mongoose from "mongoose";

const ExtraOptionSchema = new mongoose.Schema(
  { id: String, label: String, priceOld: { type: String, default: "0" }, priceNew: { type: String, default: "0" }, numericPrice: { type: Number, default: 0 }, sortOrder: { type: Number, default: 0 } },
  { _id: false }
);

const ExtraGroupSchema = new mongoose.Schema(
  { id: String, name: String, type: { type: String, enum: ["single", "multi"], default: "single" }, required: { type: Boolean, default: false }, sortOrder: { type: Number, default: 0 }, options: { type: [ExtraOptionSchema], default: [] } },
  { _id: false }
);

const SizeSchema = new mongoose.Schema(
  { id: String, label: String, priceOld: { type: String, default: "" }, priceNew: { type: String, default: "" }, numericPrice: { type: Number, default: 0 }, sortOrder: { type: Number, default: 0 } },
  { _id: false }
);

const FeaturedSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    desc:          { type: String, default: "" },
    imageUrl:      { type: String, default: "" },
    flavorImageUrl:{ type: String, default: "" },

    // Fixed-price featured items (e.g. "بيتزا المتر")
    fixedPriceOld:     { type: String, default: "" },
    fixedPriceNew:     { type: String, default: "" },
    fixedNumericPrice: { type: Number, default: 0 },

    // Builder (meter pizza): sliceCount > 0
    sliceCount:    { type: Number, default: 0 },
    cols:          { type: Number, default: 0 },

    // Khanum (size picker): sizes.length > 0 AND sliceCount === 0
    sizes:         { type: [SizeSchema], default: [] },

    extras:        { type: [ExtraGroupSchema], default: [] },
    sortOrder:     { type: Number, default: 0 },
  },
  { timestamps: true, collection: "featured" }
);

FeaturedSchema.index({ sortOrder: 1, createdAt: -1 });

export default mongoose.models.Featured || mongoose.model("Featured", FeaturedSchema);
