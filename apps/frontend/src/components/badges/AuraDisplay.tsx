import { UserAura } from '@shared/services/badges.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface AuraDisplayProps {
  aura?: UserAura
  isLoading?: boolean
  onColorChange?: (color: string) => void
}

const auraColors = [
  { value: 'blue', label: 'Bleu', hex: '#3b82f6' },
  { value: 'green', label: 'Vert', hex: '#10b981' },
  { value: 'purple', label: 'Violet', hex: '#a855f7' },
  { value: 'gold', label: 'Or', hex: '#f59e0b' },
  { value: 'red', label: 'Rouge', hex: '#ef4444' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
]

const auraIntensities = ['low', 'medium', 'high', 'intense']
const intensityLabels = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
  intense: 'Intense',
}

function AuraOrb({ color, intensity }: { color: string; intensity: string }) {
  const colorHex = auraColors.find((c) => c.value === color)?.hex || '#3b82f6'
  const intensityValues = {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    intense: 1,
  }

  const opacity = intensityValues[intensity as keyof typeof intensityValues]

  return (
    <div className="flex justify-center mb-6">
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl"
        style={{
          backgroundColor: colorHex,
          opacity: opacity,
          boxShadow: `0 0 40px ${colorHex}${Math.floor(opacity * 255).toString(16)}`,
        }}
      >
        (
      </div>
    </div>
  )
}

export function AuraDisplay({ aura, isLoading = false, onColorChange }: AuraDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Votre Aura</CardTitle>
          <CardDescription>Aura personnalisée basée sur vos activités</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!aura) {
    return null
  }

  const nextLevelXp = 1000
  const progressPercentage = (aura.current_xp / nextLevelXp) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre Aura - Niveau {aura.current_level}</CardTitle>
        <CardDescription>
          Aura personnalisée basée sur vos activités et réalisations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aura Orb Visualization */}
        <AuraOrb color={aura.aura_color} intensity={aura.aura_intensity} />

        {/* Level and XP Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Expérience</span>
            <span className="text-sm text-muted-foreground">
              {aura.current_xp} / {nextLevelXp} XP
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercentage)}% vers le niveau {aura.current_level + 1}
          </p>
        </div>

        {/* XP Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total XP</p>
            <p className="text-2xl font-bold">{aura.total_xp.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Intensité</p>
            <p className="text-lg font-semibold">
              {intensityLabels[aura.aura_intensity as keyof typeof intensityLabels]}
            </p>
          </div>
        </div>

        {/* Last Level Up */}
        {aura.last_level_up && (
          <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              Dernier niveau obtenu le{' '}
              {new Date(aura.last_level_up).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {/* Color Selection */}
        {onColorChange && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Couleur de votre aura</label>
            <Select value={aura.aura_color} onValueChange={onColorChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {auraColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              L'intensité de votre aura augmente avec votre niveau
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
