import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'currentColor'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className={`loading-spinner ${sizeClasses[size]}`}>
      <svg className="animate-spin" fill="none" viewBox="0 0 24 24" style={{ color }}>
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  showLabel?: boolean
  label?: string
  color?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  label,
  color = '#6366f1'
}) => {
  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-header">
          <span className="progress-label">{label || 'Progression'}</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      )}

      <div className="progress-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  )
}

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = ''
}) => {
  return (
    <div className={`skeleton ${className}`} style={{ width, height }} />
  )
}

export const CardSkeleton: React.FC = () => (
  <div className="card-skeleton">
    <Skeleton height="200px" className="mb-4" />
    <Skeleton height="1.5rem" width="70%" className="mb-2" />
    <Skeleton height="1rem" width="50%" className="mb-4" />
    <div className="flex gap-2">
      <Skeleton height="2rem" width="80px" />
      <Skeleton height="2rem" width="80px" />
    </div>
  </div>
)
