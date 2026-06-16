import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  QrCode, 
  Hash, 
  ArrowRight, 
  Utensils,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useTables } from '../../hooks/useTables'
import { useAppStore } from '../../store/useAppStore'
import styles from './CustomerLogin.module.css'

export default function CustomerLogin() {
  const navigate = useNavigate()
  const [tableNumber, setTableNumber] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { data: tables } = useTables()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!tableNumber) {
      setError('Lütfen masa numarasını girin')
      return
    }

    setIsLoading(true)
    
    // Masa kontrolü
    const table = tables?.find(t => t.number === parseInt(tableNumber))
    
    setTimeout(() => {
      if (!table) {
        setError('Bu masa numarası bulunamadı')
        setIsLoading(false)
        return
      }

      // Müşteri oturumunu localStorage'a kaydet
      localStorage.setItem('customerTable', JSON.stringify({
        tableId: table.id,
        tableNumber: table.number,
        section: table.section,
        capacity: table.capacity,
        sessionStart: new Date().toISOString()
      }))

      setIsLoading(false)
      navigate(`/customer/menu`)
    }, 500)
  }

  const handleQuickSelect = (num) => {
    setTableNumber(num.toString())
  }

  return (
    <div className={styles.container}>
      {/* Background */}
      <div className={styles.background}>
        <div className={styles.gradient1} />
        <div className={styles.gradient2} />
      </div>

      {/* Hero Section */}
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.logoWrapper}>
          <motion.div 
            className={styles.logo}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <Utensils size={48} />
          </motion.div>
        </div>
        <h1>Hoş Geldiniz!</h1>
        <p>Masanızdan kolayca sipariş verin</p>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.cardHeader}>
          <QrCode size={24} />
          <h2>Masa Girişi</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>
              <Hash size={18} />
              <span>Masa Numarası</span>
            </label>
            <input
              type="number"
              placeholder="Örn: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              min="1"
              max="99"
              autoFocus
            />
          </div>

          {/* Quick Select */}
          <div className={styles.quickSelect}>
            <span>Hızlı Seçim:</span>
            <div className={styles.quickButtons}>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`${styles.quickBtn} ${tableNumber === num.toString() ? styles.active : ''}`}
                  onClick={() => handleQuickSelect(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div 
              className={styles.error}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <span>Menüye Git</span>
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div className={styles.info}>
          <p>💡 Masa numaranızı masanızdaki etiketten bulabilirsiniz</p>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div 
        className={styles.features}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={styles.feature}>
          <span>📱</span>
          <p>Kolay Sipariş</p>
        </div>
        <div className={styles.feature}>
          <span>⚡</span>
          <p>Hızlı Servis</p>
        </div>
        <div className={styles.feature}>
          <span>💳</span>
          <p>Güvenli Ödeme</p>
        </div>
      </motion.div>
    </div>
  )
}

