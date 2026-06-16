import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  X, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  AlertCircle,
  Utensils,
  Users,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useOrders } from '../hooks/useOrders'
import { useTables } from '../hooks/useTables'
import { useAppStore } from '../store/useAppStore'
import styles from './NotificationProvider.module.css'

const NotificationContext = createContext(null)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// Bildirim tipleri
const notificationTypes = {
  new_order: {
    icon: Utensils,
    color: 'primary',
    title: 'Yeni Sipariş',
    sound: 'order'
  },
  order_ready: {
    icon: CheckCircle,
    color: 'success',
    title: 'Sipariş Hazır',
    sound: 'ready'
  },
  order_preparing: {
    icon: ChefHat,
    color: 'info',
    title: 'Hazırlanıyor',
    sound: 'notification'
  },
  call_waiter: {
    icon: Bell,
    color: 'warning',
    title: 'Garson Çağrısı',
    sound: 'alert'
  },
  table_occupied: {
    icon: Users,
    color: 'info',
    title: 'Masa Doldu',
    sound: 'notification'
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  const soundEnabled = useAppStore((state) => state.soundEnabled)
  const previousOrdersRef = useRef(null)
  
  const { data: orders } = useOrders()
  const { data: tables } = useTables()

  // Ses çal
  const playSound = useCallback((type) => {
    if (!soundEnabled) return
    
    // Web Audio API ile basit bip sesi
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Ses tipine göre frekans
      const frequencies = {
        order: [523, 659, 784], // C5, E5, G5 - pozitif ses
        ready: [784, 659], // G5, E5
        notification: [440], // A4
        alert: [880, 440, 880] // A5, A4, A5 - dikkat çekici
      }
      
      const freqs = frequencies[type] || [440]
      let time = audioContext.currentTime
      
      freqs.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, time + i * 0.15)
      })
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio not supported')
    }
  }, [soundEnabled])

  // Bildirim ekle
  const addNotification = useCallback((type, message, data = {}) => {
    const id = Date.now() + Math.random()
    const config = notificationTypes[type] || notificationTypes.new_order
    
    const notification = {
      id,
      type,
      message,
      data,
      timestamp: new Date(),
      read: false,
      ...config
    }
    
    setNotifications(prev => [notification, ...prev].slice(0, 50))
    setUnreadCount(prev => prev + 1)
    
    // Ses çal
    playSound(config.sound)
    
    // 5 saniye sonra otomatik kapat (toast için)
    setTimeout(() => {
      dismissNotification(id)
    }, 5000)
    
    return id
  }, [playSound])

  // Bildirimi kapat
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Tümünü okundu işaretle
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Tümünü temizle
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Siparişleri izle
  useEffect(() => {
    if (!orders) return
    
    // İlk yüklemede ref'i ayarla
    if (previousOrdersRef.current === null) {
      previousOrdersRef.current = orders
      return
    }
    
    const previousOrders = previousOrdersRef.current
    
    // Yeni siparişleri bul
    orders.forEach(order => {
      const prevOrder = previousOrders.find(o => o.id === order.id)
      
      if (!prevOrder) {
        // Yeni sipariş
        const table = tables?.find(t => t.id === order.tableId)
        addNotification(
          'new_order',
          `Masa ${table?.number || '?'} - ${order.items?.length || 0} ürün`,
          { orderId: order.id, tableId: order.tableId }
        )
      } else if (prevOrder.status !== order.status) {
        // Durum değişikliği
        const table = tables?.find(t => t.id === order.tableId)
        
        if (order.status === 'ready') {
          addNotification(
            'order_ready',
            `Masa ${table?.number || '?'} siparişi hazır!`,
            { orderId: order.id, tableId: order.tableId }
          )
        } else if (order.status === 'preparing') {
          addNotification(
            'order_preparing',
            `Masa ${table?.number || '?'} siparişi hazırlanıyor`,
            { orderId: order.id, tableId: order.tableId }
          )
        }
      }
    })
    
    previousOrdersRef.current = orders
  }, [orders, tables, addNotification])

  const value = {
    notifications,
    unreadCount,
    showPanel,
    setShowPanel,
    addNotification,
    dismissNotification,
    markAllAsRead,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Notifications */}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {notifications.filter(n => !n.read).slice(0, 3).map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`${styles.toast} ${styles[notification.color]}`}
            >
              <div className={styles.toastIcon}>
                <notification.icon size={20} />
              </div>
              <div className={styles.toastContent}>
                <span className={styles.toastTitle}>{notification.title}</span>
                <span className={styles.toastMessage}>{notification.message}</span>
              </div>
              <button 
                className={styles.toastClose}
                onClick={() => dismissNotification(notification.id)}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

// Bildirim Paneli Bileşeni
export function NotificationPanel() {
  const { 
    notifications, 
    showPanel, 
    setShowPanel, 
    markAllAsRead, 
    clearAll,
    dismissNotification 
  } = useNotifications()
  
  const soundEnabled = useAppStore((state) => state.soundEnabled)
  const toggleSound = useAppStore((state) => state.toggleSound)

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const mins = Math.floor(diff / 60000)
    
    if (mins < 1) return 'Az önce'
    if (mins < 60) return `${mins} dk önce`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} saat önce`
    return new Date(date).toLocaleDateString('tr-TR')
  }

  return (
    <AnimatePresence>
      {showPanel && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPanel(false)}
          />
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
          >
            <div className={styles.panelHeader}>
              <h3>Bildirimler</h3>
              <div className={styles.panelActions}>
                <button 
                  className={styles.soundBtn}
                  onClick={toggleSound}
                  title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllAsRead}>Okundu</button>
                    <button onClick={clearAll}>Temizle</button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.panelContent}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <Bell size={48} />
                  <p>Bildirim yok</p>
                  <span>Yeni siparişler burada görünecek</span>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${styles.notificationItem} ${notification.read ? styles.read : ''}`}
                    >
                      <div className={`${styles.notificationIcon} ${styles[notification.color]}`}>
                        <Icon size={18} />
                      </div>
                      <div className={styles.notificationContent}>
                        <span className={styles.notificationTitle}>{notification.title}</span>
                        <span className={styles.notificationMessage}>{notification.message}</span>
                        <span className={styles.notificationTime}>
                          <Clock size={12} />
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <button 
                        className={styles.notificationClose}
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

