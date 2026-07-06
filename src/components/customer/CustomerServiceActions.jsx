import { useState } from 'react'
import { Bell, Receipt, X } from 'lucide-react'
import { useCreateServiceCall } from '../../hooks/useServiceCalls'
import styles from './CustomerServiceActions.module.css'

const WAITER_REASONS = [
  { id: 'water', label: 'Su' },
  { id: 'bread', label: 'Ekmek' },
  { id: 'sauce', label: 'Sos' },
  { id: 'assistance', label: 'Yardım' },
  { id: 'other', label: 'Diğer' },
]

function readTableToken() {
  try {
    const raw = localStorage.getItem('customerTable')
    return raw ? JSON.parse(raw).tableToken : null
  } catch {
    return null
  }
}

export default function CustomerServiceActions() {
  const [showWaiterModal, setShowWaiterModal] = useState(false)
  const createCall = useCreateServiceCall()
  const tableToken = readTableToken()

  const requestBill = () => {
    if (!tableToken) return
    createCall.mutate({ tableToken, type: 'bill' })
  }

  const requestWaiter = (reason) => {
    if (!tableToken) return
    createCall.mutate(
      { tableToken, type: 'waiter', reason },
      { onSuccess: () => setShowWaiterModal(false) },
    )
  }

  return (
    <>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={requestBill}
          disabled={createCall.isPending}
        >
          <Receipt size={18} />
          <span>Hesap İste</span>
        </button>
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.waiterBtn}`}
          onClick={() => setShowWaiterModal(true)}
          disabled={createCall.isPending}
        >
          <Bell size={18} />
          <span>Garson Çağır</span>
        </button>
      </div>

      {showWaiterModal && (
        <>
          <div className={styles.overlay} onClick={() => setShowWaiterModal(false)} />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Garson Çağır</h3>
              <button type="button" onClick={() => setShowWaiterModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className={styles.modalHint}>Ne için yardım istiyorsunuz?</p>
            <div className={styles.reasonGrid}>
              {WAITER_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  className={styles.reasonBtn}
                  onClick={() => requestWaiter(reason.id)}
                  disabled={createCall.isPending}
                >
                  {reason.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
