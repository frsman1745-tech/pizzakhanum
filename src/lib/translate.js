// AI-powered translation service with localStorage caching

const CACHE_PREFIX = "pizza_trans_";

function getCacheKey(text, from, to) {
  return CACHE_PREFIX + `${from}_${to}_${text}`;
}

function getCached(text, from, to) {
  try {
    return localStorage.getItem(getCacheKey(text, from, to));
  } catch {
    return null;
  }
}

function setCache(text, from, to, translated) {
  try {
    localStorage.setItem(getCacheKey(text, from, to), translated);
  } catch { /* quota exceeded */ }
}

function shouldTranslate(val) {
  if (!val || typeof val !== "string") return false;
  const t = val.trim();
  if (!t || t.length < 1) return false;
  // Check if it contains Arabic characters
  return /[\u0600-\u06FF]/.test(t);
}

async function translateSingle(text, from = "ar", to = "en") {
  if (!shouldTranslate(text)) return text;
  const cached = getCached(text, from, to);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );
    const data = await res.json();
    const result = data?.responseData?.translatedText || text;
    if (result !== text) setCache(text, from, to, result);
    return result;
  } catch {
    return text;
  }
}

export async function translateDeep(obj, from = "ar", to = "en") {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    const results = [];
    for (const item of obj) {
      results.push(await translateDeep(item, from, to));
    }
    return results;
  }

  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string" && shouldTranslate(val)) {
      result[key] = await translateSingle(val, from, to);
    } else if (typeof val === "object" && val !== null) {
      result[key] = await translateDeep(val, from, to);
    } else {
      result[key] = val;
    }
  }
  return result;
}

export async function translateAll(menuItems, featuredItems, sections) {
  const [translatedMenu, translatedFeatured, translatedSections] = await Promise.all([
    translateDeep(menuItems),
    translateDeep(featuredItems),
    translateDeep(sections),
  ]);
  return {
    menu: translatedMenu,
    featured: translatedFeatured,
    sections: translatedSections,
  };
}
