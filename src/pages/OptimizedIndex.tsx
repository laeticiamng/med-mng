import React from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { cn } from '@/lib/utils';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useAdvancedAccessibility } from '@/hooks/useAdvancedAccessibility';
import { useUserPreferences } from '@/hooks/useUserPreferences';

/**
 * Optimized Index page with performance monitoring and accessibility features
 */
const OptimizedIndex: React.FC = () => {
  const { metrics, isOptimized } = usePerformanceOptimization();
  const { settings: accessibilitySettings } = useAdvancedAccessibility();
  const { preferences } = useUserPreferences();

  return (
    <div className={cn(
      "min-h-screen bg-background",
      accessibilitySettings.highContrast && "high-contrast",
      accessibilitySettings.reducedMotion && "reduced-motion"
    )}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Optimized Medical Management Platform
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Performance Metrics */}
          <div className="medical-card p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Load Time:</span>
                <span className={metrics.loadTime < 3000 ? "text-success" : "text-warning"}>
                  {metrics.loadTime}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Optimization:</span>
                <span className={isOptimized ? "status-success" : "status-warning"}>
                  {isOptimized ? "Optimized" : "Needs Optimization"}
                </span>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="medical-card p-6">
            <h2 className="text-xl font-semibold mb-4">Accessibility</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>High Contrast:</span>
                <span className={accessibilitySettings.highContrast ? "status-success" : "text-muted-foreground"}>
                  {accessibilitySettings.highContrast ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reduced Motion:</span>
                <span className={accessibilitySettings.reducedMotion ? "status-success" : "text-muted-foreground"}>
                  {accessibilitySettings.reducedMotion ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          <div className="medical-card p-6">
            <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Theme:</span>
                <span className="capitalize">{preferences.theme}</span>
              </div>
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="capitalize">{preferences.language}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-muted-foreground text-center">
            Welcome to the optimized medical management platform with enhanced accessibility and performance monitoring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizedIndex;