# Akıllı Garson — Teknik Durum Raporu

**Tarih:** 1 Temmuz 2026  
**Versiyon:** 2.0.0

---

## 1. Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| UI Framework | React | 18.3 |
| Build Tool | Vite | 6.0 |
| Routing | React Router | 7.1 |
| State (server) | TanStack Query | 5.62 |
| State (client) | Zustand | 5.0 |
| HTTP Client | Axios | 1.7 |
| Animasyon | Framer Motion | 11.15 |
| Grafikler | Recharts | 2.14 |
| İkonlar | Lucide React | 0.468 |
| Bildirimler | react-hot-toast | 2.4 |
| QR Kod | qrcode | 1.5 |
| Mock API | json-server | 1.0 beta |
| WebSocket | ws | 8.21 |
| E2E (planlı) | Playwright | 1.61 |

---

## 2. Proje Yapısı

```
Akıllı Garson/
├── src/
│   ├── api/              # Axios instance + API servisleri
│   ├── components/       # UI bileşenleri, Layout, providers
│   ├── hooks/            # React Query hooks (orders, auth, payments...)
│   ├── locales/          # i18n (tr.js, en.js)
│   ├── pages/            # Sayfa bileşenleri (staff + customer)
│   ├── store/            # Zustand global state
│   └── utils/            # Yardımcı fonksiyonlar
├── server/
│   └── index.js          # Birleşik REST + WebSocket sunucusu
├── public/               # PWA manifest, service worker
├── db.json               # Mock veritabanı
└── docs/                 # Proje dokümantasyonu
```

---

## 3. Bileşen Durum Matrisi

| Bileşen | Durum | Detay |
|---------|-------|-------|
| **Frontend SPA** | ✅ Production-ready UI | Lazy loading, code splitting, PWA iskeleti |
| **REST API** | ⚠️ Mock | `server/index.js` veya json-server, port 3001 |
| **WebSocket** | ⚠️ Kısmi | `ws://localhost:3001/ws`, broadcast olayları tanımlı |
| **Auth** | ❌ Demo | Sabit PIN `1234`, client-side doğrulama |
| **RBAC** | ⚠️ Frontend only | `usePermissions.js`, sunucu kontrolü yok |
| **Ödeme** | ⚠️ Mock | `payments` koleksiyonu, gerçek POS yok |
| **Yazıcı** | ⚠️ Temel | `printReceipt()` tarayıcı print |
| **i18n** | ⚠️ Kısmi | Locale dosyaları var, tüm UI çevrilmedi |
| **PWA** | ⚠️ İskelet | manifest + SW kayıtlı, offline cache sınırlı |
| **E2E Test** | ❌ Yok | Playwright kurulu, test yazılmadı |
| **CI/CD** | ❌ Yok | Pipeline tanımlı değil |
| **Multi-tenant** | ❌ Yok | Tek restoran (`db.json`) |
| **Offline** | ❌ Yok | Network kesintisinde durur |

---

## 4. API Endpoints (Mock)

Sunucu `db.json` koleksiyonlarını REST olarak sunar:

| Endpoint | Açıklama |
|----------|----------|
| `/waiters` | Garson/personel listesi |
| `/tables` | Masa durumları |
| `/orders` | Siparişler |
| `/menuItems` | Menü ürünleri |
| `/categories` | Menü kategorileri |
| `/payments` | Ödeme kayıtları |
| `/reservations` | Rezervasyonlar |
| `/inventory` | Stok kalemleri |
| `/serviceCalls` | Garson çağrıları |
| `/ws` | WebSocket bağlantı noktası |

---

## 5. WebSocket Olayları

`server/index.js` aşağıdaki olayları broadcast eder:

| Olay | Tetikleyici |
|------|-------------|
| `CONNECTED` | İstemci bağlandığında |
| `ORDER_CREATED` | POST `/orders` |
| `ORDER_UPDATED` | PATCH/PUT `/orders` |
| `TABLE_UPDATED` | PATCH/PUT `/tables` |
| `PAYMENT_COMPLETED` | POST `/payments` |
| `CALL_WAITER` | POST `/serviceCalls` |
| `RESERVATION_NEW` | POST `/reservations` |
| `STOCK_ALERT` | POST/PATCH `/inventory` |
| `DATA_CHANGED` | Diğer kaynaklar |

---

## 6. Kimlik Doğrulama Akışı (Mevcut)

```
Login.jsx → useLogin() → authApi.login()
  ├── GET /waiters (tüm liste)
  ├── Email eşleşmesi (client-side)
  ├── PIN === '1234' kontrolü (sabit, hash yok)
  └── Zustand'a activeWaiter kaydet + demo token
```

**Güvenlik açıkları:**
- PIN hash'lenmiyor
- Token sunucuda doğrulanmıyor
- Waiters listesi herkese açık API'den alınıyor
- RBAC yalnızca frontend'de

---

## 7. Veri Modeli (db.json Koleksiyonları)

| Koleksiyon | Ana Alanlar |
|------------|-------------|
| `waiters` | id, name, email, role, pin (plain) |
| `tables` | id, number, capacity, status, section |
| `orders` | id, tableId, items[], total, status, createdAt |
| `menuItems` | id, name, price, categoryId, available |
| `categories` | id, name, icon |
| `payments` | id, orderId, amount, method, receiptNo |
| `reservations` | id, customerName, date, time, tableId, status |
| `inventory` | id, name, quantity, minQuantity, unit |
| `serviceCalls` | id, tableId, type, status, createdAt |

---

## 8. Bilinen Eksikler ve Teknik Borç

### Yüksek Öncelik
- [ ] Production backend (PostgreSQL + Node/Nest)
- [ ] JWT auth + PIN hash
- [ ] Sunucu tarafı RBAC middleware
- [ ] `.env` yapılandırması (`VITE_API_URL`, `VITE_WS_URL`)
- [ ] Vite dev proxy (`/api` → 3001)

### Orta Öncelik
- [ ] Playwright E2E test suite
- [ ] Tam i18n kapsamı
- [ ] TypeScript migrasyonu (opsiyonel)
- [ ] Error boundary + merkezi hata izleme entegrasyonu
- [ ] API response validation (Zod)

### Düşük Öncelik
- [ ] Storybook bileşen kataloğu
- [ ] Unit test coverage
- [ ] Docker compose (dev ortamı)
- [ ] API dokümantasyonu (Swagger/OpenAPI)

---

## 9. Ortam Değişkenleri (Önerilen)

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001/ws

# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=development
```

---

## 10. Çalıştırma Komutları

```bash
npm install          # Bağımlılıkları yükle
npm run server       # API + WebSocket (port 3001)
npm run dev          # Frontend (port 5173)
npm run dev:all      # İkisi birlikte
npm run build        # Production build
npm run preview      # Build önizleme
```

---

## İlgili Dokümanlar

- [Ana Proje Raporu](./PROJE-RAPORU.md)
- [Domain Model Analizi](./DOMAIN-ANALIZI.md)
- [Geliştirme Yol Haritası](./YOL-HARITASI.md)
