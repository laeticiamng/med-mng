/**
 * Bouton d'annulation de génération avec appel API
 * Annule côté frontend ET backend (edge function)
 */

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CancelGenerationButtonProps {
  taskId?: string;
  rang?: 'A' | 'B' | 'AB';
  onCancel: () => void;
  className?: string;
}

export const CancelGenerationButton: React.FC<CancelGenerationButtonProps> = ({
  taskId,
  rang,
  onCancel,
  className
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    
    try {
      // 1. Annuler côté frontend immédiatement
      onCancel();
      
      // 2. Si on a un taskId, annuler côté backend aussi
      if (taskId) {
        const { data, error } = await supabase.functions.invoke('cancel-ia-task', {
          body: {
            task_id: taskId,
            task_type: 'music',
            reason: `Annulation manuelle par utilisateur - Rang ${rang || 'inconnu'}`
          }
        });

        if (error) {
          console.warn('[CancelGenerationButton] Erreur annulation backend:', error);
          // On continue quand même - l'annulation frontend a eu lieu
        } else if (data?.credits_refunded > 0) {
          toast.success(`Génération annulée - ${data.credits_refunded} crédits remboursés`);
          return;
        }
      }
      
      toast.info('Génération annulée');
    } catch (err) {
      console.error('[CancelGenerationButton] Erreur:', err);
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={isCancelling}
      className={cn(
        "text-destructive hover:text-destructive hover:bg-destructive/10 gap-1",
        className
      )}
      title="Annuler la génération"
    >
      {isCancelling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Annuler</span>
    </Button>
  );
};
