import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, CheckCircle, AlertCircle, ChefHat, Utensils, CreditCard,
  XCircle, RefreshCw, User, Printer, Wallet, DollarSign, X,
  Banknote, Receipt, Percent, Split, ArrowRightLeft
} from 'lucide-react'
import { useOrders, useUpdateOrderStatus, useTransferOrder, useMergeOrders } from '../hooks/useOrders'
import { useTables, useUpdateTableStatus } from '../hooks/useTables'
import { useMenuItems } from '../hooks/useMenu'
import { useCreatePayment, useCreateSplitPayment } from '../hooks/usePayments'
import { API_ENABLED } from '../api/services'
import { printReceipt } from '../utils/printUtils'
import { useSoundEffects } from '../hooks/useSoundEffects'
import { useTranslation } from '../hooks/useTranslation'
import { TableOperations } from '../components/TableOperations'
import toast from 'react-hot-toast'
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
  { id: 'cash',   label: 'Nakit',   icon: Banknote,   apiMethod: 'cash' },
  { id: 'card',   label: 'Kart',    icon: CreditCard, apiMethod: 'credit_card' },
  { id: 'online', label: 'Online',  icon: DollarSign, apiMethod: 'mobile' },
]

const formatCurrency = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(v)

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentOrder, setPaymentOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [tipAmount, setTipAmount] = useState(0)
  const [splitMode, setSplitMode] = useState(false)
  const [splitCount, setSplitCount] = useState(2)
  const [tableOps, setTableOps] = useState(null) // { table, order }

  const { data: orders, isLoading, isError, error, refetch, isRefetching } = useOrders()
  const { data: tables } = useTables()
  const { data: menuItems } = useMenuItems()
  const updateStatus = useUpdateOrderStatus()
  const updateTableStatus = useUpdateTableStatus()
  const createPayment = useCreatePayment()
  const createSplitPayment = useCreateSplitPayment()
  const transferOrder = useTransferOrder()
  const mergeOrders = useMergeOrders()
  const { play } = useSoundEffects()
  const { t } = useTranslation()

  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'active') return ['pending', 'preparing', 'ready', 'served'].includes(order.status)
    return order.status === statusFilter
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

  const finalTotal = useMemo(() => {
    if (!paymentOrder) return 0
    const discount = paymentOrder.total * (discountPercent / 100)
    return Math.max(0, paymentOrder.total - discount + tipAmount)
  }, [paymentOrder, discountPercent, tipAmount])

  const resetPaymentModal = () => {
    setPaymentOrder(null)
    setPaymentMethod('cash')
    setDiscountPercent(0)
    setTipAmount(0)
    setSplitMode(false)
    setSplitCount(2)
  }

  const openPayment = (order) => {
    setPaymentOrder(order)
    setPaymentMethod('cash')
    setDiscountPercent(0)
    setTipAmount(0)
    setSplitMode(false)
    setSplitCount(2)
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus })
  }

  const handleCancel = (orderId) => {
    if (window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      updateStatus.mutate({ id: orderId, status: 'cancelled' })
    }
  }

  const completeOrderAfterPayment = () => {
    updateStatus.mutate(
      { id: paymentOrder.id, status: 'completed' },
      {
        onSuccess: () => {
          play('payment')
          resetPaymentModal()
          toast.success('Sipariş tamamlandı')
        },
      },
    )
  }

  const handlePaymentConfirm = () => {
    if (!paymentOrder) return

  if (!API_ENABLED.payments) {
        completeOrderAfterPayment()
        return
      }

    const apiMethod = paymentMethods.find(m => m.id === paymentMethod)?.apiMethod || 'cash'

    if (splitMode && splitCount > 1) {
      const perPerson = finalTotal / splitCount
      createSplitPayment.mutate(
        {
          orderId: paymentOrder.id,
          tableId: paymentOrder.tableId,
          splits: Array.from({ length: splitCount }, () => ({
            amount: perPerson,
            method: apiMethod,
          })),
        },
        {
          onSuccess: () => {
            completeOrderAfterPayment()
          },
        },
      )
      return
    }

    createPayment.mutate(
      {
        orderId: paymentOrder.id,
        tableId: paymentOrder.tableId,
        amount: finalTotal - tipAmount,
        tip: tipAmount,
        method: apiMethod,
        status: 'completed',
        discount: discountPercent,
      },
      {
        onSuccess: () => {
          completeOrderAfterPayment()
        },
      },
    )
  }

  const getTableNumber = (tableId) => {
    const table = tables?.find(t => t.id == tableId)
    if (table) return table.number
    if (!tableId) return '?'
    return String(tableId).slice(-4)
  }

  const getMenuItemName = (menuItemId) => {
    const item = menuItems?.find(m => m.id == menuItemId)
    return item ? item.name : 'Bilinmeyen Ürün'
  }

  const handlePrint = (order) => {
    const table = tables?.find(t => t.id == order.tableId) || { number: order.tableId }
    const enriched = {
      ...order,
      items: (order.items || []).map(item => {
        const mi = menuItems?.find(m => m.id == item.menuItemId)
        return { ...item, name: mi?.name || 'Ürün', price: item.price || mi?.price || 0 }
      }),
    }
    printReceipt(enriched, table, { name: 'Lezzet Durağı' })
  }

  const handleMerge = (fromTableId, toTableId) => {
    if (!API_ENABLED.tables) return
    if (!tableOps?.order || !orders) return
    const targetOrder = orders.find(
      o => o.tableId == toTableId && ['pending', 'preparing', 'ready', 'served'].includes(o.status)
    )
    if (!targetOrder) {
      toast.error('Hedef masada aktif sipariş bulunamadı')
      return
    }
    mergeOrders.mutate({
      sourceOrderId: tableOps.order.id,
      targetOrderId: targetOrder.id,
      targetTableId: toTableId,
      sourceTableId: fromTableId,
    })
    setTableOps(null)
  }

  const handleTransfer = (fromTableId, toTableId) => {
    if (!API_ENABLED.tables) return
    if (!tableOps?.order) return
    transferOrder.mutate({
      orderId: tableOps.order.id,
      fromTableId,
      toTableId,
    })
    setTableOps(null)
  }

  const handleSplitBill = (orderId, amounts) => {
    const order = orders?.find(o => o.id === orderId)
    if (!order) return
    openPayment(order)
    setSplitMode(true)
    setSplitCount(amounts.length)
    setTableOps(null)
  }

  const isPaying = createPayment.isPending || createSplitPayment.isPending || updateStatus.isPending

  if (isLoading) return <div className={styles.orders}>Yükleniyor...</div>

  if (isError) {
    return (
      <div className={styles.orders}>
        <p>Siparişler yüklenemedi.</p>
        <p>{error?.message}</p>
        <button type="button" onClick={() => refetch()}>Tekrar Dene</button>
      </div>
    )
  }

  return (
    <div className={styles.orders}>
      <div className={styles.ordersHeader}>
        <div>
          <h1>{t('orders.title')}</h1>
          <p>{filteredOrders.length} sipariş</p>
        </div>
        <button className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`} onClick={() => refetch()}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className={styles.filters}>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Aktif' },
          { key: 'pending', label: t('orders.statuses.pending') },
          { key: 'preparing', label: t('orders.statuses.preparing') },
          { key: 'ready', label: t('orders.statuses.ready') },
          { key: 'completed', label: t('orders.statuses.completed') },
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
                      <span className={styles.orderTime}><Clock size={14} />{formatTime(order.createdAt)}</span>
                      {order.waiter && (
                        <>
                          <span className={styles.orderSep}>•</span>
                          <span className={styles.orderWaiter}><User size={14} />{order.waiter}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {API_ENABLED.tables && ['served', 'ready', 'preparing'].includes(order.status) && (
                      <button
                        className={styles.printBtn}
                        onClick={() => {
                          const table = tables?.find(t => t.id == order.tableId)
                          setTableOps({ table, order })
                        }}
                        title="Masa İşlemleri"
                      >
                        <ArrowRightLeft size={16} />
                      </button>
                    )}
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
                  {(order.items || []).map((item, index) => (
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
                          onClick={() => handleStatusUpdate(order.id, 'preparing')}>Hazırlamaya Başla</button>
                        <button className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleCancel(order.id)}>İptal</button>
                      </>
                    )}
                    {order.status === 'preparing' && (
                      <button className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'ready')}>Hazır</button>
                    )}
                    {order.status === 'ready' && (
                      <button className={`${styles.actionBtn} ${styles.success}`}
                        onClick={() => handleStatusUpdate(order.id, 'served')}>Servis Et</button>
                    )}
                    {order.status === 'served' && (
                      <button className={`${styles.actionBtn} ${styles.payment}`} onClick={() => openPayment(order)}>
                        <Wallet size={16} /> Ödeme Al
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

      {/* Masa İşlemleri Modal */}
      {tableOps && (
        <TableOperations
          isOpen={!!tableOps}
          onClose={() => setTableOps(null)}
          currentTable={tableOps.table}
          availableTables={tables}
          order={tableOps.order}
          onTransfer={handleTransfer}
          onMerge={handleMerge}
          onSplit={handleSplitBill}
        />
      )}

      {/* Ödeme Modalı */}
      <AnimatePresence>
        {paymentOrder && (
          <>
            <motion.div className={styles.modalOverlay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={resetPaymentModal} />
            <motion.div className={styles.paymentModal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}>
              <div className={styles.paymentModalHeader}>
                <div className={styles.paymentModalTitle}>
                  <Receipt size={22} />
                  <div>
                    <h2>Ödeme Al</h2>
                    <p>Sipariş #{paymentOrder.id} • Masa {getTableNumber(paymentOrder.tableId)}</p>
                  </div>
                </div>
                <button className={styles.modalCloseBtn} onClick={resetPaymentModal}><X size={20} /></button>
              </div>

              <div className={styles.paymentItems}>
                {(paymentOrder.items || []).map((item, i) => (
                  <div key={i} className={styles.paymentItem}>
                    <span className={styles.paymentItemQty}>{item.quantity}x</span>
                    <span className={styles.paymentItemName}>{getMenuItemName(item.menuItemId)}</span>
                    <span className={styles.paymentItemPrice}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className={styles.paymentSummaryRows}>
                  <div className={styles.paymentSummaryRow}>
                    <span>Ara Toplam</span>
                    <span>{formatCurrency(paymentOrder.total)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className={styles.paymentSummaryRow}>
                      <span>İndirim (%{discountPercent})</span>
                      <span className={styles.discountAmount}>
                        -{formatCurrency(paymentOrder.total * discountPercent / 100)}
                      </span>
                    </div>
                  )}
                  {tipAmount > 0 && (
                    <div className={styles.paymentSummaryRow}>
                      <span>Bahşiş</span>
                      <span>{formatCurrency(tipAmount)}</span>
                    </div>
                  )}
                </div>
                <div className={styles.paymentTotal}>
                  <span>Toplam</span>
                  <strong>{formatCurrency(finalTotal)}</strong>
                </div>
              </div>

              {/* İndirim & Bahşiş */}
              <div className={styles.extraPaymentFields}>
                <div className={styles.extraField}>
                  <label><Percent size={14} /> İndirim (%)</label>
                  <input type="number" min="0" max="100" value={discountPercent}
                    onChange={e => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))} />
                </div>
                <div className={styles.extraField}>
                  <label><DollarSign size={14} /> Bahşiş (₺)</label>
                  <input type="number" min="0" value={tipAmount}
                    onChange={e => setTipAmount(Math.max(0, Number(e.target.value)))} />
                </div>
              </div>

              {/* Bölünmüş ödeme */}
              <div className={styles.splitToggle}>
                <button
                  className={`${styles.splitToggleBtn} ${splitMode ? styles.active : ''}`}
                  onClick={() => setSplitMode(!splitMode)}>
                  <Split size={16} />
                  Hesabı Böl
                </button>
                {splitMode && (
                  <div className={styles.splitControl}>
                    <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))}>−</button>
                    <span>{splitCount} kişi</span>
                    <button onClick={() => setSplitCount(Math.min(10, splitCount + 1))}>+</button>
                    <span className={styles.splitPerPerson}>
                      Kişi başı: {formatCurrency(finalTotal / splitCount)}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.paymentMethodSection}>
                <p className={styles.paymentMethodLabel}>Ödeme Yöntemi</p>
                <div className={styles.paymentMethodGrid}>
                  {paymentMethods.map(({ id, label, icon: Icon }) => (
                    <button key={id}
                      className={`${styles.paymentMethodBtn} ${paymentMethod === id ? styles.selected : ''}`}
                      onClick={() => setPaymentMethod(id)}>
                      <Icon size={24} /><span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className={styles.confirmPaymentBtn} onClick={handlePaymentConfirm} disabled={isPaying}>
                <CheckCircle size={20} />
                {isPaying ? 'İşleniyor...' : `Ödemeyi Onayla — ${formatCurrency(finalTotal)}`}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
