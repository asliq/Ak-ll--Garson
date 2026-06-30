import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChefHat, 
  Utensils,
  CreditCard,
  XCircle,
  RefreshCw,
  User,
  Printer,
  Wallet,
  DollarSign,
  X,
  Banknote,
  Receipt
} from 'lucide-react'
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders'
import { useTables, useUpdateTableStatus } from '../hooks/useTables'
import { useMenuItems } from '../hooks/useMenu'
import { printReceipt } from '../utils/printUtils'
import { useSoundEffects } from '../hooks/useSoundEffects'
import { useTranslation } from '../hooks/useTranslation'
import styles from './Orders.module.css'

const statusConfig = {
  pending:   { label: 'Bekliyor',       icon: AlertCircle,   color: 'warning'  },
  preparing: { label: 'Hazırlanıyor',   icon: ChefHat,       color: 'info'     },
  ready:     { label: 'Hazır',          icon: Utensils,      color: 'success'  },
  served:    { label: 'Servis Edildi',  icon: CheckCircle,   color: 'success'  },
  completed: { label: 'Tamamlandı',     icon: CreditCard,    color: 'success'  },
  cancelled: { label: 'İptal',          icon: XCircle,       color: 'danger'   },
}

const paymentMethods = [
  { id: 'cash',   label: 'Nakit',   icon: Banknote  },
  { id: 'card',   label: 'Kart',    icon: CreditCard },
  { id: 'online', label: 'Online',  icon: DollarSign },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(value)

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentOrder, setPaymentOrder] = useState(null)   // sipariş objesi
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const { data: orders, isLoading, refetch, isRefetching } = useOrders()
  const { data: tables } = useTables()
  const { data: menuItems } = useMenuItems()
  const updateStatus = useUpdateOrderStatus()
  const updateTableStatus = useUpdateTableStatus()
  const { play } = useSoundEffects()
  const { t } = useTranslation()

  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return ['pending', 'preparing', 'ready'].includes(order.status)
    return order.status === statusFilter
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus })
  }

  const handleCancel = (orderId) => {
    if (window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      updateStatus.mutate({ id: orderId, status: 'cancelled' })
    }
  }

  const handlePaymentConfirm = () => {
    if (!paymentOrder) return
    updateStatus.mutate(
      { id: paymentOrder.id, status: 'completed', paymentMethod },
      {
        onSuccess: () => {
          // Masayı serbest bırak
          updateTableStatus.mutate({ id: paymentOrder.tableId, status: 'available' })
          play('payment')
          setPaymentOrder(null)
        }
      }
    )
  }

  const getTableNumber = (tableId) => {
    const table = tables?.find(t => t.id === tableId)
    return table ? table.number : tableId
  }

  const getMenuItemName = (menuItemId) => {
    const item = menuItems?.find(m => m.id === menuItemId)
    return item ? item.name : 'Bilinmeyen Ürün'
  }

  const handlePrint = (order) => {
    const table = tables?.find(t => t.id === order.tableId) || { number: order.tableId }
    const enriched = {
      ...order,
      items: order.items.map(item => {
        const mi = menuItems?.find(m => m.id === item.menuItemId)
        return { ...item, name: mi?.name || 'Ürün', price: item.price || mi?.price || 0 }
      })
    }
    printReceipt(enriched, table, { name: 'Lezzet Durağı' })
  }

  if (isLoading) return <div className={styles.orders}>Yükleniyor...</div>

  return (
    <div className={styles.orders}>
      {/* Header */}
      <div className={styles.ordersHeader}>
        <div>
          <h1>{t('orders.title')}</h1>
          <p>{filteredOrders.length} sipariş</p>
        </div>
        <button className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`} onClick={() => refetch()}>
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {[
          { key: 'all',       label: 'Tümü'       },
          { key: 'active',    label: 'Aktif'      },
          { key: 'pending',   label: 'Bekliyor'   },
          { key: 'preparing', label: 'Hazırlanıyor'},
          { key: 'ready',     label: 'Hazır'      },
          { key: 'completed', label: 'Tamamlandı' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.filterBtn} ${statusFilter === key ? styles.active : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            {label}
          </button>
        ))}
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
            const status = statusConfig[order.status] || statusConfig.pending
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className={styles.printBtn} onClick={() => handlePrint(order)} title="Fiş Yazdır">
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
                        <button className={`${styles.actionBtn} ${styles.primary}`}
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}>
                          Hazırlamaya Başla
                        </button>
                        <button className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleCancel(order.id)}>
                          İptal
                        </button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'ready')}>
                        Hazır
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'served')}>
                        Servis Et
                      </button>
                    )}
                    {order.status === 'served' && (
                      <button
                        className={`${styles.actionBtn} ${styles.payment}`}
                        onClick={() => { setPaymentOrder(order); setPaymentMethod('cash') }}
                      >
                        <Wallet size={16} />
                        Ödeme Al
                      </button>
                    )}
                    {order.status === 'completed' && order.paymentMethod && (
                      <span className={styles.paymentBadge}>
                        {order.paymentMethod === 'cash' ? '💵 Nakit' :
                         order.paymentMethod === 'card' ? '💳 Kart' : '📱 Online'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Ödeme Modalı */}
      <AnimatePresence>
        {paymentOrder && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPaymentOrder(null)}
            />
            <motion.div
              className={styles.paymentModal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.paymentModalHeader}>
                <div className={styles.paymentModalTitle}>
                  <Receipt size={22} />
                  <div>
                    <h2>Ödeme Al</h2>
                    <p>Sipariş #{paymentOrder.id} • Masa {getTableNumber(paymentOrder.tableId)}</p>
                  </div>
                </div>
                <button className={styles.modalCloseBtn} onClick={() => setPaymentOrder(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Sipariş Özeti */}
              <div className={styles.paymentItems}>
                {paymentOrder.items.map((item, i) => (
                  <div key={i} className={styles.paymentItem}>
                    <span className={styles.paymentItemQty}>{item.quantity}x</span>
                    <span className={styles.paymentItemName}>{getMenuItemName(item.menuItemId)}</span>
                    <span className={styles.paymentItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className={styles.paymentTotal}>
                  <span>Toplam</span>
                  <strong>{formatCurrency(paymentOrder.total)}</strong>
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div className={styles.paymentMethodSection}>
                <p className={styles.paymentMethodLabel}>Ödeme Yöntemi</p>
                <div className={styles.paymentMethodGrid}>
                  {paymentMethods.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={`${styles.paymentMethodBtn} ${paymentMethod === id ? styles.selected : ''}`}
                      onClick={() => setPaymentMethod(id)}
                    >
                      <Icon size={24} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Onayla */}
              <button
                className={styles.confirmPaymentBtn}
                onClick={handlePaymentConfirm}
                disabled={updateStatus.isPending}
              >
                <CheckCircle size={20} />
                {updateStatus.isPending ? 'İşleniyor...' : `Ödemeyi Onayla — ${formatCurrency(paymentOrder.total)}`}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
