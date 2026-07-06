import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { setRestaurantId } from '../api/axios'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'

const DEMO_WAITERS = [
  { id: '1', name: 'Ahmet', email: 'ahmet@restoran.com', role: 'waiter', avatar: '👨‍🍳' },
  { id: '2', name: 'Ayşe', email: 'ayse@restoran.com', role: 'manager', avatar: '👩‍💼' },
]

const authApi = {
  login: async ({ email, pin }) => {
    const waiter = DEMO_WAITERS.find((w) => w.email === email)

    if (!waiter) {
      throw new Error('Kullanıcı bulunamadı')
    }

    if (pin !== '1234') {
      throw new Error('Yanlış PIN kodu')
    }

    const restaurantId = import.meta.env.VITE_RESTAURANT_ID
    if (!restaurantId) {
      throw new Error('VITE_RESTAURANT_ID tanımlı değil — .env dosyasını kontrol edin')
    }
    setRestaurantId(restaurantId)

    return {
      ...waiter,
      token: `demo-token-${waiter.id}-${Date.now()}`,
      loginAt: new Date().toISOString(),
    }
  },

  validateSession: async (waiterId) => {
    if (!waiterId) return null
    return DEMO_WAITERS.find((w) => w.id === waiterId) || null
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
    queryFn: async () => DEMO_WAITERS,
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

// ==========================================
// AUTH GUARD - Oturum kontrolü için
// ==========================================
export function useAuthGuard() {
  const activeWaiter = useAppStore((state) => state.activeWaiter)
  const { data: session, isPending, isFetching } = useSession()

  // Demo auth: activeWaiter from persist is sufficient once session resolves or is cached
  const sessionLoading = !!activeWaiter?.id && isPending && isFetching && !session

  return {
    isAuthenticated: !!activeWaiter,
    isLoading: sessionLoading,
    user: activeWaiter,
  }
}

// ==========================================
// CURRENT USER HOOK
// ==========================================
export function useCurrentUser() {
  return useAppStore((state) => state.activeWaiter)
}

