import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  DollarSign,
  ShoppingBag,
  CheckCircle,
  RefreshCw,
  Receipt,
  TrendingUp,
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  Activity,
  Store,
  Flame,
  BellRing,
} from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useOrders } from '../hooks/useOrders'
import { useMenuItems } from '../hooks/useMenu'
import { useAppStore } from '../store/useAppStore'
import { useSystemHealth } from '../hooks/useSystemHealth'
import { useServiceCalls } from '../hooks/useServiceCalls'
import SystemHealthPanel from '../components/SystemHealth/SystemHealthPanel'
import EmptyState from '../components/EmptyState/EmptyState'
import { DEMO_EDITION } from '../config/modules'
import { formatOrderRef } from '../api/adapters'
import styles from './Dashboard.module.css'

const QUICK_LINKS = [
  { label: 'Siparişler', path: '/orders', icon: ClipboardList },
  { label: 'Mutfak', path: '/kitchen', icon: ChefHat },
  { label: 'Menü', path: '/menu', icon: UtensilsCrossed },
  { label: 'Platform', path: '/system/health', icon: Activity },
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
  }).format(value ?? 0)

const getTimeAgo = (dateString) => {
  const diffMins = Math.floor((Date.now() - new Date(dateString)) / 60000)
  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dk önce`
  return `${Math.floor(diffMins / 60)} saat önce`
}

const STATUS_LABELS = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  served: 'Servis',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: orders, isLoading, isError, error, refetch: refetchOrders } = useOrders()
  const { data: serviceCalls = [] } = useServiceCalls()
  const { data: menuItems, isLoading: menuLoading } = useMenuItems()
  const { health } = useSystemHealth()
  const activeWaiter = useAppStore((state) => state.activeWaiter)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const dashboardStats = useMemo(() => {
    const orderList = orders ?? []
    const today = new Date().toDateString()

    const todayOrders = orderList.filter(
      (o) => new Date(o.createdAt).toDateString() === today,
    )

    const activeOrders = orderList.filter((o) =>
      ['pending', 'preparing', 'ready'].includes(o.status),
    )

    const kitchenQueue = orderList
      .filter((o) => ['pending', 'preparing'].includes(o.status))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(0, 6)

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const completedToday = todayOrders.filter((o) => o.status === 'completed').length
    const avgOrderValue = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0

    const recentOrders = [...orderList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)

    const recentActivity = recentOrders.slice(0, 6).map((order) => ({
      id: order.id,
      text: `${formatOrderRef(order) || 'Sipariş'} — ${STATUS_LABELS[order.status] || order.status}`,
      time: getTimeAgo(order.createdAt),
      status: order.status,
    }))

    const openServiceCalls = serviceCalls.filter((c) => c.status !== 'completed')
    const billRequests = serviceCalls.filter(
      (c) => c.type === 'bill' && c.status !== 'completed',
    )
    const waitingCustomers = serviceCalls.filter((c) => c.status === 'waiting')

    return {
      activeOrders,
      kitchenQueue,
      todayRevenue,
      completedToday,
      avgOrderValue,
      todayOrderCount: todayOrders.length,
      recentOrders,
      recentActivity,
      openServiceCalls,
      billRequests,
      waitingCustomers,
    }
  }, [orders, serviceCalls])

  const popularItems = useMemo(() => {
    if (!orders?.length || !menuItems?.length) return []

    const itemCounts = {}
    orders.forEach((order) => {
      ;(order.items || []).forEach((item) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = { count: 0, revenue: 0 }
        }
        itemCounts[item.menuItemId].count += item.quantity
        itemCounts[item.menuItemId].revenue += item.price * item.quantity
      })
    })

    return Object.entries(itemCounts)
      .map(([id, data]) => {
        const menuItem = menuItems.find((m) => m.id === id)
        return menuItem ? { ...menuItem, ...data } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [orders, menuItems])

  const restaurantStatus = useMemo(() => {
    const platformOk = health?.api === 'healthy'
    const menuCount = menuItems?.length ?? 0
    const activeCount = dashboardStats.activeOrders.length

    let statusLabel = 'Operasyonel'
    let statusTone = 'ok'
    if (!platformOk && !isLoading) {
      statusLabel = 'Bağlantı Sorunu'
      statusTone = 'warn'
    } else if (activeCount > 0) {
      statusLabel = 'Yoğun'
      statusTone = 'busy'
    }

    return { platformOk, menuCount, activeCount, statusLabel, statusTone }
  }, [health, menuItems, dashboardStats.activeOrders.length, isLoading])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetchOrders()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const ordersLoading = isLoading && orders === undefined
  const firstName = activeWaiter?.name?.split(' ')[0]

  return (
    <div className={styles.dashboard}>
      {isError && (
        <div className={styles.errorBanner}>
          <p>Operasyon verileri şu an yüklenemiyor. Lütfen bağlantınızı kontrol edin.</p>
          <button type="button" onClick={() => refetchOrders()}>Yeniden Dene</button>
        </div>
      )}

      <div className={styles.dashboardHeader}>
        <div className={styles.greeting}>
          <div className={styles.greetingMeta}>
            <span className={styles.editionTag}>{DEMO_EDITION.name}</span>
            <span className={styles.productLine}>{DEMO_EDITION.productSubtitle}</span>
          </div>
          <h1>
            {t('dashboard.greeting')}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p>{t('dashboard.todaySummary')}</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.currentTime}>
            <Clock size={16} />
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <button
            type="button"
            className={`${styles.refreshBtn} ${isRefreshing ? styles.spinning : ''}`}
            onClick={handleRefresh}
            aria-label="Yenile"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Bugünkü Gelir</div>
              <div className={styles.statValue}>
                {ordersLoading ? '—' : formatCurrency(dashboardStats.todayRevenue)}
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.revenue}`}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>
            {dashboardStats.todayOrderCount} sipariş bugün
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Aktif Siparişler</div>
              <div className={styles.statValue}>
                {ordersLoading ? '—' : dashboardStats.activeOrders.length}
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.orders}`}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Servis ve mutfak kuyruğu</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Tamamlanan</div>
              <div className={styles.statValue}>
                {ordersLoading ? '—' : dashboardStats.completedToday}
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.completed}`}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Bugün kapatılan siparişler</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Ortalama Sepet</div>
              <div className={styles.statValue}>
                {ordersLoading ? '—' : formatCurrency(dashboardStats.avgOrderValue)}
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.average}`}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Bugünkü sipariş ortalaması</div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div
          className={styles.statCard}
          role="button"
          tabIndex={0}
          onClick={() => navigate('/operations/service-calls')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/operations/service-calls')}
        >
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Açık Servis Talepleri</div>
              <div className={styles.statValue}>{dashboardStats.openServiceCalls.length}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.orders}`}>
              <BellRing size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Hesap ve garson çağrıları</div>
        </div>

        <div className={styles.statCard} onClick={() => navigate('/operations/service-calls')} role="button" tabIndex={0}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Hesap İstekleri</div>
              <div className={styles.statValue}>{dashboardStats.billRequests.length}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.revenue}`}>
              <Receipt size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Ödeme bekleyen masalar</div>
        </div>

        <div className={styles.statCard} onClick={() => navigate('/operations/service-calls')} role="button" tabIndex={0}>
          <div className={styles.statHeader}>
            <div>
              <div className={styles.statLabel}>Bekleyen Müşteriler</div>
              <div className={styles.statValue}>{dashboardStats.waitingCustomers.length}</div>
            </div>
            <div className={`${styles.statIcon} ${styles.completed}`}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.statMeta}>Yanıt bekleyen talepler</div>
        </div>
      </div>

      <div className={styles.opsGrid}>
        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Flame size={18} />
              Mutfak Kuyruğu
            </h3>
            <button type="button" className={styles.sectionAction} onClick={() => navigate('/kitchen')}>
              Mutfak
            </button>
          </div>
          {ordersLoading ? (
            <div className={styles.loadingHint}>Yükleniyor…</div>
          ) : dashboardStats.kitchenQueue.length === 0 ? (
            <EmptyState
              icon={ChefHat}
              title="Kuyruk boş"
              description="Hazırlanmayı bekleyen sipariş bulunmuyor."
            />
          ) : (
            <div className={styles.queueList}>
              {dashboardStats.kitchenQueue.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className={styles.queueItem}
                  onClick={() => navigate('/kitchen')}
                >
                  <span className={styles.queueId}>{formatOrderRef(order) || '—'}</span>
                  <span className={styles.queueMeta}>
                    {(order.items || []).length} ürün · {getTimeAgo(order.createdAt)}
                  </span>
                  <span className={`${styles.queueStatus} ${styles[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Store size={18} />
              Restoran Durumu
            </h3>
          </div>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Operasyon</span>
              <span className={`${styles.statusValue} ${styles[restaurantStatus.statusTone]}`}>
                {restaurantStatus.statusLabel}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Aktif Sipariş</span>
              <span className={styles.statusValue}>
                {ordersLoading ? '—' : restaurantStatus.activeCount}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Menü Ürünü</span>
              <span className={styles.statusValue}>
                {menuLoading ? '—' : restaurantStatus.menuCount}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Platform</span>
              <span className={`${styles.statusValue} ${restaurantStatus.platformOk ? styles.ok : styles.warn}`}>
                {health ? (restaurantStatus.platformOk ? 'Çevrimiçi' : 'Kesinti') : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.column4}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Activity size={18} />
              Son Aktivite
            </h3>
          </div>
          {ordersLoading ? (
            <div className={styles.loadingHint}>Yükleniyor…</div>
          ) : dashboardStats.recentActivity.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aktivite yok"
              description="Sipariş akışı başladığında son hareketler burada görünür."
            />
          ) : (
            <ul className={styles.activityList}>
              {dashboardStats.recentActivity.map((item) => (
                <li key={item.id} className={styles.activityItem}>
                  <span className={styles.activityDot} />
                  <div className={styles.activityBody}>
                    <span className={styles.activityText}>{item.text}</span>
                    <span className={styles.activityTime}>{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.section} ${styles.column7}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Son Siparişler</h3>
            <button type="button" className={styles.sectionAction} onClick={() => navigate('/orders')}>
              Tümünü Gör
            </button>
          </div>

          {ordersLoading ? (
            <div className={styles.loadingHint}>Siparişler yükleniyor…</div>
          ) : dashboardStats.recentOrders.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Henüz sipariş yok"
              description="QR menü veya garson akışından ilk sipariş geldiğinde burada görünecek."
              action={
                <button type="button" className={styles.linkBtn} onClick={() => navigate('/orders')}>
                  Sipariş ekranına git
                </button>
              }
            />
          ) : (
            <div className={styles.ordersList}>
              {dashboardStats.recentOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className={styles.orderItem}
                  onClick={() => navigate('/orders')}
                >
                  <div className={styles.orderTable}>
                    {formatOrderRef(order) || '—'}
                  </div>
                  <div className={styles.orderDetails}>
                    <div className={styles.orderNumber}>
                      {(order.items || []).length} ürün · {formatCurrency(order.total)}
                    </div>
                    <div className={styles.orderItems}>{getTimeAgo(order.createdAt)}</div>
                  </div>
                  <div className={styles.orderMeta}>
                    <div className={`${styles.orderStatus} ${styles[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.section} ${styles.column5}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Popüler Ürünler</h3>
            <button type="button" className={styles.sectionAction} onClick={() => navigate('/menu')}>
              Menü
            </button>
          </div>

          {popularItems.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Satış verisi bekleniyor"
              description="Siparişler işlendikçe en çok satan ürünler burada listelenir."
            />
          ) : (
            <div className={styles.popularList}>
              {popularItems.map((item, index) => (
                <div key={item.id} className={styles.popularItem}>
                  <div className={styles.popularRank}>{index + 1}</div>
                  <div className={styles.popularInfo}>
                    <div className={styles.popularName}>{item.name}</div>
                    <div className={styles.popularCategory}>{item.count} adet satış</div>
                  </div>
                  <div className={styles.popularStats}>
                    <div className={styles.popularRevenue}>{formatCurrency(item.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <SystemHealthPanel compact />
        <div className={styles.quickLinksCard}>
          <h3 className={styles.quickLinksTitle}>Hızlı Erişim</h3>
          <div className={styles.quickLinkGrid}>
            {QUICK_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                className={styles.quickLink}
                onClick={() => navigate(link.path)}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
