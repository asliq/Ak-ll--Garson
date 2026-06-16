import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ShoppingCart,
  ChefHat,
  CheckCircle,
  CreditCard,
  Users,
  Table,
  Clock,
  Bell,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/services'
import styles from './ActivityFeed.module.css'

const activityIcons = {
  order: ShoppingCart,
  cooking: ChefHat,
  ready: CheckCircle,
  payment: CreditCard,
  table: Table,
  reservation: Users
}

const activityColors = {
  order: '#e85d04',
  cooking: '#8b5cf6',
  ready: '#22c55e',
  payment: '#06b6d4',
  table: '#f59e0b',
  reservation: '#ec4899'
}

export function ActivityFeed() {
  const [isOpen, setIsOpen] = useState(false)
  const [activities, setActivities] = useState([])
  const previousOrdersRef = useRef([])

  // Poll for orders
  const { data: orders } = useQuery({
    queryKey: ['orders-activity'],
    queryFn: api.orders.getAll,
    refetchInterval: 3000
  })

  // Generate activities from order changes
  useEffect(() => {
    if (!orders) return

    const previousOrders = previousOrdersRef.current
    const newActivities = []
    const now = new Date()

    orders.forEach(order => {
      const prevOrder = previousOrders.find(o => o.id === order.id)
      
      if (!prevOrder) {
        // New order
        newActivities.push({
          id: `order-${order.id}-${now.getTime()}`,
          type: 'order',
          message: `Masa ${order.tableId}'dan yeni sipariş`,
          detail: `${order.items?.length || 0} ürün`,
          time: now,
          isNew: true
        })
      } else if (prevOrder.status !== order.status) {
        // Status changed
        const statusMessages = {
          preparing: { type: 'cooking', message: 'Sipariş hazırlanıyor' },
          ready: { type: 'ready', message: 'Sipariş hazır!' },
          completed: { type: 'payment', message: 'Sipariş tamamlandı' }
        }
        
        if (statusMessages[order.status]) {
          newActivities.push({
            id: `status-${order.id}-${order.status}-${now.getTime()}`,
            type: statusMessages[order.status].type,
            message: statusMessages[order.status].message,
            detail: `Masa ${order.tableId}`,
            time: now,
            isNew: true
          })
        }
      }
    })

    if (newActivities.length > 0) {
      setActivities(prev => [...newActivities, ...prev].slice(0, 50))
    }

    previousOrdersRef.current = orders
  }, [orders])

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)
    
    if (seconds < 60) return 'Şimdi'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}d önce`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}s önce`
    return `${Math.floor(seconds / 86400)}g önce`
  }

  // Refresh time display
  const [, forceUpdate] = useState()
  useEffect(() => {
    const interval = setInterval(() => forceUpdate({}), 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.container}>
      {/* Toggle Button */}
      <button 
        className={`${styles.toggle} ${activities.some(a => a.isNew) ? styles.hasNew : ''}`}
        onClick={() => {
          setIsOpen(!isOpen)
          // Mark all as seen
          setActivities(prev => prev.map(a => ({ ...a, isNew: false })))
        }}
      >
        <Activity size={16} />
        <span>Aktivite</span>
        {activities.filter(a => a.isNew).length > 0 && (
          <span className={styles.badge}>{activities.filter(a => a.isNew).length}</span>
        )}
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Feed Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
          >
            <div className={styles.header}>
              <span>Canlı Aktiviteler</span>
              <button 
                className={styles.clearBtn}
                onClick={() => setActivities([])}
              >
                Temizle
              </button>
            </div>

            <div className={styles.list}>
              {activities.length === 0 ? (
                <div className={styles.empty}>
                  <Clock size={24} />
                  <p>Henüz aktivite yok</p>
                  <span>Yeni işlemler burada görünecek</span>
                </div>
              ) : (
                activities.map((activity, index) => {
                  const Icon = activityIcons[activity.type] || Bell
                  const color = activityColors[activity.type] || '#71717a'
                  
                  return (
                    <motion.div
                      key={activity.id}
                      className={`${styles.item} ${activity.isNew ? styles.new : ''}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <div 
                        className={styles.icon}
                        style={{ background: `${color}15`, color }}
                      >
                        <Icon size={14} />
                      </div>
                      <div className={styles.content}>
                        <span className={styles.message}>{activity.message}</span>
                        <span className={styles.detail}>{activity.detail}</span>
                      </div>
                      <span className={styles.time}>{formatTimeAgo(activity.time)}</span>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

