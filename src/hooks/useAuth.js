import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'

// ==========================================
// AUTH API SERVİSLERİ
// ==========================================
const authApi = {
  // Garson listesini al
  getWaiters: async () => {
    const { data } = await api.get('/waiters')
    return data
  },
  
  // Email ve PIN ile giriş yap
  login: async ({ email, pin }) => {
    // Simüle edilmiş login - gerçek uygulamada backend'de yapılır
    const { data: waiters } = await api.get('/waiters')
    
    const waiter = waiters.find(w => w.email === email)
    
    if (!waiter) {
      throw new Error('Kullanıcı bulunamadı')
    }
    
    // Demo için PIN kontrolü (gerçek uygulamada hash karşılaştırması yapılır)
    if (pin !== '1234') {
      throw new Error('Yanlış PIN kodu')
    }
    
    // Başarılı giriş
    return {
      ...waiter,
      token: `demo-token-${waiter.id}-${Date.now()}`,
      loginAt: new Date().toISOString(),
    }
  },
  
  // Oturumu kontrol et
  validateSession: async (waiterId) => {
    if (!waiterId) return null
    
    try {
      const { data } = await api.get(`/waiters/${waiterId}`)
      return data
    } catch {
      return null
    }
  },
}

// Query Keys
export const authKeys = {
  all: ['auth'],
  session: () => [...authKeys.all, 'session'],
  waiters: () => [...authKeys.all, 'waiters'],
}

// ==========================================
// OTURUM KONTROLÜ
// ==========================================
export function useSession() {
  const activeWaiter = useAppStore((state) => state.activeWaiter)
  
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authApi.validateSession(activeWaiter?.id),
    enabled: !!activeWaiter?.id,
    staleTime: 1000 * 60 * 5, // 5 dakika
    retry: false,
  })
}

// ==========================================
// GİRİŞ YAP
// ==========================================
export function useLogin() {
  const queryClient = useQueryClient()
  const setActiveWaiter = useAppStore((state) => state.setActiveWaiter)

  return useMutation({
    mutationFn: authApi.login,
    
    onSuccess: (data) => {
      // Store'a kaydet
      setActiveWaiter(data)
      
      // Session query'sini güncelle
      queryClient.setQueryData(authKeys.session(), data)
      
      toast.success(`Hoş geldin, ${data.name}! 👋`, {
        icon: data.avatar,
        duration: 3000,
      })
    },
    
    onError: (error) => {
      toast.error(error.message || 'Giriş başarısız')
    },
  })
}

// ==========================================
// ÇIKIŞ YAP
// ==========================================
export function useLogout() {
  const queryClient = useQueryClient()
  const clearActiveWaiter = useAppStore((state) => state.clearActiveWaiter)

  return useMutation({
    mutationFn: async () => {
      // Simüle edilmiş logout
      await new Promise(resolve => setTimeout(resolve, 300))
      return true
    },
    
    onSuccess: () => {
      // Store'u temizle
      clearActiveWaiter()
      
      // Tüm cache'i temizle
      queryClient.clear()
      
      toast.success('Çıkış yapıldı')
    },
  })
}

// ==========================================
// GARSONLARI GETİR (Admin için)
// ==========================================
export function useWaiters(options = {}) {
  return useQuery({
    queryKey: authKeys.waiters(),
    queryFn: authApi.getWaiters,
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

// ==========================================
// AUTH GUARD - Oturum kontrolü için
// ==========================================
export function useAuthGuard() {
  const activeWaiter = useAppStore((state) => state.activeWaiter)
  const { data: session, isLoading } = useSession()
  
  return {
    isAuthenticated: !!activeWaiter && !!session,
    isLoading,
    user: activeWaiter,
  }
}

// ==========================================
// CURRENT USER HOOK
// ==========================================
export function useCurrentUser() {
  return useAppStore((state) => state.activeWaiter)
}

