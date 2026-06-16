import React from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.state = { hasError: true, error, errorInfo }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={40} style={{ color: '#ef4444' }} />
            </div>
            
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Bir Hata Oluştu
            </h1>
            
            <p style={{
              color: 'var(--text-muted)',
              marginBottom: '1.5rem'
            }}>
              Uygulama beklenmedik bir hata ile karşılaştı
            </p>
            
            {this.state.error && (
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                overflow: 'auto'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: '#ef4444',
                  marginBottom: '0.5rem'
                }}>
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <details style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'monospace'
                  }}>
                    <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                      Stack Trace
                    </summary>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--accent-gold)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

