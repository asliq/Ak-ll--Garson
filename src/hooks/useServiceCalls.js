import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceCallsApi, API_ENABLED } from '../api/services'
import toast from 'react-hot-toast'

export const serviceCallKeys = {
  all: ['serviceCalls'],
  pending: () => [...serviceCallKeys.all, 'pending'],
}

export function useServiceCalls(options = {}) {
  return useQuery({
    queryKey: serviceCallKeys.all,
    queryFn: serviceCallsApi.getAll,
    enabled: API_ENABLED.serviceCalls,
    refetchInterval: API_ENABLED.serviceCalls ? 5000 : false,
    staleTime: 2000,
    retry: false,
    ...options,
  })
}

export function usePendingServiceCalls() {
  return useQuery({
    queryKey: serviceCallKeys.pending(),
    queryFn: serviceCallsApi.getPending,
    enabled: API_ENABLED.serviceCalls,
    refetchInterval: API_ENABLED.serviceCalls ? 3000 : false,
    staleTime: 1000,
    retry: false,
  })
}

export function useCreateServiceCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      if (!API_ENABLED.serviceCalls) {
        throw new Error('SERVICE_CALLS_DISABLED')
      }
      return serviceCallsApi.create(data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceCallKeys.all })
    },
    onError: (err) => {
      if (err?.message === 'SERVICE_CALLS_DISABLED') {
        toast('Garson çağırma şu an kullanılamıyor', { icon: 'ℹ️' })
        return
      }
      toast.error('Talep gönderilemedi')
    },
  })
}

export function useHandleServiceCall() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: serviceCallsApi.markHandled,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceCallKeys.all })
      toast.success('Talep yanıtlandı')
    },
  })
}
