# Akıllı Garson — Proje Durum ve Geliştirme Raporu

**Tarih:** 1 Temmuz 2026  
**Proje:** Akıllı Garson (Restoran POS / Akıllı Garson Sistemi)  
**Versiyon:** 2.0.0  
**Teknoloji:** React 18, Vite 6, TanStack Query, Zustand, json-server (mock API), WebSocket

---

## 1. Yönetici Özeti

Akıllı Garson, restoran operasyonlarını dijitalleştirmeyi hedefleyen **web tabanlı bir POS (Point of Sale) uygulamasıdır**. Proje; personel paneli, müşteri self-servis paneli, mutfak ekranı, rezervasyon, stok, raporlama ve canlı bildirim gibi modülleri içeren **işlevsel bir MVP / demo** seviyesindedir.

**Güçlü yan:** Modern arayüz, geniş modül kapsamı, rol bazlı erişim, QR müşteri menüsü.  
**Zayıf yan:** Mock backend (`json-server`), demo kimlik doğrulama (sabit PIN), mali uyumluluk ve donanım entegrasyonu eksikliği.

Restoranlara **ticari olarak satılabilir** seviyeye ulaşmak için öncelikle backend, güvenlik, ödeme/fiş altyapısı ve operasyonel dayanıklılık yatırımı gereklidir.

---

## 2. Mevcut Panel Envanteri

### 2.1 Genel Yapı

| Kategori | Adet | Açıklama |
|----------|------|----------|
| Ana uygulama yüzeyi | **2** | Personel paneli + Müşteri paneli |
| Personel modülü | **11** | Sidebar menüsündeki ana işlevler |
| Müşteri sayfası | **3** | QR / self-servis akışı |
| Personel rol profili | **3** | Admin, Garson, Mutfak |
| Toplam işlevsel ekran | **14** | Login ve masa siparişi dahil |

---

### 2.2 Personel Paneli (Korumalı — `/login` sonrası)

Tek SPA içinde sidebar navigasyonu ve rol bazlı menü filtreleme kullanılır.

#### Ana Operasyon Modülleri

| # | Modül | Rota | Açıklama |
|---|--------|------|----------|
| 1 | Anasayfa | `/` | Dashboard, özet metrikler, hızlı aksiyonlar |
| 2 | Masalar | `/tables` | Masa durumu (boş/dolu/rezerve), QR |
| 3 | Masa Siparişi | `/tables/:tableId/order` | Masaya özel sipariş girişi |
| 4 | Siparişler | `/orders` | Aktif siparişler, ödeme, transfer/birleştirme |
| 5 | Mutfak | `/kitchen` | Sipariş hazırlama ekranı (KDS) |

#### Yönetim Modülleri

| # | Modül | Rota | Açıklama |
|---|--------|------|----------|
| 6 | Menü Yönetimi | `/menu` | Ürün CRUD, kategori yönetimi |
| 7 | Rezervasyonlar | `/reservations` | Rezervasyon oluşturma, onay, masa atama |
| 8 | Raporlar | `/analytics` | Grafikler, satış analizi |
| 9 | Günlük Rapor | `/daily-report` | Gün sonu özeti, CSV export |
| 10 | Garson Yönetimi | `/waiters` | Personel CRUD |
| 11 | Stok Yönetimi | `/inventory` | Stok takibi, düşük stok uyarıları |

#### Sistem Modülleri

| Modül | Rota | Açıklama |
|--------|------|----------|
| Ayarlar | `/settings` | Tema, dil, bildirim tercihleri |
| Giriş | `/login` | Email + PIN ile personel girişi |

---

### 2.3 Müşteri Paneli (Herkese Açık)

| # | Sayfa | Rota | Açıklama |
|---|--------|------|----------|
| 1 | Masa Girişi | `/customer` | QR kod ile masa numarası okuma |
| 2 | Menü & Sipariş | `/customer/menu` | Ürün seçimi, sepet, sipariş verme |
| 3 | Sipariş Takibi | `/customer/orders` | Aktif sipariş durumu, iptal |

