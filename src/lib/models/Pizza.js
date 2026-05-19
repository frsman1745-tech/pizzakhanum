// src/lib/models/Pizza.js
// Menu items ONLY. No longer a God-object that also stores
// featured items and section documents.

import mongoose from "mongoose";

const ExtraOptionSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },
    label:        { type: String, required: true, trim: true },
    priceOld:     { type: String, default: "0" },
    priceNew:     { type: String, default: "0" },
    numericPrice: { type: Number, default: 0 },
    sortOrder:    { type: Number, default: 0 },
  },
  { _id: false }
);

const ExtraGroupSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    name:      { type: String, required: true, trim: true },
    type:      { type: String, enum: ["single", "multi"], default: "single" },
    required:  { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    options:   { type: [ExtraOptionSchema], default: [] },
  },
  { _id: false }
);

const SizeSchema = new mongoose.Schema(
  {
    id:           { type: String, required: true },
    label:        { type: String, required: true },
    priceOld:     { type: String, default: "" },
    priceNew:     { type: String, default: "" },
    numericPrice: { type: Number, default: 0 },
    sortOrder:    { type: Number, default: 0 },
  },
  { _id: false }
);

const PizzaSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    details:       { type: String, default: "" },
    menuSection:   { type: String, default: "" },   // references MenuSection.sectionId
    comingSoon:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    imageUrl:      { type: String, default: "" },
    flavorImageUrl:{ type: String, default: "" },
    sizes:         { type: [SizeSchema], default: [] },
    extras:        { type: [ExtraGroupSchema], default: [] },
    sortOrder:     { type: Number, default: 0 },
  },
  { timestamps: true, collection: "pizzas" }
);

// Index for fast sorted queries
PizzaSchema.index({ sortOrder: 1, createdAt: -1 });
PizzaSchema.index({ menuSection: 1 });

export default mongoose.models.Pizza || mongoose.model("Pizza", PizzaSchema);
