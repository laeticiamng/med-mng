import React from 'react';
import { SubPageLayout } from '@/components/platform/SubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Music, TrendingUp, Calendar, Target, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Analytics: React.FC = () => {
  const stats = [
    { label: 'Total EDN Items', value: '2,847', icon: BarChart3, change: '+12%' },
    { label: 'Utilisateurs Actifs', value: '8,523', icon: Users, change: '+23%' },
    { label: 'Musiques Générées', value: '15,632', icon: Music, change: '+45%' },
    { label: 'Score Moyen', value: '84.2%', icon: Target, change: '+5.3%' },
  ];

  const recentActivity = [
    { action: 'Quiz complété', item: 'Cardiologie - Arythmies', score: '92%', time: '2 min' },
    { action: 'Musique générée', item: 'Pneumologie - Asthme', duration: '3:42', time: '5 min' },
    { action: 'Révision', item: 'Neurologie - AVC', progress: '85%', time: '12 min' },
    { action: 'ECOS terminé', item: 'Consultation Diabète', score: '88%', time: '20 min' },
  ];

  return (
    <SubPageLayout
      title="Analytics"
      subtitle="Statistiques détaillées et suivi de progression"
      breadcrumbs={[
        { label: 'Accueil', href: '/' },
        { label: 'Analytics', href: '/analytics' }
      ]}
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progression Hebdomadaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Graphique de progression (à implémenter avec recharts)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">
                        {activity.score || activity.duration || activity.progress}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Analyse Détaillée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Performance par Spécialité</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Cardiologie</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pneumologie</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Neurologie</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Temps d'Étude</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Aujourd'hui</span>
                    <span className="font-medium">2h 45min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cette semaine</span>
                    <span className="font-medium">18h 20min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ce mois</span>
                    <span className="font-medium">72h 15min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Objectifs</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Définir objectifs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Planifier révisions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPageLayout>
  );
};

export default Analytics;