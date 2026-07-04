import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { useAppStore } from '../store/useAppStore'
import { orderKeys } from './useOrders'

const MAX_RECONNECT_DELAY_MS = 30000
const BASE_RECONNECT_DELAY_MS = 2000

const ORDER_WS_EVENTS = new Set([
  'order.created',
  'order.updated',
  'order.ready',
  'order.served',
])

function invalidateOrderQueries(queryClient, payload) {
  queryClient.invalidateQueries({ queryKey: orderKeys.all })

  if (payload?.orderId) {
    queryClient.invalidateQueries({ queryKey: orderKeys.detail(payload.orderId) })
  }

  if (payload?.tableId) {
    queryClient.invalidateQueries({ queryKey: orderKeys.byTable(payload.tableId) })
  }
}

export const useWebSocket = (url = null, options = {}) => {
  const { getJoinMessage } = options
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const getJoinMessageRef = useRef(getJoinMessage)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const addNotification = useAppStore((state) => state.addNotification)

  getJoinMessageRef.current = getJoinMessage

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'connected':
          break

        case 'order.created':
          invalidateOrderQueries(queryClient, data.payload)
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          addNotification()
          if (data.payload?.tableId) {
            toast.success('Yeni sipariş alındı')
          }
          break

        case 'order.updated':
        case 'order.ready':
        case 'order.served':
          invalidateOrderQueries(queryClient, data.payload)
          if (data.type === 'order.ready') {
            toast.success('Sipariş hazır')
          }
          break

        case 'TABLE_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['tables'] })
          break

        case 'PAYMENT_COMPLETED':
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['tables'] })
          queryClient.invalidateQueries({ queryKey: ['payments'] })
          addNotification()
          break

        case 'STOCK_ALERT':
          queryClient.invalidateQueries({ queryKey: ['inventory'] })
          addNotification()
          break

        case 'RESERVATION_NEW':
          queryClient.invalidateQueries({ queryKey: ['reservations'] })
          addNotification()
          break

        case 'CALL_WAITER':
          queryClient.invalidateQueries({ queryKey: ['serviceCalls'] })
          addNotification()
          toast('Garson çağrısı!', { icon: '🛎️' })
          break

        case 'DATA_CHANGED':
          queryClient.invalidateQueries()
          break

        default:
          if (ORDER_WS_EVENTS.has(data.type)) {
            invalidateOrderQueries(queryClient, data.payload)
          }
          break
      }
    } catch (error) {
      console.error('WebSocket mesajı işlenirken hata:', error)
    }
  }, [queryClient, addNotification])

  const sendJoinMessage = useCallback((socket) => {
    const joinMessage = getJoinMessageRef.current?.()
    if (joinMessage && socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(joinMessage))
    }
  }, [])

  const connect = useCallback(() => {
    if (!url) return

    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const socket = new WebSocket(url)
      wsRef.current = socket

      socket.onopen = () => {
        reconnectAttempts.current = 0
        setIsConnected(true)
        sendJoinMessage(socket)
      }

      socket.onmessage = handleMessage

      socket.onerror = (error) => {
        console.error('WebSocket hatası:', error)
      }

      socket.onclose = () => {
        setIsConnected(false)
        wsRef.current = null

        const delay = Math.min(
          BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts.current,
          MAX_RECONNECT_DELAY_MS,
        )

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1
          connect()
        }, delay)
      }
    } catch (error) {
      console.error('WebSocket bağlantısı kurulamadı:', error)
      setIsConnected(false)
    }
  }, [url, handleMessage, sendJoinMessage])

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttempts.current = 0
    connect()
  }, [connect, disconnect])

  const mountGeneration = useRef(0)

  useEffect(() => {
    const generation = ++mountGeneration.current
    connect()

    return () => {
      const closedGeneration = generation
      setTimeout(() => {
        if (mountGeneration.current === closedGeneration) {
          disconnect()
        }
      }, 150)
    }
  }, [connect, disconnect])

  useEffect(() => {
    if (isConnected) {
      sendJoinMessage(wsRef.current)
    }
  }, [getJoinMessage, isConnected, sendJoinMessage])

  return {
    sendMessage,
    disconnect,
    reconnect,
    isConnected,
  }
}

export default useWebSocket
