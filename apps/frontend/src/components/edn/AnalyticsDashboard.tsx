/**
 * Dashboard analytics pour afficher les statistiques d'utilisation EDN
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Eye, Clock } from 'lucide-react';
import { useEdnPageAnalytics } from '@/hooks/useEdnAnalytics';

export const AnalyticsDashboard: React.FC = () => {
  const { topViewed, popularSearches, recentSearches, isLoading } = useEdnPageAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted/50" />
            <CardContent className="h-40 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Items les plus consultés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-blue-600" />
            Top Items Consultés
          </CardTitle>
          <CardDescription>Items les plus populaires</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topViewed.slice(0, 5).map((item, index) => (
              <div 
                key={item.itemCode}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{item.itemCode}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{item.viewCount}</span>
                </div>
              </div>
            ))}
            {topViewed.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recherches populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Recherches Populaires
          </CardTitle>
          <CardDescription>Termes les plus recherchés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {popularSearches.slice(0, 5).map((search, index) => (
              <div 
                key={search.term}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{search.term}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" />
                  <span>{search.count}</span>
                </div>
              </div>
            ))}
            {popularSearches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune recherche enregistrée
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recherches récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            Recherches Récentes
          </CardTitle>
          <CardDescription>Historique de recherche</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentSearches.slice(0, 5).map((search, index) => (
              <div 
                key={`${search.searchTerm}-${index}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium">{search.searchTerm}</span>
                <Badge variant="outline" className="text-xs">
                  {search.resultsCount} résultats
                </Badge>
              </div>
            ))}
            {recentSearches.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune recherche récente
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
