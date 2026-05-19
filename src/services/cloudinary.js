// src/services/cloudinary.js
// Cloudinary upload with automatic image optimizations.
// Previously in Admin.jsx with no transformation parameters.

/**
 * Upload a file to Cloudinary and return the optimized URL.
 *
 * Transformations applied at upload time via eager transforms:
 *  - f_auto  → serve WebP/AVIF to modern browsers automatically
 *  - q_auto  → Cloudinary selects the best quality level per image
 *  - c_limit,w_1200 → never serve images wider than 1200px
 *
 * @param {File} file
 * @param {"card"|"flavor"} type - Used as subfolder in Cloudinary
 * @returns {Promise<string>} Optimized image URL
 */
export async function uploadToCloudinary(file, type = "card") {
  const cloud  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloud || !preset) {
    throw new Error(
      "أضف VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET في .env"
    );
  }

  const fd = new FormData();
  fd.append("file",           file);
  fd.append("upload_preset",  preset);
  fd.append("folder",         `pizza-khanum/${type}`);

  // Eager transformations: auto-format + auto-quality + width cap
  fd.append("eager", "f_auto,q_auto,c_limit,w_1200");
  fd.append("eager_async", "false"); // wait for transforms to complete

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`,
    { method: "POST", body: fd }
  );

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `Cloudinary ${res.status}`);
  }

  const data = await res.json();

  // Prefer the eager (pre-transformed) URL if available
  const eagerUrl = data.eager?.[0]?.secure_url;
  if (eagerUrl) return eagerUrl;

  // Fallback: manually add f_auto,q_auto to the base URL via URL transformation
  // e.g. https://res.cloudinary.com/cloud/image/upload/v123/file.jpg
  //   → https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto,w_1200/v123/file.jpg
  const base = data.secure_url;
  return base.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_1200/");
}

/**
 * Validate a file before uploading.
 * @param {File} file
 * @throws {Error} if invalid
 */
export function validateImageFile(file) {
  if (!file) throw new Error("لم يتم اختيار ملف");
  if (!file.type.startsWith("image/")) throw new Error("⚠ اختر ملف صورة");
  if (file.size > 5 * 1024 * 1024)    throw new Error("⚠ الصورة أكبر من 5 MB");
}
