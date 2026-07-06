import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePublicMenu } from '../../hooks/usePublicMenu'
import { useTableOrders } from '../../hooks/useOrders'
import styles from './CustomerHeader.module.css'

function readCustomerTable() {
  try {
    const raw = localStorage.getItem('customerTable')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function CustomerHeader({ backTo = '/customer/menu', showOrderCount = true }) {
  const navigate = useNavigate()
  const customerTable = readCustomerTable()
  const tableToken = customerTable?.tableToken
  const tableId = customerTable?.tableId

  const { data: publicMenu } = usePublicMenu(tableToken, { enabled: !!tableToken })
  const resolvedTableId = tableId || publicMenu?.tableId

  const { data: orders = [] } = useTableOrders(resolvedTableId, {
    enabled: !!resolvedTableId && showOrderCount,
    refetchInterval: resolvedTableId ? 15000 : false,
  })

  const orderCount = useMemo(
    () => orders.filter((o) => !['cancelled'].includes(o.status)).length,
    [orders],
  )

  const restaurantName = publicMenu?.restaurantName || 'Restoran'
  const tableName = publicMenu?.tableName || customerTable?.tableName || `Masa ${customerTable?.tableNumber || '-'}`

  return (
    <div className={styles.header}>
      <button type="button" className={styles.backBtn} onClick={() => navigate(backTo)}>
        <ArrowLeft size={20} />
      </button>
      <div className={styles.info}>
        <strong className={styles.restaurantName}>{restaurantName}</strong>
        <span className={styles.tableName}>{tableName}</span>
        {showOrderCount && resolvedTableId && (
          <span className={styles.orderCount}>{orderCount} sipariş</span>
        )}
      </div>
    </div>
  )
}
