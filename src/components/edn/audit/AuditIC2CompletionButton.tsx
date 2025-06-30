
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { completeIC2Item } from '@/scripts/audit/completeIC2Item';

export const AuditIC2CompletionButton = () => {
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    
    try {
      console.log('🚀 Lancement de la complétion IC-2...');
      const finalReport = await completeIC2Item();
      
      if (finalReport.completeness === 100) {
        setCompleted(true);
        console.log('🎉 IC-2 complété avec succès !');
      } else {
        setError(`Complétude à ${finalReport.completeness}% - Des éléments peuvent encore manquer`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la completion');
      console.error('❌ Erreur:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <Card className="p-4 border-green-200 bg-green-50">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">IC-2 complété à 100% selon E-LiSA !</span>
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
          <span className="text-blue-800">Compléter automatiquement IC-2 selon E-LiSA</span>
        </div>
        <Button onClick={handleComplete} disabled={completing} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${completing ? 'animate-spin' : ''}`} />
          {completing ? 'Complétion...' : 'Compléter'}
        </Button>
      </div>
    </Card>
  );
};
