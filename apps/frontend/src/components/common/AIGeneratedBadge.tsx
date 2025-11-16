import { Sparkles, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIGeneratedBadgeProps {
  type: 'music' | 'image' | 'text';
  provider?: 'OpenAI' | 'Suno AI' | 'OpenAI DALL-E';
  model?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const AIGeneratedBadge = ({ 
  type, 
  provider, 
  model,
  className = '',
  variant = 'default'
}: AIGeneratedBadgeProps) => {
  
  const getProviderInfo = () => {
    switch (type) {
      case 'music':
        return { provider: provider || 'Suno AI', model: model || 'v4.5 Plus', icon: '🎵' };
      case 'image':
        return { provider: provider || 'OpenAI DALL-E', model: model || '3', icon: '🎨' };
      case 'text':
        return { provider: provider || 'OpenAI', model: model || 'GPT-4.1', icon: '✍️' };
    }
  };

  const info = getProviderInfo();

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs cursor-help ${className}`}>
              <Sparkles className="h-3 w-3" />
              <span>IA</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">Contenu généré par IA</p>
              <p className="text-xs">
                {info.icon} Créé par <strong>{info.provider}</strong> {info.model && `(${info.model})`}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Ce contenu a été généré automatiquement par intelligence artificielle. 
                Il peut contenir des imprécisions et doit être vérifié.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5 ${className}`}>
      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">Généré par IA</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-primary cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Conformité AI Act (UE 2024)</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Fournisseur :</strong> {info.provider}</p>
                    {info.model && <p><strong>Modèle :</strong> {info.model}</p>}
                    <p className="mt-2 text-muted-foreground">
                      Ce contenu a été généré automatiquement par intelligence artificielle selon 
                      l'Article 52 du Règlement IA européen. Il peut contenir des erreurs factuelles 
                      ou des imprécisions. Vérifiez toujours avec des sources officielles.
                    </p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground">
          {info.icon} {info.provider} {info.model && `• ${info.model}`}
        </p>
      </div>
    </div>
  );
};
