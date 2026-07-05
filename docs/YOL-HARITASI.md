# Akıllı Garson — Geliştirme Yol Haritası

**Tarih:** 1 Temmuz 2026  
**Hedef:** Restoranlara satılabilir SaaS POS ürünü

---

## 1. Faz Özeti

| Faz | Konu | Süre | Öncelik |
|-----|------|------|---------|
| **Faz 1** | Temel Altyapı | 8–12 hafta | 🔴 P0 |
| **Faz 2** | Operasyonel Çekirdek | 6–8 hafta | 🔴 P0 |
| **Faz 3** | Mali Uyumluluk | 4–6 hafta | 🔴 P0 |
| **Faz 4** | SaaS Ürünleştirme | 6–8 hafta | 🟠 P1 |
| **Faz 5** | Büyüme & Entegrasyon | Sürekli | 🟡 P2 |

**Toplam tahmini süre (Faz 1–4):** 24–34 hafta (~6–8 ay)

---

## 2. Faz 1 — Temel Altyapı (8–12 hafta)

**Amaç:** Mock backend'den production-grade altyapıya geçiş.

### Görevler

- [ ] **Backend seçimi ve kurulum**
  - Node.js + NestJS veya Express + TypeScript
  - PostgreSQL veritabanı şeması tasarımı
  - Migration sistemi (Prisma / TypeORM)

- [ ] **Multi-tenant mimari**
  - `restaurants` tablosu (tenant)
  - Tüm sorgularda `restaurantId` filtresi
  - Tenant izolasyonu testleri

- [ ] **Kimlik doğrulama**
  - PIN hash'leme (bcrypt)
  - JWT access + refresh token
  - Oturum süresi ve logout
  - Brute-force koruması

- [ ] **Sunucu tarafı RBAC**
  - Middleware: admin / waiter / kitchen
  - Endpoint bazlı yetki kontrolü
  - Audit log (login, kritik işlemler)

- [ ] **Frontend API geçişi**
  - `axios.js` → env-based baseURL
  - Mevcut hooks'ların yeni API'ye adaptasyonu
  - Hata yönetimi standardizasyonu

- [ ] **DevOps temeli**
  - Staging ortamı
  - CI/CD pipeline (GitHub Actions)
  - Docker compose (local dev)

### Çıktılar
- Çalışan production backend
- Güvenli auth akışı
- Staging ortamında deploy edilmiş frontend

---

## 3. Faz 2 — Operasyonel Çekirdek (6–8 hafta)

**Amaç:** Restoranın günlük operasyonlarını destekleyen özellikler.

### Görevler

- [ ] **Termal yazıcı entegrasyonu**
  - ESC/POS protokol desteği
  - Mutfak fişi şablonu
  - Adisyon / hesap fişi
  - WebUSB veya ağ yazıcı bağlantısı

- [ ] **POS entegrasyonu (temel)**
  - Nakit ödeme kaydı (mevcut)
  - Kart ödeme gateway entegrasyonu
  - Ödeme durumu webhook'ları

- [ ] **Offline mod**
  - IndexedDB sipariş kuyruğu
  - Bağlantı gelince otomatik sync
  - Çakışma çözümleme (optimistic locking)

- [ ] **Vardiya yönetimi**
  - Vardiya aç/kapa
  - Kasa sayımı (açılış/kapanış)
  - Vardiya bazlı satış raporu

- [ ] **Mutfak geliştirmeleri**
  - İstasyon bazlı ekranlar (bar, ızgara, tatlı)
  - Hazırlık süresi tahmini
  - Gecikme uyarıları

- [ ] **Stok otomasyonu**
  - Sipariş onayında otomatik stok düşümü
  - Düşük stok e-posta/SMS uyarısı
  - Reçete bazlı malzeme takibi

### Çıktılar
- Yazıcıdan mutfak fişi basılabilir
- Kart ödemesi alınabilir
- İnternet kesilince sipariş alınmaya devam eder

---

## 4. Faz 3 — Mali Uyumluluk (4–6 hafta)

**Amaç:** Türkiye mali mevzuatına uyum.

### Görevler

