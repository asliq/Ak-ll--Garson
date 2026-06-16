import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'

// ==========================================
// MUTFAK API SERVİSLERİ
// ==========================================
const kitchenApi = {
  getOrders: async () => {
    const { data } = await api.get('/kitchenOrders')
    return data
  },
  
  getActiveOrders: async () => {
    const { data } = await api.get('/kitchenOrders')
    // Sadece tamamlanmamış siparişleri filtrele
    return data.filter(order => 
      order.items.some(item => item.status !== 'served')
    )
  },
  
  updateItemStatus: async ({ orderId, menuItemId, status }) => {
    // Önce mevcut siparişi al
    const { data: order } = await api.get(`/kitchenOrders/${orderId}`)
    
    // Item'ı güncelle
    const updatedItems = order.items.map(item =>
      item.menuItemId === menuItemId
        ? { 
            ...item, 
            status,
            startedAt: status === 'preparing' ? new Date().toISOString() : item.startedAt,
            completedAt: status === 'ready' ? new Date().toISOString() : item.completedAt,
          }
        : item
    )
    
    const { data } = await api.patch(`/kitchenOrders/${orderId}`, { items: updatedItems })
    return data
  },
  
  markOrderReady: async (orderId) => {
    const { data: order } = await api.get(`/kitchenOrders/${orderId}`)
    
    const updatedItems = order.items.map(item => ({
      ...item,
      status: 'ready',
      completedAt: new Date().toISOString(),
    }))
    
    const { data } = await api.patch(`/kitchenOrders/${orderId}`, { 
      items: updatedItems,
      completedAt: new Date().toISOString(),
    })
    return data
  },
  
  setPriority: async ({ orderId, priority }) => {
    const { data } = await api.patch(`/kitchenOrders/${orderId}`, { priority })
    return data
  },
}

// Query Keys
export const kitchenKeys = {
  all: ['kitchen'],
  orders: () => [...kitchenKeys.all, 'orders'],
  activeOrders: () => [...kitchenKeys.all, 'active'],
}

// ==========================================
// MUTFAK SİPARİŞLERİ - POLLING İLE
// ==========================================
export function useKitchenOrders(options = {}) {
  const kitchenAutoRefresh = useAppStore((state) => state.kitchenAutoRefresh)
  const kitchenRefreshInterval = useAppStore((state) => state.kitchenRefreshInterval)

  return useQuery({
    queryKey: kitchenKeys.activeOrders(),
    queryFn: kitchenApi.getActiveOrders,
    // Mutfak ekranı için kısa stale time
    staleTime: 1000 * 5, // 5 saniye
    // Otomatik yenileme (polling)
    refetchInterval: kitchenAutoRefresh ? kitchenRefreshInterval : false,
    // Pencere odağında yenile
    refetchOnWindowFocus: true,
    // Ağ yeniden bağlandığında yenile
    refetchOnReconnect: true,
    ...options,
  })
}

// ==========================================
// ÜRÜN DURUMU GÜNCELLE
// ==========================================
export function useUpdateKitchenItemStatus() {
  const queryClient = useQueryClient()
  const soundEnabled = useAppStore((state) => state.soundEnabled)

  return useMutation({
    mutationFn: kitchenApi.updateItemStatus,
    
    onMutate: async ({ orderId, menuItemId, status }) => {
      await queryClient.cancelQueries({ queryKey: kitchenKeys.activeOrders() })
      
      const previousOrders = queryClient.getQueryData(kitchenKeys.activeOrders())
      
      // Optimistic update
      queryClient.setQueryData(kitchenKeys.activeOrders(), (old) =>
        old?.map(order =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map(item =>
                  item.menuItemId === menuItemId
                    ? { ...item, status }
                    : item
                )
              }
            : order
        )
      )
      
      return { previousOrders }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(kitchenKeys.activeOrders(), context?.previousOrders)
      toast.error('Durum güncellenemedi!')
    },
    
    onSuccess: (data, { status }) => {
      // Ses çal (gerçek uygulamada)
      if (soundEnabled && status === 'ready') {
        // playSound('orderReady')
      }
      
      const statusText = {
        pending: 'Beklemede',
        preparing: 'Hazırlanıyor',
        ready: 'Hazır!',
        served: 'Servis edildi',
      }
      toast.success(statusText[status])
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ==========================================
// TÜM SİPARİŞİ HAZIR İŞARETLE
// ==========================================
export function useMarkOrderReady() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kitchenApi.markOrderReady,
    
    onSuccess: (data) => {
      toast.success(`Masa ${data.tableNumber} siparişi hazır!`, {
        icon: '🔔',
        duration: 5000,
      })
    },
    
    onError: () => {
      toast.error('İşlem başarısız!')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

// ==========================================
// ÖNCELİK AYARLA
// ==========================================
export function useSetOrderPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kitchenApi.setPriority,
    
    onMutate: async ({ orderId, priority }) => {
      await queryClient.cancelQueries({ queryKey: kitchenKeys.activeOrders() })
      
      const previousOrders = queryClient.getQueryData(kitchenKeys.activeOrders())
      
      queryClient.setQueryData(kitchenKeys.activeOrders(), (old) =>
        old?.map(order =>
          order.id === orderId ? { ...order, priority } : order
        )
      )
      
      return { previousOrders }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(kitchenKeys.activeOrders(), context?.previousOrders)
      toast.error('Öncelik ayarlanamadı!')
    },
    
    onSuccess: (data) => {
      const priorityText = {
        low: 'Düşük',
        normal: 'Normal',
        high: 'Yüksek',
        urgent: 'Acil',
      }
      toast.success(`Öncelik: ${priorityText[data.priority]}`)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
    },
  })
}

// ==========================================
// MUTFAK İSTATİSTİKLERİ
// ==========================================
export function useKitchenStats() {
  const { data: orders } = useKitchenOrders()
  
  if (!orders) return null
  
  const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0)
  const pendingItems = orders.reduce((sum, order) => 
    sum + order.items.filter(i => i.status === 'pending').length, 0
  )
  const preparingItems = orders.reduce((sum, order) => 
    sum + order.items.filter(i => i.status === 'preparing').length, 0
  )
  const readyItems = orders.reduce((sum, order) => 
    sum + order.items.filter(i => i.status === 'ready').length, 0
  )
  const highPriorityOrders = orders.filter(o => 
    o.priority === 'high' || o.priority === 'urgent'
  ).length

  return {
    totalOrders: orders.length,
    totalItems,
    pendingItems,
    preparingItems,
    readyItems,
    highPriorityOrders,
  }
}

