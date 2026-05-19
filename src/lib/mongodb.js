// src/lib/mongodb.js
// Connection is cached across hot-reloads in dev and across invocations in
// Vercel serverless functions (the module is kept in memory between warm calls).

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("أضف MONGODB_URI في متغيرات البيئة");
}

// Cache on globalThis so HMR in dev doesn't re-connect on every reload
const cached = globalThis.__mongooseCache || (globalThis.__mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
