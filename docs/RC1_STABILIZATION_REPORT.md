# RC1 Stabilization Report

**Date:** 2026-07-05  
**Scope:** Release Candidate 1 — stability, responsiveness, and demo-path correctness  
**Constraints:** No new features, no UI redesign, no architecture changes

---

## Executive summary

A full diagnosis was performed across frontend routes, React Query, WebSocket, customer QR flow, and NestJS startup paths. Fixes target **confirmed** issues only — no speculative optimizations.

**Result:** Demo path (staff login → dashboard → orders → kitchen → menu → system health + customer QR) is stable. Production build passes. Staff API traffic no longer fires on login/customer routes.

---

## 1. Problems found

| ID | Severity | Area | Problem |
|----|----------|------|---------|
| S-01 | P0 | Frontend | `NotificationProvider` called `useOrders()` on **every** route (login, customer) → duplicate `GET /orders` and console noise |
| S-02 | P0 | Customer | `CustomerOrders` fetched all staff orders + menu items; filtered by `tableId` only after first order |
| S-03 | P0 | Customer | `CustomerMenu` race: `tableToken` unset on first render → empty menu flash / skipped loading state |
| S-04 | P0 | WebSocket | `DATA_CHANGED` handler called `queryClient.invalidateQueries()` with **no filter** → refetch storm |
| S-05 | P1 | WebSocket | Unbounded reconnect attempts when server down |
| S-06 | P1 | WebSocket | Connection attempted on `/login` (unnecessary) |
| S-07 | P1 | System health | `wsConnected` in React Query key → health refetch on every WS toggle |
| S-08 | P1 | Customer | Public menu API did not expose `tableId` → orders page empty until first order created |
| S-09 | P1 | Kitchen | Elapsed timers computed once per render (frozen display) |
| S-10 | P1 | Notifications | `addNotification` stale closure — `dismissNotification` missing from deps |
| S-11 | P1 | Orders UX | Duplicate success toast on customer order (`useCreatePublicOrder` + page) |
| S-12 | P2 | Backend | BullMQ Redis connection missing `maxRetriesPerRequest: null` (version warning with old local Redis) |
| S-13 | P2 | Backend | No `enableShutdownHooks()` / bootstrap `.catch()` on API startup |
| S-14 | — | Known | Menu staff API uses parallel per-category fetches (4 requests) — acceptable for demo dataset |
| S-15 | — | Known | `LiveClock` 1s interval re-renders Layout header — product UI, not dev overlay |
| S-16 | — | Known | Roadmap routes intentionally show preview pages — left untouched |

---

## 2. Root cause

| ID | Root cause |
|----|------------|
| S-01 | `NotificationProvider` mounted above route tree without `enabled` guard |
| S-02 | Customer flow reused staff `useOrders()` + client-side filter; `tableId` missing from session |
| S-03 | `useState(null)` + async `useEffect` hydration; TanStack Query `enabled: false` reports `isLoading: false` |
| S-04 | Legacy json-server `DATA_CHANGED` handler never scoped; NestJS does not emit this event |
| S-05–S-06 | WS provider always connected; no reconnect cap |
| S-07 | WebSocket status mixed into server health query key |
| S-08 | Public read model returned `tableName` only, not `tableId` |
| S-09 | No interval to trigger re-render for elapsed seconds |
| S-10 | `dismissNotification` defined after `addNotification` without dependency |
| S-11 | Hook and page both showed success toasts |
| S-12–S-13 | BullMQ / NestJS bootstrap hardening gaps |

---

## 3. Files modified

### Frontend

| File | Change |
|------|--------|
| `src/components/NotificationProvider.jsx` | Staff-route guard for `useOrders`; fix notification callback deps |
| `src/components/WebSocketProvider.jsx` | Skip WS on `/login` |
| `src/hooks/useWebSocket.js` | Scope `DATA_CHANGED`; cap reconnect at 25 attempts |
| `src/hooks/useSystemHealth.js` | Stable query key; WS status merged at read time |
| `src/hooks/useOrders.js` | Table-scoped cache invalidation; remove duplicate create toast |
| `src/pages/customer/CustomerMenu.jsx` | Sync table hydration; loading gate; persist `tableId` from menu |
| `src/pages/customer/CustomerOrders.jsx` | `useTableOrders(tableId)`; remove staff menu fetch |
| `src/pages/Kitchen.jsx` | 30s timer tick for elapsed display |
| `src/api/services.js` | Pass `tableId` from public menu response |

### Backend

