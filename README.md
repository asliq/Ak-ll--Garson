# 🍽️ Akıllı Garson - Profesyonel POS Restoran Yönetim Sistemi

React ve TanStack Query ile geliştirilmiş, modern ve profesyonel bir restoran sipariş yönetim sistemi.

## ✨ Özellikler

### 🎯 Temel Özellikler
- 📊 **Dashboard**: Gerçek zamanlı istatistikler ve grafikler
- 🪑 **Masa Yönetimi**: QR kod, transfer, birleştirme, bölme
- 📋 **Menü Yönetimi**: Ürün, kategori ve stok kontrolü
- 🛒 **Sipariş Sistemi**: Akıllı sepet ve sipariş oluşturma
- 👨‍🍳 **Mutfak Ekranı**: Önceliklendirme, zamanlayıcı, durum takibi
- 💰 **İndirim Sistemi**: Kampanya ve indirim yönetimi
- 🖨️ **Yazdırma**: Fiş, mutfak fişi, rapor yazdırma
- 📦 **Stok Yönetimi**: Envanter takibi, düşük stok uyarıları
- 📈 **Gelişmiş Analytics**: Satış grafikler, garson performansı
- 👥 **Müşteri Arayüzü**: QR menü, sipariş takibi, ödeme

### 🚀 Gelişmiş Özellikler
- ⌨️ **Klavye Kısayolları**: Ctrl+K komut paleti, hızlı navigasyon
- 🎨 **Tema Sistemi**: Dark/Light mode desteği
- 🌐 **Çoklu Dil**: Türkçe ve İngilizce
- ⏰ **Canlı Saat**: Sistem durumu ve API ping göstergesi
- 📊 **Performans İzleme**: FPS, hafıza, cache, API yanıt süresi
- 📢 **Activity Feed**: Gerçek zamanlı aktivite akışı
- 📈 **Realtime Chart**: Canlı sipariş grafiği
- 🎤 **Voice Command**: Sesli komut desteği (simülasyon)
- ⚡ **Quick Actions**: Hızlı erişim butonları

### 🔧 TanStack Query Özellikleri
- **useQuery**: Veri çekme ve cache yönetimi
- **useMutation**: Veri güncelleme işlemleri
- **Optimistic Updates**: Anlık UI güncellemeleri
- **Query Invalidation**: Akıllı cache geçersiz kılma
- **Prefetching**: Önceden veri yükleme
- **Stale Time & GC Time**: Esnek cache stratejisi
- **Auto Refetching**: Otomatik veri yenileme
- **Query Keys Factory**: Tutarlı key yönetimi

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# JSON Server'ı başlat (Terminal 1)
npm run server

