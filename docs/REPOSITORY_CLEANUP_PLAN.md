# Repository Cleanup Plan — RC1

**Date:** 2026-07-05  
**Role:** Principal Engineer / Open Source Maintainer review  
**Goal:** Prepare the repository for public GitHub review without changing business logic or architecture.

---

## Executive summary

The codebase is functionally on NestJS + PostgreSQL, but the **git tree still looks like a local dev workspace**: ~19,630 tracked `node_modules` files, 43 tracked `dist/` build artifacts, a tracked `.env`, obsolete json-server launcher scripts, duplicate/outdated documentation, and stale README references.

**Highest-impact safe actions:** add root `.gitignore`, untrack generated/vendor artifacts, archive pre-NestJS documentation, remove legacy assets, tighten README to current architecture.

---

## 1. Files safe to remove

| File / path | Reason | Referenced? |
|-------------|--------|-------------|
| `public/vite.svg` | Replaced by `public/favicon.svg` (RC1 P0-3) | Only `public/sw.js` (will update) |
| `start-servers.bat` | Starts `npm run server` (json-server) — script no longer exists | Not referenced in docs/scripts |
| `docs/screenshots/tables.png` | `/tables` route removed; sidebar uses roadmap | README lists live screens only |
| `docs/screenshots/analytics.png` | `/analytics` not a live route | capture script only |

**Untrack from git (keep locally, add to `.gitignore`):**

| Path | Files | Reason |
|------|------:|--------|
| `node_modules/` | ~19,630 | Must never be committed |
| `dist/` | 43 | Vite build output |
| `.env` | 1 | Secrets / local config; `.env.example` remains |

---

## 2. Files to archive

Move to `docs/archive/` — historical value, but describe **obsolete json-server / mock API** implementation or superseded sprint reports.

| File | Why archive |
|------|-------------|
| `docs/TAM-RAPOR.md` | Full report centered on `db.json` + json-server |
| `docs/TEKNIK-DURUM.md` | Technical status for mock API era |
| `docs/PROJE-RAPORU.md` | Project report for mock API era |
| `docs/DOMAIN-ANALIZI.md` | Domain analysis sourced from `db.json` / `server/index.js` |
| `docs/DEMO_AUDIT.md` | Superseded by `RC1_RUNTIME_AUDIT.md` |
| `docs/DEMO_READY_REPORT.md` | Superseded by `RC1_STABILIZATION_REPORT.md` |
| `docs/DEMO_UX_REPORT.md` | Historical UX sprint (Demo Edition IA) |
| `docs/PRODUCT_POLISH_REPORT.md` | Historical polish sprint |

`docs/archive/README.md` will explain archive purpose and current doc entry points.

**Cross-link updates required** in kept docs (`MIMARI-TASARIM.md`, `IS-KURALLARI.md`, `BACKEND-ISKELET.md`, `YOL-HARITASI.md`) → point to `archive/` paths.

---

## 3. Files to keep

### Root & application source
| Path | Reason |
|------|--------|
| `src/` | Active React SPA (live + roadmap pages) |
| `api/` | NestJS backend — primary engineering artifact |
| `public/` | PWA assets (`favicon.svg`, `sw.js`, manifest) |
| `scripts/` | `capture-screenshots.mjs`, `rc1-runtime-audit.mjs` (active QA) |
| `scripts/debug-browser.mjs` | Lightweight Playwright smoke helper — keep |
| `index.html`, `vite.config.js`, `package.json` | Frontend toolchain |
| `.env.example`, `api/.env.example` | Setup templates |

### Documentation (current / RC1)
| File | Role |
|------|------|
| `README.md` | Primary entry — **needs update** |
| `api/README.md` | Backend quick start — **minor update** |
| `docs/README.md` | *(new)* Documentation index |
| `docs/BACKEND-ISKELET.md` | NestJS skeleton reference |
| `docs/MIMARI-TASARIM.md` | Architecture design (current stack) |
| `docs/IS-KURALLARI.md` | Domain business rules |
| `docs/MENU-DOMAIN-TASARIMI.md` | Menu bounded context design |
| `docs/MENU-DATABASE-TASARIMI.md` | Menu DB design |
| `docs/MENU-CREATE-CATEGORY-USE-CASE.md` | Use-case specification |
| `docs/MENU-PRISMA-M1-RAPOR.md` | Prisma M1 migration report |
| `docs/MASTER-PROJECT-REPORT.md` | Deep-dive portfolio report (linked from README) |
| `docs/YOL-HARITASI.md` | Product roadmap |
| `docs/DOCUMENTATION_REVIEW.md` | Vendor-neutrality meta review |
| `docs/RC1_*.md` | Release candidate audits & P0 completion |
| `docs/rc1-audit-results.json` | Machine-readable audit output |
| `docs/screenshots/*.png` | Demo assets (refresh after RC1 — keep `.gitkeep`) |

