import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Clock,
  Database,
  MemoryStick
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import styles from './PerformanceMonitor.module.css'

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    cacheSize: 0,
    queryCount: 0,
    responseTime: 0,
    uptime: 0
  })
  const [isExpanded, setIsExpanded] = useState(false)
  const queryClient = useQueryClient()
  const startTime = useState(() => Date.now())[0]

  // FPS Counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId

    const countFrames = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(countFrames)
    }
    
    animationId = requestAnimationFrame(countFrames)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Memory & Query metrics
  useEffect(() => {
    const updateMetrics = () => {
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      
      // Calculate cache size (approximate)
      let cacheSize = 0
      queries.forEach(query => {
        try {
          const dataSize = JSON.stringify(query.state.data || {}).length
          cacheSize += dataSize
        } catch {
          // Ignore circular references
        }
      })

      // Memory (if available)
      let memoryUsage = 0
      if (performance.memory) {
        memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576)
      }

      // Uptime
      const uptime = Math.floor((Date.now() - startTime) / 1000)

      setMetrics(prev => ({
        ...prev,
        memory: memoryUsage,
        cacheSize: Math.round(cacheSize / 1024), // KB
        queryCount: queries.length,
        uptime
      }))
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 2000)
    return () => clearInterval(interval)
  }, [queryClient, startTime])

  // API Response Time
  useEffect(() => {
    const measureResponse = async () => {
      const start = performance.now()
      try {
        await fetch('http://localhost:3001/tables')
        const end = performance.now()
        setMetrics(prev => ({ ...prev, responseTime: Math.round(end - start) }))
      } catch {
        setMetrics(prev => ({ ...prev, responseTime: -1 }))
      }
    }

    measureResponse()
    const interval = setInterval(measureResponse, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}s ${mins}d`
    if (mins > 0) return `${mins}d ${secs}s`
    return `${secs}s`
  }

  const getFPSStatus = (fps) => {
    if (fps >= 55) return 'excellent'
    if (fps >= 30) return 'good'
    return 'poor'
  }

  const getResponseStatus = (time) => {
    if (time < 0) return 'offline'
    if (time < 100) return 'excellent'
    if (time < 300) return 'good'
    return 'slow'
  }

  return (
    <motion.div 
      className={`${styles.container} ${isExpanded ? styles.expanded : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
      layout
    >
      {/* Compact View */}
      <div className={styles.compactView}>
        <div className={styles.indicator}>
          <Activity size={12} />
          <span className={styles[getFPSStatus(metrics.fps)]}>{metrics.fps}</span>
          <span className={styles.label}>FPS</span>
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.indicator}>
          <Database size={12} />
          <span>{metrics.queryCount}</span>
          <span className={styles.label}>Cache</span>
        </div>
        
        <div className={styles.divider} />
        
        <div className={styles.indicator}>
          <Zap size={12} />
          <span className={styles[getResponseStatus(metrics.responseTime)]}>
            {metrics.responseTime > 0 ? `${metrics.responseTime}ms` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <motion.div 
          className={styles.expandedView}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className={styles.metricRow}>
            <div className={styles.metricItem}>
              <Cpu size={14} className={styles.metricIcon} />
              <div className={styles.metricInfo}>
                <span className={styles.metricValue}>
                  {metrics.fps} FPS
                  {metrics.fps >= 55 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                </span>
                <span className={styles.metricLabel}>Render Performance</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <MemoryStick size={14} className={styles.metricIcon} />
              <div className={styles.metricInfo}>
                <span className={styles.metricValue}>{metrics.memory} MB</span>
                <span className={styles.metricLabel}>Bellek Kullanımı</span>
              </div>
            </div>
          </div>

          <div className={styles.metricRow}>
            <div className={styles.metricItem}>
              <Database size={14} className={styles.metricIcon} />
              <div className={styles.metricInfo}>
                <span className={styles.metricValue}>{metrics.queryCount} Sorgu</span>
                <span className={styles.metricLabel}>{metrics.cacheSize} KB Cache</span>
              </div>
            </div>
            
            <div className={styles.metricItem}>
              <Wifi size={14} className={styles.metricIcon} />
              <div className={styles.metricInfo}>
                <span className={styles.metricValue}>
                  {metrics.responseTime > 0 ? `${metrics.responseTime}ms` : 'Offline'}
                </span>
                <span className={styles.metricLabel}>API Yanıt</span>
              </div>
            </div>
          </div>

          <div className={styles.uptimeBar}>
            <Clock size={12} />
            <span>Çalışma Süresi: {formatUptime(metrics.uptime)}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

