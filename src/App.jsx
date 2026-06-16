import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout/Layout'
import AuthGuard from './components/AuthGuard'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tables from './pages/Tables'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import TableOrder from './pages/TableOrder'
import Kitchen from './pages/Kitchen'
import Reservations from './pages/Reservations'
import Analytics from './pages/Analytics'
import Inventory from './pages/Inventory'
import Settings from './pages/Settings'

// Customer Pages
import CustomerLogin from './pages/customer/CustomerLogin'
import CustomerMenu from './pages/customer/CustomerMenu'
import CustomerOrders from './pages/customer/CustomerOrders'

function App() {
  return (
    <>
      <KeyboardShortcuts />
      <AnimatePresence mode="wait">
        <Routes>
        {/* Staff Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Customer Routes - Public */}
        <Route path="/customer" element={<CustomerLogin />} />
        <Route path="/customer/menu" element={<CustomerMenu />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        
        {/* Protected Staff Routes */}
        <Route path="/*" element={
          <AuthGuard>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tables" element={<Tables />} />
                <Route path="/tables/:tableId/order" element={<TableOrder />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthGuard>
        } />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App
