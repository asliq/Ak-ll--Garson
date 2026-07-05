# RC1 P0 Completion Report

**Release:** Release Candidate 1  
**Date:** 2026-07-05  
**Scope:** Six P0 fixes from `docs/RC1_PRODUCT_EXPERIENCE_AUDIT.md`  
**Status:** Complete

---

## Executive summary

All six P0 credibility issues were addressed with minimal, targeted changes. No new features were added. The live demo path now reflects the backend domain model honestly, opens with a populated restaurant dataset, uses branded browser chrome, avoids developer-facing error copy on staff/customer screens, hides the out-of-scope voice UI, and removes fabricated fee/payment UI.

**Post-fix verification**

| Check | Result |
|-------|--------|
| `npm run build` (frontend) | Pass |
| `npm run seed:demo` (API) | Pass — 4 tables, 4 categories, 12 menu items, 6 orders |

---

## P0-1 — Kitchen UI matches order-level backend

### Problem
Kitchen showed per-item **Başla / Hazır** buttons and a fake priority toggle, but the API updates **order** status only (`open` → `in_kitchen` → `partially_served`).

### Solution
- Removed item-level actions, priority badge/toggle, and optimistic per-item mutations.
- Added order-level status badge and actions: **Hazırlamaya Al** (pending → preparing) and **Sipariş Hazır** (preparing → ready).
- Stats and filters now count/filter by **order status**, not item status.

### Files modified
- `src/hooks/useKitchen.js`
- `src/pages/Kitchen.jsx`
- `src/pages/Kitchen.module.css`

### Before / After

| Aspect | Before | After |
|--------|--------|-------|
| Item rows | Action buttons per line item | Read-only line list (qty + name + notes) |
| Status model | Fake per-item status mirrored from order | Single order status chip (Bekliyor / Hazırlanıyor / Hazır) |
| Actions | Başla, Hazır, Tümü Hazır, priority toggle | Hazırlamaya Al OR Sipariş Hazır (one per card) |
| API calls | `updateStatus` triggered per item click | `updateStatus` only on order-level buttons |
| Stats | Item counts | Order counts by kitchen status |

---

## P0-2 — Realistic first-run demo seed data

### Problem
Seed created one category, one menu item, one table, and no orders — Dashboard/Kitchen/Orders felt empty on first demo.

### Solution
- Added idempotent demo seed module with believable Turkish restaurant data.
- Restaurant: **Lezzet Durağı**
- 4 tables (`qr-masa-1` … `qr-masa-4`)
- 4 categories, 12 menu items with TRY prices
- 6 orders: 2 pending, 1 preparing, 1 ready, 2 completed (history)

### Files modified
- `api/scripts/lib/demo-seed.mjs` *(new)*
- `api/scripts/seed-demo-data.mjs` *(new)*
- `api/scripts/dev-db.mjs` — uses shared seed (no longer skips when restaurant exists)
- `api/package.json` — added `"seed:demo": "node scripts/seed-demo-data.mjs"`

### Before / After

| Dataset | Before | After |
|---------|--------|-------|
| Restaurant | Akıllı Garson Demo | Lezzet Durağı |
| Tables | 1 (Masa 1) | 4 (Masa 1–4) |
| Categories | 1 | 4 (Başlangıçlar, Ana Yemekler, İçecekler, Tatlılar) |
| Menu items | 1 (Izgara Köfte) | 12 (çorba, kebap, lahmacun, içecek, tatlı…) |
| Orders | 0 | 6 (mixed kitchen queue + completed) |
| Re-run behavior | Skipped if restaurant exists | Idempotent upsert — safe to re-run |

### How to apply
```bash
cd api
npm run seed:demo
```

---

## P0-3 — AG monogram favicon

### Problem
Browser tab showed default Vite icon.

### Solution
- Created `public/favicon.svg` — blue `#2563eb` rounded square with **AG** monogram.
- Updated `index.html` and `public/manifest.webmanifest`.
- Simplified document title to **Akıllı Garson**.

### Files modified
- `public/favicon.svg` *(new)*
- `index.html`
- `public/manifest.webmanifest`

### Before / After

| Asset | Before | After |
|-------|--------|-------|
| Favicon | `/vite.svg` | `/favicon.svg` (AG monogram) |
| Apple touch icon | `/vite.svg` | `/favicon.svg` |
| PWA manifest icon | `/vite.svg` | `/favicon.svg` |
| `<title>` | Akıllı Garson — Restaurant Management Platform | Akıllı Garson |

---

## P0-4 — Professional product language

