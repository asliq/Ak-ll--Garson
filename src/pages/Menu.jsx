import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Edit3,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import { 
  useMenuWithCategories, 
  useUpdateMenuAvailability,
  useUpdateMenuPrice,
  useCreateMenuItem,
  useDeleteMenuItem
} from '../hooks/useMenu'
import styles from './Menu.module.css'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  preparationTime: 10,
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  categoryId: null,
  isAvailable: true,
}

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPrice, setEditingPrice] = useState(null)
  const [newPrice, setNewPrice] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // item id

  const { categories, menuItems, isLoading, isError, error, refetch } = useMenuWithCategories()
  const updateAvailability = useUpdateMenuAvailability()
  const updatePrice = useUpdateMenuPrice()
  const createItem = useCreateMenuItem()
  const deleteItem = useDeleteMenuItem()

  // Filtreleme
  const filteredItems = menuItems.filter(item => {
    const categoryMatch = !selectedCategory || item.categoryId === selectedCategory
    const searchMatch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const toggleAvailability = (item) => {
    updateAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable })
  }

  const startEditPrice = (item) => {
    setEditingPrice(item.id)
    setNewPrice(item.price.toString())
  }

  const savePrice = (item) => {
    const price = parseFloat(newPrice)
    if (!isNaN(price) && price > 0) {
      updatePrice.mutate({ id: item.id, price })
    }
    setEditingPrice(null)
    setNewPrice('')
  }

  const cancelEdit = () => {
    setEditingPrice(null)
    setNewPrice('')
  }

  const handleAddSubmit = (e) => {
    e.preventDefault()
    const price = parseFloat(addForm.price)
    if (!addForm.name || isNaN(price) || price <= 0 || !addForm.categoryId) return

    createItem.mutate({
      ...addForm,
      price,
      preparationTime: parseInt(addForm.preparationTime) || 10,
    }, {
      onSuccess: () => {
        setShowAddModal(false)
        setAddForm(emptyForm)
      }
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return
    deleteItem.mutate(deleteConfirm, {
      onSuccess: () => setDeleteConfirm(null)
    })
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.categories}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ width: 100, height: 40, borderRadius: 12 }} />
          ))}
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <p>Menü yüklenemedi.</p>
        <p>{error?.message || 'API bağlantı hatası'}</p>
        <button type="button" onClick={() => refetch()}>Tekrar Dene</button>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => { setAddForm({ ...emptyForm, categoryId: categories[0]?.id || null }); setShowAddModal(true) }}
        >
          Ürün Ekle
        </Button>
      </div>

      {/* Kategoriler */}
      <div className={styles.categories}>
        <motion.button
          className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
          onClick={() => setSelectedCategory(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.categoryIcon}>🍽️</span>
          <span>Tümü</span>
          <span className={styles.count}>{menuItems.length}</span>
        </motion.button>
        
        {categories.map(category => {
          const itemCount = menuItems.filter(i => i.categoryId === category.id).length
          return (
            <motion.button
              key={category.id}
              className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ '--category-color': category.color }}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span>{category.name}</span>
              <span className={styles.count}>{itemCount}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Menü Grid */}
      <motion.div className={styles.grid} layout>
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => {
            const category = categories.find(c => c.id === item.categoryId)
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Card 
                  className={`${styles.menuCard} ${!item.isAvailable ? styles.unavailable : ''}`}
                  hover
                >
                  {/* Görsel */}
                  <div className={styles.imageWrapper}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.imageOverlay}>
                      <span 
                        className={styles.categoryTag}
                        style={{ background: category?.color }}
                      >
                        {category?.icon} {category?.name}
                      </span>
                    </div>
                    {!item.isAvailable && (
                      <div className={styles.unavailableOverlay}>
                        <span>Stokta Yok</span>
                      </div>
                    )}
                    {/* Sil Butonu */}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setDeleteConfirm(item.id)}
                      title="Ürünü sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <CardContent className={styles.cardContent}>
                    <div className={styles.header}>
                      <h3 className={styles.name}>{item.name}</h3>
                      <div className={styles.prepTime}>
                        <Clock size={14} />
                        <span>{item.preparationTime} dk</span>
                      </div>
                    </div>

                    <p className={styles.description}>{item.description}</p>

                    <div className={styles.footer}>
                      {editingPrice === item.id ? (
                        <div className={styles.priceEdit}>
                          <input
                            type="number"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            autoFocus
                          />
                          <IconButton 
                            icon={Check} 
                            variant="success" 
                            size="small"
                            onClick={() => savePrice(item)}
                          />
                          <IconButton 
                            icon={X} 
                            variant="ghost" 
                            size="small"
                            onClick={cancelEdit}
                          />
                        </div>
                      ) : (
                        <div className={styles.priceWrapper}>
                          <span className={styles.price}>₺{item.price}</span>
                          <IconButton 
                            icon={Edit3} 
                            variant="ghost" 
                            size="small"
                            onClick={() => startEditPrice(item)}
                          />
                        </div>
                      )}

                      <button 
                        className={`${styles.stockToggle} ${item.isAvailable ? styles.inStock : styles.outOfStock}`}
                        onClick={() => toggleAvailability(item)}
                        disabled={updateAvailability.isPending}
                      >
                        {item.isAvailable ? (
                          <><ToggleRight size={20} /><span>Stokta</span></>
                        ) : (
                          <><ToggleLeft size={20} /><span>Yok</span></>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 && (
        <div className={styles.emptyState}>
          <p>Aramanızla eşleşen ürün bulunamadı.</p>
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null) }}>
            Filtreleri Temizle
          </Button>
        </div>
      )}

      {/* Ürün Ekleme Modalı */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h2>Yeni Ürün Ekle</h2>
                <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className={styles.addForm}>
                <div className={styles.formRow}>
                  <label>Ürün Adı *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Örn: Kuzu Tandır"
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Açıklama</label>
                  <textarea
                    value={addForm.description}
                    onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Ürün açıklaması..."
                    rows={2}
                  />
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.formRow}>
                    <label>Fiyat (₺) *</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={addForm.price}
                      onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className={styles.formRow}>
                    <label>Hazırlama Süresi (dk)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={addForm.preparationTime}
                      onChange={e => setAddForm(p => ({ ...p, preparationTime: e.target.value }))}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <label>Kategori *</label>
                  <select
                    value={addForm.categoryId || ''}
                    onChange={e => setAddForm(p => ({ ...p, categoryId: e.target.value }))}
                    required
                  >
                    <option value="">Kategori seçin...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formRow}>
                  <label>Görsel URL</label>
                  <input
                    type="url"
                    value={addForm.image}
                    onChange={e => setAddForm(p => ({ ...p, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className={styles.modalActions}>
                  <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                    İptal
                  </Button>
                  <Button type="submit" variant="primary" disabled={createItem.isPending}>
                    {createItem.isPending ? 'Ekleniyor...' : 'Ekle'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Silme Onay Modalı */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              className={styles.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              className={`${styles.modal} ${styles.confirmModal}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Trash2 size={32} className={styles.confirmIcon} />
              <h3>Ürünü sil?</h3>
              <p>
                <strong>{menuItems.find(i => i.id === deleteConfirm)?.name}</strong> menüden
                kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </p>
              <div className={styles.modalActions}>
                <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                  İptal
                </Button>
                <button
                  className={styles.dangerBtn}
                  onClick={handleDeleteConfirm}
                  disabled={deleteItem.isPending}
                >
                  {deleteItem.isPending ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
