import React from 'react';
import { Music, Clock, Heart, TrendingUp, Calendar } from 'lucide-react';
import { PremiumCard } from '@/components/ui/premium-card';

interface LibraryStatsProps {
  totalSongs: number;
  favoritesCount: number;
  totalDurationMinutes?: number;
  lastAddedDate?: string;
  mostPlayedStyle?: string;
  className?: string;
}

export const LibraryStats: React.FC<LibraryStatsProps> = ({
  totalSongs,
  favoritesCount,
  totalDurationMinutes = 0,
  lastAddedDate,
  mostPlayedStyle,
  className = '',
}) => {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const stats = [
    {
      icon: Music,
      label: 'Total',
      value: totalSongs.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Heart,
      label: 'Favoris',
      value: favoritesCount.toString(),
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: Clock,
      label: 'Durée',
      value: formatDuration(totalDurationMinutes),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Calendar,
      label: 'Dernier ajout',
      value: formatDate(lastAddedDate),
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <PremiumCard 
          key={index} 
          variant="glass" 
          className="p-3 sm:p-4"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <p className="text-sm sm:text-lg font-bold text-foreground truncate">{stat.value}</p>
            </div>
          </div>
        </PremiumCard>
      ))}
      
      {mostPlayedStyle && (
        <PremiumCard variant="glass" className="p-3 sm:p-4 col-span-2 sm:col-span-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Style le plus écouté</p>
              <p className="text-sm sm:text-lg font-bold text-foreground truncate">{mostPlayedStyle}</p>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};
