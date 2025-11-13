import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFilterTemplates } from '@/hooks/useFilterTemplates';
import { useTemplateTags } from '@/hooks/useTemplateTags';
import { useTemplateHistory } from '@/hooks/useTemplateHistory';
import { useTemplateComments } from '@/hooks/useTemplateComments';
import { BarChart3, Star, TrendingUp, Users, Tag, Clock, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export const TemplateAnalyticsDashboard = () => {
  const { templates, isLoading } = useFilterTemplates();
  const { tags, popularTags } = useTemplateTags();
  const { history } = useTemplateHistory();

  // Calculate statistics
  const totalTemplates = templates.length;
  const sharedTemplates = templates.filter(t => t.is_shared || t.shared_with_team || t.shared_with_users?.length > 0).length;
  const sharePercentage = totalTemplates > 0 ? (sharedTemplates / totalTemplates * 100).toFixed(1) : 0;

  // Most used templates (based on favorites and shares)
  const templateUsageScores = templates.map(template => {
    const shareScore = (template.is_shared ? 10 : 0) + 
                      (template.shared_with_team ? 5 : 0) + 
                      (template.shared_with_users?.length || 0);
    return { ...template, score: shareScore };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  // Templates by category (tags)
  const templatesByTag = tags.slice(0, 10).map(tag => ({
    tag: tag.tag_name,
    count: templates.filter(t => t.tags?.includes(tag.tag_name)).length,
  }));

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTemplates = templates.filter(t => new Date(t.created_at) > thirtyDaysAgo).length;

  // Application trends
  const recentApplications = history.filter(h => new Date(h.applied_at) > thirtyDaysAgo).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics des Templates</h1>
        <p className="text-muted-foreground mt-2">
          Statistiques d'utilisation et tendances des templates de filtres
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              +{recentTemplates} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Partagés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedTemplates}</div>
            <p className="text-xs text-muted-foreground">
              {sharePercentage}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-xs text-muted-foreground">
              +{recentApplications} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Uniques</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">
              Catégories actives
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags les Plus Utilisés</CardTitle>
            <CardDescription>Top 10 des catégories de templates</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {popularTags.map((tag, index) => {
                  const percentage = tags.length > 0 ? (tag.usage_count / tags.reduce((sum, t) => sum + t.usage_count, 0) * 100) : 0;
                  return (
                    <div key={tag.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{tag.tag_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {tag.usage_count} templates
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Most Popular Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Templates les Plus Populaires</CardTitle>
            <CardDescription>Basé sur le partage et l'utilisation</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {templateUsageScores.map((template, index) => (
                  <div key={template.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <Badge variant="secondary" className="shrink-0">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {template.is_shared && (
                          <Badge variant="outline" className="text-xs">Global</Badge>
                        )}
                        {template.shared_with_team && (
                          <Badge variant="outline" className="text-xs">Équipe</Badge>
                        )}
                        {template.tags?.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{template.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Templates by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Catégorie</CardTitle>
            <CardDescription>Nombre de templates par tag</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {templatesByTag.map((item) => {
                  const maxCount = Math.max(...templatesByTag.map(t => t.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={item.tag} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{item.tag}</Badge>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>30 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveaux Templates</p>
                <p className="text-2xl font-bold">{recentTemplates}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Applications</p>
                <p className="text-2xl font-bold">{recentApplications}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Templates Partagés</p>
                <p className="text-2xl font-bold">{sharedTemplates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
