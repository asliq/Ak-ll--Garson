import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChefHat, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useLogin } from '../hooks/useAuth'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', pin: '' })
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  
  const loginMutation = useLogin()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email || !formData.pin) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    loginMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/')
      },
      onError: (err) => {
        setError(err.message || 'Giriş başarısız')
      }
    })
  }

  const handleQuickLogin = (email) => {
    setFormData({ email, pin: '1234' })
  }

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
        <div className={`${styles.blob} ${styles.blob3}`} />
        <div className={styles.pattern} />
      </div>

      {/* Login Card */}
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div 
          className={styles.logo}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className={styles.logoIcon}>
            <ChefHat size={40} />
          </div>
          <h1>Akıllı Garson</h1>
          <p>Restoran Yönetim Sistemi</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email Input */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email">
              <User size={18} />
              <span>E-posta</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                placeholder="ornek@restaurant.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </motion.div>

          {/* PIN Input */}
          <motion.div 
            className={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="pin">
              <Lock size={18} />
              <span>PIN Kodu</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                placeholder="••••"
                maxLength={4}
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className={styles.togglePin}
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className={styles.error}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loginMutation.isPending}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Giriş Yap</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Quick Login (Demo) */}
        <motion.div 
          className={styles.quickLogin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Hızlı Giriş (Demo)</p>
          <div className={styles.quickUsers}>
            <button 
              type="button"
              onClick={() => handleQuickLogin('ahmet@restaurant.com')}
              className={styles.quickUser}
            >
              <span className={styles.avatar}>👨‍🍳</span>
              <span>Ahmet</span>
            </button>
            <button 
              type="button"
              onClick={() => handleQuickLogin('ayse@restaurant.com')}
              className={styles.quickUser}
            >
              <span className={styles.avatar}>👩‍🍳</span>
              <span>Ayşe</span>
            </button>
            <button 
              type="button"
              onClick={() => handleQuickLogin('mehmet@restaurant.com')}
              className={styles.quickUser}
            >
              <span className={styles.avatar}>👨‍🍳</span>
              <span>Mehmet</span>
            </button>
          </div>
          <p className={styles.hint}>PIN: 1234</p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>© 2025 Akıllı Garson - Tüm hakları saklıdır</p>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className={styles.decorations}>
        <motion.div 
          className={styles.floatingIcon}
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          🍕
        </motion.div>
        <motion.div 
          className={`${styles.floatingIcon} ${styles.icon2}`}
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5
          }}
        >
          🍔
        </motion.div>
        <motion.div 
          className={`${styles.floatingIcon} ${styles.icon3}`}
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        >
          🍰
        </motion.div>
      </div>
    </div>
  )
}

