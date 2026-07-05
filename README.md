<div align="center">

# Akıllı Garson

**Full-stack restoran operasyon platformu — DDD, modular monolith ve realtime üzerine kişisel mühendislik çalışması**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./package.json)
[![API](https://img.shields.io/badge/API-0.1.0-555.svg)](./api/package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#license)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/Backend-TypeScript-3178C6?logo=typescript&logoColor=white)](./api/)
[![Status](https://img.shields.io/badge/status-RC1%20Demo-blue.svg)](#current-limitations)

[Overview](#project-overview) · [Metrics](#project-metrics) · [Mimari](#architecture) · [Kurulum](#installation) · [Deep Dive](./docs/MASTER-PROJECT-REPORT.md)

### Highlights

| | |
|---|---|
| ✔ | Built entirely by one developer |
| ✔ | React + NestJS + PostgreSQL + Prisma |
| ✔ | DDD · Clean Architecture · Modular Monolith |
| ✔ | Domain Events → WebSocket realtime |
| ✔ | Multi-tenant ready schema (`restaurantId`) |
| ✔ | QR Ordering · Kitchen Display · Swagger API docs |
| ✔ | Manual CQRS · domain events · repository ports |
| ✔ | Integration test infrastructure (menu module) |

</div>

---

## Project Metrics

| Area | Count |
|------|------:|
| **Backend** (`api/src`) | 178 TypeScript files |
| **Menu module** (DDD reference) | 93 files |
| **Frontend pages** | 16 (`src/pages`) |
| **Frontend hooks** | 19 (`src/hooks`) |
| **Feature modules** | 5 (menu, order, public, health, realtime) |
| **Use cases** | 15 |
| **Domain events** | 13 |
| **REST endpoints** | 16 |
| **Prisma models** | 8 |
| **Database migrations** | 3 |
| **Integration tests** (menu) | 10 |

---

### What works today

End-to-end, locally runnable flows — no mock API for these:

| | |
|---|---|
| ✔ | **QR Menu** — `GET /public/menu/:tableToken` |
| ✔ | **Customer Ordering** — `POST /public/orders` |
| ✔ | **Kitchen Screen** — active orders via NestJS orders API |
| ✔ | **Order Management** — list, filter, status transitions |
| ✔ | **Menu Management** — categories, items, price updates |
| ✔ | **WebSocket** — `order.created`, `order.updated`, room-based broadcast |
| ✔ | **Swagger** — `http://localhost:3001/docs` |

> Tables, payments, inventory, reservations — UI exists, **backend not implemented**. See [Current Limitations](#current-limitations).

---

## Why I Built This Project

This is not a tutorial CRUD exercise.

I built Akıllı Garson to **practice how real product backends are structured** — using restaurant operations (QR ordering, kitchen flow, menu pricing) as a domain with actual constraints: concurrent updates, tenant isolation, order state machines, and live notifications.

Concrete learning goals:

- **Domain-Driven Design** — aggregates, value objects, domain events, invariants
- **Clean Architecture** — presentation / application / domain / infrastructure separation
- **NestJS modular monolith** — bounded contexts without premature microservices
- **WebSocket** — domain events bridged to client rooms
- **Multi-tenant data modeling** — `restaurantId` from day one in PostgreSQL
- **Incremental frontend migration** — adapters and feature flags while moving a React SPA to a production API

The restaurant domain gave me **just enough complexity** to make architectural decisions matter — without pretending this is a commercial POS replacement.

---

## Project Overview

### What this project is

A **full-stack engineering portfolio** structured around a restaurant operations domain. The backend is the primary investment: NestJS, Prisma, DDD layers, 8 Prisma models, 3 migrations, WebSocket gateway. The frontend is a React 18 SPA that exercises live APIs; roadmap modules are gated in the sidebar.

| Layer | Stack | Role |
|-------|-------|------|
| **Frontend** | React 18 · Vite 6 · TanStack Query · Zustand | Staff panel + customer QR flow |
| **Backend** | NestJS 11 · TypeScript · Prisma 6 | Modular monolith, 5 feature modules |
| **Data** | PostgreSQL 16 · Redis 7 | ACID orders, tenant-scoped rows |

### Engineering focus

| Area | What was built |
|------|----------------|
| **Menu bounded context** | Full 4-layer DDD — reference implementation |
| **Order bounded context** | Create (public QR) + status machine + snapshot lines |
| **Realtime** | `OrderRealtimeHandler` — domain event → WebSocket rooms |
| **Multi-tenant schema** | `Restaurant` root, `restaurantId` on all business tables |
| **API contract** | Standard response envelope, Swagger, `class-validator` DTOs |
| **Frontend migration** | `API_ENABLED` flags — honest disable for unimplemented modules |

### Domain context (why restaurant?)

Restaurant dine-in flow forces real design questions: How do you snapshot menu prices on an order? How does kitchen see state without a separate `kitchenOrders` table? How does a QR token resolve to a tenant? These are the problems the codebase actually solves today — not a generic todo app.

---

## Architecture Evolution

How the codebase reached its current shape (solo development, approximate phases):

```mermaid
flowchart TD
    A[React SPA<br/>Staff + customer UI] --> B[NestJS API<br/>Modular monolith]
    B --> C[PostgreSQL + Prisma<br/>8 models, migrations]
    C --> D[DDD refactor<br/>Menu bounded context]
    D --> E[Order + Public API<br/>QR end-to-end flow]
    E --> F[WebSocket realtime<br/>Domain events → rooms]
    F --> G[RC1 Demo Edition<br/>Seed data, honest UI scope]
```

| Phase | What changed |
|-------|----------------|
| React SPA | Staff + customer UI, TanStack Query |
| NestJS bootstrap | Feature modules, DTO validation, Swagger |
| PostgreSQL | Tenant schema, order snapshots, optimistic locking |
| DDD refactor | Menu as reference BC — entities, VOs, use cases, repos |
| Order + Public | Single `Order` aggregate; `tableToken` entry point |
| WebSocket | `OrderRealtimeHandler` decoupled from HTTP use cases |
| RC1 | Demo seed dataset, kitchen honesty, documentation cleanup |

---

## Key Features

| Özellik | Açıklama | Durum |
|---------|----------|-------|
| QR Menü (Public) | `tableToken` ile menü görüntüleme | ✅ **Completed** |
| QR Sipariş | Müşteri self-servis sipariş oluşturma | ✅ **Completed** |
| Sipariş listesi & durum | Staff order management | ✅ **Completed** |
| Menü yönetimi | Kategori, ürün ekleme, fiyat güncelleme | ✅ **Completed** |
| Mutfak ekranı (KDS) | Orders API üzerinden mutfak görünümü | ✅ **Completed** |
| WebSocket realtime | Sipariş oluşturma ve durum güncellemeleri | ✅ **Completed** |
| Dashboard | Orders tabanlı istatistikler | ✅ **Completed** |
| Swagger API docs | OpenAPI dokümantasyonu | ✅ **Completed** |
| Multi-tenant şema | `restaurantId` ile veri izolasyonu (uygulama katmanı) | ✅ **Completed** |
| Staff auth (JWT) | Gerçek kimlik doğrulama | 🔄 **In Progress** (demo PIN) |
| Masalar API | Table CRUD ve durum yönetimi | 📋 **Planned** (UI mevcut, API yok) |
| Ödeme / POS | Payment kaydı ve entegrasyon | 📋 **Planned** |
| Rezervasyon | Reservation modülü | 📋 **Planned** |
| Envanter / Stok | Inventory modülü | 📋 **Planned** |
| Garson çağırma | Service calls API | 📋 **Planned** |
| CI/CD pipeline | Otomatik build ve test | 📋 **Planned** |
| E2E testler | Playwright (kurulu, test yok) | 📋 **Planned** |

> Çalışmayan modüller frontend'de `API_ENABLED` bayrağı ile devre dışı bırakılmış veya bilgilendirme mesajı gösterir.

---

## Screenshots

Capture with `npm run screenshots` (API + frontend running). Save to `docs/screenshots/`.

| Screen | Scenario to capture |
|--------|---------------------|
| **Dashboard** | Staff login → today stats from live orders (revenue, active count) |
| **Menu** | Category filter + item list with price edit state |
| **Orders** | Active orders list with status badges and table ID |
| **Kitchen** | Kitchen display with at least one `preparing` order visible |
| **QR Ordering** | `/customer?token=qr-masa-1` login screen before menu load |
| **Customer Menu** | Public menu with cart badge and category navigation |
| **Swagger** | `http://localhost:3001/docs` — menu + order endpoint groups expanded |

Existing assets (if present): `docs/screenshots/*.png`

---

## Demo

### Demo Scenario

~60 second walkthrough for reviewers:

```mermaid
flowchart LR
    A[QR token<br/>qr-masa-1] --> B[Customer Menu<br/>add items]
    B --> C[Submit Order<br/>POST /public/orders]
    C --> D[Kitchen Screen<br/>new order appears]
    D --> E[Staff updates status<br/>preparing → ready]
    E --> F[Orders screen<br/>status synced]
    F --> G[Mark completed<br/>PATCH status]
```

| Step | Action | Verify |
|------|--------|--------|
| 1 | Open `/customer?token=qr-masa-1` | Menu loads from NestJS public API |
| 2 | Add items → place order | Redirect to customer orders |
| 3 | Open `/kitchen` (staff login) | Order visible in kitchen list |
| 4 | Update status on `/orders` | WebSocket / refetch updates kitchen |
| 5 | Set status `completed` | Order leaves active filters |

### GIF / Live demo

<!-- ![Demo](./docs/demo/demo.gif) -->
`docs/demo/demo.gif` — record the scenario above (not yet committed)

Live URL: _not deployed_

### Local URLs

| Adım | URL / Aksiyon |
|------|----------------|
| Müşteri QR girişi | `http://localhost:5173/customer?token=qr-masa-1` |
| Staff girişi | `http://localhost:5173/login` |
| Swagger | `http://localhost:3001/docs` |
| Health check | `http://localhost:3001/api/v1/health/live` |

**Demo staff** (PIN: `1234`): `ahmet@restoran.com` · `ayse@restoran.com`

### 60-second verification (for reviewers)

```bash
# Terminal 1 — API (after install steps below)
cd api && npm run start:dev

# Terminal 2 — Frontend
npm run dev

# Browser
open http://localhost:3001/api/v1/health/live    # → {"status":"ok"}
open http://localhost:3001/docs                    # → Swagger UI
open http://localhost:5173/customer?token=qr-masa-1  # → QR menu → order flow
```

---

## User Journey

```mermaid
flowchart TD
    A[Müşteri — QR kodu okutur] --> B[Public Menü yüklenir]
    B --> C[Sepete ürün ekler]
    C --> D[POST /public/orders]
    D --> E[WebSocket: order.created]
    E --> F[Mutfak — Kitchen Display]
    F --> G[Staff — durum günceller]
    G --> H[PATCH /orders/:id/status]
    H --> I[WebSocket: order.updated / order.ready]
    I --> J[Garson — servis & tamamlama]
    J --> K[Sipariş tamamlandı]
```

---

## Architecture

### Sistem genel görünümü

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        R[React SPA — Vite]
    end

    subgraph API["API Layer — NestJS"]
        REST[REST Controllers]
        WS[WebSocket Gateway /ws]
        APP[Application — Use Cases]
        DOM[Domain — Entities & Events]
        INF[Infrastructure — Prisma Repos]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL 16)]
        RD[(Redis 7)]
    end

    R -->|HTTP /api/v1| REST
    R -->|WebSocket| WS
    REST --> APP
    APP --> DOM
    APP --> INF
    INF --> PG
    DOM -->|Domain Events| WS
    INF --> RD
```

---

## Tech Stack

### Frontend

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| React | 18.3 | UI framework |
| Vite | 6.0 | Build & dev server |
| React Router | 7.1 | Routing (lazy-loaded pages) |
| TanStack Query | 5.62 | Server state, cache, mutations |
| Zustand | 5.0 | Client state (auth, cart, UI) |
| Axios | 1.7 | HTTP client |
| Framer Motion | 11.15 | Animasyonlar |
| Recharts | 2.14 | Grafikler |
| Lucide React | 0.468 | İkonlar |

### Backend

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| NestJS | 11 | Modular monolith API |
| TypeScript | 5.8 | Backend dil |
| Prisma | 6.5 | ORM & migrations |
| class-validator | 0.14 | DTO validation |
| Swagger | 11 | API dokümantasyonu |
| Pino | 4.3 | Structured logging |
| BullMQ | 5.41 | Queue altyapısı (kayıtlı) |

### Database

| Teknoloji | Kullanım |
|-----------|----------|
| PostgreSQL 16 | Ana veritabanı |
| Prisma Migrate | Şema versiyonlama |
| Redis 7 | Health check, queue backend |

### State & Realtime

| Teknoloji | Kullanım |
|-----------|----------|
| TanStack Query | Async server state |
| Zustand | Persisted client state |
| WebSocket (`ws`) | Order realtime events |

### Validation

| Katman | Araç |
|--------|------|
| Backend | `class-validator` + `ValidationPipe` |
| Frontend | Form-level validation (sayfa bazlı) |

### Testing

| Tür | Durum |
|-----|-------|
| Backend integration | 1 suite (menu — 10 test) |
| Backend unit | Yok |
| Frontend unit | Yok |
| E2E (Playwright) | Kurulu, test yazılmadı |

### Deployment

| Araç | Durum |
|------|-------|
| Docker Compose | Postgres + Redis (`api/docker/`) |
| API container | Planlı |
| CI/CD | Planlı |

---

## Project Structure

```
akilli-garson/
├── api/                          # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma         # Veri modeli (8 model, multi-tenant)
│   │   └── migrations/           # 3 migration
│   ├── src/
│   │   ├── core/                 # Config, Prisma, Redis, tenant, events
│   │   ├── modules/
│   │   │   ├── menu/             # Menu BC — full DDD (referans modül)
│   │   │   ├── order/            # Order BC — create + status
│   │   │   ├── public/           # QR public menu read model
│   │   │   ├── health/           # Liveness / readiness
│   │   │   └── realtime/         # WebSocket gateway
│   │   ├── shared/               # HTTP filter, response envelope
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/integration/         # Integration test altyapısı
│   ├── docker/docker-compose.yml # Postgres + Redis
│   └── scripts/                  # dev-db, seed yardımcıları
│
├── src/                          # React frontend
│   ├── api/                      # axios, adapters, services (API_ENABLED)
│   ├── components/               # UI, Layout, providers
│   ├── hooks/                    # TanStack Query hooks (19 dosya)
│   ├── pages/                    # Staff + customer sayfaları (16)
│   ├── store/                    # Zustand (useAppStore)
│   ├── locales/                  # TR / EN
│   └── utils/                    # print, sound
│
├── docs/                         # Mimari ve proje dokümantasyonu
│   └── MASTER-PROJECT-REPORT.md  # Kapsamlı teknik rapor
│
├── public/                       # PWA manifest, service worker
├── package.json                  # Frontend (v2.0.0)
└── README.md
```

| Klasör | Görev |
|--------|-------|
| `api/src/modules/menu/` | Kategori, ürün, fiyat, placement — DDD referans implementasyonu |
| `api/src/modules/order/` | Sipariş oluşturma (public) ve durum geçişleri |
| `api/src/modules/public/` | QR token ile public menü |
| `api/src/modules/realtime/` | Domain event → WebSocket broadcast |
| `api/src/core/` | Cross-cutting: tenant, prisma, redis, config |
| `src/api/` | NestJS ↔ UI adapter katmanı |
| `src/hooks/` | Feature bazlı React Query hooks |
| `src/pages/customer/` | QR müşteri akışı (login, menu, orders) |
| `docs/` | Mimari analiz, domain tasarımı, master rapor |

---

## Backend Architecture

Modular monolith — **Menu** module is the reference DDD implementation. See [Engineering Decisions](#engineering-decisions).

```
presentation/   → Controllers, DTOs, Swagger
application/    → Commands, Queries, Use Cases, Ports
domain/         → Entities, Value Objects, Events, Invariants
infrastructure/ → Prisma repositories, mappers, unit-of-work
```

**Multi-tenant:** `Restaurant` root → `restaurantId` on all business tables. Staff API uses `X-Restaurant-Id` (JWT planned). Public API resolves tenant via `tableToken`. Counts: [Repository Statistics](#repository-statistics).

---

## Frontend Architecture

### React SPA

- 16 lazy-loaded sayfa (`React.lazy` + `Suspense`)
- CSS Modules ile stil izolasyonu
- PWA iskeleti (`manifest.webmanifest`, service worker)

### TanStack Query

- Global `QueryClient`: 5 dk staleTime, mutation retry 0
- Query key factory pattern (`menuKeys`, `orderKeys`, …)
- Optimistic updates (sipariş durumu, menü)
- `API_ENABLED` ile devre dışı modüller için `enabled: false`

### Zustand

Tek store (`useAppStore`): theme, language, `activeWaiter`, per-table cart, notification prefs — `persist` middleware ile.

### Provider Zinciri

```
ErrorBoundary → QueryClientProvider → BrowserRouter
  → ThemeProvider → WebSocketProvider → NotificationProvider → App
```

### Routing

| Grup | Örnek rotalar |
|------|----------------|
| Public | `/customer`, `/customer/menu`, `/customer/orders`, `/login` |
| Staff (AuthGuard) | `/`, `/orders`, `/kitchen`, `/menu`, `/tables`, … |

---

## Repository Statistics

Counts from the current codebase (`api/src`, `src/`).

| Item | Count |
|------|------:|
| Feature modules | 5 |
| Use cases | 15 |
| Domain entities | 6 |
| Value objects | 7 |
| Repository ports | 5 |
| Prisma repository implementations | 6 |
| Controllers | 6 |
| DTOs | 16 |
| Database migrations | 3 |
| React pages | 16 |
| React hooks | 19 |
| REST endpoints | 16 |

---

## Database

### ER Mantığı

```mermaid
erDiagram
    Restaurant ||--o{ MenuCategory : has
    Restaurant ||--o{ MenuItem : has
    Restaurant ||--o{ Table : has
    Restaurant ||--o{ Order : has
    MenuCategory ||--o{ MenuCategoryPlacement : contains
    MenuItem ||--o{ MenuCategoryPlacement : placed_in
    MenuItem ||--o{ MenuPrice : priced
    Table ||--o{ Order : receives
    Order ||--o{ OrderLine : contains
```

### Prisma

- **8 model:** `Restaurant`, `Table`, `MenuCategory`, `MenuItem`, `MenuCategoryPlacement`, `MenuPrice`, `Order`, `OrderLine`
- **Para birimi:** `amountMinor` (kuruş) — `Money` value object
- **Sipariş snapshot:** `OrderLine` canlı `MenuItem` FK'si taşımaz; fiyat/isim anlık kopyalanır

### Migration

3 migration mevcuttur: `init_menu` → `add_tables` → `add_orders`

```bash
cd api
npx prisma migrate deploy
```

### Optimistic Lock

`version` alanı + `optimistic-lock.helper.ts` — eşzamanlı güncelleme koruması.

### Soft Delete

`deletedAt` — `MenuCategory`, `MenuItem`, `MenuPrice`, `Table`, `Order` modellerinde.

---

## API

### Swagger

| | |
|---|---|
| **URL** | `http://localhost:3001/docs` |
| **Base path** | `/api/v1` |

### Endpoint Grupları (16 REST route)

| Grup | Prefix | Auth |
|------|--------|------|
| Health | `/health`, `/health/live`, `/health/ready` | Yok |
| Public Menu | `/public/menu/:tableToken` | Yok |
| Public Orders | `POST /public/orders` | Yok |
| Menu Categories | `/menu/categories` | `X-Restaurant-Id` |
| Menu Items | `/menu/items`, `/menu/items/:id/price` | `X-Restaurant-Id` |
| Orders (staff) | `/orders`, `/orders/:id/status` | `X-Restaurant-Id` |

### Response Formatı

Tüm REST yanıtları standart envelope ile döner:

```json
{
  "success": true,
  "data": { },
  "timestamp": "2026-07-03T12:00:00.000Z"
}
```

Frontend `axios` interceptor bu envelope'u otomatik açar.

---

## Realtime

### WebSocket

| | |
|---|---|
| **Endpoint** | `ws://localhost:3001/ws` |
| **Env** | `VITE_WS_URL` |

### Order Events

| Event | Tetikleyici |
|-------|-------------|
| `order.created` | Yeni sipariş |
| `order.updated` | Durum değişikliği |
| `order.ready` | Kısmen servis edildi |
| `order.served` | Servis edildi |

### Room Yapısı

| Room | Üyeler |
|------|--------|
| `restaurant:{restaurantId}` | Staff (`role: staff`) |
| `table:{tableId}` | Müşteri (`role: customer`) |

**Join payload:**

```json
{
  "role": "staff",
  "restaurantId": "660e8400-e29b-41d4-a716-446655440001"
}
```

---

## Security

| Konu | Mevcut Durum |
|------|--------------|
| **JWT** | Env placeholder var; **Auth modülü uygulanmadı** |
| **RBAC** | Frontend `usePermissions.js` — backend guard yok |
| **Validation** | NestJS `ValidationPipe` + `class-validator` ✅ |
| **Tenant Isolation** | `X-Restaurant-Id` header + repository filtreleri ⚠️ |
| **HTTP Hardening** | helmet, compression, CORS ✅ |
| **Rate Limiting** | Yok |

---

## Current Limitations

Deliberately documented — this is an MVP / demo, not production POS software.

| Limitation | Detail |
|------------|--------|
| **JWT / Auth** | Demo PIN (`1234`) on frontend only. JWT env vars exist; no NestJS auth module. |
| **Tables API** | Prisma `Table` model exists. No REST endpoints. Frontend `/tables` disabled. |
| **Payments** | No backend. Orders screen closes via status update only. |
| **Inventory** | No backend. UI shows unavailable message. |
| **Reservations** | No backend. |
| **Service calls** | No backend (waiter call from customer UI shows info toast). |
| **Menu gaps** | Archive use-cases exist but no HTTP routes. Availability toggle not exposed. |
| **Order gaps** | No add/remove line items, transfer, or merge on API. |
| **Tests** | 1 integration suite (menu, 10 cases). No unit tests. No E2E tests written. |
| **CI/CD** | No pipeline. No API Dockerfile. |
| **Frontend TS** | JavaScript only — no compile-time type safety on client. |
| **Legacy UI** | ~40% of sidebar routes point to unimplemented APIs (gated by `API_ENABLED`). |

---

## Current Status

| Phase | Items |
|-------|-------|
| **Done** | Menu + Order bounded contexts, public QR API, WebSocket, Swagger, Prisma migrations, frontend core migration |
| **In progress** | JWT auth, legacy UI cleanup, documentation |
| **Planned** | Tables, payments, CI/CD, E2E, production deploy |

---

## Project Timeline

Week-level view of [Architecture Evolution](#architecture-evolution):

| Week | Focus |
|------|--------|
| 1–2 | React SPA + customer QR flow |
| 3–4 | NestJS + PostgreSQL + Prisma |
| 5–6 | Menu DDD refactor |
| 7 | Order + Public QR API |
| 8 | WebSocket + domain events |
| 9+ | Frontend migration, demo seed, RC1 polish |

---

## Roadmap

### Near Term (1 ay)

- [ ] Tables REST API + frontend enable
- [ ] JWT auth (minimal)
- [ ] Order integration testleri
- [ ] GitHub Actions: build + integration test
- [ ] README screenshots & demo GIF
- [ ] Çalışmayan sidebar öğelerini gizle veya etiketle

### Mid Term (3 ay)

- [ ] Payments modülü
- [ ] Service calls (garson çağır)
- [ ] Playwright E2E (QR → kitchen → complete)
- [ ] API Dockerfile + staging deploy
- [ ] Menu archive / availability endpoint'leri

### Long Term (6–12 ay)

- [ ] Multi-restaurant SaaS onboarding
- [ ] Branch / channel fiyatlandırma
- [ ] POS / ödeme sağlayıcı entegrasyonları (TR)
- [ ] Analytics modülü (gerçek aggregation)
- [ ] Billing & abonelik modeli

Detaylı plan: [`docs/MASTER-PROJECT-REPORT.md`](./docs/MASTER-PROJECT-REPORT.md)

---

## Installation

### Requirements

| Gereksinim | Minimum |
|------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 16 (Docker veya lokal) |
| Redis | 7 (opsiyonel — health/queue için) |

### Clone

```bash
git clone https://github.com/YOUR_USERNAME/akilli-garson.git
cd akilli-garson
```

### Install Dependencies

```bash
# Frontend
npm install

# Backend
cd api
npm install
cd ..
```

### Backend Setup

```bash
# 1. Ortam dosyası
cp api/.env.example api/.env

# 2. PostgreSQL + Redis (Docker)
cd api/docker
docker compose up -d
cd ../..

# 3. Migration
cd api
npx prisma migrate deploy
npx prisma generate

# 4. Seed (demo restaurant, menu, orders)
npm run seed:demo

# 5. API başlat
npm run start:dev
```

API: `http://localhost:3001` · Swagger: `http://localhost:3001/docs`

### Frontend Setup

```bash
# Kök dizinde
cp .env.example .env
```

`.env` dosyasında `VITE_RESTAURANT_ID` değerini seed ile uyumlu UUID yapın:

```env
VITE_RESTAURANT_ID=660e8400-e29b-41d4-a716-446655440001
```

```bash
npm run dev
```

Frontend: `http://localhost:5173`

### Run — Özet

| Servis | Komut | Port |
|--------|-------|------|
| PostgreSQL + Redis | `cd api/docker && docker compose up -d` | 5432, 6379 |
| API | `cd api && npm run start:dev` | 3001 |
| Frontend | `npm run dev` | 5173 |

### Demo Veri (Seed)

Run from `api/`: `npm run seed:demo`

| Alan | Değer |
|------|-------|
| Restaurant | Lezzet Durağı |
| Restaurant ID | `660e8400-e29b-41d4-a716-446655440001` |
| Table Token | `qr-masa-1` (also `qr-masa-2` … `qr-masa-4`) |
| Müşteri URL | `http://localhost:5173/customer?token=qr-masa-1` |

---

## Environment Variables

### Frontend (`.env`)

```env
# API base URL (NestJS)
VITE_API_URL=http://localhost:3001/api/v1

# Staff API tenant header
VITE_RESTAURANT_ID=660e8400-e29b-41d4-a716-446655440001

# WebSocket (opsiyonel)
VITE_WS_URL=ws://localhost:3001/ws
```

### Backend (`api/.env`)

```env
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1
CORS_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/akilli_garson?schema=public

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Placeholder — Auth module not yet implemented
JWT_ACCESS_SECRET=change-me-access-secret-min-32-chars
JWT_REFRESH_SECRET=change-me-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

LOG_LEVEL=info
```

---

## API Documentation

| Kaynak | URL |
|--------|-----|
| **Swagger UI** | http://localhost:3001/docs |
| **Health (live)** | http://localhost:3001/api/v1/health/live |
| **Master Report** | [docs/MASTER-PROJECT-REPORT.md](./docs/MASTER-PROJECT-REPORT.md) |

---

## Engineering Decisions

Short rationale for each choice — trade-offs included.

### Why React?

Component model fits 16 distinct screens (staff + customer). TanStack Query handles server cache and optimistic updates without Redux boilerplate. Vite gives fast feedback loops during solo development. Trade-off: frontend is JavaScript, not TypeScript — faster to ship, weaker contract with backend.

### Why NestJS?

Module boundaries map cleanly to bounded contexts (`menu`, `order`, `public`, `realtime`). Built-in DI, pipes, interceptors, and Swagger reduce glue code. WebSocket and BullMQ integrate without a second framework. Trade-off: more ceremony than Express; discipline required to avoid anemic services.

### Why Prisma?

Schema-first migrations with generated types catch relation mistakes at compile time. Prisma Studio helps debug tenant data during development. Trade-off: complex queries sometimes fight the ORM; raw SQL escape hatches may be needed later.

### Why PostgreSQL?

Orders need ACID — header + lines in one transaction. Relational model fits menu ↔ category placements and price history. Future option: Row-Level Security for tenant isolation at DB level. Trade-off: operational overhead vs. SQLite; Docker Compose mitigates locally.

### Why DDD?

Menu pricing, category placement, and order status are real business rules — not CRUD. Aggregates enforce invariants (e.g. slug uniqueness per tenant). Use cases become the unit you test and reason about. Trade-off: upfront cost; pays off in menu module, still thin in `public` read model.

### Why Repository Pattern?

Application layer depends on ports (`MenuCategoryRepositoryPort`), not Prisma. Integration tests can swap in-memory or test DB without touching use cases. Trade-off: mapper boilerplate between domain entities and Prisma rows.

### Why manual CQRS (not `@nestjs/cqrs`)?

Explicit Command / Query classes + `UseCase.execute()` — easier to navigate solo than event bus magic. 8 commands, 7 queries, 15 use cases today. Trade-off: no framework-enforced conventions; consistency is on the developer.

### Why Snapshot Pattern on `OrderLine`?

`OrderLine` stores name, SKU, price at order time — no FK to live `MenuItem`. Menu price changes do not rewrite history. This is how production POS systems behave. Trade-off: duplicated data; must capture snapshot correctly in `CreateOrderUseCase`.

### Why Domain Events?

Decouple write path from side effects. `order.created` triggers WebSocket broadcast without the use case knowing about sockets. 13 events defined; menu and order modules publish through `DomainEventPublisher`. Trade-off: in-process only today; outbox pattern needed for external integrations.

### Why WebSocket?

Kitchen and staff screens need sub-second updates. Polling 5s intervals felt wrong for order flow. Domain event → `OrderRealtimeHandler` → room broadcast keeps HTTP handlers thin. Trade-off: connection management, no Redis adapter yet for horizontal scale.

---

## Lessons Learned

### Biggest Engineering Challenges

1. **Migrating frontend without rewriting it** — hooks expected legacy REST shapes. Solution: `adapters.js` + `API_ENABLED` flags instead of big-bang rewrite.
2. **Single order aggregate vs. separate kitchen model** — Legacy UI had `kitchenOrders`. Consolidated on `Order` status machine; kitchen screen maps orders client-side.
3. **Tenant resolution on public routes** — QR flow has no `X-Restaurant-Id`. Public use cases resolve tenant from `tableToken` → `Table` → `restaurantId`.
4. **Optimistic locking under concurrency** — `version` column + helper prevents silent overwrites on menu and order updates.

### Architecture Trade-offs

| Decision | Chosen | Alternative skipped | Why |
|----------|--------|---------------------|-----|
| Deployment shape | Modular monolith | Microservices | Solo dev; clear module seams for later split |
| CQRS style | Manual use cases | `@nestjs/cqrs` | Simpler mental model, less magic |
| Kitchen data | Order status | Separate `KitchenTicket` aggregate | Less sync pain; loses per-line KDS (accepted) |
| Tenant isolation | App-layer filter | PostgreSQL RLS | Faster to ship; RLS planned for SaaS phase |
| Frontend state | TanStack Query + Zustand | Redux | Server state separated from UI prefs/cart |

### What I Would Redesign Today

1. **Auth first** — JWT module before building 16 frontend screens. Demo PIN created a false sense of security.
2. **Frontend in TypeScript** — adapter layer would catch status enum mismatches (`ACTIVE` vs `active`) earlier.
3. **Fewer UI modules upfront** — ship QR + orders + kitchen only; add tables/payments when API exists.
4. **Order integration tests before menu archive** — archive use-cases without HTTP endpoints add code without user-visible value.
5. **CI on day one** — even `build + prisma migrate + 1 integration test` would anchor quality.

### Technical Decisions That Paid Off

1. **`restaurantId` on every business table from migration 1** — no painful retrofit for multi-tenant.
2. **Menu module as full DDD reference** — patterns copy cleanly to future `payment` or `reservation` modules.
3. **Standard API envelope** — `{ success, data, timestamp }` simplified axios interceptor on frontend.
4. **Domain events → WebSocket bridge** — adding a new subscriber (e.g. push notification) does not touch use cases.
5. **`API_ENABLED` honesty** — disabled queries do not throw; reviewers see intentional scope, not broken app.
6. **Prisma migrations in repo** — reproducible schema for anyone cloning the project.

---

## Future Improvements

| Öncelik | İyileştirme |
|---------|-------------|
| P0 | JWT auth + backend RBAC |
| P0 | Tables API |
| P1 | CI/CD (GitHub Actions) |
| P1 | E2E testler (Playwright) |
| P1 | Frontend TypeScript migrasyonu |
| P2 | Payments modülü |
| P2 | Redis cache (public menu) |
| P3 | Kubernetes / PaaS deployment |
| P3 | Observability (metrics, tracing) |

---

## Author

**[Your Name]**

Kişisel mühendislik çalışması — restoran operasyonları üzerinde backend mimarisi (DDD, event-driven realtime, multi-tenant schema) pratiği yapmak için geliştirildi. Tasarım, implementasyon ve dokümantasyon tek kişi tarafından yapıldı.

| | |
|---|---|
| LinkedIn | [linkedin.com/in/your-profile](https://linkedin.com/in/your-profile) |
| GitHub | [github.com/YOUR_USERNAME](https://github.com/YOUR_USERNAME) |
| Email | your.email@example.com |

---

## Why This Project Matters

Not a commercial POS clone. A deliberate exercise in problems that appear past CRUD: tenant boundaries, aggregate consistency, immutable order snapshots, optimistic concurrency, and realtime propagation — on a domain with enough rules to matter.

---

## License

[MIT License](./LICENSE) — file to be added before public release.

---

## Further Reading

See [`docs/README.md`](./docs/README.md) for the full documentation index.

| Document | Content |
|----------|---------|
| [MASTER-PROJECT-REPORT.md](./docs/MASTER-PROJECT-REPORT.md) | Full technical & commercial analysis |
| [MIMARI-TASARIM.md](./docs/MIMARI-TASARIM.md) | Architecture design decisions |
| [RC1_P0_COMPLETION_REPORT.md](./docs/RC1_P0_COMPLETION_REPORT.md) | Release Candidate 1 P0 fixes |

---

## Reviewer Notes

Suggested reading order for a technical review:

1. **`api/src/modules/menu/`** — full DDD reference (entities, VOs, use cases, Prisma repos, 10 integration tests)
2. **`api/src/modules/order/`** — aggregate, snapshot lines, status machine, public create flow
3. **`api/src/modules/realtime/`** — `OrderRealtimeHandler`, room model, WS gateway
4. **`api/src/modules/public/`** — thin read model; `tableToken` → tenant resolution
5. **`src/api/adapters.js`** — NestJS ↔ UI mapping (frontend migration layer)

Start with `CreateCategoryUseCase` or `create-category.integration.spec.ts` if time is limited.

---

## Known Future Work

Architectural items planned — not a repeat of [Roadmap](#roadmap):

| Item | Why it matters |
|------|----------------|
| **JWT + backend RBAC** | Replace `X-Restaurant-Id` header and demo PIN |
| **Payments bounded context** | Separate aggregate; do not overload `Order` |
| **CI/CD** | Build, migrate, integration tests on every push |
| **WebSocket Redis adapter** | Horizontal scale for WS rooms |
| **Transactional outbox** | Reliable domain event delivery to external systems |
| **Production Docker** | API container + compose for staging |

---

## Questions a CTO Might Ask

After reading this README, reasonable follow-up questions:

1. Why modular monolith instead of microservices at this stage?
2. How is tenant isolation enforced today, and what breaks if `X-Restaurant-Id` is spoofed?
3. Why no separate `KitchenTicket` aggregate — what did you trade off?
4. How would you add JWT without rewriting the use case layer?
5. What is your strategy for order line item updates (add/remove) on the existing aggregate?
6. Why manual CQRS instead of `@nestjs/cqrs`?
7. How do you test multi-tenant isolation — what cases do the 10 integration tests cover?
8. What is the plan for roadmap sidebar modules (tables, payments, inventory)?
9. How would you deploy this with zero-downtime migrations?
10. If this went to 100 restaurants, what fails first — DB, WS, or application layer?

---

> Personal engineering and portfolio work. Built to apply modern restaurant-system architecture patterns on a real domain, with documented scope limits.
