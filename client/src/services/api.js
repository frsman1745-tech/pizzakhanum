// src/services/api.js
// Centralised API layer – import ONLY this file in components.
// Keeping API calls here prevents circular dependencies in the build graph.

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ── Pizzas ────────────────────────────────────────────────────────────────────

export const fetchPizzas = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/pizzas${qs ? `?${qs}` : ""}`);
};

export const fetchPizzaById = (id) => request(`/pizzas/${id}`);

export const createPizza = (body) =>
  request("/pizzas", { method: "POST", body: JSON.stringify(body) });

export const updatePizza = (id, body) =>
  request(`/pizzas/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deletePizza = (id) =>
  request(`/pizzas/${id}`, { method: "DELETE" });
