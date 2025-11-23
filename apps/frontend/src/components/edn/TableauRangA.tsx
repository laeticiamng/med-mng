import logger from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangAHeader } from './tableau/TableauRangAHeader';
import { TableauRangAGrid } from './tableau/TableauRangAGrid';
import { TableauRangAFooter } from './tableau/TableauRangAFooter';
import { TableauRangAFooterIC1 } from './tableau/TableauRangAFooterIC1';
import { TableauRangAFooterIC2 } from './tableau/TableauRangAFooterIC2';
import { TableauRangAFooterIC3 } from './tableau/TableauRangAFooterIC3';
import { TableauRangAFooterIC4 } from './tableau/TableauRangAFooterIC4';
import { TableauRangAFooterIC5 } from './tableau/TableauRangAFooterIC5';
import { TableauRangAFooterIC10 } from './tableau/TableauRangAFooterIC10';
import { processTableauRangAIC1, isIC1Item } from './tableau/TableauRangAUtilsIC1Integration';
import { processTableauRangAIC2, isIC2Item } from './tableau/TableauRangAUtilsIC2Integration';
import { processTableauRangAIC3, isIC3Item } from './tableau/TableauRangAUtilsIC3Integration';
import { processTableauRangAIC4, isIC4Item } from './tableau/TableauRangAUtilsIC4Integration';
import { processTableauRangAIC5, isIC5Item } from './tableau/TableauRangAUtilsIC5Integration';
import { processTableauRangAIC10, isIC10Item } from './tableau/TableauRangAUtilsIC10Integration';
import { determinerColonnesUtiles, generateLignesRangAIntelligent } from './tableau/TableauRangAUtils';

interface TableauRangAProps {
  data: {
    theme?: string;
    title?: string;
    subtitle?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
  };
  itemCode?: string;
}

export const TableauRangA = ({ data, itemCode = "IC-X" }: TableauRangAProps) => {
  // Logs réduits pour éviter la pollution console
  // logger.debug('TableauRangA - Received data:', data);

  if (!data) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-primary">Tableau Rang A - Compétences Fondamentales</h2>
        <p className="text-primary/70">Aucune donnée disponible</p>
      </div>
    );
  }

  // Nouvelle logique pour afficher les données structurées correctement
  if (data.sections && Array.isArray(data.sections)) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
            <Badge className="bg-primary">Rang A</Badge>
            {data.title || 'Compétences fondamentales'}
          </h2>
          {data.subtitle && (
            <p className="text-gray-600">{data.subtitle}</p>
          )}
        </div>

        {data.sections.map((section: any, idx: number) => (
          <Card key={idx} className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.content && (
                <p className="text-gray-700 mb-4">{section.content}</p>
              )}
              
              {/* Affichage des compétences détaillées avec accessibilité */}
              {section.competences && Array.isArray(section.competences) && (
                 <div className="space-y-4 mb-4" role="region" aria-labelledby={`competences-${idx}`}>
                  <h4 
                    id={`competences-${idx}`} 
                    className="font-semibold text-primary"
                  >
                    Compétences ({section.competences.length})
                  </h4>
                  {section.competences.map((competence: any, compIdx: number) => {
                    const competenceId = `competence-${idx}-${compIdx}`;
                    return (
                      <Card 
                        key={`${idx}-${competence.competence_id || compIdx}`}
                        className="border-l-4 border-l-primary bg-primary/5"
                        role="article"
                        aria-labelledby={competenceId}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                                aria-label={`Code de compétence ${competence.competence_id}`}
                              >
                                {competence.competence_id}
                              </Badge>
                              <h5 
                                id={competenceId}
                                className="font-medium text-primary"
                              >
                                {competence.concept || competence.title}
                              </h5>
                            </div>
                            
                            {competence.definition && (
                              <p className="text-sm text-gray-700" role="definition">
                                {competence.definition}
                              </p>
                            )}
                            
                            {competence.exemple && (
                              <div 
                                className="bg-success/10 p-2 rounded text-sm"
                                role="note"
                                aria-label="Exemple pratique"
                              >
                                <strong className="text-success">Exemple :</strong> {competence.exemple}
                              </div>
                            )}
                            
                            {competence.application && (
                              <div 
                                className="bg-primary/10 p-2 rounded text-sm"
                                role="note"
                                aria-label="Application clinique"
                              >
                                <strong className="text-primary">Application :</strong> {competence.application}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {section.keywords && Array.isArray(section.keywords) && (
                <div className="flex flex-wrap gap-1">
                  {section.keywords.map((keyword: string, keyIdx: number) => (
                    <Badge key={`${idx}-keyword-${keyIdx}`} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Déterminer le type d'item et traiter les données en conséquence
  let lignesEnrichies: string[][];
  let colonnesUtiles: any[];
  let theme: string;
  let footerComponent: JSX.Element;

  if (isIC1Item(data)) {
    const processed = processTableauRangAIC1(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC1 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (isIC2Item(data)) {
    const processed = processTableauRangAIC2(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC2 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={processed.isRangB}
    />;
  } else if (isIC3Item(data)) {
    const processed = processTableauRangAIC3(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC3 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={processed.isRangB}
    />;
  } else if (isIC4Item(data)) {
    const processed = processTableauRangAIC4(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC4 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (isIC5Item(data)) {
    const processed = processTableauRangAIC5(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC5 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={processed.isRangB}
    />;
  } else if (isIC10Item(data)) {
    const processed = processTableauRangAIC10(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC10 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else {
    // Traitement générique pour les autres items
    lignesEnrichies = generateLignesRangAIntelligent(data);
    colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);
    theme = data.theme || data.title || 'Tableau Rang A';
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  }

  // Logs réduits pour éviter la pollution console
  // logger.debug('TableauRangA - Processed data:', { theme, colonnesUtiles: colonnesUtiles.length, lignesEnrichies: lignesEnrichies.length });

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-xl">
      <TableauRangAHeader theme={theme} itemCode={itemCode} totalCompetences={lignesEnrichies.length} />
      
      {lignesEnrichies.length > 0 ? (
        <>
          <TableauRangAGrid 
            colonnesUtiles={colonnesUtiles}
            lignesEnrichies={lignesEnrichies}
          />
          {footerComponent}
        </>
      ) : (
        <Card className="p-8 text-center bg-white/50 backdrop-blur-sm border-amber-200">
          <p className="text-amber-700 text-lg">
            Les concepts de ce tableau sont en cours de traitement...
          </p>
          <Badge variant="outline" className="mt-4 text-amber-600 border-amber-300">
            Contenu en développement
          </Badge>
        </Card>
      )}
    </div>
  );
};
