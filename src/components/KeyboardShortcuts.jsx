import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function KeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd kombinasyonları
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch(e.key.toLowerCase()) {
          case 'k':
            e.preventDefault()
            toast('🔍 Hızlı arama (yakında)')
            break
          case 'n':
            e.preventDefault()
            navigate('/tables')
            toast.success('📋 Masalar sayfasına gidildi')
            break
          case 's':
            e.preventDefault()
            navigate('/settings')
            toast.success('⚙️ Ayarlar açıldı')
            break
          case 'h':
            e.preventDefault()
            navigate('/')
            toast.success('🏠 Anasayfa')
            break
          case 'm':
            e.preventDefault()
            navigate('/menu')
            toast.success('🍽️ Menü yönetimi')
            break
        }
      }

      // Rakam tuşları (masa kısayolları)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) {
          const target = document.activeElement
          if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
            e.preventDefault()
            toast(`Masa ${num}'e git (yakında)`)
          }
        }
      }

      // ESC tuşu
      if (e.key === 'Escape') {
        // Dialog/Modal kapatma
        const dialogs = document.querySelectorAll('[role="dialog"]')
        if (dialogs.length > 0) {
          e.preventDefault()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [navigate])

  return null
}

// Klavye kısayolları yardım modali
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  if (!isOpen) return null

  const shortcuts = [
    { key: 'Ctrl+H', desc: 'Anasayfa' },
    { key: 'Ctrl+N', desc: 'Masalar' },
    { key: 'Ctrl+M', desc: 'Menü Yönetimi' },
    { key: 'Ctrl+S', desc: 'Ayarlar' },
    { key: '1-9', desc: 'Masaya git' },
    { key: 'ESC', desc: 'Dialog kapat' },
  ]

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000
      }} onClick={onClose} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 1001,
        minWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>⌨️ Klavye Kısayolları</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shortcuts.map(({ key, desc }) => (
            <div key={key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius)'
            }}>
              <span>{desc}</span>
              <kbd style={{
                padding: '0.25rem 0.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                fontFamily: 'monospace'
              }}>{key}</kbd>
            </div>
          ))}
        </div>
        <button 
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Kapat
        </button>
      </div>
    </>
  )
}

