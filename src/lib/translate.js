// AI translation service with localStorage cache
// Uses MyMemory API (free, no key needed for limited use)

const CACHE_PREFIX = "pz_tr_";

function getCached(key) {
  try { return localStorage.getItem(CACHE_PREFIX + key); }
  catch { return null; }
}

function setCache(key, val) {
  try { localStorage.setItem(CACHE_PREFIX + key, val); }
  catch { /* quota */ }
}

function hasArabic(str) {
  return /[\u0600-\u06FF]/.test(str);
}

async function translateText(text, from = "ar", to = "en") {
  if (!text || typeof text !== "string" || !text.trim() || !hasArabic(text)) return text;
  const cacheKey = `${from}_${to}_${text.substring(0, 100)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=${from}|${to}`
    );
    const data = await res.json();
    const result = data?.responseData?.translatedText || text;
    if (result !== text && result.length > 0) setCache(cacheKey, result);
    return result;
  } catch {
    return text;
  }
}

function walkAndTranslate(obj, from, to) {
  if (!obj || typeof obj !== "object") return obj;
  const translated = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && hasArabic(val)) {
      // Don't translate now — return original, will be translated in batch
      translated[key] = val;
    } else if (typeof val === "object" && val !== null) {
      translated[key] = walkAndTranslate(val, from, to);
    } else {
      translated[key] = val;
    }
  }
  return translated;
}

function collectArabicTexts(obj, texts = []) {
  if (!obj || typeof obj !== "object") return texts;
  for (const val of Object.values(obj)) {
    if (typeof val === "string" && hasArabic(val)) {
      texts.push(val);
    } else if (typeof val === "object" && val !== null) {
      collectArabicTexts(val, texts);
    }
  }
  return texts;
}

function rebuildWithTranslations(obj, translationMap) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => rebuildWithTranslations(item, translationMap));

  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "string" && translationMap.has(val)) {
      result[key] = translationMap.get(val);
    } else if (typeof val === "object" && val !== null) {
      result[key] = rebuildWithTranslations(val, translationMap);
    } else {
      result[key] = val;
    }
  }
  return result;
}

// Translate all Arabic text in an array/object of items
export async function translateItems(items, from = "ar", to = "en") {
  if (!items || !items.length) return items;
  if (to === "ar") return items;

  const allTexts = collectArabicTexts(items);
  if (!allTexts.length) return items;

  // Filter out non-unique and already-cached texts
  const unique = [...new Set(allTexts)];
  const uncached = unique.filter(t => {
    const k = `${from}_${to}_${t.substring(0, 100)}`;
    return !getCached(k);
  });

  // Translate in parallel batches of 5
  const map = new Map();
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    const results = await Promise.all(batch.map(t => translateText(t, from, to)));
    batch.forEach((t, idx) => map.set(t, results[idx]));
  }

  return rebuildWithTranslations(items, map);
}

// Full data translation
export async function translateFullData(data, lang) {
  if (lang === "ar" || !data) return data;
  const [menu, featured, sections] = await Promise.all([
    translateItems(data.menu),
    translateItems(data.featured),
    translateItems(data.sections),
  ]);
  return { menu, featured, sections };
}
