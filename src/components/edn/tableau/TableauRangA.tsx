
import React from 'react';
import { TableauCompetencesOIC } from './TableauCompetencesOIC';
import { TableauRangAHeader } from './TableauRangAHeader';
import { TableauRangAGrid } from './TableauRangAGrid';
import { TableauRangAFooter } from './TableauRangAFooter';
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

  // Nouveau format avec sections OIC (après migration)
  if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
    console.log('✅ Format OIC avec sections détecté, conversion pour nouveau composant');
    
    // Convertir le format sections vers le format competences attendu avec toutes les informations
    const competencesData = {
      title: data.title || `${itemCode} Rang A - Compétences OIC`,
      competences: data.sections.map((section: any) => {
        // Créer une description enrichie avec toutes les informations disponibles
        let enrichedDescription = '';
        
        if (section.content) {
          enrichedDescription += section.content;
        }
        
        // Ajouter les informations métier importantes
        const metaInfo = [];
        if (section.objectif_id) metaInfo.push(`🎯 Objectif OIC: ${section.objectif_id}`);
        if (section.rubrique) metaInfo.push(`📚 Rubrique: ${section.rubrique}`);
        if (section.keywords && Array.isArray(section.keywords) && section.keywords.length > 0) {
          metaInfo.push(`🔍 Mots-clés: ${section.keywords.join(', ')}`);
        }
        
        if (metaInfo.length > 0) {
          enrichedDescription += (enrichedDescription ? '\n\n' : '') + metaInfo.join('\n');
        }
        
        return {
          intitule: section.title || 'Compétence non définie',
          description: enrichedDescription || 'Description non disponible'
        };
      }),
      count: data.competences_count || data.sections.length,
      theme: data.subtitle || 'Compétences OIC'
    };
    
    console.log('🔄 Données converties:', competencesData);
    
    return (
      <TableauCompetencesOIC 
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
      <TableauCompetencesOIC 
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
