import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Edit2, 
  Trash2,
  Search,
  Filter,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useInventory, useUpdateInventoryItem, useDeleteInventoryItem } from '../hooks/useInventory'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import styles from './Inventory.module.css'

export default function Inventory() {
  const { data: inventory, isLoading, error } = useInventory()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, low, out
  const [showAddModal, setShowAddModal] = useState(false)

  // Debug logs
  console.log('Inventory Component Rendered')
  console.log('Loading:', isLoading)
  console.log('Error:', error)
  console.log('Inventory Data:', inventory)

  const getStockStatus = (item) => {
    if (item.quantity === 0) return 'out'
    if (item.quantity <= item.minStock) return 'low'
    return 'normal'
  }

  const getStockColor = (status) => {
    switch (status) {
      case 'out': return '#ef4444'
      case 'low': return '#f59e0b'
      case 'normal': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const status = getStockStatus(item)
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'low') return matchesSearch && (status === 'low' || status === 'out')
    if (filterStatus === 'out') return matchesSearch && status === 'out'
    
    return matchesSearch
  })

  const handleUpdateQuantity = (itemId, delta) => {
    const item = inventory.find(i => i.id === itemId)
    if (!item) return
    
    const newQuantity = Math.max(0, item.quantity + delta)
    updateMutation.mutate({ 
      id: itemId, 
      data: { quantity: newQuantity } 
    })
  }

  const handleDelete = (id) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      deleteMutation.mutate(id)
    }
  }

  const lowStockCount = inventory?.filter(item => getStockStatus(item) === 'low').length || 0
  const outOfStockCount = inventory?.filter(item => getStockStatus(item) === 'out').length || 0

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Stok Yönetimi</h1>
          <p>Ürün stok seviyelerini takip edin ve yönetin</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowAddModal(true)}
        >
          Yeni Ürün
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={styles.stats}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <Package size={24} style={{ color: '#6366f1' }} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{inventory?.length || 0}</div>
            <div className={styles.statLabel}>Toplam Ürün</div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <TrendingDown size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{lowStockCount}</div>
            <div className={styles.statLabel}>Düşük Stok</div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{outOfStockCount}</div>
            <div className={styles.statLabel}>Stokta Yok</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={filterStatus === 'all' ? styles.active : ''}
            onClick={() => setFilterStatus('all')}
          >
            Tümü
          </button>
          <button
            className={filterStatus === 'low' ? styles.active : ''}
            onClick={() => setFilterStatus('low')}
          >
            <AlertTriangle size={16} />
            Düşük Stok
          </button>
          <button
            className={filterStatus === 'out' ? styles.active : ''}
            onClick={() => setFilterStatus('out')}
          >
            Stokta Yok
          </button>
        </div>
      </Card>

      {/* Inventory Table */}
      {isLoading ? (
        <div className={styles.loading}>Yükleniyor...</div>
      ) : (
        <Card className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Birim</th>
                <th>Mevcut</th>
                <th>Min. Stok</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory?.map((item) => {
                const status = getStockStatus(item)
                const statusColor = getStockColor(status)
                
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>
                      <div className={styles.productName}>
                        <Package size={18} />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.unit}</td>
                    <td>
                      <div className={styles.quantityControl}>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          disabled={item.quantity === 0}
                        >
                          <Minus size={14} />
                        </button>
                        <span className={styles.quantity}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td>{item.minStock}</td>
                    <td>
                      <div 
                        className={styles.statusBadge}
                        style={{ 
                          background: `${statusColor}20`,
                          color: statusColor 
                        }}
                      >
                        {status === 'out' && 'Stokta Yok'}
                        {status === 'low' && 'Düşük'}
                        {status === 'normal' && 'Normal'}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.iconBtn}
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={styles.iconBtn}
                          onClick={() => handleDelete(item.id)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>

          {filteredInventory?.length === 0 && (
            <div className={styles.empty}>
              <Package size={48} />
              <p>Ürün bulunamadı</p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

