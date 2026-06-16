import { useState, useEffect } from 'react'
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  X,
  Filter,
  RefreshCw
} from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders'
import { useMenuItems } from '../hooks/useMenu'
import styles from './Kitchen.module.css'

const PRIORITY_TIMES = {
  high: 900, // 15 dakika
  normal: 1200, // 20 dakika
  low: 1800 // 30 dakika
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Kitchen() {
  const [filter, setFilter] = useState('all')
  const [sound, setSound] = useState(true)
  const { data: orders, refetch, isRefetching } = useOrders()
  const { data: menuItems } = useMenuItems()
  const updateStatus = useUpdateOrderStatus()

  // Mutfaktaki siparişler
  const kitchenOrders = orders?.filter(o => 
    ['pending', 'preparing', 'ready'].includes(o.status)
  ) || []

  // Filtreleme
  const filteredOrders = kitchenOrders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  // Sipariş sürelerini hesapla
  const ordersWithTime = filteredOrders.map(order => {
    const createdTime = new Date(order.createdAt).getTime()
    const elapsed = Math.floor((Date.now() - createdTime) / 1000)
    
    let priority = 'normal'
    if (elapsed > PRIORITY_TIMES.high) priority = 'high'
    else if (elapsed < PRIORITY_TIMES.low) priority = 'low'

    return {
      ...order,
      elapsedTime: elapsed,
      priority
    }
  }).sort((a, b) => {
    // Önceliğe göre sırala
    const priorityOrder = { high: 0, normal: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return a.elapsedTime - b.elapsedTime
  })

  // Yeni sipariş sesi
  useEffect(() => {
    if (sound && kitchenOrders.length > 0) {
      // Gerçek projede ses çalacak
      // new Audio('/sounds/new-order.mp3').play()
    }
  }, [kitchenOrders.length, sound])

  // Otomatik yenileme
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000) // 5 saniyede bir yenile

    return () => clearInterval(interval)
  }, [refetch])

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus })
  }

  const getMenuItemName = (menuItemId) => {
    const item = menuItems?.find(m => m.id === menuItemId)
    return item ? item.name : `Ürün #${menuItemId}`
  }

  return (
    <div className={styles.kitchen}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ChefHat size={32} />
          <div>
            <h1>Mutfak Ekranı</h1>
            <p>{kitchenOrders.length} aktif sipariş</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={`${styles.soundBtn} ${sound ? styles.active : ''}`}
            onClick={() => setSound(!sound)}
          >
            {sound ? '🔔' : '🔕'}
          </button>
          <button 
            className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`}
            onClick={() => refetch()}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü ({kitchenOrders.length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          Bekliyor ({kitchenOrders.filter(o => o.status === 'pending').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'preparing' ? styles.active : ''}`}
          onClick={() => setFilter('preparing')}
        >
          Hazırlanıyor ({kitchenOrders.filter(o => o.status === 'preparing').length})
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'ready' ? styles.active : ''}`}
          onClick={() => setFilter('ready')}
        >
          Hazır ({kitchenOrders.filter(o => o.status === 'ready').length})
        </button>
      </div>

      {/* Orders Grid */}
      {ordersWithTime.length === 0 ? (
        <div className={styles.emptyState}>
          <ChefHat size={64} />
          <h3>Bekleyen sipariş yok</h3>
          <p>Yeni siparişler burada görünecek</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {ordersWithTime.map(order => (
            <div 
              key={order.id} 
              className={`${styles.orderCard} ${styles[order.priority]} ${styles[order.status]}`}
            >
              {/* Priority Badge */}
              {order.priority === 'high' && (
                <div className={styles.priorityBadge}>
                  <AlertTriangle size={16} />
                  ACİL
                </div>
              )}

              {/* Header */}
              <div className={styles.orderHeader}>
                <div className={styles.orderNumber}>
                  <span>Sipariş #{order.id}</span>
                  <span className={styles.orderTable}>Masa {order.tableId}</span>
                </div>
                <div className={`${styles.timer} ${order.priority === 'high' ? styles.urgent : ''}`}>
                  <Clock size={18} />
                  <span>{formatTime(order.elapsedTime)}</span>
                </div>
              </div>

              {/* Items */}
              <div className={styles.orderItems}>
                {order.items.map((item, index) => (
                  <div key={index} className={styles.orderItem}>
                    <span className={styles.itemQuantity}>{item.quantity}x</span>
                    <span className={styles.itemName}>{getMenuItemName(item.menuItemId)}</span>
                    {item.notes && (
                      <div className={styles.itemNotes}>
                        💬 {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className={styles.orderActions}>
                {order.status === 'pending' && (
                  <button
                    className={`${styles.actionBtn} ${styles.primary}`}
                    onClick={() => handleStatusChange(order.id, 'preparing')}
                  >
                    <ChefHat size={18} />
                    Hazırlamaya Başla
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    className={`${styles.actionBtn} ${styles.success}`}
                    onClick={() => handleStatusChange(order.id, 'ready')}
                  >
                    <CheckCircle size={18} />
                    Hazır
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    className={`${styles.actionBtn} ${styles.success}`}
                    onClick={() => handleStatusChange(order.id, 'served')}
                  >
                    <CheckCircle size={18} />
                    Servis Edildi
                  </button>
                )}
                {order.status === 'pending' && (
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => handleStatusChange(order.id, 'cancelled')}
                  >
                    <X size={18} />
                    İptal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
