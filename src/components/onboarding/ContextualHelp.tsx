import React, { useState, useEffect, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { sanitizeHtml } from '@/utils/sanitize';
import { supabase } from '@/integrations/supabase/client';

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
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();

  // Load dismissal status from Supabase
  const loadDismissalStatus = useCallback(async () => {
    if (!helpKey) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const dismissed = localStorage.getItem(`help_dismissed_${helpKey}`);
      setIsDismissed(!!dismissed);
      return;
    }

    const { data } = await (supabase as any)
      .from('user_feature_tracking')
      .select('is_dismissed')
      .eq('user_id', user.id)
      .eq('feature_key', `help_${helpKey}`)
      .maybeSingle();

    setIsDismissed(data?.is_dismissed || false);
  }, [helpKey]);

  useEffect(() => {
    loadDismissalStatus();
  }, [loadDismissalStatus]);

  useEffect(() => {
    const loadHelpContent = async () => {
      if (!helpKey) return;

      // Essayer de charger depuis Supabase (table non typée)
      const { data: helpData } = await (supabase as any)
        .from('help_tips')
        .select('*')
        .eq('key', helpKey)
        .maybeSingle();

      if (helpData) {
        setHelpContent({
          id: helpData.id,
          key: helpData.key,
          title: helpData.title,
          body: helpData.body,
          route: helpData.route
        });
      } else {
        // Utiliser les props si pas de données en base
        setHelpContent({
          id: crypto.randomUUID(),
          key: helpKey,
          title: title || 'Aide',
          body: content || '',
          route: location.pathname
        });
      }
    };

    loadHelpContent();
  }, [helpKey, location.pathname, title, content]);

  const shouldShow = () => {
    return !isDismissed && (helpContent || content);
  };

  const dismissHelp = async () => {
    if (!helpKey) {
      setIsVisible(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.setItem(`help_dismissed_${helpKey}`, 'true');
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    await (supabase as any)
      .from('user_feature_tracking')
      .upsert({
        user_id: user.id,
        feature_key: `help_${helpKey}`,
        is_dismissed: true,
        last_visited_at: new Date().toISOString()
      }, { onConflict: 'user_id,feature_key' });

    setIsDismissed(true);
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