# Uygulamayı başlat (Terminal 2)
npm run dev
```

## 📁 Proje Yapısı

```
src/
├── api/
│   ├── axios.js              # Axios instance ve interceptor'lar
│   └── services.js           # API servis fonksiyonları (tüm endpoints)
├── hooks/
│   ├── useTables.js          # Masa hook'ları
│   ├── useMenu.js            # Menü hook'ları
│   ├── useOrders.js          # Sipariş hook'ları
│   ├── useStats.js           # İstatistik hook'ları
│   ├── useDiscounts.js       # İndirim hook'ları
│   ├── useInventory.js       # Stok hook'ları
│   └── useTranslation.js     # Çeviri hook'u
├── components/
│   ├── Layout/               # Ana layout ve navbar
│   ├── ui/                   # Yeniden kullanılabilir UI bileşenleri
│   ├── CommandPalette.jsx    # Komut paleti (Ctrl+K)
│   ├── LiveClock.jsx         # Canlı saat ve durum
│   ├── QuickActions.jsx      # Hızlı erişim butonları
│   ├── PerformanceMonitor.jsx # Performans göstergeleri
│   ├── ActivityFeed.jsx      # Aktivite akışı
│   ├── RealtimeChart.jsx     # Canlı grafik
│   ├── VoiceCommand.jsx      # Sesli komut
│   ├── KeyboardShortcuts.jsx # Klavye kısayolları
│   ├── QRCodeGenerator.jsx   # QR kod oluşturucu
│   ├── TableOperations.jsx   # Masa işlemleri
│   ├── DiscountManager.jsx   # İndirim yönetimi
│   ├── ThemeProvider.jsx     # Tema yönetimi
│   └── NotificationProvider.jsx # Bildirim sistemi
├── pages/
│   ├── Dashboard.jsx         # Ana sayfa
│   ├── Tables.jsx            # Masa yönetimi
│   ├── Menu.jsx              # Menü yönetimi
│   ├── Orders.jsx            # Sipariş listesi ve yazdırma
│   ├── TableOrder.jsx        # Masaya sipariş alma
│   ├── Kitchen.jsx           # Mutfak ekranı
│   ├── Analytics.jsx         # Gelişmiş analytics
│   ├── Inventory.jsx         # Stok yönetimi
│   ├── Reservations.jsx      # Rezervasyon yönetimi
│   ├── Settings.jsx          # Ayarlar
│   ├── Login.jsx             # Giriş sayfası
│   └── customer/
│       ├── CustomerLogin.jsx # Müşteri girişi (QR)
│       ├── CustomerMenu.jsx  # Müşteri menüsü
│       └── CustomerOrders.jsx # Müşteri sipariş takibi
├── store/
│   └── useAppStore.js        # Zustand global state
├── locales/
│   ├── tr.js                 # Türkçe çeviriler
│   └── en.js                 # İngilizce çeviriler
├── utils/
│   └── printUtils.js         # Yazdırma fonksiyonları
└── main.jsx                  # Uygulama giriş noktası
```

## ⌨️ Klavye Kısayolları

| Kısayol | Açıklama |
|---------|----------|
| `Ctrl + K` | Komut paletini aç |
| `Ctrl + /` | Dashboard'a git |
| `Ctrl + T` | Masalar sayfasına git |
| `Ctrl + M` | Menü sayfasına git |
| `Ctrl + O` | Siparişler sayfasına git |
| `Ctrl + A` | Analytics sayfasına git |
| `Ctrl + I` | Stok sayfasına git |
| `Ctrl + D` | Dark mode toggle |
| `Ctrl + L` | Dil değiştir |

## 🎨 Teknolojiler

- **React 18** - UI kütüphanesi
- **TanStack Query v5** - Server state yönetimi
- **React Router v7** - Routing
- **Zustand** - Global state management
- **Framer Motion** - Animasyonlar
- **Axios** - HTTP client
- **Lucide React** - İkonlar
- **React Hot Toast** - Bildirimler
- **QRCode.react** - QR kod üretimi
- **JSON Server** - Mock API

## 📝 API Endpoints

### Masalar
- `GET /tables` - Tüm masaları getir
- `PATCH /tables/:id` - Masa güncelle

### Menü
- `GET /menuItems` - Tüm menü öğeleri
- `GET /categories` - Kategoriler
- `POST /menuItems` - Yeni ürün ekle
- `PATCH /menuItems/:id` - Ürün güncelle
- `DELETE /menuItems/:id` - Ürün sil

### Siparişler
- `GET /orders` - Siparişler
- `POST /orders` - Yeni sipariş
- `PATCH /orders/:id` - Sipariş güncelle
- `DELETE /orders/:id` - Sipariş sil

### İndirimler
- `GET /discounts` - İndirimler
- `POST /discounts` - Yeni indirim
- `PATCH /discounts/:id` - İndirim güncelle
- `DELETE /discounts/:id` - İndirim sil

### Stok
- `GET /inventory` - Stok listesi
- `PATCH /inventory/:id` - Stok güncelle

### Diğer
- `GET /stats` - İstatistikler
- `GET /users` - Kullanıcılar
- `GET /waiters` - Garsonlar
- `GET /reservations` - Rezervasyonlar

## 🎯 Kullanım Örnekleri

### TanStack Query Kullanımı

```jsx
// Basit query
const { data, isLoading, error } = useTables()

// Filtrelenmiş query
const { data } = useTableOrders(tableId)

