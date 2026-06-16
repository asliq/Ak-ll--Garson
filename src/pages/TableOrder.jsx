import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  Send,
  Users,
  MapPin,
  Clock,
  X,
  Tag
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useTable, useUpdateTableStatus } from '../hooks/useTables'
import { useMenuWithCategories } from '../hooks/useMenu'
import { useTableOrders, useCreateOrder } from '../hooks/useOrders'
import { calculateDiscount } from '../hooks/useDiscounts'
import DiscountManager from '../components/DiscountManager'
import styles from './TableOrder.module.css'

export default function TableOrder() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [notes, setNotes] = useState({})
  const [showCart, setShowCart] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [showDiscountManager, setShowDiscountManager] = useState(false)

  // TanStack Query hooks
  const { data: table, isLoading: tableLoading } = useTable(parseInt(tableId))
  const { categories, menuItems, isLoading: menuLoading } = useMenuWithCategories()
  const { data: existingOrders } = useTableOrders(parseInt(tableId))
  const createOrder = useCreateOrder()
  const updateTableStatus = useUpdateTableStatus()

  const isLoading = tableLoading || menuLoading

  // Kategoriye göre filtrelenmiş menü
  const filteredMenu = useMemo(() => {
    if (!menuItems) return []
    if (!selectedCategory) return menuItems.filter(item => item.isAvailable)
    return menuItems.filter(item => 
      item.categoryId === selectedCategory && item.isAvailable
    )
  }, [menuItems, selectedCategory])

  // Sepete ürün ekle
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id)
      if (existing) {
        return prev.map(i => 
          i.menuItemId === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { 
        menuItemId: item.id, 
        name: item.name,
        price: item.price,
        quantity: 1, 
        notes: '' 
      }]
    })
  }

  // Sepetten ürün çıkar
  const removeFromCart = (menuItemId) => {
    setCart(prev => prev.filter(i => i.menuItemId !== menuItemId))
  }

  // Miktar güncelle
  const updateQuantity = (menuItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQuantity = item.quantity + delta
        if (newQuantity <= 0) return null
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean))
  }

  // Not ekle
  const updateItemNotes = (menuItemId, newNotes) => {
    setCart(prev => prev.map(item => 
      item.menuItemId === menuItemId 
        ? { ...item, notes: newNotes }
        : item
    ))
  }

  // Toplam hesapla
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cart])

  // İndirim hesapla
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0
    return calculateDiscount(appliedDiscount, cartSubtotal)
  }, [appliedDiscount, cartSubtotal])

  // Toplam (indirim sonrası)
  const cartTotal = useMemo(() => {
    return cartSubtotal - discountAmount
  }, [cartSubtotal, discountAmount])

  // Toplam ürün sayısı
  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  // Sipariş gönder
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return

    const orderData = {
      tableId: parseInt(tableId),
      items: cart.map(({ menuItemId, quantity, notes }) => ({
        menuItemId,
        quantity,
        notes
      })),
      status: 'pending',
      subtotal: cartSubtotal,
      discountId: appliedDiscount?.id || null,
      discountAmount: discountAmount,
      totalAmount: cartTotal
    }

    createOrder.mutate(orderData, {
      onSuccess: () => {
        // Masayı dolu olarak işaretle
        if (table?.status === 'available') {
          updateTableStatus.mutate({ id: parseInt(tableId), status: 'occupied' })
        }
        setCart([])
        setShowCart(false)
        navigate('/orders')
      }
    })
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton height="60px" borderRadius="16px" />
        <div className={styles.mainContent}>
          <div className={styles.menuSection}>
            <Skeleton height="300px" borderRadius="16px" />
          </div>
          <div className={styles.cartSection}>
            <Skeleton height="400px" borderRadius="16px" />
          </div>
        </div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Masa bulunamadı</h2>
          <Button onClick={() => navigate('/tables')}>Masalara Dön</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/tables')}>
          <ArrowLeft size={20} />
          <span>Geri</span>
        </button>

        <div className={styles.tableDetails}>
          <h1>Masa {table.number}</h1>
          <div className={styles.tableMeta}>
            <span><Users size={16} /> {table.capacity} kişilik</span>
            <span><MapPin size={16} /> {table.section}</span>
          </div>
        </div>

        <button 
          className={styles.cartToggle}
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className={styles.cartBadge}>{cartItemCount}</span>
          )}
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Menü Bölümü */}
        <div className={styles.menuSection}>
          {/* Kategori Sekmeleri */}
          <div className={styles.categoryTabs}>
            <motion.button
              className={`${styles.categoryTab} ${!selectedCategory ? styles.active : ''}`}
              onClick={() => setSelectedCategory(null)}
              whileTap={{ scale: 0.95 }}
            >
              🍽️ Tümü
            </motion.button>
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                whileTap={{ scale: 0.95 }}
              >
                {cat.icon} {cat.name}
              </motion.button>
            ))}
          </div>

          {/* Menü Grid */}
          <div className={styles.menuGrid}>
            <AnimatePresence mode="popLayout">
              {filteredMenu.map((item, index) => {
                const cartItem = cart.find(c => c.menuItemId === item.id)
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card 
                      className={`${styles.menuItem} ${cartItem ? styles.inCart : ''}`}
                      hover
                      onClick={() => addToCart(item)}
                    >
                      <div className={styles.menuItemImage}>
                        <img src={item.image} alt={item.name} />
                        {cartItem && (
                          <div className={styles.cartIndicator}>
                            {cartItem.quantity}
                          </div>
                        )}
                      </div>
                      <CardContent className={styles.menuItemContent}>
                        <h4>{item.name}</h4>
                        <div className={styles.menuItemFooter}>
                          <span className={styles.menuItemPrice}>₺{item.price}</span>
                          <span className={styles.prepTime}>
                            <Clock size={12} /> {item.preparationTime} dk
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Sepet Bölümü - Desktop */}
        <div className={`${styles.cartSection} ${showCart ? styles.show : ''}`}>
          <Card className={styles.cartCard}>
            <CardContent className={styles.cartContent}>
              <div className={styles.cartHeader}>
                <h3><ShoppingCart size={20} /> Sipariş</h3>
                <button 
                  className={styles.closeCart}
                  onClick={() => setShowCart(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <ShoppingCart size={48} />
                  <p>Sepet boş</p>
                  <span>Menüden ürün ekleyin</span>
                </div>
              ) : (
                <>
                  <div className={styles.cartItems}>
                    <AnimatePresence>
                      {cart.map(item => (
                        <motion.div
                          key={item.menuItemId}
                          className={styles.cartItem}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <div className={styles.cartItemInfo}>
                            <h5>{item.name}</h5>
                            <span className={styles.cartItemPrice}>
                              ₺{item.price} x {item.quantity} = ₺{item.price * item.quantity}
                            </span>
                            <input
                              type="text"
                              placeholder="Not ekle..."
                              value={item.notes}
                              onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                              className={styles.notesInput}
                            />
                          </div>
                          
                          <div className={styles.cartItemActions}>
                            <div className={styles.quantityControls}>
                              <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.menuItemId, -1) }}>
                                <Minus size={16} />
                              </button>
                              <span>{item.quantity}</span>
                              <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.menuItemId, 1) }}>
                                <Plus size={16} />
                              </button>
                            </div>
                            <button 
                              className={styles.removeBtn}
                              onClick={(e) => { e.stopPropagation(); removeFromCart(item.menuItemId) }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className={styles.cartFooter}>
                    <div className={styles.cartSummary}>
                      <div className={styles.summaryRow}>
                        <span>Ara Toplam</span>
                        <span>₺{cartSubtotal.toFixed(2)}</span>
                      </div>
                      
                      {appliedDiscount ? (
                        <div className={styles.summaryRow} style={{ color: '#22c55e' }}>
                          <span>
                            <Tag size={14} /> {appliedDiscount.name}
                          </span>
                          <span>-₺{discountAmount.toFixed(2)}</span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="small"
                          icon={<Tag size={16} />}
                          onClick={() => setShowDiscountManager(true)}
                        >
                          İndirim Uygula
                        </Button>
                      )}
                      
                      <div className={styles.cartTotal}>
                        <span>Toplam</span>
                        <span className={styles.totalAmount}>₺{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="large"
                      fullWidth
                      icon={Send}
                      onClick={handleSubmitOrder}
                      loading={createOrder.isPending}
                    >
                      Siparişi Gönder
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Cart Overlay */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            className={styles.cartOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Cart Button */}
      {cart.length > 0 && !showCart && (
        <motion.button
          className={styles.mobileCartButton}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          onClick={() => setShowCart(true)}
        >
          <ShoppingCart size={20} />
          <span>{cartItemCount} ürün</span>
          <span className={styles.mobileTotal}>₺{cartTotal}</span>
        </motion.button>
      )}

      {/* Discount Manager Modal */}
      <AnimatePresence>
        {showDiscountManager && (
          <DiscountManager
            onClose={() => setShowDiscountManager(false)}
            onApplyDiscount={(discount) => {
              setAppliedDiscount(discount)
              setShowDiscountManager(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

