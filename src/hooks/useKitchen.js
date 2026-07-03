import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/services'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'

const ITEM_STATUS_BY_ORDER = {
  pending: 'pending',
  preparing: 'preparing',
  ready: 'ready',
  served: 'served',
}

function mapOrderToKitchen(order) {
  const itemStatus = ITEM_STATUS_BY_ORDER[order.status] || 'pending'
  return {
    id: order.id,
    tableId: order.tableId,
    tableNumber: order.tableId?.slice(-4) || '?',
    priority: 'normal',
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      status: itemStatus,
      name: item.name,
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

  updateItemStatus: async ({ orderId, status }) => {
    const updated = await ordersApi.updateStatus({ id: orderId, status })
    return mapOrderToKitchen(updated)
  },

  markOrderReady: async (orderId) => {
    const updated = await ordersApi.updateStatus({ id: orderId, status: 'ready' })
    return mapOrderToKitchen(updated)
  },

  setPriority: async ({ orderId, priority }) => {
    const orders = await kitchenApi.getActiveOrders()
    const order = orders.find((o) => o.id === orderId)
    return order ? { ...order, priority } : null
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
    refetchInterval: kitchenAutoRefresh ? kitchenRefreshInterval : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  })
}

export function useUpdateKitchenItemStatus() {
  const queryClient = useQueryClient()
  const soundEnabled = useAppStore((state) => state.soundEnabled)

  return useMutation({
    mutationFn: ({ orderId, menuItemId, status }) =>
      kitchenApi.updateItemStatus({ orderId, menuItemId, status }),

    onMutate: async ({ orderId, menuItemId, status }) => {
      await queryClient.cancelQueries({ queryKey: kitchenKeys.activeOrders() })

      const previousOrders = queryClient.getQueryData(kitchenKeys.activeOrders())

      queryClient.setQueryData(kitchenKeys.activeOrders(), (old) =>
        old?.map((order) =>
          order.id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.menuItemId === menuItemId ? { ...item, status } : item,
                ),
              }
            : order,
        ),
      )

      return { previousOrders }
    },

    onError: (err, variables, context) => {
      queryClient.setQueryData(kitchenKeys.activeOrders(), context?.previousOrders)
      toast.error('Durum güncellenemedi!')
    },

    onSuccess: (data, { status }) => {
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

export function useSetOrderPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kitchenApi.setPriority,

    onMutate: async ({ orderId, priority }) => {
      await queryClient.cancelQueries({ queryKey: kitchenKeys.activeOrders() })

      const previousOrders = queryClient.getQueryData(kitchenKeys.activeOrders())

      queryClient.setQueryData(kitchenKeys.activeOrders(), (old) =>
        old?.map((order) => (order.id === orderId ? { ...order, priority } : order)),
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
      toast.success(`Öncelik: ${priorityText[data?.priority] || 'Normal'}`)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
    },
  })
}

export function useKitchenStats() {
  const { data: orders } = useKitchenOrders()

  if (!orders) return null

  const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0)
  const pendingItems = orders.reduce(
    (sum, order) => sum + order.items.filter((i) => i.status === 'pending').length,
    0,
  )
  const preparingItems = orders.reduce(
    (sum, order) => sum + order.items.filter((i) => i.status === 'preparing').length,
    0,
  )
  const readyItems = orders.reduce(
    (sum, order) => sum + order.items.filter((i) => i.status === 'ready').length,
    0,
  )
  const highPriorityOrders = orders.filter(
    (o) => o.priority === 'high' || o.priority === 'urgent',
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
