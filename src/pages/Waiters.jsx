import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Phone,
  Mail,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { useWaiters, useCreateWaiter, useUpdateWaiter, useDeleteWaiter } from '../hooks/useWaiters'
import { useOrders } from '../hooks/useOrders'
import styles from './Waiters.module.css'

const formatCurrency = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(v)

const AVATARS = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👨‍💼', '👩‍💼', '🧑‍💼']

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  shift: 'morning',
  avatar: '👨‍🍳',
  isActive: true,
  tablesAssigned: [],
  salesTotal: 0,
}

export default function Waiters() {
  const [showModal, setShowModal] = useState(false)
  const [editWaiter, setEditWaiter] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data: waiters, isLoading } = useWaiters()
  const { data: orders } = useOrders()
  const createWaiter = useCreateWaiter()
  const updateWaiter = useUpdateWaiter()
  const deleteWaiter = useDeleteWaiter()

  const openAdd = () => {
    setEditWaiter(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (w) => {
    setEditWaiter(w)
    setForm({
      name: w.name || '',
      email: w.email || '',
      phone: w.phone || '',
      shift: w.shift || 'morning',
      avatar: w.avatar || '👨‍🍳',
      isActive: w.isActive ?? true,
      tablesAssigned: w.tablesAssigned || [],
      salesTotal: w.salesTotal || 0,
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editWaiter) {
      updateWaiter.mutate({ id: editWaiter.id, ...form }, { onSuccess: () => setShowModal(false) })
    } else {
      createWaiter.mutate(form, { onSuccess: () => setShowModal(false) })
    }
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteWaiter.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) })
  }

  const getWaiterOrderCount = (waiterId) =>
    orders?.filter(o => o.waiterId === waiterId || o.waiter === waiterId).length || 0

  if (isLoading) return <div className={styles.loading}>Yükleniyor…</div>

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
  const cardAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Garson Yönetimi</h1>
          <p>{waiters?.length || 0} garson kayıtlı</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={18} />
          Garson Ekle
        </button>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Aktif</span>
          <span className={styles.statValue}>{waiters?.filter(w => w.isActive).length || 0}</span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Sabah Vardiyası</span>
          <span className={styles.statValue}>{waiters?.filter(w => w.shift === 'morning').length || 0}</span>
        </div>
        <div className={styles.statChip}>
          <span className={styles.statLabel}>Akşam Vardiyası</span>
          <span className={styles.statValue}>{waiters?.filter(w => w.shift === 'evening').length || 0}</span>
        </div>
      </div>

      {/* Waiter Cards */}
      <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
        {waiters?.map(w => (
          <motion.div key={w.id} variants={cardAnim} className={`${styles.card} ${!w.isActive ? styles.inactive : ''}`}>
            <div className={styles.cardTop}>
              <div className={styles.avatar}>{w.avatar || '👨‍🍳'}</div>
              <div className={styles.info}>
                <h3 className={styles.name}>{w.name}</h3>
                <div className={styles.shiftBadge} data-shift={w.shift}>
                  {w.shift === 'morning' ? <Sun size={13} /> : <Moon size={13} />}
                  {w.shift === 'morning' ? 'Sabah' : 'Akşam'}
                </div>
              </div>
              <div className={`${styles.statusDot} ${w.isActive ? styles.active : styles.offline}`} />
            </div>

            <div className={styles.details}>
              {w.email && (
                <div className={styles.detailRow}>
                  <Mail size={13} />
                  <span>{w.email}</span>
                </div>
              )}
              {w.phone && (
                <div className={styles.detailRow}>
                  <Phone size={13} />
                  <span>{w.phone}</span>
                </div>
              )}
            </div>

            <div className={styles.kpiRow}>
              <div className={styles.kpi}>
                <strong>{formatCurrency(w.salesTotal || 0)}</strong>
                <span>Toplam Satış</span>
              </div>
              <div className={styles.kpi}>
                <strong>{w.tablesAssigned?.length || 0}</strong>
                <span>Masa</span>
              </div>
              <div className={styles.kpi}>
                <strong>{getWaiterOrderCount(w.id)}</strong>
                <span>Sipariş</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => openEdit(w)}>
                <Pencil size={15} />
                Düzenle
              </button>
              <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(w)}>
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)} />
            <motion.div className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h2>{editWaiter ? 'Garson Düzenle' : 'Yeni Garson'}</h2>
                <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                {/* Avatar seçimi */}
                <div className={styles.formGroup}>
                  <label>Avatar</label>
                  <div className={styles.avatarPicker}>
                    {AVATARS.map(a => (
                      <button key={a} type="button"
                        className={`${styles.avatarOption} ${form.avatar === a ? styles.selected : ''}`}
                        onClick={() => setForm(f => ({ ...f, avatar: a }))}
                      >{a}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ad Soyad *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ahmet Yılmaz" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Telefon</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0532 111 2222" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>E-posta</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="garson@restaurant.com" />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Vardiya</label>
                    <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}>
                      <option value="morning">☀️ Sabah</option>
                      <option value="evening">🌙 Akşam</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Durum</label>
                    <button type="button" className={`${styles.toggleActive} ${form.isActive ? styles.on : ''}`}
                      onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                      {form.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      {form.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                    İptal
                  </button>
                  <button type="submit" className={styles.submitBtn}
                    disabled={createWaiter.isPending || updateWaiter.isPending}>
                    <Check size={16} />
                    {editWaiter ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)} />
            <motion.div className={styles.confirmModal}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Trash2 size={32} className={styles.confirmIcon} />
              <h3>{deleteConfirm.name} silinsin mi?</h3>
              <p>Bu işlem geri alınamaz.</p>
              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>İptal</button>
                <button className={styles.dangerBtn} onClick={handleDelete}
                  disabled={deleteWaiter.isPending}>
                  <Trash2 size={15} /> Sil
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
