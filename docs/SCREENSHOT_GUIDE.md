# Screenshot Guide

Documentation for the README screenshot set under `docs/assets/screenshots/`.

## Capture settings

| Setting | Value |
|---------|-------|
| **Resolution** | 1440 × 900 |
| **Device scale** | 1× |
| **Theme** | Light (`data-theme=light`, staff + customer flows) |
| **Browser** | Chromium (headless) via Playwright |
| **Product** | Akıllı Garson — Restaurant Management Platform |
| **Repository** | [github.com/asliq/akilli-garson](https://github.com/asliq/akilli-garson) |
| **Capture date** | 2026-07-05 |
| **Screenshots updated** | 2026-07-05 |

## Seed data

| Field | Value |
|-------|-------|
| **Command** | `cd api && npm run seed:demo` |
| **Seed version** | RC1 demo seed (`api/scripts/lib/demo-seed.mjs`) |
| **Restaurant** | Lezzet Durağı |
| **Restaurant ID** | `660e8400-e29b-41d4-a716-446655440001` |
| **Table token** | `qr-masa-1` |
| **Dataset** | 4 tables · 4 categories · 12 menu items · 6 orders |

## Screenshot inventory

| File | Screen |
|------|--------|
| `01-login.png` | Staff login — Demo Edition branding |
| `02-dashboard.png` | Dashboard — revenue, active orders, kitchen queue |
| `03-menu-management.png` | Menu management — categories and product grid |
| `04-orders.png` | Order management — status filters and order cards |
| `05-kitchen.png` | Kitchen display — active tickets by status |
| `06-customer-menu.png` | Customer QR menu — table session |
| `07-swagger.png` | OpenAPI / Swagger UI |
| `08-system-health.png` | System health — API, database, WebSocket |

## Prerequisites

1. **PostgreSQL** running (Docker Compose or local).
2. **API** on port `3001`: `cd api && npm run start:dev`
3. **Frontend** on port `5173`: `npm run dev` (must match API `CORS_ORIGIN`).
4. **Demo seed** applied (the capture script runs this automatically).

## Regenerate screenshots

From the repository root:

```bash
npm run screenshots:readme
```

This will:

1. Run `npm run seed:demo` in `api/`
2. Connect to `http://localhost:5173`
3. Save eight PNG files to `docs/assets/screenshots/`

### Notes

- **No browser chrome** — Playwright captures the viewport only (no address bar or bookmarks).
- **No dev overlays** — React Query devtools, command-palette hint, and the dev performance monitor are hidden during capture.
- **Production preview** — If you use `vite preview` on a port other than `5173`, add that origin to `CORS_ORIGIN` in `api/.env` so API calls succeed.
- **Login theme** — The login screen uses a dedicated dark hero layout; staff and customer flows use the light theme.

## Related

- [README Screenshots section](../README.md#screenshots)
- [RC1 P0 completion report](./RC1_P0_COMPLETION_REPORT.md)
- [Demo seed source](../api/scripts/lib/demo-seed.mjs)
