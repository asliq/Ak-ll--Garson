/**
 * Akıllı Garson — Module Registry
 * Demo Edition: live modules use real APIs; roadmap modules show professional preview pages.
 */

export const MODULE_STATUS = {
  LIVE: 'live',
  ROADMAP: 'roadmap',
}

export const DEMO_EDITION = {
  name: 'Demo Edition',
  productName: 'Akıllı Garson',
  productSubtitle: 'Restaurant Management Platform',
  version: '2.0.0',
  tagline: 'Restaurant Management Platform',
  footer: '© Akıllı Garson — Tüm hakları saklıdır',
}

export const ROADMAP_MODULES = {
  'qr-orders': {
    title: 'QR Sipariş Yönetimi',
    description:
      'Müşteri QR akışından gelen siparişlerin merkezi izlenmesi ve garson-mutfak koordinasyonu bu modülde yönetilir.',
    phase: 'Faz 2',
    phaseDetail: 'Sipariş Kanalları Entegrasyonu',
    capabilities: [
      'QR masa siparişleri merkezi kuyruk',
      'Masa bazlı sipariş önceliklendirme',
      'Garson bildirim ve onay akışı',
      'Kanal bazlı raporlama (QR / garson / kiosk)',
      'Çoklu şube QR token yönetimi',
    ],
    architectureNote:
      'Müşteri QR menü akışı (public API) canlıdır; personel tarafı izleme paneli bu modül kapsamındadır.',
  },
  categories: {
    title: 'Kategori Yönetimi',
    description:
      'Menü kategorilerinin hiyerarşik yapısı, görünürlük kuralları ve çoklu dil desteği bu modülde yönetilir.',
    phase: 'Faz 1',
    phaseDetail: 'Menü Çekirdek Modülü',
    capabilities: [
      'Kategori hiyerarşisi ve sıralama',
      'Şube bazlı kategori görünürlüğü',
      'İkon ve renk teması yönetimi',
      'Sezonluk menü grupları',
      'Çoklu dil kategori adları',
    ],
    architectureNote:
      'Kategori listesi API üzerinden okunur; tam CRUD arayüzü Demo Edition dışında planlanmıştır.',
  },
  tables: {
    title: 'Masa Yönetimi',
    description:
      'Salon düzeni, masa durumları ve QR kod üretimi restoran operasyonlarının merkezinde yer alır.',
    phase: 'Faz 2',
    phaseDetail: 'Salon & Masa Operasyonları',
    capabilities: [
      'Görsel salon düzeni editörü',
      'QR kod üretimi ve yazdırma',
      'Masa birleştirme ve transfer',
      'Doluluk ve bekleme süresi izleme',
      'Bölüm (section) bazlı filtreleme',
    ],
    architectureNote:
      'Masa token modeli ve public menü API entegrasyonu altyapıda mevcuttur.',
  },
  staff: {
    title: 'Personel Yönetimi',
    description:
      'Garson, mutfak ve yönetici rollerinin tanımlanması, vardiya planlaması ve yetkilendirme bu modülde yapılır.',
    phase: 'Faz 3',
    phaseDetail: 'İnsan Kaynakları & Yetkilendirme',
    capabilities: [
      'Rol bazlı erişim kontrolü (RBAC)',
      'Vardiya ve mesai planlaması',
      'Performans ve sipariş metrikleri',
      'PIN / biyometrik giriş entegrasyonu',
      'Çoklu şube personel ataması',
    ],
    architectureNote:
      'Demo Edition kimlik doğrulama yerel oturum ile çalışır; kurumsal SSO entegrasyonu yol haritasındadır.',
  },
  reservations: {
    title: 'Rezervasyon Yönetimi',
    description:
      'Online ve telefon rezervasyonlarının masa ataması, bekleme listesi ve müşteri bildirimleri bu modülde yönetilir.',
    phase: 'Faz 3',
    phaseDetail: 'Müşteri Deneyimi',
    capabilities: [
      'Takvim bazlı rezervasyon görünümü',
      'Otomatik masa önerisi',
      'SMS / e-posta hatırlatma',
      'Bekleme listesi yönetimi',
      'No-show ve iptal politikaları',
    ],
  },
  inventory: {
    title: 'Stok & Envanter',
    description:
      'Hammadde takibi, düşük stok uyarıları ve reçete bazlı tüketim hesaplaması operasyonel verimlilik sağlar.',
    phase: 'Faz 4',
    phaseDetail: 'Operasyon & Maliyet',
    capabilities: [
      'Gerçek zamanlı stok seviyeleri',
      'Reçete → hammadde düşümü',
      'Tedarikçi ve satın alma siparişleri',
      'Fire ve sayım farkı raporları',
      'Maliyet analizi ve food cost',
    ],
  },
  payments: {
    title: 'Ödeme Yönetimi',
    description:
      'Adisyon kapatma, çoklu ödeme yöntemi ve POS entegrasyonu finansal kapanış süreçlerini yönetir.',
    phase: 'Faz 3',
    phaseDetail: 'Finans & POS Entegrasyonu',
    capabilities: [
      'Parçalı ve karma ödeme',
      'Nakit / kart / dijital cüzdan',
      'Adisyon bölme ve birleştirme',
      'Gün sonu kasa raporu (Z raporu)',
      'ERP muhasebe entegrasyonu',
    ],
  },
  reports: {
    title: 'Raporlar & Analitik',
    description:
      'Gelir, ürün performansı ve operasyonel KPI\'ların görselleştirilmesi karar destek süreçlerini güçlendirir.',
    phase: 'Faz 4',
    phaseDetail: 'İş Zekası & BI',
    capabilities: [
      'Günlük / haftalık / aylık gelir raporları',
      'Ürün ve kategori bazlı analiz',
      'Garson ve mutfak performansı',
      'Yoğun saat ısı haritası',
      'Excel / PDF dışa aktarma',
    ],
    architectureNote:
      'Dashboard özet metrikleri canlı sipariş verisinden hesaplanır; detaylı BI bu modül kapsamındadır.',
  },
}

export const LIVE_MODULES = {
  dashboard: { title: 'Dashboard', path: '/' },
  orders: { title: 'Siparişler', path: '/orders' },
  kitchen: { title: 'Mutfak', path: '/kitchen' },
  menu: { title: 'Menü Ürünleri', path: '/menu' },
  settings: { title: 'Ayarlar', path: '/system/settings' },
  health: { title: 'Sistem Sağlığı', path: '/system/health' },
}

export function getRoadmapModule(moduleId) {
  return ROADMAP_MODULES[moduleId] || null
}
