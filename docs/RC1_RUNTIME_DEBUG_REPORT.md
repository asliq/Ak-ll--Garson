# RC1 Runtime Debug Report

**Date:** 2026-07-05 (live browser re-verification)  
**Stack:** API `http://localhost:3001` · Frontend `http://localhost:5173`  
**Method:** Playwright headless Chromium — console errors, network tab (4xx/5xx), main content area (not sidebar), 8–12s render wait, fresh dev server restart before final pass

---

## Verification table

| Page | Status | Root Cause | Fixed | Verified |
|------|--------|------------|-------|----------|
| **Dashboard** | ✅ Works | — | — | ✅ 2026-07-05 — `main .content` shows "Merhaba, Ahmet", revenue stats; `GET /orders` 200 |
| **Orders** | ✅ Works | `isLoading` true during background refetch; API timeout + 3× retry kept page on "Yükleniyor..." ~50s when API down | `isLoading && orders === undefined`; `retry: shouldRetryQuery`; axios timeout 8s | ✅ 2026-07-05 — main shows "Sipariş Yönetimi 6 sipariş", order cards render |
| **Kitchen** | ✅ Works | Same as Orders — uses `useKitchenOrders` → `ordersApi.getAll()` | `isLoading && kitchenOrders === undefined`; smart retry | ✅ 2026-07-05 — main shows "Mutfak Ekranı 4 aktif sipariş" |
| **Menu** | ✅ Works | `useMenuWithCategories` used `isLoading \|\| isLoading` — skeleton on every refetch; global 3× retry on N+1 menu fetches | `isLoading && data === undefined` per query; menu/category smart retry; global retry → 1 | ✅ 2026-07-05 — main shows categories + 13 items |
| **Customer Menu** | ✅ Works | Error guard after loading guard; retries on API failure | Error-before-loading; `retry: 1` in `usePublicMenu` | ✅ 2026-07-05 — "Mercimek Çorbası", `GET /public/menu/qr-masa-1` 200 |
| **Customer Orders** | ✅ Works | `tableId` missing from localStorage — orders query disabled | Resolve `tableId` via `usePublicMenu` when absent | ✅ 2026-07-05 — "Siparişlerim", active order visible |

**Additional fix (staff shell):** `AuthGuard` could stay on "Oturum kontrol ediliyor..." if Zustand persist never hydrated → 3s timeout fallback added. Verified staff pages load after fresh-browser login.

---

## How each page was verified

```
cd api && npm run seed:demo
npm run dev                    # fresh Vite on :5173
node scripts/verify-main-content.mjs   # checks main .content, not sidebar
node scripts/verify-pages-live.mjs     # console + network per route
```

### Per-page checks (all passed)

| Page | Console errors | Failed API calls | Main content signal |
|------|----------------|------------------|---------------------|
| Dashboard | 0 | 0 | "Merhaba, Ahmet", "Bugünkü Gelir" |
| Orders | 0 | 0 | "6 sipariş", filter buttons, order cards |
| Kitchen | 0 | 0 | "4 aktif sipariş", status columns |
| Menu | 0 | 0 | "Ürün Ekle", 13 items across categories |
| Customer Menu | 0 | 0 | "Masa 1", menu items with prices |
| Customer Orders | 0 | 0 | "Siparişlerim", "Aktif Siparişler" |

Artifacts: `docs/live-page-verification.json`

---

## Files changed (loading / retry fixes)

| File | Change |
|------|--------|
| `src/hooks/useOrders.js` | Smart retry; `orders === undefined` loading gate |
| `src/hooks/useKitchen.js` | Smart retry |
| `src/hooks/useMenu.js` | Smart retry; `data === undefined` loading gate |
| `src/hooks/usePublicMenu.js` | `retry: 1` |
| `src/pages/Orders.jsx` | `isLoading && orders === undefined` |
| `src/pages/Kitchen.jsx` | `isLoading && kitchenOrders === undefined` |
| `src/pages/customer/CustomerMenu.jsx` | Error before loading |
| `src/pages/customer/CustomerOrders.jsx` | `tableId` resolution via public menu |
| `src/api/axios.js` | Timeout 8s; `error.status` for retry logic |
| `src/hooks/useAuth.js` | Demo auth; mandatory `restaurantId` on login |
| `src/components/AuthGuard.jsx` | 3s persist hydration fallback |
| `src/main.jsx` | Global query retry 3 → 1 |

---

## If pages still show "Yükleniyor..." on your machine

1. **API must be running:** `cd api && npm run start:dev` → port 3001
2. **Seed demo data:** `cd api && npm run seed:demo`
3. **`.env` in project root** must contain:
   ```
   VITE_API_URL=http://localhost:3001/api/v1
   VITE_RESTAURANT_ID=660e8400-e29b-41d4-a716-446655440001
   ```
4. **Restart frontend** after pulling fixes: `npm run dev` (old Vite process may serve stale bundle)
5. **Hard refresh:** Ctrl+Shift+R
6. **Check Network tab:** `GET /api/v1/orders` should return **200**. If **401**, log out and log in again (sets `restaurantId`).

---

## Remaining non-blockers

| Item | Notes |
|------|-------|
| Redis 3.x warning | BullMQ on Windows Redis 3.0 — use Docker Redis 7 |
| Menu N+1 fetches | 4 parallel `/menu/items?categoryId=` — fast for demo |
| Roadmap routes | Intentional preview pages — not in scope |

---

## Conclusion

All **6 required pages** render correctly in the **running browser** after fresh dev server restart. No page stuck on loading on the happy path (API + seed + `.env` present).
