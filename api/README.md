# Akıllı Garson API

NestJS backend for **Akıllı Garson** — Restaurant Management Platform (QR ordering, kitchen display, menu management, realtime operations).

## Stack

- NestJS 11 · Prisma · PostgreSQL · Redis · BullMQ
- ConfigModule · Swagger · Pino · class-validator · Helmet · Compression · CORS · Terminus

## Quick Start

```bash
# 1. Infrastructure
docker compose -f docker/docker-compose.yml up -d

# 2. Environment
cp .env.example .env

# 3. Install & migrate
npm install
npm run prisma:migrate
npm run seed:demo

# 4. Run
npm run start:dev
```

- API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/docs`
- Health: `http://localhost:3001/api/v1/health`

## Architecture

Feature-based modular monolith with Clean Architecture layers:

```
src/
├── core/       # Cross-cutting infrastructure (config, db, cache, queue, events, tenant)
├── shared/     # Global filters, interceptors, exceptions, repository contracts
├── modules/    # Feature modules (menu, order, public, health, realtime)
├── app.module.ts
└── main.ts
```

See `docs/BACKEND-ISKELET.md` and `docs/MIMARI-TASARIM.md` for full architecture.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Development with hot reload |
| `npm run build` | Production build |
| `npm run seed:demo` | Idempotent demo dataset (restaurant, menu, orders) |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Prisma Studio GUI |
