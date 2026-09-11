// AI translation service with localStorage cache
// Primary: Google Translate (free, no key, high quality)
// Fallback: MyMemory API
// Deadlines + batch to keep it fast & reliable

const CACHE_PREFIX = "pz_tr_";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { v, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return v;
  } catch { return null; }
}

function setCache(key, val) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: val, ts: Date.now() })); }
  catch { /* quota */ }
}

function hasArabic(str) {
  return /[\u0600-\u06FF]/.test(str);
}

// djb2 hash → stable short cache key (fixes the "first 100 chars" collision bug)
function hashKey(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

// Google Translate (unofficial public endpoint — enables CORS, no key, very high quality)
async function googleTranslate(text, to) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  const out = data[0].map(seg => seg?.[0] || "").join("");
  if (!out || !out.trim() || out.trim() === text.trim()) return null;
  return out.trim();
}

// MyMemory fallback
async function myMemoryTranslate(text, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 400))}&langpair=ar|${to}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const out = data?.responseData?.translatedText || "";
  if (!out.trim() || out.trim() === text.trim()) return null;
  return out.trim();
}

async function translateText(text, to = "en") {
  if (!text || typeof text !== "string" || !text.trim() || !hasArabic(text)) return text;
  const cacheKey = `${to}_${hashKey(text)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const providers = [googleTranslate, myMemoryTranslate];
  let lastErr = null;
  for (const provider of providers) {
    try {
      const result = await provider(text, to);
      if (result) { setCache(cacheKey, result); return result; }
    } catch (e) { lastErr = e; }
  }
  if (lastErr) console.error("[translate]", lastErr);
  return text;
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
export async function translateItems(items, to = "en") {
  if (!items || !items.length) return items;
  if (to === "ar") return items;

  const allTexts = collectArabicTexts(items);
  if (!allTexts.length) return items;

  const unique = [...new Set(allTexts)];

  // Translate in parallel batches of 4 (Google is fast, stay gentle)
  const map = new Map();
  for (let i = 0; i < unique.length; i += 4) {
    const batch = unique.slice(i, i + 4);
    const results = await Promise.all(batch.map(t => translateText(t, to)));
    batch.forEach((t, idx) => map.set(t, results[idx]));
  }

  return rebuildWithTranslations(items, map);
}

// Full data translation
export async function translateFullData(data, lang) {
  if (lang === "ar" || !data) return data;
  const to = lang === "en" ? "en" : lang === "fr" ? "fr" : "en";
  const [menu, featured, sections] = await Promise.all([
    translateItems(data.menu, to),
    translateItems(data.featured, to),
    translateItems(data.sections, to),
  ]);
  return { menu, featured, sections };
}