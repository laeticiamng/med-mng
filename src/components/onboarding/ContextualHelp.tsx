import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/sanitize';

interface HelpTip {
  id: string;
  key: string;
  title: string;
  body: string;
  route?: string;
  element?: string;
}

interface ContextualHelpProps {
  helpKey?: string;
  children: React.ReactNode;
  content?: string;
  title?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  helpKey,
  children,
  content,
  title,
  side = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [helpContent, setHelpContent] = useState<HelpTip | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (helpKey) {
      loadContextualHelp();
    }
  }, [helpKey, location.pathname]);

  const loadContextualHelp = async () => {
    try {
      // Simulate API call to get contextual help
      // In real implementation, this would call the help endpoint
      const mockHelp: HelpTip = {
        id: '1',
        key: helpKey || '',
        title: title || 'Aide',
        body: content || 'Contenu d\'aide contextuelle',
        route: location.pathname
      };
      setHelpContent(mockHelp);
    } catch (error) {
      console.error('Error loading contextual help:', error);
    }
  };

  const shouldShow = () => {
    const dismissed = localStorage.getItem(`help_dismissed_${helpKey}`);
    return !dismissed && (helpContent || content);
  };

  const dismissHelp = () => {
    if (helpKey) {
      localStorage.setItem(`help_dismissed_${helpKey}`, 'true');
    }
    setIsVisible(false);
  };

  const helpText = helpContent?.body || content;
  const helpTitle = helpContent?.title || title;

  if (!helpText) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isVisible} onOpenChange={setIsVisible}>
        <TooltipTrigger asChild>
          <div className="relative inline-block">
            {children}
            {shouldShow() && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 p-0"
                onClick={() => setIsVisible(true)}
              >
                <HelpCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="medical-card max-w-sm p-4 shadow-lg"
        >
          <div className="space-y-2">
            {helpTitle && (
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-medical-primary">{helpTitle}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissHelp}
                  className="h-4 w-4 p-0 text-medical-secondary hover:text-medical-primary"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div 
              className="text-sm text-medical-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(helpText || '') }}
            />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};