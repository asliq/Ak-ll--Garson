 import { useState, useMemo } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Calendar,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { useOrders } from '../hooks/useOrders'
import { useMenuItems } from '../hooks/useMenu'
import styles from './Analytics.module.css'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(value)
}

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#8b5cf6', '#0284c7']

export default function Analytics() {
  const [period, setPeriod] = useState('week')
  const { data: orders } = useOrders()
  const { data: menuItems } = useMenuItems()

  // Günlük satış verileri
  const dailySales = useMemo(() => {
    if (!orders) return []
    
    const salesByDate = {}
    const now = new Date()
    const daysToShow = period === 'week' ? 7 : period === 'month' ? 30 : 90

    // Son X gün için sıfır değerler
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateKey = date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
      salesByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 }
    }

    // Siparişleri grupla
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt)
      const dateKey = orderDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
      
      if (salesByDate[dateKey]) {
        salesByDate[dateKey].revenue += order.total
        salesByDate[dateKey].orders += 1
      }
    })

    return Object.values(salesByDate)
  }, [orders, period])

  // Saatlik analiz
  const hourlySales = useMemo(() => {
    if (!orders) return []

    const salesByHour = Array(24).fill(0).map((_, i) => ({ 
      hour: `${i}:00`, 
      orders: 0 
    }))

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours()
      salesByHour[hour].orders += 1
    })

    return salesByHour.filter(h => h.orders > 0)
  }, [orders])

  // En çok satan ürünler
  const topProducts = useMemo(() => {
    if (!orders || !menuItems) return []

    const productSales = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.menuItemId]) {
          productSales[item.menuItemId] = {
            quantity: 0,
            revenue: 0
          }
        }
        productSales[item.menuItemId].quantity += item.quantity
        productSales[item.menuItemId].revenue += item.price * item.quantity
      })
    })

    return Object.entries(productSales)
      .map(([id, data]) => {
        const product = menuItems.find(m => m.id === parseInt(id))
        return product ? {
          name: product.name,
          ...data
        } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [orders, menuItems])

  // Özet istatistikler
  const stats = useMemo(() => {
    if (!orders) return { totalRevenue: 0, totalOrders: 0, avgOrder: 0, totalCustomers: 0 }

    const total = orders.reduce((sum, o) => sum + o.total, 0)
    const count = orders.length
    const customers = new Set(orders.map(o => o.tableId)).size

    return {
      totalRevenue: total,
      totalOrders: count,
      avgOrder: count > 0 ? total / count : 0,
      totalCustomers: customers
    }
  }, [orders])

  return (
    <div className={styles.analytics}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Raporlar ve Analitik</h1>
          <p>İşletme performansınızı takip edin</p>
        </div>
        <div className={styles.headerActions}>
          <select 
            className={styles.periodSelect}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="week">Son 7 Gün</option>
            <option value="month">Son 30 Gün</option>
            <option value="quarter">Son 90 Gün</option>
          </select>
          <button className={styles.exportBtn}>
            <Download size={18} />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#2563eb' }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Toplam Gelir</div>
            <div className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
            <div className={styles.statChange}>
              <TrendingUp size={14} />
              +12.5%
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Toplam Sipariş</div>
            <div className={styles.statValue}>{stats.totalOrders}</div>
            <div className={styles.statChange}>
              <TrendingUp size={14} />
              +8.2%
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#ffedd5', color: '#ea580c' }}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Ort. Sipariş</div>
            <div className={styles.statValue}>{formatCurrency(stats.avgOrder)}</div>
            <div className={styles.statChange}>
              <TrendingUp size={14} />
              +5.1%
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Müşteri Sayısı</div>
            <div className={styles.statValue}>{stats.totalCustomers}</div>
            <div className={styles.statChange}>
              <TrendingUp size={14} />
              +15.3%
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Gelir Trendi</h3>
            <Calendar size={18} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${value}₺`}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Gelir"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Sipariş Sayısı</h3>
            <ShoppingBag size={18} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="orders" 
                fill="#16a34a" 
                name="Sipariş"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Yoğun Saatler</h3>
            <Clock size={18} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="hour" 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-sub)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
              />
              <Bar 
                dataKey="orders" 
                fill="#ea580c" 
                name="Sipariş"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>En Çok Satan Ürünler</h3>
            <BarChart3 size={18} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProducts}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.name}
              >
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)'
                }}
                formatter={(value) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className={styles.tableCard}>
        <h3>En Çok Satan Ürünler</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Ürün Adı</th>
              <th>Adet</th>
              <th>Gelir</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td>
                  <div className={styles.rank}>#{index + 1}</div>
                </td>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td>{product.quantity}x</td>
                <td>
                  <strong>{formatCurrency(product.revenue)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
