import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Receipt, CheckCircle, Clock, UserCheck } from 'lucide-react'
import {
  useServiceCalls,
  useUpdateServiceCallStatus,
  useHandleServiceCall,
} from '../hooks/useServiceCalls'
import EmptyState from '../components/EmptyState/EmptyState'
import styles from './ServiceCalls.module.css'

const STATUS_TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'waiting', label: 'Bekliyor' },
  { id: 'accepted', label: 'Kabul Edildi' },
  { id: 'completed', label: 'Tamamlandı' },
]

const TYPE_LABELS = {
  bill: 'Hesap İsteği',
  waiter: 'Garson Çağrısı',
}

const REASON_LABELS = {
  water: 'Su',
  bread: 'Ekmek',
  sauce: 'Sos',
  assistance: 'Yardım',
  other: 'Diğer',
}

const STATUS_LABELS = {
  waiting: 'Bekliyor',
  accepted: 'Kabul Edildi',
  completed: 'Tamamlandı',
}

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

export default function ServiceCalls() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('waiting')
  const { data: calls = [], isLoading, isError, refetch } = useServiceCalls()
  const updateStatus = useUpdateServiceCallStatus()
  const completeCall = useHandleServiceCall()

  const filteredCalls = useMemo(() => {
    if (statusFilter === 'all') return calls
    return calls.filter((call) => call.status === statusFilter)
  }, [calls, statusFilter])

  const activeCount = calls.filter((c) => c.status !== 'completed').length

  if (isLoading) {
    return <div className={styles.loading}>Yükleniyor…</div>
  }

  if (isError) {
    return (
      <div className={styles.loading}>
        <p>Servis talepleri yüklenemedi.</p>
        <button type="button" onClick={() => refetch()}>Tekrar Dene</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Servis Merkezi</h1>
          <p>Müşteri talepleri — hesap, garson ve yardım istekleri</p>
        </div>
        {activeCount > 0 && (
          <span className={styles.activeBadge}>{activeCount} aktif talep</span>
        )}
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${statusFilter === tab.id ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredCalls.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aktif talep yok"
          description="Müşteriler hesap istediğinde veya garson çağırdığında burada görünür."
        />
      ) : (
        <div className={styles.list}>
          {filteredCalls.map((call) => (
            <div key={call.id} className={`${styles.card} ${styles[call.status]}`}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  {call.type === 'bill' ? <Receipt size={20} /> : <Bell size={20} />}
                </div>
                <div className={styles.cardInfo}>
                  <strong>{TYPE_LABELS[call.type] || call.type}</strong>
                  <span>{call.tableName}</span>
                  {call.reason && (
                    <span className={styles.reason}>
                      {REASON_LABELS[call.reason] || call.reason}
                    </span>
                  )}
                </div>
                <div className={styles.cardMeta}>
                  <span className={`${styles.statusBadge} ${styles[`status_${call.status}`]}`}>
                    {STATUS_LABELS[call.status]}
                  </span>
                  <span className={styles.time}>
                    <Clock size={14} />
                    {formatTime(call.createdAt)}
                  </span>
                </div>
              </div>

              {call.status !== 'completed' && (
                <div className={styles.cardActions}>
                  {call.status === 'waiting' && (
                    <button
                      type="button"
                      className={styles.acceptBtn}
                      onClick={() => updateStatus.mutate({ id: call.id, status: 'accepted' })}
                      disabled={updateStatus.isPending}
                    >
                      <UserCheck size={16} />
                      Kabul Et
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.completeBtn}
                    onClick={() => completeCall.mutate(call.id)}
                    disabled={completeCall.isPending}
                  >
                    <CheckCircle size={16} />
                    Tamamla
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button type="button" className={styles.backLink} onClick={() => navigate('/')}>
        Dashboard&apos;a Dön
      </button>
    </div>
  )
}
