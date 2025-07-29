import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Eye, Keyboard, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AccessibilityIssue {
  id: string;
  type: 'contrast' | 'keyboard' | 'aria' | 'focus' | 'semantic';
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

interface AccessibilityCheckerProps {
  autoCheck?: boolean;
  onIssueFixed?: (issueId: string) => void;
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  autoCheck = true,
  onIssueFixed
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [score, setScore] = useState<number>(0);
  const { toast } = useToast();

  const checkAccessibility = async () => {
    setChecking(true);
    const foundIssues: AccessibilityIssue[] = [];

    try {
      // Vérification des contrastes de couleurs
      const checkContrast = () => {
        const elements = document.querySelectorAll('*');
        elements.forEach((element, index) => {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Simulation de vérification de contraste
          if (color && backgroundColor && 
              color !== 'rgba(0, 0, 0, 0)' && 
              backgroundColor !== 'rgba(0, 0, 0, 0)') {
            
            // Mock: considérer que certains éléments ont un faible contraste
            if (index % 15 === 0) {
              foundIssues.push({
                id: `contrast-${index}`,
                type: 'contrast',
                severity: 'error',
                element: element.tagName.toLowerCase(),
                description: 'Contraste insuffisant entre le texte et l\'arrière-plan',
                suggestion: 'Utiliser des couleurs avec un ratio de contraste d\'au moins 4.5:1',
                wcagLevel: 'AA'
              });
            }
          }
        });
      };

      // Vérification des attributs ARIA
      const checkAria = () => {
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        interactiveElements.forEach((element, index) => {
          if (!element.getAttribute('aria-label') && 
              !element.getAttribute('aria-labelledby') &&
              !element.textContent?.trim()) {
            foundIssues.push({
              id: `aria-${index}`,
              type: 'aria',
              severity: 'warning',
              element: element.tagName.toLowerCase(),
              description: 'Élément interactif sans label accessible',
              suggestion: 'Ajouter un aria-label ou aria-labelledby',
              wcagLevel: 'A'
            });
          }
        });
      };

      // Vérification de la navigation clavier
      const checkKeyboardNavigation = () => {
        const focusableElements = document.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
          if (element.getAttribute('tabindex') === '-1' && 
              !element.hasAttribute('aria-hidden')) {
            foundIssues.push({
              id: `keyboard-${index}`,
              type: 'keyboard',
              severity: 'warning',
              element: element.tagName.toLowerCase(),
              description: 'Élément non accessible via le clavier',
              suggestion: 'Retirer tabindex="-1" ou ajouter aria-hidden="true"',
              wcagLevel: 'A'
            });
          }
        });
      };

      // Vérification de la structure sémantique
      const checkSemantics = () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let previousLevel = 0;
        
        headings.forEach((heading, index) => {
          const currentLevel = parseInt(heading.tagName[1]);
          if (currentLevel > previousLevel + 1) {
            foundIssues.push({
              id: `semantic-${index}`,
              type: 'semantic',
              severity: 'warning',
              element: heading.tagName.toLowerCase(),
              description: `Saut de niveau de titre (h${previousLevel} → h${currentLevel})`,
              suggestion: 'Respecter l\'ordre hiérarchique des titres',
              wcagLevel: 'AA'
            });
          }
          previousLevel = currentLevel;
        });
      };

      // Exécuter toutes les vérifications
      checkContrast();
      checkAria();
      checkKeyboardNavigation();
      checkSemantics();

      // Simulation d'attente pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIssues(foundIssues);
      
      // Calculer le score d'accessibilité
      const totalElements = document.querySelectorAll('*').length;
      const errorWeight = 10;
      const warningWeight = 5;
      const infoWeight = 1;
      
      const totalScore = foundIssues.reduce((sum, issue) => {
        switch (issue.severity) {
          case 'error': return sum + errorWeight;
          case 'warning': return sum + warningWeight;
          case 'info': return sum + infoWeight;
          default: return sum;
        }
      }, 0);
      
      const maxPossibleScore = totalElements * errorWeight;
      const calculatedScore = Math.max(0, Math.round(100 - (totalScore / maxPossibleScore * 100)));
      setScore(calculatedScore);

      toast({
        title: "Audit d'accessibilité terminé",
        description: `${foundIssues.length} problème${foundIssues.length > 1 ? 's' : ''} détecté${foundIssues.length > 1 ? 's' : ''} - Score: ${calculatedScore}/100`,
      });

    } catch (error) {
      toast({
        title: "Erreur d'audit",
        description: "Impossible de vérifier l'accessibilité",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const fixIssue = (issueId: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== issueId));
    onIssueFixed?.(issueId);
    
    toast({
      title: "Problème corrigé",
      description: "L'élément a été marqué comme corrigé",
    });
  };

  const getSeverityColor = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'contrast': return <Eye className="h-4 w-4" />;
      case 'keyboard': return <Keyboard className="h-4 w-4" />;
      case 'aria': return <Volume2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    if (autoCheck) {
      checkAccessibility();
    }
  }, [autoCheck]);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            Audit d'accessibilité
          </div>
          {score > 0 && (
            <div className={cn("text-lg font-bold", getScoreColor(score))}>
              {score}/100
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checking ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Analyse en cours...</p>
            </div>
          </div>
        ) : (
          <>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 py-4">
                <CheckCircle className="h-5 w-5" />
                <span>Aucun problème d'accessibilité détecté</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {issues.filter(i => i.severity === 'error').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Erreurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {issues.filter(i => i.severity === 'warning').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Avertissements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {issues.filter(i => i.severity === 'info').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Infos</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div 
                      key={issue.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(issue.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(issue.severity)}>
                              {issue.severity}
                            </Badge>
                            <Badge variant="outline">WCAG {issue.wcagLevel}</Badge>
                            <Badge variant="secondary">{issue.element}</Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{issue.description}</p>
                          <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fixIssue(issue.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="flex justify-center pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={checkAccessibility}
                disabled={checking}
              >
                Relancer l'audit
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};