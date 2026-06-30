import { useState } from 'react'
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  X,
  RefreshCw,
  Zap
} from 'lucide-react'
import {
  useKitchenOrders,
  useUpdateKitchenItemStatus,
  useMarkOrderReady,
  useSetOrderPriority,
  useKitchenStats
} from '../hooks/useKitchen'
import { useMenuItems } from '../hooks/useMenu'
import { useTranslation } from '../hooks/useTranslation'
import styles from './Kitchen.module.css'

const PRIORITY_TIMES = {
  high: 900,   // 15 dk
  normal: 1200, // 20 dk
  low: 1800    // 30 dk
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const itemStatusLabel = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  served: 'Servis Edildi',
}

export default function Kitchen() {
  const [filter, setFilter] = useState('all')
  const { t } = useTranslation()

  const { data: kitchenOrders, refetch, isRefetching } = useKitchenOrders()
  const { data: menuItems } = useMenuItems()
  const updateItemStatus = useUpdateKitchenItemStatus()
  const markOrderReady = useMarkOrderReady()
  const setPriority = useSetOrderPriority()
  const kitchenStats = useKitchenStats()

  const getMenuItemName = (menuItemId) => {
    const item = menuItems?.find(m => m.id === menuItemId)
    return item ? item.name : `Ürün #${menuItemId}`
  }

  // Elapsed time + auto-priority hesapla
  const ordersWithTime = (kitchenOrders || [])
    .map(order => {
      const createdTime = new Date(order.createdAt || Date.now()).getTime()
      const elapsed = Math.floor((Date.now() - createdTime) / 1000)
      const autoPriority = elapsed > PRIORITY_TIMES.high
        ? 'high'
        : elapsed < PRIORITY_TIMES.low
        ? 'low'
        : 'normal'
      return { ...order, elapsedTime: elapsed, autoPriority }
    })
    .filter(order => {
      if (filter === 'all') return true
      if (filter === 'pending') return order.items.some(i => i.status === 'pending')
      if (filter === 'preparing') return order.items.some(i => i.status === 'preparing')
      if (filter === 'ready') return order.items.every(i => i.status === 'ready' || i.status === 'served')
      return true
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, urgent: 0, normal: 1, low: 2 }
      const pa = priorityOrder[a.priority] ?? priorityOrder[a.autoPriority]
      const pb = priorityOrder[b.priority] ?? priorityOrder[b.autoPriority]
      if (pa !== pb) return pa - pb
      return a.elapsedTime - b.elapsedTime
    })

  const allOrdersCount = kitchenOrders?.length || 0
  const pendingCount = kitchenOrders?.filter(o => o.items.some(i => i.status === 'pending')).length || 0
  const preparingCount = kitchenOrders?.filter(o => o.items.some(i => i.status === 'preparing')).length || 0
  const readyCount = kitchenOrders?.filter(o => o.items.every(i => i.status === 'ready' || i.status === 'served')).length || 0

  return (
    <div className={styles.kitchen}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ChefHat size={32} />
          <div>
            <h1>{t('kitchen.title')}</h1>
            <p>{allOrdersCount} aktif sipariş</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {kitchenStats && (
            <div className={styles.statsRow}>
              <span className={styles.statBadge} data-status="pending">{kitchenStats.pendingItems} bekliyor</span>
              <span className={styles.statBadge} data-status="preparing">{kitchenStats.preparingItems} hazırlanıyor</span>
              <span className={styles.statBadge} data-status="ready">{kitchenStats.readyItems} hazır</span>
            </div>
          )}
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
        {[
          { key: 'all',       label: `Tümü (${allOrdersCount})` },
          { key: 'pending',   label: `${t('orders.statuses.pending')} (${pendingCount})` },
          { key: 'preparing', label: `${t('orders.statuses.preparing')} (${preparingCount})` },
          { key: 'ready',     label: `${t('orders.statuses.ready')} (${readyCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.filterBtn} ${filter === key ? styles.active : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
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
          {ordersWithTime.map(order => {
            const isUrgent = order.priority === 'urgent' || order.priority === 'high' || order.autoPriority === 'high'
            const allReady = order.items.every(i => i.status === 'ready' || i.status === 'served')

            return (
              <div
                key={order.id}
                className={`${styles.orderCard} ${isUrgent ? styles.high : ''} ${allReady ? styles.ready : ''}`}
              >
                {/* Priority Badge */}
                {isUrgent && (
                  <div className={styles.priorityBadge}>
                    <AlertTriangle size={14} />
                    ACİL
                  </div>
                )}

                {/* Header */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderNumber}>
                    <span>Sipariş #{order.id}</span>
                    <span className={styles.orderTable}>Masa {order.tableNumber || order.tableId}</span>
                  </div>
                  <div className={`${styles.timer} ${isUrgent ? styles.urgent : ''}`}>
                    <Clock size={16} />
                    <span>{formatTime(order.elapsedTime)}</span>
                  </div>
                </div>

                {/* Items — item bazlı durum */}
                <div className={styles.orderItems}>
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className={`${styles.orderItem} ${styles[item.status]}`}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemQuantity}>{item.quantity || 1}x</span>
                        <span className={styles.itemName}>{getMenuItemName(item.menuItemId)}</span>
                      </div>
                      {item.notes && (
                        <div className={styles.itemNotes}>💬 {item.notes}</div>
                      )}
                      {/* Item durum butonları */}
                      <div className={styles.itemActions}>
                        {item.status === 'pending' && (
                          <button
                            className={`${styles.itemBtn} ${styles.start}`}
                            onClick={() => updateItemStatus.mutate({ orderId: order.id, menuItemId: item.menuItemId, status: 'preparing' })}
                          >
                            <ChefHat size={12} />
                            Başla
                          </button>
                        )}
                        {item.status === 'preparing' && (
                          <button
                            className={`${styles.itemBtn} ${styles.done}`}
                            onClick={() => updateItemStatus.mutate({ orderId: order.id, menuItemId: item.menuItemId, status: 'ready' })}
                          >
                            <CheckCircle size={12} />
                            Hazır
                          </button>
                        )}
                        {item.status === 'ready' && (
                          <span className={styles.itemDone}>✓ Hazır</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className={styles.orderActions}>
                  {!allReady && (
                    <button
                      className={`${styles.actionBtn} ${styles.success}`}
                      onClick={() => markOrderReady.mutate(order.id)}
                    >
                      <Zap size={16} />
                      Tümü Hazır
                    </button>
                  )}
                  {allReady && (
                    <div className={styles.readyBadge}>
                      <CheckCircle size={16} />
                      Sipariş Hazır
                    </div>
                  )}
                  <button
                    className={`${styles.priorityToggle} ${(order.priority === 'high' || order.priority === 'urgent') ? styles.highActive : ''}`}
                    onClick={() => setPriority.mutate({
                      orderId: order.id,
                      priority: (order.priority === 'high' || order.priority === 'urgent') ? 'normal' : 'high'
                    })}
                    title="Önceliği değiştir"
                  >
                    <AlertTriangle size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