### Problem
Live screens exposed developer copy (“Demo veritabanı”, duplicate errors, “API henüz desteklenmiyor”, “NestJS'e taşınmadı”) that reduced buyer confidence.

### Solution
- **Menu.jsx:** Removed duplicate error line; replaced empty-state “Demo veritabanı” text with product language.
- **services.js:** Replaced all user-visible stub/toast error strings with neutral Turkish messages (e.g. “şu an kullanılamıyor”). Internal comment renamed from “LEGACY STUBS (henüz NestJS yok)” to “ROADMAP MODULE STUBS”.

### Files modified
- `src/pages/Menu.jsx`
- `src/api/services.js`

### Before / After (examples)

| Location | Before | After |
|----------|--------|-------|
| Menu empty state | “Demo veritabanında kategori oluşturulduğundan emin olun” | “Yönetim panelinden kategori ekleyebilirsiniz” |
| Menu error | Two duplicate “Menü yüklenemedi” lines | Single professional error message |
| Menu API toasts | “Ürün silme API üzerinden henüz desteklenmiyor” | “Ürün silme şu an kullanılamıyor” |
| Roadmap stubs | “Masalar API henüz NestJS'e taşınmadı” | “Masalar modülü şu an kullanılamıyor” |

**Note:** Orphan pages (`Tables.jsx`, `Inventory.jsx`, etc.) still contain old copy but are **not routed** in Demo Edition. Roadmap module preview pages intentionally reference “Demo Edition” as the product SKU name.

---

## P0-5 — Hide VoiceCommand entry point

### Problem
Header microphone button implied voice ordering was in scope.

### Solution
Removed `<VoiceCommand />` import and render from the staff layout header.

### Files modified
- `src/components/Layout/Layout.jsx`

### Before / After

| Location | Before | After |
|----------|--------|-------|
| Staff header | Microphone / voice command button | Removed — clock and notifications only |

---

## P0-6 — Remove fake payment / fee calculations

### Problem
Customer cart showed 10% service fee and a payment-method flow not backed by API. Order detail modal fabricated 90/10 subtotal split.

### Solution
- **CustomerMenu:** Cart shows **Toplam** only (sum of line items). Removed “Hesap İste”, payment method picker, and “Ödemeyi Tamamla”.
- **CustomerOrders:** Detail modal shows single **Toplam** from API (`order.total`).

### Files modified
- `src/pages/customer/CustomerMenu.jsx`
- `src/pages/customer/CustomerOrders.jsx`

### Before / After

| Screen | Before | After |
|--------|--------|-------|
| Customer cart | Ara Toplam + Servis Ücreti (%10) + Toplam | Toplam only |
| Customer cart footer | Hesap İste + Sipariş Ver + payment modal | Sipariş Ver only |
| Order detail modal | Fake 90% subtotal + 10% service fee + total | Toplam from API |

---

## Files modified (complete list)

| File | P0 |
|------|-----|
| `api/scripts/lib/demo-seed.mjs` | 2 |
| `api/scripts/seed-demo-data.mjs` | 2 |
| `api/scripts/dev-db.mjs` | 2 |
| `api/package.json` | 2 |
| `public/favicon.svg` | 3 |
| `index.html` | 3 |
| `public/manifest.webmanifest` | 3 |
| `src/hooks/useKitchen.js` | 1 |
| `src/pages/Kitchen.jsx` | 1 |
| `src/pages/Kitchen.module.css` | 1 |
| `src/pages/Menu.jsx` | 4 |
| `src/api/services.js` | 4 |
| `src/components/Layout/Layout.jsx` | 5 |
| `src/pages/customer/CustomerMenu.jsx` | 6 |
| `src/pages/customer/CustomerOrders.jsx` | 6 |

**Total:** 15 files (2 new)

---

## Screenshots that should be updated

Re-capture after seed + UI changes (`npm run screenshots` with API and frontend running):

| Screenshot | Why update |
|------------|------------|
| `docs/screenshots/login.png` | Browser tab favicon (AG monogram) |
| `docs/screenshots/dashboard.png` | Populated metrics from seeded orders |
| `docs/screenshots/orders.png` | Multiple orders in mixed/completed states |
| `docs/screenshots/kitchen.png` | Order-level actions (no per-item buttons) |
| `docs/screenshots/menu.png` | Full 4-category menu grid |
| `docs/screenshots/customer-menu.png` | Rich menu + simplified cart (no service fee) |
| `docs/screenshots/customer-orders.png` | Seeded order history; honest total in detail |

**Also update:** Any README or docs embedding `vite.svg` or old Kitchen/customer-cart UI.

**Capture script note:** `scripts/capture-screenshots.mjs` should set `tableToken: 'qr-masa-1'` in customer `localStorage` (not only `tableId`) so customer menu screenshots load the public API correctly.

---

## Remaining P1 backlog

From `docs/RC1_PRODUCT_EXPERIENCE_AUDIT.md` — **not implemented in this sprint**:

| # | Item | Why it remains |
|---|------|----------------|
| 8 | Unify loading states (skeleton on Orders/Kitchen) | P1 polish |
| 9 | Unify empty/error states with `EmptyState` | P1 polish |
| 10 | Remove duplicate page `h1` (layout owns title) | P1 hierarchy |
| 11 | Login placeholder → `ahmet@restoran.com`; tone down emoji | P1 first-screen polish |
| 12 | Payment modal demo badge (if payment UI returns) | P1 — payment UI removed in P0-6 |
| 13 | Sidebar IA — collapse or de-emphasize roadmap section | P1 navigation |
| 14 | README screenshots match current UI | P1 GitHub impression |
| 15 | Resolve Ctrl+K conflict (Command Palette vs Kitchen shortcut) | P1 keyboard UX |

### P2 (deferred)
Branded splash loader, staff footer version line, initials avatars, i18n cleanup, table names instead of UUID tails, dark mode QA, hide “Garson Çağır” until API exists.

---

## Demo path recommendation (post-P0)

1. Run `npm run seed:demo` in `api/`
2. Login → Dashboard (live metrics)
3. Kitchen → show order-level **Hazırlamaya Al** / **Sipariş Hazır**
4. Orders → mixed statuses including completed
5. Menu → 12 items across 4 categories
6. Customer QR `?token=qr-masa-1` → order without fake fees
7. Avoid roadmap sidebar items during a 10-minute interview demo

---

*Generated as part of RC1 Release Manager P0 sprint.*
