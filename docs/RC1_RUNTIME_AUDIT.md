# RC1 Runtime Audit

**Date:** 2026-07-04  
**Release:** RC1 (Demo Edition)  
**Auditor role:** Principal QA / Release Manager  
**Environment:** `localhost:5173` (Vite) + `localhost:3001/api/v1` (NestJS)

---

## Scope

Automated Playwright smoke audit (`scripts/rc1-runtime-audit.mjs`) plus manual code review of auth, orders, kitchen, WebSocket, and customer flows.

### Routes verified

| Route | Label | Render | React errors | Console | API failures | Infinite load |
|-------|-------|--------|--------------|---------|--------------|---------------|
| `/login` | Login | ✓ | None | Clean (post-fix) | None | None |
| `/` | Dashboard | ✓ | None | Clean | None | None |
| `/orders` | Orders | ✓ | None | Clean | None | None |
| `/kitchen` | Kitchen | ✓ | None | Clean | None | None |
| `/menu` | Menu | ✓ | None | Clean | None | None |
| `/system/health` | System Health | ✓ | None | Clean | None | None |
| `/system/settings` | Settings | ✓ | None | Clean | None | None |
| `/restaurant/tables` | Roadmap (Tables) | ✓ | None | Clean | None | None |
| `/customer?token=qr-masa-1` | Customer QR Menu | ✓ | None | Clean | None | None |
| `/customer/orders` | Customer Orders | ✓ | None | Clean | None | None |

### API smoke checks

| Endpoint | Result |
|----------|--------|
| `GET /health/live` | 200 |
| `GET /health/ready` | 200 (database + redis up) |
| `GET /orders` (with `X-Restaurant-Id`) | 200 |
| `GET /public/menu/qr-masa-1` | 200 |

**Post-stabilization result:** 13/13 checks **PASS** — see `docs/rc1-audit-results.json`.

---

## Issues by severity

### Critical

| ID | Issue | Status |
|----|-------|--------|
| — | No critical (crash / data-loss / auth-bypass) issues found in scoped routes after stabilization | **Resolved / N/A** |

---

### High

| ID | Issue | Impact | Status |
|----|-------|--------|--------|
| H-01 | **WebSocket disconnect under React StrictMode** — `useWebSocket` cleanup ran immediately on dev double-mount, causing `WebSocket is closed before the connection is established` on every page and `websocket: disconnected` on System Health | Real-time updates unreliable; noisy console during demo | **Fixed** — deferred disconnect with mount generation guard (`src/hooks/useWebSocket.js`) |
| H-02 | **`order.items.map()` without null guard** in `useKitchen.js`, `Kitchen.jsx`, `Orders.jsx`, `CustomerOrders.jsx` | Runtime `TypeError` if API returns order without `lines`/`items` | **Fixed** — `(order.items \|\| [])` guards added |
| H-03 | **Auth session lost on page refresh** — Zustand `persist` rehydrates after first render; `AuthGuard` redirected to `/login` before `activeWaiter` restored | Broken navigation after F5 during live demo | **Fixed** — wait for `persist.onFinishHydration` in `AuthGuard` |
| H-04 | **Screenshot script login email mismatch** — `scripts/capture-screenshots.mjs` used `ahmet@restaurant.com` (invalid) | Automated demo assets fail login | **Fixed** — `ahmet@restoran.com` |

---

### Medium

| ID | Issue | Impact | Recommendation |
|----|-------|--------|----------------|
| M-01 | **Stub APIs still throw** when `API_ENABLED.*` is `false` (tables, waiters, payments, etc.) | Error toast if legacy component calls stub | Roadmap routes hide these; do not navigate to orphaned pages (`/tables` legacy components) |
| M-02 | **Login placeholder** shows `ornek@restaurant.com` while valid demo emails use `@restoran.com` | Minor user confusion | Update placeholder in RC2 polish |
| M-03 | **Customer order status** — `statusConfig[order.status]` assumed always defined in `CustomerOrders.jsx` | Possible undefined access for unknown status | Add fallback config in RC2 |
| M-04 | **Health `/ready` returns 503** when Redis is down (environment-dependent) | System Health shows degraded redis | Acceptable for demo; ensure Redis running before demo |
| M-05 | **Kitchen item-level status** is derived from order-level status (not per-line API) | All line items share same status in UI | Known demo limitation; document for presenters |

---

### Low

| ID | Issue | Impact |
|----|-------|--------|
| L-01 | Tailwind `content` configuration warning on `npm run build` | No functional impact; CSS purge may be incomplete |
| L-02 | Browserslist data outdated warning on build | No functional impact |
| L-03 | `CommandPalette` `useEffect` dependency on `executeCommand` | Benign re-subscription in dev |
| L-04 | Legacy page files (`Tables.jsx`, `Inventory.jsx`, etc.) still contain technical error strings | Not routed in `App.jsx`; no user impact |
| L-05 | Documentation (`TAM-RAPOR.md`, `PROJE-RAPORU.md`) lists outdated `@restaurant.com` credentials | Docs only |

---

## WebSocket

- Backend gateway: `ws://localhost:3001/ws` — **verified** (Node `ws` client receives `connected` envelope).
- Frontend join payload: `{ event: "join", data: { role, restaurantId \| tableToken } }`.
- Post-fix: Playwright audit reports **no** WebSocket console warnings on any route.

---

## Demo credentials (RC1)

| User | Email | PIN | Role |
|------|-------|-----|------|
| Ahmet | `ahmet@restoran.com` | `1234` | waiter |
| Ayşe | `ayse@restoran.com` | `1234` | manager |

**Customer QR token:** `qr-masa-1` → `/customer?token=qr-masa-1`

---

## RC1 readiness verdict

| Criterion | Result |
|-----------|--------|
| All scoped routes render | **PASS** |
| No React runtime exceptions | **PASS** |
| No infinite loading states | **PASS** |
| No unhandled 5xx on primary flows | **PASS** |
| Navigation intact (auth + customer) | **PASS** |
| Production build | **PASS** (`npm run build`) |

**Recommendation:** **Approve RC1** for live demonstration with demo credentials above. Ensure API + Redis are running before the session.

---

## Re-run audit

```bash
# Terminals: api (npm run start:dev) + frontend (npm run dev)
node scripts/rc1-runtime-audit.mjs
```

Results are written to `docs/rc1-audit-results.json`.
