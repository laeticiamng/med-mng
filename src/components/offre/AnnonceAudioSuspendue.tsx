import { PauseCircle } from 'lucide-react';
import { MESSAGE_GENERATION_SUSPENDUE } from '@/config/offre';
import { cn } from '@/lib/utils';

/**
 * Affiché à la place de toute action de génération audio pendant la suspension ciblée
 * (décision CEO du 09.10.2026, supabase/functions/_shared/mm-disponibilite.ts).
 */
export function AnnonceAudioSuspendue({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm',
        className
      )}
      role="note"
      data-testid="annonce-audio-suspendue"
    >
      <PauseCircle
        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="font-medium text-foreground">
          Génération audio momentanément suspendue
        </p>
        <p className="text-muted-foreground">{MESSAGE_GENERATION_SUSPENDUE}</p>
      </div>
    </div>
  );
}

export default AnnonceAudioSuspendue;
