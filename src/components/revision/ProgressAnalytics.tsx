import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Brain,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import { RevisionItem } from '@/hooks/usePersonalizedRevision';

interface ProgressAnalyticsProps {
  revisionItems: RevisionItem[];
  stats: {
    totalItems: number;
    masteredItems: number;
    inProgressItems: number;
    strugglingItems: number;
    masteryRate: number;
    todayTarget: number;
    todayCompleted: number;
    todayRemaining: number;
  };
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ 
  revisionItems, 
  stats 
}) => {
  // Analyser les tendances de progression
  const getMasteryTrend = () => {
    const masteredRate = (stats.masteredItems / stats.totalItems) * 100;
    const inProgressRate = (stats.inProgressItems / stats.totalItems) * 100;
    
    if (masteredRate >= 70) return { trend: 'excellent', color: 'text-success', icon: TrendingUp };
    if (masteredRate >= 50) return { trend: 'bon', color: 'text-primary', icon: TrendingUp };
    if (inProgressRate >= 30) return { trend: 'progression', color: 'text-warning', icon: TrendingUp };
    return { trend: 'à améliorer', color: 'text-destructive', icon: TrendingDown };
  };

  const masteryTrend = getMasteryTrend();

  // Analyser la répartition par domaine médical
  const getDomainAnalysis = () => {
    const domains: { [key: string]: { total: number; mastered: number; struggling: number } } = {};
    
    revisionItems.forEach(item => {
      const domain = item.item_code.split('-')[0] || 'Général';
      if (!domains[domain]) {
        domains[domain] = { total: 0, mastered: 0, struggling: 0 };
      }
      domains[domain].total++;
      if (item.mastery_level >= 80) domains[domain].mastered++;
      if (item.mastery_level < 40) domains[domain].struggling++;
    });

    return Object.entries(domains)
      .map(([domain, stats]) => ({
        domain,
        ...stats,
        masteryRate: (stats.mastered / stats.total) * 100
      }))
      .sort((a, b) => b.total - a.total);
  };

  const domainAnalysis = getDomainAnalysis();

  // Prédire le temps pour atteindre 80% de maîtrise
  const predictMasteryTime = () => {
    const remainingItems = stats.totalItems - stats.masteredItems;
    const dailyTarget = stats.todayTarget || 5;
    const assumedSuccessRate = 0.7; // 70% de réussite moyenne
    
    const daysToMastery = Math.ceil(remainingItems / (dailyTarget * assumedSuccessRate));
    return daysToMastery;
  };

  const predictedDays = predictMasteryTime();

  return (
    <div className="space-y-6">
      
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5" />
              Progression générale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Maîtrise globale</span>
                <span className="text-sm font-medium">{stats.masteryRate}%</span>
              </div>
              <Progress value={stats.masteryRate} className="w-full" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-success/10 rounded p-2">
                <p className="font-medium text-success">{stats.masteredItems}</p>
                <p className="text-success">Maîtrisé</p>
              </div>
              <div className="bg-warning/10 rounded p-2">
                <p className="font-medium text-warning">{stats.inProgressItems}</p>
                <p className="text-warning">En cours</p>
              </div>
              <div className="bg-destructive/10 rounded p-2">
                <p className="font-medium text-destructive">{stats.strugglingItems}</p>
                <p className="text-destructive">Difficile</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${masteryTrend.color}`}>
              <masteryTrend.icon className="h-4 w-4" />
              <span className="text-sm font-medium">Progression {masteryTrend.trend}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Prédictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Temps pour 80% de maîtrise</span>
                </div>
                <p className="text-2xl font-bold text-primary mt-1">
                  {predictedDays} jour{predictedDays > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-primary">
                  Basé sur votre rythme actuel de {stats.todayTarget} concepts/jour
                </p>
              </div>

              <div className="bg-accent/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Objectif quotidien</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={stats.todayTarget > 0 ? (stats.todayCompleted / stats.todayTarget) * 100 : 0} 
                    className="flex-1" 
                  />
                  <span className="text-sm font-medium text-accent-foreground">
                    {stats.todayCompleted}/{stats.todayTarget}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse par domaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progression par domaine médical
          </CardTitle>
          <CardDescription>
            Analyse de vos performances par spécialité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {domainAnalysis.slice(0, 6).map((domain) => (
              <div key={domain.domain} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {domain.domain}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {domain.total} concept{domain.total > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(domain.masteryRate)}%
                  </span>
                </div>
                <Progress value={domain.masteryRate} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{domain.mastered} maîtrisé{domain.mastered > 1 ? 's' : ''}</span>
                  <span>{domain.struggling} en difficulté</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Concepts les plus problématiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Focus prioritaire
          </CardTitle>
          <CardDescription>
            Concepts nécessitant le plus d'attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revisionItems
              .filter(item => item.mastery_level < 60)
              .sort((a, b) => b.priority_score - a.priority_score)
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{item.concept}</span>
                      <Badge 
                        variant={item.difficulty_level === 'hard' ? 'destructive' : 
                                item.difficulty_level === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.difficulty_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{item.item_code}</span>
                      <span>{item.error_frequency} erreur(s)</span>
                      <span>Maîtrise: {item.mastery_level}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-destructive">
                      {item.priority_score}
                    </p>
                    <p className="text-xs text-muted-foreground">priorité</p>
                  </div>
                </div>
              ))}
            
            {revisionItems.filter(item => item.mastery_level < 60).length === 0 && (
              <div className="text-center py-4">
                <Brain className="h-8 w-8 mx-auto text-success mb-2" />
                <p className="text-success font-medium">
                  Excellent ! Aucun concept en difficulté majeure.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};