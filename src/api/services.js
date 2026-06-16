import axiosInstance from './axios'

// ==========================================
// MASA (TABLES) SERVİSLERİ
// ==========================================
export const tablesApi = {
  // Tüm masaları getir
  getAll: async () => {
    const { data } = await axiosInstance.get('/tables')
    return data
  },
  
  // Tek masa getir
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/tables/${id}`)
    return data
  },
  
  // Masa durumunu güncelle
  updateStatus: async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/tables/${id}`, { status })
    return data
  },
  
  // Yeni masa ekle
  create: async (table) => {
    const { data } = await axiosInstance.post('/tables', table)
    return data
  },
  
  // Masa sil
  delete: async (id) => {
    await axiosInstance.delete(`/tables/${id}`)
    return id
  },
}

// ==========================================
// KATEGORİ SERVİSLERİ
// ==========================================
export const categoriesApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/categories')
    return data
  },
  
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/categories/${id}`)
    return data
  },
}

// ==========================================
// MENÜ SERVİSLERİ
// ==========================================
export const menuApi = {
  // Tüm menü öğelerini getir
  getAll: async () => {
    const { data } = await axiosInstance.get('/menuItems')
    return data
  },
  
  // Kategoriye göre menü öğelerini getir
  getByCategory: async (categoryId) => {
    const { data } = await axiosInstance.get(`/menuItems?categoryId=${categoryId}`)
    return data
  },
  
  // Tek menü öğesi getir
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/menuItems/${id}`)
    return data
  },
  
  // Menü öğesi stok durumunu güncelle
  updateAvailability: async ({ id, isAvailable }) => {
    const { data } = await axiosInstance.patch(`/menuItems/${id}`, { isAvailable })
    return data
  },
  
  // Menü öğesi fiyatını güncelle
  updatePrice: async ({ id, price }) => {
    const { data } = await axiosInstance.patch(`/menuItems/${id}`, { price })
    return data
  },
}

// ==========================================
// SİPARİŞ SERVİSLERİ
// ==========================================
export const ordersApi = {
  // Tüm siparişleri getir
  getAll: async () => {
    const { data } = await axiosInstance.get('/orders')
    return data
  },
  
  // Masa siparişlerini getir
  getByTable: async (tableId) => {
    const { data } = await axiosInstance.get(`/orders?tableId=${tableId}`)
    return data
  },
  
  // Duruma göre siparişleri getir
  getByStatus: async (status) => {
    const { data } = await axiosInstance.get(`/orders?status=${status}`)
    return data
  },
  
  // Tek sipariş getir
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/orders/${id}`)
    return data
  },
  
  // Yeni sipariş oluştur
  create: async (order) => {
    const { data } = await axiosInstance.post('/orders', {
      ...order,
      createdAt: new Date().toISOString(),
    })
    return data
  },
  
  // Sipariş durumunu güncelle
  updateStatus: async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/orders/${id}`, { status })
    return data
  },
  
  // Siparişe ürün ekle
  addItem: async ({ orderId, item }) => {
    const order = await ordersApi.getById(orderId)
    const updatedItems = [...order.items, item]
    const { data } = await axiosInstance.patch(`/orders/${orderId}`, { items: updatedItems })
    return data
  },
  
  // Siparişten ürün çıkar
  removeItem: async ({ orderId, menuItemId }) => {
    const order = await ordersApi.getById(orderId)
    const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId)
    const { data } = await axiosInstance.patch(`/orders/${orderId}`, { items: updatedItems })
    return data
  },
  
  // Sipariş sil
  delete: async (id) => {
    await axiosInstance.delete(`/orders/${id}`)
    return id
  },
}

// ==========================================
// GARSON SERVİSLERİ
// ==========================================
export const waitersApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/waiters')
    return data
  },
  
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/waiters/${id}`)
    return data
  },
}

// ==========================================
// İSTATİSTİK SERVİSLERİ
// ==========================================
export const statsApi = {
  get: async () => {
    const { data } = await axiosInstance.get('/stats')
    return data
  },
  
  update: async (stats) => {
    const { data } = await axiosInstance.patch('/stats', stats)
    return data
  },
}

// ==========================================
// UNIFIED API EXPORT
// ==========================================
// ==========================================
// DİSCOUNTS SERVİSLERİ
// ==========================================
export const discountsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/discounts')
    return data
  },
  
  getActive: async () => {
    const { data } = await axiosInstance.get('/discounts')
    const now = new Date()
    return data.filter(discount => {
      if (!discount.isActive) return false
      const start = new Date(discount.startDate)
      const end = new Date(discount.endDate)
      return now >= start && now <= end
    })
  },
  
  getByCode: async (code) => {
    const { data } = await axiosInstance.get(`/discounts?code=${code}`)
    return data[0] || null
  },
  
  create: async (discount) => {
    const { data } = await axiosInstance.post('/discounts', {
      ...discount,
      id: `DISC-${Date.now()}`,
      createdAt: new Date().toISOString(),
      usedCount: 0
    })
    return data
  },
  
  update: async (id, discount) => {
    const { data } = await axiosInstance.patch(`/discounts/${id}`, discount)
    return data
  },
  
  delete: async (id) => {
    await axiosInstance.delete(`/discounts/${id}`)
    return id
  },
}

// ==========================================
// INVENTORY SERVİSLERİ
// ==========================================
export const inventoryApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/inventory')
    return data
  },
  
  getLowStock: async () => {
    const { data } = await axiosInstance.get('/inventory')
    return data.filter(item => item.quantity <= item.minStock)
  },
  
  create: async (item) => {
    const { data } = await axiosInstance.post('/inventory', {
      ...item,
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    return data
  },
  
  update: async (id, item) => {
    const { data } = await axiosInstance.patch(`/inventory/${id}`, {
      ...item,
      updatedAt: new Date().toISOString()
    })
    return data
  },
  
  delete: async (id) => {
    await axiosInstance.delete(`/inventory/${id}`)
    return id
  },
}

export const api = {
  tables: tablesApi,
  categories: categoriesApi,
  menu: menuApi,
  orders: ordersApi,
  waiters: waitersApi,
  stats: statsApi,
  discounts: discountsApi,
  inventory: inventoryApi,
}

