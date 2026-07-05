import { useQuery } from '@tanstack/react-query'
import { publicMenuApi } from '../api/services'

export const publicMenuKeys = {
  all: ['publicMenu'],
  byToken: (tableToken) => [...publicMenuKeys.all, tableToken],
}

export function usePublicMenu(tableToken, options = {}) {
  return useQuery({
    queryKey: publicMenuKeys.byToken(tableToken),
    queryFn: () => publicMenuApi.getByTableToken(tableToken),
    enabled: !!tableToken,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    retryDelay: 300,
    ...options,
  })
}
