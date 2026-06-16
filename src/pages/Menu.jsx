import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Clock, 
  ToggleLeft, 
  ToggleRight,
  Edit3,
  Check,
  X
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import { 
  useMenuWithCategories, 
  useUpdateMenuAvailability,
  useUpdateMenuPrice 
} from '../hooks/useMenu'
import styles from './Menu.module.css'

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPrice, setEditingPrice] = useState(null)
  const [newPrice, setNewPrice] = useState('')

  const { categories, menuItems, isLoading, refetch } = useMenuWithCategories()
  const updateAvailability = useUpdateMenuAvailability()
  const updatePrice = useUpdateMenuPrice()

  // Filtreleme
  const filteredItems = menuItems.filter(item => {
    const categoryMatch = !selectedCategory || item.categoryId === selectedCategory
    const searchMatch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  // Stok durumunu değiştir
  const toggleAvailability = (item) => {
    updateAvailability.mutate({ 
      id: item.id, 
      isAvailable: !item.isAvailable 
    })
  }

  // Fiyat düzenleme
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

  return (
    <div className={styles.page}>
      {/* Arama */}
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
      <motion.div 
        className={styles.grid}
        layout
      >
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
                  </div>

                  <CardContent className={styles.cardContent}>
                    {/* Başlık ve Süre */}
                    <div className={styles.header}>
                      <h3 className={styles.name}>{item.name}</h3>
                      <div className={styles.prepTime}>
                        <Clock size={14} />
                        <span>{item.preparationTime} dk</span>
                      </div>
                    </div>

                    {/* Açıklama */}
                    <p className={styles.description}>{item.description}</p>

                    {/* Fiyat ve Kontroller */}
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
                          <>
                            <ToggleRight size={20} />
                            <span>Stokta</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} />
                            <span>Yok</span>
                          </>
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
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  )
}

