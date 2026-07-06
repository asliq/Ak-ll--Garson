import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import CustomerHeader from '../../components/customer/CustomerHeader'
import styles from './CustomerThankYou.module.css'

export default function CustomerThankYou() {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)

  return (
    <div className={styles.page}>
      <CustomerHeader backTo="/customer/menu" showOrderCount={false} />

      <div className={styles.content}>
        <div className={styles.icon}>🙏</div>
        <h1>Teşekkürler</h1>
        <p>Yine bekleriz!</p>

        <div className={styles.ratingSection}>
          <h2>Deneyiminizi değerlendirin</h2>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.starBtn} ${rating >= value ? styles.active : ''}`}
                onClick={() => setRating(value)}
                aria-label={`${value} yıldız`}
              >
                <Star size={32} fill={rating >= value ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className={styles.ratingThanks}>Geri bildiriminiz için teşekkürler!</p>
          )}
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => navigate('/customer/menu')}
        >
          Menüye Dön
        </button>
      </div>
    </div>
  )
}
