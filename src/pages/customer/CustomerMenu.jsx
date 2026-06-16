import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  X,
  Bell,
  Search,
  ArrowLeft,
  CreditCard,
  Wallet,
  DollarSign,
  Check,
  MessageSquare
} from 'lucide-react'
import { useMenuWithCategories } from '../../hooks/useMenu'
import { useCreateOrder } from '../../hooks/useOrders'
import styles from './CustomerMenu.module.css'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(value)
}

export default function CustomerMenu() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerTable, setCustomerTable] = useState(null)
  const [orderNotes, setOrderNotes] = useState('')
  
  const { categories, menuItems, isLoading } = useMenuWithCategories()
  const createOrder = useCreateOrder()

  useEffect(() => {
    const tableData = localStorage.getItem('customerTable')
    if (!tableData) {
      navigate('/customer')
      return
    }
    setCustomerTable(JSON.parse(tableData))
  }, [navigate])

  const filteredMenu = useMemo(() => {
    if (!menuItems) return []
    return menuItems.filter(item => {
      if (!item.isAvailable) return false
      const categoryMatch = selectedCategory === 'all' || item.categoryId === selectedCategory
      const searchMatch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [menuItems, selectedCategory, searchQuery])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1, notes: '' }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta
        if (newQty <= 0) return null
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const serviceFee = cartTotal * 0.10 // %10 servis ücreti
  const totalWithService = cartTotal + serviceFee

  const handleCallWaiter = () => {
    alert('Garson çağrıldı! En kısa sürede size yardımcı olacaktır.')
  }

  const handleRequestBill = () => {
    setShowPayment(true)
  }

  const handleOrder = () => {
    if (cart.length === 0 || !customerTable) return

    const orderData = {
      tableId: customerTable.tableId,
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      })),
      total: totalWithService,
      notes: orderNotes,
      paymentMethod: showPayment ? paymentMethod : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    createOrder.mutate(orderData, {
      onSuccess: () => {
        setCart([])
        setShowCart(false)
        setShowPayment(false)
        alert('Siparişiniz alındı! Teşekkürler.')
        navigate('/customer/orders')
      },
      onError: (error) => {
        alert('Sipariş gönderilemedi. Lütfen tekrar deneyin.')
      }
    })
  }

  if (isLoading) {
    return <div className={styles.loading}>Menü yükleniyor...</div>
  }

  return (
    <div className={styles.customerMenu}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/customer')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.tableInfo}>
          <span>Masa {customerTable?.tableNumber || '-'}</span>
        </div>
        <button className={styles.cartBtn} onClick={() => setShowCart(true)}>
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Menüde ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className={styles.categories}>
        <button
          className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tümü
        </button>
        {categories?.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className={styles.menuGrid}>
        {filteredMenu.map(item => (
          <div key={item.id} className={styles.menuItem}>
            <div className={styles.itemImage}>
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className={styles.itemImagePlaceholder}>🍽️</div>
              )}
            </div>
            <div className={styles.itemContent}>
              <h3>{item.name}</h3>
              <p className={styles.itemDesc}>{item.description}</p>
              <div className={styles.itemFooter}>
                <div className={styles.itemPrice}>{formatCurrency(item.price)}</div>
                <button className={styles.addBtn} onClick={() => addToCart(item)}>
                  <Plus size={16} />
                  Ekle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button className={styles.quickBtn} onClick={handleCallWaiter}>
          <Bell size={20} />
          <span>Garson Çağır</span>
        </button>
        <button className={styles.quickBtn} onClick={() => navigate('/customer/orders')}>
          <Clock size={20} />
          <span>Siparişlerim</span>
        </button>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className={styles.overlay} onClick={() => setShowCart(false)} />
          <div className={styles.cartSidebar}>
            <div className={styles.cartHeader}>
              <h2>Sepetim</h2>
              <button className={styles.closeBtn} onClick={() => setShowCart(false)}>
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className={styles.emptyCart}>
                <ShoppingCart size={48} />
                <p>Sepetiniz boş</p>
              </div>
            ) : (
              <>
                <div className={styles.cartItems}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <h4>{item.name}</h4>
                        <p>{formatCurrency(item.price)}</p>
                      </div>
                      <div className={styles.cartItemActions}>
                        <button onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={16} />
                        </button>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className={styles.cartItemTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderNotes}>
                  <MessageSquare size={18} />
                  <textarea
                    placeholder="Sipariş notu (opsiyonel)"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className={styles.cartSummary}>
                  <div className={styles.summaryRow}>
                    <span>Ara Toplam:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Servis Ücreti (%10):</span>
                    <span>{formatCurrency(serviceFee)}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Toplam:</span>
                    <strong>{formatCurrency(totalWithService)}</strong>
                  </div>
                </div>

                {!showPayment ? (
                  <div className={styles.cartFooter}>
                    <button 
                      className={`${styles.orderBtn} ${styles.secondary}`}
                      onClick={handleRequestBill}
                    >
                      <CreditCard size={18} />
                      Hesap İste
                    </button>
                    <button 
                      className={styles.orderBtn}
                      onClick={handleOrder}
                    >
                      <Check size={18} />
                      Sipariş Ver
                    </button>
                  </div>
                ) : (
                  <div className={styles.paymentSection}>
                    <h3>Ödeme Yöntemi</h3>
                    <div className={styles.paymentMethods}>
                      <button
                        className={`${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('cash')}
                      >
                        <Wallet size={20} />
                        <span>Nakit</span>
                      </button>
                      <button
                        className={`${styles.paymentBtn} ${paymentMethod === 'card' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <CreditCard size={20} />
                        <span>Kart</span>
                      </button>
                      <button
                        className={`${styles.paymentBtn} ${paymentMethod === 'online' ? styles.active : ''}`}
                        onClick={() => setPaymentMethod('online')}
                      >
                        <DollarSign size={20} />
                        <span>Online</span>
                      </button>
                    </div>
                    <button 
                      className={styles.confirmBtn}
                      onClick={handleOrder}
                    >
                      <Check size={18} />
                      Ödemeyi Tamamla ({formatCurrency(totalWithService)})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
