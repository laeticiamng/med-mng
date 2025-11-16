import { BadgeDefinition } from '@/services/badges.service'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BadgeCardProps {
  badge: BadgeDefinition
  earned?: boolean
  onClick?: () => void
}

export function BadgeCard({ badge, earned = false, onClick }: BadgeCardProps) {
  const rarityColors = {
    common: 'bg-gray-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500',
  }

  const rarityLabels = {
    common: 'Commun',
    uncommon: 'Peu commun',
    rare: 'Rare',
    epic: 'Épique',
    legendary: 'Légendaire',
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        earned ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0'
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="text-center space-y-3">
          <div className="text-6xl">{badge.icon_emoji}</div>

          <div>
            <h3 className="font-bold text-sm">{badge.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <Badge
              variant="secondary"
              className={`text-white ${rarityColors[badge.rarity]}`}
            >
              {rarityLabels[badge.rarity]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {badge.category}
            </Badge>
          </div>

          {earned && (
            <div className="pt-2">
              <Badge className="bg-green-600 text-white">
                 Obtenu
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
