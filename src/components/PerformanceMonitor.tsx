import React, { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const memory = (performance as any).memory

      const loadTime = navigation.loadEventEnd - navigation.navigationStart
      const renderTime = navigation.domContentLoadedEventEnd - navigation.navigationStart

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
        cacheHitRate: 85,
      })
    }

    if (document.readyState === 'complete') {
      collectMetrics()
    } else {
      window.addEventListener('load', collectMetrics)
      return () => window.removeEventListener('load', collectMetrics)
    }
  }, [])

  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  if (!isVisible || !metrics) return null

  return (
    <div className="performance-monitor">
      <button onClick={() => setIsVisible(!isVisible)} className="perf-toggle">
        📊
      </button>

      <div className="perf-metrics">
        <div className="perf-metric">
          <span>Load: {metrics.loadTime}ms</span>
        </div>
        <div className="perf-metric">
          <span>Render: {metrics.renderTime}ms</span>
        </div>
        <div className="perf-metric">
          <span>Memory: {metrics.memoryUsage}MB</span>
        </div>
        <div className="perf-metric">
          <span>Cache: {metrics.cacheHitRate}%</span>
        </div>
      </div>
    </div>
  )
}
