import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}

export const useShallowMemo = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const prevDepsRef = useRef<React.DependencyList>()
  const valueRef = useRef<T>()

  const hasChanged =
    !prevDepsRef.current ||
    deps.length !== prevDepsRef.current.length ||
    deps.some((dep, index) => dep !== prevDepsRef.current![index])

  if (hasChanged) {
    valueRef.current = factory()
    prevDepsRef.current = deps
  }

  return valueRef.current!
}

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now())

  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay]) as T
}
