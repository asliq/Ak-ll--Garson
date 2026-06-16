import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/services'
import styles from './RealtimeChart.module.css'

export function RealtimeChart() {
  const [dataPoints, setDataPoints] = useState([])
  const [trend, setTrend] = useState(0)
  const previousTotal = useRef(0)

  // Poll for orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-realtime'],
    queryFn: api.orders.getAll,
    refetchInterval: 5000
  })

  // Update chart data
  useEffect(() => {
    if (!orders) return

    const now = new Date()
    const currentTotal = orders.length

    // Calculate trend
    const diff = currentTotal - previousTotal.current
    setTrend(diff)
    previousTotal.current = currentTotal

    // Add new data point
    setDataPoints(prev => {
      const newPoints = [...prev, {
        time: now,
        value: orders.filter(o => o.status !== 'completed').length,
        total: currentTotal
      }]
      
      // Keep last 20 points
      return newPoints.slice(-20)
    })
  }, [orders])

  // Calculate chart dimensions
  const maxValue = Math.max(...dataPoints.map(d => d.value), 1)
  const chartWidth = 100
  const chartHeight = 50

  // Generate path
  const generatePath = () => {
    if (dataPoints.length < 2) return ''
    
    const points = dataPoints.map((d, i) => ({
      x: (i / (dataPoints.length - 1)) * chartWidth,
      y: chartHeight - (d.value / maxValue) * chartHeight
    }))

    // Create smooth curve
    let path = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3
      const cp1y = points[i - 1].y
      const cp2x = points[i - 1].x + 2 * (points[i].x - points[i - 1].x) / 3
      const cp2y = points[i].y
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`
    }

    return path
  }

  // Generate area path
  const generateAreaPath = () => {
    const linePath = generatePath()
    if (!linePath) return ''
    return `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
  }

  const currentValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 0
  const previousValue = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2].value : 0
  const changePercent = previousValue > 0 
    ? Math.round(((currentValue - previousValue) / previousValue) * 100)
    : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={14} />
          <span>Canlı Aktivite</span>
        </div>
        <div className={styles.status}>
          <span className={styles.live}>
            <span className={styles.liveDot}></span>
            CANLI
          </span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className={styles.chart}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1={0}
              y1={chartHeight * (percent / 100)}
              x2={chartWidth}
              y2={chartHeight * (percent / 100)}
              className={styles.gridLine}
            />
          ))}

          {/* Area fill */}
          <motion.path
            d={generateAreaPath()}
            className={styles.areaFill}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Line */}
          <motion.path
            d={generatePath()}
            className={styles.line}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Current point */}
          {dataPoints.length > 0 && (
            <circle
              cx={chartWidth}
              cy={chartHeight - (currentValue / maxValue) * chartHeight}
              r={3}
              className={styles.currentPoint}
            />
          )}
        </svg>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{currentValue}</span>
          <span className={styles.statLabel}>Aktif Sipariş</span>
        </div>
        
        <div className={styles.stat}>
          <span className={`${styles.statValue} ${trend > 0 ? styles.up : trend < 0 ? styles.down : ''}`}>
            {trend > 0 ? (
              <><TrendingUp size={14} /> +{trend}</>
            ) : trend < 0 ? (
              <><TrendingDown size={14} /> {trend}</>
            ) : (
              <>—</>
            )}
          </span>
          <span className={styles.statLabel}>Son 5s</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {orders?.length || 0}
          </span>
          <span className={styles.statLabel}>Toplam</span>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <RefreshCw size={16} className={styles.spin} />
        </div>
      )}
    </div>
  )
}

