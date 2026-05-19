// src/lib/validators/pizza.schema.js
// Zod schemas used server-side in every API route for input validation.
// This is the single source of truth for what shape data must be in.

import { z } from "zod";

/* ── Sub-schemas ─────────────────────────────────────────────────────────── */

export const SizeSchema = z.object({
  id:           z.string().min(1),
  label:        z.string().min(1),
  priceOld:     z.string().default(""),
  priceNew:     z.string().default(""),
  numericPrice: z.number().nonnegative().default(0),
  sortOrder:    z.number().default(0),
});

export const ExtraOptionSchema = z.object({
  id:           z.string().min(1),
  label:        z.string().min(1),
  priceOld:     z.string().default("0"),
  priceNew:     z.string().default("0"),
  numericPrice: z.number().nonnegative().default(0),
  sortOrder:    z.number().default(0),
});

export const ExtraGroupSchema = z.object({
  id:        z.string().min(1),
  name:      z.string().min(1),
  type:      z.enum(["single", "multi"]).default("single"),
  required:  z.boolean().default(false),
  sortOrder: z.number().default(0),
  options:   z.array(ExtraOptionSchema).default([]),
});

export const MenuSectionRefSchema = z.object({
  id:        z.string().min(1),
  label:     z.string().min(1),
  emoji:     z.string().default("🍕"),
  sortOrder: z.number().default(0),
});

/* ── Pizza (menu item) ───────────────────────────────────────────────────── */

export const CreatePizzaSchema = z.object({
  label:         z.string().min(1, "اسم البيتزا مطلوب"),
  details:       z.string().default(""),
  comingSoon:    z.boolean().default(false),
  isActive:      z.boolean().default(true),
  imageUrl:      z.string().url().or(z.literal("")).default(""),
  flavorImageUrl:z.string().url().or(z.literal("")).default(""),
  menuSection:   z.string().default(""),
  sizes:         z.array(SizeSchema).default([]),
  extras:        z.array(ExtraGroupSchema).default([]),
  sortOrder:     z.number().default(0),
});

export const UpdatePizzaSchema = CreatePizzaSchema.partial();
export const PatchPizzaSchema  = z.object({
  comingSoon: z.boolean().optional(),
  sortOrder:  z.number().optional(),
  isActive:   z.boolean().optional(),
});

/* ── Featured item ───────────────────────────────────────────────────────── */

export const CreateFeaturedSchema = z.object({
  label:          z.string().min(1, "الاسم مطلوب"),
  desc:           z.string().default(""),
  imageUrl:       z.string().url().or(z.literal("")).default(""),
  flavorImageUrl: z.string().url().or(z.literal("")).default(""),
  priceOld:       z.string().default(""),
  priceNew:       z.string().default(""),
  numericPrice:   z.number().nonnegative().default(0),
  sizes:          z.array(SizeSchema).default([]),
  extras:         z.array(ExtraGroupSchema).default([]),
  sliceCount:     z.number().nonnegative().default(0),
  cols:           z.number().nonnegative().default(0),
  sortOrder:      z.number().default(0),
});

export const UpdateFeaturedSchema = CreateFeaturedSchema.partial();
export const PatchFeaturedSchema  = z.object({
  sortOrder: z.number().optional(),
});

/* ── Menu Section document ───────────────────────────────────────────────── */

export const SaveSectionsSchema = z.object({
  sections: z.array(MenuSectionRefSchema).min(0),
});

/* ── Auth ─────────────────────────────────────────────────────────────────── */

export const LoginSchema = z.object({
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});
