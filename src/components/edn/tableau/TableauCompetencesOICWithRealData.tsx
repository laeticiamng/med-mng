import React from 'react';
import { TableauCompetencesOIC } from './TableauCompetencesOIC';
import { useOicCompetences } from '@/hooks/useOicCompetences';

interface TableauCompetencesOICWithRealDataProps {
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOICWithRealData: React.FC<TableauCompetencesOICWithRealDataProps> = ({ 
  itemCode, 
  rang 
}) => {
  const { competences, loading, error } = useOicCompetences(itemCode, rang);

  console.log(`🔍 TableauCompetencesOICWithRealData - ${itemCode} rang ${rang}:`, {
    competences: competences.length,
    loading,
    error
  });

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">
          Chargement des compétences OIC pour {itemCode} rang {rang}...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Erreur de chargement des compétences OIC
          </h3>
          <p className="text-red-600 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!competences || competences.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-amber-800 font-semibold mb-2">
            Aucune compétence OIC trouvée
          </h3>
          <p className="text-amber-600 text-sm">
            Aucune compétence OIC n'a été trouvée pour {itemCode} rang {rang}
          </p>
        </div>
      </div>
    );
  }

  // Convertir les données OIC au format attendu par TableauCompetencesOIC
  const competencesData = {
    title: `${itemCode} Rang ${rang} - Compétences OIC officielles`,
    competences: competences.map(comp => ({
      intitule: comp.intitule,
      description: comp.description,
      objectif_id: comp.objectif_id,
      rubrique: comp.rubrique,
      keywords: [], // Les keywords ne sont pas dans la table OIC actuelle
      // Données enrichies niveau LiSA
      titre_complet: comp.titre_complet,
      sommaire: comp.sommaire,
      mecanismes: comp.mecanismes,
      indications: comp.indications,
      effets_indesirables: comp.effets_indesirables,
      interactions: comp.interactions,
      modalites_surveillance: comp.modalites_surveillance,
      causes_echec: comp.causes_echec,
      contributeurs: comp.contributeurs,
      ordre_affichage: comp.ordre_affichage
    })),
    count: competences.length,
    theme: `Compétences OIC ${rang === 'A' ? 'fondamentales' : 'avancées'} - Données officielles UNESS`
  };

  console.log(`✅ Affichage de ${competences.length} compétences OIC réelles pour ${itemCode} rang ${rang}`);

  return (
    <TableauCompetencesOIC 
      data={competencesData} 
      itemCode={itemCode} 
      rang={rang} 
    />
  );
};