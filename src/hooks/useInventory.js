import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/services'
import toast from 'react-hot-toast'

// Get all inventory items
export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get low stock items
export function useLowStockItems() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.getLowStock,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Create inventory item
export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ürün eklendi!')
    },
    onError: (error) => {
      toast.error(error.message || 'Ürün eklenemedi')
    },
  })
}

// Update inventory item
export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => inventoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (error) => {
      toast.error(error.message || 'Güncelleme başarısız')
    },
  })
}

// Delete inventory item
export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ürün silindi!')
    },
    onError: (error) => {
      toast.error(error.message || 'Silme başarısız')
    },
  })
}

