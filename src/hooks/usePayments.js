import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { API_ENABLED } from '../api/services'

// ==========================================
// ÖDEME API SERVİSLERİ
// ==========================================
const paymentsApi = {
  getAll: async () => {
    const { data } = await api.get('/payments')
    return data
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/payments/${id}`)
    return data
  },
  
  getByOrder: async (orderId) => {
    const { data } = await api.get(`/payments?orderId=${orderId}`)
    return data[0] || null
  },
  
  getByTable: async (tableId) => {
    const { data } = await api.get(`/payments?tableId=${tableId}`)
    return data
  },
  
  getByDateRange: async (startDate, endDate) => {
    const { data } = await api.get('/payments')
    return data.filter(p => {
      const date = new Date(p.processedAt)
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  },
  
  create: async (payment) => {
    // Fiş numarası oluştur
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    
    const { data } = await api.post('/payments', {
      ...payment,
      receiptNumber,
      processedAt: new Date().toISOString(),
    })
    return data
  },
  
  // Split payment (bölünmüş ödeme)
  createSplit: async ({ orderId, tableId, splits }) => {
    const payments = []
    
    for (const split of splits) {
      const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
      const { data } = await api.post('/payments', {
        orderId,
        tableId,
        amount: split.amount,
        tip: split.tip || 0,
        method: split.method,
        status: 'completed',
        receiptNumber,
        processedAt: new Date().toISOString(),
        splitPayment: true,
      })
      payments.push(data)
    }
    
    return payments
  },
  
  refund: async ({ paymentId, amount, reason }) => {
    const { data: payment } = await api.get(`/payments/${paymentId}`)
    
    const { data } = await api.patch(`/payments/${paymentId}`, {
      status: amount === payment.amount ? 'refunded' : 'partial_refund',
      refundedAmount: amount,
      refundReason: reason,
      refundedAt: new Date().toISOString(),
    })
    return data
  },
}

// Query Keys
export const paymentKeys = {
  all: ['payments'],
  lists: () => [...paymentKeys.all, 'list'],
  byOrder: (orderId) => [...paymentKeys.all, 'order', orderId],
  byTable: (tableId) => [...paymentKeys.all, 'table', tableId],
  byDateRange: (start, end) => [...paymentKeys.all, 'range', start, end],
  details: () => [...paymentKeys.all, 'detail'],
  detail: (id) => [...paymentKeys.details(), id],
}

// ==========================================
// TÜM ÖDEMELERİ GETİR
// ==========================================
export function usePayments(options = {}) {
  return useQuery({
    queryKey: paymentKeys.lists(),
    queryFn: paymentsApi.getAll,
    enabled: API_ENABLED.payments,
    staleTime: 1000 * 60 * 2,
    retry: false,
    ...options,
  })
}

// ==========================================
// SİPARİŞ ÖDEMESİ
// ==========================================
export function useOrderPayment(orderId, options = {}) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId),
    queryFn: () => paymentsApi.getByOrder(orderId),
    enabled: API_ENABLED.payments && !!orderId,
    retry: false,
    ...options,
  })
}

// ==========================================
// MASA ÖDEMELERİ
// ==========================================
export function useTablePayments(tableId, options = {}) {
  return useQuery({
    queryKey: paymentKeys.byTable(tableId),
    queryFn: () => paymentsApi.getByTable(tableId),
    enabled: API_ENABLED.payments && !!tableId,
    retry: false,
    ...options,
  })
}

// ==========================================
// TARİH ARALIĞI ÖDEMELERİ
// ==========================================
export function usePaymentsByDateRange(startDate, endDate, options = {}) {
  return useQuery({
    queryKey: paymentKeys.byDateRange(startDate, endDate),
    queryFn: () => paymentsApi.getByDateRange(startDate, endDate),
    enabled: API_ENABLED.payments && !!startDate && !!endDate,
    retry: false,
    ...options,
  })
}

// ==========================================
// ÖDEME OLUŞTUR
// ==========================================
export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payment) => {
      if (!API_ENABLED.payments) {
        throw new Error('PAYMENTS_DISABLED')
      }
      return paymentsApi.create(payment)
    },
    
    onSuccess: (data) => {
      // Ödeme listesini güncelle
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      
      // Sipariş durumunu güncelle
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      
      // Masa durumunu güncelle
      queryClient.setQueryData(['tables', 'list'], (old) =>
        old?.map(table =>
          table.id === data.tableId ? { ...table, status: 'available' } : table
        )
      )
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      
      const methodText = {
        cash: 'Nakit',
        credit_card: 'Kredi Kartı',
        debit_card: 'Banka Kartı',
        mobile: 'Mobil Ödeme',
        online: 'Online',
      }
      
      toast.success(
        `Ödeme alındı: ₺${data.amount + (data.tip || 0)} (${methodText[data.method]})`,
        { icon: '💳', duration: 4000 }
      )
    },
    
    onError: (err) => {
      if (err?.message === 'PAYMENTS_DISABLED') {
        toast('Ödeme API henüz aktif değil', { icon: 'ℹ️' })
        return
      }
      toast.error('Ödeme işlemi başarısız!')
    },
  })
}

// ==========================================
// BÖLÜNMÜŞ ÖDEME
// ==========================================
export function useCreateSplitPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      if (!API_ENABLED.payments) {
        throw new Error('PAYMENTS_DISABLED')
      }
      return paymentsApi.createSplit(payload)
    },
    
    onSuccess: (data, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      
      toast.success(`${data.length} parça halinde ödeme alındı`, { icon: '💳' })
    },
    
    onError: (err) => {
      if (err?.message === 'PAYMENTS_DISABLED') {
        toast('Ödeme API henüz aktif değil', { icon: 'ℹ️' })
        return
      }
      toast.error('Bölünmüş ödeme işlemi başarısız!')
    },
  })
}

// ==========================================
// İADE
// ==========================================
export function useRefundPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: paymentsApi.refund,
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      
      toast.success(`₺${data.refundedAmount} iade edildi`, { icon: '↩️' })
    },
    
    onError: () => {
      toast.error('İade işlemi başarısız!')
    },
  })
}

// ==========================================
// GÜNLÜK ÖDEME İSTATİSTİKLERİ
// ==========================================
export function useDailyPaymentStats() {
  if (!API_ENABLED.payments) return null
  const { data: payments } = usePayments()
  
  if (!payments) return null
  
  const today = new Date().toISOString().split('T')[0]
  const todayPayments = payments.filter(p => 
    p.processedAt.startsWith(today) && p.status === 'completed'
  )
  
  const totalRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalTips = todayPayments.reduce((sum, p) => sum + (p.tip || 0), 0)
  const transactionCount = todayPayments.length
  
  const byMethod = todayPayments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + p.amount
    return acc
  }, {})

  return {
    totalRevenue,
    totalTips,
    transactionCount,
    avgTransaction: transactionCount > 0 ? totalRevenue / transactionCount : 0,
    byMethod,
  }
}

