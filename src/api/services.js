import axiosInstance, { setRestaurantId } from './axios'
import {
  majorToMinor,
  mapCategory,
  mapMenuItem,
  mapOrder,
  mapPublicMenuItem,
  mapPublicOrder,
  minorToMajor,
  toApiOrderStatus,
} from './adapters'

export { setRestaurantId }

function generateSku(name) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 20)

  const prefix = normalized.length > 0 ? normalized : 'ITEM'
  return `${prefix}-${Date.now().toString().slice(-6)}`
}

// ==========================================
// KATEGORİ SERVİSLERİ
// ==========================================
export const categoriesApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/menu/categories')
    return (data || []).map(mapCategory)
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/menu/categories/${id}`)
    return mapCategory(data)
  },
}

// ==========================================
// MENÜ SERVİSLERİ (Staff)
// ==========================================
export const menuApi = {
  getAll: async () => {
    const categories = await categoriesApi.getAll()
    const itemMap = new Map()

    await Promise.all(
      categories.map(async (category) => {
        const { data } = await axiosInstance.get('/menu/items', {
          params: { categoryId: category.id },
        })

        ;(data || []).forEach((item) => {
          if (!itemMap.has(item.id)) {
            itemMap.set(item.id, mapMenuItem(item, category.id))
          }
        })
      }),
    )

    if (itemMap.size === 0) {
      const { data } = await axiosInstance.get('/menu/items')
      return (data || []).map((item) => mapMenuItem(item))
    }

    return Array.from(itemMap.values())
  },

  getByCategory: async (categoryId) => {
    const { data } = await axiosInstance.get('/menu/items', {
      params: { categoryId },
    })
    return (data || []).map((item) => mapMenuItem(item, categoryId))
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/menu/items/${id}`)
    return mapMenuItem(data)
  },

  updateAvailability: async ({ id, isAvailable }) => {
    return Promise.reject(new Error('Stok güncellemesi şu an kullanılamıyor'))
  },

  updatePrice: async ({ id, price }) => {
    const { data } = await axiosInstance.patch(`/menu/items/${id}/price`, {
      amountMinor: majorToMinor(price),
    })

    return {
      id: data.menuItemId || id,
      price: minorToMajor(data.amountMinor),
      currencyCode: data.currencyCode || 'TRY',
    }
  },

  create: async (item) => {
    const sku = item.sku || generateSku(item.name)

    const { data } = await axiosInstance.post('/menu/items', {
      name: item.name,
      sku,
      amountMinor: majorToMinor(item.price),
      description: item.description || undefined,
      imageUrl: item.image || undefined,
      preparationTimeSeconds: (item.preparationTime || 10) * 60,
    })

    if (item.categoryId) {
      await axiosInstance.post(`/menu/items/${data.id}/categories`, {
        categoryId: item.categoryId,
        isPrimary: true,
      })
    }

    return mapMenuItem(data, item.categoryId)
  },

  delete: async () => {
    return Promise.reject(new Error('Ürün silme şu an kullanılamıyor'))
  },

  update: async () => {
    return Promise.reject(new Error('Ürün güncelleme şu an kullanılamıyor'))
  },
}

// ==========================================
// PUBLIC MENÜ (QR)
// ==========================================
export const publicMenuApi = {
  getByTableToken: async (tableToken) => {
    const { data } = await axiosInstance.get(`/public/menu/${encodeURIComponent(tableToken)}`)

    const categories = (data.categories || []).map(mapCategory)
    const menuItems = (data.categories || []).flatMap((category) =>
      (category.items || []).map((item) => mapPublicMenuItem(item, category.id)),
    )

    return {
      restaurantName: data.restaurantName,
      tableName: data.tableName,
      tableId: data.tableId,
      categories,
      menuItems,
    }
  },
}

// ==========================================
// SİPARİŞ SERVİSLERİ
// ==========================================
export const ordersApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get('/orders')
    return (data || []).map(mapOrder)
  },

  getByTable: async (tableId) => {
    const { data } = await axiosInstance.get('/orders', {
      params: { tableId },
    })
    return (data || []).map(mapOrder)
  },

  getByStatus: async (status) => {
    const { data } = await axiosInstance.get('/orders', {
      params: { status: toApiOrderStatus(status) },
    })
    return (data || []).map(mapOrder)
  },

  getById: async (id) => {
    const { data } = await axiosInstance.get(`/orders/${id}`)
    return mapOrder(data)
  },

  create: async (order) => {
    const { data } = await axiosInstance.post('/public/orders', {
      tableToken: order.tableToken,
      lines: order.lines,
    })
    return mapPublicOrder(data)
  },

  createPublic: async ({ tableToken, lines }) => {
    const { data } = await axiosInstance.post('/public/orders', {
      tableToken,
      lines: lines.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
      })),
    })
    return mapPublicOrder(data)
  },

  updateStatus: async ({ id, status }) => {
    const { data } = await axiosInstance.patch(`/orders/${id}/status`, {
      status: toApiOrderStatus(status),
    })
    return mapOrder(data)
  },

  update: async () => {
    throw new Error('Sipariş güncelleme şu an kullanılamıyor')
  },

  addItem: async () => {
    throw new Error('Siparişe ürün ekleme şu an kullanılamıyor')
  },

  removeItem: async () => {
    throw new Error('Siparişten ürün çıkarma şu an kullanılamıyor')
  },

  delete: async () => {
    throw new Error('Sipariş silme şu an kullanılamıyor')
  },
}

// ==========================================
// ROADMAP MODULE STUBS
// ==========================================
export const API_ENABLED = {
  tables: false,
  waiters: false,
  discounts: false,
  inventory: false,
  serviceCalls: false,
  reservations: false,
  payments: false,
  kitchenLegacy: false,
  notifications: false,
  analyticsLegacy: false,
}

const notImplemented = (resource) => async () => {
  throw new Error(`${resource} modülü şu an kullanılamıyor`)
}

export const tablesApi = {
  getAll: notImplemented('Masalar'),
  getById: notImplemented('Masalar'),
  updateStatus: notImplemented('Masalar'),
  create: notImplemented('Masalar'),
  delete: notImplemented('Masalar'),
}

export const waitersApi = {
  getAll: notImplemented('Garsonlar'),
  getById: notImplemented('Garsonlar'),
  create: notImplemented('Garsonlar'),
  update: notImplemented('Garsonlar'),
  delete: notImplemented('Garsonlar'),
}

export const discountsApi = {
  getAll: notImplemented('İndirimler'),
  getActive: notImplemented('İndirimler'),
  getByCode: notImplemented('İndirimler'),
  create: notImplemented('İndirimler'),
  update: notImplemented('İndirimler'),
  delete: notImplemented('İndirimler'),
}

export const inventoryApi = {
  getAll: notImplemented('Envanter'),
  getLowStock: notImplemented('Envanter'),
  create: notImplemented('Envanter'),
  update: notImplemented('Envanter'),
  delete: notImplemented('Envanter'),
}

export const serviceCallsApi = {
  getAll: notImplemented('Servis çağrıları'),
  getPending: notImplemented('Servis çağrıları'),
  create: notImplemented('Servis çağrıları'),
  markHandled: notImplemented('Servis çağrıları'),
}

export const api = {
  tables: tablesApi,
  categories: categoriesApi,
  menu: menuApi,
  publicMenu: publicMenuApi,
  orders: ordersApi,
  waiters: waitersApi,
  discounts: discountsApi,
  inventory: inventoryApi,
  serviceCalls: serviceCallsApi,
}
