import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  QrCode,
  UtensilsCrossed,
  FolderTree,
  Grid3X3,
  Users,
  CalendarDays,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Activity,
  BellRing,
} from 'lucide-react'
import { MODULE_STATUS } from './modules'

/**
 * ERP-style information architecture for Demo Edition sidebar.
 */
export const NAV_SECTIONS = [
  {
    id: 'overview',
    items: [
      {
        path: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        status: MODULE_STATUS.LIVE,
      },
    ],
  },
  {
    id: 'orders',
    label: 'Sipariş Yönetimi',
    items: [
      {
        path: '/orders',
        label: 'Siparişler',
        icon: ClipboardList,
        status: MODULE_STATUS.LIVE,
        badge: 'orders',
      },
      {
        path: '/kitchen',
        label: 'Mutfak',
        icon: ChefHat,
        status: MODULE_STATUS.LIVE,
      },
      {
        path: '/orders/qr',
        label: 'QR Siparişler',
        icon: QrCode,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'qr-orders',
      },
    ],
  },
  {
    id: 'menu',
    label: 'Menü Yönetimi',
    items: [
      {
        path: '/menu/categories',
        label: 'Kategoriler',
        icon: FolderTree,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'categories',
      },
      {
        path: '/menu',
        label: 'Menü Ürünleri',
        icon: UtensilsCrossed,
        status: MODULE_STATUS.LIVE,
      },
    ],
  },
  {
    id: 'restaurant',
    label: 'Restoran',
    items: [
      {
        path: '/restaurant/tables',
        label: 'Masalar',
        icon: Grid3X3,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'tables',
      },
      {
        path: '/restaurant/staff',
        label: 'Personel',
        icon: Users,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'staff',
      },
      {
        path: '/restaurant/reservations',
        label: 'Rezervasyonlar',
        icon: CalendarDays,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'reservations',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operasyonlar',
    items: [
      {
        path: '/operations/service-calls',
        label: 'Servis Merkezi',
        icon: BellRing,
        status: MODULE_STATUS.LIVE,
        badge: 'serviceCalls',
      },
      {
        path: '/operations/inventory',
        label: 'Stok',
        icon: Package,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'inventory',
      },
      {
        path: '/operations/payments',
        label: 'Ödemeler',
        icon: CreditCard,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'payments',
      },
      {
        path: '/operations/reports',
        label: 'Raporlar',
        icon: BarChart3,
        status: MODULE_STATUS.ROADMAP,
        moduleId: 'reports',
      },
    ],
  },
  {
    id: 'system',
    label: 'Sistem',
    items: [
      {
        path: '/system/settings',
        label: 'Ayarlar',
        icon: Settings,
        status: MODULE_STATUS.LIVE,
      },
      {
        path: '/system/health',
        label: 'Sistem Sağlığı',
        icon: Activity,
        status: MODULE_STATUS.LIVE,
      },
    ],
  },
]

const allNavItems = NAV_SECTIONS.flatMap((section) => section.items)

export function findNavItem(pathname) {
  const exact = allNavItems.find((item) => item.path === pathname)
  if (exact) return exact

  return allNavItems.find(
    (item) => item.path !== '/' && pathname.startsWith(item.path),
  )
}

export function getBreadcrumbs(pathname) {
  const crumbs = [{ label: 'Akıllı Garson', path: '/' }]

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.path === pathname) {
        if (section.label) {
          crumbs.push({ label: section.label, path: null })
        }
        crumbs.push({ label: item.label, path: item.path })
        return crumbs
      }
    }
  }

  crumbs.push({ label: 'Dashboard', path: '/' })
  return crumbs
}

export function getPageTitle(pathname) {
  return findNavItem(pathname)?.label || 'Dashboard'
}

export function getAllNavCommands() {
  return allNavItems.map((item) => ({
    path: item.path,
    label: item.label,
    icon: item.icon,
    status: item.status,
  }))
}
