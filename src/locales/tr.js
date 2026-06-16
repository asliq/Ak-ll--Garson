// Türkçe çeviriler
export const tr = {
  // Navigation
  nav: {
    dashboard: 'Anasayfa',
    tables: 'Masalar',
    orders: 'Siparişler',
    kitchen: 'Mutfak',
    menu: 'Menü Yönetimi',
    reservations: 'Rezervasyonlar',
    analytics: 'Raporlar',
    settings: 'Ayarlar',
    help: 'Yardım',
    logout: 'Çıkış Yap'
  },

  // Common
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    search: 'Ara',
    filter: 'Filtrele',
    export: 'Dışa Aktar',
    loading: 'Yükleniyor...',
    noData: 'Veri bulunamadı',
    error: 'Bir hata oluştu',
    success: 'İşlem başarılı',
    confirm: 'Onayla',
    back: 'Geri',
    next: 'İleri',
    viewAll: 'Tümünü Gör',
    refresh: 'Yenile'
  },

  // Dashboard
  dashboard: {
    greeting: 'Merhaba',
    todaySummary: 'İşte bugünün özeti',
    totalRevenue: 'Toplam Gelir',
    activeOrders: 'Aktif Siparişler',
    completedOrders: 'Tamamlanan',
    avgOrderValue: 'Ort. Sipariş',
    tableStatus: 'Masa Durumu',
    available: 'Boş',
    occupied: 'Dolu',
    reserved: 'Rezerve',
    popularItems: 'Popüler Ürünler',
    recentOrders: 'Son Siparişler',
    quickActions: 'Hızlı İşlemler',
    newOrder: 'Yeni Sipariş',
    openTables: 'Açık Masalar',
    payment: 'Ödeme Al',
    liveActivity: 'Canlı Aktivite',
    orders: 'sipariş'
  },

  // Tables
  tables: {
    title: 'Masa Yönetimi',
    tableNumber: 'Masa',
    capacity: 'Kapasite',
    status: 'Durum',
    currentOrder: 'Aktif Sipariş',
    noActiveOrder: 'Aktif sipariş yok',
    changeStatus: 'Durum Değiştir',
    viewOrder: 'Siparişi Gör',
    createOrder: 'Sipariş Oluştur',
    people: 'kişi',
    statuses: {
      available: 'Boş',
      occupied: 'Dolu',
      reserved: 'Rezerve',
      maintenance: 'Bakımda'
    }
  },

  // Orders
  orders: {
    title: 'Sipariş Yönetimi',
    orderNumber: 'Sipariş No',
    table: 'Masa',
    waiter: 'Garson',
    items: 'Ürünler',
    total: 'Toplam',
    status: 'Durum',
    createdAt: 'Oluşturulma',
    actions: 'İşlemler',
    addItem: 'Ürün Ekle',
    removeItem: 'Ürün Çıkar',
    updateStatus: 'Durum Güncelle',
    printReceipt: 'Fiş Yazdır',
    statuses: {
      pending: 'Bekliyor',
      preparing: 'Hazırlanıyor',
      ready: 'Hazır',
      served: 'Servis Edildi',
      completed: 'Tamamlandı',
      cancelled: 'İptal'
    }
  },

  // Kitchen
  kitchen: {
    title: 'Mutfak Ekranı',
    pendingOrders: 'Bekleyen Siparişler',
    preparingOrders: 'Hazırlananlar',
    readyOrders: 'Hazır Olanlar',
    orderTime: 'Sipariş Zamanı',
    prepTime: 'Hazırlık Süresi',
    markAsPreparing: 'Hazırlanıyor İşaretle',
    markAsReady: 'Hazır İşaretle',
    priority: 'Öncelik',
    high: 'Yüksek',
    normal: 'Normal',
    low: 'Düşük'
  },

  // Menu
  menu: {
    title: 'Menü Yönetimi',
    categories: 'Kategoriler',
    items: 'Ürünler',
    name: 'Ürün Adı',
    price: 'Fiyat',
    category: 'Kategori',
    description: 'Açıklama',
    available: 'Stokta',
    unavailable: 'Stokta Yok',
    addItem: 'Yeni Ürün',
    editItem: 'Ürünü Düzenle',
    deleteItem: 'Ürünü Sil',
    image: 'Görsel'
  },

  // Reservations
  reservations: {
    title: 'Rezervasyon Yönetimi',
    customerName: 'Müşteri Adı',
    phone: 'Telefon',
    date: 'Tarih',
    time: 'Saat',
    guests: 'Kişi Sayısı',
    table: 'Masa',
    notes: 'Notlar',
    status: 'Durum',
    newReservation: 'Yeni Rezervasyon',
    editReservation: 'Rezervasyon Düzenle',
    statuses: {
      pending: 'Bekliyor',
      confirmed: 'Onaylandı',
      seated: 'Oturdu',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
      noShow: 'Gelmedi'
    }
  },

  // Analytics
  analytics: {
    title: 'Raporlar ve Analitik',
    salesReport: 'Satış Raporu',
    revenue: 'Gelir',
    orders: 'Siparişler',
    avgOrderValue: 'Ortalama Sipariş',
    topProducts: 'En Çok Satan Ürünler',
    topCategories: 'Popüler Kategoriler',
    waiterPerformance: 'Garson Performansı',
    dailySales: 'Günlük Satışlar',
    monthlySales: 'Aylık Satışlar',
    period: 'Dönem',
    today: 'Bugün',
    yesterday: 'Dün',
    thisWeek: 'Bu Hafta',
    thisMonth: 'Bu Ay',
    lastMonth: 'Geçen Ay',
    custom: 'Özel'
  },

  // Settings
  settings: {
    title: 'Ayarlar',
    profile: 'Profil',
    appearance: 'Görünüm',
    notifications: 'Bildirimler',
    kitchen: 'Mutfak Ekranı',
    system: 'Sistem',
    theme: 'Tema',
    language: 'Dil',
    dark: 'Koyu',
    light: 'Açık',
    soundEnabled: 'Bildirim Sesleri',
    notificationTypes: 'Bildirim Türleri',
    newOrder: 'Yeni Sipariş',
    orderReady: 'Sipariş Hazır',
    payment: 'Ödeme',
    autoRefresh: 'Otomatik Yenileme',
    refreshInterval: 'Yenileme Aralığı',
    seconds: 'saniye',
    clearCache: 'Önbelleği Temizle',
    version: 'Versiyon',
    apiStatus: 'API Durumu',
    connected: 'Bağlı',
    disconnected: 'Bağlantı Yok'
  },

  // Login
  login: {
    title: 'Garson Girişi',
    subtitle: 'PIN kodunuzu girerek oturum açın',
    selectWaiter: 'Garson Seçin',
    enterPin: 'PIN Girin',
    login: 'Giriş Yap',
    invalidPin: 'Geçersiz PIN kodu',
    loginSuccess: 'Giriş başarılı',
    loginError: 'Giriş yapılamadı'
  },

  // Customer
  customer: {
    welcome: 'Hoş Geldiniz',
    scanQr: 'QR Kodu Okutun',
    tableNumber: 'Masa Numaranız',
    menu: 'Menü',
    myOrders: 'Siparişlerim',
    callWaiter: 'Garson Çağır',
    requestBill: 'Hesap İste',
    addToCart: 'Sepete Ekle',
    cart: 'Sepet',
    checkout: 'Sipariş Ver',
    total: 'Toplam',
    orderPlaced: 'Siparişiniz alındı',
    orderStatus: 'Sipariş Durumu',
    thankYou: 'Teşekkürler'
  },

  // Voice Commands
  voice: {
    listening: 'Dinleniyor...',
    command: 'Sesli Komut',
    examples: 'Örnek: "Masalar", "Siparişler", "Mutfak"',
    notSupported: 'Tarayıcınız ses tanımayı desteklemiyor',
    error: 'Ses tanıma hatası'
  },

  // Notifications
  notifications: {
    title: 'Bildirimler',
    markAllRead: 'Tümünü Okundu İşaretle',
    clear: 'Temizle',
    noNotifications: 'Bildirim yok',
    newOrder: 'Yeni sipariş',
    orderReady: 'Sipariş hazır',
    orderCompleted: 'Sipariş tamamlandı',
    paymentReceived: 'Ödeme alındı',
    reservationConfirmed: 'Rezervasyon onaylandı'
  },

  // Performance Monitor
  performance: {
    fps: 'FPS',
    memory: 'Bellek',
    cache: 'Cache',
    apiResponse: 'API Yanıt',
    uptime: 'Çalışma Süresi',
    renderPerformance: 'Render Performansı',
    memoryUsage: 'Bellek Kullanımı',
    queries: 'Sorgu'
  },

  // Errors
  errors: {
    network: 'Ağ bağlantısı hatası',
    server: 'Sunucu hatası',
    notFound: 'Bulunamadı',
    unauthorized: 'Yetkisiz erişim',
    validation: 'Doğrulama hatası',
    unknown: 'Bilinmeyen hata'
  }
}