---

### 2.4 Rol Bazlı Erişim Matrisi

| Modül / Rota | Admin | Garson | Mutfak |
|--------------|:-----:|:------:|:------:|
| Anasayfa `/` | ✅ | ✅ | ❌ |
| Masalar `/tables` | ✅ | ✅ | ❌ |
| Masa siparişi `/tables/:id/order` | ✅ | ✅ | ❌ |
| Siparişler `/orders` | ✅ | ✅ | ❌ |
| Mutfak `/kitchen` | ✅ | ✅ | ✅ |
| Menü `/menu` | ✅ | ✅ | ❌ |
| Rezervasyonlar `/reservations` | ✅ | ✅ | ❌ |
| Raporlar `/analytics` | ✅ | ❌ | ❌ |
| Günlük Rapor `/daily-report` | ✅ | ❌ | ❌ |
| Garsonlar `/waiters` | ✅ | ❌ | ❌ |
| Stok `/inventory` | ✅ | ❌ | ❌ |
| Ayarlar `/settings` | ✅ | ❌ | ❌ |

**Demo hesaplar (`db.json`):**

| Email | Rol | PIN |
|-------|-----|-----|
| ahmet@restaurant.com | admin | 1234 |
| ayse@restaurant.com | waiter | 1234 |
| mehmet@restaurant.com | kitchen | 1234 |

---

## 3. Mevcut Teknik Altyapı

| Bileşen | Durum | Not |
|---------|--------|-----|
| Frontend | ✅ Hazır | React 18, lazy loading, PWA iskeleti |
| API | ⚠️ Mock | `json-server` / `server/index.js` (REST + WS) |
| Kimlik doğrulama | ⚠️ Demo | Sabit PIN `1234`, istemci tarafı kontrol |
| WebSocket | ⚠️ Kısmi | Sunucu yazıldı, tam entegrasyon devam ediyor |
| i18n | ⚠️ Kısmi | TR/EN dosyaları var, tüm UI kapsanmıyor |
| RBAC | ⚠️ Frontend | Sunucu tarafı yetki kontrolü yok |
| E2E testler | ❌ Yok | Playwright kurulu, test yazılmadı |
| Ödeme kaydı | ⚠️ Mock | `payments` koleksiyonuna yazılıyor, gerçek POS yok |
| Yazıcı | ⚠️ Temel | Tarayıcı print; termal/ESC-POS yok |
| Offline | ❌ Yok | İnternet kesintisinde çalışmaz |
| Multi-tenant | ❌ Yok | Tek restoran varsayımı |

---

## 4. Mevcut Özellik Listesi

### 4.1 Tamamlanan / İyi Durumda Olan Özellikler

- Modern, responsive arayüz (mobil sidebar, karanlık tema)
- Dashboard, canlı saat, aktivite akışı, komut paleti
- Masa yönetimi ve QR kod üretimi
- Sipariş oluşturma, durum güncelleme, mutfak ekranı
- Ödeme modalı (nakit/kart/online, indirim, bahşiş, hesap bölme)
- Masa transferi ve masa birleştirme (sipariş merge)
- Garson çağırma (serviceCalls API)
- Rezervasyon → masa durumu entegrasyonu
- Menü CRUD, stok takibi, garson CRUD
- Günlük rapor + CSV export, kategori satış tablosu
- Bildirim sistemi (ses, tercihler, düşük stok, garson çağrısı)
- Müşteri paneli (menü, sipariş, iptal, toast bildirimleri)
- Rol bazlı navigasyon ve rota koruması
- Code splitting, PWA manifest + service worker
- Sesli komut bileşeni (Layout entegrasyonu)

### 4.2 Kısmen Tamamlanan / Eksik Özellikler

