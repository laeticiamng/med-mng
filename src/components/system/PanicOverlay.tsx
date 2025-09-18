import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PanicState } from '@/hooks/usePanicMonitor';

interface PanicOverlayProps {
  state: PanicState;
  retryCountdown: number;
  onRetry: () => Promise<void> | void;
}

export function PanicOverlay({ state, retryCountdown, onRetry }: PanicOverlayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !state.visible) {
    return null;
  }

  const isWaiting = retryCountdown > 0;
  const severityStyles = state.severity === 'recovering'
    ? {
        gradient: 'from-amber-500/25 via-background to-background',
        accent: 'bg-amber-600/30 text-white',
        badge: 'bg-amber-500/30 text-white',
        indicator: 'bg-amber-200',
      }
    : {
        gradient: 'from-red-600/25 via-background to-background',
        accent: 'bg-red-600/30 text-white',
        badge: 'bg-red-500/30 text-white',
        indicator: 'bg-red-100',
      };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md text-white"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="panic-overlay-title"
      aria-describedby="panic-overlay-description"
    >
      <div className={`max-w-2xl w-full mx-4 rounded-2xl border border-white/20 bg-gradient-to-br ${severityStyles.gradient} shadow-2xl`}>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${severityStyles.accent}`}>
              <AlertTriangle className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <h2 id="panic-overlay-title" className="text-2xl font-semibold">
                Incident en cours
              </h2>
              <p
                id="panic-overlay-description"
                className="text-sm text-white/80"
                aria-live="assertive"
              >
                {state.message || 'La plateforme est momentanément indisponible.'}
              </p>
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-white/70">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${severityStyles.badge}`}>
                  <span className={`h-2 w-2 rounded-full ${severityStyles.indicator}`} aria-hidden />
                  {state.severity === 'recovering' ? 'Rétablissement en cours' : 'Incident critique'}
                </span>
                {state.lastTriggeredAt && (
                  <span className="text-white/60">
                    Dernier signal: {new Date(state.lastTriggeredAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {state.summary && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-white/60">Services suivis</p>
                <p className="text-lg font-semibold">{state.summary.total_services}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-white/60">Incidents détectés</p>
                <p className="text-lg font-semibold text-red-200">{state.summary.errors}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-white/60">Services opérationnels</p>
                <p className="text-lg font-semibold text-emerald-200">{state.summary.healthy}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-white/60">Dernière vérification</p>
                <p className="text-lg font-semibold">
                  {state.lastCheckAt
                    ? new Date(state.lastCheckAt).toLocaleTimeString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}

          {state.details && (
            <div className="rounded-lg bg-white/5 p-4 text-sm text-white/80 whitespace-pre-line">
              {state.details}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <RefreshCcw className="h-4 w-4 animate-spin" aria-hidden />
              <span>
                {isWaiting
                  ? `Nouvelle tentative automatique dans ${retryCountdown} seconde${retryCountdown > 1 ? 's' : ''}`
                  : 'Vous pouvez relancer une vérification maintenant.'}
              </span>
            </div>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              disabled={isWaiting}
              onClick={() => onRetry()}
            >
              Relancer le diagnostic
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
