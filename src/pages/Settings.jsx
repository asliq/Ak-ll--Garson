import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  ChefHat,
  Clock,
  RefreshCw,
  Monitor,
  Palette,
  Shield,
  Database,
  Trash2,
  Save,
  Check,
  Info,
  ClipboardList
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { useAppStore } from '../store/useAppStore'
import { useCurrentUser } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import styles from './Settings.module.css'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Settings() {
  const currentUser = useCurrentUser()
  
  // Store'dan state'ler
  const theme = useAppStore((state) => state.theme)
  const setTheme = useAppStore((state) => state.setTheme)
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const soundEnabled = useAppStore((state) => state.soundEnabled)
  const toggleSound = useAppStore((state) => state.toggleSound)
  const kitchenAutoRefresh = useAppStore((state) => state.kitchenAutoRefresh)
  const setKitchenAutoRefresh = useAppStore((state) => state.setKitchenAutoRefresh)
  const kitchenRefreshInterval = useAppStore((state) => state.kitchenRefreshInterval)
  const setKitchenRefreshInterval = useAppStore((state) => state.setKitchenRefreshInterval)

  // Local state for unsaved changes
  const [hasChanges, setHasChanges] = useState(false)

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    toast.success(`Tema ${newTheme === 'dark' ? 'Koyu' : 'Açık'} olarak değiştirildi`)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    toast.success(`Dil ${newLanguage === 'tr' ? 'Türkçe' : 'English'} olarak değiştirildi`)
  }

  const handleSoundToggle = () => {
    toggleSound()
    toast.success(soundEnabled ? 'Sesler kapatıldı' : 'Sesler açıldı')
  }

  const handleAutoRefreshToggle = () => {
    setKitchenAutoRefresh(!kitchenAutoRefresh)
    toast.success(kitchenAutoRefresh ? 'Otomatik yenileme kapatıldı' : 'Otomatik yenileme açıldı')
  }

  const handleRefreshIntervalChange = (interval) => {
    setKitchenRefreshInterval(interval)
    toast.success(`Yenileme sıklığı ${interval / 1000} saniye olarak ayarlandı`)
  }

  const handleClearCache = () => {
    localStorage.removeItem('akilli-garson-storage')
    toast.success('Önbellek temizlendi! Sayfa yenileniyor...')
    setTimeout(() => window.location.reload(), 1000)
  }

  const refreshIntervalOptions = [
    { value: 5000, label: '5 saniye' },
    { value: 10000, label: '10 saniye' },
    { value: 15000, label: '15 saniye' },
    { value: 30000, label: '30 saniye' },
    { value: 60000, label: '1 dakika' },
  ]

  return (
    <motion.div 
      className={styles.settings}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Profil Bölümü */}
      <motion.div variants={item}>
        <Card className={styles.profileCard}>
          <CardContent>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                {currentUser?.avatar || '👤'}
              </div>
              <div className={styles.profileInfo}>
                <h2>{currentUser?.name || 'Kullanıcı'}</h2>
                <p>{currentUser?.email || 'email@example.com'}</p>
                <span className={styles.profileRole}>
                  {currentUser?.shift === 'morning' ? '☀️ Sabah Vardiyası' : '🌙 Akşam Vardiyası'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ayarlar Grid */}
      <div className={styles.settingsGrid}>
        {/* Görünüm Ayarları */}
        <motion.div variants={item}>
          <Card className={styles.settingsCard}>
            <CardContent>
              <div className={styles.cardHeader}>
                <Palette size={22} />
                <h3>Görünüm</h3>
              </div>

              {/* Tema */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Tema</span>
                  <span className={styles.settingDesc}>Arayüz rengini seçin</span>
                </div>
                <div className={styles.themeSwitch}>
                  <button
                    className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <Moon size={18} />
                    <span>Koyu</span>
                  </button>
                  <button
                    className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <Sun size={18} />
                    <span>Açık</span>
                  </button>
                </div>
              </div>

              {/* Dil */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Dil</span>
                  <span className={styles.settingDesc}>Arayüz dilini seçin</span>
                </div>
                <div className={styles.languageSwitch}>
                  <button
                    className={`${styles.langBtn} ${language === 'tr' ? styles.active : ''}`}
                    onClick={() => handleLanguageChange('tr')}
                  >
                    🇹🇷 Türkçe
                  </button>
                  <button
                    className={`${styles.langBtn} ${language === 'en' ? styles.active : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bildirim Ayarları */}
        <motion.div variants={item}>
          <Card className={styles.settingsCard}>
            <CardContent>
              <div className={styles.cardHeader}>
                <Bell size={22} />
                <h3>Bildirimler</h3>
              </div>

              {/* Sesler */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Bildirim Sesleri</span>
                  <span className={styles.settingDesc}>Yeni sipariş ve uyarı sesleri</span>
                </div>
                <button 
                  className={`${styles.toggleBtn} ${soundEnabled ? styles.on : styles.off}`}
                  onClick={handleSoundToggle}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  <span>{soundEnabled ? 'Açık' : 'Kapalı'}</span>
                  <div className={styles.toggleTrack}>
                    <div className={styles.toggleThumb} />
                  </div>
                </button>
              </div>

              {/* Bildirim Türleri */}
              <div className={styles.notificationTypes}>
                <label className={styles.checkItem}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.checkmark}><Check size={12} /></span>
                  <span>Yeni sipariş bildirimleri</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.checkmark}><Check size={12} /></span>
                  <span>Sipariş hazır bildirimleri</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.checkmark}><Check size={12} /></span>
                  <span>Garson çağrı bildirimleri</span>
                </label>
                <label className={styles.checkItem}>
                  <input type="checkbox" />
                  <span className={styles.checkmark}><Check size={12} /></span>
                  <span>Rezervasyon hatırlatmaları</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mutfak Ekranı Ayarları */}
        <motion.div variants={item}>
          <Card className={styles.settingsCard}>
            <CardContent>
              <div className={styles.cardHeader}>
                <ChefHat size={22} />
                <h3>Mutfak Ekranı</h3>
              </div>

              {/* Otomatik Yenileme */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Otomatik Yenileme</span>
                  <span className={styles.settingDesc}>Siparişleri otomatik güncelle</span>
                </div>
                <button 
                  className={`${styles.toggleBtn} ${kitchenAutoRefresh ? styles.on : styles.off}`}
                  onClick={handleAutoRefreshToggle}
                >
                  <RefreshCw size={18} />
                  <span>{kitchenAutoRefresh ? 'Açık' : 'Kapalı'}</span>
                  <div className={styles.toggleTrack}>
                    <div className={styles.toggleThumb} />
                  </div>
                </button>
              </div>

              {/* Yenileme Sıklığı */}
              {kitchenAutoRefresh && (
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>Yenileme Sıklığı</span>
                    <span className={styles.settingDesc}>Ne sıklıkla güncellensin</span>
                  </div>
                  <div className={styles.intervalOptions}>
                    {refreshIntervalOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.intervalBtn} ${kitchenRefreshInterval === option.value ? styles.active : ''}`}
                        onClick={() => handleRefreshIntervalChange(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Görünüm Modu */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Görünüm Modu</span>
                  <span className={styles.settingDesc}>Ekran düzeni</span>
                </div>
                <div className={styles.viewModeOptions}>
                  <button className={`${styles.viewModeBtn} ${styles.active}`}>
                    <Monitor size={16} />
                    <span>Grid</span>
                  </button>
                  <button className={styles.viewModeBtn}>
                    <ClipboardList size={16} />
                    <span>Liste</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sistem Ayarları */}
        <motion.div variants={item}>
          <Card className={styles.settingsCard}>
            <CardContent>
              <div className={styles.cardHeader}>
                <Database size={22} />
                <h3>Sistem</h3>
              </div>

              {/* Önbellek */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Önbellek</span>
                  <span className={styles.settingDesc}>Yerel verileri temizle</span>
                </div>
                <button 
                  className={styles.dangerBtn}
                  onClick={handleClearCache}
                >
                  <Trash2 size={16} />
                  <span>Temizle</span>
                </button>
              </div>

              {/* Versiyon */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>Versiyon</span>
                  <span className={styles.settingDesc}>Akıllı Garson v1.0.0</span>
                </div>
                <span className={styles.versionBadge}>
                  <Check size={14} />
                  Güncel
                </span>
              </div>

              {/* API Durumu */}
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>API Durumu</span>
                  <span className={styles.settingDesc}>localhost:3001</span>
                </div>
                <span className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  Bağlı
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Hakkında */}
      <motion.div variants={item}>
        <Card className={styles.aboutCard}>
          <CardContent>
            <div className={styles.aboutContent}>
              <div className={styles.aboutLogo}>
                <ChefHat size={40} />
              </div>
              <div className={styles.aboutInfo}>
                <h3>Akıllı Garson</h3>
                <p>Modern restoran yönetim sistemi</p>
                <div className={styles.techStack}>
                  <span>React</span>
                  <span>TanStack Query</span>
                  <span>Zustand</span>
                  <span>Framer Motion</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

