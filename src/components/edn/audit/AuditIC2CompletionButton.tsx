
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { completeIC2Item } from '@/scripts/audit/completeIC2Item';

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
      const finalReport = await completeIC2Item();
      
      if (finalReport.completeness === 100) {
        setCompleted(true);
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
      } else {
        setError(`Complétude à ${finalReport.completeness}% - Des éléments peuvent encore manquer`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion');
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <Card className="p-4 border-success/20 bg-success/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-success font-medium">IC-2 complété à 100% selon E-LiSA !</span>
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
      <Card className="p-4 border-destructive/20 bg-destructive/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">{error}</span>
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
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-primary font-medium">
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
