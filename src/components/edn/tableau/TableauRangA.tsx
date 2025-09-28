
import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
import { useOicCompetences } from '@/hooks/useOicCompetences';
import { TableauCompetencesOICWithRealData } from './TableauCompetencesOICWithRealData';
import { TableauRangAFooterIC1 } from './TableauRangAFooterIC1';
import { TableauRangAFooterIC2 } from './TableauRangAFooterIC2';
import { TableauRangAFooterIC3 } from './TableauRangAFooterIC3';
import { TableauRangAFooterIC4 } from './TableauRangAFooterIC4';
import { TableauRangAFooterIC5 } from './TableauRangAFooterIC5';
import { TableauRangAFooterIC6 } from './TableauRangAFooterIC6';
import { TableauRangAFooterIC7 } from './TableauRangAFooterIC7';
import { TableauRangAFooterIC8 } from './TableauRangAFooterIC8';
import { TableauRangAFooterIC9 } from './TableauRangAFooterIC9';
import { TableauRangAFooterIC10 } from './TableauRangAFooterIC10';
import { TableauRangAFooterOIC010 } from './TableauRangAFooterOIC010';

interface TableauRangAProps {
  data: any;
  itemCode?: string;
}

export const TableauRangA: React.FC<TableauRangAProps> = ({ data, itemCode }) => {
  console.log('🔍 TableauRangA - données reçues:', { data, itemCode });
  console.log('🔍 TableauRangA - structure complète:', JSON.stringify(data, null, 2));

  // Si des données sont déjà fournies, les utiliser directement sans faire d'appel externe
  console.log('✅ Utilisation des données fournies directement pour', itemCode);

  // Nouveau format avec sections OIC (après migration)
  if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
    console.log('✅ Format OIC avec sections détecté, conversion pour nouveau composant');
    
    // Convertir le format sections vers le format competences attendu avec toutes les informations
    const competencesData = {
      title: data.title || `${itemCode} Rang A - Compétences OIC`,
      competences: data.sections.map((section: any, index: number) => {
        // Extraire l'objectif_id depuis les keywords si disponible
        const objectifId = section.keywords?.find((keyword: string) => keyword.startsWith('OIC-')) || 
                          section.competence_id || 
                          `OIC-${itemCode?.replace('IC-', '')}-${String(index + 1).padStart(2, '0')}-A`;
        
        return {
          intitule: section.title || 'Compétence non définie',
          description: section.content || 'Description non disponible',
          objectif_id: objectifId,
          rubrique: section.rubrique_oic || section.rubrique || (section.keywords?.[0] || 'Non spécifiée'),
          keywords: section.keywords || [],
          // Données enrichies niveau LiSA (directement depuis les sections si disponibles)
          titre_complet: section.title || null,
          sommaire: section.content || null,
          mecanismes: section.mecanismes || null,
          indications: section.indications || null,
          effets_indesirables: section.effets_indesirables || null,
          interactions: section.interactions || null,
          modalites_surveillance: section.modalites_surveillance || null,
          causes_echec: section.causes_echec || null,
          contributeurs: section.contributeurs || null,
          ordre_affichage: index + 1
        };
      }),
      count: data.sections.length,
      theme: data.subtitle || 'Compétences OIC fusionnées E-LiSA'
    };
    
    console.log('🔄 Données converties:', competencesData);
    
    return (
      <TableauCompetencesOICOptimized 
        data={competencesData} 
        itemCode={itemCode || 'IC-X'} 
        rang="A" 
      />
    );
  }

  // Format direct avec compétences (ancien format)
  if (data && data.competences && Array.isArray(data.competences)) {
    console.log('✅ Format OIC direct détecté, utilisation du nouveau composant');
    return (
      <TableauCompetencesOICOptimized 
        data={data} 
        itemCode={itemCode || 'IC-X'} 
        rang="A" 
      />
    );
  }

  // Ancien format avec colonnes/lignes (fallback)
  console.log('⚠️ Format ancien détecté, utilisation de l\'ancien composant');
  const theme = data?.theme || "Thème non défini";
  const colonnesData = data?.colonnes || [];
  const lignesData = data?.lignes || [];

  const colonnes = colonnesData.map((col: any) => ({
    nom: col.nom || 'N/A',
    description: col.description || 'N/A',
  }));

  const lignes = lignesData.map((ligneData: any) => {
    const ligne: any = {};
    colonnesData.forEach((col: any, index: number) => {
      ligne[col.nom] = ligneData[index] || '';
    });
    return ligne;
  });

  // Transformation des données pour le nouveau format
  const colonnesUtiles = colonnes;
  const lignesEnrichies = lignes.map((ligne: any) => Object.values(ligne));

  const renderSpecificFooter = () => {
    const colonnesCount = colonnes.length;
    const lignesCount = lignes.length;

    if (!itemCode) return <TableauRangAFooter colonnesCount={colonnesCount} lignesCount={lignesCount} />;

    switch (itemCode) {
      case 'IC-1':
        return <TableauRangAFooterIC1 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-2':
        return <TableauRangAFooterIC2 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-3':
        return <TableauRangAFooterIC3 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-4':
        return <TableauRangAFooterIC4 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-5':
        return <TableauRangAFooterIC5 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-6':
        return <TableauRangAFooterIC6 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-7':
        return <TableauRangAFooterIC7 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-8':
        return <TableauRangAFooterIC8 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-9':
        return <TableauRangAFooterIC9 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'IC-10':
        return <TableauRangAFooterIC10 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      case 'OIC-010-03-B':
        return <TableauRangAFooterOIC010 colonnesCount={colonnesCount} lignesCount={lignesCount} />;
      default:
        return <TableauRangAFooter colonnesCount={colonnesCount} lignesCount={lignesCount} />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <TableauRangAHeader 
        theme={theme} 
        itemCode={itemCode || 'IC-X'}
        totalCompetences={lignes.length}
      />
      <TableauRangAGrid 
        colonnesUtiles={colonnesUtiles} 
        lignesEnrichies={lignesEnrichies} 
      />
      {renderSpecificFooter()}
    </div>
  );
};
