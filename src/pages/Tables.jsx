import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MapPin, 
  Plus,
  Filter,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { SkeletonTable } from '../components/ui/Skeleton'
import { useTables, useUpdateTableStatus, usePrefetchTable } from '../hooks/useTables'
import styles from './Tables.module.css'

const statusConfig = {
  available: { label: 'Boş', color: 'success' },
  occupied: { label: 'Dolu', color: 'danger' },
  reserved: { label: 'Rezerve', color: 'warning' },
}

export default function Tables() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')

  // TanStack Query hooks
  const { data: tables, isLoading, isRefetching, refetch } = useTables()
  const updateStatus = useUpdateTableStatus()
  const prefetchTable = usePrefetchTable()

  // Bölümleri çıkar
  const sections = useMemo(() => {
    if (!tables) return []
    return [...new Set(tables.map(t => t.section))]
  }, [tables])

  // Filtrelenmiş masalar
  const filteredTables = useMemo(() => {
    if (!tables) return []
    return tables.filter(table => {
      const statusMatch = filter === 'all' || table.status === filter
      const sectionMatch = sectionFilter === 'all' || table.section === sectionFilter
      return statusMatch && sectionMatch
    })
  }, [tables, filter, sectionFilter])

  // Masa durumu döngüsü
  const cycleStatus = (table) => {
    const statusOrder = ['available', 'occupied', 'reserved']
    const currentIndex = statusOrder.indexOf(table.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    updateStatus.mutate({ id: table.id, status: nextStatus })
  }

  // Sipariş sayfasına git
  const goToOrder = (tableId) => {
    navigate(`/tables/${tableId}/order`)
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h2>Masalar</h2>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonTable key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Filtreler */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={18} />
          <span>Durum:</span>
          <div className={styles.filterButtons}>
            {['all', 'available', 'occupied', 'reserved'].map(status => (
              <button
                key={status}
                className={`${styles.filterBtn} ${filter === status ? styles.active : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'Tümü' : statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <MapPin size={18} />
          <span>Bölüm:</span>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${sectionFilter === 'all' ? styles.active : ''}`}
              onClick={() => setSectionFilter('all')}
            >
              Tümü
            </button>
            {sections.map(section => (
              <button
                key={section}
                className={`${styles.filterBtn} ${sectionFilter === section ? styles.active : ''}`}
                onClick={() => setSectionFilter(section)}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <IconButton
            icon={RefreshCw}
            variant="secondary"
            onClick={() => refetch()}
            className={isRefetching ? styles.spinning : ''}
          />
          <Button icon={Plus} variant="primary">
            Masa Ekle
          </Button>
        </div>
      </div>

      {/* Masa Sayıları */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={`${styles.dot} ${styles.available}`} />
          <span>Boş: {tables?.filter(t => t.status === 'available').length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.dot} ${styles.occupied}`} />
          <span>Dolu: {tables?.filter(t => t.status === 'occupied').length}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={`${styles.dot} ${styles.reserved}`} />
          <span>Rezerve: {tables?.filter(t => t.status === 'reserved').length}</span>
        </div>
      </div>

      {/* Masa Grid */}
      <motion.div 
        className={styles.grid}
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredTables.map((table, index) => (
            <motion.div
              key={table.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onMouseEnter={() => prefetchTable(table.id)}
            >
              <Card 
                className={`${styles.tableCard} ${styles[table.status]}`}
                hover
              >
                <CardContent className={styles.cardContent}>
                  {/* Durum Badge */}
                  <div className={styles.statusBadge}>
                    <span className={`badge badge-${statusConfig[table.status].color}`}>
                      {statusConfig[table.status].label}
                    </span>
                  </div>

                  {/* Masa Numarası */}
                  <motion.div 
                    className={styles.tableNumber}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => cycleStatus(table)}
                  >
                    <span>{table.number}</span>
                  </motion.div>

                  {/* Bilgiler */}
                  <div className={styles.tableInfo}>
                    <div className={styles.infoItem}>
                      <Users size={16} />
                      <span>{table.capacity} kişilik</span>
                    </div>
                    <div className={styles.infoItem}>
                      <MapPin size={16} />
                      <span>{table.section}</span>
                    </div>
                  </div>

                  {/* Sipariş Butonu */}
                  {table.status === 'occupied' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button 
                        variant="primary" 
                        size="small" 
                        fullWidth
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={() => goToOrder(table.id)}
                      >
                        Siparişe Git
                      </Button>
                    </motion.div>
                  )}

                  {table.status === 'available' && (
                    <Button 
                      variant="outline" 
                      size="small" 
                      fullWidth
                      onClick={() => goToOrder(table.id)}
                    >
                      Sipariş Al
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredTables.length === 0 && (
        <div className={styles.emptyState}>
          <p>Bu filtreyle eşleşen masa bulunamadı.</p>
        </div>
      )}
    </div>
  )
}

