
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { completeIC2Item } from '@/scripts/audit/completeIC2Item';

interface AuditIC2CompletionDashboardProps {
  onComplete?: () => void;
}

export const AuditIC2CompletionDashboard = ({ onComplete }: AuditIC2CompletionDashboardProps) => {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    
    try {
      console.log('🚀 Lancement de la complétion IC-2 depuis le dashboard...');
      const finalReport = await completeIC2Item();
      
      if (finalReport.completeness === 100) {
        setCompleted(true);
        console.log('🎉 IC-2 complété avec succès depuis le dashboard !');
        // Rafraîchir l'audit parent
        if (onComplete) {
          setTimeout(onComplete, 1000);
        }
      } else {
        setError(`Complétude à ${finalReport.completeness}% - Des éléments peuvent encore manquer`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion');
      console.error('❌ Erreur dashboard:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <Card className="p-4 border-success/30 bg-success/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-success font-medium">IC-2 complété à 100% !</span>
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
      <Card className="p-4 border-destructive/30 bg-destructive/10 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive text-sm">{error}</span>
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
    <Card className="p-4 border-primary/30 bg-primary/10 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-primary font-medium text-sm">
              Compléter automatiquement IC-2
            </span>
            <span className="text-primary/70 text-xs">
              Compléter depuis Supabase les éléments IC-2 manquants
            </span>
          </div>
        </div>
        <Button onClick={handleComplete} disabled={completing} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${completing ? 'animate-spin' : ''}`} />
          {completing ? 'Complétion...' : 'Compléter'}
        </Button>
      </div>
    </Card>
  );
};
