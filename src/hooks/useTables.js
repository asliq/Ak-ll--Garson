import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from '../api/services'
import toast from 'react-hot-toast'

// Query key factory - tutarlı key yönetimi için
export const tableKeys = {
  all: ['tables'],
  lists: () => [...tableKeys.all, 'list'],
  list: (filters) => [...tableKeys.lists(), { filters }],
  details: () => [...tableKeys.all, 'detail'],
  detail: (id) => [...tableKeys.details(), id],
}

// ==========================================
// TÜM MASALARI GETİR
// ==========================================
export function useTables(options = {}) {
  return useQuery({
    queryKey: tableKeys.lists(),
    queryFn: tablesApi.getAll,
    // Veri 2 dakika boyunca "fresh"
    staleTime: 1000 * 60 * 2,
    // Seçenekleri dışarıdan override edebiliriz
    ...options,
  })
}

// ==========================================
// TEK MASA GETİR
// ==========================================
export function useTable(id, options = {}) {
  return useQuery({
    queryKey: tableKeys.detail(id),
    queryFn: () => tablesApi.getById(id),
    // id yoksa sorgu çalışmaz
    enabled: !!id,
    ...options,
  })
}

// ==========================================
// MASA DURUMU GÜNCELLE (Optimistic Update ile)
// ==========================================
export function useUpdateTableStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tablesApi.updateStatus,
    
    // Mutasyon başlamadan önce - Optimistic Update
    onMutate: async ({ id, status }) => {
      // Bekleyen fetch'leri iptal et (race condition önleme)
      await queryClient.cancelQueries({ queryKey: tableKeys.lists() })
      
      // Mevcut veriyi kaydet (rollback için)
      const previousTables = queryClient.getQueryData(tableKeys.lists())
      
      // Cache'i optimistik olarak güncelle
      queryClient.setQueryData(tableKeys.lists(), (old) => 
        old?.map((table) =>
          table.id === id ? { ...table, status } : table
        )
      )
      
      // Rollback için önceki veriyi döndür
      return { previousTables }
    },
    
    // Hata durumunda rollback
    onError: (err, variables, context) => {
      queryClient.setQueryData(tableKeys.lists(), context?.previousTables)
      toast.error('Masa durumu güncellenemedi!')
    },
    
    // Başarılı olduğunda
    onSuccess: (data) => {
      const statusText = {
        available: 'Boş',
        occupied: 'Dolu',
        reserved: 'Rezerve',
      }
      toast.success(`Masa ${data.number} - ${statusText[data.status]}`)
    },
    
    // Her durumda (başarılı/başarısız) veriyi yenile
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() })
    },
  })
}

// ==========================================
// YENİ MASA EKLE
// ==========================================
export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tablesApi.create,
    
    onSuccess: (newTable) => {
      // Cache'e yeni masayı ekle
      queryClient.setQueryData(tableKeys.lists(), (old) => 
        old ? [...old, newTable] : [newTable]
      )
      toast.success(`Masa ${newTable.number} eklendi!`)
    },
    
    onError: () => {
      toast.error('Masa eklenemedi!')
    },
  })
}

// ==========================================
// MASA SİL
// ==========================================
export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tablesApi.delete,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tableKeys.lists() })
      
      const previousTables = queryClient.getQueryData(tableKeys.lists())
      
      queryClient.setQueryData(tableKeys.lists(), (old) =>
        old?.filter((table) => table.id !== id)
      )
      
      return { previousTables }
    },
    
    onError: (err, id, context) => {
      queryClient.setQueryData(tableKeys.lists(), context?.previousTables)
      toast.error('Masa silinemedi!')
    },
    
    onSuccess: () => {
      toast.success('Masa silindi!')
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() })
    },
  })
}

// ==========================================
// MASA VERİSİNİ PREFETCH ET
// ==========================================
export function usePrefetchTable() {
  const queryClient = useQueryClient()

  return (id) => {
    queryClient.prefetchQuery({
      queryKey: tableKeys.detail(id),
      queryFn: () => tablesApi.getById(id),
      staleTime: 1000 * 60 * 5,
    })
  }
}

