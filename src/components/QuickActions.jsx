import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Plus,
  Table,
  Receipt,
  CreditCard,
  Bell,
  Users,
  ChefHat,
  Package,
  Printer,
  X,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './QuickActions.module.css'

const actions = [
  {
    id: 'new-order',
    label: 'Yeni Sipariş',
    description: 'Masa seç ve sipariş oluştur',
    icon: Plus,
    color: '#e85d04',
    path: '/tables'
  },
  {
    id: 'open-tables',
    label: 'Açık Masalar',
    description: 'Aktif masaları görüntüle',
    icon: Table,
    color: '#22c55e',
    path: '/tables'
  },
  {
    id: 'active-orders',
    label: 'Aktif Siparişler',
    description: 'Bekleyen siparişler',
    icon: Receipt,
    color: '#f59e0b',
    path: '/orders'
  },
  {
    id: 'kitchen',
    label: 'Mutfak',
    description: 'Mutfak ekranına git',
    icon: ChefHat,
    color: '#8b5cf6',
    path: '/kitchen'
  },
  {
    id: 'payment',
    label: 'Ödeme Al',
    description: 'Hesap kapat',
    icon: CreditCard,
    color: '#06b6d4',
    path: '/orders'
  },
  {
    id: 'reservations',
    label: 'Rezervasyonlar',
    description: 'Bugünkü rezervasyonlar',
    icon: Users,
    color: '#ec4899',
    path: '/reservations'
  }
]

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleAction = (action) => {
    navigate(action.path)
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap size={20} />
        <span>Hızlı İşlem</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className={styles.header}>
                <div className={styles.headerContent}>
                  <Zap size={18} className={styles.headerIcon} />
                  <span>Hızlı İşlemler</span>
                </div>
                <button 
                  className={styles.closeButton}
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.grid}>
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    className={styles.actionCard}
                    onClick={() => handleAction(action)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className={styles.actionIcon}
                      style={{ background: `${action.color}15`, color: action.color }}
                    >
                      <action.icon size={20} />
                    </div>
                    <div className={styles.actionContent}>
                      <span className={styles.actionLabel}>{action.label}</span>
                      <span className={styles.actionDesc}>{action.description}</span>
                    </div>
                    <ArrowRight size={16} className={styles.arrow} />
                  </motion.button>
                ))}
              </div>

              <div className={styles.footer}>
                <span className={styles.shortcut}>
                  <kbd>⌘</kbd>
                  <kbd>K</kbd>
                  ile tüm komutlara ulaşın
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

