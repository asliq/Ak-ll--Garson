import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

// ==========================================
// ANA UYGULAMA STORE
// Zustand ile global state yönetimi
// TanStack Query ile birlikte kullanılır
// ==========================================

export const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ==========================================
        // UI STATE
        // ==========================================
        sidebarCollapsed: false,
        theme: 'light',
        language: 'tr',
        soundEnabled: true,
        kitchenAutoRefresh: true,
        kitchenRefreshInterval: 5000,
        
        toggleSidebar: () => set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        })),
        
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        setKitchenAutoRefresh: (value) => set({ kitchenAutoRefresh: value }),
        setKitchenRefreshInterval: (interval) => set({ kitchenRefreshInterval: interval }),

        // ==========================================
        // ACTIVE WAITER (Giriş yapan garson)
        // ==========================================
        activeWaiter: null,
        setActiveWaiter: (waiter) => set({ activeWaiter: waiter }),
        clearActiveWaiter: () => set({ activeWaiter: null }),

        // ==========================================
        // CART STATE (Sepet - her masa için ayrı)
        // ==========================================
        carts: {}, // { tableId: [items] }
        
        addToCart: (tableId, item) => set((state) => {
          const tableCart = state.carts[tableId] || []
          const existingItem = tableCart.find(i => i.menuItemId === item.menuItemId)
          
          if (existingItem) {
            return {
              carts: {
                ...state.carts,
                [tableId]: tableCart.map(i =>
                  i.menuItemId === item.menuItemId
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                )
              }
            }
          }
          
          return {
            carts: {
              ...state.carts,
              [tableId]: [...tableCart, { ...item, quantity: 1, notes: '' }]
            }
          }
        }),
        
        removeFromCart: (tableId, menuItemId) => set((state) => ({
          carts: {
            ...state.carts,
            [tableId]: (state.carts[tableId] || []).filter(
              i => i.menuItemId !== menuItemId
            )
          }
        })),
        
        updateCartItemQuantity: (tableId, menuItemId, quantity) => set((state) => {
          if (quantity <= 0) {
            return {
              carts: {
                ...state.carts,
                [tableId]: (state.carts[tableId] || []).filter(
                  i => i.menuItemId !== menuItemId
                )
              }
            }
          }
          
          return {
            carts: {
              ...state.carts,
              [tableId]: (state.carts[tableId] || []).map(i =>
                i.menuItemId === menuItemId ? { ...i, quantity } : i
              )
            }
          }
        }),
        
        updateCartItemNotes: (tableId, menuItemId, notes) => set((state) => ({
          carts: {
            ...state.carts,
            [tableId]: (state.carts[tableId] || []).map(i =>
              i.menuItemId === menuItemId ? { ...i, notes } : i
            )
          }
        })),
        
        clearCart: (tableId) => set((state) => ({
          carts: {
            ...state.carts,
            [tableId]: []
          }
        })),
        
        getCartTotal: (tableId) => {
          const cart = get().carts[tableId] || []
          return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        },
        
        getCartItemCount: (tableId) => {
          const cart = get().carts[tableId] || []
          return cart.reduce((sum, item) => sum + item.quantity, 0)
        },

        // ==========================================
        // NOTIFICATIONS STATE
        // ==========================================
        unreadNotifications: 0,
        setUnreadNotifications: (count) => set({ unreadNotifications: count }),

        // ==========================================
        // KITCHEN DISPLAY SETTINGS
        // ==========================================
        kitchenAutoRefresh: true,
        kitchenRefreshInterval: 10000, // 10 saniye
        setKitchenAutoRefresh: (value) => set({ kitchenAutoRefresh: value }),
        setKitchenRefreshInterval: (interval) => set({ kitchenRefreshInterval: interval }),

        // ==========================================
        // SOUND SETTINGS
        // ==========================================
        soundEnabled: true,
        notificationSound: 'default',
        toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        setNotificationSound: (sound) => set({ notificationSound: sound }),

        // ==========================================
        // FILTERS STATE (Sayfa bazlı filtreler)
        // ==========================================
        filters: {
          tables: { status: 'all', section: 'all' },
          orders: { status: 'active', waiter: 'all' },
          menu: { category: null, search: '' },
          reservations: { date: null, status: 'all' },
        },
        
        setFilter: (page, key, value) => set((state) => ({
          filters: {
            ...state.filters,
            [page]: {
              ...state.filters[page],
              [key]: value
            }
          }
        })),
        
        resetFilters: (page) => set((state) => ({
          filters: {
            ...state.filters,
            [page]: page === 'tables' 
              ? { status: 'all', section: 'all' }
              : page === 'orders'
              ? { status: 'active', waiter: 'all' }
              : page === 'menu'
              ? { category: null, search: '' }
              : { date: null, status: 'all' }
          }
        })),
      }),
      {
        name: 'akilli-garson-storage',
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          soundEnabled: state.soundEnabled,
          kitchenAutoRefresh: state.kitchenAutoRefresh,
          kitchenRefreshInterval: state.kitchenRefreshInterval,
          activeWaiter: state.activeWaiter,
        }),
      }
    ),
    { name: 'AkilliGarsonStore' }
  )
)

// ==========================================
// SELECTORS (Performans için)
// ==========================================
export const useCart = (tableId) => useAppStore((state) => state.carts[tableId] || [])
export const useCartTotal = (tableId) => useAppStore((state) => state.getCartTotal(tableId))
export const useCartItemCount = (tableId) => useAppStore((state) => state.getCartItemCount(tableId))
export const useActiveWaiter = () => useAppStore((state) => state.activeWaiter)
export const useFilters = (page) => useAppStore((state) => state.filters[page])

