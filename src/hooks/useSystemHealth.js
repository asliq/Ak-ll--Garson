import { useQuery } from '@tanstack/react-query'
import { useWebSocketContext } from '../components/WebSocketProvider'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

async function fetchHealth(endpoint) {
  const start = performance.now()
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const latencyMs = Math.round(performance.now() - start)

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  return { ok: response.ok, latencyMs, payload }
}

export function useSystemHealth(options = {}) {
  const { isConnected: wsConnected } = useWebSocketContext()

  const query = useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const [live, ready] = await Promise.allSettled([
        fetchHealth('/health/live'),
        fetchHealth('/health/ready'),
      ])

      const liveResult = live.status === 'fulfilled' ? live.value : { ok: false, latencyMs: 0 }
      const readyResult = ready.status === 'fulfilled' ? ready.value : { ok: false, latencyMs: 0 }

      const readyInfo = readyResult.payload?.info || readyResult.payload?.details || {}
      const dbStatus = readyInfo.database?.status === 'up' ? 'healthy' : readyResult.ok ? 'healthy' : 'unhealthy'
      const redisStatus = readyInfo.redis?.status === 'up' ? 'healthy' : readyResult.ok ? 'degraded' : 'unknown'

      return {
        api: liveResult.ok ? 'healthy' : 'unhealthy',
        apiLatencyMs: liveResult.latencyMs,
        database: dbStatus,
        redis: redisStatus,
        checkedAt: new Date().toISOString(),
      }
    },
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
    retry: 1,
    ...options,
  })

  const health = query.data
    ? {
        ...query.data,
        websocket: wsConnected ? 'connected' : 'disconnected',
      }
    : undefined

  return {
    ...query,
    health,
    wsConnected,
  }
}
