# Backend İskelet Raporu

> **Tarih:** 2026-07-02  
> **Durum:** Production iskelet tamamlandı (feature modüller hariç)  
> **Referans:** [MIMARI-TASARIM.md](./MIMARI-TASARIM.md)

---

## Özet

NestJS tabanlı production backend iskeleti `api/` dizininde oluşturuldu. Amaç çalışan feature üretmek değil; **sağlam, genişletilebilir temel** kurmaktır.

**Oluşturulan:** Core, Config, Prisma, Logger, Redis, BullMQ, Event, Tenant (placeholder), Shared, Health, Docker Compose, Swagger, global pipe/filter/interceptor.

**Henüz oluşturulmayan:** Orders, Payments, Kitchen, Inventory, Reservations, Auth, Gateway, Jobs.

---

## Klasör Yapısı

```
api/
├── docker/
│   └── docker-compose.yml          # PostgreSQL + Redis altyapısı
├── prisma/
│   └── schema.prisma               # Minimal Restaurant model (tenant kökü)
├── src/
│   ├── main.ts                       # Bootstrap: helmet, cors, swagger, ValidationPipe
│   ├── app.module.ts                 # Root module — Core + Shared + Health
│   ├── core/
│   │   ├── core.module.ts            # Altyapı modüllerini toplar
│   │   ├── config/
│   │   │   ├── config.module.ts      # ConfigModule.forRoot (global)
│   │   │   ├── app.config.ts         # PORT, API_PREFIX, CORS
│   │   │   ├── database.config.ts    # DATABASE_URL
│   │   │   ├── redis.config.ts       # REDIS_HOST/PORT/PASSWORD
│   │   │   └── env.validation.ts     # class-validator ile env doğrulama
│   │   ├── database/
│   │   │   ├── prisma.module.ts      # Global Prisma DI
│   │   │   └── prisma.service.ts     # PrismaClient lifecycle (connect/disconnect)
│   │   ├── logging/
│   │   │   └── logger.module.ts      # nestjs-pino HTTP logger
│   │   ├── cache/
│   │   │   ├── redis.constants.ts    # REDIS_CLIENT injection token
│   │   │   └── redis.module.ts       # Global ioredis client
│   │   ├── queue/
│   │   │   ├── queue.constants.ts    # BullMQ kuyruk isimleri
│   │   │   └── queue.module.ts       # BullMQ forRootAsync + default queue
│   │   ├── events/
│   │   │   ├── domain-event.interface.ts
│   │   │   ├── domain-event.publisher.ts  # EventEmitter2 wrapper
│   │   │   └── event.module.ts
│   │   └── tenant/
│   │       ├── tenant.context.ts     # AsyncLocalStorage tenant context
│   │       ├── tenant.interceptor.ts # X-Restaurant-Id header (placeholder)
│   │       └── tenant.module.ts
│   ├── shared/
│   │   ├── shared.module.ts          # Global filter + interceptor
│   │   ├── exceptions/               # DomainException, NotFound, Conflict
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts
│   │   ├── dto/
│   │   │   └── api-response.dto.ts
│   │   └── interfaces/
│   │       └── repository.interface.ts  # Repository pattern contract
│   └── modules/
│       └── health/
│           ├── health.module.ts
│           ├── health.controller.ts  # /health, /health/live, /health/ready
│           └── indicators/
│               ├── prisma.health.ts
│               └── redis.health.ts
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## Modül Sorumlulukları

| Modül | Neden | Mimari Katman |
|-------|-------|---------------|
| **AppConfigModule** | Ortam değişkenlerini tip-güvenli yükler ve doğrular | Infrastructure |
| **PrismaModule** | DB erişimini DI ile soyutlar; Repository implementasyonları bunu kullanır | Infrastructure |
| **LoggerModule** | Yapılandırılmış JSON log (Pino); production observability | Infrastructure |
| **RedisModule** | Cache, session, pub/sub için paylaşılan Redis client | Infrastructure |
| **QueueModule** | BullMQ altyapısı; async job processor'lar sonra eklenecek | Infrastructure |
| **EventModule** | Domain event publishing (OrderCreated vb. için hazır) | Application |
| **TenantModule** | Multi-tenant context (JWT sonrası aktif olacak) | Cross-cutting |
| **SharedModule** | Tutarlı API response/error formatı | Presentation |
| **HealthModule** | K8s/Docker readiness & liveness probe'ları | Operations |

---

## Bootstrap Akışı (`main.ts`)

```
NestFactory.create(AppModule)
  → Pino Logger
  → Helmet (security headers)
  → Compression
  → CORS
  → Global prefix: api/v1
  → ValidationPipe (whitelist, transform)
  → Swagger: /docs
  → listen(PORT)
```

Global filter ve interceptor `SharedModule` üzerinden `APP_FILTER` / `APP_INTERCEPTOR` ile kayıtlıdır.

---

## API Response Formatı

**Başarılı:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-07-02T...",
  "path": "/api/v1/health"
}
```

**Hata:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Order with id 'xxx' not found",
  "code": "NOT_FOUND",
  "timestamp": "2026-07-02T...",
  "path": "/api/v1/orders/xxx"
}
```

---

## Docker Compose

```bash
cd api
docker compose -f docker/docker-compose.yml up -d
```

| Servis | Port | Amaç |
|--------|------|------|
| postgres | 5432 | Ana veritabanı |
| redis | 6379 | Cache + BullMQ broker |

---

## Sonraki Adımlar (SAD sırasına göre)

1. **Auth Module** — JWT, refresh token, RBAC guards
2. **Menu Module** — Categories, Products CRUD
3. **Tables Module** — Table management, QR token
4. **Orders Module** — State machine (IS-KURALLARI.md)
5. **Kitchen Module** — Ticket lifecycle
6. **Payments Module** — Split bill, discount, tip
7. **WebSocket Gateway** — Real-time updates
8. **BullMQ Processors** — Print, notifications, audit

---

## Mimari Uygunluk Kontrolü

| Prensip | Durum |
|---------|-------|
| Feature-based modular monolith | ✅ `modules/` altında feature'lar |
| Clean Architecture | ✅ core/shared ayrımı, repository interface |
| Repository Pattern | ✅ `IRepository` contract (implementasyon feature'larda) |
| Dependency Injection | ✅ Tüm servisler Nest DI |
| SOLID | ✅ Modüller tek sorumluluk; interface segregation |
| DRY | ✅ Config registerAs, global filter/interceptor |
| KISS | ✅ Minimal schema, placeholder tenant |

---

## İlgili Dokümanlar

- [MIMARI-TASARIM.md](./MIMARI-TASARIM.md) — Software Architecture Document
- [IS-KURALLARI.md](./IS-KURALLARI.md) — State machines & business rules
- [archive/DOMAIN-ANALIZI.md](./archive/DOMAIN-ANALIZI.md) — historical DDD entity analysis (mock API era)
- [YOL-HARITASI.md](./YOL-HARITASI.md) — Proje yol haritası
