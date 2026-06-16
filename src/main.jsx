import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { NotificationProvider } from './components/NotificationProvider'
import { ThemeProvider } from './components/ThemeProvider'
import { WebSocketProvider } from './components/WebSocketProvider'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

// TanStack Query Client - Akıllı cache ve retry stratejisi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Veri 5 dakika boyunca "fresh" kabul edilir
      staleTime: 1000 * 60 * 5,
      // Cache 30 dakika boyunca saklanır
      gcTime: 1000 * 60 * 30,
      // Ağ hatası durumunda 3 kez dene
      retry: 3,
      // Sayfa odağı değiştiğinde yeniden fetch
      refetchOnWindowFocus: true,
      // Bağlantı yeniden kurulduğunda fetch
      refetchOnReconnect: true,
    },
    mutations: {
      // Mutasyon hatalarında retry yapma
      retry: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <WebSocketProvider>
              <NotificationProvider>
                <App />
                <Toaster 
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-lg)',
                  },
                }}
              />
              </NotificationProvider>
            </WebSocketProvider>
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

