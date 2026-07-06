import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/services'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'

function shouldRetryQuery(failureCount, error) {
  const status = error?.status
  if (status && status < 500) return false
  return failureCount < 1
}

function mapOrderToKitchen(order) {
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: order.tableId?.slice(-4) || '?',
    status: order.status,
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      name: item.name,
      notes: item.notes,
    })),
  }
}

const kitchenApi = {
  getActiveOrders: async () => {
    const orders = await ordersApi.getAll()
    return orders
      .filter((o) => !['completed', 'cancelled'].includes(o.status))
      .map(mapOrderToKitchen)
  },

  updateOrderStatus: async ({ orderId, status }) => {
    const updated = await ordersApi.updateStatus({ id: orderId, status })
    return mapOrderToKitchen(updated)
  },
}

export const kitchenKeys = {
  all: ['kitchen'],
  orders: () => [...kitchenKeys.all, 'orders'],
  activeOrders: () => [...kitchenKeys.all, 'active'],
}

export function useKitchenOrders(options = {}) {
  const kitchenAutoRefresh = useAppStore((state) => state.kitchenAutoRefresh)
  const kitchenRefreshInterval = useAppStore((state) => state.kitchenRefreshInterval)

  return useQuery({
    queryKey: kitchenKeys.activeOrders(),
    queryFn: kitchenApi.getActiveOrders,
    staleTime: 1000 * 5,
    retry: shouldRetryQuery,
    retryDelay: 500,
    refetchInterval: kitchenAutoRefresh ? kitchenRefreshInterval : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export function useUpdateKitchenOrderStatus() {
  const queryClient = useQueryClient()
  const soundEnabled = useAppStore((state) => state.soundEnabled)

  return useMutation({
    mutationFn: ({ orderId, status }) =>
      kitchenApi.updateOrderStatus({ orderId, status }),

    onError: () => {
      toast.error('Durum güncellenemedi!')
    },

    onSuccess: (data, { status }) => {
      if (soundEnabled && status === 'ready') {
        // playSound('orderReady')
      }

      const statusText = {
        pending: 'Sipariş mutfağa alındı',
        preparing: 'Sipariş hazırlanıyor',
        ready: 'Sipariş hazır!',
        served: 'Sipariş servis edildi',
      }
      toast.success(statusText[status] || 'Durum güncellendi')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useKitchenStats() {
  const { data: orders } = useKitchenOrders()

  if (!orders) return null

  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const preparingOrders = orders.filter((o) => o.status === 'preparing').length
  const readyOrders = orders.filter((o) => o.status === 'ready' || o.status === 'served').length
  const totalItems = orders.reduce((sum, order) => sum + (order.items || []).length, 0)

  return {
    totalOrders: orders.length,
    totalItems,
    pendingItems: pendingOrders,
    preparingItems: preparingOrders,
    readyItems: readyOrders,
  }
}
