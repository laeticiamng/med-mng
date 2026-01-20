import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompetenceCardOptimized } from './CompetenceCardOptimized';
import { CompetenceFlashcard } from './CompetenceFlashcard';
import { Book, Search, Grid, List, Layers } from 'lucide-react';

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
    ? 'from-primary to-primary/80'
    : 'from-accent to-accent/80';

  return (
    <Card className="hover:shadow-md transition-all duration-200 border border-border/50 group">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors} text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm shrink-0`}>
              {competence.ordre_affichage || index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {competence.objectif_id && (
                  <Badge variant="outline" className="text-xs font-bold">
                    {competence.objectif_id}
                  </Badge>
                )}
                {competence.rubrique && (
                  <Badge variant="secondary" className="text-xs">
                    {competence.rubrique}
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm text-foreground mb-2">
                {competence.titre_complet || competence.intitule}
              </h4>
            </div>
          </div>
          
          {/* Description complète */}
          {competence.description && (
            <p className="text-sm text-muted-foreground leading-relaxed pl-13">
              {competence.description}
            </p>
          )}
          
          {/* Détails supplémentaires si disponibles */}
          {(competence.sommaire || competence.mecanismes || competence.indications) && (
            <div className="mt-2 pl-13 space-y-2 border-l-2 border-primary/20 ml-5">
              {competence.sommaire && (
                <div className="pl-3">
                  <span className="text-xs font-semibold text-primary">Sommaire:</span>
                  <p className="text-xs text-muted-foreground">{competence.sommaire}</p>
                </div>
              )}
              {competence.mecanismes && (
                <div className="pl-3">
                  <span className="text-xs font-semibold text-primary">Mécanismes:</span>
                  <p className="text-xs text-muted-foreground">{competence.mecanismes}</p>
                </div>
              )}
              {competence.indications && (
                <div className="pl-3">
                  <span className="text-xs font-semibold text-primary">Indications:</span>
                  <p className="text-xs text-muted-foreground">{competence.indications}</p>
                </div>
              )}
              {competence.effets_indesirables && (
                <div className="pl-3">
                  <span className="text-xs font-semibold text-warning">Effets indésirables:</span>
                  <p className="text-xs text-muted-foreground">{competence.effets_indesirables}</p>
                </div>
              )}
            </div>
          )}
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
  const [showFlashcards, setShowFlashcards] = useState(false);
  
  if (!data || !data.competences || data.competences.length === 0 || data.count === 0) {
    return (
      <Card className="w-full">
        <CardHeader className={`${rang === 'A' ? 'bg-primary/5' : 'bg-accent/5'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-primary' : 'text-accent-foreground'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-muted-foreground">
              En attente
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center`}>
              <Book className={`w-8 h-8 ${rang === 'A' ? 'text-primary' : 'text-accent-foreground'}`} />
            </div>
            <h4 className="font-semibold text-foreground">
              Compétences en cours d'extraction
            </h4>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Les compétences OIC officielles pour le rang {rang} de cet item sont en cours d'extraction depuis UNESS.
              Consultez les autres formats disponibles en attendant.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Déstructurer les données
  const { title, competences, count, theme } = data;
  
  // Message spécial pour items avec très peu de compétences
  const isLowCount = count <= 3;
  const themeColors = rang === 'A' 
    ? 'from-primary to-primary/80'
    : 'from-accent to-accent/80';

  return (
    <div className="w-full space-y-6">
      {/* En-tête amélioré */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${themeColors} text-primary-foreground flex items-center justify-center shadow-lg`}>
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
                  className="rounded-l-none rounded-r-none border-l"
                >
                  <List className="w-4 h-4 mr-2" />
                  Compact
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFlashcards(true)}
                  className="rounded-l-none border-l"
                  title="Mode Flashcards"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Flashcards
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Flashcard Dialog */}
      <Dialog open={showFlashcards} onOpenChange={setShowFlashcards}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flashcards - {itemCode} Rang {rang}</DialogTitle>
          </DialogHeader>
          <CompetenceFlashcard 
            competences={competences} 
            rang={rang} 
            itemCode={itemCode}
            onClose={() => setShowFlashcards(false)}
          />
        </DialogContent>
      </Dialog>

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