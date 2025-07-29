import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DuplicateItem {
  id: string;
  type: 'music' | 'quiz' | 'bd' | 'roman' | 'scene';
  original: string;
  duplicate: string;
  similarity: number;
  location: {
    page: string;
    section: string;
  };
}

interface DuplicateContentDetectorProps {
  onDuplicateRemoved?: (id: string) => void;
}

export const DuplicateContentDetector: React.FC<DuplicateContentDetectorProps> = ({
  onDuplicateRemoved
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  // Simulation de détection de doublons (à remplacer par vraie logique)
  const mockDuplicates: DuplicateItem[] = [
    {
      id: 'dup-1',
      type: 'music',
      original: 'Lecteur musical principal',
      duplicate: 'Lecteur musical secondaire', 
      similarity: 98,
      location: { page: '/med-mng/library', section: 'content-top' }
    },
    {
      id: 'dup-2', 
      type: 'quiz',
      original: 'Quiz principal',
      duplicate: 'Quiz en doublon',
      similarity: 100,
      location: { page: '/med-mng/library', section: 'content-bottom' }
    }
  ];

  const scanForDuplicates = async () => {
    setScanning(true);
    
    try {
      // Simulation du scan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Détection basée sur le DOM
      const contentElements = document.querySelectorAll('[data-content-type]');
      const duplicateElements: DuplicateItem[] = [];
      
      contentElements.forEach((element, index) => {
        const contentType = element.getAttribute('data-content-type') as DuplicateItem['type'];
        const contentText = element.textContent?.trim() || '';
        
        // Chercher des éléments similaires
        contentElements.forEach((otherElement, otherIndex) => {
          if (index !== otherIndex && 
              otherElement.getAttribute('data-content-type') === contentType &&
              otherElement.textContent?.trim() === contentText &&
              contentText.length > 10) {
            
            duplicateElements.push({
              id: `dup-${index}-${otherIndex}`,
              type: contentType,
              original: `Élément ${index + 1}`,
              duplicate: `Élément ${otherIndex + 1}`,
              similarity: 100,
              location: {
                page: window.location.pathname,
                section: element.closest('[data-section]')?.getAttribute('data-section') || 'unknown'
              }
            });
          }
        });
      });
      
      // Ajouter les doublons mockés pour la démonstration
      setDuplicates([...duplicateElements, ...mockDuplicates]);
      
      toast({
        title: "Scan terminé",
        description: `${duplicateElements.length + mockDuplicates.length} doublons détectés`,
      });
    } catch (error) {
      toast({
        title: "Erreur de scan",
        description: "Impossible de scanner les doublons",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const removeDuplicate = (duplicateId: string) => {
    const duplicate = duplicates.find(d => d.id === duplicateId);
    if (!duplicate) return;

    // Supprimer du DOM (simulation)
    const elementsToRemove = document.querySelectorAll(
      `[data-content-type="${duplicate.type}"][data-section="${duplicate.location.section}"]`
    );
    
    if (elementsToRemove.length > 1) {
      // Supprimer le dernier élément (considéré comme doublon)
      elementsToRemove[elementsToRemove.length - 1].remove();
    }

    // Mettre à jour l'état
    setDuplicates(prev => prev.filter(d => d.id !== duplicateId));
    
    toast({
      title: "Doublon supprimé",
      description: `${duplicate.type} en doublon retiré`,
    });

    onDuplicateRemoved?.(duplicateId);
  };

  const getSeverityColor = (similarity: number) => {
    if (similarity >= 95) return 'destructive';
    if (similarity >= 80) return 'secondary';
    return 'outline';
  };

  const getTypeIcon = (type: DuplicateItem['type']) => {
    switch (type) {
      case 'music': return '🎵';
      case 'quiz': return '❓';
      case 'bd': return '📚';
      case 'roman': return '📖';
      case 'scene': return '🎭';
      default: return '📄';
    }
  };

  useEffect(() => {
    // Scan automatique au chargement
    scanForDuplicates();
  }, []);

  if (duplicates.length === 0 && !scanning) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Aucun doublon détecté</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scanForDuplicates}
            className="mt-2"
          >
            Relancer le scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Détection de doublons
          {scanning && <span className="text-sm text-muted-foreground">(Scan en cours...)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scanning ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {duplicates.map((duplicate) => (
              <div 
                key={duplicate.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg">{getTypeIcon(duplicate.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(duplicate.similarity)}>
                        {duplicate.similarity}% similaire
                      </Badge>
                      <Badge variant="outline">{duplicate.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Original:</strong> {duplicate.original}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Doublon:</strong> {duplicate.duplicate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      📍 {duplicate.location.page} → {duplicate.location.section}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDuplicate(duplicate.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Supprimer le doublon ${duplicate.type}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                {duplicates.length} doublon{duplicates.length > 1 ? 's' : ''} détecté{duplicates.length > 1 ? 's' : ''}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={scanForDuplicates}
                disabled={scanning}
              >
                Relancer le scan
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};