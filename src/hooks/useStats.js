import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../api/services'

export const statsKeys = {
  all: ['stats'],
}

// ==========================================
// İSTATİSTİKLERİ GETİR
// ==========================================
export function useStats(options = {}) {
  return useQuery({
    queryKey: statsKeys.all,
    queryFn: statsApi.get,
    staleTime: 1000 * 60, // 1 dakika
    refetchInterval: 1000 * 60 * 2, // 2 dakikada bir yenile
    ...options,
  })
}

