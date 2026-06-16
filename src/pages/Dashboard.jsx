import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  DollarSign,
  ShoppingBag,
  CheckCircle,
  RefreshCw,
  Users,
  Plus
} from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useStats } from '../hooks/useStats'
import { useTables } from '../hooks/useTables'
import { useOrders } from '../hooks/useOrders'
import { useMenuItems } from '../hooks/useMenu'
import { useAppStore } from '../store/useAppStore'
import styles from './Dashboard.module.css'

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

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: stats } = useStats()
  const { data: tables } = useTables()
  const { data: orders, refetch: refetchOrders } = useOrders()
  const { data: menuItems } = useMenuItems()
  const activeWaiter = useAppStore((state) => state.activeWaiter)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // İstatistikleri hesapla
  const dashboardStats = useMemo(() => {
    if (!tables || !orders) return null

    const availableTables = tables.filter(t => t.status === 'available').length
    const occupiedTables = tables.filter(t => t.status === 'occupied').length
    const reservedTables = tables.filter(t => t.status === 'reserved').length
    
    const activeOrders = orders.filter(o => 
      ['pending', 'preparing', 'ready'].includes(o.status)
    )

    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt)
      const today = new Date()
      return orderDate.toDateString() === today.toDateString()
    })

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const completedToday = todayOrders.filter(o => o.status === 'completed').length
    const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0

    return {
      availableTables,
      occupiedTables,
      reservedTables,
      activeOrders,
      todayRevenue,
      completedToday,
      avgOrderValue,
      totalTables: tables.length
    }
  }, [tables, orders])

  // Popüler ürünler
  const popularItems = useMemo(() => {
    if (!orders || !menuItems) return []

    const itemCounts = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            count: 0,
            revenue: 0
          }
        }
        itemCounts[item.menuItemId].count += item.quantity
        itemCounts[item.menuItemId].revenue += item.price * item.quantity
      })
    })

    return Object.entries(itemCounts)
      .map(([id, data]) => {
        const menuItem = menuItems.find(m => m.id === parseInt(id))
        return menuItem ? { ...menuItem, ...data } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [orders, menuItems])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchOrders()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  if (!dashboardStats) {
    return <div className={styles.dashboard}>Yükleniyor...</div>
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.greeting}>
          <h1>{t('dashboard.greeting')}{activeWaiter?.name ? `, ${activeWaiter.name.split(' ')[0]}` : ''} 👋</h1>
          <p>{t('dashboard.todaySummary')}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.currentTime}>
            <Clock size={16} />
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
          <button 
            className={`${styles.refreshBtn} ${isRefreshing ? styles.spinning : ''}`}
            onClick={handleRefresh}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Revenue */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Toplam Gelir</div>
              <div className={styles.statValue}>{formatCurrency(dashboardStats.todayRevenue)}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.revenue}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={`${styles.statChange} ${styles.up}`}>
            <TrendingUp size={14} />
            <span>+12.5%</span>
          </div>
        </div>

        {/* Active Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Aktif Siparişler</div>
              <div className={styles.statValue}>{dashboardStats.activeOrders.length}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.orders}`}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={`${styles.statChange} ${styles.up}`}>
            <TrendingUp size={14} />
            <span>+8.2%</span>
          </div>
        </div>

        {/* Completed Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Tamamlanan</div>
              <div className={styles.statValue}>{dashboardStats.completedToday}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.completed}`}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className={`${styles.statChange} ${styles.up}`}>
            <TrendingUp size={14} />
            <span>+5.7%</span>
          </div>
        </div>

        {/* Average Order */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Ort. Sipariş</div>
              <div className={styles.statValue}>{formatCurrency(dashboardStats.avgOrderValue)}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.average}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={`${styles.statChange} ${styles.down}`}>
            <TrendingDown size={14} />
            <span>-2.1%</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Table Status */}
        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Masa Durumu</h3>
            <button className={styles.sectionAction} onClick={() => navigate('/tables')}>
              Tümünü Gör
            </button>
          </div>
          
          <div className={styles.tableSummary}>
            <div className={styles.tableSummaryItem}>
              <div className={styles.tableSummaryValue}>{dashboardStats.availableTables}</div>
              <div className={styles.tableSummaryLabel}>Boş</div>
            </div>
            <div className={styles.tableSummaryItem}>
              <div className={styles.tableSummaryValue}>{dashboardStats.occupiedTables}</div>
              <div className={styles.tableSummaryLabel}>Dolu</div>
            </div>
            <div className={styles.tableSummaryItem}>
              <div className={styles.tableSummaryValue}>{dashboardStats.reservedTables}</div>
              <div className={styles.tableSummaryLabel}>Rezerve</div>
            </div>
          </div>

          <div className={styles.tableGrid}>
            {tables?.slice(0, 12).map(table => (
              <div
                key={table.id}
                className={`${styles.tableItem} ${styles[table.status]}`}
                onClick={() => navigate(`/tables/${table.id}`)}
              >
                <div className={styles.tableNumber}>{table.number}</div>
                <div className={styles.tableCapacity}>{table.capacity} kişi</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Orders */}
        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Aktif Siparişler</h3>
            <button className={styles.sectionAction} onClick={() => navigate('/orders')}>
              Tümünü Gör
            </button>
          </div>
          
          <div className={styles.ordersList}>
            {dashboardStats.activeOrders.slice(0, 6).map(order => (
              <div key={order.id} className={styles.orderItem} onClick={() => navigate(`/orders/${order.id}`)}>
                <div className={styles.orderTable}>M{order.tableId}</div>
                <div className={styles.orderDetails}>
                  <div className={styles.orderNumber}>Sipariş #{order.id}</div>
                  <div className={styles.orderItems}>{order.items.length} ürün</div>
                </div>
                <div className={styles.orderMeta}>
                  <div className={`${styles.orderStatus} ${styles[order.status]}`}>
                    {order.status === 'pending' ? 'Bekliyor' : 
                     order.status === 'preparing' ? 'Hazırlanıyor' : 'Hazır'}
                  </div>
                  <div className={styles.orderTime}>{getTimeAgo(order.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Popüler Ürünler</h3>
            <button className={styles.sectionAction} onClick={() => navigate('/menu')}>
              Tümünü Gör
            </button>
          </div>
          
          <div className={styles.popularList}>
            {popularItems.map((item, index) => (
              <div key={item.id} className={styles.popularItem}>
                <div className={styles.popularRank}>{index + 1}</div>
                <div className={styles.popularInfo}>
                  <div className={styles.popularName}>{item.name}</div>
                  <div className={styles.popularCategory}>{item.category}</div>
                </div>
                <div className={styles.popularStats}>
                  <div className={styles.popularCount}>{item.count}x</div>
                  <div className={styles.popularRevenue}>{formatCurrency(item.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.quickAction} onClick={() => navigate('/orders/new')}>
          <div className={styles.quickActionIcon}>
            <Plus size={24} />
          </div>
          <div className={styles.quickActionLabel}>Yeni Sipariş</div>
        </button>
        <button className={styles.quickAction} onClick={() => navigate('/tables')}>
          <div className={styles.quickActionIcon}>
            <Users size={24} />
          </div>
          <div className={styles.quickActionLabel}>Masalar</div>
        </button>
      </div>
    </div>
  )
}
