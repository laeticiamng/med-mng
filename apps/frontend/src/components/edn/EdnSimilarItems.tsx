/**
 * Composant de Recommandations d'Items EDN Similaires
 * Affiche les items similaires basés sur la spécialité et les tags
 */

import { TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useEdnSimilarItems } from '@/hooks/useEdnSearch';
import { useNavigate } from 'react-router-dom';

interface EdnSimilarItemsProps {
  itemCode: string;
  limit?: number;
}

export default function EdnSimilarItems({ itemCode, limit = 5 }: EdnSimilarItemsProps) {
  const navigate = useNavigate();
  const { data: similarItems, isLoading } = useEdnSimilarItems(itemCode, { limit });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Items Similaires</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!similarItems || similarItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Items Similaires</CardTitle>
          <CardDescription>Aucun item similaire trouvé</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Aucun item similaire n'a été trouvé pour cet item.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Items Similaires
        </CardTitle>
        <CardDescription>
          Basés sur la spécialité et les tags partagés
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {similarItems.map((item) => (
          <SimilarItemCard
            key={item.item_code}
            item={item}
            onClick={() => navigate(`/edn-complete/${item.item_code}`)}
          />
        ))}

        {similarItems.length === limit && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            {limit} items affichés • Il peut y en avoir plus
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Sous-composants
// ============================================

function SimilarItemCard({ item, onClick }: { item: any; onClick: () => void }) {
  const similarityPercentage = (item.similarity_score * 100).toFixed(0);
  const similarityColor =
    item.similarity_score >= 0.7
      ? 'text-green-600'
      : item.similarity_score >= 0.5
      ? 'text-yellow-600'
      : 'text-orange-600';

  return (
    <div
      className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* En-tête */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {item.item_code}
            </Badge>

            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              {similarityPercentage}% similaire
            </Badge>
          </div>

          {/* Titre */}
          <h4 className="font-medium leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
            {item.title}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>

          {/* Détails */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{item.shared_tags} tag{item.shared_tags > 1 ? 's' : ''} partagé{item.shared_tags > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Score de similarité */}
        <div className="text-right w-20">
          <p className={`text-2xl font-bold ${similarityColor}`}>
            {similarityPercentage}%
          </p>
          <p className="text-xs text-muted-foreground">
            Similarité
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-3">
        <Progress value={item.similarity_score * 100} className="h-1" />
      </div>
    </div>
  );
}
