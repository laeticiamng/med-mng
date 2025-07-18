import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Error Boundary:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })

    this.logError(error, errorInfo)
  }

  private logError(error: Error, errorInfo: any) {
    try {
      fetch('/api/logs/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      })
    } catch (err) {
      console.error('Failed to log error:', err)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Oups ! Quelque chose s'est mal passé</h2>
            <p className="error-message">
              Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Détails techniques</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-secondary">
                Réessayer
              </button>
              <button onClick={this.handleReload} className="btn-primary">
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
