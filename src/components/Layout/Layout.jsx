import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Grid3X3, 
  UtensilsCrossed, 
  ClipboardList,
  Bell,
  Settings,
  ChefHat,
  CalendarDays,
  BarChart3,
  Package,
  LogOut,
  User,
  Menu as MenuIcon,
  X as CloseIcon,
  FileText,
  Users,
} from 'lucide-react'
import { useActiveOrdersCount } from '../../hooks/useOrders'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useTodayReservationsCount } from '../../hooks/useReservations'
import { useNotifications, NotificationPanel } from '../NotificationProvider'
import { WebSocketStatus } from '../WebSocketStatus'
import { LiveClock } from '../LiveClock'
import styles from './Layout.module.css'

const mainNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Anasayfa' },
  { path: '/tables', icon: Grid3X3, label: 'Masalar' },
  { path: '/orders', icon: ClipboardList, label: 'Siparişler', badge: 'orders' },
  { path: '/kitchen', icon: ChefHat, label: 'Mutfak' },
]

const secondaryNavItems = [
  { path: '/menu', icon: UtensilsCrossed, label: 'Menü Yönetimi' },
  { path: '/reservations', icon: CalendarDays, label: 'Rezervasyonlar', badge: 'reservations' },
  { path: '/analytics', icon: BarChart3, label: 'Raporlar' },
  { path: '/daily-report', icon: FileText, label: 'Günlük Rapor' },
  { path: '/waiters', icon: Users, label: 'Garsonlar' },
  { path: '/inventory', icon: Package, label: 'Stok Yönetimi' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Rota değişince mobil sidebar'ı kapat
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])
  
  const activeOrdersCount = useActiveOrdersCount()
  const reservationsCount = useTodayReservationsCount()
  const currentUser = useCurrentUser()
  const logoutMutation = useLogout()
  const { unreadCount, setShowPanel, showPanel } = useNotifications()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login')
    })
  }

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'orders') return activeOrdersCount
    if (badgeType === 'reservations') return reservationsCount
    return 0
  }

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Mobile close button */}
        <button className={styles.mobileSidebarClose} onClick={() => setMobileSidebarOpen(false)}>
          <CloseIcon size={20} />
        </button>
        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            🍽️
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Akıllı Garson</span>
            <span className={styles.logoVersion}>POS v2.1</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className={styles.statusBar}>
          <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
            <span>{isOnline ? 'Bağlı' : 'Çevrimdışı'}</span>
          </div>
          <WebSocketStatus />
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* Main Nav */}
          <div className={styles.navSection}>
            <span className={styles.navLabel}>İşlemler</span>
            {mainNavItems.map((item) => {
              const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
              const isActive = location.pathname === item.path
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={styles.navBadge}>{badgeCount}</span>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Secondary Nav */}
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Yönetim</span>
            {secondaryNavItems.map((item) => {
              const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
              const isActive = location.pathname === item.path
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={styles.navBadge}>{badgeCount}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* User Area */}
        <div className={styles.userArea}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {currentUser?.avatar || '👤'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {currentUser?.name || 'Kullanıcı'}
              </div>
              <div className={styles.userRole}>
                {currentUser?.shift === 'morning' ? '☀️ Sabah' : '🌙 Akşam'}
              </div>
            </div>
            <div className={styles.userActions}>
              <button 
                className={styles.userActionBtn}
                onClick={() => navigate('/settings')}
                title="Ayarlar"
              >
                <Settings size={16} />
              </button>
              <button 
                className={styles.userActionBtn}
                onClick={handleLogout}
                title="Çıkış"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              {/* Hamburger menu — only on mobile */}
              <button
                className={styles.hamburgerBtn}
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Menüyü aç"
              >
                <MenuIcon size={22} />
              </button>
              <h1 className={styles.headerTitle}>
                {mainNavItems.find(i => i.path === location.pathname)?.label ||
                 secondaryNavItems.find(i => i.path === location.pathname)?.label ||
                 'Dashboard'}
              </h1>
            </div>

            <div className={styles.headerRight}>
              {/* Live Clock */}
              <div className={styles.headerClock}>
                <LiveClock />
              </div>

              {/* Notifications */}
              <button
                className={styles.headerAction}
                onClick={() => setShowPanel(!showPanel)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className={styles.headerActionBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User */}
              <button className={styles.headerAction}>
                <User size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
      
      {/* Notification Panel */}
      <NotificationPanel />
    </div>
  )
}
