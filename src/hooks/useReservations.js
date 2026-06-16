import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ==========================================
// REZERVASYON API SERVİSLERİ
// ==========================================
const reservationsApi = {
  getAll: async ({ page = 1, limit = 10, status, date }) => {
    const params = new URLSearchParams()
    params.append('_page', page)
    params.append('_limit', limit)
    if (status && status !== 'all') params.append('status', status)
    if (date) params.append('date', date)
    
    const { data, headers } = await api.get(`/reservations?${params}`)
    const total = parseInt(headers['x-total-count'] || '0')
    
    return {
      reservations: data,
      nextPage: data.length === limit ? page + 1 : undefined,
      total,
    }
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/reservations/${id}`)
    return data
  },
  
  getByDate: async (date) => {
    const { data } = await api.get(`/reservations?date=${date}`)
    return data
  },
  
  getByTable: async (tableId) => {
    const { data } = await api.get(`/reservations?tableId=${tableId}`)
    return data
  },
  
  create: async (reservation) => {
    const { data } = await api.post('/reservations', {
      ...reservation,
      createdAt: new Date().toISOString(),
    })
    return data
  },
  
  update: async ({ id, ...updates }) => {
    const { data } = await api.patch(`/reservations/${id}`, updates)
    return data
  },
  
  updateStatus: async ({ id, status }) => {
    const { data } = await api.patch(`/reservations/${id}`, { status })
    return data
  },
  
  delete: async (id) => {
    await api.delete(`/reservations/${id}`)
    return id
  },
}

// Query Keys
export const reservationKeys = {
  all: ['reservations'],
  lists: () => [...reservationKeys.all, 'list'],
  list: (filters) => [...reservationKeys.lists(), filters],
  infinite: (filters) => [...reservationKeys.all, 'infinite', filters],
  byDate: (date) => [...reservationKeys.all, 'date', date],
  byTable: (tableId) => [...reservationKeys.all, 'table', tableId],
  details: () => [...reservationKeys.all, 'detail'],
  detail: (id) => [...reservationKeys.details(), id],
}

// ==========================================
// INFINITE QUERY - Sayfalama ile Rezervasyonlar
// ==========================================
export function useInfiniteReservations(filters = {}) {
  return useInfiniteQuery({
    queryKey: reservationKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) => reservationsApi.getAll({ 
      page: pageParam, 
      limit: 10,
      ...filters 
    }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 2,
  })
}

// ==========================================
// TARİHE GÖRE REZERVASYONLAR
// ==========================================
export function useReservationsByDate(date, options = {}) {
  return useQuery({
    queryKey: reservationKeys.byDate(date),
    queryFn: () => reservationsApi.getByDate(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

// ==========================================
// MASAYA GÖRE REZERVASYONLAR
// ==========================================
export function useReservationsByTable(tableId, options = {}) {
  return useQuery({
    queryKey: reservationKeys.byTable(tableId),
    queryFn: () => reservationsApi.getByTable(tableId),
    enabled: !!tableId,
    ...options,
  })
}

// ==========================================
// TEK REZERVASYON
// ==========================================
export function useReservation(id, options = {}) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationsApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

// ==========================================
// REZERVASYON OLUŞTUR
// ==========================================
export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reservationsApi.create,
    
    onSuccess: (data) => {
      // Tüm rezervasyon listelerini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      
      // İlgili masanın durumunu güncelle
      queryClient.invalidateQueries({ queryKey: ['tables'] })
      
      toast.success(`Rezervasyon oluşturuldu: ${data.customerName}`)
    },
    
    onError: (error) => {
      toast.error('Rezervasyon oluşturulamadı!')
      console.error('Reservation creation error:', error)
    },
  })
}

// ==========================================
// REZERVASYON GÜNCELLE
// ==========================================
export function useUpdateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reservationsApi.update,
    
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: reservationKeys.detail(id) })
      
      const previousReservation = queryClient.getQueryData(reservationKeys.detail(id))
      
      queryClient.setQueryData(reservationKeys.detail(id), (old) => ({
        ...old,
        ...updates,
      }))
      
      return { previousReservation }
    },
    
    onError: (err, { id }, context) => {
      queryClient.setQueryData(
        reservationKeys.detail(id), 
        context?.previousReservation
      )
      toast.error('Rezervasyon güncellenemedi!')
    },
    
    onSuccess: () => {
      toast.success('Rezervasyon güncellendi')
    },
    
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
    },
  })
}

// ==========================================
// REZERVASYON DURUMU GÜNCELLE
// ==========================================
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reservationsApi.updateStatus,
    
    onMutate: async ({ id, status }) => {
      // Tüm liste sorgularını iptal et
      await queryClient.cancelQueries({ queryKey: reservationKeys.lists() })
      
      // Optimistic update için tüm infinite query sayfalarını güncelle
      queryClient.setQueriesData(
        { queryKey: reservationKeys.all },
        (old) => {
          if (!old) return old
          
          // Infinite query yapısı için
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map(page => ({
                ...page,
                reservations: page.reservations.map(r =>
                  r.id === id ? { ...r, status } : r
                )
              }))
            }
          }
          
          // Normal array için
          if (Array.isArray(old)) {
            return old.map(r => r.id === id ? { ...r, status } : r)
          }
          
          return old
        }
      )
    },
    
    onSuccess: (data) => {
      const statusText = {
        confirmed: 'onaylandı',
        pending: 'beklemede',
        cancelled: 'iptal edildi',
        completed: 'tamamlandı',
      }
      toast.success(`Rezervasyon ${statusText[data.status]}`)
    },
    
    onError: () => {
      toast.error('Durum güncellenemedi!')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

// ==========================================
// REZERVASYON SİL
// ==========================================
export function useDeleteReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reservationsApi.delete,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reservationKeys.all })
      
      // Optimistic delete
      queryClient.setQueriesData(
        { queryKey: reservationKeys.all },
        (old) => {
          if (!old) return old
          
          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map(page => ({
                ...page,
                reservations: page.reservations.filter(r => r.id !== id)
              }))
            }
          }
          
          if (Array.isArray(old)) {
            return old.filter(r => r.id !== id)
          }
          
          return old
        }
      )
    },
    
    onSuccess: () => {
      toast.success('Rezervasyon silindi')
    },
    
    onError: () => {
      toast.error('Rezervasyon silinemedi!')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.all })
    },
  })
}

// ==========================================
// BUGÜNKÜ REZERVASYON SAYISI
// ==========================================
export function useTodayReservationsCount() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = useReservationsByDate(today)
  
  return data?.filter(r => r.status !== 'cancelled').length || 0
}

