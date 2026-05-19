// src/components/admin/ImgUploader.jsx
// Image upload zone with preview, hover overlay, and upload progress.
// Extracted from the ImgPair function that was defined inside Admin.jsx's render.

import { useRef } from "react";
import { uploadToCloudinary, validateImageFile } from "../../services/cloudinary.js";

/**
 * @param {{
 *   label: string,
 *   imageUrl: string | null,
 *   onUploaded: (url: string) => void,
 *   onRemove: () => void,
 *   uploading: boolean,
 *   setUploading: (v: boolean) => void,
 *   onError: (msg: string) => void,
 *   uploadType?: "card"|"flavor"
 * }} props
 */
export default function ImgUploader({
  label,
  imageUrl,
  onUploaded,
  onRemove,
  uploading,
  setUploading,
  onError,
  uploadType = "card",
}) {
  const inputRef = useRef(null);

  async function handleFile(file) {
    try {
      validateImageFile(file);
    } catch (e) {
      onError(e.message);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, uploadType);
      onUploaded(url);
    } catch (e) {
      onError("❌ " + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p style={{ fontSize: ".62rem", color: "#555", marginBottom: 3 }}>{label}</p>
      <div className="img-zone" onClick={() => !uploading && inputRef.current?.click()}>
        {imageUrl && <img src={imageUrl} alt="" />}

        {/* Hover overlay */}
        <div className="img-zone-overlay">
          <span style={{ fontSize: "1.2rem" }}>📷</span>
          <span style={{ fontSize: ".62rem", color: "#ccc", marginTop: 3 }}>تغيير</span>
        </div>

        {/* Empty placeholder */}
        {!imageUrl && !uploading && (
          <>
            <span style={{ fontSize: "1.5rem", opacity: .2 }}>🖼</span>
            <span style={{ fontSize: ".65rem", color: "#2a2a2a", marginTop: 4 }}>اضغط للرفع</span>
          </>
        )}

        {/* Upload progress overlay */}
        {uploading && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,.65)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 6, borderRadius: 11,
          }}>
            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            <span style={{ fontSize: ".66rem", color: "var(--gold)" }}>جاري الرفع...</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {imageUrl && (
        <button
          style={{ fontSize: ".6rem", color: "#6a2a2a", background: "none", border: "none", cursor: "pointer", marginTop: 3, fontFamily: "var(--font)" }}
          onClick={onRemove}
        >
          × حذف
        </button>
      )}
    </div>
  );
}
