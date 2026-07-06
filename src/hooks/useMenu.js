import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi, categoriesApi } from '../api/services'
import toast from 'react-hot-toast'

function shouldRetryQuery(failureCount, error) {
  const status = error?.status
  if (status && status < 500) return false
  return failureCount < 1
}

// Query key factory
export const menuKeys = {
  all: ['menu'],
  lists: () => [...menuKeys.all, 'list'],
  list: (filters) => [...menuKeys.lists(), { filters }],
  byCategory: (categoryId) => [...menuKeys.all, 'category', categoryId],
  details: () => [...menuKeys.all, 'detail'],
  detail: (id) => [...menuKeys.details(), id],
}

export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  detail: (id) => [...categoryKeys.all, 'detail', id],
}

// ==========================================
// TÜM MENÜ ÖĞELERİNİ GETİR
// ==========================================
export function useMenuItems(options = {}) {
  return useQuery({
    queryKey: menuKeys.lists(),
    queryFn: menuApi.getAll,
    staleTime: 1000 * 60 * 5,
    retry: shouldRetryQuery,
    retryDelay: 500,
    ...options,
  })
}

// ==========================================
// KATEGORİYE GÖRE MENÜ ÖĞELERİ
// ==========================================
export function useMenuByCategory(categoryId, options = {}) {
  return useQuery({
    queryKey: menuKeys.byCategory(categoryId),
    queryFn: () => menuApi.getByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// ==========================================
// TEK MENÜ ÖĞESİ
// ==========================================
export function useMenuItem(id, options = {}) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: () => menuApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

// ==========================================
// TÜM KATEGORİLERİ GETİR
// ==========================================
export function useCategories(options = {}) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoriesApi.getAll,
    staleTime: 1000 * 60 * 10,
    retry: shouldRetryQuery,
    retryDelay: 500,
    ...options,
  })
}

// ==========================================
// MENÜ ÖĞESİ STOK DURUMU GÜNCELLE
// ==========================================
export function useUpdateMenuAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.updateAvailability,
    
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.lists() })
      
      const previousItems = queryClient.getQueryData(menuKeys.lists())
      
      queryClient.setQueryData(menuKeys.lists(), (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, isAvailable } : item
        )
      )
      
      return { previousItems }
    },
    
    onError: (err, variables, context) => {
      queryClient.setQueryData(menuKeys.lists(), context?.previousItems)
      toast.error(err?.message || 'Stok durumu güncellenemedi!')
    },
    
    onSuccess: (data) => {
      toast.success(
        data.isAvailable 
          ? `${data.name} tekrar stokta!` 
          : `${data.name} stoktan çıkarıldı`
      )
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
    },
  })
}

// ==========================================
// MENÜ ÖĞESİ FİYAT GÜNCELLE
// ==========================================
export function useUpdateMenuPrice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.updatePrice,
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
      toast.success(`Fiyat güncellendi: ₺${data.price}`)
    },
    
    onError: (err) => {
      toast.error(err?.message || 'Fiyat güncellenemedi. Lütfen tekrar deneyin.')
    },
  })
}

// ==========================================
// YENİ MENÜ ÖĞESİ OLUŞTUR
// ==========================================
export function useCreateMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.create,

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
      toast.success(`${data.name} menüye eklendi!`)
    },

    onError: (err) => {
      toast.error(err?.message || 'Ürün eklenemedi. Bilgileri kontrol edip tekrar deneyin.')
    },
  })
}

// ==========================================
// MENÜ ÖĞESİ SİL
// ==========================================
export function useDeleteMenuItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: menuApi.delete,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.lists() })
      const previousItems = queryClient.getQueryData(menuKeys.lists())
      queryClient.setQueryData(menuKeys.lists(), (old) =>
        old?.filter((item) => item.id !== id)
      )
      return { previousItems }
    },

    onError: (err, id, context) => {
      queryClient.setQueryData(menuKeys.lists(), context?.previousItems)
      toast.error(err?.message || 'Ürün silinemedi!')
    },

    onSuccess: () => {
      toast.success('Ürün menüden kaldırıldı')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all })
    },
  })
}

// ==========================================
// MENÜ + KATEGORİ COMBINED HOOK
// ==========================================
export function useMenuWithCategories() {
  const menuQuery = useMenuItems()
  const categoriesQuery = useCategories()

  const isLoading =
    (menuQuery.isLoading && menuQuery.data === undefined) ||
    (categoriesQuery.isLoading && categoriesQuery.data === undefined)
  const isError = menuQuery.isError || categoriesQuery.isError
  const error = menuQuery.error || categoriesQuery.error

  // Menü öğelerini kategorilere göre grupla
  const groupedMenu = categoriesQuery.data?.map((category) => ({
    ...category,
    items: menuQuery.data?.filter((item) => item.categoryId === category.id) || [],
  })) || []

  return {
    categories: categoriesQuery.data || [],
    menuItems: menuQuery.data || [],
    groupedMenu,
    isLoading,
    isError,
    error,
    refetch: () => {
      menuQuery.refetch()
      categoriesQuery.refetch()
    },
  }
}

