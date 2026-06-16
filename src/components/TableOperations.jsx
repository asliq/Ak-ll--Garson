import { useState } from 'react'
import { X, ArrowRight, Merge, Split, Calculator } from 'lucide-react'
import styles from './TableOperations.module.css'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 0
  }).format(value)
}

export function TableOperations({ 
  isOpen, 
  onClose, 
  currentTable, 
  availableTables, 
  order,
  onTransfer,
  onMerge,
  onSplit 
}) {
  const [activeTab, setActiveTab] = useState('transfer')
  const [selectedTable, setSelectedTable] = useState(null)
  const [splitCount, setSplitCount] = useState(2)
  const [splitAmounts, setSplitAmounts] = useState([])

  if (!isOpen || !currentTable || !order) return null

  const handleTransfer = () => {
    if (!selectedTable) {
      alert('Lütfen hedef masa seçin')
      return
    }
    onTransfer(currentTable.id, selectedTable)
    onClose()
  }

  const handleMerge = () => {
    if (!selectedTable) {
      alert('Lütfen birleştirilecek masayı seçin')
      return
    }
    onMerge(currentTable.id, selectedTable)
    onClose()
  }

  const handleSplitEqual = () => {
    const perPerson = order.total / splitCount
    onSplit(order.id, Array(splitCount).fill(perPerson))
    onClose()
  }

  const handleSplitCustom = () => {
    const total = splitAmounts.reduce((sum, amt) => sum + (parseFloat(amt) || 0), 0)
    if (Math.abs(total - order.total) > 0.01) {
      alert(`Toplam ${formatCurrency(order.total)} olmalı. Şu an: ${formatCurrency(total)}`)
      return
    }
    onSplit(order.id, splitAmounts.map(amt => parseFloat(amt)))
    onClose()
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Masa İşlemleri</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.currentInfo}>
          <div className={styles.infoCard}>
            <span>Masa {currentTable.number}</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'transfer' ? styles.active : ''}`}
            onClick={() => setActiveTab('transfer')}
          >
            <ArrowRight size={18} />
            Transfer
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'merge' ? styles.active : ''}`}
            onClick={() => setActiveTab('merge')}
          >
            <Merge size={18} />
            Birleştir
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'split' ? styles.active : ''}`}
            onClick={() => setActiveTab('split')}
          >
            <Split size={18} />
            Hesap Böl
          </button>
        </div>

        <div className={styles.content}>
          {/* TRANSFER */}
          {activeTab === 'transfer' && (
            <div className={styles.transferSection}>
              <p className={styles.description}>
                Masa {currentTable.number}'deki siparişi başka bir masaya taşıyın
              </p>
              <div className={styles.tableGrid}>
                {availableTables?.map(table => (
                  <button
                    key={table.id}
                    className={`${styles.tableBtn} ${selectedTable === table.id ? styles.selected : ''}`}
                    onClick={() => setSelectedTable(table.id)}
                    disabled={table.id === currentTable.id}
                  >
                    Masa {table.number}
                  </button>
                ))}
              </div>
              <button 
                className={styles.actionBtn}
                onClick={handleTransfer}
                disabled={!selectedTable}
              >
                <ArrowRight size={18} />
                Transfer Et
              </button>
            </div>
          )}

          {/* MERGE */}
          {activeTab === 'merge' && (
            <div className={styles.mergeSection}>
              <p className={styles.description}>
                Masa {currentTable.number}'ü başka bir masa ile birleştirin
              </p>
              <div className={styles.tableGrid}>
                {availableTables?.filter(t => t.status === 'occupied').map(table => (
                  <button
                    key={table.id}
                    className={`${styles.tableBtn} ${selectedTable === table.id ? styles.selected : ''}`}
                    onClick={() => setSelectedTable(table.id)}
                    disabled={table.id === currentTable.id}
                  >
                    Masa {table.number}
                  </button>
                ))}
              </div>
              <button 
                className={styles.actionBtn}
                onClick={handleMerge}
                disabled={!selectedTable}
              >
                <Merge size={18} />
                Masaları Birleştir
              </button>
            </div>
          )}

          {/* SPLIT */}
          {activeTab === 'split' && (
            <div className={styles.splitSection}>
              <div className={styles.splitModes}>
                <button
                  className={`${styles.modeBtn} ${!splitAmounts.length ? styles.active : ''}`}
                  onClick={() => setSplitAmounts([])}
                >
                  <Calculator size={18} />
                  Eşit Böl
                </button>
                <button
                  className={`${styles.modeBtn} ${splitAmounts.length ? styles.active : ''}`}
                  onClick={() => {
                    const amounts = Array(splitCount).fill('')
                    setSplitAmounts(amounts)
                  }}
                >
                  <Split size={18} />
                  Özel Böl
                </button>
              </div>

              {!splitAmounts.length ? (
                <>
                  <div className={styles.splitControl}>
                    <label>Kaç kişiye bölünsün?</label>
                    <div className={styles.counterControl}>
                      <button 
                        onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                      >
                        -
                      </button>
                      <span>{splitCount}</span>
                      <button 
                        onClick={() => setSplitCount(Math.min(10, splitCount + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className={styles.splitPreview}>
                    <div className={styles.previewLabel}>Kişi başı:</div>
                    <div className={styles.previewAmount}>
                      {formatCurrency(order.total / splitCount)}
                    </div>
                  </div>
                  <button className={styles.actionBtn} onClick={handleSplitEqual}>
                    <Split size={18} />
                    Eşit Böl ({splitCount} Kişi)
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.customSplit}>
                    {splitAmounts.map((amount, index) => (
                      <div key={index} className={styles.splitInput}>
                        <label>Kişi {index + 1}</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            const newAmounts = [...splitAmounts]
                            newAmounts[index] = e.target.value
                            setSplitAmounts(newAmounts)
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                  <div className={styles.splitSummary}>
                    <div>Toplam: {formatCurrency(splitAmounts.reduce((s, a) => s + (parseFloat(a) || 0), 0))}</div>
                    <div>Hedef: {formatCurrency(order.total)}</div>
                  </div>
                  <button className={styles.actionBtn} onClick={handleSplitCustom}>
                    <Split size={18} />
                    Hesabı Böl
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

