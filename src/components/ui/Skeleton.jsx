import styles from './Skeleton.module.css'

export function Skeleton({ 
  width, 
  height, 
  borderRadius = '8px',
  className = '' 
}) {
  return (
    <div 
      className={`${styles.skeleton} ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius 
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton height="120px" borderRadius="12px 12px 0 0" />
      <div className={styles.cardContent}>
        <Skeleton width="70%" height="20px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="40%" height="24px" />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className={styles.table}>
      <Skeleton width="100%" height="60px" borderRadius="12px" />
      <div className={styles.tableContent}>
        <Skeleton width="50px" height="50px" borderRadius="50%" />
        <div className={styles.tableInfo}>
          <Skeleton width="80px" height="18px" />
          <Skeleton width="60px" height="14px" />
        </div>
      </div>
    </div>
  )
}

