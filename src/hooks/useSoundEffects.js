import { useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { soundEffects } from '../utils/soundUtils'

/**
 * Ses efektleri hook'u — soundEnabled ayarını kontrol eder
 */
export function useSoundEffects() {
  const soundEnabled = useAppStore((state) => state.soundEnabled)

  const play = useCallback((soundName) => {
    if (!soundEnabled) return
    const fn = soundEffects[soundName]
    if (fn) fn()
  }, [soundEnabled])

  return { play }
}
