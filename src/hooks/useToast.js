// src/hooks/useToast.js
// Simple toast hook. Previously scattered setState calls in Admin.jsx.

import { useState, useCallback } from "react";

/**
 * @typedef {"ok"|"err"|"warn"} ToastType
 * @typedef {{ message: string, type: ToastType }} ToastState
 */

export function useToast(durationMs = 3200) {
  const [toast, setToast] = useState(/** @type {ToastState|null} */ (null));

  const showToast = useCallback(
    (message, type = "ok") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), durationMs);
    },
    [durationMs]
  );

  return { toast, showToast };
}
