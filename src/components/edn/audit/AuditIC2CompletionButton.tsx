
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { completeIC2Item } from '@/scripts/audit/completeIC2Item';
import { logger } from '@/lib/logger';

interface AuditIC2CompletionButtonProps {
  onComplete?: () => void;
}

export const AuditIC2CompletionButton = ({ onComplete }: AuditIC2CompletionButtonProps) => {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    
    try {
      logger.info('Starting IC-2 completion', {
        component: 'AuditIC2CompletionButton',
        action: 'complete_ic2'
      });
      const finalReport = await completeIC2Item();
      
      if (finalReport.completeness === 100) {
        setCompleted(true);
        logger.info('IC-2 completed successfully', {
          component: 'AuditIC2CompletionButton',
          action: 'completion_success',
          metadata: { completeness: finalReport.completeness }
        });
        // Rafraîchir l'audit parent
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
      } else {
        setError(`Complétude à ${finalReport.completeness}% - Des éléments peuvent encore manquer`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion');
      logger.error('IC-2 completion failed', {
        component: 'AuditIC2CompletionButton',
        action: 'completion_error',
        metadata: { error: err instanceof Error ? err.message : 'Unknown error' }
      });
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">IC-2 complété à 100% selon E-LiSA !</span>
          </div>
          <Button 
            onClick={() => setCompleted(false)} 
            size="sm"
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-red-200 bg-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
          <Button 
            onClick={handleComplete} 
            disabled={completing}
            size="sm"
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span className="text-blue-800 font-medium">
            Compléter automatiquement depuis Supabase les éléments IC-2 manquants
          </span>
        </div>
        <Button onClick={handleComplete} disabled={completing} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${completing ? 'animate-spin' : ''}`} />
          {completing ? 'Complétion...' : 'Compléter'}
        </Button>
      </div>
    </Card>
  );
};
