import { useState, useEffect } from 'react'
import { Clock, Calendar, Wifi, WifiOff, Activity } from 'lucide-react'
import styles from './LiveClock.module.css'

export function LiveClock() {
  const [time, setTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [ping, setPing] = useState(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Monitor online status
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

  // Measure ping to API
  useEffect(() => {
    const measurePing = async () => {
      const start = performance.now()
      try {
        await fetch('http://localhost:3001/tables', { method: 'HEAD' })
        const end = performance.now()
        setPing(Math.round(end - start))
      } catch {
        setPing(null)
      }
    }
    
    measurePing()
    const interval = setInterval(measurePing, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const getPingStatus = () => {
    if (ping === null) return 'offline'
    if (ping < 50) return 'excellent'
    if (ping < 150) return 'good'
    return 'slow'
  }

  return (
    <div className={styles.container}>
      {/* Time Display */}
      <div className={styles.timeSection}>
        <div className={styles.time}>
          <span className={styles.hours}>{formatTime(time).split(':')[0]}</span>
          <span className={styles.separator}>:</span>
          <span className={styles.minutes}>{formatTime(time).split(':')[1]}</span>
          <span className={styles.seconds}>:{formatTime(time).split(':')[2]}</span>
        </div>
        <div className={styles.date}>
          <Calendar size={12} />
          <span>{formatDate(time)}</span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className={styles.statusSection}>
        <div className={`${styles.indicator} ${styles[getPingStatus()]}`}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{ping !== null ? `${ping}ms` : 'Offline'}</span>
        </div>
        
        <div className={`${styles.indicator} ${styles.active}`}>
          <Activity size={12} />
          <span className={styles.pulse}></span>
        </div>
      </div>
    </div>
  )
}

