/**
 * Web Audio API ile bildirim sesleri
 * Hiçbir harici dosya gerektirmez — saf JavaScript ile sentezlenir
 */

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  // iOS/Chrome'da suspended olabilir, resume et
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone({ freq = 440, type = 'sine', duration = 0.3, volume = 0.25, delay = 0 }) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(0, ctx.currentTime + delay)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  } catch {
    // Ses başlatılamıyorsa sessizce devam et
  }
}

export const soundEffects = {
  /** Yeni sipariş — çift ding */
  newOrder: () => {
    playTone({ freq: 880, type: 'sine', duration: 0.25, volume: 0.3, delay: 0 })
    playTone({ freq: 1100, type: 'sine', duration: 0.25, volume: 0.3, delay: 0.28 })
  },

  /** Sipariş hazır — üçlü bip */
  orderReady: () => {
    for (let i = 0; i < 3; i++) {
      playTone({ freq: 1200, type: 'square', duration: 0.1, volume: 0.2, delay: i * 0.16 })
    }
  },

  /** Ödeme tamamlandı — yükselen nota */
  payment: () => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      playTone({ freq, type: 'triangle', duration: 0.15, volume: 0.2, delay: i * 0.12 })
    })
  },

  /** Uyarı / düşük stok */
  warning: () => {
    playTone({ freq: 440, type: 'sawtooth', duration: 0.4, volume: 0.2, delay: 0 })
    playTone({ freq: 330, type: 'sawtooth', duration: 0.4, volume: 0.2, delay: 0.45 })
  },

  /** Başarı — tek ding */
  success: () => {
    playTone({ freq: 1047, type: 'sine', duration: 0.4, volume: 0.25, delay: 0 })
  },

  /** Hata */
  error: () => {
    playTone({ freq: 220, type: 'square', duration: 0.5, volume: 0.2, delay: 0 })
  },
}
