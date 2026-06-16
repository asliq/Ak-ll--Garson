import { motion } from 'framer-motion' // framer-motion kütüphanesini import ediyoruz.
import styles from './Button.module.css' // Button.module.css dosyasını import ediyoruz.

export function Button({ 
  children,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        ${styles.button} 
        ${styles[variant]} 
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${loading ? styles.loading : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg viewBox="0 0 24 24" fill="none">
            <circle 
              cx="12" cy="12" r="10" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path 
              d="M12 2a10 10 0 0 1 10 10" 
              stroke="currentColor" 
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={size === 'small' ? 16 : size === 'large' ? 22 : 18} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={size === 'small' ? 16 : size === 'large' ? 22 : 18} />
      )}
    </motion.button>
  )
}

export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'medium',
  className = '',
  ...props
}) {
  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${styles.iconButton} ${styles[variant]} ${styles[`icon${size}`]} ${className}`}
      {...props}
    >
      <Icon size={iconSizes[size]} />
    </motion.button>
  )
}

