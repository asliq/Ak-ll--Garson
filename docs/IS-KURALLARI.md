# Akıllı Garson — Restoran İş Kuralları ve State Machine Tasarımı

**Tarih:** 2 Temmuz 2026  
**Versiyon:** 1.0.0  
**Perspektif:** DDD · Event Storming · Restaurant POS  
**Kapsam:** Kod yok — yalnızca iş kuralları, geçişler, eventler, edge case'ler

**Temel invariant:** Bir masada aynı anda **yalnızca bir aktif Order (açık hesap)** olabilir.

---

## İçindekiler

1. [Roller](#1-roller)
2. [Order Lifecycle](#2-order-lifecycle)
3. [Table Lifecycle](#3-table-lifecycle)
4. [Payment Lifecycle](#4-payment-lifecycle)
5. [Kitchen Ticket Lifecycle](#5-kitchen-ticket-lifecycle)
6. [Reservation Lifecycle](#6-reservation-lifecycle)
7. [Service Call Lifecycle](#7-service-call-lifecycle)
8. [Uçtan Uca Operasyon Akışı](#8-uçtan-uca-operasyon-akışı)
9. [Problemli Senaryolar (42 Edge Case)](#9-gerçek-restoranlarda-en-sık-karşılaşılan-problemli-senaryolar)
10. [Çapraz Kural Matrisi](#10-çapraz-kural-matrisi)
11. [Tasarım Prensipleri](#11-tasarım-prensipleri)

---

## 1. Roller

| Rol | Kısaltma | Açıklama |
|-----|----------|----------|
| Müşteri (QR) | `CUSTOMER` | QR self-servis oturumu |
| Garson | `WAITER` | Sipariş, servis, ödeme |
| Mutfak | `KITCHEN` | KDS, hazırlık durumu |
| Yönetici | `MANAGER` | İptal, void, indirim yetkisi, transfer onayı |
| Sistem | `SYSTEM` | Zamanlayıcı, senkron, stok, yazıcı kuyruğu |

---

## 2. Order Lifecycle

Sipariş aggregate'i masadaki **ticari hesabı** temsil eder. Kalem bazlı durumlar (OrderLine) ayrı izlenir; header durumu kalemlerin **aggregate projection**'ıdır.

### 2.1 Durumlar

| Durum | Anlam |
|-------|-------|
| `DRAFT` | Sepet oluşturuluyor; mutfağa gitmedi; iptal maliyetsiz |
| `OPEN` | Onaylanmış açık hesap; kalem eklenebilir |
| `IN_KITCHEN` | En az bir kalem mutfakta; servis tamamlanmadı |
| `PARTIALLY_SERVED` | Bazı kalemler servis edildi, bazıları mutfakta veya hazır bekliyor |
| `SERVED` | Tüm aktif kalemler masaya servis edildi; ödeme bekleniyor |
| `BILL_REQUESTED` | Müşteri hesap istedi; garson bilgilendirildi |
| `PAYMENT_IN_PROGRESS` | Ödeme ekranı açık veya split devam ediyor; hesap kilitli |
| `CLOSED` | Tam ödendi; mali kayıt kesinleşti; düzenlenemez |
| `CANCELLED` | Servis/ödeme öncesi iptal; audit zorunlu |
| `VOIDED` | Kapatıldıktan sonra yönetici iptali; iade/mali ters kayıt gerekir |

### 2.2 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| `DRAFT` → `OPEN` | Sipariş onaylandı / mutfağa fire | WAITER, CUSTOMER | `OrderOpened` |
| `DRAFT` → `CANCELLED` | Sepet terk edildi / iptal | WAITER, CUSTOMER, SYSTEM | `OrderCancelled` |
| `OPEN` → `IN_KITCHEN` | İlk kalem mutfağa düştü | SYSTEM | `OrderSentToKitchen` |
| `OPEN` → `OPEN` | Yeni kalem eklendi (henüz fire değil) | WAITER, CUSTOMER | `OrderLineAdded` |
| `IN_KITCHEN` → `PARTIALLY_SERVED` | En az bir kalem servis edildi | WAITER | `OrderPartiallyServed` |
| `IN_KITCHEN` → `SERVED` | Tüm kalemler servis edildi | WAITER, SYSTEM | `OrderFullyServed` |
| `PARTIALLY_SERVED` → `SERVED` | Kalan kalemler servis edildi | WAITER | `OrderFullyServed` |
| `PARTIALLY_SERVED` → `IN_KITCHEN` | Yeni kalem fire edildi | WAITER, CUSTOMER | `OrderLineFired` |
| `SERVED` → `BILL_REQUESTED` | Hesap istendi | CUSTOMER, WAITER | `BillRequested` |
| `SERVED` → `PAYMENT_IN_PROGRESS` | Ödeme başlatıldı | WAITER | `PaymentStarted` |
| `BILL_REQUESTED` → `PAYMENT_IN_PROGRESS` | Ödeme başlatıldı | WAITER | `PaymentStarted` |
| `PAYMENT_IN_PROGRESS` → `CLOSED` | Toplam tahsilat = kalan borç | WAITER, SYSTEM | `OrderClosed` |
| `PAYMENT_IN_PROGRESS` → `SERVED` | Ödeme iptal / split vazgeçildi | WAITER | `PaymentAborted` |
| `OPEN/IN_KITCHEN/PARTIALLY_SERVED` → `CANCELLED` | Yetkili iptal | MANAGER, WAITER* | `OrderCancelled` |
| `CLOSED` → `VOIDED` | Kapatma sonrası void | MANAGER | `OrderVoided` |
| `SERVED` → `OPEN` | Servis sonrası yeni kalem (ikinci round) | WAITER, CUSTOMER | `OrderReopened` |

\* WAITER yalnızca `DRAFT`/`OPEN` ve mutfağa gitmemiş kalemleri iptal edebilir; mutfakta olanlar için MANAGER gerekir.

### 2.3 Geçersiz Geçişler

| Geçiş | Neden geçersiz |
|-------|----------------|
| `CLOSED` → herhangi (VOIDED hariç) | Kapalı hesap değiştirilemez |
| `VOIDED` → herhangi | Terminal durum |
| `CANCELLED` → herhangi | Terminal durum |
| `PAYMENT_IN_PROGRESS` → `OPEN` | Ödeme sırasında kalem eklenemez |
| `DRAFT` → `SERVED` | Mutfağa gitmeden servis olmaz |
| `DRAFT` → `CLOSED` | Doğrudan kapanış yasak; OPEN geçişi zorunlu |
| `IN_KITCHEN` → `CLOSED` | Servis edilmeden kapanış yasak |
| Herhangi → `PAYMENT_IN_PROGRESS` (aktif başka ödeme varken) | Aynı order'da tek ödeme oturumu |

### 2.4 Edge Case'ler

- **İkinci round sipariş:** `SERVED` iken yeni kalem → `OrderReopened` → `IN_KITCHEN`
- **Kısmi iptal:** Tek kalem iptali order header'ı iptal etmez → `OrderLineCancelled`
- **Merge sonrası:** Kaynak order `CANCELLED`, hedef birleşir → `OrdersMerged`
- **Transfer sonrası:** `OrderTransferred`; masa invariant'ları güncellenir
- **Split bill:** Order `PAYMENT_IN_PROGRESS`'te kalır; alt ödemeler tamamlanınca `CLOSED`

---

## 3. Table Lifecycle

Masa **operasyonel durum** taşır; ticari gerçeklik Order aggregate'indedir.

### 3.1 Durumlar

| Durum | Anlam |
|-------|-------|
| `AVAILABLE` | Boş; yeni misafir alınabilir |
| `RESERVED` | Onaylı rezervasyon var; henüz oturulmadı |
| `SEATED` | Misafir oturdu; henüz sipariş yok |
| `OCCUPIED` | Aktif açık hesap var |
| `ORDERING` | QR oturumu aktif |
| `BILL_REQUESTED` | Hesap istendi |
| `PAYMENT_IN_PROGRESS` | Ödeme devam ediyor; transfer/merge yasak |
| `DIRTY` | Misafir ayrıldı; temizlik bekliyor |
| `BLOCKED` | Bakım, birleştirme, transfer kilidi |
| `COMBINED` | Başka masayla fiziksel birleşik (sanal grup) |

### 3.2 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| `AVAILABLE` → `RESERVED` | Rezervasyon onaylandı | WAITER, MANAGER, SYSTEM | `TableReserved` |
| `AVAILABLE` → `SEATED` | Walk-in oturtuldu | WAITER | `GuestSeated` |
| `AVAILABLE` → `ORDERING` | QR oturumu başladı | CUSTOMER, SYSTEM | `QrSessionStarted` |
| `RESERVED` → `SEATED` | Rezervasyonlu misafir geldi | WAITER, SYSTEM | `GuestSeated` |
| `RESERVED` → `AVAILABLE` | Rezervasyon iptal/no-show | WAITER, MANAGER, SYSTEM | `TableReleased` |
| `SEATED` → `OCCUPIED` | İlk sipariş açıldı | SYSTEM | `TableOccupied` |
| `ORDERING` → `OCCUPIED` | QR siparişi onaylandı | SYSTEM | `TableOccupied` |
| `OCCUPIED` → `BILL_REQUESTED` | Hesap istendi | CUSTOMER, WAITER | `BillRequested` |
| `OCCUPIED/BILL_REQUESTED` → `PAYMENT_IN_PROGRESS` | Ödeme başladı | WAITER | `TablePaymentStarted` |
| `PAYMENT_IN_PROGRESS` → `DIRTY` | Order CLOSED | SYSTEM | `TableClosed` |
| `DIRTY` → `AVAILABLE` | Temizlik tamam | WAITER | `TableCleaned` |
| `OCCUPIED` → `BLOCKED` | Transfer/merge başladı | WAITER, MANAGER | `TableBlocked` |
| `BLOCKED` → `OCCUPIED` | İşlem tamam / iptal | SYSTEM | `TableUnblocked` |

### 3.3 Geçersiz Geçişler

| Geçiş | Neden |
|-------|-------|
| `AVAILABLE` → `OCCUPIED` (Order olmadan) | SEATED veya ORDERING üzerinden gitmeli |
| `PAYMENT_IN_PROGRESS` → `OCCUPIED` (Order açıkken) | Ödeme tamamlanmalı veya abort edilmeli |
| `RESERVED` → `OCCUPIED` (check-in olmadan) | Önce SEATED |
| `DIRTY` → `OCCUPIED` | Temizlik atlanamaz |
| İki aktif Order ile `OCCUPIED` | **Invariant ihlali** |

---

## 4. Payment Lifecycle

Bir Order birden fazla Payment içerebilir (split). Her Payment kendi yaşam döngüsüne sahiptir.

### 4.1 Durumlar

| Durum | Anlam |
|-------|-------|
| `INITIATED` | Ödeme oturumu başladı |
| `PENDING` | Online/kart gateway bekleniyor |
| `AUTHORIZED` | Kart provizyon alındı |
| `COMPLETED` | Tahsilat kesinleşti |
| `FAILED` | Gateway/banka reddi |
| `PARTIALLY_REFUNDED` | Kısmi iade |
| `REFUNDED` | Tam iade |
| `VOIDED` | Aynı gün iptal |
| `RECONCILED` | Gün sonu mutabakatı |

### 4.2 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| — → `INITIATED` | Ödeme ekranı açıldı | WAITER | `PaymentInitiated` |
| `INITIATED` → `PENDING` | Online/kart isteği | WAITER, SYSTEM | `PaymentSubmitted` |
| `INITIATED` → `COMPLETED` | Nakit tam ödeme | WAITER | `PaymentCompleted` |
| `PENDING` → `AUTHORIZED` | Provizyon OK | SYSTEM | `PaymentAuthorized` |
| `AUTHORIZED` → `COMPLETED` | Capture OK | SYSTEM | `PaymentCaptured` |
| `PENDING/AUTHORIZED` → `FAILED` | Red/timeout | SYSTEM | `PaymentFailed` |
| `FAILED` → `INITIATED` | Yeniden deneme | WAITER | `PaymentRetried` |
| `COMPLETED` → `PARTIALLY_REFUNDED` | Kısmi iade | MANAGER | `PaymentPartiallyRefunded` |
| `COMPLETED` → `REFUNDED` | Tam iade | MANAGER | `PaymentRefunded` |
| `COMPLETED` → `VOIDED` | Aynı gün void | MANAGER | `PaymentVoided` |
| `COMPLETED` → `RECONCILED` | Z raporu | SYSTEM | `PaymentReconciled` |

### 4.3 Geçersiz Geçişler

| Geçiş | Neden |
|-------|-------|
| `COMPLETED` → `INITIATED` | Tahsilat geri alınmadan yeni ödeme aynı kayda bağlanamaz |
| `REFUNDED` / `VOIDED` → herhangi | Terminal |
| Split parçalar toplamı > kalan borç | **Invariant ihlali** |

### 4.4 İş Kuralları

- `SUM(completed payments) + tips >= order balance` → Order `CLOSED`
- İndirim ödeme başladıktan sonra değiştirilemez (MANAGER override hariç)
- Fiş numarası `COMPLETED` anında atomik üretilir → `ReceiptIssued`

---

## 5. Kitchen Ticket Lifecycle

KitchenTicket, Order'dan **türetilen projection**'dır; ayrı truth source olmamalı.

### 5.1 Ticket Durumları

| Durum | Anlam |
|-------|-------|
| `QUEUED` | Mutfak kuyruğuna düştü |
| `ACKNOWLEDGED` | Mutfak gördü |
| `IN_PREP` | Hazırlanıyor |
| `PARTIALLY_READY` | Bazı kalemler hazır |
| `READY` | Tüm kalemler hazır |
| `BUMPED` | Garson mutfaktan aldı |
| `SERVED` | Masaya ulaştı |
| `HELD` | Geçici durdurma ("86") |
| `RECALLED` | Yanlış bump geri alındı |
| `CANCELLED` | İptal |

### 5.2 Kalem Durumları

`QUEUED` → `IN_PREP` → `READY` → `BUMPED` → `SERVED` | `CANCELLED` | `HELD`

### 5.3 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| — → `QUEUED` | Order fire | SYSTEM | `KitchenTicketCreated` |
| `QUEUED` → `ACKNOWLEDGED` | Mutfak açtı | KITCHEN | `KitchenTicketAcknowledged` |
| `ACKNOWLEDGED` → `IN_PREP` | Hazırlık başladı | KITCHEN | `KitchenPrepStarted` |
| `IN_PREP` → `PARTIALLY_READY` | İlk kalem ready | KITCHEN | `KitchenItemReady` |
| `PARTIALLY_READY` → `READY` | Son kalem ready | KITCHEN | `KitchenTicketReady` |
| `READY` → `BUMPED` | Expo bump | KITCHEN, WAITER | `KitchenTicketBumped` |
| `BUMPED` → `SERVED` | Garson servis onayı | WAITER | `KitchenTicketServed` |
| `*` → `HELD` | Malzeme yok | KITCHEN, MANAGER | `KitchenTicketHeld` |
| `HELD` → `IN_PREP` | Devam | KITCHEN | `KitchenTicketResumed` |
| `READY` → `RECALLED` | Yanlış bump | KITCHEN | `KitchenTicketRecalled` |
| `*` → `CANCELLED` | İptal | MANAGER, SYSTEM | `KitchenTicketCancelled` |

### 5.4 Geçersiz Geçişler

| Geçiş | Neden |
|-------|-------|
| `SERVED` → `IN_PREP` | Servis edilmiş geri dönmez |
| `CANCELLED` → herhangi | Terminal |
| `QUEUED` → `SERVED` | Hazırlık atlanamaz |

---

## 6. Reservation Lifecycle

### 6.1 Durumlar

| Durum | Anlam |
|-------|-------|
| `PENDING` | Onay bekliyor |
| `CONFIRMED` | Onaylandı; masa atandı |
| `REMINDED` | Hatırlatma gönderildi |
| `SEATED` | Misafir oturtuldu |
| `COMPLETED` | Tamamlandı |
| `CANCELLED` | İptal |
| `NO_SHOW` | Gelmedi |
| `LATE` | Grace period içinde |

### 6.2 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| — → `PENDING` | Oluşturuldu | WAITER, CUSTOMER | `ReservationCreated` |
| `PENDING` → `CONFIRMED` | Onay | WAITER, MANAGER, SYSTEM | `ReservationConfirmed` |
| `CONFIRMED` → `REMINDED` | Hatırlatma | SYSTEM | `ReservationReminded` |
| `CONFIRMED` → `LATE` | Saat geçti | SYSTEM | `ReservationLate` |
| `CONFIRMED/LATE` → `SEATED` | Check-in | WAITER | `ReservationSeated` |
| `SEATED` → `COMPLETED` | Order CLOSED / süre doldu | SYSTEM | `ReservationCompleted` |
| `PENDING/CONFIRMED` → `CANCELLED` | İptal | WAITER, CUSTOMER, MANAGER | `ReservationCancelled` |
| `CONFIRMED/LATE` → `NO_SHOW` | Grace bitti | SYSTEM, MANAGER | `ReservationNoShow` |

### 6.3 Geçersiz Geçişler

- `SEATED` → `CONFIRMED` — geri dönüş yok
- Aynı masa, çakışan saat → `CONFIRMED` reddedilir
- `guestCount > table.capacity` → onay reddedilir

---

## 7. Service Call Lifecycle

### 7.1 Durumlar

| Durum | Anlam |
|-------|-------|
| `CREATED` | Talep oluşturuldu |
| `ACKNOWLEDGED` | Garson gördü |
| `ASSIGNED` | Garsona atandı |
| `IN_PROGRESS` | İlgileniliyor |
| `RESOLVED` | Karşılandı |
| `EXPIRED` | SLA aşımı |
| `CANCELLED` | İptal |

**Tipler:** `CALL_WAITER`, `REQUEST_BILL`, `WATER`, `MENU`, `COMPLAINT`, `OTHER`

### 7.2 Geçiş Tablosu

| Kaynak → Hedef | Tetikleyici | Rol | Domain Event |
|----------------|-------------|-----|--------------|
| — → `CREATED` | Talep | CUSTOMER, WAITER | `ServiceCallCreated` |
| `CREATED` → `ACKNOWLEDGED` | Onay | WAITER | `ServiceCallAcknowledged` |
| `ACKNOWLEDGED` → `ASSIGNED` | Atama | SYSTEM, MANAGER | `ServiceCallAssigned` |
| `ASSIGNED` → `IN_PROGRESS` | Başladı | WAITER | `ServiceCallStarted` |
| `IN_PROGRESS` → `RESOLVED` | Tamamlandı | WAITER | `ServiceCallResolved` |
| `CREATED/ACKNOWLEDGED` → `CANCELLED` | İptal | CUSTOMER, WAITER | `ServiceCallCancelled` |
| `*` → `EXPIRED` | SLA aşıldı | SYSTEM | `ServiceCallExpired` |

---

## 8. Uçtan Uca Operasyon Akışı

### Adım 1: Müşteri QR ile sipariş verir

| | |
|---|---|
| **Entity** | Table → ORDERING → OCCUPIED · Order DRAFT → OPEN · KitchenTicket QUEUED · CustomerSession |
| **Eventler** | `QrSessionStarted` → `OrderOpened` → `OrderLineFired` → `KitchenTicketCreated` → `TableOccupied` |
| **Kurallar** | QR token geçerli · Tek aktif Order · Fiyat snapshot · KDV/servis hesabı |
| **Transaction** | Session + Order + Fire + Ticket + Table atomik |

### Adım 2: Garson sipariş ekler

| | |
|---|---|
| **Entity** | Order OPEN · yeni OrderLine · KitchenTicket güncelleme |
| **Eventler** | `OrderLineAdded` → `OrderLineFired` → `KitchenTicketUpdated` |
| **Kurallar** | PAYMENT_IN_PROGRESS'te ekleme yasak |
| **Transaction** | Order + Line + Ticket tek transaction |

### Adım 3: Sipariş mutfağa düşer

| | |
|---|---|
| **Entity** | KitchenTicket QUEUED · Order → IN_KITCHEN |
| **Eventler** | `KitchenTicketCreated` · `OrderSentToKitchen` · `PrintJobQueued` |
| **Transaction** | Ticket + print kuyruğu + order projection |

### Adım 4: Ürün hazırlanır

| | |
|---|---|
| **Entity** | TicketLine IN_PREP → READY · Ticket → READY |
| **Eventler** | `KitchenPrepStarted` → `KitchenItemReady` → `KitchenTicketReady` |
| **Kurallar** | Yalnız KITCHEN · SLA timer |

### Adım 5: Servis edilir

| | |
|---|---|
| **Entity** | TicketLine SERVED · Order → SERVED |
| **Eventler** | `KitchenTicketBumped` → `KitchenTicketServed` → `OrderFullyServed` |
| **Kurallar** | Bump edilmeden SERVED olamaz |

### Adım 6: Hesap bölünür

| | |
|---|---|
| **Entity** | Order PAYMENT_IN_PROGRESS · split plan |
| **Eventler** | `PaymentStarted` → `BillSplitConfigured` |
| **Kurallar** | SERVED/BILL_REQUESTED sonrası · Split toplamı = balance |

### Adım 7: İndirim uygulanır

| | |
|---|---|
| **Entity** | Order discount · Discount usedCount |
| **Eventler** | `DiscountApplied` · `DiscountRedeemed` |
| **Kurallar** | minAmount, tarih, maxUses · Audit (% eşik üstü) |

### Adım 8: Bahşiş eklenir

| | |
|---|---|
| **Entity** | Payment.tip |
| **Eventler** | `TipAdded` |
| **Kurallar** | Bahşiş borcu kapatmaz; shift raporuna yazılır |

### Adım 9: Ödeme alınır

| | |
|---|---|
| **Entity** | Payment COMPLETED · Receipt · Order balance |
| **Eventler** | `PaymentCompleted` → `ReceiptIssued` |
| **Transaction** | Payment + Receipt + Order + Fiscal record atomik |

### Adım 10: Masa kapanır

| | |
|---|---|
| **Entity** | Order CLOSED · Table DIRTY · QrSession sonlandı |
| **Eventler** | `OrderClosed` → `TableClosed` → `QrSessionEnded` |
| **Kurallar** | Borç = 0 · Açık Payment yok |

### Event zinciri (özet)

```
QrSessionStarted → OrderOpened → OrderLineFired → KitchenTicketCreated
→ KitchenPrepStarted → KitchenItemReady → KitchenTicketReady
→ KitchenTicketServed → OrderFullyServed
→ BillRequested → BillSplitConfigured → DiscountApplied
→ PaymentInitiated → TipAdded → PaymentCompleted → ReceiptIssued
→ OrderClosed → TableClosed → QrSessionEnded
```

---

## 9. Gerçek Restoranlarda En Sık Karşılaşılan Problemli Senaryolar

### Eşzamanlılık ve Çakışma

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 1 | Aynı anda iki garson sipariş ekledi | Optimistic locking; stale version reddedilir → `ConcurrentModificationDetected` |
| 2 | QR + garson eşzamanlı kalem ekledi | Order serialise; sırayla `OrderLineAdded` |
| 3 | Aynı QR iki telefonda açıldı | İkinci oturum `QrSessionConflict`; politika: ilk geçerli veya MANAGER birleştirme |
| 4 | İki garson farklı masaları birleştirmeye çalıştı | Hedefte aktif order varsa reddedilir; `TableBlocked` kilidi |
| 5 | Garson + mutfak aynı kalem durumunu değiştirdi | Version conflict; domain sırası: KITCHEN READY → WAITER SERVED |

### Masa ve Transfer

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 6 | Transfer sırasında ödeme başladı | Transfer reddedilir; önce ödeme tamamlanmalı |
| 7 | Transfer sırasında ticket READY | tableNumber projection güncellenir → `OrderTransferred` |
| 8 | Rezerve masa walk-in doldurulmaya çalışıldı | CONFIRMED varsa reddedilir veya MANAGER override |
| 9 | Misafir masayı değiştirdi | Transfer use case; kaynak AVAILABLE/DIRTY |
| 10 | Birleştirilmiş masalardan biri ayrılmak istedi | Önce split bill, sonra partial transfer |

### Sipariş ve İptal

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 11 | Mutfakta hazırlanırken iptal | Duruma göre: QUEUED anında; IN_PREP MANAGER + fire kaydı |
| 12 | Müşteri QR iptal, kalem IN_PREP | CUSTOMER reddedilir → `CancellationRejected` |
| 13 | Servis edilmiş ürün iptali | Reddedilir; refund akışı gerekir |
| 14 | Yanlış masaya sipariş | Transfer veya reassignment (fire öncesi) |
| 15 | Double tap duplicate sipariş | Idempotency key; tek OrderLine |

### Mutfak ve Stok

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 16 | Ürün bitti ("86") | HELD + garson bildirimi + menü unavailable → `MenuItem86ed` |
| 17 | Mutfak yazıcı çalışmadı | PrintJob retry; KDS birincil; 3 deneme sonrası alert |
| 18 | Yanlış bump | RECALLED; kalem READY'ye döner |
| 19 | Ticket 45 dk READY kaldı | `KitchenTicketDelayed` + eskalasyon |
| 20 | Farklı course timing | Ana yemek HOLD; başlangıç önce fire → `CourseReleased` |

### Ödeme ve Mali

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 21 | Kart reddedildi | Payment FAILED; alternatif method |
| 22 | Split'te biri terk etti | Kalan borç Order'da; MANAGER karar |
| 23 | Fazla nakit ödeme | Change hesaplanır; kart fazlası reddedilir |
| 24 | İndirim ödeme sonrası | Reddedilir; refund + yeniden kesim |
| 25 | Bahşiş kart provizyonuna dahil edilemedi | Ayrı Payment satırı |
| 26 | Gün sonu açık Order kaldı | Z raporu engellenir; shift handover |

### Altyapı ve Offline

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 27 | İnternet kesildi | Offline queue → `OfflineOrderQueued`; sync + conflict review |
| 28 | WebSocket koptu | Polling fallback; reconnect + event replay |
| 29 | Sunucu 503, mutfak ticket alamıyor | KDS cache; offline queue; banner |
| 30 | Cross-tenant yazım | TenantId isolation; imkansız |

### QR ve Müşteri

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 31 | QR oturumu açık kaldı | Session TTL → `QrSessionExpired` |
| 32 | Çocuk 20 ürün sipariş verdi | MANAGER kalem iptali |
| 33 | Hesap istendi, yemek gelmedi | REQUEST_BILL; kısmi hesap politikası |

### Rezervasyon

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 34 | No-show sonrası geç gelen misafir | Grace + alternatif masa |
| 35 | 8 kişi, masa kapasitesi 6 | Reddedilir; COMBINED önerilir |

### Personel

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 36 | Garson vardiya bitti, açık masalar | Shift handover → `TablesReassigned` |
| 37 | Mutfak yanlış SERVED yaptı | MANAGER recall + audit |

### Yazdırma ve Donanım

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 38 | Adisyon OK, mutfak yazıcı fail | Bağımsız PrintJob; KDS devam |
| 39 | ÖKC onay vermedi | Payment COMPLETED olmaz → `FiscalRegistrationFailed` |

### Veri Bütünlüğü

| # | Senaryo | Beklenen davranış |
|---|---------|-------------------|
| 40 | Merge yarım kaldı | Transaction rollback → `MergeFailed` |
| 41 | Order CLOSED, Table OCCUPIED | Reconciliation job → `TableStateCorrected` |
| 42 | dailyStats ciro uyuşmuyor | Event-sourced projection; replay zorunlu |

---

## 10. Çapraz Kural Matrisi

| Durum | Kalem ekle | Transfer | Split | İndirim | İptal |
|-------|:----------:|:--------:|:-----:|:-------:|:-----:|
| Order DRAFT | ✅ | ❌ | ❌ | ✅ | ✅ |
| Order OPEN/IN_KITCHEN | ✅ | ✅* | ❌ | ✅ | kısmi** |
| Order SERVED | ✅*** | ✅* | ✅ | ✅ | kısmi** |
| Order PAYMENT_IN_PROGRESS | ❌ | ❌ | devam | MANAGER | ❌ |
| Order CLOSED | ❌ | ❌ | ❌ | ❌ | MANAGER void |

\* Table BLOCKED değil, Payment yok  
\*\* Mutfakta olan kalemler MANAGER  
\*\*\* İkinci round → OrderReopened

---

## 11. Tasarım Prensipleri

1. **Tek aktif Order / masa** — en kritik invariant
2. **Order aggregate kök** — KitchenTicket projection; split brain yok
3. **Durum geçişleri sunucuda** — rol + invariant kontrolü
4. **Her geçiş bir event** — audit, bildirim, projection kaynağı
5. **Kritik use case'ler tek transaction** — PayOrder, MergeTables, TransferOrder, FireToKitchen
6. **Idempotency** — QR double-tap, offline sync, payment retry
7. **Optimistic locking** — eşzamanlı garson/müşteri yazımı
8. **Fail-safe offline** — kuyruk + sync + conflict review
9. **Mali işlemler geri alınabilir ama iz bırakır** — void/refund, silme değil
10. **Masa durumu Order'dan türetilir** — manuel PATCH yasak

---

## İlgili Dokümanlar

- [Master Project Report](./MASTER_PROJECT_REPORT.md)
- [Arşiv: Domain Model Analizi](./archive/DOMAIN-ANALIZI.md)
- [Mimari Tasarım](./MIMARI-TASARIM.md)

---

*Bu rapor Akıllı Garson v2.0.0 hedef domain modeline dayanır. Kod, migration veya SQL içermez.*
