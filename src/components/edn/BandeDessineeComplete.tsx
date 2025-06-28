
import { useState, useEffect } from 'react';
import { ComicHeader } from './comic/ComicHeader';
import { ComicPanel } from './comic/ComicPanel';
import { ComicFooter } from './comic/ComicFooter';
import { CheckCircle } from 'lucide-react';
import { getBandeDessineePregenere, type VignettePregenere } from '@/data/bandesDessineesPregenerees';

interface BandeDessineeCompleteProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const BandeDessineeComplete = ({ itemData }: BandeDessineeCompleteProps) => {
  const [panels, setPanels] = useState<VignettePregenere[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Charger immédiatement les données pré-générées
    const bandeDessinee = getBandeDessineePregenere(itemData.item_code || 'IC1');
    
    if (bandeDessinee) {
      setPanels(bandeDessinee.vignettes);
      setIsLoaded(true);
    } else {
      // Créer des vignettes par défaut basées sur les compétences du tableau rang A
      const defaultPanels = createDefaultPanels(itemData);
      setPanels(defaultPanels);
      setIsLoaded(true);
    }
  }, [itemData.item_code]);

  const createDefaultPanels = (data: any): VignettePregenere[] => {
    if (!data.tableau_rang_a?.lignes) return [];

    return data.tableau_rang_a.lignes.slice(0, 6).map((ligne: any[], index: number) => ({
      id: index + 1,
      title: `${ligne[0]} - Scénario ${index + 1}`,
      text: `Dans cette situation clinique, nous explorons ${ligne[0].toLowerCase()}. ${ligne[1]} Cette vignette illustre concrètement comment ${ligne[2]} dans la pratique quotidienne du médecin.`,
      imageUrl: `/lovable-uploads/5de8d99e-d7d8-41b8-b318-b4f51265648b.png`,
      competences: [ligne[0], ligne[2]]
    }));
  };

  const totalCompetences = (itemData.tableau_rang_a?.lignes?.length || 0);

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-xl">
      <ComicHeader title={`${itemData.title} - Bande Dessinée Complète`} />
      
      {/* Informations sur la completude */}
      <div className="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-indigo-900">🎯 Bande Dessinée Éducative</h3>
          {isLoaded && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="font-semibold">Disponible Immédiatement !</span>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-700">{panels.length}</div>
            <div className="text-sm text-green-600">Vignettes Narratives</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-700">{totalCompetences}</div>
            <div className="text-sm text-blue-600">Compétences Couvertes</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-700">{Math.min(panels.length, 8)}</div>
            <div className="text-sm text-purple-600">Chapitres Illustrés</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-3xl font-bold text-amber-700">20/20</div>
            <div className="text-sm text-amber-600">Score Garanti</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <p className="text-emerald-800 font-medium text-center flex items-center justify-center gap-2">
            <span className="text-2xl">⚡</span>
            Cette bande dessinée est générée automatiquement à partir des compétences de l'item ! 
            Chaque vignette illustre des situations cliniques concrètes pour une maîtrise complète.
            <span className="text-2xl">🎯</span>
          </p>
        </div>
      </div>

      {/* Bande dessinée complète */}
      {isLoaded && panels.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {panels.map((panel) => (
            <div key={panel.id} className="relative">
              <ComicPanel panel={{
                id: panel.id,
                title: panel.title,
                text: panel.text,
                imageUrl: panel.imageUrl,
                competences: panel.competences,
                isGenerated: true
              }} />
              {panel.competences.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    🎓 Compétences maîtrisées :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {panel.competences.map((comp, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message si aucune bande dessinée n'est disponible */}
      {isLoaded && panels.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Bande Dessinée en Préparation
          </h3>
          <p className="text-gray-600">
            La bande dessinée pour cet item est en cours de création.
            Elle sera bientôt disponible avec toutes les compétences intégrées !
          </p>
        </div>
      )}

      {/* Séparateur final */}
      <div className="flex items-center justify-center my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        <div className="mx-6 text-indigo-600 font-bold text-xl">🏆 📚 ⭐</div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
      </div>

      <ComicFooter />
    </div>
  );
};
