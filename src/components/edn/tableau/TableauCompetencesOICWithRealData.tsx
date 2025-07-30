
import React from 'react';
import { TableauCompetencesOICOptimized } from './TableauCompetencesOICOptimized';
import { useEdnItem } from '@/hooks/useEdnItem';

interface TableauCompetencesOICWithRealDataProps {
  itemCode: string;
  rang: 'A' | 'B';
}

export const TableauCompetencesOICWithRealData: React.FC<TableauCompetencesOICWithRealDataProps> = ({ 
  itemCode, 
  rang 
}) => {
  // Utiliser le hook existant qui récupère les données de edn_items_complete
  const slug = itemCode.toLowerCase().replace('IC-', 'ic-');
  const { item, loading } = useEdnItem(slug);

  console.log(`🔍 TableauCompetencesOICWithRealData - ${itemCode} rang ${rang}:`, {
    item: !!item,
    loading,
    competences_rang_a: item?.competences_oic_rang_a?.length || 0,
    competences_rang_b: item?.competences_oic_rang_b?.length || 0
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
          Chargement des compétences OIC authentiques pour {itemCode} rang {rang}...
        </p>
      </div>
    );
  }

  // Récupérer les compétences selon le rang
  const competencesData = rang === 'A' ? item?.competences_oic_rang_a : item?.competences_oic_rang_b;

  // Si aucune compétence OIC authentique n'est trouvée
  if (!competencesData || competencesData.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className={`w-16 h-16 mx-auto rounded-full ${rang === 'A' ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${rang === 'A' ? 'text-blue-600' : 'text-purple-600'}`}>📚</span>
          </div>
          <h3 className="text-gray-800 font-semibold mb-2">
            Compétences OIC {itemCode} Rang {rang}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Les compétences officielles OIC pour cet item sont en cours d'extraction depuis le site UNESS. 
            En attendant, vous pouvez consulter les autres formats pédagogiques disponibles.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
            <strong>📋 Conseil d'apprentissage :</strong> Consultez la scène immersive, la bande dessinée ou 
            les paroles musicales pour découvrir le contenu de cet item de manière interactive.
          </div>
        </div>
      </div>
    );
  }

  // Convertir les données OIC authentiques au format attendu et les trier par ordre
  const sortedCompetences = [...competencesData].sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  
  const competencesFormatted = {
    title: `${itemCode} Rang ${rang} - Compétences OIC officielles UNESS`,
    competences: sortedCompetences.map((comp, index) => ({
      intitule: comp.intitule,
      description: comp.description,
      objectif_id: comp.objectif_id,
      rubrique: comp.rubrique,
      keywords: [],
      ordre_affichage: comp.ordre || index + 1
    })),
    count: sortedCompetences.length,
    theme: `Compétences OIC ${rang === 'A' ? 'fondamentales' : 'avancées'} - Données authentiques UNESS`
  };

  console.log(`✅ Affichage de ${sortedCompetences.length} compétences OIC AUTHENTIQUES pour ${itemCode} rang ${rang}`);

  return (
    <div>
      <div style={{ 
        padding: '15px', 
        background: '#e8f5e8', 
        border: '2px solid #4ade80',
        marginBottom: '20px',
        borderRadius: '8px',
        fontWeight: 'bold',
        color: '#166534'
      }}>
        ✅ DONNÉES RÉELLES: {sortedCompetences.length} compétences OIC authentiques UNESS pour {itemCode} Rang {rang}
      </div>
      <TableauCompetencesOICOptimized 
        data={competencesFormatted} 
        itemCode={itemCode} 
        rang={rang} 
      />
    </div>
  );
};
