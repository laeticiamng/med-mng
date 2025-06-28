
import { useState, useEffect } from 'react';
import { ComicHeader } from './comic/ComicHeader';
import { ComicPanel } from './comic/ComicPanel';
import { ComicFooter } from './comic/ComicFooter';
import { Button } from '@/components/ui/button';
import { Wand2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface GeneratedPanel {
  id: number;
  title: string;
  text: string;
  imageUrl: string;
  competences: string[];
  isGenerated?: boolean;
}

export const BandeDessineeComplete = ({ itemData }: BandeDessineeCompleteProps) => {
  const [panels, setPanels] = useState<GeneratedPanel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneratingPanel, setCurrentGeneratingPanel] = useState<number | null>(null);

  // Extraire toutes les compétences des tableaux Rang A et B
  const extractCompetences = () => {
    const competences: string[] = [];
    
    // Extraire du Rang A
    if (itemData.tableau_rang_a?.concepts) {
      itemData.tableau_rang_a.concepts.forEach((concept: any) => {
        if (concept.concept) competences.push(concept.concept);
      });
    }
    
    // Extraire du Rang B
    if (itemData.tableau_rang_b?.concepts) {
      itemData.tableau_rang_b.concepts.forEach((concept: any) => {
        if (concept.concept) competences.push(concept.concept);
      });
    }
    
    return competences;
  };

  // Générer les panels basés sur les compétences
  const generatePanelsFromCompetences = () => {
    const competences = extractCompetences();
    const generatedPanels: GeneratedPanel[] = [];
    
    // Panel d'introduction
    generatedPanels.push({
      id: 1,
      title: "Introduction",
      text: `Bienvenue dans l'aventure de ${itemData.title}. Suivez Dr. Martin et son équipe dans cette histoire immersive qui vous fera découvrir toutes les compétences essentielles de cet item.`,
      imageUrl: "placeholder-intro",
      competences: [],
      isGenerated: false
    });

    // Panels pour chaque compétence (groupées par 2-3 pour créer une narration fluide)
    const competenceGroups = [];
    for (let i = 0; i < competences.length; i += 2) {
      competenceGroups.push(competences.slice(i, i + 2));
    }

    competenceGroups.forEach((group, index) => {
      generatedPanels.push({
        id: index + 2,
        title: `Chapitre ${index + 1}`,
        text: `Dans ce chapitre, Dr. Martin et son équipe vont aborder : ${group.join(' et ')}. Une situation concrète va illustrer ces concepts essentiels.`,
        imageUrl: `placeholder-chapter-${index + 1}`,
        competences: group,
        isGenerated: false
      });
    });

    // Panel de conclusion
    generatedPanels.push({
      id: competenceGroups.length + 2,
      title: "Conclusion",
      text: `Félicitations ! Vous avez maintenant maîtrisé toutes les compétences de ${itemData.title}. Dr. Martin et son équipe vous ont guidé à travers un parcours complet pour obtenir votre 20/20 !`,
      imageUrl: "placeholder-conclusion",
      competences: [],
      isGenerated: false
    });

    setPanels(generatedPanels);
  };

  // Générer une image cohérente pour un panel
  const generatePanelImage = async (panel: GeneratedPanel, panelIndex: number, totalPanels: number) => {
    try {
      // Construire un prompt cohérent avec les personnages récurrents
      const characterContext = panelIndex === 0 
        ? "Introduce main characters: Dr. Martin (middle-aged professional doctor, kind smile, white medical coat, stethoscope), Nurse Sophie (young professional nurse, blue scrubs, caring expression), and Patient Marie (middle-aged woman, concerned but hopeful)"
        : `Continue with the same consistent characters from previous panels: Dr. Martin (same appearance as before), Nurse Sophie (same appearance), Patient Marie (same appearance)`;

      const contextualPrompt = `
        ${characterContext}
        
        Scene: ${panel.text}
        
        Setting: Modern medical facility, professional healthcare environment
        Style: Consistent cartoon/comic book illustration, clean lines, warm colors
        Mood: Professional yet caring, educational and reassuring
        
        Panel ${panelIndex + 1} of ${totalPanels} for "${itemData.title}"
        
        Make sure characters look exactly the same as in previous panels for visual continuity.
      `;

      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: contextualPrompt,
          style: 'medical-comic',
          panelNumber: panelIndex + 1,
          totalPanels,
          itemTitle: itemData.title
        }
      });

      if (error) throw error;

      return data.imageUrl;
    } catch (error) {
      console.error('Erreur génération image:', error);
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="300" fill="#E5F3FF"/>
          <rect x="50" y="50" width="300" height="200" fill="#FFF" stroke="#3B82F6" stroke-width="3"/>
          <circle cx="150" cy="120" r="30" fill="#60A5FA"/>
          <circle cx="250" cy="120" r="30" fill="#60A5FA"/>
          <rect x="120" y="150" width="160" height="80" fill="#F8FAFC" stroke="#3B82F6" stroke-width="2"/>
          <text x="200" y="190" font-family="Arial, sans-serif" font-size="16" fill="#1E40AF" text-anchor="middle" font-weight="bold">${panel.title}</text>
        </svg>
      `)}`;
    }
  };

  // Générer toutes les images de façon séquentielle pour maintenir la cohérence
  const generateAllImages = async () => {
    setIsGenerating(true);
    const updatedPanels = [...panels];

    for (let i = 0; i < updatedPanels.length; i++) {
      setCurrentGeneratingPanel(i);
      toast.info(`Génération de l'image ${i + 1}/${updatedPanels.length}...`);
      
      const imageUrl = await generatePanelImage(updatedPanels[i], i, updatedPanels.length);
      updatedPanels[i] = {
        ...updatedPanels[i],
        imageUrl,
        isGenerated: true
      };
      
      setPanels([...updatedPanels]);
      
      // Petite pause entre les générations pour éviter les limites de taux
      if (i < updatedPanels.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setCurrentGeneratingPanel(null);
    setIsGenerating(false);
    toast.success('🎨 Bande dessinée complète générée avec succès !');
  };

  useEffect(() => {
    generatePanelsFromCompetences();
  }, [itemData]);

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-purple-50 to-amber-50 p-6 rounded-xl">
      <ComicHeader title={`${itemData.title} - Bande Dessinée Complète`} />
      
      {/* Informations sur les compétences couvertes */}
      <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-4">🎯 Compétences Maîtrisées</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-700 mb-2">📚 Rang A (Connaissances Essentielles)</h4>
            <p className="text-sm text-gray-600">
              {itemData.tableau_rang_a?.concepts?.length || 0} compétences fondamentales
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 mb-2">🔬 Rang B (Connaissances Avancées)</h4>
            <p className="text-sm text-gray-600">
              {itemData.tableau_rang_b?.concepts?.length || 0} compétences approfondies
            </p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800 font-medium">
            ✨ Cette bande dessinée intègre TOUTES les compétences pour garantir votre 20/20 !
          </p>
        </div>
      </div>

      {/* Bouton de génération */}
      {panels.some(p => !p.isGenerated) && (
        <div className="text-center">
          <Button
            onClick={generateAllImages}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Génération en cours... {currentGeneratingPanel !== null ? `(${currentGeneratingPanel + 1}/${panels.length})` : ''}
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-3" />
                Générer la Bande Dessinée Complète
              </>
            )}
          </Button>
        </div>
      )}

      {/* Panels de la bande dessinée */}
      {panels.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {panels.map((panel) => (
              <div key={panel.id} className="relative">
                <ComicPanel panel={panel} />
                {panel.competences.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">
                      📋 Compétences: {panel.competences.length}
                    </p>
                  </div>
                )}
                {isGenerating && currentGeneratingPanel === panel.id - 1 && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-3 rounded-lg shadow-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Séparateur artistique */}
          <div className="flex items-center justify-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            <div className="mx-4 text-blue-600 font-bold text-lg">🎓 ⭐ 🏆</div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>
        </>
      )}

      <ComicFooter />
    </div>
  );
};
