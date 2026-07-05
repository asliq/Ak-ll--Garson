import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Printer,
  BarChart2,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Download,
  Tag,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { useOrders } from '../hooks/useOrders'
import { useMenuItems, useCategories } from '../hooks/useMenu'
import styles from './DailyReport.module.css'

const formatCurrency = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(v)

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#0284c7', '#dc2626', '#ca8a04']

function printReport(data, date) {
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Günlük Rapor — ${date}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
      .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
      .stat { border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
      .stat strong { font-size: 20px; display: block; }
      .stat span { font-size: 12px; color: #666; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      th { border-bottom: 2px solid #ddd; text-align: left; padding: 8px; font-size: 13px; }
      td { border-bottom: 1px solid #f0f0f0; padding: 8px; font-size: 13px; }
      .footer { text-align: center; color: #666; font-size: 12px; margin-top: 32px; }
    </style>
  </head><body>
    <h1>Günlük Rapor</h1>
    <p class="subtitle">${date} • Lezzet Durağı</p>
    <div class="stats">
      <div class="stat"><strong>${formatCurrency(data.totalRevenue)}</strong><span>Toplam Gelir</span></div>
      <div class="stat"><strong>${data.totalOrders}</strong><span>Sipariş Sayısı</span></div>
      <div class="stat"><strong>${formatCurrency(data.avgOrder)}</strong><span>Ort. Sipariş</span></div>
      <div class="stat"><strong>${data.cancelledOrders}</strong><span>İptal</span></div>
    </div>
    <h2>En Çok Satan Ürünler</h2>
    <table>
      <tr><th>Ürün</th><th>Adet</th><th>Gelir</th></tr>
      ${data.topItems.map(i => `<tr><td>${i.name}</td><td>${i.count}</td><td>${formatCurrency(i.revenue)}</td></tr>`).join('')}
    </table>
    <h2>Ödeme Yöntemleri</h2>
    <table>
      <tr><th>Yöntem</th><th>İşlem</th><th>Tutar</th></tr>
      ${data.paymentBreakdown.map(p => `<tr><td>${p.name}</td><td>${p.count}</td><td>${formatCurrency(p.total)}</td></tr>`).join('')}
    </table>
    <p class="footer">Akıllı Garson — Restaurant Management Platform · ${new Date().toLocaleString('tr-TR')}</p>
  </body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

function exportCSV(data, date) {
  const rows = [
    ['Günlük Rapor', date],
    [],
    ['Metrik', 'Değer'],
    ['Toplam Gelir', data.totalRevenue],
    ['Toplam Sipariş', data.totalOrders],
    ['Tamamlanan', data.completedOrders],
    ['Ort. Sipariş', data.avgOrder],
    ['İptal', data.cancelledOrders],
    [],
    ['En Çok Satan Ürünler'],
    ['Ürün', 'Adet', 'Gelir'],
    ...data.topItems.map(i => [i.name, i.count, i.revenue]),
    [],
    ['Kategori Satışları'],
    ['Kategori', 'Adet', 'Gelir'],
    ...data.categorySales.map(c => [c.name, c.count, c.revenue]),
    [],
    ['Ödeme Yöntemleri'],
    ['Yöntem', 'İşlem', 'Tutar'],
    ...data.paymentBreakdown.map(p => [p.name, p.count, p.total]),
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gunluk-rapor-${date.replace(/\s/g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function DailyReport() {
  const today = new Date().toDateString()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

  const { data: orders, isLoading } = useOrders()
  const { data: menuItems } = useMenuItems()
  const { data: categories } = useCategories()

  const stats = useMemo(() => {
    if (!orders) return null

    const filterDate = new Date(selectedDate).toDateString()
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === filterDate)

    const completed = dayOrders.filter(o => o.status === 'completed')
    const cancelled = dayOrders.filter(o => o.status === 'cancelled')
    const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0)
    const avgOrder = completed.length ? totalRevenue / completed.length : 0

    // Saatlik dağılım
    const hourly = Array.from({ length: 24 }, (_, h) => {
      const h_orders = completed.filter(o => new Date(o.createdAt).getHours() === h)
      return {
        hour: `${String(h).padStart(2, '0')}:00`,
        sipariş: h_orders.length,
        gelir: h_orders.reduce((s, o) => s + (o.total || 0), 0),
      }
    }).filter(h => h.sipariş > 0)

    // En çok satan ürünler
    const itemCountMap = {}
    const itemRevenueMap = {}
    completed.forEach(o => {
      o.items?.forEach(i => {
        const key = i.menuItemId
        itemCountMap[key] = (itemCountMap[key] || 0) + i.quantity
        itemRevenueMap[key] = (itemRevenueMap[key] || 0) + i.price * i.quantity
      })
    })

    const topItems = Object.entries(itemCountMap)
      .map(([id, count]) => {
        const mi = menuItems?.find(m => m.id === parseInt(id))
        return {
          id,
          name: mi?.name || `Ürün #${id}`,
          count,
          revenue: itemRevenueMap[id] || 0,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)

    // Ödeme yöntemi dağılımı
    const paymentMap = {}
    completed.forEach(o => {
      const m = o.paymentMethod || 'other'
      if (!paymentMap[m]) paymentMap[m] = { count: 0, total: 0 }
      paymentMap[m].count += 1
      paymentMap[m].total += o.total || 0
    })

    const paymentLabels = { cash: 'Nakit', card: 'Kart', online: 'Online', other: 'Diğer' }
    const paymentBreakdown = Object.entries(paymentMap).map(([k, v]) => ({
      name: paymentLabels[k] || k,
      count: v.count,
      total: v.total,
    }))

    const pieData = paymentBreakdown.map(p => ({ name: p.name, value: p.total }))

    // Kategori satışları
    const catMap = {}
    completed.forEach(o => {
      o.items?.forEach(i => {
        const mi = menuItems?.find(m => m.id == i.menuItemId)
        const catId = mi?.categoryId || 'other'
        if (!catMap[catId]) catMap[catId] = { count: 0, revenue: 0 }
        catMap[catId].count += i.quantity
        catMap[catId].revenue += i.price * i.quantity
      })
    })
    const categorySales = Object.entries(catMap)
      .map(([catId, v]) => {
        const cat = categories?.find(c => c.id == catId)
        return { name: cat?.name || 'Diğer', count: v.count, revenue: v.revenue }
      })
      .sort((a, b) => b.revenue - a.revenue)

    return {
      totalRevenue,
      totalOrders: dayOrders.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      avgOrder,
      hourly,
      topItems,
      paymentBreakdown,
      pieData,
      categorySales,
    }
  }, [orders, menuItems, categories, selectedDate])

  const dateLabel = new Date(selectedDate).toLocaleDateString('tr-TR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (isLoading) return <div className={styles.loading}>Yükleniyor…</div>

  return (
    <motion.div className={styles.page} variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className={styles.pageHeader}>
        <div>
          <h1>Günlük Rapor</h1>
          <p>{dateLabel}</p>
        </div>
        <div className={styles.headerActions}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className={styles.datePicker}
          />
          <button
            className={styles.csvBtn}
            onClick={() => stats && exportCSV(stats, dateLabel)}
          >
            <Download size={18} />
            CSV
          </button>
          <button
            className={styles.printBtn}
            onClick={() => stats && printReport(stats, dateLabel)}
          >
            <Printer size={18} />
            Yazdır / PDF
          </button>
        </div>
      </motion.div>

      {!stats ? (
        <div className={styles.noData}>Bu tarih için veri bulunamadı.</div>
      ) : (
        <>
          {/* KPI Kartları */}
          <motion.div variants={item} className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles.blue}`}><TrendingUp size={22} /></div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Toplam Gelir</span>
                <strong className={styles.kpiValue}>{formatCurrency(stats.totalRevenue)}</strong>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles.green}`}><ShoppingBag size={22} /></div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Toplam Sipariş</span>
                <strong className={styles.kpiValue}>{stats.totalOrders}</strong>
                <span className={styles.kpiSub}>{stats.completedOrders} tamamlandı</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles.purple}`}><DollarSign size={22} /></div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Ort. Sipariş</span>
                <strong className={styles.kpiValue}>{formatCurrency(stats.avgOrder)}</strong>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles.red}`}><Users size={22} /></div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>İptal</span>
                <strong className={styles.kpiValue}>{stats.cancelledOrders}</strong>
              </div>
            </div>
          </motion.div>

          <div className={styles.chartsRow}>
            {/* Saatlik Dağılım */}
            <motion.div variants={item} className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <Clock size={18} />
                <h3>Saatlik Sipariş Dağılımı</h3>
              </div>
              {stats.hourly.length === 0 ? (
                <div className={styles.noChartData}>Bu tarihte tamamlanmış sipariş yok</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.hourly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v, n) => n === 'gelir' ? [formatCurrency(v), 'Gelir'] : [v, 'Sipariş']}
                    />
                    <Bar dataKey="sipariş" fill="var(--primary)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Ödeme Yöntemi Dağılımı */}
            <motion.div variants={item} className={styles.chartCard}>
              <div className={styles.chartCardHeader}>
                <CreditCard size={18} />
                <h3>Ödeme Yöntemleri</h3>
              </div>
              {stats.pieData.length === 0 ? (
                <div className={styles.noChartData}>Bu tarihte tamamlanmış sipariş yok</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%" cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={v => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          <div className={styles.tablesRow}>
            {/* En Çok Satan Ürünler */}
            <motion.div variants={item} className={styles.tableCard}>
              <div className={styles.tableCardHeader}>
                <BarChart2 size={18} />
                <h3>En Çok Satan Ürünler</h3>
              </div>
              {stats.topItems.length === 0 ? (
                <div className={styles.noChartData}>Veri yok</div>
              ) : (
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ürün</th>
                      <th>Adet</th>
                      <th>Gelir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topItems.map((it, i) => (
                      <tr key={it.id}>
                        <td className={styles.rankCell}>{i + 1}</td>
                        <td>{it.name}</td>
                        <td><span className={styles.countBadge}>{it.count}</span></td>
                        <td className={styles.revenueCell}>{formatCurrency(it.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>

            {/* Ödeme Özeti */}
            <motion.div variants={item} className={styles.tableCard}>
              <div className={styles.tableCardHeader}>
                <Banknote size={18} />
                <h3>Ödeme Özeti</h3>
              </div>
              {stats.paymentBreakdown.length === 0 ? (
                <div className={styles.noChartData}>Veri yok</div>
              ) : (
                <table className={styles.reportTable}>
                  <thead>
                    <tr>
                      <th>Yöntem</th>
                      <th>İşlem</th>
                      <th>Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.paymentBreakdown.map(p => (
                      <tr key={p.name}>
                        <td>
                          <span className={styles.payMethodChip}>
                            {p.name === 'Nakit' ? <Banknote size={14} /> :
                             p.name === 'Kart' ? <CreditCard size={14} /> :
                             <Smartphone size={14} />}
                            {p.name}
                          </span>
                        </td>
                        <td>{p.count}</td>
                        <td className={styles.revenueCell}>{formatCurrency(p.total)}</td>
                      </tr>
                    ))}
                    <tr className={styles.totalRow}>
                      <td><strong>Toplam</strong></td>
                      <td><strong>{stats.completedOrders}</strong></td>
                      <td className={styles.revenueCell}>
                        <strong>{formatCurrency(stats.totalRevenue)}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </motion.div>

            {/* Kategori Satışları */}
            <motion.div variants={item} className={`${styles.tableCard} ${styles.fullWidth}`}>
              <div className={styles.tableCardHeader}>
                <Tag size={18} />
                <h3>Kategori Satışları</h3>
              </div>
              {stats.categorySales.length === 0 ? (
                <div className={styles.noChartData}>Veri yok</div>
              ) : (
                <table className={styles.reportTable}>
                  <thead>
                    <tr><th>Kategori</th><th>Adet</th><th>Gelir</th></tr>
                  </thead>
                  <tbody>
                    {stats.categorySales.map(c => (
                      <tr key={c.name}>
                        <td>{c.name}</td>
                        <td><span className={styles.countBadge}>{c.count}</span></td>
                        <td className={styles.revenueCell}>{formatCurrency(c.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  )
}
