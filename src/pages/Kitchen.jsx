import { useState, useEffect } from 'react'
import {
  ChefHat,
  Clock,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import {
  useKitchenOrders,
  useUpdateKitchenOrderStatus,
  useKitchenStats,
} from '../hooks/useKitchen'
import { useMenuItems } from '../hooks/useMenu'
import { useTranslation } from '../hooks/useTranslation'
import styles from './Kitchen.module.css'

const ORDER_STATUS_LABEL = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  served: 'Servis',
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Kitchen() {
  const [filter, setFilter] = useState('all')
  const { t } = useTranslation()

  const { data: kitchenOrders, refetch, isRefetching, isLoading, isError, error } = useKitchenOrders()
  const { data: menuItems } = useMenuItems()
  const updateOrderStatus = useUpdateKitchenOrderStatus()
  const kitchenStats = useKitchenStats()
  const [, setTimerTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTimerTick((tick) => tick + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const getMenuItemName = (menuItemId, fallbackName) => {
    if (fallbackName) return fallbackName
    const item = menuItems?.find((m) => m.id === menuItemId)
    return item ? item.name : `Ürün #${menuItemId}`
  }

  const ordersWithTime = (kitchenOrders || [])
    .map((order) => {
      const createdTime = new Date(order.createdAt || Date.now()).getTime()
      const elapsed = Math.floor((Date.now() - createdTime) / 1000)
      return { ...order, elapsedTime: elapsed }
    })
    .filter((order) => {
      if (filter === 'all') return true
      if (filter === 'pending') return order.status === 'pending'
      if (filter === 'preparing') return order.status === 'preparing'
      if (filter === 'ready') return order.status === 'ready' || order.status === 'served'
      return true
    })
    .sort((a, b) => a.elapsedTime - b.elapsedTime)

  const allOrdersCount = kitchenOrders?.length || 0
  const pendingCount = kitchenOrders?.filter((o) => o.status === 'pending').length || 0
  const preparingCount = kitchenOrders?.filter((o) => o.status === 'preparing').length || 0
  const readyCount =
    kitchenOrders?.filter((o) => o.status === 'ready' || o.status === 'served').length || 0

  if (isLoading && !kitchenOrders) {
    return <div className={styles.kitchen}>Yükleniyor...</div>
  }

  if (isError) {
    return (
      <div className={styles.kitchen}>
        <p>Siparişler yüklenemedi.</p>
        <p>{error?.message || 'Bağlantı hatası'}</p>
        <button type="button" onClick={() => refetch()}>Tekrar Dene</button>
      </div>
    )
  }

  return (
    <div className={styles.kitchen}>
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

      <div className={styles.filters}>
        {[
          { key: 'all', label: `Tümü (${allOrdersCount})` },
          { key: 'pending', label: `${t('orders.statuses.pending')} (${pendingCount})` },
          { key: 'preparing', label: `${t('orders.statuses.preparing')} (${preparingCount})` },
          { key: 'ready', label: `${t('orders.statuses.ready')} (${readyCount})` },
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

      {ordersWithTime.length === 0 ? (
        <div className={styles.emptyState}>
          <ChefHat size={64} />
          <h3>Bekleyen sipariş yok</h3>
          <p>Yeni siparişler burada görünecek</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {ordersWithTime.map((order) => {
            const isReady = order.status === 'ready' || order.status === 'served'

            return (
              <div
                key={order.id}
                className={`${styles.orderCard} ${isReady ? styles.ready : ''}`}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderNumber}>
                    <span>Sipariş #{order.id.slice(-6).toUpperCase()}</span>
                    <span className={styles.orderTable}>Masa {order.tableNumber || order.tableId}</span>
                  </div>
                  <div className={styles.timer}>
                    <Clock size={16} />
                    <span>{formatTime(order.elapsedTime)}</span>
                  </div>
                </div>

                <div className={styles.orderStatusRow}>
                  <span className={`${styles.orderStatusBadge} ${styles[order.status] || ''}`}>
                    {ORDER_STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>

                <div className={styles.orderItems}>
                  {(order.items || []).map((item) => (
                    <div key={`${item.menuItemId}-${item.name}`} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemQuantity}>{item.quantity || 1}x</span>
                        <span className={styles.itemName}>
                          {getMenuItemName(item.menuItemId, item.name)}
                        </span>
                      </div>
                      {item.notes && (
                        <div className={styles.itemNotes}>💬 {item.notes}</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className={styles.orderActions}>
                  {order.status === 'pending' && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.primary}`}
                      onClick={() =>
                        updateOrderStatus.mutate({ orderId: order.id, status: 'preparing' })
                      }
                    >
                      <ChefHat size={16} />
                      Hazırlamaya Al
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.success}`}
                      onClick={() =>
                        updateOrderStatus.mutate({ orderId: order.id, status: 'ready' })
                      }
                    >
                      <CheckCircle size={16} />
                      Sipariş Hazır
                    </button>
                  )}
                  {isReady && (
                    <div className={styles.readyBadge}>
                      <CheckCircle size={16} />
                      Servise Hazır
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
