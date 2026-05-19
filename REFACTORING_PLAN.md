# Pizza Khanum — Complete Refactoring Plan & Implementation
> Senior Full-Stack Architect Audit · May 2026

---

## 🔍 Audit Summary: What's Wrong

| Issue | Severity | Location |
|---|---|---|
| Monolithic `App.jsx` (~600 lines) — screens, logic, CSS, helpers all mixed | 🔴 Critical | `src/App.jsx` |
| Monolithic `Admin.jsx` (~800 lines) — same problem | 🔴 Critical | `src/Admin.jsx` |
| CSS-in-JS string injected as `<style>` tag — no reuse, no tree-shaking | 🔴 Critical | Both files |
| **Frontend password check** — `ADMIN_PWD` compared in browser JS | 🔴 Critical | `Admin.jsx:8` |
| Admin auth persisted in `localStorage` with no token expiry | 🔴 Critical | `Admin.jsx` |
| `toFrontend()` / `toBackend()` **duplicated** in both API files | 🟠 High | `api/pizzas.js`, `api/pizzas/[id].js` |
| No server-side input validation (no Zod) | 🟠 High | All API routes |
| God-object `Pizza` model — stores menu items, featured, AND sections | 🟠 High | `src/lib/models/Pizza.js` |
| No global state management — prop-drilling & screen-state in one giant component | 🟠 High | `App.jsx` |
| No data-fetching library — manual `fetch`, no caching, no optimistic updates | 🟠 High | Both files |
| Cloudinary upload runs with no image transformations | 🟡 Medium | `Admin.jsx` |
| Site settings stored in `localStorage` — lost on new devices | 🟡 Medium | Both files |
| `CORS: *` on all API routes — overly permissive | 🟡 Medium | Both API files |
| `setTick(t=>t+1)` pattern — forces full re-fetch for every minor mutation | 🟡 Medium | `Admin.jsx` |
| No RTL CSS variables — inline `dir="rtl"` scattered everywhere | 🟡 Medium | Both files |
| Components defined inside render functions (`Header`, `FlavorGrid` inside `App`) | 🟡 Medium | `App.jsx` |

---

## 🏗 New Architecture

```
src/
├── components/           ← Atomic, reusable UI pieces
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Spinner.jsx
│   │   └── Toast.jsx
│   ├── pizza/
│   │   ├── PizzaImg.jsx
│   │   ├── FeaturedSlider.jsx
│   │   ├── ExtrasSelector.jsx
│   │   └── FlavorGrid.jsx
│   ├── maps/
│   │   ├── BranchMap.jsx
│   │   └── DeliveryMap.jsx
│   └── admin/
│       ├── ItemRow.jsx
│       ├── EditModal.jsx
│       ├── SectionsModal.jsx
│       └── ImgUploader.jsx
│
├── features/             ← Screen-level feature modules
│   ├── menu/
│   │   ├── LandingScreen.jsx
│   │   ├── MenuScreen.jsx
│   │   ├── BuilderScreen.jsx
│   │   ├── KhanamScreen.jsx
│   │   ├── PizzaDetailScreen.jsx
│   │   └── SummaryScreen.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── MenuTab.jsx
│       ├── FeaturedTab.jsx
│       ├── HistoryTab.jsx
│       └── SettingsTab.jsx
│
├── hooks/                ← Custom hooks (TanStack Query wrappers)
│   ├── usePizzas.js
│   ├── useFeatured.js
│   ├── useSections.js
│   ├── useAdminMutations.js
│   └── useToast.js
│
├── services/             ← All external I/O
│   ├── api.js            ← Typed API client (fetch wrapper)
│   └── cloudinary.js     ← Upload with auto-format/quality
│
├── store/                ← Zustand global state
│   ├── cartStore.js
│   └── uiStore.js
│
├── lib/
│   ├── mongodb.js
│   ├── models/
│   │   ├── Pizza.js       ← menu items only
│   │   ├── Featured.js    ← featured items only
│   │   └── MenuSection.js ← sections collection
│   └── validators/
│       ├── pizza.schema.js
│       └── auth.schema.js
│
├── styles/
│   ├── globals.css        ← CSS variables, resets, animations
│   └── rtl.css            ← RTL-specific utilities
│
├── constants/
│   └── defaults.js        ← DEFAULT_FEATURED, DEFAULT_MENU, BRANCH, etc.
│
├── App.jsx                ← Thin router only
├── Admin.jsx              ← Thin auth gate + dashboard mount
└── main.jsx

api/
├── auth/
│   └── verify.js          ← JWT verification (replaces frontend password)
├── pizzas/
│   ├── index.js           ← GET + POST with Zod validation
│   └── [id].js            ← GET/PUT/PATCH/DELETE with Zod
├── featured/
│   ├── index.js
│   └── [id].js
└── sections/
    ├── index.js
    └── [id].js
```

---

## 📋 Step-by-Step Refactoring Plan

### Phase 1 — Foundation (do this first, it unblocks everything)

**Step 1.1 — Install new dependencies**
```bash
npm install zustand @tanstack/react-query jose zod
npm install -D @tanstack/react-query-devtools
```