- [ ] **Yazar kasa / ÖKC entegrasyonu**
  - ÖKC cihaz API bağlantısı
  - Fiş numarası otomatik artış
  - KDV dökümü fişte

- [ ] **e-Fatura / e-Arşiv**
  - GİB entegrasyonu
  - Kurumsal müşteri fatura kesimi
  - e-Arşiv otomatik gönderim

- [ ] **Gün sonu raporları**
  - Z raporu (yazar kasa)
  - X raporu (ara rapor)
  - Kasa kapanış mutabakatı

- [ ] **KVKK uyumu**
  - Aydınlatma metni (müşteri paneli)
  - Veri saklama süresi politikası
  - Müşteri verisi silme API'si
  - Gizlilik politikası sayfası

- [ ] **İade / iptal mali kayıtları**
  - İade fişi
  - İptal yetki seviyeleri
  - İndirim audit log

### Çıktılar
- Yasal fiş kesilebilir
- Gün sonu Z raporu alınabilir
- KVKK dokümantasyonu hazır

---

## 5. Faz 4 — SaaS Ürünleştirme (6–8 hafta)

**Amaç:** Çoklu restoran, abonelik ve profesyonel destek.

### Görevler

- [ ] **Abonelik sistemi**
  - Paketler: Basic / Pro / Enterprise
  - SaaS abonelik faturalandırma entegrasyonu
  - Deneme süresi (14 gün)
  - Kullanım limitleri (masa, kullanıcı sayısı)

- [ ] **Multi-şube yönetimi**
  - Merkez menü + şube override
  - Şube bazlı fiyatlandırma
  - Konsolide raporlama dashboard

- [ ] **Onboarding sihirbazı**
  - Restoran bilgileri
  - Menü import (CSV/Excel)
  - Masa planı çizimi
  - Demo veri seçeneği

- [ ] **E2E test suite**
  - Playwright: login, sipariş, ödeme akışı
  - CI'da otomatik test
  - Smoke test (staging deploy sonrası)

- [ ] **Tam i18n**
  - Tüm UI metinleri locale dosyalarında
  - Dil seçici Settings'te aktif
  - Tarih/saat/para birimi formatları

- [ ] **Destek altyapısı**
  - In-app yardım / SSS
  - Ticket sistemi entegrasyonu
  - Eğitim video linkleri

### Çıktılar
- Yeni restoran 15 dakikada kurulabilir
- Aylık abonelik faturalandırması çalışır
- E2E testler CI'da yeşil

---

## 6. Faz 5 — Büyüme ve Entegrasyon (Sürekli)

**Amaç:** Rekabet avantajı ve enterprise özellikler.

### Görevler

- [ ] Sadakat programı (puan, kupon)
- [ ] SMS / e-posta bildirimleri (üçüncü taraf mesajlaşma sağlayıcıları)
- [ ] Kampanya ve promosyon motoru
- [ ] Bekleme listesi (walk-in)
- [ ] Alerjen / diyet filtreleri
- [ ] Yemek teslimat platformu entegrasyonları
- [ ] Muhasebe yazılımı entegrasyonu
- [ ] Enterprise raporlama (BI dashboard)
- [ ] Kiosk / self-order terminal modu
- [ ] Franchise yönetim paneli
- [ ] API marketplace (üçüncü parti geliştiriciler)

---

## 7. Öncelik Matrisi

