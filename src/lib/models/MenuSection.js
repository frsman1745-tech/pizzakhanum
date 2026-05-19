// src/lib/models/MenuSection.js
// Menu section categories (بيتزا, مشروبات, ...).
// Previously crammed into a Pizza document with category="section".

import mongoose from "mongoose";

const SectionItemSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true },
    label:     { type: String, required: true, trim: true },
    emoji:     { type: String, default: "🍕" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

// Single-document collection: one document holds all sections in a sorted array.
// This avoids the previous hack of storing sections inside a Pizza document.
const MenuSectionSchema = new mongoose.Schema(
  {
    sections: { type: [SectionItemSchema], default: [] },
  },
  { timestamps: true, collection: "menu_sections" }
);

export default mongoose.models.MenuSection ||
  mongoose.model("MenuSection", MenuSectionSchema);
