// Shared transformation utilities for API endpoints
export function parseNum(v) {
  return Number(String(v || 0).replace(/[,،]/g, "")) || 0;
}

export function toFrontend(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    id: String(o._id),
    label: o.name,
    type: o.category,
    menuSection: o.menuSection || "",
    details: o.details || "",
    desc: o.desc || "",
    comingSoon: o.comingSoon || false,
    isActive: o.isActive !== false,
    sortOrder: o.sortOrder || 0,
    imageUrl: o.imageUrl || "",
    flavorImageUrl: o.flavorImageUrl || "",
    priceOld: o.fixedPriceOld || "",
    priceNew: o.fixedPriceNew || "",
    numericPrice: o.fixedNumericPrice || 0,
    sizes: o.khanamSizes?.length ? o.khanamSizes : (o.sizes || []),
    extras: o.extras || [],
    sliceCount: o.sliceCount || 0,
    cols: o.cols || 0,
    sections: o.sections || [],
  };
}

export function toBackend(body) {
  return {
    name: body.label || body.name || "جديد",
    category: body.type || body.category || "menu",
    menuSection: body.menuSection || "",
    details: body.details || "",
    desc: body.desc || "",
    comingSoon: body.comingSoon ?? false,
    isActive: body.isActive ?? true,
    imageUrl: body.imageUrl || "",
    flavorImageUrl: body.flavorImageUrl || "",
    fixedPriceOld: body.priceOld || "",
    fixedPriceNew: body.priceNew || "",
    fixedNumericPrice: parseNum(body.numericPrice),
    sizes: body.sizes || [],
    khanamSizes: body.khanamSizes || [],
    extras: body.extras || [],
    sliceCount: body.sliceCount || 0,
    cols: body.cols || 0,
    sections: body.sections || [],
    sortOrder: body.sortOrder || 0,
  };
}

export function toBackendPartial(body) {
  const r = {};
  if (body.label !== undefined) r.name = body.label || body.name;
  if (body.name !== undefined) r.name = body.name;
  if (body.type !== undefined) r.category = body.type;
  if (body.category !== undefined) r.category = body.category;
  if (body.menuSection !== undefined) r.menuSection = body.menuSection;
  if (body.details !== undefined) r.details = body.details;
  if (body.desc !== undefined) r.desc = body.desc;
  if (body.comingSoon !== undefined) r.comingSoon = body.comingSoon;
  if (body.isActive !== undefined) r.isActive = body.isActive;
  if (body.imageUrl !== undefined) r.imageUrl = body.imageUrl;
  if (body.flavorImageUrl !== undefined) r.flavorImageUrl = body.flavorImageUrl;
  if (body.priceOld !== undefined) r.fixedPriceOld = body.priceOld;
  if (body.priceNew !== undefined) r.fixedPriceNew = body.priceNew;
  if (body.numericPrice !== undefined) r.fixedNumericPrice = parseNum(body.numericPrice);
  if (body.sizes !== undefined) r.sizes = body.sizes;
  if (body.khanamSizes !== undefined) r.khanamSizes = body.khanamSizes;
  if (body.extras !== undefined) r.extras = body.extras;
  if (body.sliceCount !== undefined) r.sliceCount = body.sliceCount;
  if (body.cols !== undefined) r.cols = body.cols;
  if (body.sections !== undefined) r.sections = body.sections;
  if (body.sortOrder !== undefined) r.sortOrder = body.sortOrder;
  return r;
}
