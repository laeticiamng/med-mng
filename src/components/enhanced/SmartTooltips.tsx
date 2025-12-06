import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, Lightbulb, Zap, Star } from 'lucide-react';

/**
 * Système de Tooltips Intelligents avec Contexte
 */
interface SmartTooltipProps {
  children: React.ReactNode;
  content: string;
  type?: 'info' | 'tip' | 'shortcut' | 'advanced';
  shortcut?: string | null;
  advanced?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  children, 
  content, 
  type = 'info', 
  shortcut = null, 
  advanced = false,
  side = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'tip': return <Lightbulb className="w-3 h-3 text-warning" />;
      case 'shortcut': return <Zap className="w-3 h-3 text-primary" />;
      case 'advanced': return <Star className="w-3 h-3 text-accent" />;
      default: return <Info className="w-3 h-3 text-primary" />;
    }
  };

  const getTooltipClass = () => {
    switch (type) {
      case 'tip': return 'bg-warning/10 border-warning/20 text-warning-foreground';
      case 'shortcut': return 'bg-primary/5 border-primary/20 text-primary';
      case 'advanced': return 'bg-accent/10 border-accent/20 text-accent-foreground';
      default: return 'bg-background border-border text-foreground';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip 
        open={isVisible} 
        onOpenChange={setIsVisible}
        delayDuration={300}
      >
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className={`max-w-xs p-3 ${getTooltipClass()}`}
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {getIcon()}
              <div className="flex-1">
                <p className="text-sm">{content}</p>
                
                {shortcut && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs opacity-70">Raccourci:</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {shortcut}
                    </Badge>
                  </div>
                )}
                
                {advanced && (
                  <div className="mt-2 text-xs opacity-70">
                    💡 Fonctionnalité avancée disponible
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Tooltips Contextuels Prédéfinis
 */
export const SmartTooltips = {
  Dashboard: (props) => (
    <SmartTooltip
      content="Tableau de bord avec métriques temps réel et analytics avancés"
      type="info"
      shortcut="⌘+D"
      {...props}
    />
  ),
  
  MusicGeneration: (props) => (
    <SmartTooltip
      content="Créez des contenus musicaux thérapeutiques personnalisés avec IA"
      type="tip"
      shortcut="⌘+M"
      advanced={true}
      {...props}
    />
  ),
  
  SystemMonitoring: (props) => (
    <SmartTooltip
      content="Surveillance système avancée avec alertes intelligentes"
      type="advanced"
      shortcut="⌘+S"
      {...props}
    />
  ),
  
  DataExport: (props) => (
    <SmartTooltip
      content="Export et sauvegarde sécurisés des données de la plateforme"
      type="info"
      advanced={true}
      {...props}
    />
  ),
  
  QuickNavigation: (props) => (
    <SmartTooltip
      content="Navigation rapide et raccourcis intelligents"
      type="shortcut"
      shortcut="⌘+K"
      {...props}
    />
  ),
  
  Notifications: (props) => (
    <SmartTooltip
      content="Centre de notifications avec filtres avancés et actions rapides"
      type="info"
      {...props}
    />
  ),
  
  Help: (props) => (
    <SmartTooltip
      content="Centre d'aide interactif avec tutoriels et support"
      type="tip"
      shortcut="⌘+/"
      {...props}
    />
  )
};

export default SmartTooltip;