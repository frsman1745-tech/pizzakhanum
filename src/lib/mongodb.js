// src/lib/mongodb.js
// يُستخدم فقط من الـ Serverless Functions في /api/
// يحافظ على الاتصال بين الطلبات لتحسين الأداء

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ يجب إضافة MONGODB_URI في متغيرات البيئة");
}

// تخزين الاتصال مؤقتاً في global لتجنب إعادة الاتصال في كل طلب
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
