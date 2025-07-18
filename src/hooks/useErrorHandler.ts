import { useState, useCallback } from 'react'

interface ErrorState {
  error: string | null
  isError: boolean
}

interface UseErrorHandlerReturn {
  error: string | null
  isError: boolean
  setError: (error: string) => void
  clearError: () => void
  handleAsyncError: <T>(promise: Promise<T>) => Promise<T | null>
  withErrorHandling: <T extends any[]>(
    fn: (...args: T) => Promise<any>
  ) => (...args: T) => Promise<void>
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
  })

  const setError = useCallback((error: string) => {
    console.error('🚨 Error:', error)
    setErrorState({ error, isError: true })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({ error: null, isError: false })
  }, [])

  const handleAsyncError = useCallback(async <T>(
    promise: Promise<T>
  ): Promise<T | null> => {
    try {
      clearError()
      return await promise
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(message)
      return null
    }
  }, [setError, clearError])

  const withErrorHandling = useCallback(<T extends any[]>(
    fn: (...args: T) => Promise<any>
  ) => {
    return async (...args: T): Promise<void> => {
      try {
        clearError()
        await fn(...args)
      } catch (error: any) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue'
        setError(message)
      }
    }
  }, [setError, clearError])

  return {
    error: errorState.error,
    isError: errorState.isError,
    setError,
    clearError,
    handleAsyncError,
    withErrorHandling,
  }
}
