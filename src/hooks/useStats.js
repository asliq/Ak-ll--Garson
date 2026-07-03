import { useMemo } from 'react'
import { useOrders } from './useOrders'

// /stats endpoint yoktur — orders'dan client-side hesapla (masa API'si henüz yok)
export function useStats() {
  const { data: orders, isLoading, isError, error } = useOrders()

  const stats = useMemo(() => {
    if (!orders) return null

    const today = new Date().toDateString()
    const todayOrders = orders.filter(
      o => new Date(o.createdAt).toDateString() === today
    )

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const completedOrders = todayOrders.filter(o =>
      o.status === 'completed' || o.status === 'paid'
    ).length
    const activeOrders = orders.filter(o =>
      ['pending', 'preparing', 'ready'].includes(o.status)
    ).length
    const avgOrderValue =
      todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0

    return {
      todayRevenue,
      todayOrders: todayOrders.length,
      activeOrders,
      completedOrders,
      avgOrderValue,
      availableTables: null,
      occupiedTables: null,
      reservedTables: null,
      totalTables: null,
    }
  }, [orders])

  return {
    data: stats,
    isLoading,
    isError,
    error,
  }
}
