import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout/Layout'
import AuthGuard from './components/AuthGuard'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { CommandPalette } from './components/CommandPalette'

const Login            = lazy(() => import('./pages/Login'))
const Dashboard        = lazy(() => import('./pages/Dashboard'))
const Menu             = lazy(() => import('./pages/Menu'))
const Orders           = lazy(() => import('./pages/Orders'))
const Kitchen          = lazy(() => import('./pages/Kitchen'))
const Settings         = lazy(() => import('./pages/Settings'))
const RoadmapPage      = lazy(() => import('./pages/RoadmapPage'))
const SystemHealthPage = lazy(() => import('./pages/SystemHealthPage'))

const CustomerLogin  = lazy(() => import('./pages/customer/CustomerLogin'))
const CustomerMenu   = lazy(() => import('./pages/customer/CustomerMenu'))
const CustomerOrders = lazy(() => import('./pages/customer/CustomerOrders'))
const CustomerThankYou = lazy(() => import('./pages/customer/CustomerThankYou'))
const ServiceCalls = lazy(() => import('./pages/ServiceCalls'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
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
            <Route path="/login" element={<Login />} />

            <Route path="/customer" element={<CustomerLogin />} />
            <Route path="/customer/menu" element={<CustomerMenu />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/thank-you" element={<CustomerThankYou />} />

            <Route path="/*" element={
              <AuthGuard>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />

                      <Route path="/orders" element={<Orders />} />
                      <Route path="/kitchen" element={<Kitchen />} />
                      <Route path="/orders/qr" element={<RoadmapPage moduleId="qr-orders" />} />

                      <Route path="/menu" element={<Menu />} />
                      <Route path="/menu/categories" element={<RoadmapPage moduleId="categories" />} />

                      <Route path="/restaurant/tables" element={<RoadmapPage moduleId="tables" />} />
                      <Route path="/restaurant/staff" element={<RoadmapPage moduleId="staff" />} />
                      <Route path="/restaurant/reservations" element={<RoadmapPage moduleId="reservations" />} />

                      <Route path="/operations/service-calls" element={<ServiceCalls />} />
                      <Route path="/operations/inventory" element={<RoadmapPage moduleId="inventory" />} />
                      <Route path="/operations/payments" element={<RoadmapPage moduleId="payments" />} />
                      <Route path="/operations/reports" element={<RoadmapPage moduleId="reports" />} />

                      <Route path="/system/settings" element={<Settings />} />
                      <Route path="/system/health" element={<SystemHealthPage />} />

                      <Route path="/settings" element={<Navigate to="/system/settings" replace />} />
                      <Route path="/tables" element={<Navigate to="/restaurant/tables" replace />} />
                      <Route path="/waiters" element={<Navigate to="/restaurant/staff" replace />} />
                      <Route path="/reservations" element={<Navigate to="/restaurant/reservations" replace />} />
                      <Route path="/inventory" element={<Navigate to="/operations/inventory" replace />} />
                      <Route path="/analytics" element={<Navigate to="/operations/reports" replace />} />
                      <Route path="/daily-report" element={<Navigate to="/operations/reports" replace />} />

                      <Route path="*" element={<Navigate to="/" replace />} />
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
