import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, Music, Users, Brain, CheckCircle, 
  TrendingUp, Target, Award 
} from "lucide-react";

interface EdnStatsBarProps {
  items: any[];
  filteredItems: any[];
}

export const EdnStatsBar: React.FC<EdnStatsBarProps> = ({ items, filteredItems }) => {
  const calculateStats = () => {
    const total = items.length;
    const displayed = filteredItems.length;
    
    const complete = items.filter(item => {
      const hasRangA = !!item.tableau_rang_a;
      const hasRangB = !!item.tableau_rang_b;
      const hasMusic = !!(item.paroles_musicales && item.paroles_musicales.length > 0);
      const hasScene = !!item.scene_immersive;
      const hasQuiz = !!item.quiz_questions;
      return hasRangA && hasRangB && hasMusic && hasScene && hasQuiz;
    }).length;
    
    const withMusic = items.filter(item => 
      item.paroles_musicales && item.paroles_musicales.length > 0
    ).length;
    
    const withScene = items.filter(item => !!item.scene_immersive).length;
    
    const withQuiz = items.filter(item => !!item.quiz_questions).length;
    
    const completion = Math.round((complete / total) * 100);
    
    return {
      total,
      displayed,
      complete,
      withMusic,
      withScene,
      withQuiz,
      completion
    };
  };

  const stats = calculateStats();

  const statCards = [
    {
      title: "Items Total",
      value: stats.total,
      subtitle: "IC-1 à IC-367",
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20"
    },
    {
      title: "Affichés",
      value: stats.displayed,
      subtitle: "Filtrés",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/5",
      borderColor: "border-accent/20"
    },
    {
      title: "Complets",
      value: stats.complete,
      subtitle: `${stats.completion}% du total`,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/5",
      borderColor: "border-success/20"
    },
    {
      title: "Avec Musique",
      value: stats.withMusic,
      subtitle: "Paroles intégrées",
      icon: Music,
      color: "text-accent",
      bgColor: "bg-accent/5",
      borderColor: "border-accent/20"
    },
    {
      title: "Scènes Immersives",
      value: stats.withScene,
      subtitle: "Expériences 3D",
      icon: Users,
      color: "text-warning",
      bgColor: "bg-warning/5",
      borderColor: "border-warning/20"
    },
    {
      title: "Quiz Interactifs",
      value: stats.withQuiz,
      subtitle: "Évaluations",
      icon: Brain,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20"
    }
  ];

  return (
    <div className="bg-background/60 backdrop-blur-sm border-y border-accent/20 py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card 
                key={index} 
                className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Barre de progression globale */}
        <div className="mt-6 bg-background/80 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              <span className="font-semibold text-foreground">Progression Globale EDN</span>
            </div>
            <span className="text-lg font-bold text-success">{stats.completion}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-success/80 to-success h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.completion}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{stats.complete} items complets</span>
            <span>367</span>
          </div>
        </div>
      </div>
    </div>
  );
};
