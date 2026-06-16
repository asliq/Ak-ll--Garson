import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function ThemeProvider({ children }) {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    // Tema değiştiğinde document'e uygula
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return children
}

