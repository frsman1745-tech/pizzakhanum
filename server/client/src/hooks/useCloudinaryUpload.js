// src/hooks/useCloudinaryUpload.js
// Handles image uploads directly from the browser to Cloudinary
// via an unsigned upload preset (no API secret exposed).

import { useState } from "react";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * @returns {{ uploading, uploadImage }}
 *   uploading  – boolean indicating upload in progress
 *   uploadImage – async fn: (File) => Promise<string | null>  (returns secure URL)
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file) => {
    if (!file) return null;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error(
        "Missing Cloudinary env vars: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET"
      );
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "pizza-khanum");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Cloudinary upload failed.");
      }

      const data = await response.json();
      return data.secure_url;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, uploadImage };
}
