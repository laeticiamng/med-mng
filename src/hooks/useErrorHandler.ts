import { useState, useCallback } from 'react'

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err: Error | string) => {
    const message = err instanceof Error ? err.message : err
    setError(message)
    console.error('Error:', message)
  }, [])

  return {
    error,
    setError,
    clearError,
    handleError
  }
}