| Özellik | Durum |
|---------|--------|
| WebSocket sunucusu | Kod var, npm script ve tam doğrulama eksik |
| Playwright E2E | Paket kurulu, test dosyası yok |
| Vite proxy / `.env` | Yapılandırılmadı |
| i18n | Birçok sayfa hâlâ sabit Türkçe metin kullanıyor |
| Auth güvenliği | Token demo, PIN hash yok |
| Fiş / yazdırma | Tarayıcı print; profesyonel fiş formatı yok |
| Stok otomasyonu | Manuel; sipariş → otomatik stok düşümü yok |

---

## 5. Ticari Ürün İçin Gerekli Geliştirmeler

### 5.1 Kritik Öncelik (Satış Öncesi Zorunlu)

#### A. Backend ve Veri Mimarisi
- `json-server` yerine production-grade backend (Node/Nest, .NET, Go vb.)
- PostgreSQL / MySQL ile ilişkisel veritabanı
- **Multi-tenant** mimari: her restoran izole veri (`tenantId`)
- API versioning, rate limiting, input validation
- Otomatik yedekleme, migration, disaster recovery
- Audit log (kim, ne zaman, ne değiştirdi)

#### B. Güvenlik ve Kimlik Doğrulama
- PIN / şifre hash'leme (bcrypt, argon2)
- JWT + refresh token, oturum süresi yönetimi
- RBAC **sunucu tarafında** zorunlu
- Brute-force koruması, IP/cihaz bazlı kısıtlama
- HTTPS zorunluluğu, CORS, CSP politikaları
- **KVKK uyumu:** aydınlatma metni, veri minimizasyonu, silme hakkı

#### C. Ödeme ve Mali Uyumluluk (Türkiye)
- Gerçek POS entegrasyonu (ödeme gateway ve sanal POS sağlayıcıları)
- Yazar kasa / ÖKC entegrasyonu
- e-Fatura / e-Arşiv bağlantısı
- Fiş numarası, KDV dökümü, gün sonu Z raporu
- İade, iptal, indirim için mali kayıt zorunluluğu

#### D. Donanım Entegrasyonu
- Termal yazıcı (mutfak fişi, adisyon) — ESC/POS protokolü
- Kasa çekmecesi tetikleme
- Barkod / QR okuyucu desteği
- Tablet ve kiosk optimizasyonu

#### E. Dayanıklılık ve Offline
- Offline sipariş kuyruğu (local storage + sync)
- WebSocket kopması sonrası otomatik yeniden bağlanma
- Çoklu cihaz çakışma önleme (optimistic locking)
- Yoğun saat yük testi

---

### 5.2 Operasyonel Öncelik (Günlük Restoran Kullanımı)

#### F. Vardiya ve Kasa Yönetimi
- Vardiya aç/kapa, kasa sayımı
- Açık hesap devri (vardiya değişimi)
- Garson bazlı satış ve performans raporu
- İptal / iade / indirim için yetki seviyeleri

#### G. Sipariş ve Mutfak Operasyonları
- Mutfak istasyonları (bar, ızgara, tatlı ayrı ekranlar)
- Hazırlık süresi tahmini ve gecikme uyarıları
- Sipariş → otomatik stok düşümü
- Masa transfer / birleştirme / hesap bölme sağlamlaştırma
- Modifier / ekstra / alerjen yönetimi

#### H. Rezervasyon ve Müşteri Deneyimi
- SMS / e-posta onay ve hatırlatma
- Bekleme listesi (walk-in)
- Sadakat programı, kampanya, promosyon kodu
- Alerjen ve diyet filtreleri (vejetaryen, glutensiz vb.)

#### I. Raporlama ve İş Zekası
- Saatlik satış, en çok satan ürün, garson performansı
- Fire / israf, maliyet-marj analizi
- PDF export ve otomatik e-posta raporu
- Çok şubeli konsolide dashboard

---

