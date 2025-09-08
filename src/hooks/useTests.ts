/**
 * 🧪 TESTING UTILITIES - MED-MNG v3.0
 * Hooks et utilitaires pour les tests automatisés
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

// ==========================================
// TYPES
// ==========================================

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: string;
  assertion?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface ComponentTestOptions {
  timeout?: number;
  retries?: number;
  skipInProduction?: boolean;
  logResults?: boolean;
}

// ==========================================
// COMPONENT TESTING HOOK
// ==========================================

export const useComponentTest = (
  componentName: string,
  options: ComponentTestOptions = {}
) => {
  const {
    timeout = 5000,
    retries = 2,
    skipInProduction = true,
    logResults = true
  } = options;

  const [results, setResults] = useState<TestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const testsRef = useRef<Array<() => Promise<TestResult>>>([]);

  // Skip tests in production unless explicitly enabled
  const shouldSkip = skipInProduction && import.meta.env.PROD;

  const addTest = useCallback((
    testName: string,
    testFn: () => Promise<void> | void,
    assertion?: string
  ) => {
    if (shouldSkip) return;

    const wrappedTest = async (): Promise<TestResult> => {
      const startTime = performance.now();
      let attempt = 0;

      while (attempt <= retries) {
        try {
          await Promise.race([
            Promise.resolve(testFn()),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Test timeout')), timeout)
            )
          ]);

          const duration = performance.now() - startTime;
          return {
            name: testName,
            status: 'passed',
            duration,
            assertion
          };
        } catch (error) {
          attempt++;
          if (attempt > retries) {
            const duration = performance.now() - startTime;
            return {
              name: testName,
              status: 'failed',
              duration,
              error: error instanceof Error ? error.message : String(error),
              assertion
            };
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }

      // This should never be reached, but TypeScript requires it
      return {
        name: testName,
        status: 'failed',
        duration: performance.now() - startTime,
        error: 'Unexpected error'
      };
    };

    testsRef.current.push(wrappedTest);
  }, [shouldSkip, retries, timeout]);

  const runTests = useCallback(async (): Promise<TestSuite> => {
    if (shouldSkip) {
      return {
        name: componentName,
        tests: [],
        duration: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      };
    }

    setIsRunning(true);
    const startTime = performance.now();
    
    const testResults: TestResult[] = [];
    
    for (const test of testsRef.current) {
      try {
        const result = await test();
        testResults.push(result);
      } catch (error) {
        testResults.push({
          name: 'Unknown test',
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const duration = performance.now() - startTime;
    const suite: TestSuite = {
      name: componentName,
      tests: testResults,
      duration,
      passed: testResults.filter(t => t.status === 'passed').length,
      failed: testResults.filter(t => t.status === 'failed').length,
      skipped: testResults.filter(t => t.status === 'skipped').length
    };

    setResults(suite);
    setIsRunning(false);

    if (logResults) {
      logger.info('testing', `Component tests completed: ${componentName}`, {
        passed: suite.passed,
        failed: suite.failed,
        duration: Math.round(suite.duration),
        tests: suite.tests.map(t => ({
          name: t.name,
          status: t.status,
          duration: Math.round(t.duration)
        }))
      });
    }

    return suite;
  }, [componentName, shouldSkip, logResults]);

  return {
    addTest,
    runTests,
    results,
    isRunning,
    isSkipped: shouldSkip
  };
};

// ==========================================
// PERFORMANCE TESTING HOOK
// ==========================================

export const usePerformanceTest = (componentName: string) => {
  const [metrics, setMetrics] = useState<{
    renderTime: number[];
    memoryUsage: number[];
    interactionTime: number[];
  }>({
    renderTime: [],
    memoryUsage: [],
    interactionTime: []
  });

  const measureRender = useCallback((callback: () => void) => {
    const startTime = performance.now();
    callback();
    const renderTime = performance.now() - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: [...prev.renderTime.slice(-9), renderTime] // Keep last 10
    }));

    if (renderTime > 16) { // More than one frame
      logger.warn('performance', `Slow render detected in ${componentName}`, {
        renderTime: Math.round(renderTime)
      });
    }

    return renderTime;
  }, [componentName]);

  const measureInteraction = useCallback((
    interactionName: string,
    callback: () => Promise<void> | void
  ) => {
    return new Promise<number>((resolve) => {
      const startTime = performance.now();
      
      Promise.resolve(callback()).then(() => {
        const interactionTime = performance.now() - startTime;
        
        setMetrics(prev => ({
          ...prev,
          interactionTime: [...prev.interactionTime.slice(-9), interactionTime]
        }));

        logger.debug('performance', `Interaction measured: ${interactionName}`, {
          component: componentName,
          duration: Math.round(interactionTime)
        });

        resolve(interactionTime);
      });
    });
  }, [componentName]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: [...prev.memoryUsage.slice(-9), usedMB]
      }));

      return usedMB;
    }
    return 0;
  }, []);

  const getAverages = useCallback(() => {
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
    
    return {
      avgRenderTime: Math.round(avg(metrics.renderTime) * 100) / 100,
      avgMemoryUsage: Math.round(avg(metrics.memoryUsage) * 100) / 100,
      avgInteractionTime: Math.round(avg(metrics.interactionTime) * 100) / 100,
      sampleCount: {
        renders: metrics.renderTime.length,
        interactions: metrics.interactionTime.length,
        memory: metrics.memoryUsage.length
      }
    };
  }, [metrics]);

  return {
    measureRender,
    measureInteraction,
    measureMemory,
    getAverages,
    metrics
  };
};

// ==========================================
// ACCESSIBILITY TESTING HOOK
// ==========================================

export const useAccessibilityTest = (elementRef: React.RefObject<HTMLElement>) => {
  const [issues, setIssues] = useState<Array<{
    type: 'error' | 'warning';
    message: string;
    element?: string;
  }>>([]);

  const checkAccessibility = useCallback(async () => {
    if (!elementRef.current) return [];

    const element = elementRef.current;
    const newIssues: typeof issues = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt) {
        newIssues.push({
          type: 'error',
          message: 'Image missing alt attribute',
          element: `img[${index}]`
        });
      }
    });

    // Check for missing labels on inputs
    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach((input, index) => {
      const hasLabel = input.id && element.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        newIssues.push({
          type: 'error',
          message: 'Form input missing accessible label',
          element: `${input.tagName.toLowerCase()}[${index}]`
        });
      }
    });

    // Check for missing focus management
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const firstFocusable = focusableElements[0] as HTMLElement;
      if (!firstFocusable.matches(':focus-visible')) {
        // This is just a warning as focus might be elsewhere
        newIssues.push({
          type: 'warning',
          message: 'Consider focus management for better keyboard navigation'
        });
      }
    }

    // Check color contrast (simplified check)
    const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    textElements.forEach((elem, index) => {
      const styles = window.getComputedStyle(elem);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simple check for very light text on light background
      if (color.includes('rgb(255') && backgroundColor.includes('rgb(255')) {
        newIssues.push({
          type: 'warning',
          message: 'Potential color contrast issue detected',
          element: `${elem.tagName.toLowerCase()}[${index}]`
        });
      }
    });

    setIssues(newIssues);

    if (newIssues.length > 0) {
      logger.warn('accessibility', 'Accessibility issues found', {
        issues: newIssues.length,
        errors: newIssues.filter(i => i.type === 'error').length,
        warnings: newIssues.filter(i => i.type === 'warning').length,
        details: newIssues
      });
    }

    return newIssues;
  }, [elementRef]);

  return {
    checkAccessibility,
    issues,
    hasErrors: issues.some(i => i.type === 'error'),
    hasWarnings: issues.some(i => i.type === 'warning')
  };
};

// ==========================================
// TEST UTILITIES
// ==========================================

export const createMockData = <T>(template: T, count: number = 1): T[] => {
  return Array.from({ length: count }, (_, index) => ({
    ...template,
    id: `mock-${index}`,
    createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
  }));
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitForElement = (
  selector: string,
  timeout: number = 5000
): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

// ==========================================
// INTEGRATION TESTING
// ==========================================

export const useIntegrationTest = () => {
  const runApiTest = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const duration = performance.now() - startTime;
      const success = response.ok;

      logger.info('testing', `API test completed: ${endpoint}`, {
        status: response.status,
        success,
        duration: Math.round(duration)
      });

      return {
        success,
        status: response.status,
        duration,
        data: response.ok ? await response.json() : null
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.error('testing', `API test failed: ${endpoint}`, {
        error: error instanceof Error ? error.message : String(error),
        duration: Math.round(duration)
      });

      return {
        success: false,
        status: 0,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }, []);

  return { runApiTest };
};

// ==========================================
// AUTO-TEST SETUP
// ==========================================

// Run automated tests in development
if (import.meta.env.DEV) {
  logger.info('testing', '🧪 Testing utilities loaded', {
    environment: 'development',
    features: ['component', 'performance', 'accessibility', 'integration']
  });
}