# Menu Domain Tasarımı

> **Tarih:** 2 Temmuz 2026  
> **Versiyon:** 1.0.0  
> **Perspektif:** Staff DDD Uzmanı / Restaurant POS Mimarı  
> **Durum:** Domain tasarımı — kod yok  
> **Referans:** [MIMARI-TASARIM.md](./MIMARI-TASARIM.md) · [IS-KURALLARI.md](./IS-KURALLARI.md) · [archive/DOMAIN-ANALIZI.md](./archive/DOMAIN-ANALIZI.md)

---

# 1. Domain Analizi

## 1.1 Menu Domain'in Sorumluluğu

Menu Domain, restoranın **satılabilir ürün kataloğunun tek doğruluk kaynağı (catalog source of truth)** olmakla sorumludur. Bir ürünün *ne olduğunu*, *nasıl sunulduğunu*, *hangi kanallarda göründüğünü*, *hangi fiyatla satıldığını* ve *hangi özelleştirmelerle sipariş edilebileceğini* tanımlar.

**Temel soruları yanıtlar:**
- Müşteri/garson ne sipariş edebilir?
- Bu ürün şu an kaça satılıyor?
- Hangi modifier'lar zorunlu/opsiyonel?
- Ürün QR menüde mi, sadece garson terminalinde mi?
- Mutfak hangi istasyona düşecek?
- Reçete hangi hammaddeleri tüketir? (referans — stok Inventory'de)

## 1.2 Kapsam (In Scope)

| Alan | Açıklama |
|------|----------|
| **Kategori yapısı** | Menü gruplama, sıralama, görünürlük |
| **MenuItem yaşam döngüsü** | Draft → Active → 86 → Hidden → Archived |
| **Fiyatlandırma** | Baz fiyat, şube override, kanal fiyatı, zaman bazlı fiyat (Happy Hour) |
| **Modifier sistemi** | Grup, seçim kuralları (min/max), fiyat etkisi |
| **Availability** | Kanal, gün/saat, mevsimsellik |
| **Etiketleme** | Alerjen, diyet, kampanya etiketi, arama/filtre |
| **Reçete referansı** | MenuItem ↔ hammadde BOM (Inventory ile entegrasyon noktası) |
| **Vergi sınıflandırması** | MenuItem hangi vergi oranına tabi (Tax referansı) |
| **Combo/Bundle tanımı** | Sabit menü paketleri |
| **Menü yayınlama** | QR/public menü için publish snapshot |
| **Mutfak yönlendirme** | KitchenStation ataması (referans) |

## 1.3 Kapsam Dışı (Out of Scope)

| Alan | Neden dışarıda | Hangi BC sorumlu |
|------|----------------|------------------|
| Sipariş oluşturma / kalemler | Ticari işlem Order BC'de | **Ordering** |
| Fiyat snapshot (sipariş anı) | OrderLine oluşturulurken Order BC alır | **Ordering** |
| Stok miktarı / düşüm | Fiziksel envanter | **Inventory** |
| Ödeme / indirim uygulama | Tahsilat | **Payments / Promotions** |
| Kampanya motoru (kural değerlendirme) | "2 al 1 öde" gibi kurallar | **Promotions** |
| Mutfak ticket durumu | Üretim operasyonu | **Kitchen** |
| QR token / müşteri oturumu | Erişim kontrolü | **Customer (QR)** |
| Fiş / KDV dökümü hesaplama | Yasal belge | **Payments / Fiscal** |
| Personel yetkilendirme | RBAC | **Auth / Employees** |
| Raporlama aggregasyonları | Read model | **Reports** |

> **Kural:** Menu Domain *tanımlar*; Order Domain *anlık snapshot alır*; Inventory *stok durumuna göre Menu'ye 86 sinyali gönderir*.

## 1.4 Bounded Context

```
┌─────────────────────────────────────────────────────────────────┐
│                     RESTAURANT PLATFORM                          │
│                                                                  │
│  ┌──────────────┐    publishes     ┌──────────────┐             │
│  │    MENU      │ ───────────────► │   ORDERING   │             │
│  │  (Catalog)   │ ◄── queries ──── │  (Commerce)  │             │
│  └──────┬───────┘                  └──────────────┘             │
│         │ events                                                 │
│         ▼                                                        │
│  ┌──────────────┐    MenuItem86ed   ┌──────────────┐             │
│  │  INVENTORY   │ ───────────────► │    MENU      │             │
│  │   (Stock)    │                  │  (react 86)  │             │
│  └──────────────┘                  └──────────────┘             │
│                                                                  │
│  ┌──────────────┐    read menu     ┌──────────────┐             │
│  │    MENU      │ ◄─────────────── │   CUSTOMER   │             │
│  │  (published) │                  │     (QR)     │             │
│  └──────────────┘                  └──────────────┘             │
│                                                                  │
│  ┌──────────────┐    station ref    ┌──────────────┐             │
│  │    MENU      │ ───────────────► │   KITCHEN    │             │
│  └──────────────┘                  └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Context Map ilişkileri:**

| İlişki | Partner BC | Tip | Açıklama |
|--------|------------|-----|----------|
| Menu → Ordering | Ordering | **Published Language** | MenuItemId, Price, Modifier seçenekleri contract olarak expose edilir |
| Inventory → Menu | Inventory | **Customer-Supplier** | `MenuItem86ed` / `MenuItemRestocked` eventleri |
| Menu → Kitchen | Kitchen | **Shared Kernel (ID only)** | `kitchenStationId` referansı |
| Settings → Menu | Settings | **Conformist** | Varsayılan vergi, para birimi |
| Promotions → Menu | Promotions | **ACL** | Kampanya etiketi; fiyat indirimi Promotions hesaplar |
| Customer → Menu | Customer | **Read-only ACL** | Published menu snapshot okur |

**Ubiquitous Language (Menu BC):**

| Terim | Anlam |
|-------|-------|
| **MenuItem** | Satılabilir ürün tanımı (aggregate root) |
| **86 / OutOfStock** | Restoran jargonu: ürün bitti, sipariş alınamaz |
| **Modifier** | Ürün özelleştirme seçeneği ("ekstra peynir", "az pişmiş") |
| **Publish** | Menünün QR/müşteri kanalına yayınlanması |
| **Channel** | Satış kanalı: dine-in, QR, takeaway, delivery |
| **Price List** | Şube/kanal/zaman bazlı fiyat tablosu |
| **Placement** | Ürünün bir kategorideki görünüm konumu |

---

# 2. Entity Tasarımı

## 2.1 Aggregate Sınırları

| Aggregate Root | İçindeki Entity'ler | Gerekçe |
|----------------|---------------------|---------|
| **Category** | — (tek entity root) | Bağımsız gruplama; MenuItem'dan ayrı lifecycle |
| **MenuItem** | MenuPrice*, MenuAvailability*, MenuTag*, CategoryPlacement*, ModifierGroupAttachment* | Ürün + fiyat/availability birlikte tutarlılık gerektirir |
| **ModifierGroup** | Modifier[] | Grup kuralları (min/max) modifier'larla atomik |
| **Recipe** | RecipeItem[] | BOM bütünlüğü; Inventory ile senkron |
| **ComboMenu** | ComboComponent[] | Paket bileşenleri birlikte geçerli |
| **Tax** | — | Referans entity; Settings BC ile paylaşılabilir |

*\*MenuItem aggregate içinde entity; ayrı aggregate değil.*

---

## 2.2 Category

| Boyut | Detay |
|-------|-------|
| **Amaç** | Menüde ürünleri gruplayan, sıralayan ve görünürlüğünü yöneten organizasyon birimi |
| **Sorumluluk** | Ad, görsel kimlik (icon/color), display order, kanal görünürlüğü, aktif/pasif durumu |
| **Yaşam döngüsü** | `Active` ↔ `Hidden` → `Archived` (Draft gerekmez — kategori boş oluşturulabilir) |
| **İlişkiler** | MenuItem (N:M via CategoryPlacement), Restaurant (N:1), Branch (opsiyonel override) |

**Not:** MenuItem tek bir **primary category** taşır (raporlama için); ek **placement**'lar QR menüde farklı bölümlerde göstermek içindir.

---

## 2.3 MenuItem ⭐ (Aggregate Root)

| Boyut | Detay |
|-------|-------|
| **Amaç** | Restoranın sattığı tekil ürün/hizmet tanımı |
| **Sorumluluk** | Ad, açıklama, SKU, görsel, hazırlık süresi, kalori, alerjen, durum, mutfak istasyonu, vergi sınıfı, kanal uygunluğu |
| **Yaşam döngüsü** | Bkz. Bölüm 5 — State Machine |
| **İlişkiler** | Category (N:M), ModifierGroup (N:M attachment), MenuPrice (1:N), MenuAvailability (1:N), Recipe (0:1), Tax (N:1), KitchenStation (N:1 ref), ComboMenu (component olarak) |

**Invariant'lar:**
- Active olmak için en az bir geçerli fiyat ve primary category zorunlu
- Archived ürün sipariş edilemez
- SKU restaurant içinde benzersiz

---

## 2.4 ModifierGroup

| Boyut | Detay |
|-------|-------|
| **Amaç** | İlişkili modifier seçeneklerini gruplayan ve seçim kurallarını tanımlayan birim |
| **Sorumluluk** | Grup adı, min/max seçim, zorunluluk, display order, tek/çoklu seçim modu |
| **Yaşam döngüsü** | `Active` → `Archived` (gruptaki tüm modifier'lar etkilenir ama silinmez) |
| **İlişkiler** | Modifier (1:N), MenuItem (N:M via attachment — min/max override edilebilir) |

**Örnek:** "Pişirme derecesi" — min=1, max=1, required=true

---

## 2.5 Modifier

| Boyut | Detay |
|-------|-------|
| **Amaç** | Tekil özelleştirme seçeneği |
| **Sorumluluk** | Ad, fiyat delta (+/-), varsayılan seçili mi, display order, stok etkisi flag |
| **Yaşam döngüsü** | `Active` → `Unavailable` → `Archived` |
| **İlişkiler** | ModifierGroup (N:1), RecipeItem (opsiyonel — ek malzeme tüketimi) |

---

## 2.6 MenuPrice

| Boyut | Detay |
|-------|-------|
| **Amaç** | MenuItem için context-aware fiyat tanımı |
| **Sorumluluk** | Tutar, para birimi, geçerlilik aralığı, kanal, şube, öncelik (override hierarchy) |
| **Yaşam döngüsü** | `Scheduled` → `Active` → `Expired` / `Superseded` |
| **İlişkiler** | MenuItem (N:1), Branch (N:1 opsiyonel), SalesChannel (N:1 opsiyonel) |

**Fiyat çözümleme sırası (yüksek → düşük öncelik):**
1. Branch + Channel + Time window (Happy Hour)
2. Branch + Channel
3. Branch default
4. Restaurant default (base price)

---

## 2.7 MenuAvailability

| Boyut | Detay |
|-------|-------|
| **Amaç** | Ürünün hangi koşullarda sipariş edilebilir/görünebilir olduğunu tanımlar |
| **Sorumluluk** | Kanal, gün/saat penceresi, başlangıç/bitiş tarihi, görünürlük vs sipariş edilebilirlik ayrımı |
| **Yaşam döngüsü** | `Active` → `Expired` (zaman dolunca otomatik) |
| **İlişkiler** | MenuItem (N:1) |

**Ayrım:**
- `isVisible` — menüde göster
- `isOrderable` — sipariş alınabilir (staff override ile farklı olabilir)

---

## 2.8 MenuTag

| Boyut | Detay |
|-------|-------|
| **Amaç** | Filtreleme, arama, kampanya işaretleme, diyet bilgisi |
| **Sorumluluk** | Tag adı, tip (allergen/diet/campaign/custom), renk, icon |
| **Yaşam döngüsü** | `Active` → `Archived` |
| **İlişkiler** | MenuItem (N:M) |

**Not:** Alerjen hem MenuTag hem ayrı `Allergen` referans entity olabilir — yasal zorunluluk için structured allergen tercih edilir.

---

## 2.9 Recipe

| Boyut | Detay |
|-------|-------|
| **Amaç** | MenuItem'ın üretimi için gereken hammadde listesi (Bill of Materials) |
| **Sorumluluk** | Versiyon, porsiyon bazlı malzeme miktarları, fire/waste oranı |
| **Yaşam döngüsü** | `Draft` → `Active` → `Superseded` (yeni versiyon) → `Archived` |
| **İlişkiler** | MenuItem (1:1 veya 1:N versiyon), RecipeItem (1:N), InventoryItem (N:M ref — Inventory BC) |

**Sınır:** Recipe Menu BC'de tanımlanır; stok miktarı Inventory BC'de tutulur.

---

## 2.10 RecipeItem

| Boyut | Detay |
|-------|-------|
| **Amaç** | Reçetedeki tekil hammadde satırı |
| **Sorumluluk** | InventoryItem referansı, miktar, birim, opsiyonel mi |
| **Yaşam döngüsü** | Recipe ile birlikte versiyonlanır |
| **İlişkiler** | Recipe (N:1), InventoryItem (N:1 ref) |

---

## 2.11 Tax

| Boyut | Detay |
|-------|-------|
| **Amaç** | Vergi sınıflandırması referansı (%1, %10, %20 KDV vb.) |
| **Sorumluluk** | Oran, ad, kod, varsayılan mı, aktif mi |
| **Yaşam döngüsü** | `Active` → `Archived` (geçmiş siparişler snapshot kullandığı için silinmez) |
| **İlişkiler** | MenuItem (1:N), Settings BC (kaynak) |

**Sınır kararı:** Tax entity Settings BC'de master; Menu BC sadece `taxCategoryId` referansı tutar.

---

## 2.12 Önerilen Eksik Entity'ler

| Entity | Amaç | Öncelik |
|--------|------|---------|
| **CategoryPlacement** | MenuItem'ın kategorideki konumu (N:M junction + displayOrder) | 🔴 Yüksek |
| **ComboMenu / ComboBundle** | Sabit paket menü ("Burger Menü = burger + patates + içecek") | 🔴 Yüksek |
| **ComboComponent** | Combo içindeki bileşen (MenuItem ref + qty + override modifier) | 🔴 Yüksek |
| **MenuPublication** | QR menü publish snapshot (versiyon, publishedAt, hash) | 🔴 Yüksek |
| **SalesChannel** | dine-in, qr, takeaway, delivery, aggregator | 🟡 Orta |
| **BranchMenuOverride** | Şube bazlı visibility/availability override özeti | 🟡 Orta |
| **Allergen** | Yasal alerjen listesi (structured, ISO kodlu) | 🟡 Orta |
| **KitchenStation** | Mutfak istasyon referansı (Kitchen BC master) | 🟡 Orta |
| **PriceSchedule** | Happy Hour / gün bazlı otomatik fiyat kuralları | 🟡 Orta |
| **MenuItemMedia** | Görsel/video asset yönetimi | 🟢 Düşük |
| **PortionSize** | "Yarım / Tam / Büyük" porsiyon varyantları | 🟡 Orta |

---

# 3. Value Object Tasarımı

| Value Object | Gerekli mi? | Gerekçe |
|--------------|-------------|---------|
| **Money** | ✅ **Evet** | Para birimi + tutar birlikte; float yasak; fiyat hesaplarında zorunlu |
| **Portion** | ✅ **Evet** | Porsiyon varyantları (Yarım/Tam) fiyat ve reçeteyi etkiler |
| **Calories** | ⚠️ **Opsiyonel** | Bilgilendirme amaçlı; VO olarak `Calories(kcal, perPortion)` yeterli |
| **PreparationTime** | ✅ **Evet** | `Duration` + `unit`; mutfak SLA ve müşteri beklenti yönetimi |
| **SKU** | ✅ **Evet** | Format validasyonu, restaurant-scoped uniqueness |
| **DisplayOrder** | ✅ **Evet** | Negatif olamaz; kategori/iç sıralama tutarlılığı |
| **TaxRate** | ✅ **Evet** | Oran + inclusive/exclusive flag; Money ile birlikte hesap |
| **AvailabilityPeriod** | ✅ **Evet** | dayOfWeek + timeRange + dateRange; MenuAvailability'nin çekirdeği |
| **AllergenCode** | ✅ **Evet** | Structured alerjen (EU 14, TR mevzuat); serbest metin yetersiz |
| **PriceDelta** | ✅ **Evet** | Modifier fiyat etkisi; Money'den türetilir |
| **SelectionRule** | ✅ **Evet** | min/max/required — ModifierGroup invariant'ı |
| **MenuItemSnapshot** | ✅ **Evet** | Order BC'ye geçen immutable catalog anlık görüntüsü (ACL çıkışı) |
| **LocalizedText** | ⚠️ **Sonra** | Çoklu dil menü için; MVP'de tek dil string yeterli |
| **NutritionInfo** | ⚠️ **Sonra** | Kalori + protein + yağ; Calories'ı genişletir |
| **ImageUrl** | ❌ **Hayır** | Basit URL string; ayrı VO over-engineering |
| **Slug** | ⚠️ **Opsiyonel** | QR deep link için faydalı; SKU yeterli olabilir |

---

# 4. Business Rules (42 Kural)

## Yaşam Döngüsü & Durum

| # | Kural |
|---|-------|
| BR-M01 | `Draft` durumundaki MenuItem müşteri kanallarında görünmez |
| BR-M02 | `Draft` → `Active` geçişi için: ad, primary category, base price, taxCategory zorunlu |
| BR-M03 | `Active` durumundaki ürün en az bir `Active` fiyat kaydına sahip olmalı |
| BR-M04 | `OutOfStock` (86) ürün QR menüde görünebilir ama sipariş edilemez (restoran tercihine göre configurable) |
| BR-M05 | `Hidden` ürün müşteri menüsünde görünmez; staff terminalinden sipariş edilebilir |
| BR-M06 | `Archived` ürün hiçbir kanaldan sipariş edilemez |
| BR-M07 | `Archived` ürün geri yüklenebilir → `Draft` veya doğrudan `Active` (yetkiye bağlı) |

## Fiyatlandırma

| # | Kural |
|---|-------|
| BR-M08 | Fiyat negatif olamaz (modifier delta hariç indirim modifier'ı negatif delta olabilir) |
| BR-M09 | Para birimi restaurant settings ile uyumlu olmalı |
| BR-M10 | Şube override, restaurant base fiyatını ezer |
| BR-M11 | Kanal fiyatı (delivery), şube fiyatını ezer |
| BR-M12 | Zaman bazlı fiyat (Happy Hour) aktif pencerede en yüksek önceliğe sahip |
| BR-M13 | Fiyat değişikliği mevcut açık siparişleri etkilemez — Order snapshot kullanır |
| BR-M14 | Gelecek tarihli fiyat (`Scheduled`) otomatik `Active` olur (scheduler job) |
| BR-M15 | Aynı context (branch+channel+time) için tek aktif fiyat olabilir |

## Modifier

| # | Kural |
|---|-------|
| BR-M16 | Zorunlu modifier grubu (`required=true`) sipariş tamamlanmadan seçilmeli |
| BR-M17 | min seçim sayısı > 0 ise grup zorunlu sayılır |
| BR-M18 | max seçim sayısı aşılamaz |
| BR-M19 | Tek seçim grubunda (max=1) birden fazla modifier seçilemez |
| BR-M20 | `Unavailable` modifier seçilemez; mevcut siparişlerde snapshot korunur |
| BR-M21 | Modifier fiyat deltası base fiyata eklenir (Order BC hesaplar) |
| BR-M22 | MenuItem'a bağlı modifier grubu kaldırılırsa yeni siparişler etkilenir; açık siparişler etkilenmez |

## Kategori & Görünürlük

| # | Kural |
|---|-------|
| BR-M23 | Boş kategori (ürün yok) QR menüde gizlenebilir (configurable) |
| BR-M24 | Aynı MenuItem birden fazla kategoride **placement** ile gösterilebilir |
| BR-M25 | Primary category raporlama ve varsayılan gruplama için tektir |
| BR-M26 | `Archived` kategorideki ürünler o kategoride görünmez |
| BR-M27 | Kategori display order benzersiz olmak zorunda değil; UI sort tie-breaker kullanır |

## Availability & Kanal

| # | Kural |
|---|-------|
| BR-M28 | Availability penceresi dışında ürün sipariş edilemez |
| BR-M29 | QR kanalı için ayrı availability tanımlanabilir |
| BR-M30 | Paket servis kanalında bazı ürünler (dökkebaklı) otomatik exclude edilebilir |
| BR-M31 | `isVisible=false, isOrderable=true` kombinasyonu staff-only siparişe izin verir |

## Stok & Reçete Entegrasyonu

| # | Kural |
|---|-------|
| BR-M32 | Inventory `MenuItem86ed` gönderdiğinde MenuItem → `OutOfStock` |
| BR-M33 | Stok yenilenince Inventory `MenuItemRestocked` → MenuItem `Active`'e dönebilir (configurable auto) |
| BR-M34 | Reçetesi olmayan ürün stok takibi yapılmaz (Inventory ignore) |
| BR-M35 | Modifier'ın reçete etkisi varsa ek hammadde düşümü Inventory BC'de |

## Combo & Vergi

| # | Kural |
|---|-------|
| BR-M36 | Combo fiyatı bileşen fiyatları toplamından düşük olabilir (paket indirimi) |
| BR-M37 | Combo bileşenlerinden biri 86 ise combo sipariş edilemez |
| BR-M38 | MenuItem vergi sınıfı değiştiğinde açık siparişler etkilenmez |
| BR-M39 | Tax oranı 0 olan ürünler (su vb.) ayrı raporlanır |

## Yayınlama & Çoklu Şube

| # | Kural |
|---|-------|
| BR-M40 | Menü değişiklikleri QR'da anında değil **publish** sonrası yansır |
| BR-M41 | Publish sırasında consistency snapshot alınır (MenuPublication) |
| BR-M42 | Şube menüsü, merkez menüsünün override'ıdır — silinen şube override → merkez fiyatına döner |

---

# 5. State Machine — MenuItem

```
                    ┌──────────────────────────────────────┐
                    │                                      │
                    ▼                                      │
┌─────────┐   publish/    ┌─────────┐   86/manual   ┌─────────────┐
│  DRAFT  │───activate───►│ ACTIVE  │──────────────►│ OUT_OF_STOCK│
└─────────┘               └────┬────┘               └──────┬──────┘
     ▲                         │                           │
     │                         │ hide                      │ restock
     │ restore                 ▼                           │
     │                    ┌─────────┐                      │
     │                    │ HIDDEN  │                      │
     │                    └────┬────┘                      │
     │                         │ unhide                    │
     │                         └──────────► ACTIVE ◄───────┘
     │                                      │
     │         archive (any except Draft*)  │
     │                                      ▼
     └──────── restore ──────────────  ┌───────────┐
                                       │ ARCHIVED  │
                                       └───────────┘
```

## Durum Tanımları

| Durum | Anlam | QR Görünür | Sipariş |
|-------|-------|------------|---------|
| **Draft** | Taslak, hazırlanıyor | ❌ | ❌ |
| **Active** | Satışta | ✅* | ✅ |
| **OutOfStock** | 86 — stok bitti | ⚠️ Config | ❌ |
| **Hidden** | Gizli — staff only | ❌ | ✅ (staff) |
| **Archived** | Kaldırıldı | ❌ | ❌ |

*\* Availability ve publish kurallarına tabi*

## Geçiş Tablosu

| From | Event/Action | To | Guard (Koşul) |
|------|--------------|-----|---------------|
| Draft | `ActivateMenuItem` | Active | name, category, price, tax valid |
| Draft | `ArchiveMenuItem` | Archived | — |
| Active | `MarkOutOfStock` / `MenuItem86ed` | OutOfStock | — |
| Active | `HideMenuItem` | Hidden | — |
| Active | `ArchiveMenuItem` | Archived | açık sipariş yok* |
| OutOfStock | `RestockMenuItem` | Active | Inventory onayı |
| OutOfStock | `HideMenuItem` | Hidden | — |
| OutOfStock | `ArchiveMenuItem` | Archived | — |
| Hidden | `UnhideMenuItem` | Active | — |
| Hidden | `ArchiveMenuItem` | Archived | — |
| Archived | `RestoreMenuItem` | Draft | manager yetkisi |
| Archived | `RestoreMenuItem` | Active | manager yetkisi + validasyon |

*\*Archive için Ordering BC'den "açık siparişte kullanılıyor mu" sorgusu ( eventual check )*

---

# 6. Domain Events

## 6.1 Menu BC Tarafından Publish Edilen Eventler

| Event | Tetikleyici | Payload özeti | Öncelik |
|-------|-------------|---------------|---------|
| `MenuItemCreated` | CreateMenuItem | menuItemId, restaurantId, name, categoryId | 🔴 |
| `MenuItemActivated` | ActivateMenuItem | menuItemId, activatedAt | 🔴 |
| `MenuItemDeactivated` | Deactivate/Hide | menuItemId, reason | 🟡 |
| `MenuItemOutOfStock` | MarkOutOfStock / 86 | menuItemId, reason, source | 🔴 |
| `MenuItemRestocked` | RestockMenuItem | menuItemId | 🟡 |
| `MenuItemHidden` | HideMenuItem | menuItemId | 🟡 |
| `MenuItemArchived` | ArchiveMenuItem | menuItemId | 🔴 |
| `MenuItemRestored` | RestoreMenuItem | menuItemId, targetStatus | 🟡 |
| `MenuPriceChanged` | ChangePrice / SchedulePrice | menuItemId, oldPrice, newPrice, context | 🔴 |
| `MenuPriceScheduled` | SchedulePrice | menuItemId, effectiveAt | 🟡 |
| `ModifierGroupAttached` | AttachModifierGroup | menuItemId, groupId | 🟡 |
| `ModifierGroupDetached` | DetachModifierGroup | menuItemId, groupId | 🟡 |
| `ModifierAdded` | AddModifier | groupId, modifierId | 🟡 |
| `ModifierRemoved` | RemoveModifier | groupId, modifierId | 🟡 |
| `ModifierUnavailable` | MarkModifierUnavailable | modifierId | 🟡 |
| `AvailabilityChanged` | ToggleAvailability / SetSchedule | menuItemId, channel, period | 🔴 |
| `RecipeUpdated` | UpdateRecipe | menuItemId, recipeId, version | 🟡 |
| `CategoryCreated` | CreateCategory | categoryId | 🟢 |
| `CategoryReordered` | ReorderCategories | order[] | 🟢 |
| `MenuPublished` | PublishMenu | publicationId, version, itemCount | 🔴 |
| `ComboMenuCreated` | CreateCombo | comboId, components[] | 🟡 |

## 6.2 Menu BC Tarafından Subscribe Edilen Eventler

| Event | Kaynak BC | Menu BC Tepkisi |
|-------|-----------|-----------------|
| `MenuItem86ed` | Inventory | MenuItem → OutOfStock; `MenuItemOutOfStock` publish |
| `MenuItemRestocked` | Inventory | OutOfStock → Active (auto veya manual) |
| `InventoryItemDepleted` | Inventory | Recipe'de kullanılan hammadde biterse ilişkili MenuItem'ları 86 et (cascade rule) |
| `TaxRateUpdated` | Settings | Yeni siparişler yeni oranı kullanır; bilgilendirme eventi |
| `BranchCreated` | Tenant/Settings | Branch default price list seed |
| `PromotionTagRequested` | Promotions | MenuTag ekleme/kaldırma (ACL) |

## 6.3 Event Subscriber Matrisi

| Event | Ordering | Kitchen | Inventory | Customer/QR | Reports | Notifications | WebSocket |
|-------|----------|---------|-----------|-------------|---------|---------------|-----------|
| MenuItemOutOfStock | ✅ cache invalidate | ✅ KDS uyarı | — | ✅ menü güncelle | — | ✅ garson | ✅ |
| MenuPriceChanged | ✅ pricing cache | — | — | ⚠️ publish sonrası | ✅ | — | ✅ |
| MenuPublished | — | — | — | ✅ yeni snapshot | — | — | ✅ |
| RecipeUpdated | — | ✅ prep info | ✅ BOM sync | — | — | — | — |
| MenuItemArchived | ✅ validate refs | ✅ | ✅ | ✅ | — | — | ✅ |

---

# 7. API Use Cases (Business Actions)

> CRUD yok. Her use case bir **intent** ifade eder.

## 7.1 MenuItem Yaşam Döngüsü

| Use Case | Açıklama | Actor | Önkoşul |
|----------|----------|-------|---------|
| **CreateMenuItem** | Yeni ürün taslağı oluşturur (Draft) | Manager | — |
| **UpdateMenuItemDetails** | Ad, açıklama, görsel, hazırlık süresi, kalori günceller | Manager | Draft veya Active |
| **ActivateMenuItem** | Draft → Active; validasyon çalıştırır | Manager | Zorunlu alanlar dolu |
| **DeactivateMenuItem** | Active → Draft (geçici kaldırma) | Manager | — |
| **HideMenuItem** | Active → Hidden (staff only) | Manager | — |
| **UnhideMenuItem** | Hidden → Active | Manager | — |
| **MarkOutOfStock** | Active → OutOfStock (manuel 86) | Manager/Inventory | — |
| **RestockMenuItem** | OutOfStock → Active | Manager/Inventory | Stok onayı |
| **ArchiveMenuItem** | Herhangi durum → Archived (soft delete) | Manager | — |
| **RestoreMenuItem** | Archived → Draft/Active | Admin | — |
| **AssignPrimaryCategory** | Primary category atar | Manager | Category Active |
| **AddCategoryPlacement** | Ek kategori gösterimi ekler | Manager | N:M placement |
| **RemoveCategoryPlacement** | Ek kategori kaldırır | Manager | Primary silinemez |
| **AssignKitchenStation** | Mutfak istasyonu atar | Manager | Station exists |

## 7.2 Fiyatlandırma

| Use Case | Açıklama | Actor |
|----------|----------|-------|
| **SetBasePrice** | Restaurant geneli baz fiyat | Manager |
| **ChangePrice** | Anında fiyat değişikliği | Manager |
| **SetBranchPrice** | Şube override fiyat | Branch Manager |
| **SetChannelPrice** | Kanal bazlı fiyat (delivery markup) | Manager |
| **SchedulePrice** | Gelecek fiyat (Happy Hour, zam) | Manager |
| **CancelScheduledPrice** | Planlanmış fiyat iptali | Manager |
| **ResolveEffectivePrice** | Query: context'e göre fiyat hesapla | System/Order BC |

## 7.3 Modifier Yönetimi

| Use Case | Açıklama | Actor |
|----------|----------|-------|
| **CreateModifierGroup** | Yeni modifier grubu | Manager |
| **AddModifier** | Gruba modifier ekler | Manager |
| **UpdateModifier** | Modifier ad/fiyat delta günceller | Manager |
| **MarkModifierUnavailable** | Modifier geçici kapat | Manager |
| **AttachModifierGroup** | MenuItem'a grup bağlar | Manager |
| **DetachModifierGroup** | MenuItem'tan grup ayırır | Manager |
| **OverrideGroupRules** | Item bazında min/max override | Manager |

## 7.4 Availability & Kanal

| Use Case | Açıklama | Actor |
|----------|----------|-------|
| **SetAvailabilitySchedule** | Gün/saat bazlı müsaitlik | Manager |
| **ToggleAvailability** | Hızlı aç/kapa | Manager/Waiter* |
| **SetChannelVisibility** | Kanal bazlı görünürlük | Manager |
| **ExcludeFromChannel** | Belirli kanaldan çıkar (delivery exclude) | Manager |

*\*Waiter yetkisi configurable — genelde sadece 86 toggle*

## 7.5 Reçete & Combo

| Use Case | Açıklama | Actor |
|----------|----------|-------|
| **CreateRecipe** | MenuItem için BOM oluştur | Manager |
| **UpdateRecipe** | Reçete revizyon (versiyon artar) | Manager |
| **CreateComboMenu** | Paket menü tanımı | Manager |
| **UpdateComboComponents** | Combo bileşenlerini güncelle | Manager |
| **ActivateCombo** | Combo'yu satışa aç | Manager |

## 7.6 Kategori & Yayınlama

| Use Case | Açıklama | Actor |
|----------|----------|-------|
| **CreateCategory** | Yeni kategori | Manager |
| **RenameCategory** | Kategori adı değiştir | Manager |
| **ReorderCategories** | Sıralama güncelle | Manager |
| **HideCategory** | Kategoriyi gizle | Manager |
| **PublishMenu** | QR/public menü snapshot yayınla | Manager |
| **RollbackMenuPublication** | Önceki publish versiyonuna dön | Admin |

## 7.7 Sorgular (Query — CQRS Read Side)

| Query | Açıklama | Tüketici |
|-------|----------|----------|
| **GetMenuForChannel** | Kanal + şube + zaman için filtrelenmiş menü | QR, POS |
| **GetMenuItemDetail** | Tek ürün detay + modifier + fiyat | POS, QR |
| **GetEffectivePrice** | Context-aware fiyat | Order BC |
| **GetMenuItemSnapshot** | Order line için immutable snapshot | Order BC |
| **ValidateModifierSelection** | Seçim kuralları doğrulama | Order BC |
| **GetPublishedMenu** | Son publish snapshot | Customer BC |

## 7.8 QR (Customer BC orchestration)

| Use Case | Açıklama | Not |
|----------|----------|-----|
| **GenerateQRCode** | Masa/branch QR üretimi | Customer BC sorumlu; Menu sadece published URL referansı |

---

# 8. Edge Cases (30+)

| # | Senaryo | Sistem Davranışı |
|---|---------|------------------|
| EC-M01 | Ürün sipariş edilirken fiyat değişti | Order BC sipariş anında `MenuItemSnapshot` + `Money` snapshot almış olmalı; değişiklik mevcut siparişi etkilemez |
| EC-M02 | Modifier sipariş sırasında silindi | Açık sipariş: snapshot korunur. Yeni sipariş: modifier listeden çıkar; zorunlu grup boşalırsa ürün geçici unavailable |
| EC-M03 | Menü publish edilirken yeni sipariş geldi | Publish eski snapshot'ı değiştirmez; yeni siparişler publish öncesi cache'den; publish sonrası yeni snapshot |
| EC-M04 | İki yönetici aynı anda fiyat değiştirdi | Optimistic locking (`version` field); ikinci işlem `ConflictException`; UI refresh + retry |
| EC-M05 | Stok bitti (86) ama 10 açık siparişte var | Mevcut siparişler devam; yeni sipariş reddedilir; `MenuItemOutOfStock` event |
| EC-M06 | Reçetedeki hammadde bitti, ürün hâlâ Active | Inventory cascade: ilişkili MenuItem otomatik 86 |
| EC-M07 | Combo bileşenlerinden biri 86 | Combo tamamı unavailable; QR'da "geçici olarak yok" |
| EC-M08 | Happy Hour biterken aktif sepet | Sepet checkout anında fiyat resolve; bitmişse normal fiyat veya kullanıcıya bilgi |
| EC-M09 | Ürün Archived ama favori siparişte | Yeni sipariş reddedilir; geçmiş sipariş görüntülemede snapshot isim gösterir |
| EC-M10 | Primary category silinmeye çalışılıyor | Reddet; önce primary değiştirilmeli |
| EC-M11 | Son ürün kategoriden archive edildi | Kategori boş kalır; configurable auto-hide |
| EC-M12 | Aynı SKU ile ikinci ürün oluşturma | Domain validasyon hatası; SKU unique per restaurant |
| EC-M13 | Modifier zorunlu grup ama tüm modifier'lar unavailable | MenuItem orderable=false; staff'e uyarı |
| EC-M14 | 50 modifier'lı grup (performans) | UI pagination; backend max limit config; validation timeout guard |
| EC-M15 | Vergi oranı değişti (KDV %10→%20) | Yeni siparişler yeni oran; açık hesaplar snapshot |
| EC-M16 | Şube override silindi | Merkez fiyatına fallback; `MenuPriceChanged` event |
| EC-M17 | Branch kapatıldı | Branch override'lar inactive; merkez menüsü fallback |
| EC-M18 | QR menü cache stale | TTL + `MenuPublished` WS push ile invalidate |
| EC-M19 | Gece yarısı availability geçişi | Scheduler job: availability state refresh; event publish |
| EC-M20 | Yaz saati değişimi | AvailabilityPeriod UTC + timezone aware |
| EC-M21 | Ürün 1000+ placement (edge) | Max placement limit; performans guard |
| EC-M22 | Recipe versiyon değişti, stok düşümü | Inventory yeni versiyon BOM kullanır; eski açık siparişler eski BOM |
| EC-M23 | Modifier'ın reçete etkisi — stok yetersiz | Order BC validation: modifier seçimi reddedilir |
| EC-M24 | Paket servis kanalında dökkebaklı ürün | `ExcludeFromChannel(delivery)` — otomatik filtre |
| EC-M25 | Kampanya etiketi süresi doldu | MenuTag unlink veya Promotions event; menüden badge kalkar |
| EC-M26 | Publish rollback | Önceki MenuPublication restore; QR anında eski menü |
| EC-M27 | Draft ürün yanlışlıkla QR'da | Draft asla publish snapshot'a girmez; validation gate |
| EC-M28 | Bulk import 500 ürün | Async job; Draft olarak import; ayrı Activate batch |
| EC-M29 | Aynı ürün farklı isimle duplicate | Dedup warning; SKU kontrol; manager onayı |
| EC-M30 | Müşteri eski QR scan (6 ay önce) | Token expiry Customer BC'de; menü URL geçerli ama session gerekli |
| EC-M31 | Concurrent Activate + Archive | Optimistic lock; biri başarısız; state tutarlı |
| EC-M32 | Fiyat 0 TL (promosyon ürün) | İzin verilebilir; manager yetkisi + audit log zorunlu |
| EC-M33 | Currency mismatch (çoklu para birimi) | MVP'de tek currency; multi-currency sonra |
| EC-M34 | Image URL broken | Menü fallback placeholder; sipariş etkilenmez |
| EC-M35 | Kitchen station silindi | MenuItem station → default station; uyarı eventi |

---

# 9. Sonuç

## ✅ Kesin Uygulanmasını Önerdiğim Tasarım

1. **MenuItem Aggregate Root** — fiyat, availability, placement, modifier attachment birlikte
2. **ModifierGroup ayrı aggregate** — grup kuralları atomik
3. **Money Value Object** — tüm fiyat alanları
4. **MenuItemSnapshot** — Order BC'ye ACL çıkışı; fiyat snapshot garantisi
5. **Business Action API** — Activate, ChangePrice, AttachModifier, PublishMenu vb.
6. **MenuItem State Machine** — Draft/Active/OutOfStock/Hidden/Archived
7. **CategoryPlacement (N:M)** — aynı ürün farklı kategorilerde
8. **MenuPrice hierarchy** — base → branch → channel → schedule
9. **MenuPublication snapshot** — QR menü tutarlılığı
10. **Domain Events** — Inventory, Kitchen, Customer, WS entegrasyonu
11. **Optimistic locking (version)** — concurrent edit koruması
12. **Tax referansı (taxCategoryId)** — Settings BC'den

## ⚠️ Daha Sonra Eklenebilecek Yapılar

| Yapı | Ne zaman |
|------|----------|
| **ComboMenu aggregate** | Modifier + fiyat stabil olduktan sonra |
| **PriceSchedule / Happy Hour** | Temel fiyatlandırma sonrası |
| **PortionSize varyantları** | Porsiyon bazlı fiyat ihtiyacı doğunca |
| **LocalizedText (çoklu dil)** | Uluslararası şube açılınca |
| **MenuItemMedia (CDN)** | Görsel yönetimi karmaşıklaşınca |
| **BranchMenuOverride özeti** | 5+ şube olunca |
| **Bulk import/export** | Migration ve onboarding |
| **Menu A/B testing** | Analytics olgunluğu |
| **NutritionInfo genişletme** | Regülasyon gereksinimi |
| **Dynamic pricing (AI/demand)** | Olgun operasyon verisi sonrası |

## ❌ Gereksiz Karmaşıklık Oluşturan Yapılar

| Yapı | Neden gereksiz (şimdilik) |
|------|---------------------------|
| MenuItem için ayrı microservice | Modular monolith yeterli |
| Her modifier için ayrı aggregate | ModifierGroup yeterli |
| ImageUrl Value Object | String yeterli |
| MenuItem CRUD PATCH endpoint | Business action'lar intent'i net ifade eder |
| Duplicate MenuItem per category | N:M placement daha temiz |
| Menu BC içinde stok miktarı tutma | Inventory sorumluluğu |
| Menu BC içinde kampanya kural motoru | Promotions BC |
| Anlık QR güncelleme (publish'siz) | Tutarsız müşteri deneyimi yaratır |
| 14 ayrı fiyat tablosu entity'si | MenuPrice + context hierarchy yeterli |
| Generic "MenuEntity" polymorphic model | Tip güvenliği ve domain clarity kaybı |

## 🚀 Implementation Sırası

| Faz | Kapsam | Bağımlılık | Süre tahmini |
|-----|--------|------------|--------------|
| **M1** | Category + MenuItem (Draft/Active/Archive) + Money + SKU | Auth, Tenant | 1 hf |
| **M2** | MenuPrice (base + branch) + ChangePrice + ResolveEffectivePrice | M1 | 0.5 hf |
| **M3** | ModifierGroup + Modifier + Attach/Detach + Validation | M1 | 1 hf |
| **M4** | MenuAvailability + Channel visibility + ToggleAvailability | M1 | 0.5 hf |
| **M5** | State machine tam (OutOfStock/Hidden) + Inventory 86 entegrasyonu | M1, Inventory stub | 0.5 hf |
| **M6** | MenuPublication + PublishMenu + GetPublishedMenu (QR) | M1-M4 | 0.5 hf |
| **M7** | MenuItemSnapshot ACL + Order BC entegrasyon contract | M2, M3 | 0.5 hf |
| **M8** | Recipe + RecipeItem + Inventory BOM event | M1, Inventory | 1 hf |
| **M9** | CategoryPlacement (N:M) + Reorder | M1 | 0.5 hf |
| **M10** | ComboMenu + ComboComponent | M3, M7 | 1 hf |
| **M11** | PriceSchedule (Happy Hour) | M2 | 0.5 hf |
| **M12** | MenuTag + Allergen + Tax referans | M1, Settings | 0.5 hf |

**Toplam tahmini:** ~8-9 hf (feature-complete Menu BC)

---

## İlgili Dokümanlar

- [MIMARI-TASARIM.md](./MIMARI-TASARIM.md) — §3.12 Menu Module, §5.8 API
- [archive/DOMAIN-ANALIZI.md](./archive/DOMAIN-ANALIZI.md) — §1.3 Menü, §2.4-2.5 Category/MenuItem
- [IS-KURALLARI.md](./IS-KURALLARI.md) — EC #16 MenuItem86ed
- [BACKEND-ISKELET.md](./BACKEND-ISKELET.md) — NestJS iskelet (Menu henüz yok)
