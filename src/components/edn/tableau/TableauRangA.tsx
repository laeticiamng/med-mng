import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { TableauSectionEnhanced } from '../TableauSectionEnhanced';
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

interface TableauSection {
  title?: string;
  content?: string;
  competences?: Array<{ id: string; title?: string; content?: string }>;
  competence_id?: string;
  keywords?: string[];
  rubrique_oic?: string;
  rubrique?: string;
}

interface TableauData {
  title?: string;
  subtitle?: string;
  sections?: TableauSection[];
  competences?: Array<{ intitule: string; description: string; objectif_id: string }>;
  theme?: string;
  colonnes?: Array<{ nom: string; description?: string }>;
  lignes?: string[][];
  count?: number;
}

interface TableauRangAProps {
  data: TableauData | null;
  itemCode?: string;
}

export const TableauRangA: React.FC<TableauRangAProps> = ({ data, itemCode }) => {
  // Si des données sont déjà fournies, les utiliser directement sans faire d'appel externe
  // Nouveau format avec sections OIC (après migration)
  if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
    // Si les sections contiennent des compétences détaillées, utiliser le nouveau composant
    const hasDetailedCompetences = data.sections.some((s: TableauSection) => s.competences && s.competences.length > 0);
    
    if (hasDetailedCompetences) {
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
          {data.sections.map((section: TableauSection, index: number) => (
            <TableauSectionEnhanced 
              key={index}
              section={{
                title: section.title || 'Section',
                content: section.content,
                competences: section.competences?.map(c => ({
                  competence_id: c.id,
                  concept: c.title || '',
                  definition: c.content || ''
                })),
                keywords: section.keywords
              }}
              rang="A"
              index={index}
            />
          ))}
        </div>
      );
    }
    
    // Sinon, convertir au format OIC standard
    const competencesData = {
      title: data.title || `${itemCode} Rang A - Compétences OIC`,
      competences: data.sections.map((section: TableauSection, index: number) => {
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
    const oicData = {
      title: data.title || `${itemCode} - Compétences`,
      competences: data.competences,
      count: data.count ?? data.competences.length,
      theme: data.theme ?? 'Compétences OIC'
    };
    return (
      <TableauCompetencesOICOptimized 
        data={oicData} 
        itemCode={itemCode || 'IC-X'} 
        rang="A" 
      />
    );
  }

  // Ancien format avec colonnes/lignes (fallback)
  const theme = data?.theme || "Thème non défini";
  const colonnesData = data?.colonnes || [];
  const lignesData = data?.lignes || [];

  interface ColonneItem {
    nom: string;
    description: string;
  }

  const colonnes: ColonneItem[] = colonnesData.map((col) => ({
    nom: col.nom || 'N/A',
    description: col.description || 'N/A',
  }));

  const lignes = lignesData.map((ligneData) => {
    const ligne: Record<string, string> = {};
    colonnesData.forEach((col, index) => {
      ligne[col.nom] = ligneData[index] || '';
    });
    return ligne;
  });

  // Transformation des données pour le nouveau format
  const colonnesUtiles = colonnes;
  const lignesEnrichies: string[][] = lignes.map((ligne) => Object.values(ligne) as string[]);

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
