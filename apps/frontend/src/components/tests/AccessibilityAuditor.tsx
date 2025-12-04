import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Eye, Keyboard, Volume2 } from 'lucide-react';

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'visual' | 'screen-reader' | 'general';
  message: string;
  element?: string;
  fix?: string;
}

export const AccessibilityAuditor: React.FC<{ enabled?: boolean }> = ({ 
  enabled = false 
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);

  const runAudit = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    const foundIssues: AccessibilityIssue[] = [];

    try {
      // Check for missing alt attributes
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      imagesWithoutAlt.forEach((img, index) => {
        foundIssues.push({
          type: 'error',
          category: 'screen-reader',
          message: `Image ${index + 1} manque d'attribut alt`,
          element: img.tagName.toLowerCase(),
          fix: 'Ajouter un attribut alt descriptif'
        });
      });

      // Check for buttons without accessible names
      const buttonsWithoutLabels = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
      buttonsWithoutLabels.forEach((btn, index) => {
        if (!btn.textContent?.trim()) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: `Bouton ${index + 1} sans nom accessible`,
            element: btn.tagName.toLowerCase(),
            fix: 'Ajouter aria-label ou du texte visible'
          });
        }
      });

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > previousLevel + 1) {
          foundIssues.push({
            type: 'warning',
            category: 'general',
            message: `Hiérarchie de titre sautée: ${heading.tagName} après H${previousLevel}`,
            element: heading.tagName.toLowerCase(),
            fix: 'Respecter l\'ordre hiérarchique des titres'
          });
        }
        previousLevel = level;
      });

      // Check for touch target sizes on mobile
      if (window.innerWidth < 768) {
        const smallTargets = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');
        smallTargets.forEach((target, index) => {
          const rect = target.getBoundingClientRect();
          if (rect.width < 44 || rect.height < 44) {
            foundIssues.push({
              type: 'warning',
              category: 'keyboard',
              message: `Cible tactile ${index + 1} trop petite (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
              element: target.tagName.toLowerCase(),
              fix: 'Agrandir à minimum 44x44px'
            });
          }
        });
      }

      // Check for form inputs without labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputsWithoutLabels.forEach((input, index) => {
        const associatedLabel = document.querySelector(`label[for="${input.id}"]`);
        if (!associatedLabel) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: `Champ de saisie ${index + 1} sans label associé`,
            element: input.tagName.toLowerCase(),
            fix: 'Associer un label ou ajouter aria-label'
          });
        }
      });

      // Check for sufficient color contrast (basic check)
      const elements = document.querySelectorAll('*');
      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // Basic contrast check (simplified)
        if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
          // This is a simplified check - in reality you'd need proper contrast calculation
          if (backgroundColor === color) {
            foundIssues.push({
              type: 'error',
              category: 'visual',
              message: 'Contraste insuffisant détecté',
              element: el.tagName.toLowerCase(),
              fix: 'Améliorer le contraste entre le texte et l\'arrière-plan'
            });
          }
        }
      });

    } catch (error) {
      // Log error only in development mode
      if (import.meta.env.DEV) {
        console.error('Erreur lors de l\'audit d\'accessibilité:', error);
      }
      foundIssues.push({
        type: 'error',
        category: 'general',
        message: 'Erreur lors de l\'exécution de l\'audit',
        fix: 'Vérifier la console pour plus de détails'
      });
    }

    setIssues(foundIssues);
    setLastAudit(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    if (enabled) {
      // Run audit automatically when enabled
      setTimeout(runAudit, 1000);
    }
  }, [enabled]);

  if (!enabled) return null;

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'keyboard': return <Keyboard className="h-4 w-4" />;
      case 'visual': return <Eye className="h-4 w-4" />;
      case 'screen-reader': return <Volume2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="fixed bottom-20 right-4 w-96 max-h-96 overflow-hidden z-40 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5" />
          Audit d'accessibilité
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={errorCount > 0 ? 'destructive' : warningCount > 0 ? 'secondary' : 'default'}>
            {errorCount} erreurs, {warningCount} avertissements
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={runAudit}
            disabled={isRunning}
          >
            {isRunning ? 'Analyse...' : 'Actualiser'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-64 overflow-y-auto space-y-2">
        {issues.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun problème d'accessibilité détecté !
            </AlertDescription>
          </Alert>
        ) : (
          issues.map((issue, index) => (
            <Alert 
              key={index} 
              variant={issue.type === 'error' ? 'destructive' : 'default'}
              className="text-xs"
            >
              <div className="flex items-start gap-2">
                {issue.type === 'error' ? 
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" /> :
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {getCategoryIcon(issue.category)}
                    <span className="font-medium">{issue.category}</span>
                  </div>
                  <AlertDescription className="text-xs">
                    {issue.message}
                    {issue.fix && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        💡 {issue.fix}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))
        )}
        
        {lastAudit && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Dernier audit: {lastAudit.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};