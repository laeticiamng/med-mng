import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react'

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface FeedbackMessageProps {
  type: FeedbackType
  title?: string
  message: string
  actions?: React.ReactNode
  onDismiss?: () => void
  autoHide?: boolean
  duration?: number
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader
}

const colorMap = {
  success: 'text-green-600 bg-green-50 border-green-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  loading: 'text-purple-600 bg-purple-50 border-purple-200'
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  title,
  message,
  actions,
  onDismiss,
  autoHide = true,
  duration = 5000
}) => {
  const Icon = iconMap[type]

  React.useEffect(() => {
    if (autoHide && onDismiss && type !== 'loading') {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [autoHide, onDismiss, duration, type])

  return (
    <div className={`feedback-message ${colorMap[type]}`}>
      <div className="feedback-content">
        <Icon className={`feedback-icon ${type === 'loading' ? 'animate-spin' : ''}`} />

        <div className="feedback-text">
          {title && <h3 className="feedback-title">{title}</h3>}
          <p className="feedback-message-text">{message}</p>
          {actions && <div className="feedback-actions">{actions}</div>}
        </div>

        {onDismiss && type !== 'loading' && (
          <button onClick={onDismiss} className="feedback-dismiss">
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// États vides
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => (
  <div className="empty-state">
    {icon && <div className="empty-state-icon">{icon}</div>}
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-description">{description}</p>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
)
