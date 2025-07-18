import React, { useEffect, useState } from 'react'

interface ErrorNotificationProps {
  error: string | null
  onDismiss: () => void
  autoHide?: boolean
  duration?: number
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  autoHide = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)

      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onDismiss, 300)
        }, duration)

        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoHide, duration, onDismiss])

  if (!error) return null

  return (
    <div className={`error-notification ${isVisible ? 'visible' : 'hidden'}`}>\
      <div className="error-content">
        <div className="error-icon">❌</div>
        <div className="error-text">
          <strong>Erreur</strong>
          <p>{error}</p>
        </div>
        <button onClick={onDismiss} className="error-close">
          ✕
        </button>
      </div>
    </div>
  )
}

const styles = `
.error-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  transition: all 0.3s ease;
}

.error-notification.visible {
  opacity: 1;
  transform: translateX(0);
}

.error-notification.hidden {
  opacity: 0;
  transform: translateX(100%);
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
`

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.innerHTML = styles
  document.head.appendChild(styleElement)
}