| ID | Konu | Etki | Efor | Faz | Tahmini Süre |
|----|------|------|------|-----|--------------|
| P0-1 | Gerçek backend + PostgreSQL | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛ | 1 | 8–12 hf |
| P0-2 | Güvenli auth (JWT, PIN hash) | ⬛⬛⬛⬛⬛ | ⬛⬛ | 1 | 2–3 hf |
| P0-3 | Sunucu tarafı RBAC | ⬛⬛⬛⬛ | ⬛⬛ | 1 | 1–2 hf |
| P0-4 | Termal yazıcı (ESC/POS) | ⬛⬛⬛⬛ | ⬛⬛⬛ | 2 | 2–4 hf |
| P0-5 | POS / yazar kasa entegrasyonu | ⬛⬛⬛⬛⬛ | ⬛⬛⬛⬛ | 3 | 4–6 hf |
| P1-1 | Offline sipariş modu | ⬛⬛⬛⬛ | ⬛⬛⬛⬛ | 2 | 4–6 hf |
| P1-2 | Vardiya / kasa yönetimi | ⬛⬛⬛⬛ | ⬛⬛⬛ | 2 | 3–4 hf |
| P1-3 | E2E testler (Playwright) | ⬛⬛⬛ | ⬛⬛⬛ | 4 | 2–3 hf |
| P1-4 | Stok otomasyonu | ⬛⬛⬛ | ⬛⬛ | 2 | 2–3 hf |
| P2-1 | Multi-şube konsol | ⬛⬛⬛ | ⬛⬛⬛⬛ | 4 | 6–8 hf |
| P2-2 | Abonelik / faturalandırma | ⬛⬛⬛ | ⬛⬛⬛ | 4 | 4–6 hf |
| P2-3 | e-Fatura / e-Arşiv | ⬛⬛⬛⬛ | ⬛⬛⬛⬛ | 3 | 4–6 hf |
| P3-1 | Sadakat / kampanya | ⬛⬛ | ⬛⬛⬛ | 5 | 3–4 hf |
| P3-2 | SMS / e-posta bildirimleri | ⬛⬛ | ⬛⬛ | 5 | 2–3 hf |
| P3-3 | Yemek platformu entegrasyonu | ⬛⬛⬛ | ⬛⬛⬛⬛ | 5 | 6–8 hf |

---

## 8. Milestone'lar

```
M1 ─── Backend canlı (Faz 1 bitiş)
  │     ✓ PostgreSQL + API
  │     ✓ JWT auth
  │     ✓ Multi-tenant
  │
M2 ─── Pilot restoran (Faz 2 bitiş)
  │     ✓ Yazıcı çalışıyor
  │     ✓ Offline mod
  │     ✓ 1 gerçek restoran test
  │
M3 ─── Yasal uyum (Faz 3 bitiş)
  │     ✓ ÖKC entegrasyonu
  │     ✓ KVKK dokümantasyonu
  │
M4 ─── SaaS lansman (Faz 4 bitiş)
  │     ✓ Abonelik sistemi
  │     ✓ Onboarding sihirbazı
  │     ✓ E2E testler yeşil
  │
M5 ─── 10+ restoran (Faz 5)
        ✓ Multi-şube
        ✓ Entegrasyonlar
```

---

## 9. Kaynak Tahmini

| Rol | Faz 1–2 | Faz 3–4 | Not |
|-----|---------|---------|-----|
| Full-stack developer | 1–2 | 1–2 | Backend ağırlıklı Faz 1 |
| Frontend developer | 1 | 0.5 | Mevcut UI korunur |
| DevOps | 0.5 | 0.5 | CI/CD, staging |
| QA | 0.5 | 1 | E2E testler Faz 4 |
| Ürün / proje yönetimi | 0.5 | 0.5 | Sprint planlama |

---

## 10. Başarı Kriterleri

### Faz 1 tamamlandığında
- [ ] Mock backend tamamen kaldırılmış
- [ ] 3 rol (admin/waiter/kitchen) sunucuda doğrulanıyor
- [ ] Staging'de deploy edilmiş ve erişilebilir

### Faz 2 tamamlandığında
- [ ] Mutfak fişi termal yazıcıdan basılıyor
- [ ] İnternet kesilince en az 1 saat offline sipariş alınabiliyor
- [ ] 1 pilot restoran günlük kullanıyor

### Faz 3 tamamlandığında
- [ ] Yasal fiş kesilebiliyor
- [ ] Gün sonu Z raporu alınabiliyor
- [ ] KVKK dokümantasyonu yayında

### Faz 4 tamamlandığında
- [ ] Yeni restoran 15 dk'da kurulabiliyor
- [ ] Aylık abonelik otomatik faturalandırılıyor
- [ ] E2E testler CI pipeline'da yeşil

---

## İlgili Dokümanlar

- [Ana Proje Raporu](./PROJE-RAPORU.md)
- [Teknik Durum Raporu](./TEKNIK-DURUM.md)
- [Domain Model Analizi](./DOMAIN-ANALIZI.md)
