import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { useAppStore } from '../store/useAppStore'

// ==========================================
// BİLDİRİM API SERVİSLERİ
// ==========================================
const notificationsApi = {
  getAll: async () => {
    const { data } = await api.get('/notifications?_sort=createdAt&_order=desc')
    return data
  },
  
  getUnread: async () => {
    const { data } = await api.get('/notifications?read=false&_sort=createdAt&_order=desc')
    return data
  },
  
  markAsRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}`, { read: true })
    return data
  },
  
  markAllAsRead: async () => {
    const { data: unread } = await api.get('/notifications?read=false')
    
    await Promise.all(
      unread.map(notification => 
        api.patch(`/notifications/${notification.id}`, { read: true })
      )
    )
    
    return unread.length
  },
  
  create: async (notification) => {
    const { data } = await api.post('/notifications', {
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    })
    return data
  },
  
  delete: async (id) => {
    await api.delete(`/notifications/${id}`)
    return id
  },
  
  deleteAll: async () => {
    const { data } = await api.get('/notifications')
    await Promise.all(data.map(n => api.delete(`/notifications/${n.id}`)))
    return data.length
  },
}

// Query Keys
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  unread: () => [...notificationKeys.all, 'unread'],
}

// ==========================================
// TÜM BİLDİRİMLER
// ==========================================
export function useNotifications(options = {}) {
  const setUnreadNotifications = useAppStore((state) => state.setUnreadNotifications)

  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: notificationsApi.getAll,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // Her dakika kontrol et
    onSuccess: (data) => {
      const unreadCount = data.filter(n => !n.read).length
      setUnreadNotifications(unreadCount)
    },
    ...options,
  })
}

// ==========================================
// OKUNMAMIŞ BİLDİRİMLER
// ==========================================
export function useUnreadNotifications(options = {}) {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: notificationsApi.getUnread,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30, // 30 saniyede bir kontrol et
    ...options,
  })
}

// ==========================================
// BİLDİRİMİ OKUNDU İŞARETLE
// ==========================================
export function useMarkAsRead() {
  const queryClient = useQueryClient()
  const setUnreadNotifications = useAppStore((state) => state.setUnreadNotifications)

  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      
      const previousNotifications = queryClient.getQueryData(notificationKeys.lists())
      
      queryClient.setQueryData(notificationKeys.lists(), (old) =>
        old?.map(n => n.id === id ? { ...n, read: true } : n)
      )
      
      // Okunmamış sayısını güncelle
      const newUnread = previousNotifications?.filter(n => !n.read && n.id !== id).length || 0
      setUnreadNotifications(newUnread)
      
      return { previousNotifications }
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(notificationKeys.lists(), context?.previousNotifications)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==========================================
// TÜMÜNÜ OKUNDU İŞARETLE
// ==========================================
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const setUnreadNotifications = useAppStore((state) => state.setUnreadNotifications)

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      
      const previousNotifications = queryClient.getQueryData(notificationKeys.lists())
      
      queryClient.setQueryData(notificationKeys.lists(), (old) =>
        old?.map(n => ({ ...n, read: true }))
      )
      
      setUnreadNotifications(0)
      
      return { previousNotifications }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(notificationKeys.lists(), context?.previousNotifications)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==========================================
// BİLDİRİM OLUŞTUR
// ==========================================
export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.create,
    
    onSuccess: (data) => {
      // Listeye optimistik ekleme
      queryClient.setQueryData(notificationKeys.lists(), (old) =>
        old ? [data, ...old] : [data]
      )
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==========================================
// BİLDİRİM SİL
// ==========================================
export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationsApi.delete,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      
      const previousNotifications = queryClient.getQueryData(notificationKeys.lists())
      
      queryClient.setQueryData(notificationKeys.lists(), (old) =>
        old?.filter(n => n.id !== id)
      )
      
      return { previousNotifications }
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(notificationKeys.lists(), context?.previousNotifications)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==========================================
// TÜM BİLDİRİMLERİ SİL
// ==========================================
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient()
  const setUnreadNotifications = useAppStore((state) => state.setUnreadNotifications)

  return useMutation({
    mutationFn: notificationsApi.deleteAll,
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      
      const previousNotifications = queryClient.getQueryData(notificationKeys.lists())
      
      queryClient.setQueryData(notificationKeys.lists(), [])
      setUnreadNotifications(0)
      
      return { previousNotifications }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(notificationKeys.lists(), context?.previousNotifications)
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

// ==========================================
// OKUNMAMIŞ BİLDİRİM SAYISI
// ==========================================
export function useUnreadCount() {
  const { data } = useNotifications()
  return data?.filter(n => !n.read).length || 0
}

