import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout/Layout'
import AuthGuard from './components/AuthGuard'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { CommandPalette } from './components/CommandPalette'

// ─── Lazy-loaded staff pages ────────────────────────────────────────────────
const Login        = lazy(() => import('./pages/Login'))
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Tables       = lazy(() => import('./pages/Tables'))
const Menu         = lazy(() => import('./pages/Menu'))
const Orders       = lazy(() => import('./pages/Orders'))
const TableOrder   = lazy(() => import('./pages/TableOrder'))
const Kitchen      = lazy(() => import('./pages/Kitchen'))
const Reservations = lazy(() => import('./pages/Reservations'))
const Analytics    = lazy(() => import('./pages/Analytics'))
const DailyReport  = lazy(() => import('./pages/DailyReport'))
const Waiters      = lazy(() => import('./pages/Waiters'))
const Inventory    = lazy(() => import('./pages/Inventory'))
const Settings     = lazy(() => import('./pages/Settings'))

// ─── Lazy-loaded customer pages ─────────────────────────────────────────────
const CustomerLogin  = lazy(() => import('./pages/customer/CustomerLogin'))
const CustomerMenu   = lazy(() => import('./pages/customer/CustomerMenu'))
const CustomerOrders = lazy(() => import('./pages/customer/CustomerOrders'))

// ─── Page-level loading fallback ────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: 'var(--text-muted)',
      fontSize: '0.9375rem',
      gap: '0.75rem',
    }}>
      <svg
        width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      Yükleniyor…
    </div>
  )
}

function App() {
  return (
    <>
      <KeyboardShortcuts />
      <CommandPalette />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Staff Login */}
            <Route path="/login" element={<Login />} />

            {/* Customer Routes — Public */}
            <Route path="/customer"        element={<CustomerLogin />} />
            <Route path="/customer/menu"   element={<CustomerMenu />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />

            {/* Protected Staff Routes */}
            <Route path="/*" element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/"                      element={<Dashboard />} />
                      <Route path="/tables"                element={<Tables />} />
                      <Route path="/tables/:tableId/order" element={<TableOrder />} />
                      <Route path="/menu"                  element={<Menu />} />
                      <Route path="/orders"                element={<Orders />} />
                      <Route path="/kitchen"               element={<Kitchen />} />
                      <Route path="/reservations"          element={<Reservations />} />
                      <Route path="/analytics"             element={<Analytics />} />
                      <Route path="/daily-report"          element={<DailyReport />} />
                      <Route path="/waiters"               element={<Waiters />} />
                      <Route path="/inventory"             element={<Inventory />} />
                      <Route path="/settings"              element={<Settings />} />
                      <Route path="*"                      element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </AuthGuard>
            } />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

export default App
