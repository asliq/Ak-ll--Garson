import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Phone, 
  Mail,
  Plus,
  Check,
  X,
  Loader2,
  ChevronDown,
  MapPin
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { 
  useInfiniteReservations,
  useUpdateReservationStatus,
  useCreateReservation
} from '../hooks/useReservations'
import { useTables } from '../hooks/useTables'
import styles from './Reservations.module.css'

const statusConfig = {
  pending: { label: 'Beklemede', color: 'warning' },
  confirmed: { label: 'Onaylı', color: 'success' },
  cancelled: { label: 'İptal', color: 'danger' },
  completed: { label: 'Tamamlandı', color: 'info' },
}

export default function Reservations() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewForm, setShowNewForm] = useState(false)
  const [newReservation, setNewReservation] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    guestCount: 2,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    duration: 120,
    notes: '',
  })

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteReservations({ status: statusFilter !== 'all' ? statusFilter : undefined })
  
  const { data: tables } = useTables()
  const updateStatus = useUpdateReservationStatus()
  const createReservation = useCreateReservation()

  // Tüm sayfaları birleştir
  const reservations = data?.pages?.flatMap(page => page.reservations) || []

  const handleStatusChange = (id, newStatus) => {
    updateStatus.mutate({ id, status: newStatus })
  }

  const handleCreateReservation = (e) => {
    e.preventDefault()
    
    createReservation.mutate({
      ...newReservation,
      tableId: parseInt(newReservation.tableId),
      status: 'pending',
    }, {
      onSuccess: () => {
        setShowNewForm(false)
        setNewReservation({
          tableId: '',
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          guestCount: 2,
          date: new Date().toISOString().split('T')[0],
          time: '19:00',
          duration: 120,
          notes: '',
        })
      }
    })
  }

  const getTableInfo = (tableId) => {
    return tables?.find(t => t.id === tableId)
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="200px" borderRadius="16px" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.filters}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              className={`${styles.filterBtn} ${statusFilter === status ? styles.active : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Tümü' : statusConfig[status].label}
            </button>
          ))}
        </div>
        
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowNewForm(true)}
        >
          Yeni Rezervasyon
        </Button>
      </div>

      {/* New Reservation Modal */}
      <AnimatePresence>
        {showNewForm && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewForm(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h2>Yeni Rezervasyon</h2>
                <button onClick={() => setShowNewForm(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateReservation} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Müşteri Adı *</label>
                    <input
                      type="text"
                      value={newReservation.customerName}
                      onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Telefon *</label>
                    <input
                      type="tel"
                      value={newReservation.customerPhone}
                      onChange={(e) => setNewReservation({...newReservation, customerPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>E-posta</label>
                  <input
                    type="email"
                    value={newReservation.customerEmail}
                    onChange={(e) => setNewReservation({...newReservation, customerEmail: e.target.value})}
                  />
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Masa *</label>
                    <select
                      value={newReservation.tableId}
                      onChange={(e) => setNewReservation({...newReservation, tableId: e.target.value})}
                      required
                    >
                      <option value="">Masa Seçin</option>
                      {tables?.filter(t => t.status === 'available').map(table => (
                        <option key={table.id} value={table.id}>
                          Masa {table.number} - {table.section} ({table.capacity} kişilik)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Kişi Sayısı *</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newReservation.guestCount}
                      onChange={(e) => setNewReservation({...newReservation, guestCount: parseInt(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tarih *</label>
                    <input
                      type="date"
                      value={newReservation.date}
                      onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Saat *</label>
                    <input
                      type="time"
                      value={newReservation.time}
                      onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Notlar</label>
                  <textarea
                    value={newReservation.notes}
                    onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <Button variant="secondary" type="button" onClick={() => setShowNewForm(false)}>
                    İptal
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    loading={createReservation.isPending}
                  >
                    Rezervasyon Oluştur
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reservations Grid */}
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {reservations.map((reservation, index) => {
            const table = getTableInfo(reservation.tableId)
            
            return (
              <motion.div
                key={reservation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={styles.reservationCard} hover>
                  <CardContent className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.customerName}>{reservation.customerName}</h3>
                        <div className={styles.contactInfo}>
                          <span><Phone size={14} /> {reservation.customerPhone}</span>
                          {reservation.customerEmail && (
                            <span><Mail size={14} /> {reservation.customerEmail}</span>
                          )}
                        </div>
                      </div>
                      <span className={`badge badge-${statusConfig[reservation.status].color}`}>
                        {statusConfig[reservation.status].label}
                      </span>
                    </div>
                    
                    <div className={styles.details}>
                      <div className={styles.detailItem}>
                        <CalendarDays size={16} />
                        <span>{new Date(reservation.date).toLocaleDateString('tr-TR', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        })}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Clock size={16} />
                        <span>{reservation.time}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <Users size={16} />
                        <span>{reservation.guestCount} kişi</span>
                      </div>
                      <div className={styles.detailItem}>
                        <MapPin size={16} />
                        <span>Masa {table?.number} - {table?.section}</span>
                      </div>
                    </div>
                    
                    {reservation.notes && (
                      <p className={styles.notes}>{reservation.notes}</p>
                    )}
                    
                    {reservation.status === 'pending' && (
                      <div className={styles.actions}>
                        <Button
                          variant="success"
                          size="small"
                          icon={Check}
                          onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                          loading={updateStatus.isPending}
                        >
                          Onayla
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                        >
                          İptal
                        </Button>
                      </div>
                    )}
                    
                    {reservation.status === 'confirmed' && (
                      <div className={styles.actions}>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleStatusChange(reservation.id, 'completed')}
                        >
                          Tamamlandı
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            icon={ChevronDown}
          >
            Daha Fazla Yükle
          </Button>
        </div>
      )}

      {reservations.length === 0 && (
        <div className={styles.emptyState}>
          <CalendarDays size={64} />
          <h3>Rezervasyon Bulunamadı</h3>
          <p>Bu filtreyle eşleşen rezervasyon yok.</p>
        </div>
      )}
    </div>
  )
}

