# Repository Cleanup Report — RC1

**Date:** 2026-07-05  
**Plan:** [`REPOSITORY_CLEANUP_PLAN.md`](./REPOSITORY_CLEANUP_PLAN.md)  
**Status:** Safe cleanup executed

---

## Summary

The repository was prepared for public GitHub review. The largest issue was **~19,630 tracked `node_modules` files** plus build artifacts and a tracked `.env`. Those are now gitignored and removed from the index. Outdated mock-API documentation was archived; README and scripts were aligned with the NestJS + Prisma stack.

| Metric | Before | After |
|--------|--------|-------|
| Tracked files (approx.) | ~20,040 | **362** |
| Active `docs/*.md` at root | 22 | **14** (+ index + 2 cleanup docs) |
| Archived docs | 0 | **8** |
| json-server in `package-lock.json` | Yes (orphan) | **No** |
| Root `.gitignore` | Missing | **Added** |

---

## Files removed

| Path | Type |
|------|------|
| `public/vite.svg` | Obsolete favicon (replaced by `favicon.svg`) |
| `start-servers.bat` | Legacy json-server launcher (`npm run server` does not exist) |
| `docs/screenshots/tables.png` | Screenshot of removed `/tables` route |
| `docs/screenshots/analytics.png` | Screenshot of non-existent `/analytics` route |

### Untracked from git (still on disk locally where applicable)

| Path | Count | Notes |
|------|------:|-------|
| `node_modules/` | ~19,630 files | Now in `.gitignore` |
| `dist/` | 43 files | Build output — regenerate with `npm run build` |
| `.env` | 1 | Use `.env.example` templates |

---

## Files archived

Moved to `docs/archive/`:

| File | Reason |
|------|--------|
| `TAM-RAPOR.md` | Mock API (`db.json`) era comprehensive report |
| `TEKNIK-DURUM.md` | Outdated technical status |
| `PROJE-RAPORU.md` | Outdated executive summary |
| `DOMAIN-ANALIZI.md` | Domain analysis from json-server collections |
| `DEMO_AUDIT.md` | Superseded by `RC1_RUNTIME_AUDIT.md` |
| `DEMO_READY_REPORT.md` | Superseded by `RC1_STABILIZATION_REPORT.md` |
| `DEMO_UX_REPORT.md` | Historical UX sprint |
| `PRODUCT_POLISH_REPORT.md` | Historical polish sprint |

Index: [`docs/archive/README.md`](./archive/README.md)

---

## Files kept intentionally

### Source & tooling
- Full `src/` and `api/` trees — no business logic changes
- `src/components/VoiceCommand.jsx` — unused but complete; not imported (P0 hide only)
- `src/pages/Tables.jsx`, `Inventory.jsx`, etc. — not routed; kept as portfolio artifacts
- `scripts/debug-browser.mjs` — dev smoke helper
- `scripts/rc1-runtime-audit.mjs` — active QA script
- `api/scripts/dev-db.mjs`, `*.vbs` — Windows embedded PostgreSQL helpers

### Documentation (active)
- `README.md`, `api/README.md`
- `docs/README.md` — **new** documentation index
- Architecture: `MIMARI-TASARIM.md`, `BACKEND-ISKELET.md`, `IS-KURALLARI.md`, menu docs
- Portfolio: `MASTER-PROJECT-REPORT.md`, `YOL-HARITASI.md`
- RC1: `RC1_*.md`, `rc1-audit-results.json`
- Meta: `DOCUMENTATION_REVIEW.md`

### Screenshots retained
`login`, `dashboard`, `orders`, `kitchen`, `menu`, `customer-login`, `customer-menu`, `customer-orders` — refresh recommended via `npm run screenshots` after RC1 UI changes.

---

## README updates

| Area | Change |
|------|--------|
| Status badge | `MVP / Demo` → `RC1 Demo` |
| Architecture evolution | Removed json-server-centric diagram; NestJS-first timeline |
| Project overview | Removed “json-server prototype still present” framing |
| Seed instructions | `node scripts/dev-db.mjs` → `npm run seed:demo` (from `api/`) |
| Demo data table | Added Lezzet Durağı, 4 table tokens |
| Further reading | Points to `docs/README.md`; removed stale `DOMAIN-ANALIZI` link |
| CTO questions | json-server sidebar question → roadmap modules question |
| Lessons learned | Generic “legacy REST shapes” wording |

---

## Other updates

| File | Change |
|------|--------|
| `api/README.md` | Lists live modules; documents `seed:demo` |
| `public/sw.js` | PWA cache uses `/favicon.svg` |
| `scripts/capture-screenshots.mjs` | Live routes only; `tableToken` for customer flow |
| `docs/MIMARI-TASARIM.md` | Links → archive + master report |
| `docs/IS-KURALLARI.md` | Footer links updated |
| `docs/BACKEND-ISKELET.md` | Archive link for domain analysis |
| `docs/YOL-HARITASI.md` | Footer links updated |
| `docs/MENU-DOMAIN-TASARIMI.md` | Archive link for domain analysis |
| `.gitignore` | **New** — node_modules, dist, .env, coverage, IDE |
| `package-lock.json` | Regenerated — **json-server removed** |

---

## Repository health score

| Dimension | Before | After | Notes |
|-----------|--------|-------|-------|
| **Git hygiene** | 2/10 | 9/10 | node_modules/dist/.env untracked |
| **Doc accuracy** | 5/10 | 8/10 | Mock-era docs archived; README aligned |
| **Onboarding clarity** | 6/10 | 9/10 | Correct seed command, doc index |
| **Security** | 4/10 | 8/10 | `.env` no longer tracked |
| **Reproducibility** | 7/10 | 8/10 | Lockfile cleaned |
| **Overall health** | **4.8/10** | **8.4/10** | |

*Git **history** may still contain old `node_modules` blobs from prior commits. Shrinking clone size requires an optional `git filter-repo` pass before public release.*

---

## GitHub presentation score

| Dimension | Before | After | Notes |
|-----------|--------|-------|-------|
| First impression (file tree) | 3/10 | 9/10 | ~362 files vs ~20k |
| README credibility | 7/10 | 9/10 | Current stack, RC1 framing |
| Documentation discoverability | 5/10 | 9/10 | `docs/README.md` index |
| Asset professionalism | 6/10 | 8/10 | AG favicon; stale screenshots flagged |
| Portfolio signal | 8/10 | 9/10 | NestJS DDD backend clearly primary |
| **Overall presentation** | **5.8/10** | **8.8/10** | |

---

## Recommended follow-ups (not done in this sprint)

1. Re-capture screenshots: `npm run screenshots` (API + frontend running)
2. Add `LICENSE` file (README references MIT)
3. Optional: `git filter-repo` to purge historical `node_modules` from git history
4. Refresh `MASTER-PROJECT-REPORT.md` json-server sections when time permits (kept as deep-dive; partially historical)
5. Commit cleanup as a single `chore: repository cleanup for RC1` when ready

---

*Cleanup performed per RC1 release preparation. No architecture or business logic changes.*
