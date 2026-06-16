import { motion } from 'framer-motion'
import styles from './Card.module.css'

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false,
  delay = 0,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`${styles.card} ${styles[variant]} ${glow ? styles.glow : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`${styles.header} ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`${styles.title} ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`${styles.description} ${className}`}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`${styles.content} ${className}`}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`${styles.footer} ${className}`}>
      {children}
    </div>
  )
}

