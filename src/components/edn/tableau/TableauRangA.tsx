
import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { TableauSectionEnhanced } from '../TableauSectionEnhanced';
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
    console.log('✅ Format avec sections détecté:', data.sections.length, 'sections');
    
    // Si les sections contiennent des compétences détaillées, utiliser le nouveau composant
    const hasDetailedCompetences = data.sections.some((s: any) => s.competences && s.competences.length > 0);
    
    if (hasDetailedCompetences) {
      console.log('✅ Sections avec compétences détaillées, affichage enrichi');
      return (
        <div className="space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {data.title || `${itemCode} Rang A`}
            </h2>
            {data.subtitle && (
              <p className="text-muted-foreground">{data.subtitle}</p>
            )}
          </div>
          {data.sections.map((section: any, index: number) => (
            <TableauSectionEnhanced 
              key={index}
              section={section}
              rang="A"
              index={index}
            />
          ))}
        </div>
      );
    }
    
    // Sinon, convertir au format OIC standard
    console.log('✅ Conversion vers format OIC standard');
    const competencesData = {
      title: data.title || `${itemCode} Rang A - Compétences OIC`,
      competences: data.sections.map((section: any, index: number) => {
        const objectifId = section.keywords?.find((keyword: string) => keyword.startsWith('OIC-')) || 
                          section.competence_id || 
                          `OIC-${itemCode?.replace('IC-', '')}-${String(index + 1).padStart(2, '0')}-A`;
        
        return {
          intitule: section.title || 'Compétence non définie',
          description: section.content || 'Description non disponible',
          objectif_id: objectifId,
          rubrique: section.rubrique_oic || section.rubrique || (section.keywords?.[0] || 'Non spécifiée'),
          keywords: section.keywords || [],
          titre_complet: section.title || null,
          sommaire: section.content || null,
          ordre_affichage: index + 1
        };
      }),
      count: data.sections.length,
      theme: data.subtitle || 'Compétences OIC fusionnées E-LiSA'
    };
    
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
