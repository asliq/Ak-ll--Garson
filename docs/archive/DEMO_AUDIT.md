# Demo Audit — Akıllı Garson

**Date:** 4 July 2026  
**Scope:** Full-stack audit before production-quality demo  
**Method:** Static code review + build verification (no new features)

---

## Executive Summary

The application has **5 working demo flows** (Dashboard, Orders, Kitchen, Menu, Customer QR). Ten additional staff pages exist but call **missing NestJS endpoints** or show **"API not implemented"** placeholders. Navigation, quick actions, command palette, and voice commands still link to hidden/broken pages.

**Critical demo risks:** Dashboard full-page blocking loader; unfinished nav items visible; Menu delete/availability buttons error on click; customer "Garson Çağır" shows disabled toast.

---

## Severity Legend

| Level | Meaning |
|-------|---------|
| **Critical** | Blocks demo or shows broken UX on primary flow |
| **High** | Visible broken page, error toast, or misleading UI |
| **Medium** | Partial failure, missing empty/error state, stale data |
| **Low** | Dev-only noise, cosmetic, non-demo path |

---

## Findings

| ID | Severity | Area | Issue | Root Cause | File(s) | Fix Effort |
|----|----------|------|-------|------------|---------|------------|
| A01 | **Critical** | Nav | Tables, Reservations, Analytics, Waiters, Inventory visible in sidebar | `Layout.jsx` lists all routes; no feature flag filter | `Layout.jsx`, `usePermissions.js` | 1h |
| A02 | **Critical** | Dashboard | Full-page "Yükleniyor..." until orders load; blank on partial failure | Blocking `isLoading` gate; no partial render | `Dashboard.jsx` | 1h |
| A03 | **Critical** | Dashboard | "Masa API henüz aktif değil" shown to users | Placeholder section for disabled Tables API | `Dashboard.jsx` | 30m |
| A04 | **High** | Pages | Tables, Waiters, Inventory, Reservations show "API henüz taşınmadı" | Early return with unfinished message | `Tables.jsx`, `Waiters.jsx`, etc. | 1h (hide routes) |
| A05 | **High** | Menu | Delete + availability toggle call unsupported API | No PATCH/DELETE on backend; UI still exposed | `Menu.jsx`, `services.js` | 45m |
| A06 | **High** | Quick Actions | Links to `/tables`, `/reservations` | Hardcoded actions array | `QuickActions.jsx` | 30m |
| A07 | **High** | Command Palette | 10 nav commands including dead routes | Hardcoded `commands` array | `CommandPalette.jsx` | 30m |
| A08 | **High** | Keyboard | Ctrl+N → `/tables`; 1–9 shows "yakında" toast | Legacy shortcuts | `KeyboardShortcuts.jsx` | 15m |
| A09 | **High** | Voice | "masalar", "rezervasyon", "raporlar" navigate to dead pages | Hardcoded `voiceCommands` | `VoiceCommand.jsx` | 15m |
| A10 | **High** | Customer | "Garson Çağır" → toast "şu an kullanılamıyor" | `serviceCalls` API disabled; button visible | `CustomerMenu.jsx`, `CustomerOrders.jsx` | 20m |
| A11 | **Medium** | Kitchen | No loading/error UI | `useKitchenOrders` loading ignored | `Kitchen.jsx` | 30m |
| A12 | **Medium** | Orders | Payment modal works (status → completed) but table ops toasts mention "henüz" | Disabled tables API; buttons hidden but code paths remain | `Orders.jsx` | 15m |
| A13 | **Medium** | Customer Orders | Orders list empty until first order (no `tableId` in localStorage) | `tableId` only saved after `POST /public/orders` | `CustomerOrders.jsx` | Low (by design) |
| A14 | **Medium** | Hooks | `useDiscounts` without `API_ENABLED` guard | Could throw if DiscountManager opened | `useDiscounts.js` | Fixed in RC-1 |
| A15 | **Medium** | Hooks | `useReservations`, `usePayments`, `useAnalytics` use json-server URLs | Legacy inline APIs | `useReservations.js`, etc. | N/A (hooks disabled) |
| A16 | **Low** | Dev | `PerformanceMonitor` polls `/health/live` every 5s | DEV-only component | `PerformanceMonitor.jsx` | None |
| A17 | **Low** | Dashboard | Fake trend percentages (+12.5%) | Placeholder metrics | `Dashboard.jsx` | Optional |
| A18 | **Low** | Menu | `item.description` may be undefined in filter | Missing optional chaining | `Menu.jsx` | 10m |

---

## Broken Pages

