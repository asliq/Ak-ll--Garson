import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, X, Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './VoiceCommand.module.css'

// Voice commands mapping
const voiceCommands = {
  'anasayfa': { action: 'navigate', path: '/' },
  'dashboard': { action: 'navigate', path: '/' },
  'masalar': { action: 'navigate', path: '/tables' },
  'siparişler': { action: 'navigate', path: '/orders' },
  'siparis': { action: 'navigate', path: '/orders' },
  'mutfak': { action: 'navigate', path: '/kitchen' },
  'menü': { action: 'navigate', path: '/menu' },
  'menu': { action: 'navigate', path: '/menu' },
  'rezervasyon': { action: 'navigate', path: '/reservations' },
  'raporlar': { action: 'navigate', path: '/analytics' },
  'analiz': { action: 'navigate', path: '/analytics' },
  'ayarlar': { action: 'navigate', path: '/settings' },
  'yenile': { action: 'refresh' },
  'çıkış': { action: 'logout' }
}

export function VoiceCommand() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const navigate = useNavigate()

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  // Process voice command
  const processCommand = useCallback((text) => {
    const normalizedText = text.toLowerCase().trim()
    
    // Find matching command
    for (const [keyword, command] of Object.entries(voiceCommands)) {
      if (normalizedText.includes(keyword)) {
        setIsProcessing(true)
        
        setTimeout(() => {
          switch (command.action) {
            case 'navigate':
              setFeedback({ type: 'success', message: `"${keyword}" sayfasına gidiliyor...` })
              setTimeout(() => {
                navigate(command.path)
                setIsProcessing(false)
                setFeedback(null)
              }, 800)
              break
            case 'refresh':
              setFeedback({ type: 'success', message: 'Sayfa yenileniyor...' })
              setTimeout(() => {
                window.location.reload()
              }, 800)
              break
            case 'logout':
              setFeedback({ type: 'warning', message: 'Çıkış yapılıyor...' })
              break
            default:
              setIsProcessing(false)
          }
        }, 500)
        
        return true
      }
    }
    
    setFeedback({ type: 'error', message: 'Komut anlaşılamadı' })
    setTimeout(() => setFeedback(null), 2000)
    return false
  }, [navigate])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'tr-TR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setFeedback(null)
    }

    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1]
      const text = current[0].transcript
      setTranscript(text)
      
      if (current.isFinal) {
        processCommand(text)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      setFeedback({ type: 'error', message: 'Mikrofon hatası' })
      setTimeout(() => setFeedback(null), 2000)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Speech recognition start error:', error)
    }
  }, [isSupported, processCommand])

  if (!isSupported) {
    return null // Don't render if not supported
  }

  return (
    <>
      {/* Voice Button */}
      <motion.button
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
        onClick={startListening}
        disabled={isListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Mic size={20} />
          </motion.div>
        ) : (
          <Mic size={20} />
        )}
      </motion.button>

      {/* Listening Modal */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className={styles.micAnimation}>
                <motion.div
                  className={styles.micCircle}
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.2, 0.5]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <motion.div
                  className={styles.micCircle}
                  animate={{ 
                    scale: [1.1, 1.5, 1.1],
                    opacity: [0.3, 0.1, 0.3]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                />
                <div className={styles.micIcon}>
                  <Mic size={32} />
                </div>
              </div>

              <p className={styles.listening}>Dinleniyor...</p>
              
              {transcript && (
                <motion.p 
                  className={styles.transcript}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  "{transcript}"
                </motion.p>
              )}

              <div className={styles.hints}>
                <span>Örnek: "Masalar", "Siparişler", "Mutfak"</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`${styles.feedback} ${styles[feedback.type]}`}
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
          >
            {isProcessing ? (
              <Loader size={16} className={styles.spin} />
            ) : (
              <Volume2 size={16} />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

