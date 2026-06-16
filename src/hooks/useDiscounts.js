import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { discountsApi } from '../api/services'
import toast from 'react-hot-toast'

// Get all discounts
export function useDiscounts() {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: discountsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get active discounts
export function useActiveDiscounts() {
  return useQuery({
    queryKey: ['discounts', 'active'],
    queryFn: discountsApi.getActive,
    staleTime: 1000 * 60 * 5,
  })
}

// Get discount by code
export function useDiscountByCode(code) {
  return useQuery({
    queryKey: ['discounts', 'code', code],
    queryFn: () => discountsApi.getByCode(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 5,
  })
}

// Create discount
export function useCreateDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: discountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
      toast.success('Kampanya başarıyla oluşturuldu!')
    },
    onError: (error) => {
      toast.error(error.message || 'Kampanya oluşturulamadı')
    },
  })
}

// Update discount
export function useUpdateDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => discountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
      toast.success('Kampanya güncellendi!')
    },
    onError: (error) => {
      toast.error(error.message || 'Kampanya güncellenemedi')
    },
  })
}

// Delete discount
export function useDeleteDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: discountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
      toast.success('Kampanya silindi!')
    },
    onError: (error) => {
      toast.error(error.message || 'Kampanya silinemedi')
    },
  })
}

// Calculate discount amount
export function calculateDiscount(discount, totalAmount) {
  if (!discount || !discount.isActive) return 0

  // Check minimum amount
  if (discount.minAmount && totalAmount < discount.minAmount) {
    return 0
  }

  // Check date range
  const now = new Date()
  const start = new Date(discount.startDate)
  const end = new Date(discount.endDate)
  
  if (now < start || now > end) {
    return 0
  }

  // Calculate based on type
  switch (discount.type) {
    case 'percentage':
      return (totalAmount * discount.value) / 100
    case 'fixed':
      return Math.min(discount.value, totalAmount)
    default:
      return 0
  }
}

