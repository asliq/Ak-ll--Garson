import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Utensils,
  CreditCard,
  AlertCircle,
  XCircle,
  Bell,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import styles from './CustomerOrders.module.css'

const statusConfig = {
  pending: {
    label: 'Sipariş Alındı',
    icon: Clock,
    color: 'warning',
    description: 'Siparişiniz mutfağa iletildi'
  },
  preparing: {
    label: 'Hazırlanıyor',
    icon: ChefHat,
    color: 'info',
    description: 'Siparişiniz hazırlanıyor'
  },
  ready: {
    label: 'Hazır',
    icon: Utensils,
    color: 'success',
    description: 'Siparişiniz hazır, getiriliyor'
  },
  served: {
    label: 'Servis Edildi',
    icon: CheckCircle,
    color: 'success',
    description: 'Afiyet olsun!'
  },
  completed: {
    label: 'Tamamlandı',
    icon: CheckCircle,
    color: 'success',
    description: 'Teşekkürler!'
  },
  cancelled: {
    label: 'İptal Edildi',
    icon: XCircle,
    color: 'danger',
    description: 'Sipariş iptal edildi'
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

const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dk önce`
  const hours = Math.floor(diffMins / 60)
  return `${hours} saat önce`
}

export default function CustomerOrders() {
  const navigate = useNavigate()
  const [customerTable, setCustomerTable] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { data: allOrders, isLoading, refetch, isRefetching } = useOrders()

  useEffect(() => {
    const tableData = localStorage.getItem('customerTable')
    if (!tableData) {
      navigate('/customer')
      return
    }
    setCustomerTable(JSON.parse(tableData))
  }, [navigate])

  // Sadece bu masanın siparişlerini filtrele
  const orders = allOrders?.filter(order => 
    order.tableId === customerTable?.tableId
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

  const activeOrders = orders.filter(o => 
    ['pending', 'preparing', 'ready', 'served'].includes(o.status)
  )

  const handleCallWaiter = () => {
    alert('Garson çağrıldı! En kısa sürede size yardımcı olacaktır.')
  }

  if (isLoading) {
    return <div className={styles.loading}>Yükleniyor...</div>
  }

  return (
    <div className={styles.customerOrders}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/customer/menu')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1>Siparişlerim</h1>
          <p>Masa {customerTable?.tableNumber}</p>
        </div>
        <button 
          className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`}
          onClick={() => refetch()}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Active Orders Summary */}
      {activeOrders.length > 0 && (
        <div className={styles.activeOrdersSection}>
          <div className={styles.sectionTitle}>
            <h2>Aktif Siparişler</h2>
            <span className={styles.badge}>{activeOrders.length}</span>
          </div>

          {activeOrders.map(order => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <div 
                key={order.id} 
                className={styles.orderCard}
                onClick={() => setSelectedOrder(order)}
              >
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>Sipariş #{order.id}</div>
                    <div className={styles.orderTime}>
                      <Clock size={14} />
                      {formatTime(order.createdAt)} • {getTimeAgo(order.createdAt)}
                    </div>
                  </div>
                  <div className={`${styles.orderStatus} ${styles[status.color]}`}>
                    <StatusIcon size={18} />
                    <span>{status.label}</span>
                  </div>
                </div>

                <div className={styles.statusTimeline}>
                  <div className={`${styles.timelineStep} ${['pending', 'preparing', 'ready', 'served', 'completed'].includes(order.status) ? styles.active : ''}`}>
                    <Clock size={14} />
                    <span>Alındı</span>
                  </div>
                  <div className={`${styles.timelineStep} ${['preparing', 'ready', 'served', 'completed'].includes(order.status) ? styles.active : ''}`}>
                    <ChefHat size={14} />
                    <span>Hazırlanıyor</span>
                  </div>
                  <div className={`${styles.timelineStep} ${['ready', 'served', 'completed'].includes(order.status) ? styles.active : ''}`}>
                    <Utensils size={14} />
                    <span>Hazır</span>
                  </div>
                  <div className={`${styles.timelineStep} ${['served', 'completed'].includes(order.status) ? styles.active : ''}`}>
                    <CheckCircle size={14} />
                    <span>Servis</span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <span className={styles.itemQuantity}>{item.quantity}x</span>
                      <span className={styles.itemName}>Ürün #{item.menuItemId}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className={styles.moreItems}>
                      +{order.items.length - 3} ürün daha
                    </div>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    <span>Toplam:</span>
                    <strong>{formatCurrency(order.total)}</strong>
                  </div>
                  {order.paymentMethod && (
                    <div className={styles.paymentInfo}>
                      <CreditCard size={14} />
                      <span>
                        {order.paymentMethod === 'cash' ? 'Nakit' :
                         order.paymentMethod === 'card' ? 'Kart' : 'Online'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* All Orders */}
      <div className={styles.allOrdersSection}>
        <div className={styles.sectionTitle}>
          <h2>Tüm Siparişler</h2>
          <span className={styles.count}>{orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} />
            <h3>Henüz sipariş yok</h3>
            <p>Menüden sipariş vererek başlayın</p>
            <button 
              className={styles.menuBtn}
              onClick={() => navigate('/customer/menu')}
            >
              Menüyü Görüntüle
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon

              return (
                <div 
                  key={order.id} 
                  className={styles.orderListItem}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className={`${styles.statusIcon} ${styles[status.color]}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div className={styles.orderContent}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderNum}>Sipariş #{order.id}</span>
                      <span className={styles.orderDate}>{formatTime(order.createdAt)}</span>
                    </div>
                    <div className={styles.orderStatus}>{status.label}</div>
                    <div className={styles.orderItemCount}>{order.items.length} ürün</div>
                  </div>
                  <div className={styles.orderPrice}>
                    {formatCurrency(order.total)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <button className={styles.callWaiterBtn} onClick={handleCallWaiter}>
        <Bell size={20} />
        <span>Garson Çağır</span>
      </button>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <>
          <div className={styles.overlay} onClick={() => setSelectedOrder(null)} />
          <div className={styles.detailModal}>
            <div className={styles.modalHeader}>
              <h2>Sipariş Detayı</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailStatus}>
                {(() => {
                  const status = statusConfig[selectedOrder.status]
                  const StatusIcon = status.icon
                  return (
                    <>
                      <div className={`${styles.statusIconLarge} ${styles[status.color]}`}>
                        <StatusIcon size={32} />
                      </div>
                      <h3>{status.label}</h3>
                      <p>{status.description}</p>
                    </>
                  )
                })()}
              </div>

              <div className={styles.detailInfo}>
                <div className={styles.infoRow}>
                  <span>Sipariş No:</span>
                  <strong>#{selectedOrder.id}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Masa:</span>
                  <strong>{customerTable?.tableNumber}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Saat:</span>
                  <strong>{formatTime(selectedOrder.createdAt)}</strong>
                </div>
              </div>

              <div className={styles.detailItems}>
                <h4>Siparişiniz</h4>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className={styles.detailItem}>
                    <span className={styles.detailQuantity}>{item.quantity}x</span>
                    <span className={styles.detailName}>Ürün #{item.menuItemId}</span>
                    <span className={styles.detailPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className={styles.detailNotes}>
                  <MessageSquare size={16} />
                  <div>
                    <strong>Not:</strong>
                    <p>{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              <div className={styles.detailTotal}>
                <div className={styles.totalRow}>
                  <span>Ara Toplam:</span>
                  <span>{formatCurrency(selectedOrder.total * 0.9)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Servis Ücreti:</span>
                  <span>{formatCurrency(selectedOrder.total * 0.1)}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalMain}`}>
                  <span>Toplam:</span>
                  <strong>{formatCurrency(selectedOrder.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
