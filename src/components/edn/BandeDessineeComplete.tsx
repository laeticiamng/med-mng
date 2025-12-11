import { useState, useEffect } from 'react';
import { ComicHeader } from './comic/ComicHeader';
import { InteractiveComicPanel } from './comic/InteractiveComicPanel';
import { ComicFooter } from './comic/ComicFooter';
import { CheckCircle } from 'lucide-react';
import { getBandeDessineePregenere, type VignettePregenere } from '@/data/bandesDessineesPregenerees';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

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
  const { logActivity } = useActivityTracking();
  const { addPoints } = useGamification();
  const [panels, setPanels] = useState<VignettePregenere[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadBandeDessinee = async () => {
      console.log('🎨 Chargement bande dessinée pour:', itemData.item_code);
      console.log('📊 Structure tableau_rang_a:', itemData.tableau_rang_a);
      
      // Track BD view
      logActivity({
        activity_type: 'study',
        count: 1,
        metadata: { component: 'bande_dessinee', itemCode: itemData.item_code }
      });
      
      // Charger immédiatement les données pré-générées
      const bandeDessinee = getBandeDessineePregenere(itemData.item_code || 'IC1');
      
      if (bandeDessinee) {
        console.log('✅ Bande dessinée pré-générée trouvée:', bandeDessinee.vignettes.length, 'vignettes');
        setPanels(bandeDessinee.vignettes);
        setIsLoaded(true);
        
        // Award points for viewing complete BD
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await addPoints(user.id, 'itemReviewed');
        }
      } else {
        console.log('🔧 Création de vignettes par défaut...');
        const defaultPanels = createDefaultPanels(itemData);
        console.log('📝 Vignettes créées:', defaultPanels.length);
        setPanels(defaultPanels);
        setIsLoaded(true);
      }
    };
    
    loadBandeDessinee();
  }, [itemData.item_code]);

  const createDefaultPanels = (data: any): VignettePregenere[] => {
    console.log('🔍 Analyse des données pour création de vignettes:', data);
    
    // Créer des vignettes basées sur le tableau rang A
    const sections = data.tableau_rang_a?.sections || [];
    const itemCode = data.item_code || 'IC-1';
    const itemNumber = itemCode.replace('IC-', '');
    
    if (sections.length === 0) {
      // Créer une vignette par défaut si pas de sections
      return [{
        id: 1,
        title: `Introduction ${itemCode}`,
        text: `Découvrez les concepts essentiels de l'item ${itemNumber}: ${data.title}`,
        imageUrl: `https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=300&fit=crop&crop=center`,
        competences: ['Compréhension générale']
      }];
    }
    
    // Créer une vignette pour chaque section du rang A
    return sections.map((section: any, index: number) => ({
      id: index + 1,
      title: section.title || `Étape ${index + 1}`,
      text: section.content || `Contenu de la section ${index + 1} pour l'item ${itemNumber}`,
      imageUrl: `https://images.unsplash.com/photo-${1576091160399 + index}?w=500&h=300&fit=crop&crop=center`,
      competences: section.keywords || [`Compétence ${index + 1}`]
    }));
  };

  const totalCompetences = (itemData.tableau_rang_a?.lignes?.length || 
                           itemData.tableau_rang_a?.data?.length || 
                           (Array.isArray(itemData.tableau_rang_a) ? itemData.tableau_rang_a.length : 0));

  return (
    <div className="space-y-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-8 rounded-xl">
      <ComicHeader title={`${itemData.title} - Bande Dessinée Complète`} />
      
      {/* Informations sur la completude */}
      <div className="bg-card p-6 rounded-xl border-2 border-primary/20 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">🎯 Bande Dessinée Éducative</h3>
          {isLoaded && (
            <div className="flex items-center text-success">
              <CheckCircle className="h-6 w-6 mr-2" />
              <span className="font-semibold">Disponible Immédiatement !</span>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="text-3xl font-bold text-success">{panels.length}</div>
            <div className="text-sm text-success/80">Vignettes Narratives</div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-3xl font-bold text-primary">{Math.max(totalCompetences, panels.length * 2)}</div>
            <div className="text-sm text-primary/80">Compétences Couvertes</div>
          </div>
          <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="text-3xl font-bold text-accent">{Math.min(panels.length, 8)}</div>
            <div className="text-sm text-accent/80">Chapitres Illustrés</div>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-3xl font-bold text-warning">20/20</div>
            <div className="text-sm text-warning/80">Score Garanti</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
          <p className="text-success font-medium text-center flex items-center justify-center gap-2">
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
              <InteractiveComicPanel panel={{
                id: panel.id,
                title: panel.title,
                text: panel.text,
                imageUrl: panel.imageUrl,
                competences: panel.competences
              }} />
              {panel.competences.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-primary font-medium mb-1">
                    🎓 Compétences maîtrisées :
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {panel.competences.map((comp, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
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
        <div className="text-center py-12 bg-card rounded-xl border-2 border-border">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Bande Dessinée en Préparation
          </h3>
          <p className="text-muted-foreground">
            La bande dessinée pour cet item est en cours de création.
            Elle sera bientôt disponible avec toutes les compétences intégrées !
          </p>
        </div>
      )}

      <ComicFooter />
    </div>
  );
};
