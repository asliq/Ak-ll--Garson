# RC1 Runtime Debug Report

**Date:** 2026-07-05  
**Role:** Senior QA / Full Stack Debugger  
**Environment:** Live local stack — API `http://localhost:3001`, Frontend `http://localhost:5173`  
**Method:** Playwright browser automation + manual verification criteria (no static-only analysis)

---

## Executive summary

Every reachable route was exercised against the **running** application with demo seed data (`npm run seed:demo`). Two customer-flow defects were found during edge-case testing and fixed. After fixes, **18/18 pages pass** full-route audit and **12/12 edge scenarios pass** (hard reload, sidebar nav, API failure, cold start).

**Sprint status:** No page is stuck on infinite loading or blank rendering on the happy path. Roadmap routes intentionally show preview UI.

---

## Test methodology

| Step | Action |
|------|--------|
| 1 | Confirm API (:3001) and Vite dev server (:5173) listening |
| 2 | `cd api && npm run seed:demo` — 4 tables, 12 menu items, 6 orders |
| 3 | `node scripts/rc1-runtime-debug.mjs` — all routes, 3s settle, console + network capture |
| 4 | `node scripts/rc1-runtime-edge.mjs` — reload, sidebar clicks, QR cold start, API abort, rapid switching |
| 5 | Fix root cause → reload page → re-run scripts |
| 6 | `npm run build` — production bundle verification |

**Credentials:** `ahmet@restoran.com` / PIN `1234`  
**Customer QR token:** `qr-masa-1` (Masa 1)

---

## Page audit results (post-fix)

| Page | Route | Render | Loading stuck | Console | Network | Navigation |
|------|-------|--------|---------------|---------|---------|------------|
| Login | `/login` | ✅ | No | 0 errors | 0 failures | ✅ |
| Dashboard | `/` | ✅ | No | 0 errors | 0 failures | ✅ |
| Orders | `/orders` | ✅ | No | 0 errors | 0 failures | ✅ |
| Kitchen | `/kitchen` | ✅ | No | 0 errors | 0 failures | ✅ |
| Menu | `/menu` | ✅ | No | 0 errors | 0 failures | ✅ |
| Settings | `/system/settings` | ✅ | No | 0 errors | 0 failures | ✅ |
| System Health | `/system/health` | ✅ | No | 0 errors | 0 failures | ✅ |
| Customer QR | `/customer?token=qr-masa-1` | ✅ | No | 0 errors | 0 failures | ✅ → menu |
| Customer Menu | `/customer/menu` | ✅ | No | 0 errors | 0 failures | ✅ |
| Customer Orders | `/customer/orders` | ✅ | No | 0 errors | 0 failures | ✅ |
| Roadmap QR Orders | `/orders/qr` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Categories | `/menu/categories` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Tables | `/restaurant/tables` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Staff | `/restaurant/staff` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Reservations | `/restaurant/reservations` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Inventory | `/operations/inventory` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Payments | `/operations/payments` | ✅ Preview | No | 0 errors | 0 failures | ✅ |
| Roadmap Reports | `/operations/reports` | ✅ Preview | No | 0 errors | 0 failures | ✅ |

**Edge scenarios (all pass after fix):**

| Scenario | Result |
|----------|--------|
| Cold start `/orders` without auth | Redirects to `/login` |
| Hard reload on 6 staff pages | No stuck loading |
| Sidebar navigation (Siparişler, Mutfak, Menü) | Correct routes |
| Customer QR cold start (cleared storage) | Menu renders with items |
| Customer orders with token only (no `tableId`) | Resolves `tableId` via public menu; shows orders |
| Rapid route switching (5× orders/kitchen/menu) | No React errors |
| Customer menu with API aborted | Error UI, not infinite loader |

---

## Broken pages found & fixed

### R-01 — Customer Menu stuck on loading when API fails

| Field | Detail |
|-------|--------|
| **Page** | `/customer/menu` |
| **Symptom** | "Menü yükleniyor..." persisted when network request failed |
| **Root cause** | Loading guard ran before error guard; TanStack Query default retries (3× with backoff) kept `isFetching: true` for several seconds after abort |
| **Fix** | `usePublicMenu.js`: `retry: 1`, `retryDelay: 300`. `CustomerMenu.jsx`: evaluate `isError` and `isFetched && !publicMenu && !isFetching` **before** loading branch |
| **Files** | `src/hooks/usePublicMenu.js`, `src/pages/customer/CustomerMenu.jsx` |
| **Verification** | Edge test aborts `**/api/v1/public/menu/**` → page shows "Menü yüklenemedi" + Tekrar Dene / Geri Dön within 3s |

