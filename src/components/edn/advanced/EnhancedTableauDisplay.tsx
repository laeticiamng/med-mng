import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, BookOpen, Users, Clock, Play } from 'lucide-react';

interface EnhancedTableauDisplayProps {
  item: {
    id: string;
    title: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    item_code: string;
  };
  rang: 'A' | 'B';
  onProgress?: (progress: number) => void;
}

export const EnhancedTableauDisplay: React.FC<EnhancedTableauDisplayProps> = ({
  item,
  rang,
  onProgress
}) => {
  const [tableauData, setTableauData] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (rang === 'A' && item?.tableau_rang_a) {
      setTableauData(item.tableau_rang_a);
    } else if (rang === 'B' && item?.tableau_rang_b) {
      setTableauData(item.tableau_rang_b);
    }
    
    // Simuler progression
    const timer = setTimeout(() => {
      setProgress(85);
      onProgress?.(85);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [item, rang, onProgress]);

  // Générer du contenu par défaut basé sur l'item
  const generateDefaultContent = () => {
    const competenceLevel = rang === 'A' ? 'Application clinique' : 'Expertise approfondie';
    const objectives = rang === 'A' 
      ? [
          'Comprendre les concepts fondamentaux',
          'Appliquer les connaissances en pratique clinique',
          'Reconnaître les situations typiques',
          'Prendre des décisions adaptées'
        ]
      : [
          'Maîtriser les situations complexes',
          'Développer une expertise spécialisée',
          'Enseigner et transmettre',
          'Innover et rechercher'
        ];

    return {
      title: `${item.item_code} Rang ${rang} - ${item.title}`,
      competence_level: competenceLevel,
      objectives,
      content_sections: [
        {
          type: 'introduction',
          title: 'Introduction',
          content: `Ce module de rang ${rang} couvre les aspects ${competenceLevel.toLowerCase()} de ${item.title.toLowerCase()}.`
        },
        {
          type: 'objectives',
          title: 'Objectifs pédagogiques',
          content: objectives
        },
        {
          type: 'clinical_cases',
          title: 'Cas cliniques',
          content: `Études de cas adaptées au niveau ${rang} pour ${item.title}.`
        }
      ]
    };
  };

  const displayData = tableauData?.sections?.length > 0 ? tableauData : generateDefaultContent();

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  📊 Tableau Rang {rang}
                </CardTitle>
                <p className="text-muted-foreground">{item.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{progress}%</div>
              <Progress value={progress} className="w-20 h-2 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu pédagogique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectifs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Objectifs pédagogiques - Rang {rang}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.objectives?.map((objective: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm">{objective}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contenu détaillé */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Contenu détaillé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Niveau de compétence</h4>
                  <p className="text-blue-800">{displayData.competence_level}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Focus clinique</h4>
                    <p className="text-green-800 text-sm">
                      Application pratique des connaissances en situation clinique réelle.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">⚡ Évaluation</h4>
                    <p className="text-purple-800 text-sm">
                      Évaluation continue des compétences acquises.
                    </p>
                  </div>
                </div>

                {/* Cas cliniques */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-amber-900">🏥 Cas cliniques interactifs</h4>
                    <Button size="sm" variant="outline" className="border-amber-300">
                      <Play className="h-4 w-4 mr-2" />
                      Démarrer
                    </Button>
                  </div>
                  <p className="text-amber-800 text-sm">
                    Explorez des cas cliniques adaptés au niveau {rang} pour {item.title}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ℹ️ Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{item.item_code}</Badge>
                <Badge variant="secondary">Rang {rang}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Durée estimée</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{rang === 'A' ? '2h' : '3h'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Étudiants</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>1,234</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🚀 Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                📝 Notes personnelles
              </Button>
              <Button className="w-full justify-start" variant="outline">
                🔖 Marquer comme favori
              </Button>
              <Button className="w-full justify-start" variant="outline">
                📊 Voir les statistiques
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};