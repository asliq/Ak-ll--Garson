import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceCallsApi, API_ENABLED } from '../api/services'
import toast from 'react-hot-toast'

export const serviceCallKeys = {
  all: ['serviceCalls'],
  pending: () => [...serviceCallKeys.all, 'pending'],
  active: () => [...serviceCallKeys.all, 'active'],
}

export function useServiceCalls(options = {}) {
  return useQuery({
    queryKey: serviceCallKeys.all,
    queryFn: serviceCallsApi.getAll,
    enabled: API_ENABLED.serviceCalls,
    refetchInterval: API_ENABLED.serviceCalls ? 10000 : false,
    staleTime: 3000,
    retry: false,
    ...options,
  })
}

export function usePendingServiceCalls() {
  return useQuery({
    queryKey: serviceCallKeys.pending(),
    queryFn: serviceCallsApi.getPending,
    enabled: API_ENABLED.serviceCalls,
    refetchInterval: API_ENABLED.serviceCalls ? 5000 : false,
    staleTime: 2000,
    retry: false,
  })
}

export function useCreateServiceCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceCallsApi.createPublic,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceCallKeys.all })
      toast.success('Talebiniz iletildi')
    },
    onError: (err) => {
      toast.error(err?.message || 'Talep gönderilemedi')
    },
  })
}

export function useUpdateServiceCallStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceCallsApi.updateStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceCallKeys.all })
    },
    onError: () => {
      toast.error('Durum güncellenemedi')
    },
  })
}

export function useHandleServiceCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceCallsApi.markHandled,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceCallKeys.all })
      toast.success('Talep tamamlandı')
    },
  })
}
