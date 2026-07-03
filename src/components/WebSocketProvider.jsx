import { createContext, useContext, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useWebSocket } from '../hooks/useWebSocket'

const WebSocketContext = createContext(null)

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider')
  }
  return context
}

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws'

function buildJoinMessage(pathname) {
  if (pathname.startsWith('/customer')) {
    try {
      const tableData = localStorage.getItem('customerTable')
      if (!tableData) return null

      const parsed = JSON.parse(tableData)
      if (!parsed.tableToken) return null

      return {
        event: 'join',
        data: {
          role: 'customer',
          tableToken: parsed.tableToken,
        },
      }
    } catch {
      return null
    }
  }

  const restaurantId =
    localStorage.getItem('restaurantId') || import.meta.env.VITE_RESTAURANT_ID

  if (!restaurantId) return null

  return {
    event: 'join',
    data: {
      role: 'staff',
      restaurantId,
    },
  }
}

export const WebSocketProvider = ({ children }) => {
  const { pathname } = useLocation()

  const getJoinMessage = useCallback(() => buildJoinMessage(pathname), [pathname])

  const ws = useWebSocket(WS_URL, { getJoinMessage })

  const value = useMemo(() => ws, [ws])

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketProvider
