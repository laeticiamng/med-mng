/**
 * Composant de sélection de méthode de révision
 * Permet à l'utilisateur de choisir entre les 3 méthodes disponibles
 */

import { useState } from 'react'
import { Calendar, Target, FileQuestion, Check, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { REVISION_METHODS, type RevisionMethodType } from '@/types/revision-methods'
import { useUpdateRevisionMethod } from '@/hooks/useRevisionMethods'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface MethodSelectorProps {
  currentMethod?: RevisionMethodType
  onMethodSelected?: (method: RevisionMethodType) => void
  showCurrentBadge?: boolean
  allowChange?: boolean
}

const methodIcons = {
  J_METHOD: Calendar,
  BLOCK_METHOD: Target,
  QCM_FIRST: FileQuestion,
}

const methodColors = {
  J_METHOD: 'blue',
  BLOCK_METHOD: 'purple',
  QCM_FIRST: 'green',
}

export function MethodSelector({
  currentMethod,
  onMethodSelected,
  showCurrentBadge = true,
  allowChange = true,
}: MethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<RevisionMethodType | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const updateMethod = useUpdateRevisionMethod()

  const handleMethodClick = (method: RevisionMethodType) => {
    if (!allowChange) return

    // Si c'est la méthode actuelle, ne rien faire
    if (currentMethod === method) {
      return
    }

    // Si l'utilisateur a déjà une méthode, afficher le dialog de confirmation
    if (currentMethod) {
      setSelectedMethod(method)
      setShowConfirmDialog(true)
    } else {
      // Sinon, changer directement
      confirmMethodChange(method)
    }
  }

  const confirmMethodChange = (method: RevisionMethodType) => {
    updateMethod.mutate(method, {
      onSuccess: () => {
        onMethodSelected?.(method)
        setShowConfirmDialog(false)
        setSelectedMethod(null)
      },
    })
  }

  const methods: RevisionMethodType[] = ['J_METHOD', 'BLOCK_METHOD', 'QCM_FIRST']

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((methodType) => {
          const method = REVISION_METHODS[methodType]
          const Icon = methodIcons[methodType]
          const isSelected = currentMethod === methodType
          const colorClass = methodColors[methodType]

          return (
            <Card
              key={methodType}
              className={cn(
                'relative cursor-pointer transition-all hover:shadow-lg',
                isSelected && 'ring-2 ring-offset-2',
                isSelected && colorClass === 'blue' && 'ring-blue-500',
                isSelected && colorClass === 'purple' && 'ring-purple-500',
                isSelected && colorClass === 'green' && 'ring-green-500',
                !allowChange && 'cursor-default opacity-75'
              )}
              onClick={() => allowChange && handleMethodClick(methodType)}
            >
              {isSelected && showCurrentBadge && (
                <div className="absolute -top-2 -right-2">
                  <Badge
                    className={cn(
                      'flex items-center gap-1',
                      colorClass === 'blue' && 'bg-blue-500',
                      colorClass === 'purple' && 'bg-purple-500',
                      colorClass === 'green' && 'bg-green-500'
                    )}
                  >
                    <Check className="h-3 w-3" />
                    Actuelle
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      colorClass === 'blue' && 'bg-blue-100 dark:bg-blue-900/20',
                      colorClass === 'purple' && 'bg-purple-100 dark:bg-purple-900/20',
                      colorClass === 'green' && 'bg-green-100 dark:bg-green-900/20'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        colorClass === 'blue' && 'text-blue-600 dark:text-blue-400',
                        colorClass === 'purple' && 'text-purple-600 dark:text-purple-400',
                        colorClass === 'green' && 'text-green-600 dark:text-green-400'
                      )}
                    />
                  </div>
                </div>
                <CardTitle className="mt-4">{method.name}</CardTitle>
                <CardDescription className="text-sm">
                  {method.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Idéal pour :</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {method.bestFor.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-1 w-1 rounded-full',
                            colorClass === 'blue' && 'bg-blue-500',
                            colorClass === 'purple' && 'bg-purple-500',
                            colorClass === 'green' && 'bg-green-500'
                          )}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                      ✓ Avantages
                    </p>
                    <ul className="text-xs space-y-0.5 text-muted-foreground">
                      {method.pros.slice(0, 2).map((pro, index) => (
                        <li key={index} className="truncate" title={pro}>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                      ⚠ Limites
                    </p>
                    <ul className="text-xs space-y-0.5 text-muted-foreground">
                      {method.cons.slice(0, 2).map((con, index) => (
                        <li key={index} className="truncate" title={con}>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {allowChange && !isSelected && (
                  <Button
                    className={cn(
                      'w-full mt-4',
                      colorClass === 'blue' && 'bg-blue-600 hover:bg-blue-700',
                      colorClass === 'purple' && 'bg-purple-600 hover:bg-purple-700',
                      colorClass === 'green' && 'bg-green-600 hover:bg-green-700'
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMethodClick(methodType)
                    }}
                  >
                    Choisir cette méthode
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {isSelected && (
                  <div
                    className={cn(
                      'w-full py-2 text-center text-sm font-medium rounded-md',
                      colorClass === 'blue' && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                      colorClass === 'purple' && 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
                      colorClass === 'green' && 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    )}
                  >
                    <Check className="inline h-4 w-4 mr-1" />
                    Méthode active
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de confirmation de changement */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Changer de méthode de révision ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tu es sur le point de passer de{' '}
                <strong>{currentMethod && REVISION_METHODS[currentMethod].shortName}</strong> à{' '}
                <strong>{selectedMethod && REVISION_METHODS[selectedMethod].shortName}</strong>.
              </p>
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠ Attention : Changer de méthode va modifier ton planning de révision.
              </p>
              <p className="text-sm">
                Tu ne perds pas tes statistiques, mais l'organisation des séances sera recalculée à partir d'aujourd'hui.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMethod(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedMethod && confirmMethodChange(selectedMethod)}
              disabled={updateMethod.isPending}
            >
              {updateMethod.isPending ? 'Changement...' : 'Confirmer le changement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
