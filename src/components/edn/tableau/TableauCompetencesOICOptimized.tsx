import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CompetenceCardOptimized } from './CompetenceCardOptimized';
import { Book, Search, Grid, List } from 'lucide-react';

interface CompetenceOIC {
  intitule: string;
  description: string;
  objectif_id?: string;
  rubrique?: string;
  keywords?: string[];
  titre_complet?: string;
  sommaire?: string;
  mecanismes?: string;
  indications?: string;
  effets_indesirables?: string;
  interactions?: string;
  modalites_surveillance?: string;
  causes_echec?: string;
  contributeurs?: string;
  ordre_affichage?: number;
}

interface TableauCompetencesOICOptimizedProps {
  data: {
    title: string;
    competences: CompetenceOIC[];
    count: number;
    theme: string;
  };
  itemCode: string;
  rang: 'A' | 'B';
}

const CompetenceCompactCard: React.FC<{ 
  competence: CompetenceOIC; 
  index: number; 
  rang: 'A' | 'B';
}> = ({ competence, index, rang }) => {
  const themeColors = rang === 'A' 
    ? 'from-blue-500 to-blue-600'
    : 'from-purple-500 to-purple-600';

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border/50 group">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors} text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:scale-105 transition-transform`}>
            {competence.ordre_affichage || index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {competence.objectif_id && (
                <Badge variant="outline" className="text-xs font-medium px-2 py-1">
                  {competence.objectif_id}
                </Badge>
              )}
              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                {competence.titre_complet || competence.intitule}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {competence.sommaire || competence.description?.substring(0, 150) + '...'}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-center">
            {[competence.sommaire, competence.mecanismes, competence.indications, competence.effets_indesirables]
              .filter(Boolean)
              .slice(0, 3)
              .map((_, idx) => (
                <div key={idx} className="w-2 h-2 rounded-full bg-primary/60"></div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const TableauCompetencesOICOptimized: React.FC<TableauCompetencesOICOptimizedProps> = ({ 
  data, 
  itemCode, 
  rang 
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  
  if (!data || !data.competences || data.competences.length === 0 || data.count === 0) {
    return (
      <Card className="w-full">
        <CardHeader className={`${rang === 'A' ? 'bg-primary/5' : 'bg-accent/5'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-primary' : 'text-accent-foreground'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-muted-foreground">
              0 compétence OIC
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center`}>
              <Book className={`w-8 h-8 ${rang === 'A' ? 'text-primary' : 'text-accent-foreground'}`} />
            </div>
            <h4 className="font-semibold text-foreground">
              Aucune compétence OIC disponible
            </h4>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Cet item n'a pas encore de compétences OIC officielles définies pour le rang {rang}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { title, competences, count, theme } = data;
  const themeColors = rang === 'A' 
    ? 'from-blue-500 to-blue-600'
    : 'from-purple-500 to-purple-600';

  return (
    <div className="w-full space-y-6">
      {/* En-tête amélioré */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors} text-white flex items-center justify-center shadow-lg`}>
                <Book className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {title}
                </CardTitle>
                <p className="text-muted-foreground font-medium">
                  {theme}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm font-bold px-4 py-2 bg-primary/10 text-primary border-primary/20">
                {count} compétence{count > 1 ? 's' : ''} authentique{count > 1 ? 's' : ''}
              </Badge>
              <div className="flex rounded-xl border border-border bg-background shadow-sm">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Détaillé
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4 mr-2" />
                  Compact
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal */}
      <div className={viewMode === 'cards' ? 'space-y-6' : 'space-y-3'}>
        {viewMode === 'cards' ? (
          competences.map((competence, index) => (
            <CompetenceCardOptimized
              key={`${competence.objectif_id}-${index}`}
              competence={competence}
              index={index}
              rang={rang}
            />
          ))
        ) : (
          competences.map((competence, index) => (
            <CompetenceCompactCard
              key={`${competence.objectif_id}-${index}`}
              competence={competence}
              index={index}
              rang={rang}
            />
          ))
        )}
      </div>

      {/* Pied de page informatif */}
      <Card className="border border-border/50 bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground font-medium">
              <span>📊 {count} compétences OIC authentiques analysées</span>
              <span>🎯 Données officielles UNESS</span>
            </div>
            <Badge variant="outline" className="font-medium">
              Rang {rang} - {rang === 'A' ? 'Fondamental' : 'Avancé'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};