import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocketContext } from './WebSocketProvider';
import styles from './WebSocketStatus.module.css';

/**
 * WebSocket Durum Göstergesi
 * 
 * Canlı bağlantı durumunu gösterir
 */

export const WebSocketStatus = () => {
  const { isConnected, reconnect } = useWebSocketContext();

  return (
    <div 
      className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}
      title={isConnected ? 'Canlı güncellemeler aktif' : 'Bağlantı kesildi'}
    >
      {isConnected ? (
        <>
          <Wifi size={14} />
          <span className={styles.label}>Canlı</span>
          <span className={styles.dot} />
        </>
      ) : (
        <>
          <WifiOff size={14} />
          <span className={styles.label}>Offline</span>
          <button 
            onClick={reconnect}
            className={styles.reconnectBtn}
            title="Yeniden bağlan"
          >
            Yeniden Bağlan
          </button>
        </>
      )}
    </div>
  );
};

export default WebSocketStatus;

