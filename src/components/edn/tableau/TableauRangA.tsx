
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
import { TableauRangAFooterIC1 } from './TableauRangAFooterIC1';
import { TableauRangAFooterIC2 } from './TableauRangAFooterIC2';
import { TableauRangAFooterIC3 } from './TableauRangAFooterIC3';
import { TableauRangAFooterIC4 } from './TableauRangAFooterIC4';
import { TableauRangAFooterIC5 } from './TableauRangAFooterIC5';
import { processTableauRangAIC1, isIC1Item } from './TableauRangAUtilsIC1Integration';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';
import { processTableauRangAIC3, isIC3Item } from './TableauRangAUtilsIC3Integration';
import { processTableauRangAIC4, isIC4Item } from './TableauRangAUtilsIC4Integration';
import { processTableauRangAIC5, isIC5Item } from './TableauRangAUtilsIC5Integration';
import { processStandardTableauData } from './TableauRangAUtilsStandard';
import { determinerColonnesUtiles, generateLignesRangAIntelligent } from './TableauRangAUtils';

interface TableauRangAProps {
  data: {
    theme?: string;
    title?: string;
    item_code?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
    tableau_rang_a?: any;
  };
}

export const TableauRangA = ({ data }: TableauRangAProps) => {
  console.log('🔍 TableauRangA - Données reçues:', data);

  if (!data) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-amber-900">Tableau Rang A</h2>
        <p className="text-amber-700">Aucune donnée disponible</p>
      </div>
    );
  }

  // Déterminer le type d'item et traiter les données en conséquence
  let lignesEnrichies: string[][];
  let colonnesUtiles: any[];
  let theme: string;
  let footerComponent: JSX.Element;

  if (isIC1Item(data)) {
    console.log('✅ Item IC-1 détecté');
    const processed = processTableauRangAIC1(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC1 colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  } else if (isIC2Item(data)) {
    console.log('✅ Item IC-2 détecté');
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
    console.log('✅ Item IC-3 détecté');
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
    console.log('✅ Item IC-4 détecté - Qualité et sécurité des soins');
    const processed = processTableauRangAIC4(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC4 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
    />;
  } else if (isIC5Item(data)) {
    console.log('✅ Item IC-5 détecté');
    const processed = processTableauRangAIC5(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC5 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={processed.isRangB}
    />;
  } else {
    // Traitement standard avec les nouvelles données JSON de Supabase
    console.log('📋 Traitement standard pour:', data?.item_code);
    const processed = processStandardTableauData(data, false);
    if (processed) {
      lignesEnrichies = processed.lignesEnrichies;
      colonnesUtiles = processed.colonnesUtiles;
      theme = processed.theme;
    } else {
      // Fallback vers l'ancienne méthode si pas de données JSON
      lignesEnrichies = generateLignesRangAIntelligent(data);
      colonnesUtiles = determinerColonnesUtiles(lignesEnrichies);
      theme = data.theme || data.title || 'Tableau Rang A';
    }
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  }

  console.log('📊 TableauRangA - Données traitées:', {
    theme,
    colonnesUtiles: colonnesUtiles.length,
    lignesEnrichies: lignesEnrichies.length
  });

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-xl">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={data?.item_code || 'IC-X'} 
        totalCompetences={lignesEnrichies.length} 
      />
      
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
