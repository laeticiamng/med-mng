import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Music, Users, Play, Heart, Clock,
  ArrowRight, Star, Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContentItem {
  id: string;
  type: 'edn' | 'music' | 'ecos';
  title: string;
  subtitle?: string;
  description: string;
  timestamp: Date;
  progress?: number;
  isFavorite?: boolean;
  thumbnail?: string;
  metadata?: any;
}

export const RecentContent: React.FC = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du contenu récent
    const simulatedContent: ContentItem[] = [
      {
        id: 'ic-331',
        type: 'edn',
        title: 'IC-331 - Arrêt cardio-circulatoire',
        subtitle: 'Urgences',
        description: 'Reconnaissance et prise en charge de l\'arrêt cardio-circulatoire',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        progress: 75,
        isFavorite: true
      },
      {
        id: 'music-ic331-a',
        type: 'music',
        title: 'Musique IC-331 Rang A',
        subtitle: 'Génération IA',
        description: 'Musique pédagogique pour l\'arrêt cardio-circulatoire',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isFavorite: false
      },
      {
        id: 'ic-290',
        type: 'edn',
        title: 'IC-290 - Épidémiologie des cancers',
        subtitle: 'Cancérologie',
        description: 'Incidence, facteurs de risque et prévention des cancers',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        progress: 40
      },
      {
        id: 'ecos-cardio',
        type: 'ecos',
        title: 'ECOS Cardiologie',
        subtitle: 'Station 3',
        description: 'Examen cardiovasculaire complet',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        progress: 90
      },
      {
        id: 'music-custom-1',
        type: 'music',
        title: 'Ma Création Personnalisée',
        subtitle: 'Style: Ambient',
        description: 'Musique d\'ambiance pour la concentration',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isFavorite: true
      },
      {
        id: 'ic-91',
        type: 'edn',
        title: 'IC-91 - Déficit neurologique récent',
        subtitle: 'Neurologie',
        description: 'Diagnostic et prise en charge des déficits neurologiques',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        progress: 20
      }
    ];

    setTimeout(() => {
      setRecentItems(simulatedContent);
      setLoading(false);
    }, 600);
  }, []);

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'edn':
        return BookOpen;
      case 'music':
        return Music;
      case 'ecos':
        return Users;
    }
  };

  const getTypeBadge = (type: ContentItem['type']) => {
    switch (type) {
      case 'edn':
        return { label: 'EDN', variant: 'default' as const };
      case 'music':
        return { label: 'Musique', variant: 'secondary' as const };
      case 'ecos':
        return { label: 'ECOS', variant: 'outline' as const };
    }
  };

  const handleItemClick = (item: ContentItem) => {
    switch (item.type) {
      case 'edn':
        navigate(`/edn/${item.id}`);
        break;
      case 'music':
        navigate(`/med-mng/library?track=${item.id}`);
        break;
      case 'ecos':
        navigate(`/ecos/${item.id}`);
        break;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contenu Récent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Contenu Récent
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate('/med-mng/library')}>
          Voir tout
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentItems.map((item) => {
            const Icon = getTypeIcon(item.type);
            const badge = getTypeBadge(item.type);
            
            return (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-all cursor-pointer group"
                onClick={() => handleItemClick(item)}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <Badge variant={badge.variant} className="text-xs shrink-0">
                      {badge.label}
                    </Badge>
                    {item.isFavorite && (
                      <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
                    )}
                  </div>
                  
                  {item.subtitle && (
                    <p className="text-xs text-primary/70 mb-1">{item.subtitle}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.timestamp, { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                    
                    {item.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary font-medium">
                          {item.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 shrink-0">
                  {item.type === 'music' && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};