// src/hooks/usePizzas.js
// TanStack Query hooks for all data fetching.
// Replaces the manual useEffect + fetch + setTick pattern.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../services/api.js";

// ── Query Keys ─────────────────────────────────────────────────────────────
export const KEYS = {
  menu:     ["menu"],
  featured: ["featured"],
  sections: ["sections"],
};

// ── Read Hooks ──────────────────────────────────────────────────────────────

export function useMenu() {
  return useQuery({
    queryKey: KEYS.menu,
    queryFn:  api.fetchMenu,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFeatured() {
  return useQuery({
    queryKey: KEYS.featured,
    queryFn:  api.fetchFeatured,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSections() {
  return useQuery({
    queryKey: KEYS.sections,
    queryFn:  api.fetchSections,
    staleTime: 10 * 60 * 1000,
  });
}

// ── Admin Mutation Hooks (with Optimistic UI) ───────────────────────────────

/**
 * Toggle comingSoon status with OPTIMISTIC update.
 * The UI flips instantly; the network call runs in background.
 * On error, the previous state is restored automatically.
 */
export function useToggleComingSoon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comingSoon }) => api.patchPizza(id, { comingSoon }),

    onMutate: async ({ id, comingSoon }) => {
      await qc.cancelQueries({ queryKey: KEYS.menu });
      const previous = qc.getQueryData(KEYS.menu);
      qc.setQueryData(KEYS.menu, (old = []) =>
        old.map((p) => (p.id === id ? { ...p, comingSoon } : p))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEYS.menu, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.menu }),
  });
}

/**
 * Reorder menu items with OPTIMISTIC update.
 * Drag-and-drop in the admin panel feels instantaneous.
 */
export function useReorderMenu() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedItems) =>
      Promise.all(
        orderedItems.map((item, idx) => api.patchPizza(item.id, { sortOrder: idx }))
      ),

    onMutate: async (orderedItems) => {
      await qc.cancelQueries({ queryKey: KEYS.menu });
      const previous = qc.getQueryData(KEYS.menu);
      qc.setQueryData(KEYS.menu, orderedItems);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEYS.menu, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.menu }),
  });
}

export function useReorderFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedItems) =>
      Promise.all(
        orderedItems.map((item, idx) => api.patchFeatured(item.id, { sortOrder: idx }))
      ),
    onMutate: async (orderedItems) => {
      await qc.cancelQueries({ queryKey: KEYS.featured });
      const previous = qc.getQueryData(KEYS.featured);
      qc.setQueryData(KEYS.featured, orderedItems);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEYS.featured, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.featured }),
  });
}

/** Create / update / delete pizza — simple mutations that invalidate on settle. */
export function usePizzaMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEYS.menu });

  const create = useMutation({ mutationFn: api.createPizza, onSettled: invalidate });
  const update = useMutation({ mutationFn: ({ id, ...payload }) => api.updatePizza(id, payload), onSettled: invalidate });
  const remove = useMutation({ mutationFn: api.deletePizza, onSettled: invalidate });

  return { create, update, remove };
}

export function useFeaturedMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEYS.featured });

  const create = useMutation({ mutationFn: api.createFeatured, onSettled: invalidate });
  const update = useMutation({ mutationFn: ({ id, ...payload }) => api.updateFeatured(id, payload), onSettled: invalidate });
  const remove = useMutation({ mutationFn: api.deleteFeatured, onSettled: invalidate });

  return { create, update, remove };
}

export function useSectionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.saveSections,
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.sections }),
  });
}
