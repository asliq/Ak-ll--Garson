import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useAuthGuard } from '../hooks/useAuth'

export default function AuthGuard({ children }) {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuthGuard()

  // Yükleniyor
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Loader2 
            size={40} 
            style={{ 
              color: 'var(--accent-gold)',
              animation: 'spin 1s linear infinite',
            }} 
          />
          <span style={{ color: 'var(--text-muted)' }}>Oturum kontrol ediliyor...</span>
        </motion.div>
      </div>
    )
  }

  // Giriş yapmamışsa login'e yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Giriş yapmışsa içeriği göster
  return children
}