**Step 1.2 — Create CSS foundation** (`src/styles/globals.css`)
- Move all CSS strings out of JSX into a real stylesheet
- Define CSS custom properties for the gold palette, dark backgrounds, RTL layout
- All animations as named `@keyframes`

**Step 1.3 — Create Zustand stores**
- `cartStore.js` — cart items, add/remove/updateQty
- `uiStore.js` — current screen, builderPizza, detailPizza, khanamSize

**Step 1.4 — Create constants file**
- Move `DEFAULT_FEATURED`, `DEFAULT_MENU`, `DEFAULT_SIZES`, `DEFAULT_SECTIONS`, `BRANCH`, `FLOATERS` out of App.jsx

---

### Phase 2 — Backend Hardening

**Step 2.1 — Split the God model**
The current `Pizza` model handles 3 different document types using `category` field discrimination. 
Replace with 3 dedicated collections:
- `Pizza` model → `pizzas` collection (menu items)
- `Featured` model → `featured` collection  
- `MenuSection` model → `menu_sections` collection

**Step 2.2 — Add Zod validation schemas**
Every API route validates its input before touching the database.

**Step 2.3 — Replace frontend auth with JWT**
- New `api/auth/verify.js` — accepts password, returns signed JWT (30-day expiry)
- Admin panel sends JWT in `Authorization: Bearer <token>` header
- All mutating API routes (`POST`/`PUT`/`PATCH`/`DELETE`) verify the JWT server-side
- Password is stored ONLY in `process.env.ADMIN_PASSWORD` — never exposed to the browser

**Step 2.4 — Remove CORS wildcard**
Replace `Access-Control-Allow-Origin: *` with environment-specific origin.

---

### Phase 3 — Services & Hooks

**Step 3.1 — API service layer** (`src/services/api.js`)
- Typed wrapper functions: `fetchMenu()`, `fetchFeatured()`, `createPizza()`, etc.
- Reads JWT from Zustand store and injects `Authorization` header automatically

**Step 3.2 — Cloudinary service** (`src/services/cloudinary.js`)
- Upload function applies Cloudinary transformation parameters:
  - `f_auto` — automatic format (WebP/AVIF for modern browsers)
  - `q_auto` — automatic quality compression
  - `c_limit,w_1200` — max width cap

**Step 3.3 — TanStack Query hooks**
- `usePizzas()` — `useQuery` for menu items with 5-min stale time
- `useFeatured()` — same for featured
- `useSections()` — same for sections
- `useAdminMutations()` — `useMutation` hooks with **optimistic updates** for toggleCS and reorder

---

### Phase 4 — Component Decomposition

**Step 4.1 — Extract atomic UI components**
These are completely screen-agnostic and reusable:
- `Button` — gold gradient / ghost / danger variants
- `Modal` — bottom-sheet on mobile, centered on desktop
- `Spinner` — loading indicator
- `Toast` — notification with auto-dismiss

**Step 4.2 — Extract pizza components**
- `PizzaImg` — image with fallback placeholder
- `FeaturedSlider` — carousel with dots and auto-play
- `ExtrasSelector` — radio/checkbox groups for extras
- `FlavorGrid` — 2-column flavor picker grid

**Step 4.3 — Extract map components**
- `BranchMap` — read-only Leaflet map for pickup
- `DeliveryMap` — interactive Leaflet map with search

**Step 4.4 — Extract admin components**
- `ItemRow` — single draggable row in admin list
- `EditModal` — full item edit form
- `SectionsModal` — section management
- `ImgUploader` — image upload zone with preview

---

### Phase 5 — Feature Screens

Each screen gets its own file. They read from Zustand stores and call TanStack Query hooks.

**Step 5.1 — Customer screens** (all under `src/features/menu/`)
- `LandingScreen` — hero with floating emoji
- `MenuScreen` — tabs + featured slider + pizza grid
- `BuilderScreen` — slice grid + flavor picker
- `KhanamScreen` — size picker + flavor picker
- `PizzaDetailScreen` — pizza image + size + extras
- `SummaryScreen` — cart + delivery selection + checkout

**Step 5.2 — Admin features** (under `src/features/admin/`)
- `AdminDashboard` — stats + tabbed layout
- `MenuTab` — drag-and-drop list with optimistic reorder
- `FeaturedTab` — same for featured
- `HistoryTab` — action log
- `SettingsTab` — site settings (persisted to DB not localStorage)

---

### Phase 6 — Optimistic UI

The current admin uses `setTick(t=>t+1)` after every mutation, forcing a full network re-fetch. Replace with TanStack Query's optimistic update pattern:

```js
// Before (pessimistic):
await fetch(`/api/pizzas/${id}`, { method: 'PATCH', body: ... });
setTick(t => t + 1); // re-fetches everything

// After (optimistic):
mutate(
  { id, comingSoon: !item.comingSoon },
  {
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['menu'] });
      const prev = queryClient.getQueryData(['menu']);
      queryClient.setQueryData(['menu'], old =>
        old.map(p => p.id === vars.id ? { ...p, comingSoon: vars.comingSoon } : p)
      );
      return { prev };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(['menu'], ctx.prev); // rollback
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['menu'] }),
  }
);
```

The UI updates **instantly** — the network call happens in the background. If it fails, the state rolls back.

---

## 📁 Complete File Implementation

The following pages contain every file in the refactored project.

