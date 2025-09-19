import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRateLimitCountdown } from '@/hooks/useRateLimitCountdown';
import { Clock, ShieldAlert, X } from 'lucide-react';
import { useMemo } from 'react';

type RateLimitScope = 'music' | 'quiz' | 'comic' | 'export' | 'library' | 'generic';

const SCOPE_STYLES: Record<RateLimitScope, { label: string; badgeClass: string }> = {
  music: { label: 'génération musicale', badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-300/80' },
  quiz: { label: 'quiz interactif', badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-300/80' },
  comic: { label: 'bande dessinée', badgeClass: 'bg-violet-500/10 text-violet-700 border-violet-300/80' },
  export: { label: 'export de données', badgeClass: 'bg-slate-500/10 text-slate-700 border-slate-300/80' },
  library: { label: 'bibliothèque', badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/80' },
  generic: { label: 'plateforme', badgeClass: 'bg-slate-500/10 text-slate-700 border-slate-300/80' },
};

interface RateLimitNoticeProps {
  scope?: RateLimitScope;
  message: string;
  retryAt?: number | null;
  retryAfterSeconds?: number;
  onDismiss?: () => void;
}

function formatRemaining(seconds: number): string {
  if (seconds <= 0) {
    return 'quelques instants';
  }

  if (seconds < 60) {
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (remaining === 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return `${minutes} min ${remaining.toString().padStart(2, '0')} s`;
}

export const RateLimitNotice = ({
  scope = 'generic',
  message,
  retryAt,
  retryAfterSeconds,
  onDismiss,
}: RateLimitNoticeProps) => {
  const countdown = useRateLimitCountdown({ retryAt, fallbackSeconds: retryAfterSeconds });
  const style = SCOPE_STYLES[scope] ?? SCOPE_STYLES.generic;

  const subtitle = useMemo(() => {
    if (retryAt || retryAfterSeconds) {
      return `Nouvelle tentative possible dans ${formatRemaining(countdown)}.`;
    }
    return 'Réessayez dès que la fenêtre de rafraîchissement est révolue.';
  }, [retryAt, retryAfterSeconds, countdown]);

  return (
    <Alert
      variant="warning"
      className="border-amber-300/80 bg-amber-50 text-amber-900 shadow-sm"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-amber-600">
          <ShieldAlert className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <AlertTitle className="text-sm font-semibold tracking-tight">
              Limite de requêtes atteinte
            </AlertTitle>
            <Badge variant="outline" className={cn('text-xs font-medium', style.badgeClass)}>
              {style.label}
            </Badge>
          </div>
          <AlertDescription className="space-y-1 text-sm">
            <p>{message}</p>
            <p className="flex items-center gap-2 text-xs text-amber-700">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {subtitle}
            </p>
          </AlertDescription>
        </div>
        {onDismiss && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-amber-700 hover:bg-amber-100"
            onClick={onDismiss}
            aria-label="Masquer l'alerte de limite"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Alert>
  );
};

RateLimitNotice.displayName = 'RateLimitNotice';
