import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Info,
    Shield,
    X,
    XCircle,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

interface AlertBannerProps {
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  action?: React.ReactNode;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'system' | 'security' | 'performance' | 'user' | 'maintenance';
  onDismiss?: () => void;
  onAction?: () => void;
}

export function AlertBanner({
  type,
  title,
  message,
  action,
  dismissible = true,
  autoHide = false,
  autoHideDelay = 5000,
  priority = 'medium',
  category = 'system',
  onDismiss,
  onAction
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'maintenance':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-warning/80 text-foreground';
      case 'low':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getAnimationClass = () => {
    if (type === 'critical' || priority === 'urgent') {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`relative ${getAnimationClass()}`}
    >
      <div className="flex items-start space-x-3 w-full">
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTitle className="text-base font-semibold">
              {title}
            </AlertTitle>
            
            {/* Badges */}
            <div className="flex items-center space-x-1">
              <Badge className={`text-xs ${getPriorityColor()}`}>
                {priority}
              </Badge>
              
              {getCategoryIcon() && (
                <Badge variant="outline" className="text-xs">
                  {getCategoryIcon()}
                  <span className="ml-1 capitalize">{category}</span>
                </Badge>
              )}
            </div>
          </div>

          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>

          {/* Auto-hide progress */}
          {autoHide && autoHideDelay > 0 && (
            <div className="mt-2">
              <div 
                className="h-1 bg-current opacity-30 rounded-full overflow-hidden"
              >
                <div 
                  className="h-full bg-current animate-[shrink_linear] opacity-60"
                  style={{ 
                    animation: `shrink ${autoHideDelay}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {action && (
            <div onClick={onAction}>
              {action}
            </div>
          )}

          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-background/20"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fermer</span>
            </Button>
          )}
        </div>
      </div>

      {/* Critical alert additional styling */}
      {type === 'critical' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-destructive rounded animate-pulse" />
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </Alert>
  );
}