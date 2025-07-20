import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <CardHeader className={`${rang === 'A' ? 'bg-amber-50' : 'bg-orange-50'} border-b`}>
          <CardTitle className={`${rang === 'A' ? 'text-amber-800' : 'text-orange-800'} flex items-center justify-between`}>
            <span>{itemCode} Rang {rang} - Compétences OIC</span>
            <Badge variant="outline" className="ml-2 text-gray-500">
              0 compétence OIC
            </Badge>
          </CardTitle>
          <p className={`text-sm ${rang === 'A' ? 'text-amber-600' : 'text-orange-600'}`}>
            Aucune compétence OIC officielle définie pour ce rang
          </p>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-amber-100' : 'bg-orange-100'} flex items-center justify-center`}>
              <span className={`text-2xl ${rang === 'A' ? 'text-amber-600' : 'text-orange-600'}`}>📋</span>
            </div>
            <h4 className="font-semibold text-gray-900">
              Aucune compétence OIC disponible
            </h4>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
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
      <CardHeader className={`${rang === 'A' ? 'bg-gradient-to-r from-blue-50 via-blue-100/70 to-blue-50' : 'bg-gradient-to-r from-purple-50 via-purple-100/70 to-purple-50'} border-b-2 ${rang === 'A' ? 'border-blue-200' : 'border-purple-200'}`}>
        <CardTitle className={`${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} flex items-center justify-between text-xl font-bold`}>
          <span className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${rang === 'A' ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm' : 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm'}`}></div>
            {title}
          </span>
          <Badge 
            variant="secondary" 
            className={`ml-2 ${rang === 'A' ? 'bg-blue-200 text-blue-900 border-blue-300' : 'bg-purple-200 text-purple-900 border-purple-300'} font-bold px-3 py-1`}
          >
            {count} compétence{count > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <p className={`text-sm ${rang === 'A' ? 'text-blue-800' : 'text-purple-800'} font-semibold mt-2`}>
          {theme}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Tableau premium enrichi niveau LiSA - 8 colonnes détaillées */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${rang === 'A' ? 'bg-gradient-to-r from-blue-100 to-blue-50' : 'bg-gradient-to-r from-purple-100 to-purple-50'} border-b-2 ${rang === 'A' ? 'border-blue-200' : 'border-purple-200'}`}>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} w-12`}>
                  N°
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[180px]`}>
                  Code & Titre Complet
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[200px]`}>
                  Sommaire & Description
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[160px]`}>
                  Mécanismes
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[160px]`}>
                  Indications
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[180px]`}>
                  Effets & Interactions
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[160px]`}>
                  Surveillance & Causes Échec
                </th>
                <th className={`px-3 py-4 text-left text-xs font-bold ${rang === 'A' ? 'text-blue-900' : 'text-purple-900'} min-w-[120px]`}>
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
                        ? 'hover:from-blue-50/40 hover:to-transparent' 
                        : 'hover:from-purple-50/40 hover:to-transparent'
                    } transition-all duration-200 group ${isPlaceholder ? 'opacity-60' : ''}`}
                  >
                    {/* Numéro */}
                    <td className="px-3 py-4">
                      <div className={`w-8 h-8 rounded-lg ${
                        isPlaceholder 
                          ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                          : rang === 'A' 
                            ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 shadow-sm border border-blue-200/50' 
                            : 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 shadow-sm border border-purple-200/50'
                      } flex items-center justify-center text-xs font-bold group-hover:scale-105 transition-transform duration-200`}>
                        {competence.ordre_affichage || index + 1}
                      </div>
                    </td>
                    
                    {/* Code & Titre Complet */}
                    <td className="px-3 py-4">
                      <div className="space-y-2">
                        {competence.objectif_id && (
                          <Badge variant="outline" className={`${rang === 'A' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-purple-300 text-purple-700 bg-purple-50'} text-xs font-mono`}>
                            {competence.objectif_id}
                          </Badge>
                        )}
                        <h4 className={`text-xs font-bold leading-tight ${isPlaceholder ? 'text-gray-600' : 'text-foreground group-hover:text-primary'} transition-colors duration-200`}>
                          {competence.titre_complet || competence.intitule}
                        </h4>
                      </div>
                    </td>
                    
                    {/* Sommaire & Description */}
                    <td className="px-3 py-4">
                      <div className={`text-xs leading-relaxed space-y-2`}>
                        {competence.sommaire && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-2">
                            <div className="font-semibold text-amber-800 mb-1">📋 Sommaire:</div>
                            <div 
                              className="text-amber-700 text-xs"
                              dangerouslySetInnerHTML={{
                                __html: competence.sommaire.replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        )}
                        {competence.description && (
                          <div className={`${isPlaceholder ? 'text-gray-500' : 'text-muted-foreground'} bg-muted/20 rounded p-2 border border-border/10`}>
                            <div 
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
                      </div>
                    </td>
                    
                    {/* Mécanismes */}
                    <td className="px-3 py-4">
                      {competence.mecanismes ? (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="font-semibold text-green-800 mb-1 text-xs">⚙️ Mécanismes:</div>
                          <div 
                            className="text-green-700 text-xs leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: competence.mecanismes.replace(/\n/g, '<br>')
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">En développement</span>
                      )}
                    </td>
                    
                    {/* Indications */}
                    <td className="px-3 py-4">
                      {competence.indications ? (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="font-semibold text-blue-800 mb-1 text-xs">🎯 Indications:</div>
                          <div 
                            className="text-blue-700 text-xs leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: competence.indications.replace(/\n/g, '<br>')
                            }}
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
                          <div className="bg-red-50 border border-red-200 rounded p-2">
                            <div className="font-semibold text-red-800 mb-1 text-xs">⚠️ Effets indésirables:</div>
                            <div 
                              className="text-red-700 text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: competence.effets_indesirables.replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        )}
                        {competence.interactions && (
                          <div className="bg-orange-50 border border-orange-200 rounded p-2">
                            <div className="font-semibold text-orange-800 mb-1 text-xs">🔄 Interactions:</div>
                            <div 
                              className="text-orange-700 text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: competence.interactions.replace(/\n/g, '<br>')
                              }}
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
                          <div className="bg-purple-50 border border-purple-200 rounded p-2">
                            <div className="font-semibold text-purple-800 mb-1 text-xs">🔍 Surveillance:</div>
                            <div 
                              className="text-purple-700 text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: competence.modalites_surveillance.replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        )}
                        {competence.causes_echec && (
                          <div className="bg-gray-50 border border-gray-200 rounded p-2">
                            <div className="font-semibold text-gray-800 mb-1 text-xs">❌ Causes échec:</div>
                            <div 
                              className="text-gray-700 text-xs leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: competence.causes_echec.replace(/\n/g, '<br>')
                              }}
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
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
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
                                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                    : 'bg-purple-50 text-purple-600 border-purple-200'
                                }`}
                              >
                                {keyword.trim()}
                              </Badge>
                            ))}
                            {competence.keywords.length > 2 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
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
        <div className={`${rang === 'A' ? 'bg-gradient-to-r from-blue-50/50 to-blue-100/30' : 'bg-gradient-to-r from-purple-50/50 to-purple-100/30'} px-6 py-4 border-t border-border/20`}>
          <div className="flex items-center justify-between text-xs">
            <div className={`flex items-center gap-4 ${rang === 'A' ? 'text-blue-700' : 'text-purple-700'} font-medium`}>
              <span>📊 Total: {count} compétences officielles</span>
              <span>📋 Rang {rang}: Niveau {rang === 'A' ? 'Fondamental' : 'Avancé'}</span>
            </div>
            <div className={`${rang === 'A' ? 'text-blue-600' : 'text-purple-600'} font-medium`}>
              Référentiel OIC 2024
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};