// src/store/cartStore.js
// Zustand store for cart state — replaces the scattered cart useState calls
// that were previously all in the monolithic App.jsx component.

import { create } from "zustand";

/**
 * @typedef {Object} CartItem
 * @property {string} uid          - Unique instance ID (Date.now + random)
 * @property {string} label        - Pizza name
 * @property {string} size         - Size label (e.g. "كبير")
 * @property {string} details      - Flavor/extras summary
 * @property {string} priceOld     - Display price in SYP
 * @property {string} priceNew     - Display price in SYL
 * @property {number} numericPrice - Raw number for calculations
 * @property {number} qty          - Quantity
 */

const useCartStore = create((set, get) => ({
  /** @type {CartItem[]} */
  items: [],

  /** Add a new item. qty always starts at 1. */
  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, qty: 1, uid: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      ],
    })),

  /** Increase or decrease qty. qty cannot go below 1. */
  updateQty: (uid, delta) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.uid === uid ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      ),
    })),

  /** Remove item by uid. */
  removeItem: (uid) =>
    set((state) => ({ items: state.items.filter((i) => i.uid !== uid) })),

  /** Empty the cart. */
  clearCart: () => set({ items: [] }),

  /** Computed: total price in SYP. */
  get total() {
    return get().items.reduce((sum, i) => sum + i.numericPrice * i.qty, 0);
  },
}));

export default useCartStore;
