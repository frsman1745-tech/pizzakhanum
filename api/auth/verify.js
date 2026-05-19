// api/auth/verify.js
// ─────────────────────────────────────────────────────────────────────────────
// SECURITY FIX: The previous implementation compared the admin password
// entirely on the frontend (Admin.jsx line 8: ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD).
// This exposed the password to any visitor who opened DevTools.
//
// This route runs SERVER-SIDE only. It:
//  1. Accepts a POST with { password }
//  2. Compares against process.env.ADMIN_PASSWORD (never sent to browser)
//  3. Returns a signed JWT (30-day expiry)
//  4. The Admin UI stores this JWT in Zustand (memory) — not localStorage
//  5. All mutating API routes call verifyAdminToken() before proceeding
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, jwtVerify } from "jose";
import { LoginSchema } from "../../src/lib/validators/pizza.schema.js";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-immediately"
);
const ALG = "HS256";

/** Sign a new admin token. */
export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

/**
 * Verify token from Authorization: Bearer <token> header.
 * Throws if invalid or expired.
 */
export async function verifyAdminToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("لم يتم تقديم توكن المصادقة");
  await jwtVerify(token, SECRET, { algorithms: [ALG] });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin",  process.env.APP_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  // Validate request body with Zod
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: "كلمة المرور مطلوبة" });
  }

  const { password } = parsed.data;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error("[auth] ADMIN_PASSWORD env var not set");
    return res.status(500).json({ success: false, error: "خطأ في إعداد الخادم" });
  }

  if (password !== expected) {
    // Deliberate constant-time-ish delay to slow brute-force
    await new Promise((r) => setTimeout(r, 300));
    return res.status(401).json({ success: false, error: "كلمة المرور غير صحيحة" });
  }

  try {
    const token = await signAdminToken();
    return res.status(200).json({ success: true, token });
  } catch (e) {
    return res.status(500).json({ success: false, error: "فشل إنشاء التوكن" });
  }
}
