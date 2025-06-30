
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
import { TableauRangAFooterIC2 } from './TableauRangAFooterIC2';
import { TableauRangAFooterIC3 } from './TableauRangAFooterIC3';
import { TableauRangAFooterIC4 } from './TableauRangAFooterIC4';
import { TableauRangAFooterIC5 } from './TableauRangAFooterIC5';
import { TableauRangAFooterIC6 } from './TableauRangAFooterIC6';
import { TableauRangAFooterIC7 } from './TableauRangAFooterIC7';
import { TableauRangAFooterIC8 } from './TableauRangAFooterIC8';
import { processTableauRangAIC2, isIC2Item } from './TableauRangAUtilsIC2Integration';
import { processTableauRangAIC3, isIC3Item } from './TableauRangAUtilsIC3Integration';
import { processTableauRangBIC4, isIC4Item } from './TableauRangAUtilsIC4Integration';
import { processTableauRangAIC5, isIC5Item } from './TableauRangAUtilsIC5Integration';
import { isIC6Item } from './TableauRangAUtilsIC6Integration';
import { isIC7Item } from './TableauRangAUtilsIC7Integration';
import { isIC8Item } from './TableauRangAUtilsIC8Integration';
import { processTableauRangBIC6 } from './TableauRangBUtilsIC6Integration';
import { processTableauRangBIC7 } from './TableauRangBUtilsIC7Integration';
import { processTableauRangBIC8 } from './TableauRangBUtilsIC8Integration';
import { processStandardTableauData } from './TableauRangAUtilsStandard';

interface TableauRangBProps {
  data: {
    theme?: string;
    title?: string;
    item_code?: string;
    colonnes?: string[];
    lignes?: string[][];
    sections?: any[];
    tableau_rang_b?: any;
  };
}

export const TableauRangB = ({ data }: TableauRangBProps) => {
  console.log('🔍 TableauRangB - Données reçues:', data);

  if (!data) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-serif text-purple-900">Tableau Rang B</h2>
        <p className="text-purple-700">Aucune donnée disponible</p>
      </div>
    );
  }

  // Déterminer le type d'item et traiter les données en conséquence
  let lignesEnrichies: string[][];
  let colonnesUtiles: any[];
  let theme: string;
  let footerComponent: JSX.Element;

  if (isIC2Item(data)) {
    console.log('✅ Item IC-2 Rang B détecté');
    const processed = processTableauRangAIC2(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC2 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC3Item(data)) {
    console.log('✅ Item IC-3 Rang B détecté');
    const processed = processTableauRangAIC3(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC3 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC4Item(data)) {
    console.log('✅ Item IC-4 Rang B détecté - Expertise qualité et sécurité');
    const processed = processTableauRangBIC4(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC4 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC5Item(data)) {
    console.log('✅ Item IC-5 Rang B détecté');
    const processed = processTableauRangAIC5(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC5 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC6Item(data)) {
    console.log('✅ Item IC-6 Rang B détecté - Organisation expertise');
    const processed = processTableauRangBIC6(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC6 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC7Item(data)) {
    console.log('✅ Item IC-7 Rang B détecté - Discriminations expertise');
    const processed = processTableauRangBIC7(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC7 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else if (isIC8Item(data)) {
    console.log('✅ Item IC-8 Rang B détecté - Certificats expertise');
    const processed = processTableauRangBIC8(data);
    lignesEnrichies = processed.lignesEnrichies;
    colonnesUtiles = processed.colonnesUtiles;
    theme = processed.theme;
    footerComponent = <TableauRangAFooterIC8 
      colonnesCount={colonnesUtiles.length} 
      lignesCount={lignesEnrichies.length}
      isRangB={true}
    />;
  } else {
    // Traitement standard avec les nouvelles données JSON de Supabase
    console.log('📋 Traitement standard Rang B pour:', data?.item_code);
    const processed = processStandardTableauData(data, true);
    if (processed) {
      lignesEnrichies = processed.lignesEnrichies;
      colonnesUtiles = processed.colonnesUtiles;
      theme = processed.theme;
    } else {
      lignesEnrichies = [];
      colonnesUtiles = [];
      theme = data.theme || data.title || 'Tableau Rang B';
    }
    footerComponent = <TableauRangAFooter colonnesCount={colonnesUtiles.length} lignesCount={lignesEnrichies.length} />;
  }

  console.log('📊 TableauRangB - Données traitées:', {
    theme,
    colonnesUtiles: colonnesUtiles.length,
    lignesEnrichies: lignesEnrichies.length
  });

  return (
    <div className="space-y-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-xl">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={data?.item_code || 'IC-X'} 
        totalCompetences={lignesEnrichies.length}
        isRangB={true}
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
        <Card className="p-8 text-center bg-white/50 backdrop-blur-sm border-purple-200">
          <p className="text-purple-700 text-lg">
            Le contenu expert Rang B est en cours de développement...
          </p>
          <Badge variant="outline" className="mt-4 text-purple-600 border-purple-300">
            Expertise avancée en préparation
          </Badge>
        </Card>
      )}
    </div>
  );
};