### Intentionally kept (not routed / dead but not harmful)
| Path | Reason |
|------|--------|
| `src/components/VoiceCommand.jsx` | Out of scope but complete component; no import — keep (no logic change) |
| `src/pages/Tables.jsx`, `Inventory.jsx`, etc. | Legacy UI sources; not routed — portfolio history |
| `api/scripts/dev-db.mjs`, `*.vbs` | Windows embedded PostgreSQL dev helpers |

---

## 4. Duplicate documentation

| Topic | Duplicates | Resolution |
|-------|------------|------------|
| **Full project status** | `TAM-RAPOR.md`, `PROJE-RAPORU.md`, `TEKNIK-DURUM.md`, `MASTER-PROJECT-REPORT.md` | Keep `MASTER-PROJECT-REPORT.md`; archive the three mock-era reports |
| **Domain model** | `DOMAIN-ANALIZI.md` vs `IS-KURALLARI.md` + `MENU-DOMAIN-TASARIMI.md` | Archive `DOMAIN-ANALIZI.md`; keep rule-focused docs |
| **Demo / QA audits** | `DEMO_AUDIT.md`, `DEMO_READY_REPORT.md` vs `RC1_RUNTIME_AUDIT.md`, `RC1_STABILIZATION_REPORT.md` | Archive DEMO_* ; keep RC1_* |
| **UX polish** | `DEMO_UX_REPORT.md`, `PRODUCT_POLISH_REPORT.md` vs `RC1_PRODUCT_EXPERIENCE_AUDIT.md` | Archive sprint reports; keep RC1 audit |
| **README vs api/README** | Both describe setup | Keep both — different audiences; dedupe commands only |

---

## 5. Legacy artifacts

| Artifact | Status | Action |
|----------|--------|--------|
| json-server | Removed from `package.json`; stale in `package-lock.json` | Regenerate lock via `npm install` |
| `server/` + `db.json` | Not on disk / not tracked | None |
| `start-servers.bat` | References `npm run server` | **Remove** |
| `public/vite.svg` | Old favicon | **Remove** after `sw.js` update |
| `dist/vite.svg` | Build artifact | Untrack entire `dist/` |
| Tracked `node_modules/` | Accidental commit | Untrack + `.gitignore` |
| Tracked `.env` | Security risk | Untrack |
| `package-lock.json` json-server entry | Orphan lock entry | Refresh lockfile |
| Screenshot `tables.png`, `analytics.png` | Obsolete routes | **Remove** |
| `capture-screenshots.mjs` | Lists `/tables`, `/analytics`; missing `tableToken` | **Update** to live routes |

---

## 6. Estimated repository simplification

| Metric | Before | After (estimated) |
|--------|--------|-------------------|
| Tracked files | ~20,040 | ~400–450 |
| `docs/` markdown (root) | 22 files | 14 active + 8 archived + index |
| Top-level clutter | `dist/`, tracked deps, legacy `.bat` | Clean root: `api/`, `src/`, `docs/`, `public/`, `scripts/` |
| README accuracy | json-server timeline, wrong seed path | NestJS-first, `npm run seed:demo` |
| Clone size (git) | Very large (node_modules in history*) | Working tree clean; *history shrink needs optional `git filter-repo` later |

**GitHub first impression:** moves from “accidental monorepo + vendor dump” to “professional full-stack portfolio.”

---

## 7. Planned safe execution (this sprint)

1. Add root `.gitignore`
2. `git rm --cached` for `node_modules/`, `dist/`, `.env`
3. Create `docs/archive/` and move 8 obsolete docs
4. Add `docs/README.md` + `docs/archive/README.md`
5. Update cross-links in kept architecture docs
6. Remove `public/vite.svg`, `start-servers.bat`, obsolete screenshots
7. Update `public/sw.js` favicon cache list
8. Update `README.md` (architecture, seed command, RC1 status, doc links)
9. Update `api/README.md` (modules, `seed:demo`)
10. Update `scripts/capture-screenshots.mjs` for live routes
11. Run `npm install` to refresh lockfile (drop json-server orphan)
12. Write `docs/REPOSITORY_CLEANUP_REPORT.md`

**Explicitly out of scope:** deleting `src/` legacy pages, rewriting `MASTER-PROJECT-REPORT.md`, git history rewrite, adding LICENSE file.

---

*Plan generated before any destructive action. Execution follows “archive over delete” and “when uncertain, keep.”*
