import { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChefHat, 
  Utensils,
  CreditCard,
  XCircle,
  RefreshCw,
  Filter,
  User,
  Printer
} from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders'
import { useTables } from '../hooks/useTables'
import { useMenuItems } from '../hooks/useMenu'
import { printReceipt, printKitchenTicket, printOrderList } from '../utils/printUtils'
import styles from './Orders.module.css'

const statusConfig = {
  pending: { 
    label: 'Bekliyor', 
    icon: AlertCircle, 
    color: 'warning'
  },
  preparing: { 
    label: 'Hazırlanıyor', 
    icon: ChefHat, 
    color: 'info'
  },
  ready: { 
    label: 'Hazır', 
    icon: Utensils, 
    color: 'success'
  },
  served: { 
    label: 'Servis Edildi', 
    icon: CheckCircle, 
    color: 'success'
  },
  completed: { 
    label: 'Tamamlandı', 
    icon: CreditCard, 
    color: 'success'
  },
  cancelled: { 
    label: 'İptal', 
    icon: XCircle, 
    color: 'danger'
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(value)
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: orders, isLoading, refetch, isRefetching } = useOrders()
  const { data: tables } = useTables()
  const { data: menuItems } = useMenuItems()
  const updateStatus = useUpdateOrderStatus()

  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status)
    }
    return order.status === statusFilter
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus })
  }

  const handleCancel = (orderId) => {
    if (confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      updateStatus.mutate({ id: orderId, status: 'cancelled' })
    }
  }

  const getTableNumber = (tableId) => {
    const table = tables?.find(t => t.id === tableId)
    return table ? table.number : tableId
  }

  const getMenuItemName = (menuItemId) => {
    const item = menuItems?.find(m => m.id === menuItemId)
    return item ? item.name : 'Bilinmeyen Ürün'
  }

  if (isLoading) {
    return <div className={styles.orders}>Yükleniyor...</div>
  }

  return (
    <div className={styles.orders}>
      {/* Header */}
      <div className={styles.ordersHeader}>
        <div>
          <h1>Siparişler</h1>
          <p>{filteredOrders.length} sipariş bulundu</p>
        </div>
        <button 
          className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`}
          onClick={() => refetch()}
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          Tümü
        </button>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.active : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          Aktif
        </button>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Bekliyor
        </button>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'preparing' ? styles.active : ''}`}
          onClick={() => setStatusFilter('preparing')}
        >
          Hazırlanıyor
        </button>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'ready' ? styles.active : ''}`}
          onClick={() => setStatusFilter('ready')}
        >
          Hazır
        </button>
        <button
          className={`${styles.filterBtn} ${statusFilter === 'completed' ? styles.active : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          Tamamlandı
        </button>
      </div>

      {/* Orders List */}
      <div className={styles.ordersList}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h3>Sipariş bulunamadı</h3>
            <p>Seçili filtreye uygun sipariş yok</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>Sipariş #{order.id}</div>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderTable}>Masa {getTableNumber(order.tableId)}</span>
                      <span className={styles.orderSep}>•</span>
                      <span className={styles.orderTime}>
                        <Clock size={14} />
                        {formatTime(order.createdAt)}
                      </span>
                      {order.waiter && (
                        <>
                          <span className={styles.orderSep}>•</span>
                          <span className={styles.orderWaiter}>
                            <User size={14} />
                            {order.waiter}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      className={styles.printBtn}
                      onClick={() => {
                        const table = tables?.find(t => t.id === order.tableId) || { number: order.tableId }
                        const enrichedOrder = {
                          ...order,
                          items: order.items.map(item => {
                            const menuItem = menuItems?.find(m => m.id === item.menuItemId)
                            return {
                              ...item,
                              name: menuItem?.name || 'Ürün',
                              price: menuItem?.price || 0
                            }
                          })
                        }
                        printReceipt(enrichedOrder, table, { name: 'Lezzet Durağı' })
                      }}
                      title="Fiş Yazdır"
                    >
                      <Printer size={16} />
                    </button>
                    <div className={`${styles.orderStatus} ${styles[status.color]}`}>
                      <StatusIcon size={16} />
                      <span>{status.label}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <span className={styles.itemQuantity}>{item.quantity}x</span>
                      <span className={styles.itemName}>{getMenuItemName(item.menuItemId)}</span>
                      <span className={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    <span>Toplam:</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                  <div className={styles.orderActions}>
                    {order.status === 'pending' && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.primary}`}
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}
                        >
                          Hazırlamaya Başla
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleCancel(order.id)}
                        >
                          İptal
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Hazır
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'served')}
                      >
                        Servis Et
                      </button>
                    )}
                    {order.status === 'served' && (
                      <button
                        className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                      >
                        Tamamla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
