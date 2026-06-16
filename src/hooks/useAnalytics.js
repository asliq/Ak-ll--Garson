import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'

// ==========================================
// ANALİTİK API SERVİSLERİ
// ==========================================
const analyticsApi = {
  getDailyStats: async () => {
    const { data } = await api.get('/dailyStats')
    return data
  },
  
  getInventory: async () => {
    const { data } = await api.get('/inventory')
    return data
  },
  
  getSettings: async () => {
    const { data } = await api.get('/settings')
    return data
  },
  
  // Hesaplanan istatistikler (client-side)
  calculateWeeklyTrend: (dailyStats) => {
    if (!dailyStats || dailyStats.length < 7) return null
    
    const lastWeek = dailyStats.slice(-7)
    const previousWeek = dailyStats.slice(-14, -7)
    
    const currentTotal = lastWeek.reduce((sum, d) => sum + d.revenue, 0)
    const previousTotal = previousWeek.reduce((sum, d) => sum + d.revenue, 0)
    
    const percentChange = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0

    return {
      currentTotal,
      previousTotal,
      percentChange: percentChange.toFixed(1),
      trend: percentChange >= 0 ? 'up' : 'down',
    }
  },
  
  calculateCategoryPerformance: async () => {
    const [{ data: orders }, { data: menuItems }, { data: categories }] = await Promise.all([
      api.get('/orders'),
      api.get('/menuItems'),
      api.get('/categories'),
    ])
    
    const categoryStats = categories.map(category => {
      const categoryItems = menuItems.filter(item => item.categoryId === category.id)
      const categoryItemIds = categoryItems.map(i => i.id)
      
      let totalSold = 0
      let totalRevenue = 0
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (categoryItemIds.includes(item.menuItemId)) {
            const menuItem = menuItems.find(m => m.id === item.menuItemId)
            if (menuItem) {
              totalSold += item.quantity
              totalRevenue += menuItem.price * item.quantity
            }
          }
        })
      })
      
      return {
        ...category,
        totalSold,
        totalRevenue,
        itemCount: categoryItems.length,
      }
    })
    
    return categoryStats.sort((a, b) => b.totalRevenue - a.totalRevenue)
  },
  
  getTopSellingItems: async (limit = 10) => {
    const [{ data: orders }, { data: menuItems }] = await Promise.all([
      api.get('/orders'),
      api.get('/menuItems'),
    ])
    
    const itemSales = {}
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = { quantity: 0, revenue: 0 }
        }
        const menuItem = menuItems.find(m => m.id === item.menuItemId)
        if (menuItem) {
          itemSales[item.menuItemId].quantity += item.quantity
          itemSales[item.menuItemId].revenue += menuItem.price * item.quantity
        }
      })
    })
    
    const topItems = Object.entries(itemSales)
      .map(([itemId, stats]) => {
        const menuItem = menuItems.find(m => m.id === parseInt(itemId))
        return {
          ...menuItem,
          ...stats,
        }
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit)
    
    return topItems
  },
  
  getHourlyDistribution: async () => {
    const { data: orders } = await api.get('/orders')
    
    const hourlyData = Array(24).fill(0).map((_, hour) => ({
      hour,
      orders: 0,
      revenue: 0,
    }))
    
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours()
      hourlyData[hour].orders += 1
      hourlyData[hour].revenue += order.totalAmount
    })
    
    return hourlyData
  },
}

// Query Keys
export const analyticsKeys = {
  all: ['analytics'],
  dailyStats: () => [...analyticsKeys.all, 'daily'],
  inventory: () => [...analyticsKeys.all, 'inventory'],
  settings: () => [...analyticsKeys.all, 'settings'],
  categoryPerformance: () => [...analyticsKeys.all, 'categories'],
  topSelling: (limit) => [...analyticsKeys.all, 'topSelling', limit],
  hourlyDistribution: () => [...analyticsKeys.all, 'hourly'],
}

// ==========================================
// GÜNLÜK İSTATİSTİKLER
// ==========================================
export function useDailyStats(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.dailyStats(),
    queryFn: analyticsApi.getDailyStats,
    staleTime: 1000 * 60 * 5, // 5 dakika
    ...options,
  })
}

// ==========================================
// HAFTALIK TREND
// ==========================================
export function useWeeklyTrend() {
  const { data: dailyStats } = useDailyStats()
  return analyticsApi.calculateWeeklyTrend(dailyStats)
}

// ==========================================
// ENVANTER
// ==========================================
export function useInventory(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.inventory(),
    queryFn: analyticsApi.getInventory,
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

// ==========================================
// DÜŞÜK STOK UYARISI
// ==========================================
export function useLowStockItems() {
  const { data: inventory } = useInventory()
  
  if (!inventory) return []
  
  return inventory.filter(item => item.quantity <= item.minQuantity)
}

// ==========================================
// KATEGORİ PERFORMANSI
// ==========================================
export function useCategoryPerformance(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.categoryPerformance(),
    queryFn: analyticsApi.calculateCategoryPerformance,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// ==========================================
// EN ÇOK SATAN ÜRÜNLER
// ==========================================
export function useTopSellingItems(limit = 10, options = {}) {
  return useQuery({
    queryKey: analyticsKeys.topSelling(limit),
    queryFn: () => analyticsApi.getTopSellingItems(limit),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// ==========================================
// SAATLİK DAĞILIM
// ==========================================
export function useHourlyDistribution(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.hourlyDistribution(),
    queryFn: analyticsApi.getHourlyDistribution,
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

// ==========================================
// AYARLAR
// ==========================================
export function useSettings(options = {}) {
  return useQuery({
    queryKey: analyticsKeys.settings(),
    queryFn: analyticsApi.getSettings,
    staleTime: 1000 * 60 * 30, // 30 dakika
    ...options,
  })
}

// ==========================================
// DEPENDENT QUERY - Birden fazla veri kaynağını birleştir
// ==========================================
export function useDashboardData() {
  const dailyStatsQuery = useDailyStats()
  const inventoryQuery = useInventory()
  
  // Her iki sorgu da tamamlanana kadar bekle
  const isLoading = dailyStatsQuery.isLoading || inventoryQuery.isLoading
  const isError = dailyStatsQuery.isError || inventoryQuery.isError
  
  // Haftalık trend hesapla
  const weeklyTrend = dailyStatsQuery.data 
    ? analyticsApi.calculateWeeklyTrend(dailyStatsQuery.data)
    : null
  
  // Düşük stok uyarıları
  const lowStockItems = inventoryQuery.data
    ? inventoryQuery.data.filter(item => item.quantity <= item.minQuantity)
    : []

  return {
    dailyStats: dailyStatsQuery.data || [],
    inventory: inventoryQuery.data || [],
    weeklyTrend,
    lowStockItems,
    isLoading,
    isError,
    refetch: () => {
      dailyStatsQuery.refetch()
      inventoryQuery.refetch()
    },
  }
}

