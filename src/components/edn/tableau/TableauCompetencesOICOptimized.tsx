import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Eye, Book, Target, AlertTriangle, Settings, Users } from 'lucide-react';

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

const CompetenceCard: React.FC<{ 
  competence: CompetenceOIC; 
  index: number; 
  rang: 'A' | 'B';
  isPlaceholder?: boolean;
}> = ({ competence, index, rang, isPlaceholder = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const themeColors = rang === 'A' 
    ? {
        primary: 'blue',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        accent: 'bg-blue-100'
      }
    : {
        primary: 'purple', 
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        accent: 'bg-purple-100'
      };

  // Compter les sections avec du contenu réel
  const availableSections = {
    details: !!(competence.sommaire || competence.mecanismes),
    clinical: !!(competence.indications || competence.modalites_surveillance),
    safety: !!(competence.effets_indesirables || competence.interactions || competence.causes_echec),
    meta: !!(competence.contributeurs || (competence.rubrique && competence.rubrique !== 'Non spécifiée'))
  };

  const totalSections = Object.values(availableSections).filter(Boolean).length;

  return (
    <Card className={`${isPlaceholder ? 'opacity-60' : ''} hover:shadow-md transition-all duration-200 border-l-4 ${themeColors.border}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`${themeColors.bg} cursor-pointer hover:${themeColors.accent} transition-colors`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${themeColors.accent} ${themeColors.text} flex items-center justify-center text-sm font-bold`}>
                  {competence.ordre_affichage || index + 1}
                </div>
                <div className="flex-1">
                  {competence.objectif_id && (
                    <Badge variant="outline" className={`${themeColors.text} text-xs mb-2`}>
                      {competence.objectif_id}
                    </Badge>
                  )}
                  <h3 className={`font-semibold ${themeColors.text} text-sm leading-tight`}>
                    {competence.titre_complet || competence.intitule}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {availableSections.details && <Book className="w-4 h-4 text-green-600" />}
                {availableSections.clinical && <Target className="w-4 h-4 text-orange-600" />}
                {availableSections.safety && <AlertTriangle className="w-4 h-4 text-red-600" />}
                {availableSections.meta && <Users className="w-4 h-4 text-blue-600" />}
                <Badge variant="secondary" className="text-xs">
                  {totalSections} section{totalSections > 1 ? 's' : ''}
                </Badge>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4">
            {competence.description && (
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div 
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: competence.description
                      .replace(/&nbsp;/g, ' ')
                      .replace(/&lt;/g, '<')
                      .replace(/&gt;/g, '>')
                      .replace(/<br\s*\/?>/gi, '<br>')
                      .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
                      .trim()
                  }}
                />
              </div>
            )}
            
            {totalSections > 0 ? (
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details" className="text-xs" disabled={!availableSections.details}>
                    <Book className="w-3 h-3 mr-1" />
                    Détails
                  </TabsTrigger>
                  <TabsTrigger value="clinical" className="text-xs" disabled={!availableSections.clinical}>
                    <Target className="w-3 h-3 mr-1" />
                    Clinique
                  </TabsTrigger>
                  <TabsTrigger value="safety" className="text-xs" disabled={!availableSections.safety}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Sécurité
                  </TabsTrigger>
                  <TabsTrigger value="meta" className="text-xs" disabled={!availableSections.meta}>
                    <Users className="w-3 h-3 mr-1" />
                    Méta
                  </TabsTrigger>
                </TabsList>
                
                {availableSections.details && (
                  <TabsContent value="details" className="space-y-3 mt-4">
                    {competence.sommaire && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <h4 className="font-semibold text-amber-800 text-sm mb-2 flex items-center gap-2">
                          <Book className="w-4 h-4" />
                          Sommaire
                        </h4>
                        <p className="text-amber-700 text-sm">{competence.sommaire}</p>
                      </div>
                    )}
                    {competence.mecanismes && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 text-sm mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Mécanismes
                        </h4>
                        <p className="text-green-700 text-sm">{competence.mecanismes}</p>
                      </div>
                    )}
                  </TabsContent>
                )}
                
                {availableSections.clinical && (
                  <TabsContent value="clinical" className="space-y-3 mt-4">
                    {competence.indications && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Indications
                        </h4>
                        <p className="text-blue-700 text-sm">{competence.indications}</p>
                      </div>
                    )}
                    {competence.modalites_surveillance && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-purple-800 text-sm mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Surveillance
                        </h4>
                        <p className="text-purple-700 text-sm">{competence.modalites_surveillance}</p>
                      </div>
                    )}
                  </TabsContent>
                )}
                
                {availableSections.safety && (
                  <TabsContent value="safety" className="space-y-3 mt-4">
                    {competence.effets_indesirables && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Effets indésirables
                        </h4>
                        <p className="text-red-700 text-sm">{competence.effets_indesirables}</p>
                      </div>
                    )}
                    {competence.interactions && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Interactions
                        </h4>
                        <p className="text-orange-700 text-sm">{competence.interactions}</p>
                      </div>
                    )}
                    {competence.causes_echec && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Causes d'échec
                        </h4>
                        <p className="text-gray-700 text-sm">{competence.causes_echec}</p>
                      </div>
                    )}
                  </TabsContent>
                )}
                
                {availableSections.meta && (
                  <TabsContent value="meta" className="space-y-3 mt-4">
                    {competence.contributeurs && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Contributeurs
                        </h4>
                        <p className="text-blue-700 text-sm">{competence.contributeurs}</p>
                      </div>
                    )}
                    {competence.rubrique && competence.rubrique !== 'Non spécifiée' && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <h4 className="font-semibold text-indigo-800 text-sm mb-2">Rubrique</h4>
                        <Badge variant="secondary" className="text-indigo-700">
                          {competence.rubrique}
                        </Badge>
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm">
                  Compétence en cours d'enrichissement avec les données officielles UNESS
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
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
        <CardHeader className={`${rang === 'A' ? 'bg-blue-50' : 'bg-purple-50'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-blue-800' : 'text-purple-800'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-gray-500">
              0 compétence OIC
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center`}>
              <Book className={`w-8 h-8 ${rang === 'A' ? 'text-blue-600' : 'text-purple-600'}`} />
            </div>
            <h4 className="font-semibold text-gray-900">
              Aucune compétence OIC disponible
            </h4>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Cet item n'a pas encore de compétences OIC officielles définies pour le rang {rang}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { title, competences, count, theme } = data;
  const themeColors = rang === 'A' 
    ? { primary: 'blue', bg: 'bg-blue-50', text: 'text-blue-900' }
    : { primary: 'purple', bg: 'bg-purple-50', text: 'text-purple-900' };

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className={`${themeColors.bg} border-b-2 ${rang === 'A' ? 'border-blue-200' : 'border-purple-200'}`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${themeColors.text} flex items-center gap-3 text-xl font-bold`}>
            <div className={`w-6 h-6 rounded-full ${rang === 'A' ? 'bg-blue-600' : 'bg-purple-600'}`}></div>
            {title}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className={`${themeColors.text} font-bold px-3 py-1`}>
              {count} compétence{count > 1 ? 's' : ''} authentique{count > 1 ? 's' : ''}
            </Badge>
            <div className="flex rounded-lg border border-border">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-r-none"
              >
                Cartes
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="rounded-l-none"
              >
                Compact
              </Button>
            </div>
          </div>
        </div>
        <p className={`text-sm ${themeColors.text} mt-2 font-semibold`}>
          {theme}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {viewMode === 'cards' ? (
          <div className="space-y-4">
            {competences.map((competence, index) => (
              <CompetenceCard
                key={`${competence.objectif_id}-${index}`}
                competence={competence}
                index={index}
                rang={rang}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {competences.map((competence, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${rang === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {competence.ordre_affichage || index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {competence.objectif_id && (
                      <Badge variant="outline" className="text-xs">
                        {competence.objectif_id}
                      </Badge>
                    )}
                    <h4 className="font-semibold text-sm truncate">
                      {competence.titre_complet || competence.intitule}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {competence.sommaire || competence.description}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {competence.sommaire && <div className="w-2 h-2 rounded-full bg-green-500" title="Sommaire disponible" />}
                  {competence.mecanismes && <div className="w-2 h-2 rounded-full bg-blue-500" title="Mécanismes disponibles" />}
                  {competence.indications && <div className="w-2 h-2 rounded-full bg-orange-500" title="Indications disponibles" />}
                  {competence.effets_indesirables && <div className="w-2 h-2 rounded-full bg-red-500" title="Effets indésirables disponibles" />}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className={`${rang === 'A' ? 'bg-blue-50/50' : 'bg-purple-50/50'} px-4 py-3 rounded-lg mt-6 border-t border-border/20`}>
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-4 ${themeColors.text} font-medium`}>
              <span>Total: {count} compétences OIC authentiques</span>
              <span>Rang {rang}: Niveau {rang === 'A' ? 'Fondamental' : 'Avancé'}</span>
            </div>
            <div className={`${themeColors.text} font-medium`}>
              Source: UNESS Officiel
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
