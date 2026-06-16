import { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * WebSocket Context Provider
 * 
 * Bu component, WebSocket bağlantısını tüm uygulama için sağlar.
 */

const WebSocketContext = createContext(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  // WebSocket bağlantısını başlat
  // Gerçek bir WebSocket sunucusu URL'si buraya gelebilir
  // const wsUrl = 'ws://localhost:3001'; // Örnek
  const ws = useWebSocket(null); // null = simülasyon modu

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;

