import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  Grid3X3,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Bell,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  RefreshCw,
  Command,
  ArrowRight,
  Hash
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useLogout } from '../hooks/useAuth'
import styles from './CommandPalette.module.css'

const commands = [
  // Navigation
  { id: 'nav-dashboard', label: 'Anasayfa', description: 'Dashboard\'a git', icon: LayoutDashboard, category: 'Navigasyon', action: 'navigate', path: '/', shortcut: 'G D' },
  { id: 'nav-tables', label: 'Masalar', description: 'Masa yönetimine git', icon: Grid3X3, category: 'Navigasyon', action: 'navigate', path: '/tables', shortcut: 'G T' },
  { id: 'nav-orders', label: 'Siparişler', description: 'Sipariş listesine git', icon: ClipboardList, category: 'Navigasyon', action: 'navigate', path: '/orders', shortcut: 'G O' },
  { id: 'nav-kitchen', label: 'Mutfak', description: 'Mutfak ekranına git', icon: ChefHat, category: 'Navigasyon', action: 'navigate', path: '/kitchen', shortcut: 'G K' },
  { id: 'nav-menu', label: 'Menü Yönetimi', description: 'Menü düzenle', icon: UtensilsCrossed, category: 'Navigasyon', action: 'navigate', path: '/menu', shortcut: 'G M' },
  { id: 'nav-reservations', label: 'Rezervasyonlar', description: 'Rezervasyon yönetimi', icon: CalendarDays, category: 'Navigasyon', action: 'navigate', path: '/reservations', shortcut: 'G R' },
  { id: 'nav-analytics', label: 'Raporlar', description: 'Analitik ve raporlar', icon: BarChart3, category: 'Navigasyon', action: 'navigate', path: '/analytics', shortcut: 'G A' },
  { id: 'nav-settings', label: 'Ayarlar', description: 'Sistem ayarları', icon: Settings, category: 'Navigasyon', action: 'navigate', path: '/settings', shortcut: 'G S' },
  
  // Actions
  { id: 'action-new-order', label: 'Yeni Sipariş', description: 'Hızlı sipariş oluştur', icon: Plus, category: 'Eylemler', action: 'new-order', shortcut: 'N' },
  { id: 'action-refresh', label: 'Verileri Yenile', description: 'Tüm verileri güncelle', icon: RefreshCw, category: 'Eylemler', action: 'refresh', shortcut: 'R' },
  { id: 'action-notifications', label: 'Bildirimler', description: 'Bildirimleri aç', icon: Bell, category: 'Eylemler', action: 'notifications', shortcut: 'B' },
  
  // Settings
  { id: 'setting-theme', label: 'Tema Değiştir', description: 'Koyu/Açık tema', icon: Moon, category: 'Ayarlar', action: 'toggle-theme' },
  { id: 'setting-sound', label: 'Ses Aç/Kapat', description: 'Bildirim seslerini yönet', icon: Volume2, category: 'Ayarlar', action: 'toggle-sound' },
  
  // System
  { id: 'system-logout', label: 'Çıkış Yap', description: 'Oturumu sonlandır', icon: LogOut, category: 'Sistem', action: 'logout' },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  
  const soundEnabled = useAppStore((state) => state.soundEnabled)
  const toggleSound = useAppStore((state) => state.toggleSound)
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const logoutMutation = useLogout()

  // Filter commands
  const filteredCommands = commands.filter(cmd => {
    const searchStr = `${cmd.label} ${cmd.description} ${cmd.category}`.toLowerCase()
    return searchStr.includes(query.toLowerCase())
  })

  // Group by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
      
      // Quick navigation shortcuts (when palette is closed)
      if (!isOpen && !e.metaKey && !e.ctrlKey) {
        // G + key for navigation
        if (e.key === 'g') {
          window.__gPressed = true
          setTimeout(() => { window.__gPressed = false }, 500)
        }
        
        if (window.__gPressed) {
          const shortcuts = {
            'd': '/',
            't': '/tables',
            'o': '/orders',
            'k': '/kitchen',
            'm': '/menu',
            'r': '/reservations',
            'a': '/analytics',
            's': '/settings',
          }
          
          if (shortcuts[e.key]) {
            e.preventDefault()
            navigate(shortcuts[e.key])
            window.__gPressed = false
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, navigate])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle arrow keys
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        executeCommand(filteredCommands[selectedIndex])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands])

  const executeCommand = useCallback((cmd) => {
    if (!cmd) return
    
    switch (cmd.action) {
      case 'navigate':
        navigate(cmd.path)
        break
      case 'new-order':
        navigate('/tables')
        break
      case 'refresh':
        window.location.reload()
        break
      case 'toggle-theme':
        setTheme(theme === 'dark' ? 'light' : 'dark')
        break
      case 'toggle-sound':
        toggleSound()
        break
      case 'logout':
        logoutMutation.mutate()
        navigate('/login')
        break
      default:
        break
    }
    
    setIsOpen(false)
  }, [navigate, theme, setTheme, toggleSound, logoutMutation])

  return (
    <>
      {/* Trigger hint */}
      <div className={styles.triggerHint}>
        <Command size={12} />
        <span>K</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className={styles.palette}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
            >
              {/* Search Input */}
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Komut ara veya yaz..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelectedIndex(0)
                  }}
                  className={styles.searchInput}
                />
                <div className={styles.searchShortcut}>
                  <span>ESC</span>
                </div>
              </div>

              {/* Commands List */}
              <div className={styles.commandList}>
                {Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className={styles.commandGroup}>
                    <div className={styles.groupLabel}>{category}</div>
                    {cmds.map((cmd, idx) => {
                      const globalIdx = filteredCommands.indexOf(cmd)
                      const isSelected = globalIdx === selectedIndex
                      
                      return (
                        <button
                          key={cmd.id}
                          className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className={styles.commandIcon}>
                            <cmd.icon size={16} />
                          </div>
                          <div className={styles.commandContent}>
                            <span className={styles.commandLabel}>{cmd.label}</span>
                            <span className={styles.commandDesc}>{cmd.description}</span>
                          </div>
                          {cmd.shortcut && (
                            <div className={styles.commandShortcut}>
                              {cmd.shortcut.split(' ').map((key, i) => (
                                <span key={i}>{key}</span>
                              ))}
                            </div>
                          )}
                          {isSelected && (
                            <ArrowRight size={14} className={styles.selectArrow} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
                
                {filteredCommands.length === 0 && (
                  <div className={styles.noResults}>
                    <Hash size={32} />
                    <p>Sonuç bulunamadı</p>
                    <span>Farklı bir arama deneyin</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <div className={styles.footerHint}>
                  <span className={styles.key}>↑↓</span>
                  <span>Gezin</span>
                </div>
                <div className={styles.footerHint}>
                  <span className={styles.key}>↵</span>
                  <span>Seç</span>
                </div>
                <div className={styles.footerHint}>
                  <span className={styles.key}>ESC</span>
                  <span>Kapat</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

