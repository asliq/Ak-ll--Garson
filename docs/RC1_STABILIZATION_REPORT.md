# RC1 Stabilization Report

**Date:** 2026-07-04  
**Scope:** Critical and High severity fixes only (no new features, no placeholder APIs, no TODO pages)

---

## Summary

RC1 stabilization focused on runtime reliability for the live demo path: staff login → dashboard → orders → kitchen → menu → system health/settings, plus customer QR menu and orders.

**Before fixes:** 10/13 Playwright checks WARN (WebSocket console noise on every route).  
**After fixes:** 13/13 PASS. Production build succeeds.

---

## Fixes applied

### 1. WebSocket stability (H-01)

**File:** `src/hooks/useWebSocket.js`

**Problem:** React StrictMode double-mount called `disconnect()` immediately after `connect()`, closing the socket before it opened. Every page logged WebSocket warnings; System Health showed disconnected.

**Fix:** Introduced `mountGeneration` ref. Cleanup schedules disconnect after 150ms only if no newer mount occurred — survives StrictMode remount without killing the active connection.

---

### 2. Null-safe order line items (H-02)

**Files:**

- `src/hooks/useKitchen.js` — `mapOrderToKitchen`, optimistic updates, `useKitchenStats`
- `src/pages/Kitchen.jsx` — filters, counts, item list
- `src/pages/Orders.jsx` — order cards, payment modal, print handler
- `src/pages/customer/CustomerOrders.jsx` — active orders, list, detail modal

**Problem:** Direct `order.items.map()` throws when `items` is undefined (edge case if API shape differs).

**Fix:** Consistent `(order.items || [])` guards across kitchen, staff orders, and customer orders.

---

### 3. Auth persist hydration gate (H-03)

**File:** `src/components/AuthGuard.jsx`

**Problem:** Zustand `persist` rehydrates `activeWaiter` asynchronously. On refresh, `AuthGuard` saw no waiter and redirected to `/login` before storage restored.

**Fix:** Block render until `useAppStore.persist.onFinishHydration()` completes (with `hasHydrated()` fast path). Combined with existing session loading spinner.

---

### 4. Screenshot script login email (H-04)

**File:** `scripts/capture-screenshots.mjs`

**Problem:** Used `ahmet@restaurant.com` — not a valid demo account.

**Fix:** Changed to `ahmet@restoran.com`.

---

### 5. Audit script import fix (tooling)

**File:** `scripts/rc1-runtime-audit.mjs`

**Problem:** `fileURLToPath` imported from `node:path` (invalid).

**Fix:** Import from `node:url`.

---

## Verification

| Check | Command / method | Result |
|-------|------------------|--------|
| Runtime audit | `node scripts/rc1-runtime-audit.mjs` | 13/13 PASS |
| Production build | `npm run build` | Success |
| WebSocket (manual) | Node `ws` client → `ws://localhost:3001/ws` | `connected` received |
| Health ready | `GET /api/v1/health/ready` | 200, db + redis up |

---

## Files changed (stabilization)

| File | Change |
|------|--------|
| `src/hooks/useWebSocket.js` | StrictMode-safe reconnect |
| `src/hooks/useKitchen.js` | Null-safe `items` |
| `src/components/AuthGuard.jsx` | Persist hydration wait |
| `src/pages/Kitchen.jsx` | Null-safe `items` |
| `src/pages/Orders.jsx` | Null-safe `items` |
| `src/pages/customer/CustomerOrders.jsx` | Null-safe `items` |
| `scripts/capture-screenshots.mjs` | Correct demo email |
| `scripts/rc1-runtime-audit.mjs` | Import fix |
| `docs/rc1-audit-results.json` | Updated audit output |
| `docs/RC1_RUNTIME_AUDIT.md` | Full audit report |
| `docs/RC1_STABILIZATION_REPORT.md` | This document |

---

## Not changed (by design)

- No new features or roadmap modules
- No new API endpoints or stubs
- Medium/Low issues deferred to post-RC1 (see `RC1_RUNTIME_AUDIT.md`)
- Legacy orphaned pages (`Tables.jsx`, etc.) left untouched — not in active route map

---

## Demo checklist (presenter)

1. Start API: `cd api && npm run start:dev`
2. Start frontend: `npm run dev`
3. Staff: `http://localhost:5173/login` → Ahmet / PIN `1234`
4. Customer: `http://localhost:5173/customer?token=qr-masa-1`
5. Optional: `node scripts/rc1-runtime-audit.mjs` before demo to confirm green status

**RC1 stabilization: complete.**
