import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/services'
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
    staleTime: 1000 * 10, // 10 saniye - siparişler sık değişir
    refetchInterval: 1000 * 5, // Her 5 saniyede otomatik yenile (real-time için)
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
// YENİ SİPARİŞ OLUŞTUR
// ==========================================
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.create,
    
    onSuccess: (data) => {
      // Tüm sipariş listelerini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      
      // Masanın durumunu "occupied" yap
      queryClient.setQueryData(tableKeys.lists(), (old) =>
        old?.map((table) =>
          table.id === data.tableId ? { ...table, status: 'occupied' } : table
        )
      )
      
      toast.success('Sipariş oluşturuldu! 🎉')
    },
    
    onError: () => {
      toast.error('Sipariş oluşturulamadı!')
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
      
      // Eğer sipariş ödendi veya iptal edildiyse masayı boşalt
      if (data.status === 'paid' || data.status === 'cancelled') {
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
    
    onError: () => {
      toast.error('Ürün eklenemedi!')
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
    
    onError: () => {
      toast.error('Ürün çıkarılamadı!')
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
      toast.error('Sipariş silinemedi!')
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

