# Branding Audit Report

**Date:** 2026-07-05  
**Repository:** [github.com/asliq/akilli-garson](https://github.com/asliq/akilli-garson)  
**Product:** Akıllı Garson  
**Subtitle:** Restaurant Management Platform

---

## Canonical branding

| Field | Value |
|-------|-------|
| **Product name** | Akıllı Garson |
| **Product subtitle** | Restaurant Management Platform |
| **Repository slug** | `akilli-garson` |
| **GitHub URL** | `https://github.com/asliq/akilli-garson` |
| **Frontend package** | `akilli-garson` (v2.0.0) |
| **API package** | `akilli-garson-api` (v0.1.0) |
| **Edition badge** | Demo Edition |
| **Demo restaurant** | Lezzet Durağı |

---

## Updated references

### Root & package metadata

| File | Before | After |
|------|--------|-------|
| `README.md` | Title only; `YOUR_USERNAME` clone/GitHub links | Subtitle **Restaurant Management Platform**; GitHub badge; `github.com/asliq/akilli-garson` |
| `README.md` | Project overview without product name | Names **Akıllı Garson** as Restaurant Management Platform demo |
| `package.json` | No `description` / `repository` | Added description + `repository.url` → `akilli-garson` |
| `api/package.json` | `Production NestJS API` | `Restaurant Management Platform API` + repository URL |
| `index.html` | Title `Akıllı Garson`; generic meta description | Title `Akıllı Garson — Restaurant Management Platform`; Open Graph + Twitter metadata |
| `public/manifest.webmanifest` | `short_name: Garson`; TR-only description | Full product name + subtitle in `name` / `description` |

### Backend

| File | Before | After |
|------|--------|-------|
| `api/README.md` | `restaurant POS / QR ordering system` | **Restaurant Management Platform** positioning |
| `api/src/main.ts` | Swagger: `Restaurant POS & QR Ordering System — Production API` | `Akıllı Garson — Restaurant Management Platform API` |
| `api/src/modules/public/.../public-menu-api.examples.ts` | `Akıllı Garson Restoran` | `Lezzet Durağı` (matches demo seed) |
| `api/src/modules/public/.../public-menu.response.dto.ts` | `@ApiProperty` example `Akıllı Garson Restoran` | `Lezzet Durağı` |

### Frontend application

| File | Before | After |
|------|--------|-------|
| `src/config/modules.js` | `tagline: Restoran Yönetim Platformu`; no version | `tagline` + `version: 2.0.0` aligned with subtitle |
| `src/pages/Settings.jsx` | `v1.0.0`; `Modern restoran yönetim sistemi` | `v{DEMO_EDITION.version}`; `DEMO_EDITION.productSubtitle` |
| `src/pages/DailyReport.jsx` | Footer `Akıllı Garson POS` | `Akıllı Garson — Restaurant Management Platform` |
| `src/utils/printUtils.js` | `Restoran Yönetim Sistemi` / POS comment | **Restaurant Management Platform** |
| `src/index.css` | `PROFESSIONAL POS SYSTEM` header | `AKILLI GARSON — Restaurant Management Platform` |
| `src/components/CommandPalette.module.css` | `Professional POS` | `Akıllı Garson` |
| `src/components/LiveClock.module.css` | `Professional POS Widget` | `Akıllı Garson` |
| `src/components/NotificationProvider.module.css` | `Professional POS System` | `Akıllı Garson` |

### Documentation

| File | Before | After |
|------|--------|-------|
| `docs/EXECUTIVE_SUMMARY.md` | `Akıllı Garson (Smart Waiter)` | `Akıllı Garson — Restaurant Management Platform` |
| `docs/EXECUTIVE_SUMMARY.md` | `full-stack restaurant operations platform` | **Restaurant Management Platform** |
| `docs/MASTER_PROJECT_REPORT.md` | `Smart Waiter` / `restaurant operations platform` | **Restaurant Management Platform** |
| `docs/README.md` | Generic entry point | Subtitle + links to screenshot & branding guides |
| `docs/SCREENSHOT_GUIDE.md` | Capture settings only | Added product + repository rows |

---

## Already consistent (no change)

| Item | Value | Notes |
|------|-------|-------|
| `src/config/modules.js` | `productName`, `productSubtitle`, `footer` | Single source of truth for UI branding |
| `src/components/Layout/Layout.jsx` | Uses `DEMO_EDITION` | Sidebar / header badges |
| `src/pages/Login.jsx` | Uses `DEMO_EDITION` | Login hero |
| `src/config/navigation.js` | Breadcrumb `Akıllı Garson` | — |
| `public/sw.js` | Cache `akilli-garson-v1` | Technical cache key (repo slug) |
| `public/favicon.svg` | Branded favicon | RC1 asset |
| Docker / DB identifiers | `akilli_garson`, `akilli-garson-postgres` | Infrastructure names — not user-facing product copy |
| README screenshots | Titled gallery under `docs/assets/screenshots/` | Captions use screen names aligned with product |

---

## Intentionally not updated

| Location | Reason |
|----------|--------|
| `docs/archive/**` | Historical reports (json-server era, superseded audits) — preserved as archive |
| `dist/**` | Build output; regenerated on `npm run build` |
| `node_modules/**` | Third-party packages |
| Domain terms `POS`, `POST`, payment POS | Industry/API terminology — not product naming |
| README Author placeholders | `your-profile`, `your.email@example.com` — personal contact, not product branding |
| Local `git remote` | Still points to legacy `github.com/asliq/Ak-ll--Garson.git` — update manually: `git remote set-url origin https://github.com/asliq/akilli-garson.git` |

---

## Branding checklist (post-audit)

- [x] Product name: **Akıllı Garson**
- [x] Subtitle: **Restaurant Management Platform**
- [x] Repository slug: **akilli-garson**
- [x] GitHub links in README / package.json
- [x] Browser `<title>` and meta / Open Graph
- [x] PWA manifest name & description
- [x] Swagger API title & description
- [x] Settings about / version (2.0.0)
- [x] Print & report footers
- [x] API examples use demo restaurant name
- [x] Primary technical docs (Executive Summary, Master Report)
- [x] Screenshot guide metadata

---

## Regenerate affected build artifacts

After pulling these changes, rebuild the frontend so `dist/` reflects updated `index.html` and manifest:

```bash
npm run build
```

Swagger UI picks up `api/src/main.ts` changes on next API restart.

---

## Related

- [Screenshot Guide](./SCREENSHOT_GUIDE.md)
- [Repository README](../README.md)
- [Module registry / DEMO_EDITION](../src/config/modules.js)
