import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Bell,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronRight,
} from 'lucide-react'
import { useActiveOrdersCount } from '../../hooks/useOrders'
import { usePendingServiceCalls } from '../../hooks/useServiceCalls'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useNotifications, NotificationPanel } from '../NotificationProvider'
import { WebSocketStatus } from '../WebSocketStatus'
import { LiveClock } from '../LiveClock'
import { PerformanceMonitor } from '../PerformanceMonitor'
import { usePermissions } from '../../hooks/usePermissions'
import { NAV_SECTIONS, getBreadcrumbs, getPageTitle } from '../../config/navigation'
import { DEMO_EDITION, MODULE_STATUS } from '../../config/modules'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const activeOrdersCount = useActiveOrdersCount()
  const { data: pendingServiceCalls = [] } = usePendingServiceCalls()
  const currentUser = useCurrentUser()
  const logoutMutation = useLogout()
  const { canAccess } = usePermissions()
  const { unreadCount, setShowPanel, showPanel } = useNotifications()

  const breadcrumbs = getBreadcrumbs(location.pathname)
  const pageTitle = getPageTitle(location.pathname)

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
      onSuccess: () => navigate('/login'),
    })
  }

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'orders') return activeOrdersCount
    if (badgeType === 'serviceCalls') return pendingServiceCalls.length
    return 0
  }

  const isItemActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path
  }

  const filterItem = (item) => canAccess(item.path)

  return (
    <div className={styles.layout}>
      {mobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileSidebarOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.sidebarOpen : ''}`}>
        <button
          type="button"
          className={styles.mobileSidebarClose}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <CloseIcon size={20} />
        </button>

        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>AG</div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>{DEMO_EDITION.productName}</span>
            <span className={styles.logoSubtitle}>{DEMO_EDITION.productSubtitle}</span>
            <span className={styles.logoEdition}>{DEMO_EDITION.name}</span>
          </div>
        </div>

        <div className={styles.statusBar}>
          <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
            <span>{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
          </div>
          <WebSocketStatus />
        </div>

        <nav className={styles.nav}>
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter(filterItem)
            if (items.length === 0) return null

            return (
              <div key={section.id} className={styles.navSection}>
                {section.label && (
                  <span className={styles.navLabel}>{section.label}</span>
                )}
                {items.map((item) => {
                  const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
                  const isActive = isItemActive(item.path)
                  const isRoadmap = item.status === MODULE_STATUS.ROADMAP

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`${styles.navItem} ${isActive ? styles.active : ''} ${isRoadmap ? styles.roadmap : ''}`}
                    >
                      <item.icon size={18} className={styles.navIcon} />
                      <span className={styles.navText}>{item.label}</span>
                      {isRoadmap && (
                        <span className={styles.roadmapBadge} title="Yol haritası modülü">
                          Plan
                        </span>
                      )}
                      {badgeCount > 0 && (
                        <span className={styles.navBadge}>{badgeCount}</span>
                      )}
                    </NavLink>
                  )
                })}
                <div className={styles.sectionDivider} />
              </div>
            )
          })}
        </nav>

        <div className={styles.userArea}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {currentUser?.avatar || '👤'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{currentUser?.name || 'Kullanıcı'}</div>
              <div className={styles.userRole}>
                {currentUser?.role === 'manager' ? 'Yönetici' :
                 currentUser?.role === 'waiter' ? 'Garson' : 'Personel'}
              </div>
            </div>
            <div className={styles.userActions}>
              <button
                type="button"
                className={styles.userActionBtn}
                onClick={() => navigate('/system/settings')}
                title="Ayarlar"
              >
                <Settings size={16} />
              </button>
              <button
                type="button"
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

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button
                type="button"
                className={styles.hamburgerBtn}
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Menüyü aç"
              >
                <MenuIcon size={22} />
              </button>

              <div className={styles.headerTitles}>
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb.label}-${index}`} className={styles.breadcrumbItem}>
                      {index > 0 && <ChevronRight size={14} className={styles.breadcrumbSep} />}
                      {crumb.path && index < breadcrumbs.length - 1 ? (
                        <Link to={crumb.path}>{crumb.label}</Link>
                      ) : (
                        <span className={index === breadcrumbs.length - 1 ? styles.breadcrumbCurrent : ''}>
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  ))}
                </nav>
                <h1 className={styles.headerTitle}>{pageTitle}</h1>
              </div>
            </div>

            <div className={styles.headerRight}>
              <span className={styles.demoPill}>{DEMO_EDITION.name}</span>
              <div className={styles.headerClock}>
                <LiveClock />
              </div>
              <button
                type="button"
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
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </main>

      <NotificationPanel />
      {import.meta.env.DEV && <PerformanceMonitor />}
    </div>
  )
}
