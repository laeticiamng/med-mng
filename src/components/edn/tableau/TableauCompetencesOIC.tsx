import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createSafeHtml, sanitizeTextWithBreaks } from '@/utils/sanitize';

interface CompetenceOIC {
  intitule: string;
  description: string;
  objectif_id?: string;
  rubrique?: string;
  keywords?: string[];
  // Contenu enrichi niveau LiSA
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
  sections_detaillees?: any;
  contenu_detaille?: any;
}

interface TableauCompetencesOICProps {
  data: {
    title: string;
    competences: CompetenceOIC[];
    count: number;
    theme: string;
  };
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOIC: React.FC<TableauCompetencesOICProps> = ({ 
  data, 
  itemCode, 
  rang 
}) => {
  // Gestion du cas où il n'y a pas de compétences OIC définies
  if (!data || !data.competences || data.competences.length === 0 || data.count === 0) {
    return (
      <Card className="w-full">
        <CardHeader className={`${rang === 'A' ? 'bg-warning/10' : 'bg-accent/10'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-warning' : 'text-accent'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-muted-foreground">
              0 compétence OIC
            </Badge>
          </CardTitle>
          <p className={`text-sm ${rang === 'A' ? 'text-warning/80' : 'text-accent/80'}`}>
            Aucune compétence OIC officielle définie pour ce rang
          </p>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-warning/20' : 'bg-accent/20'} flex items-center justify-center`}>
              <span className={`text-2xl ${rang === 'A' ? 'text-warning' : 'text-accent'}`}>📋</span>
            </div>
            <h4 className="font-semibold text-foreground">
              Aucune compétence OIC disponible
            </h4>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Cet item n'a pas encore de compétences OIC officielles définies pour le rang {rang} 
              dans le référentiel extracté de la base de données.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { title, competences, count, theme } = data;

  // Assurer minimum 5 lignes pour l'affichage tableau
  const displayCompetences = competences.length >= 5 
    ? competences 
    : [
        ...competences,
        ...Array(5 - competences.length).fill(null).map((_, idx) => ({
          intitule: `Compétence ${competences.length + idx + 1} (en développement)`,
          description: 'Cette compétence sera disponible dans une prochaine mise à jour du référentiel OIC.'
        }))
      ];

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-background via-background to-muted/10">
      <CardHeader className={`${rang === 'A' ? 'bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5' : 'bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5'} border-b-2 ${rang === 'A' ? 'border-primary/20' : 'border-accent/20'}`}>
        <CardTitle className={`${rang === 'A' ? 'text-primary' : 'text-accent'} flex items-center justify-between text-xl font-bold`}>
          <span className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${rang === 'A' ? 'bg-gradient-to-r from-primary to-primary/80 shadow-sm' : 'bg-gradient-to-r from-accent to-accent/80 shadow-sm'}`}></div>
            {title}
          </span>
          <Badge 
            variant="secondary" 
            className={`ml-2 ${rang === 'A' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-accent/20 text-accent border-accent/30'} font-bold px-3 py-1`}
          >
            {count} compétence{count > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <p className={`text-sm ${rang === 'A' ? 'text-primary/80' : 'text-accent/80'} font-semibold mt-2`}>
          {theme}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Tableau premium enrichi niveau LiSA - 8 colonnes détaillées */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${rang === 'A' ? 'bg-gradient-to-r from-primary/10 to-primary/5' : 'bg-gradient-to-r from-accent/10 to-accent/5'} border-b-2 ${rang === 'A' ? 'border-primary/20' : 'border-accent/20'}`}>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} w-12`}>
                  N°
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[180px]`}>
                  Code & Titre Complet
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[200px]`}>
                  Sommaire & Description
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[160px]`}>
                  Mécanismes
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[160px]`}>
                  Indications
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[180px]`}>
                  Effets & Interactions
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[160px]`}>
                  Surveillance & Causes Échec
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-primary' : 'text-accent'} min-w-[120px]`}>
                  Métadonnées
                </th>
              </tr>
            </thead>
            <tbody>
              {displayCompetences.map((competence: any, index) => {
                const isPlaceholder = index >= competences.length;
                
                return (
                  <tr 
                    key={index}
                    className={`border-b border-border/20 hover:bg-gradient-to-r ${
                      rang === 'A' 
                        ? 'hover:from-primary/5 hover:to-transparent' 
                        : 'hover:from-accent/5 hover:to-transparent'
                    } transition-all duration-200 group ${isPlaceholder ? 'opacity-60' : ''}`}
                  >
                    {/* Numéro */}
                    <td className="px-3 py-4">
                      <div className={`w-8 h-8 rounded-lg ${
                        isPlaceholder 
                          ? 'bg-muted text-muted-foreground border border-border' 
                          : rang === 'A' 
                            ? 'bg-gradient-to-br from-primary/10 to-primary/20 text-primary shadow-sm border border-primary/20' 
                            : 'bg-gradient-to-br from-accent/10 to-accent/20 text-accent shadow-sm border border-accent/20'
                      } flex items-center justify-center text-xs font-bold group-hover:scale-105 transition-transform duration-200`}>
                        {competence.ordre_affichage || index + 1}
                      </div>
                    </td>
                    
                    {/* Code & Titre Complet */}
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {competence.objectif_id && (
                          <Badge variant="outline" className={`${rang === 'A' ? 'border-primary/30 text-primary bg-primary/5' : 'border-accent/30 text-accent bg-accent/5'} text-xs font-mono`}>
                            {competence.objectif_id}
                          </Badge>
                        )}
                        <h4 className={`text-xs font-bold leading-tight ${isPlaceholder ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary'} transition-colors duration-200`}>
                          {competence.titre_complet || competence.intitule}
                        </h4>
                      </div>
                    </td>
                    
                    {/* Sommaire & Description */}
                    <td className="px-3 py-4">
                      <div className={`text-xs leading-relaxed space-y-2`}>
                        {competence.sommaire && (
                          <div className="bg-warning/10 border border-warning/20 rounded p-2">
                            <div className="font-semibold text-warning mb-1">📋 Sommaire:</div>
                            <div 
                              className="text-warning/80 text-xs"
                              dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.sommaire))}
                            />
                          </div>
                        )}
                        {competence.description && (
                          <div className={`${isPlaceholder ? 'text-muted-foreground' : 'text-muted-foreground'} bg-muted/20 rounded p-2 border border-border/10`}>
                            <div 
                              dangerouslySetInnerHTML={createSafeHtml(
                                competence.description
                                  .replace(/&nbsp;/g, ' ')
                                  .replace(/&lt;/g, '<')
                                  .replace(/&gt;/g, '>')
                                  .replace(/<br\s*\/?>/gi, '<br>')
                                  .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
                                  .trim()
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Mécanismes */}
                    <td className="px-3 py-4">
                      {competence.mecanismes ? (
                        <div className="bg-success/10 border border-success/20 rounded p-2">
                          <div className="font-semibold text-success mb-1 text-xs">⚙️ Mécanismes:</div>
                           <div 
                             className="text-success/80 text-xs leading-relaxed"
                             dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.mecanismes))}
                           />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">En développement</span>
                      )}
                    </td>
                    
                    {/* Indications */}
                    <td className="px-3 py-4">
                      {competence.indications ? (
                        <div className="bg-primary/10 border border-primary/20 rounded p-2">
                          <div className="font-semibold text-primary mb-1 text-xs">🎯 Indications:</div>
                           <div 
                             className="text-primary/80 text-xs leading-relaxed"
                             dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.indications))}
                           />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">En développement</span>
                      )}
                    </td>
                    
                    {/* Effets & Interactions */}
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {competence.effets_indesirables && (
                          <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                            <div className="font-semibold text-destructive mb-1 text-xs">⚠️ Effets indésirables:</div>
                             <div 
                               className="text-destructive/80 text-xs leading-relaxed"
                               dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.effets_indesirables))}
                             />
                          </div>
                        )}
                        {competence.interactions && (
                          <div className="bg-warning/10 border border-warning/20 rounded p-2">
                            <div className="font-semibold text-warning mb-1 text-xs">🔄 Interactions:</div>
                             <div 
                               className="text-warning/80 text-xs leading-relaxed"
                               dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.interactions))}
                             />
                          </div>
                        )}
                        {!competence.effets_indesirables && !competence.interactions && (
                          <span className="text-xs text-muted-foreground italic">En développement</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Surveillance & Causes Échec */}
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {competence.modalites_surveillance && (
                          <div className="bg-accent/10 border border-accent/20 rounded p-2">
                            <div className="font-semibold text-accent mb-1 text-xs">🔍 Surveillance:</div>
                             <div 
                               className="text-accent/80 text-xs leading-relaxed"
                               dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.modalites_surveillance))}
                             />
                          </div>
                        )}
                        {competence.causes_echec && (
                          <div className="bg-muted border border-border rounded p-2">
                            <div className="font-semibold text-foreground mb-1 text-xs">❌ Causes échec:</div>
                             <div 
                               className="text-muted-foreground text-xs leading-relaxed"
                               dangerouslySetInnerHTML={createSafeHtml(sanitizeTextWithBreaks(competence.causes_echec))}
                             />
                          </div>
                        )}
                        {!competence.modalites_surveillance && !competence.causes_echec && (
                          <span className="text-xs text-muted-foreground italic">En développement</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Métadonnées */}  
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {competence.rubrique && competence.rubrique !== 'Non spécifiée' && (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rang === 'A' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'bg-accent/10 text-accent border border-accent/20'
                          }`}>
                            📚 {competence.rubrique}
                          </div>
                        )}
                        {competence.contributeurs && (
                          <div className="text-xs text-muted-foreground">
                            <div className="font-semibold">👥 Contributeurs:</div>
                            <div className="text-xs">{competence.contributeurs}</div>
                          </div>
                        )}
                        {competence.keywords && Array.isArray(competence.keywords) && competence.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {competence.keywords.slice(0, 2).map((keyword: string, kidx: number) => (
                              <Badge 
                                key={kidx} 
                                variant="secondary" 
                                className={`text-xs ${
                                  rang === 'A' 
                                    ? 'bg-primary/5 text-primary border-primary/20' 
                                    : 'bg-accent/5 text-accent border-accent/20'
                                }`}
                              >
                                {keyword.trim()}
                              </Badge>
                            ))}
                            {competence.keywords.length > 2 && (
                              <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                                +{competence.keywords.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Footer avec statistiques */}
        <div className={`${rang === 'A' ? 'bg-gradient-to-r from-primary/5 to-primary/10' : 'bg-gradient-to-r from-accent/5 to-accent/10'} px-6 py-4 border-t border-border/20`}>
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-4 ${rang === 'A' ? 'text-primary' : 'text-accent'} font-medium`}>
              <span>📊 Total: {count} compétences officielles</span>
              <span>📋 Rang {rang}: Niveau {rang === 'A' ? 'Fondamental' : 'Avancé'}</span>
            </div>
            <div className={`${rang === 'A' ? 'text-primary/80' : 'text-accent/80'} font-medium`}>
              Référentiel OIC 2024
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};