| File | Change |
|------|--------|
| `api/src/modules/public/**` | Add `tableId` to public menu read model, DTO, mapper, examples |
| `api/src/main.ts` | `enableShutdownHooks()`; bootstrap error handler |
| `api/src/core/queue/queue.module.ts` | `maxRetriesPerRequest: null` for BullMQ |

---

## 4. Performance improvements

| Improvement | Impact |
|-------------|--------|
| Staff orders query disabled on `/login` and `/customer/*` | −1 persistent `GET /orders` per customer page load |
| Customer orders uses `useTableOrders` with `tableId` param | Smaller payload; no full-restaurant order list on phone |
| Removed global cache invalidation on `DATA_CHANGED` | Prevents refetch storms when legacy event received |
| System health query key stabilized | Fewer redundant `/health/*` probes on WS reconnect |
| WS disabled on login | No socket churn on unauthenticated page |
| Reconnect capped at 25 attempts | Stops infinite background timers when API offline |
| Customer menu: sync `localStorage` read | Eliminates empty flash before fetch starts |

---

## 5. Pages fixed

| Route | Fix |
|-------|-----|
| `/login` | No staff orders fetch; no WebSocket connection |
| `/customer/menu` | Reliable loading state; `tableId` persisted after menu load |
| `/customer/orders` | Table-scoped orders; clear empty state before first order |
| `/kitchen` | Elapsed timers update every 30s |
| `/` (Dashboard) | Indirect — fewer global invalidations / duplicate fetches |
| `/system/health` | WS status without query-key churn |

**Verified staff routes (unchanged behavior, improved stability):** `/orders`, `/menu`, `/system/settings`, roadmap pages.

---

## 6. Remaining known issues

| Issue | Notes |
|-------|-------|
| Local Redis 3.x vs Docker Redis 7 | If Windows Redis 3.0.504 is on port 6379, BullMQ logs version warning — use `api/docker` Redis 7 for demo |
| Menu N+1 HTTP pattern | `menuApi.getAll` still fetches items per category in parallel (4 requests) — fast enough for 12-item demo |
| `LiveClock` 1s re-renders | Layout header updates every second — intentional clock widget |
| `useNotifications.js` `onSuccess` | Dead in TanStack Query v5; module disabled via `API_ENABLED.notifications` |
| Unbounded `GET /orders` on API | No pagination — acceptable for demo seed (6 orders) |
| `POST /public/orders` N+1 Prisma | Per-line menu item lookup — out of scope (domain/use-case layer) |
| Roadmap modules | Tables, payments, inventory UI → preview pages only (by design) |
| Author section placeholders | README contact links — not runtime issues |

---

## 7. Startup time

| Component | Observation |
|-----------|-------------|
| **Frontend build** | `npm run build` ≈ **7.4s** (Vite 6, 2130 modules) |
| **API dev** | NestJS compile + listen ≈ **5–15s** (watch mode); port conflict if instance already on :3001 |
| **Demo seed** | `npm run seed:demo` ≈ **2–5s** |

---

## 8. Bundle observations

Production build (`npm run build`, 2026-07-05):

| Asset | Size |
|-------|------|
| `index-*.js` (main) | 462 KB (152 KB gzip) |
| `Orders-*.js` | 27 KB (8 KB gzip) |
| `Dashboard-*.js` | 17 KB (5 KB gzip) |
| `CustomerMenu-*.js` | 12 KB (4 KB gzip) |
| CSS total | ~24 KB main + page chunks |

Lazy-loaded routes keep initial staff shell reasonable. Largest chunk is shared vendor + app shell.

---

## 9. Final stability assessment

| Criterion | Status |
|-----------|--------|
| No infinite loading on live routes | ✅ |
| Customer QR demo path end-to-end | ✅ |
| Staff demo path end-to-end | ✅ |
| No staff API calls on customer/login | ✅ |
| WebSocket reconnect bounded | ✅ |
| Production build | ✅ |
| Console errors on happy path (expected) | ✅ 0 React errors when API + DB up |
| Demo-ready for presentation | ✅ |

**Recommendation:** Run demo with Docker Postgres + Redis 7 (`api/docker`), API on :3001, frontend on :5173, `npm run seed:demo` before walkthrough.

---

## Prior stabilization (2026-07-04)

Earlier RC1 pass addressed: WebSocket StrictMode race, null-safe `order.items`, AuthGuard Zustand hydration, screenshot login email. Those fixes remain in place.

---

## Verification commands

```bash
# Seed + servers running, then:
npm run build
node scripts/rc1-runtime-audit.mjs   # if API on :3001
npm run screenshots:readme           # optional visual regression
```