### 5.3 Ürünleştirme ve SaaS (Pazarlama Seviyesi)

#### J. Multi-Şube ve Merkezi Yönetim
- Zincir restoran: merkez menü + şube override
- Şube bazlı fiyat, stok, personel
- Franchise modeli desteği

#### K. Abonelik ve Faturalandırma
- Paketler: Basic / Pro / Enterprise
- Deneme süresi, otomatik faturalandırma
- Kullanım limitleri (masa, kullanıcı, şube sayısı)

#### L. Onboarding ve Destek
- İlk kurulum sihirbazı (menü import, masa planı)
- Canlı destek / ticket sistemi
- Eğitim videoları, demo verisi
- Tam Türkçe / İngilizce i18n

#### M. Kalite ve Güvenilirlik
- E2E test suite (Playwright)
- CI/CD pipeline, staging ortamı
- Yük ve stres testleri
- TypeScript migrasyonu veya sıkı test coverage
- Hata izleme (merkezi APM / error tracking)

#### N. UX ve Cihaz Uyumu
- Tablet-first mutfak ekranı
- Telefon garson modu
- Kiosk / self-order terminal modu
- Marka özelleştirme (logo, renk, domain)

---

## 6. Rekabet ve Konumlandırma

**Mevcut konum:** Demo / MVP — pilot restoran ve yatırımcı sunumu için uygun.

**Hedef konum:** KOBİ restoranlar (kafe, a la carte, küçük-orta ölçek) için SaaS POS.

**Rakip farklılaştırma önerileri:**
- QR müşteri menüsü + garson çağırma (zaten var)
- Sesli komut ve komut paleti (niş avantaj)
- Modern UX (çoğu yerel POS eski arayüzlü)
- Hızlı kurulum, düşük aylık maliyet
- Türkiye mali mevzuatına tam uyum (henüz yok — kritik boşluk)

---

## 7. Riskler

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Mock backend ile canlıya çıkış | Yüksek | Kritik | Faz 1 tamamlanmadan satış yapılmamalı |
| Mali uyumsuzluk (ceza) | Orta | Kritik | ÖKC / e-Fatura entegrasyonu zorunlu |
| Yoğun saatte çökme | Orta | Yüksek | Yük testi + offline mod |
| Veri güvenliği ihlali | Orta | Kritik | KVKK + güvenli auth |
| Donanım uyumsuzluğu | Yüksek | Orta | ESC/POS standart yazıcı desteği |

---

## 8. Sonuç ve Öneriler

### Mevcut durum özeti
- **2 uygulama yüzeyi** (personel + müşteri)
- **14 işlevsel ekran**
- **3 rol profili** (admin, garson, mutfak)
- **11 personel modülü** + ayarlar + login

### Ticari satış için minimum gereksinimler
1. Production backend + güvenli kimlik doğrulama
2. Termal yazıcı + mutfak fişi
3. POS / yazar kasa entegrasyonu
4. Offline sipariş desteği
5. KVKK uyumu ve audit log
6. E2E test + staging ortamı

### Önerilen ilk adım
**Faz 1 (Backend + Auth + Multi-tenant)** ile başlanması; mevcut React frontend'in API katmanı korunarak kademeli geçiş yapılması en düşük riskli yoldur.

---

## Ek: Proje Çalıştırma

```bash
# Bağımlılıklar
npm install

# API sunucusu (port 3001)
npm run server

# Frontend (port 5173)
npm run dev

# İkisi birlikte
npm run dev:all
```

**Demo giriş:** PIN `1234` (tüm hesaplar)

---

## İlgili Dokümanlar

- [Teknik Durum Raporu](./TEKNIK-DURUM.md)
- [Domain Model Analizi](./DOMAIN-ANALIZI.md)
- [Geliştirme Yol Haritası](./YOL-HARITASI.md)

---

*Bu rapor Akıllı Garson v2.0.0 kod tabanına dayanarak hazırlanmıştır.*