### R-02 — Customer Orders empty when `tableId` missing from session

| Field | Detail |
|-------|--------|
| **Page** | `/customer/orders` |
| **Symptom** | User with only `tableToken` in `localStorage` saw "Henüz sipariş yok" even when table had active orders |
| **Root cause** | `useTableOrders` was `enabled: false` until `tableId` existed; no fallback to resolve `tableId` from public menu API |
| **Fix** | Sync `readCustomerTable()` hydration; call `usePublicMenu(tableToken)` when `tableId` absent; persist `tableId` from menu response; use `resolvedTableId` for orders query |
| **Files** | `src/pages/customer/CustomerOrders.jsx` |
| **Verification** | Edge test: `localStorage` with `{ tableToken: 'qr-masa-1' }` only → page shows "Siparişlerim" + active order `#660e8400-...` |

---

## Prior stabilization fixes verified at runtime

These were applied in the RC1 stabilization pass and **confirmed working** during this live audit (no regression):

| ID | Area | Verified behavior |
|----|------|-------------------|
| S-01 | `NotificationProvider` | No `GET /orders` on `/login` or `/customer/*` |
| S-02–S-03 | Customer menu hydration | Sync `localStorage` read; loading gate before fetch |
| S-04–S-07 | WebSocket / health | No refetch storm; WS skipped on login; health key stable |
| S-08 | Public menu `tableId` | Returned by API; persisted after menu load |
| S-09 | Kitchen timers | Elapsed time updates (30s tick) |
| S-12–S-13 | Backend bootstrap | API healthy on :3001; seed completes |

See `docs/RC1_STABILIZATION_REPORT.md` for full static analysis and file list.

---

## Fixes applied (this session only)

```
src/hooks/usePublicMenu.js            | retry: 1, retryDelay: 300
src/pages/customer/CustomerMenu.jsx   | error-before-loading guard
src/pages/customer/CustomerOrders.jsx | tableId resolution via public menu
```

**Production build:** `npm run build` — ✅ 7.4s, 462 KB main (152 KB gzip)

---

## Remaining issues (non-blocking)

| Issue | Severity | Notes |
|-------|----------|-------|
| Local Redis 3.x | P2 | BullMQ version warning if Windows Redis 3.0.504 on :6379 — use Docker Redis 7 (`api/docker`) |
| Menu N+1 HTTP | P3 | Staff menu fetches items per category (4 parallel requests) — acceptable for 12-item demo |
| `LiveClock` 1s interval | — | Layout header re-renders every second — intentional UI |
| Roadmap modules | — | Tables, payments, inventory, etc. show preview pages by design |
| No order pagination | P3 | Full list fetch — fine for 6-order demo seed |
| Port 3001 conflict | Ops | If `EADDRINUSE`, stop existing API process before restart |

---

## Verification commands

```bash
# Prerequisites: API on :3001, frontend on :5173
cd api && npm run seed:demo

# Full page audit (18 routes)
node scripts/rc1-runtime-debug.mjs

# Edge cases (reload, nav, API down, token-only orders)
node scripts/rc1-runtime-edge.mjs

# Production build
npm run build

# Quick smoke (legacy)
node scripts/rc1-runtime-audit.mjs
```

**Expected:** `0 FAIL` from both debug scripts.

**Artifacts:**

- `docs/rc1-runtime-debug-results.json`
- `docs/rc1-runtime-edge-results.json`

---

## Conclusion

| Criterion | Status |
|-----------|--------|
| All staff pages render | ✅ |
| All customer pages render | ✅ |
| No infinite loading (happy path) | ✅ |
| API failure shows error UI (customer menu) | ✅ |
| Customer orders without cached `tableId` | ✅ |
| Roadmap pages show intentional preview | ✅ |
| Console React errors (API up) | ✅ 0 |
| Production build | ✅ |

**RC1 runtime sprint:** Complete for demo walkthrough. Run with Docker Postgres + Redis 7, seed demo data, then staff login → orders → kitchen → menu → system health → customer QR (`?token=qr-masa-1`).
