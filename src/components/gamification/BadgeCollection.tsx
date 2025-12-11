import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { Badge as BadgeType } from '@/hooks/useGamification';

interface BadgeCollectionProps {
  unlockedBadges: BadgeType[];
  allBadges: Omit<BadgeType, 'unlockedAt'>[];
}

const RARITY_STYLES = {
  common: 'border-border bg-muted/30',
  rare: 'border-blue-500 bg-blue-500/10',
  epic: 'border-purple-500 bg-purple-500/10',
  legendary: 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20',
};

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export function BadgeCollection({ unlockedBadges, allBadges }: BadgeCollectionProps) {
  const unlockedIds = new Set(unlockedBadges.map(b => b.id));

  const groupedBadges = {
    legendary: allBadges.filter(b => b.rarity === 'legendary'),
    epic: allBadges.filter(b => b.rarity === 'epic'),
    rare: allBadges.filter(b => b.rarity === 'rare'),
    common: allBadges.filter(b => b.rarity === 'common'),
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collection de Badges</span>
            <Badge variant="secondary">
              {unlockedBadges.length}/{allBadges.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {(['legendary', 'epic', 'rare', 'common'] as const).map((rarity) => (
            <div key={rarity}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                {RARITY_LABELS[rarity]} ({groupedBadges[rarity].filter(b => unlockedIds.has(b.id)).length}/{groupedBadges[rarity].length})
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {groupedBadges[rarity].map((badge) => {
                  const isUnlocked = unlockedIds.has(badge.id);
                  const unlockedData = unlockedBadges.find(b => b.id === badge.id);

                  return (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                            isUnlocked 
                              ? `${RARITY_STYLES[rarity]} cursor-pointer hover:scale-110` 
                              : 'border-border/30 bg-muted/10 opacity-40 grayscale'
                          }`}
                        >
                          {isUnlocked ? badge.icon : <Lock className="h-5 w-5 text-muted-foreground/50" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {isUnlocked && unlockedData?.unlockedAt && (
                          <p className="text-[10px] text-success mt-1">
                            Débloqué le {new Date(unlockedData.unlockedAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        <Badge variant="outline" className={`mt-1 text-[10px] ${RARITY_STYLES[rarity]}`}>
                          {RARITY_LABELS[rarity]}
                        </Badge>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
