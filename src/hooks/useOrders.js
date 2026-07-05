import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, tablesApi, API_ENABLED } from '../api/services'
import { tableKeys } from './useTables'
import toast from 'react-hot-toast'

// Query key factory
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), { filters }],
  byTable: (tableId) => [...orderKeys.all, 'table', tableId],
  byStatus: (status) => [...orderKeys.all, 'status', status],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
}

// ==========================================
// TÜM SİPARİŞLERİ GETİR
// ==========================================
export function useOrders(options = {}) {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: ordersApi.getAll,
    staleTime: 1000 * 10,
    ...options,
  })
}

// ==========================================
// MASA SİPARİŞLERİNİ GETİR
// ==========================================
export function useTableOrders(tableId, options = {}) {
  return useQuery({
    queryKey: orderKeys.byTable(tableId),
    queryFn: () => ordersApi.getByTable(tableId),
    enabled: !!tableId,
    staleTime: 1000 * 30,
    ...options,
  })
}

// ==========================================
// DURUMA GÖRE SİPARİŞLER
// ==========================================
export function useOrdersByStatus(status, options = {}) {
  return useQuery({
    queryKey: orderKeys.byStatus(status),
    queryFn: () => ordersApi.getByStatus(status),
    enabled: !!status,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30, // Aktif siparişleri 30 saniyede bir yenile
    ...options,
  })
}

// ==========================================
// TEK SİPARİŞ GETİR
// ==========================================
export function useOrder(id, options = {}) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

// ==========================================
// YENİ SİPARİŞ OLUŞTUR (Public QR)
// ==========================================
export function useCreatePublicOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.createPublic,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      if (data?.tableId) {
        queryClient.invalidateQueries({ queryKey: orderKeys.byTable(data.tableId) })
      }
    },

    onError: (error) => {
      toast.error(error.message || 'Sipariş oluşturulamadı!')
    },
  })
}

// ==========================================
// YENİ SİPARİŞ OLUŞTUR (Staff)
// ==========================================
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.createPublic,
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })

      if (API_ENABLED.tables && data.tableId) {
        queryClient.setQueryData(tableKeys.lists(), (old) =>
          old?.map((table) =>
            table.id === data.tableId ? { ...table, status: 'occupied' } : table,
          ),
        )
      }

      toast.success('Sipariş oluşturuldu! 🎉')
    },

    onError: (error) => {
      toast.error(error.message || 'Sipariş oluşturulamadı!')
    },
  })
}

// ==========================================
// SİPARİŞ DURUMU GÜNCELLE
// ==========================================
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.updateStatus,
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() })
      
      const previousOrders = queryClient.getQueryData(orderKeys.lists())
      
      queryClient.setQueryData(orderKeys.lists(), (old) =>
        old?.map((order) =>
          order.id === id ? { ...order, status } : order
        )
      )
      
      return { previousOrders }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(orderKeys.lists(), context?.previousOrders)
      toast.error('Sipariş durumu güncellenemedi!')
    },
    
    onSuccess: (data) => {
      const statusText = {
        pending: 'Beklemede',
        preparing: 'Hazırlanıyor',
        ready: 'Hazır',
        served: 'Servis Edildi',
        paid: 'Ödendi',
        cancelled: 'İptal',
      }
      toast.success(`Sipariş: ${statusText[data.status]}`)
      
      if (API_ENABLED.tables && (data.status === 'completed' || data.status === 'paid' || data.status === 'cancelled')) {
        queryClient.setQueryData(tableKeys.lists(), (old) =>
          old?.map((table) =>
            table.id === data.tableId ? { ...table, status: 'available' } : table
          )
        )
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

// ==========================================
// SİPARİŞE ÜRÜN EKLE
// ==========================================
export function useAddOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.addItem,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success('Ürün siparişe eklendi!')
    },
    
    onError: (err) => {
      toast.error(err?.message || 'Ürün eklenemedi!')
    },
  })
}

// ==========================================
// SİPARİŞTEN ÜRÜN ÇIKAR
// ==========================================
export function useRemoveOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.removeItem,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success('Ürün siparişten çıkarıldı')
    },
    
    onError: (err) => {
      toast.error(err?.message || 'Ürün çıkarılamadı!')
    },
  })
}

// ==========================================
// SİPARİŞ SİL
// ==========================================
export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.delete,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() })
      
      const previousOrders = queryClient.getQueryData(orderKeys.lists())
      
      queryClient.setQueryData(orderKeys.lists(), (old) =>
        old?.filter((order) => order.id !== id)
      )
      
      return { previousOrders }
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(orderKeys.lists(), context?.previousOrders)
      toast.error(err?.message || 'Sipariş silinemedi!')
    },
    
    onSuccess: () => {
      toast.success('Sipariş silindi')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

// ==========================================
// AKTİF SİPARİŞ SAYISI
// ==========================================
export function useActiveOrdersCount() {
  const { data: orders } = useOrders()
  
  return orders?.filter((order) => 
    ['pending', 'preparing', 'ready'].includes(order.status)
  ).length || 0
}

// ==========================================
// SİPARİŞ GÜNCELLE (genel)
// ==========================================
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ordersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      if (API_ENABLED.tables) queryClient.invalidateQueries({ queryKey: tableKeys.all })
    },
    onError: (err) => toast.error(err?.message || 'Sipariş güncellenemedi'),
  })
}

// ==========================================
// MASA TRANSFERİ
// ==========================================
export function useTransferOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, fromTableId, toTableId }) => {
      if (!API_ENABLED.tables) throw new Error('Masa transferi henüz kullanılamıyor')
      const order = await ordersApi.update({ id: orderId, tableId: toTableId })
      await tablesApi.updateStatus({ id: fromTableId, status: 'available' })
      await tablesApi.updateStatus({ id: toTableId, status: 'occupied' })
      return order
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      if (API_ENABLED.tables) queryClient.invalidateQueries({ queryKey: tableKeys.all })
      toast.success('Sipariş transfer edildi')
    },
    onError: (err) => toast.error(err?.message || 'Transfer başarısız'),
  })
}

// ==========================================
// MASA BİRLEŞTİRME (siparişleri birleştir)
// ==========================================
export function useMergeOrders() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sourceOrderId, targetOrderId, targetTableId, sourceTableId }) => {
      if (!API_ENABLED.tables) throw new Error('Masa birleştirme henüz kullanılamıyor')
      const source = await ordersApi.getById(sourceOrderId)
      const target = await ordersApi.getById(targetOrderId)

      const mergedItems = [...target.items, ...source.items]
      const mergedTotal = (target.total || 0) + (source.total || 0)

      await ordersApi.update({
        id: targetOrderId,
        items: mergedItems,
        total: mergedTotal,
        tableId: targetTableId,
      })
      await ordersApi.updateStatus({ id: sourceOrderId, status: 'cancelled' })
      await tablesApi.updateStatus({ id: sourceTableId, status: 'available' })
      await tablesApi.updateStatus({ id: targetTableId, status: 'occupied' })

      return { targetOrderId, mergedTotal }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      if (API_ENABLED.tables) queryClient.invalidateQueries({ queryKey: tableKeys.all })
      toast.success('Masalar birleştirildi')
    },
    onError: (err) => toast.error(err?.message || 'Birleştirme başarısız'),
  })
}