// Mutation ile optimistic update
const updateStatus = useUpdateTableStatus()
updateStatus.mutate({ id: tableId, status: 'occupied' })
```

### Indirim Uygulama

```jsx
const { applyDiscount } = useDiscounts()

// İndirim uygula
applyDiscount.mutate({
  orderId: order.id,
  discountId: discount.id
})
```

### Stok Güncelleme

```jsx
const { updateStock } = useInventory()

// Stok güncelle
updateStock.mutate({
  id: item.id,
  quantity: newQuantity
})
```

### Yazdırma

```jsx
import { printReceipt, printKitchenTicket } from '@/utils/printUtils'

// Fiş yazdır
printReceipt(order, items)

// Mutfak fişi yazdır
printKitchenTicket(order, items, tableNumber)
```

## 🔒 Giriş Bilgileri

### Admin/Garson Girişi
- **Username**: admin
- **Password**: admin

### Müşteri Girişi
- Masa numarası ile QR kod taraması
- `/customer/login/:tableId` şeklinde otomatik giriş

## 🌐 Sayfalar

### Admin/Garson
- `/` - Dashboard
- `/tables` - Masa yönetimi
- `/menu` - Menü yönetimi
- `/orders` - Sipariş listesi
- `/order/:tableId` - Sipariş alma
- `/kitchen` - Mutfak ekranı
- `/analytics` - Analytics
- `/inventory` - Stok yönetimi
- `/reservations` - Rezervasyonlar
- `/settings` - Ayarlar

### Müşteri
- `/customer/login/:tableId` - Müşteri girişi
- `/customer/menu` - Müşteri menüsü
- `/customer/orders` - Sipariş takibi

## 📊 Özellik Detayları

### QR Kod Sistemi
- Her masa için benzersiz QR kod
- Otomatik müşteri girişi
- Menü ve sipariş erişimi

### Masa İşlemleri
- **Transfer**: Siparişleri başka masaya taşıma
- **Birleştir**: İki masayı birleştirme
- **Böl**: Hesabı bölme

### Analytics
- Günlük/haftalık satış grafikleri
- En çok satan ürünler
- Garson performans analizi
- Kategori bazlı raporlar

### Mutfak Ekranı
- Öncelik sıralaması (Acil/Normal)
- Geçen süre takibi
- Durum renk kodlaması
- Otomatik yenileme

### İndirim Sistemi
- Yüzde/Tutar bazlı indirimler
- Aktif/Pasif kampanyalar
- Sipariş bazlı indirim uygulama
- Minimum tutar kontrolü

### Stok Yönetimi
- Gerçek zamanlı stok takibi
- Düşük stok uyarıları
- Manuel stok güncelleme
- Kategori bazlı filtreleme

## 🎨 Tema Sistemi

Uygulama light ve dark mode destekler:

```css
/* CSS Variables */
--bg-primary: /* Ana arka plan */
--text-primary: /* Ana metin */
--accent-primary: /* Vurgu rengi */
--border-color: /* Kenarlık rengi */
```

## 🌍 Çoklu Dil Desteği

`useTranslation` hook'u ile kolay çeviri:

```jsx
const { t, language, changeLanguage } = useTranslation()

<h1>{t('dashboard.title')}</h1>
<button onClick={() => changeLanguage('en')}>English</button>
```

## 🔄 Güncelleme Geçmişi

### v2.0.0 (2025)
- ✅ Profesyonel POS tasarımı
- ✅ Gelişmiş Analytics
- ✅ QR kod sistemi
- ✅ Masa işlemleri
- ✅ İndirim sistemi
- ✅ Yazdırma özellikleri
- ✅ Stok yönetimi
- ✅ Mutfak ekranı iyileştirmeleri
- ✅ Klavye kısayolları
- ✅ Dark mode
- ✅ Çoklu dil desteği
- ✅ Performans izleme
- ✅ Sesli komut
- ✅ Müşteri arayüzü

## 📄 Lisans

MIT

---

**Geliştirici**: Akıllı Garson Ekibi  
**İletişim**: info@akilligarson.com  
**Versiyon**: 2.0.0
