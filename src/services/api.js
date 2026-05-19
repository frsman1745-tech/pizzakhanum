// src/services/api.js
// Typed API client. All fetch calls live here — no raw fetch() in components.
// Admin functions automatically inject the JWT from the Zustand store.

import useUiStore from "../store/uiStore.js";

/** Generic fetch wrapper with error handling. */
async function apiFetch(url, options = {}) {
  const token = useUiStore.getState().adminToken;
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Verify admin password and return JWT. */
export async function loginAdmin(password) {
  const json = await apiFetch("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
  return json.token; // string
}

// ── Pizza (menu items) ────────────────────────────────────────────────────────

export const fetchMenu = () =>
  apiFetch("/api/pizzas").then((j) => j.data || []);

export const fetchMenuAdmin = () =>
  apiFetch("/api/pizzas", {
    headers: { Authorization: `Bearer ${useUiStore.getState().adminToken}` },
  }).then((j) => j.data || []);

export const createPizza = (payload) =>
  apiFetch("/api/pizzas", { method: "POST", body: JSON.stringify(payload) }).then((j) => j.data);

export const updatePizza = (id, payload) =>
  apiFetch(`/api/pizzas/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((j) => j.data);

export const patchPizza = (id, patch) =>
  apiFetch(`/api/pizzas/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((j) => j.data);

export const deletePizza = (id) =>
  apiFetch(`/api/pizzas/${id}`, { method: "DELETE" });

// ── Featured ──────────────────────────────────────────────────────────────────

export const fetchFeatured = () =>
  apiFetch("/api/featured").then((j) => j.data || []);

export const createFeatured = (payload) =>
  apiFetch("/api/featured", { method: "POST", body: JSON.stringify(payload) }).then((j) => j.data);

export const updateFeatured = (id, payload) =>
  apiFetch(`/api/featured/${id}`, { method: "PUT", body: JSON.stringify(payload) }).then((j) => j.data);

export const patchFeatured = (id, patch) =>
  apiFetch(`/api/featured/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then((j) => j.data);

export const deleteFeatured = (id) =>
  apiFetch(`/api/featured/${id}`, { method: "DELETE" });

// ── Sections ──────────────────────────────────────────────────────────────────

export const fetchSections = () =>
  apiFetch("/api/sections").then((j) => j.data || []);

export const saveSections = (sections) =>
  apiFetch("/api/sections", { method: "PUT", body: JSON.stringify({ sections }) }).then((j) => j.data);
