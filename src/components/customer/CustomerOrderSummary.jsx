import { useMemo } from 'react'
import styles from './CustomerOrderSummary.module.css'

const formatCurrency = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(value ?? 0)

export default function CustomerOrderSummary({ orders = [] }) {
  const summary = useMemo(() => {
    const active = orders.filter((o) =>
      ['pending', 'preparing', 'ready', 'served'].includes(o.status),
    )
    const completed = orders.filter((o) =>
      ['served', 'completed'].includes(o.status),
    )

    const activeTotal = active.reduce((sum, o) => sum + (o.total || 0), 0)
    const completedTotal = completed.reduce((sum, o) => sum + (o.total || 0), 0)
    const grandTotal = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)

    return { activeTotal, completedTotal, grandTotal, completedCount: completed.length }
  }, [orders])

  if (orders.length === 0) return null

  return (
    <div className={styles.summary}>
      <h3>Masa Özeti</h3>
      <div className={styles.row}>
        <span>Aktif siparişler</span>
        <strong>{formatCurrency(summary.activeTotal)}</strong>
      </div>
      <div className={styles.row}>
        <span>Tamamlanan ({summary.completedCount})</span>
        <strong>{formatCurrency(summary.completedTotal)}</strong>
      </div>
      <div className={`${styles.row} ${styles.grand}`}>
        <span>Genel Toplam</span>
        <strong>{formatCurrency(summary.grandTotal)}</strong>
      </div>
    </div>
  )
}
