import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  path: string;
  reason: string;
  category: string;
  relevance: number;
}

interface AIRecommendationsProps {
  visitStats: Record<string, { count: number; timestamps: number[] }>;
  currentPath?: string;
}

export function AIRecommendations({ visitStats, currentPath }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const visitedPaths = Object.fromEntries(
        Object.entries(visitStats).map(([path, data]) => [path, data.count])
      );

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap-recommendations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            visitedPaths,
            currentPath,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Limite atteinte",
            description: "Trop de requêtes, veuillez réessayer dans quelques instants.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Crédits insuffisants",
            description: "Les crédits Lovable AI sont épuisés.",
            variant: "destructive",
          });
          return;
        }
        throw new Error('Erreur lors de la récupération des recommandations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setInsight(data.insight || '');
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les recommandations IA.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les recommandations au montage si on a des stats
    if (Object.keys(visitStats).length > 3) {
      fetchRecommendations();
    }
  }, []); // Uniquement au montage

  if (Object.keys(visitStats).length < 3) {
    return null; // Pas assez de données pour faire des recommandations
  }

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Recommandations IA</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pages suggérées selon votre navigation
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchRecommendations}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insight && (
          <div className="mb-4 p-3 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-sm text-purple-900 dark:text-purple-100">{insight}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <Link
                key={index}
                to={rec.path}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-muted/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {rec.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(rec.relevance * 100)}% pertinent
                    </Badge>
                  </div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                    {rec.path}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {rec.reason}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Naviguez un peu plus pour recevoir des recommandations personnalisées !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
