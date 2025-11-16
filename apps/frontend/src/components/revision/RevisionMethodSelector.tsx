// ============================================================================
// Revision Method Selector Component
// ============================================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Target, HelpCircle, Check, AlertTriangle } from 'lucide-react';
import { RevisionMethodType, REVISION_METHODS } from '@/types/revision-methods';
import { useRevisionMethods } from '@/hooks/useRevisionMethods';

interface RevisionMethodSelectorProps {
  currentMethod?: RevisionMethodType;
  onMethodSelected?: (method: RevisionMethodType) => void;
  showCancelButton?: boolean;
}

export const RevisionMethodSelector: React.FC<RevisionMethodSelectorProps> = ({
  currentMethod,
  onMethodSelected,
  showCancelButton = false
}) => {
  const { changeMethod, loading } = useRevisionMethods();
  const [selectedMethod, setSelectedMethod] = useState<RevisionMethodType | null>(
    currentMethod || null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmingMethod, setConfirmingMethod] = useState<RevisionMethodType | null>(null);

  const handleMethodClick = (method: RevisionMethodType) => {
    if (currentMethod && currentMethod !== method) {
      // Show warning dialog when changing method
      setConfirmingMethod(method);
      setShowConfirmDialog(true);
    } else {
      // First time selection or same method
      setSelectedMethod(method);
      if (onMethodSelected) {
        onMethodSelected(method);
      }
    }
  };

  const handleConfirmChange = async () => {
    if (!confirmingMethod) return;

    const result = await changeMethod({
      new_method: confirmingMethod
    });

    if (result.success) {
      setSelectedMethod(confirmingMethod);
      setShowConfirmDialog(false);

      if (onMethodSelected) {
        onMethodSelected(confirmingMethod);
      }
    }
  };

  const methodsArray: RevisionMethodType[] = ['J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST'];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choisis ta méthode de révision</h2>
        <p className="text-gray-600">
          Sélectionne la méthode qui correspond le mieux à ta façon d'apprendre
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methodsArray.map((methodId) => {
          const method = REVISION_METHODS[methodId];
          const isSelected = selectedMethod === methodId;
          const isCurrent = currentMethod === methodId;

          return (
            <Card
              key={methodId}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary border-primary bg-primary/5'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleMethodClick(methodId)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{method.emoji}</span>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                    </div>
                  </div>
                  {isCurrent && (
                    <Badge variant="default" className="ml-2">
                      Actuelle
                    </Badge>
                  )}
                  {isSelected && !isCurrent && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {method.shortDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{method.fullDescription}</p>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Avantages
                  </h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {method.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    Idéal pour
                  </h4>
                  <ul className="text-xs space-y-1 text-gray-600">
                    {method.bestFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1">Exemple :</p>
                  <p className="text-gray-600">{method.example}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMethod && !currentMethod && (
        <div className="flex justify-center gap-4">
          {showCancelButton && (
            <Button variant="outline" size="lg">
              Annuler
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => handleConfirmChange()}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Activation...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Activer {REVISION_METHODS[selectedMethod].name}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog for Method Change */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Changer de méthode de révision
            </DialogTitle>
            <DialogDescription>
              Tu es sur le point de passer de{' '}
              <strong>{currentMethod && REVISION_METHODS[currentMethod].name}</strong> à{' '}
              <strong>{confirmingMethod && REVISION_METHODS[confirmingMethod].name}</strong>
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-sm text-orange-800">
              <p className="font-medium mb-2">Conséquences du changement :</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Ton planning de révision sera recalculé selon la nouvelle méthode</li>
                <li>Les révisions en cours ne seront pas perdues</li>
                <li>Tes statistiques et progressions seront conservées</li>
                <li>Le nouveau planning sera appliqué à partir d'aujourd'hui</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button onClick={handleConfirmChange} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Changement...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer le changement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