| Page | Route | Status | User-Visible Problem |
|------|-------|--------|----------------------|
| Dashboard | `/` | Partial | Blocks on load; disabled tables section |
| Menu | `/menu` | Partial | Delete/availability fail on click |
| Orders | `/orders` | **Works** | Core flow OK; payment completes via status |
| Kitchen | `/kitchen` | **Works** | Missing explicit loading state |
| Customer Login | `/customer` | **Works** | QR token flow |
| Customer Menu | `/customer/menu` | Partial | Service call button |
| Customer Orders | `/customer/orders` | **Works** | After first order |
| Tables | `/tables` | Broken | Placeholder message |
| TableOrder | `/tables/:id/order` | Broken | Placeholder message |
| Reservations | `/reservations` | Broken | Placeholder message |
| Analytics | `/analytics` | Works* | Client-side only; not in demo scope |
| DailyReport | `/daily-report` | Works* | Client-side only |
| Waiters | `/waiters` | Broken | Placeholder message |
| Inventory | `/inventory` | Broken | Placeholder message |
| Settings | `/settings` | Works | Local state only |
| Login | `/login` | **Works** | Demo PIN |

---

## Missing Backend Endpoints (Frontend Calls)

| Endpoint | Called From | Backend |
|----------|-------------|---------|
| `GET/POST/PATCH/DELETE /tables` | `tablesApi`, `useTables` | ❌ |
| `GET/POST /waiters` | `waitersApi` | ❌ |
| `GET/POST /inventory` | `inventoryApi` | ❌ |
| `GET/POST /reservations` | `useReservations` (json-server style) | ❌ |
| `GET/POST /payments` | `usePayments` | ❌ |
| `GET/POST /service-calls` | `useServiceCalls` | ❌ |
| `PATCH /menu/items/:id` (availability) | `menuApi.updateAvailability` | ❌ |
| `DELETE /menu/items/:id` | `menuApi.delete` | ❌ |
| `PATCH /orders/:id` (general update) | `ordersApi.update` | ❌ |

---

## Working Backend Endpoints

| Endpoint | Frontend Consumer |
|----------|-------------------|
| `GET /health/*` | PerformanceMonitor, LiveClock |
| `GET/POST /menu/categories` | `categoriesApi` |
| `GET/POST /menu/items`, `PATCH .../price` | `menuApi` |
| `GET /orders`, `PATCH /orders/:id/status` | `ordersApi`, Kitchen |
| `GET /public/menu/:token`, `POST /public/orders` | Customer QR flow |
| WebSocket `/ws` | `WebSocketProvider` |

---

## React Query / Hook Status

| Hook | Enabled | Issue |
|------|---------|-------|
| `useOrders` | ✅ | Works |
| `useMenu` / `useMenuWithCategories` | ✅ | Works |
| `useKitchen` | ✅ | Works |
| `usePublicMenu` | ✅ | Works |
| `useTables` | ❌ `enabled: false` | OK |
| `useWaiters` | ❌ | OK |
| `useInventory` | ❌ | OK |
| `useReservations` | ❌ | OK |
| `usePayments` | ❌ | OK (Orders bypasses) |
| `useServiceCalls` | ❌ | Button still visible |
| `useDiscounts` | ❌ | Guard added |
| `useAnalytics` | ❌ | Legacy URLs |

---

## WebSocket

| Check | Status |
|-------|--------|
| Connect `ws://localhost:3001/ws` | ✅ |
| Staff join `{ event: 'join', data: { role: 'staff', restaurantId } }` | ✅ |
| Customer join with `tableToken` | ✅ |
| `order.created` / `order.updated` | ✅ |
| Reconnect with backoff | ✅ |
| Legacy events (`TABLE_UPDATED`, etc.) | No-op (harmless) |

---

## API Response Mapping

| Area | Match | Notes |
|------|-------|-------|
| Envelope `{ success, data }` | ✅ | `axios.js` unwraps |
| Order status mapping | ✅ | `adapters.js` UI ↔ API |
| Money minor/major | ✅ | `minorToMajor` / `majorToMinor` |
| Public menu price shape | ✅ | `mapPublicMenuItem` uses `price.amountMinor` |
| Category mapping | ✅ | Defaults for icon/color |

---

## Estimated Total Fix Effort

| Phase | Effort |
|-------|--------|
| Hide nav + redirect dead routes | 2h |
| Dashboard partial render | 1h |
| Menu UI cleanup | 45m |
| Customer service call hide | 20m |
| Command palette / shortcuts / voice | 1h |
| Kitchen loading/error | 30m |
| **Total** | **~5–6h** |

---

## Demo-Critical Path (Must Work)

```
Login (PIN 1234) → Dashboard → Menu (create/price) → Customer QR → Order
  → Kitchen → Orders (status) → WebSocket update → Completed
```

All other staff routes should be **invisible**, not disabled with messages.
