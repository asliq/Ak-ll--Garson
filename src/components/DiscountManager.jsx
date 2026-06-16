import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, 
  Percent, 
  Calendar,
  Clock,
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react'
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount } from '../hooks/useDiscounts'
import styles from './DiscountManager.module.css'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export default function DiscountManager({ onClose, onApplyDiscount }) {
  const { data: discounts, isLoading } = useDiscounts()
  const createMutation = useCreateDiscount()
  const updateMutation = useUpdateDiscount()
  const deleteMutation = useDeleteDiscount()

  const [showForm, setShowForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage', // percentage, fixed, buy_x_get_y
    value: 0,
    code: '',
    minAmount: 0,
    startDate: '',
    endDate: '',
    maxUses: null,
    isActive: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount.id, data: formData }, {
        onSuccess: () => {
          setShowForm(false)
          setEditingDiscount(null)
          resetForm()
        }
      })
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setShowForm(false)
          resetForm()
        }
      })
    }
  }

  const handleEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData(discount)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'percentage',
      value: 0,
      code: '',
      minAmount: 0,
      startDate: '',
      endDate: '',
      maxUses: null,
      isActive: true
    })
  }

  const isDiscountActive = (discount) => {
    if (!discount.isActive) return false
    const now = new Date()
    const start = new Date(discount.startDate)
    const end = new Date(discount.endDate)
    return now >= start && now <= end
  }

  const getDiscountDisplay = (discount) => {
    switch (discount.type) {
      case 'percentage':
        return `%${discount.value}`
      case 'fixed':
        return `₺${discount.value}`
      case 'buy_x_get_y':
        return `${discount.value.buy} Al ${discount.value.get} Öde`
      default:
        return ''
    }
  }

  return (
    <motion.div 
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.title}>
            <Tag size={24} />
            <h2>İndirim & Kampanya Yönetimi</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {!showForm ? (
            <>
              <div className={styles.actions}>
                <Button 
                  variant="primary" 
                  onClick={() => setShowForm(true)}
                  icon={<Plus size={18} />}
                >
                  Yeni Kampanya
                </Button>
              </div>

              {isLoading ? (
                <div className={styles.loading}>Yükleniyor...</div>
              ) : (
                <div className={styles.discountList}>
                  {discounts?.map((discount) => (
                    <Card key={discount.id} className={styles.discountCard}>
                      <div className={styles.discountHeader}>
                        <div className={styles.discountBadge}>
                          {isDiscountActive(discount) ? (
                            <span className={styles.active}>
                              <Check size={14} /> Aktif
                            </span>
                          ) : (
                            <span className={styles.inactive}>
                              <AlertCircle size={14} /> Pasif
                            </span>
                          )}
                        </div>
                        <div className={styles.discountActions}>
                          <button 
                            onClick={() => handleEdit(discount)}
                            className={styles.iconBtn}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(discount.id)}
                            className={styles.iconBtn}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.discountInfo}>
                        <h3>{discount.name}</h3>
                        <div className={styles.discountValue}>
                          <Percent size={20} />
                          <span>{getDiscountDisplay(discount)}</span>
                        </div>
                        {discount.code && (
                          <div className={styles.code}>
                            Kod: <strong>{discount.code}</strong>
                          </div>
                        )}
                        <div className={styles.discountMeta}>
                          <div className={styles.metaItem}>
                            <Calendar size={14} />
                            <span>
                              {new Date(discount.startDate).toLocaleDateString('tr-TR')} - {new Date(discount.endDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          {discount.minAmount > 0 && (
                            <div className={styles.metaItem}>
                              <Tag size={14} />
                              <span>Min: ₺{discount.minAmount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {onApplyDiscount && isDiscountActive(discount) && (
                        <Button 
                          variant="primary" 
                          size="small"
                          onClick={() => {
                            onApplyDiscount(discount)
                            onClose()
                          }}
                        >
                          Uygula
                        </Button>
                      )}
                    </Card>
                  ))}

                  {discounts?.length === 0 && (
                    <div className={styles.empty}>
                      <Tag size={48} />
                      <p>Henüz kampanya oluşturulmamış</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Kampanya Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Örn: Yaz İndirimi"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>İndirim Tipi *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>İndirim Miktarı *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Kampanya Kodu</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Örn: YAZ2025"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Minimum Tutar (₺)</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Başlangıç Tarihi *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Bitiş Tarihi *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Maksimum Kullanım</label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                    min="1"
                    placeholder="Sınırsız"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingDiscount(null)
                    resetForm()
                  }}
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingDiscount ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

