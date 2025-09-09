import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, BookOpen, Users, Clock, Play, Target, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OICCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rang: string;
  item_parent: string;
  ordre: number;
}

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
  const [oicCompetences, setOicCompetences] = useState<OICCompetence[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Charger les données du tableau
      if (rang === 'A' && item?.tableau_rang_a) {
        setTableauData(item.tableau_rang_a);
      } else if (rang === 'B' && item?.tableau_rang_b) {
        setTableauData(item.tableau_rang_b);
      }
      
      // Charger les compétences OIC depuis la base
      try {
        const itemCode = item.item_code.replace('IC-', '').padStart(3, '0'); // IC-1 -> 001
        
        const { data: competences, error } = await supabase
          .from('oic_competences')
          .select('objectif_id, intitule, description, rang, item_parent, ordre')
          .eq('item_parent', itemCode)
          .eq('rang', rang)
          .order('ordre', { ascending: true });
        
        if (!error && competences) {
          setOicCompetences(competences);
        }
      } catch (error) {
        console.error('Erreur chargement compétences OIC:', error);
      }
      
      setLoading(false);
      
      // Simuler progression
      const timer = setTimeout(() => {
        setProgress(85);
        onProgress?.(85);
      }, 1500);
      
      return () => clearTimeout(timer);
    };
    
    loadData();
  }, [item, rang, onProgress]);

  const competenceLevel = rang === 'A' ? 'Application clinique' : 'Expertise approfondie';
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement des compétences...</p>
        </div>
      </div>
    );
  }

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
          {/* Compétences OIC */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Compétences OIC - Rang {rang}</span>
                <Badge variant="secondary">{oicCompetences.length} compétences</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oicCompetences.length > 0 ? (
                <div className="space-y-3">
                  {oicCompetences
                    .sort((a, b) => (a.ordre || 0) - (b.ordre || 0)) // Tri supplémentaire côté client pour sécurité
                    .map((competence, index) => (
                    <div key={competence.objectif_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                          {competence.ordre || (index + 1)}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {competence.objectif_id}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Ordre {competence.ordre || (index + 1)}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-base leading-tight text-foreground">
                            {competence.intitule}
                          </h4>
                          {competence.description && competence.description.trim() && (
                            <div className="p-3 bg-muted/30 rounded-md border-l-4 border-l-blue-500">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {competence.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base">Aucune compétence OIC disponible pour le rang {rang}</p>
                  <p className="text-sm mt-2">Les compétences seront chargées automatiquement depuis le référentiel</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contenu détaillé */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Contenu pédagogique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Niveau de compétence</h4>
                  <p className="text-blue-800">{competenceLevel}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Compétences</h4>
                    <p className="text-green-800 text-sm">
                      {oicCompetences.length} compétences officielles du référentiel OIC
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">⚡ Niveau</h4>
                    <p className="text-purple-800 text-sm">
                      {rang === 'A' ? 'Formation initiale - Application' : 'Formation approfondie - Expertise'}
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
                    Mettez en pratique les compétences OIC dans des situations cliniques réelles.
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
                  <span className="text-muted-foreground">Compétences OIC</span>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{oicCompetences.length}</span>
                  </div>
                </div>
                
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