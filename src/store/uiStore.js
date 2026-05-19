// src/store/uiStore.js
// Zustand store for all UI navigation state — replaces every screen-related
// useState in App.jsx, and manages admin JWT instead of a plain boolean.

import { create } from "zustand";

/**
 * Valid screen identifiers for the customer-facing app.
 * @typedef {"landing"|"menu"|"builder"|"khanum"|"pizza_detail"|"summary"} Screen
 */

const useUiStore = create((set) => ({
  // ── Customer Navigation ──────────────────────────────────────────────────
  /** @type {Screen} */
  screen: "landing",
  setScreen: (screen) => set({ screen }),

  /** The featured pizza currently being configured in Builder or Khanum screens. */
  builderPizza: null,
  setBuilderPizza: (pizza) => set({ builderPizza: pizza }),

  /** The menu pizza currently being viewed in PizzaDetail screen. */
  detailPizza: null,
  setDetailPizza: (pizza) => set({ detailPizza: pizza }),

  /** Selected size for Khanum pizza. */
  khanamSize: null,
  setKhanamSize: (size) => set({ khanamSize: size }),

  /** Go back to menu and clear builder/detail state. */
  goToMenu: () =>
    set({ screen: "menu", builderPizza: null, detailPizza: null, khanamSize: null }),

  // ── Admin Auth (JWT replaces plaintext boolean) ───────────────────────────
  /**
   * JWT token returned from /api/auth/verify.
   * Stored in Zustand (memory) only — never in localStorage.
   * On page refresh the admin must log in again (correct behavior).
   */
  adminToken: null,
  setAdminToken: (token) => set({ adminToken: token }),
  logout: () => set({ adminToken: null }),

  /** Convenience getter. */
  get isAdminAuthed() {
    return !!this.adminToken;
  },
}));

export default useUiStore;
