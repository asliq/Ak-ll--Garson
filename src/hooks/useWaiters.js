import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { waitersApi, API_ENABLED } from '../api/services'
import toast from 'react-hot-toast'

export const waiterKeys = {
  all: ['waiters'],
  lists: () => [...waiterKeys.all, 'list'],
  detail: (id) => [...waiterKeys.all, 'detail', id],
}

export function useWaiters() {
  return useQuery({
    queryKey: waiterKeys.lists(),
    queryFn: waitersApi.getAll,
    enabled: API_ENABLED.waiters,
    staleTime: 1000 * 60,
    retry: false,
  })
}

export function useCreateWaiter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: waitersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waiterKeys.all })
      toast.success('Garson eklendi')
    },
    onError: () => toast.error('Garson eklenemedi'),
  })
}

export function useUpdateWaiter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: waitersApi.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waiterKeys.all })
      toast.success('Garson güncellendi')
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })
}

export function useDeleteWaiter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: waitersApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: waiterKeys.all })
      toast.success('Garson silindi')
    },
    onError: () => toast.error('Silme başarısız'),
  })
}
