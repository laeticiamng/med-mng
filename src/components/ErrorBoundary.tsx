import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

declare const process: { env: { NODE_ENV?: string } }
interface Props {
  children: ReactNode
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
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })

    // Log vers service de monitoring si disponible
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-xl shadow-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Oups ! Une erreur s'est produite
              </h2>
              
              <p className="text-gray-600 mb-6">
                Ne vous inquiétez pas, nos équipes ont été automatiquement notifiées. 
                Vous pouvez essayer de recharger la page ou retourner à l'accueil.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-50 p-4 rounded-lg mb-6">
                  <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                    Détails techniques (développement)
                  </summary>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Réessayer
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleReload}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Recharger
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="btn-secondary flex items-center justify-center"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Accueil
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                ID d'erreur: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
