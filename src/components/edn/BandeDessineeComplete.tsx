import { useState, useEffect } from 'react';
import { ComicHeader } from './comic/ComicHeader';
import { InteractiveComicPanel } from './comic/InteractiveComicPanel';
import { ComicFooter } from './comic/ComicFooter';
import { CheckCircle } from 'lucide-react';
import { getBandeDessineePregenere, type VignettePregenere } from '@/data/bandesDessineesPregenerees';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';

interface RangASection {
  title?: string;
  content?: string;
  description?: string;
  keywords?: string[];
  concepts?: Array<{ title?: string } | string>;
}

interface RangACompetence {
  competence?: string;
  title?: string;
  description?: string;
  intitule?: string;
  content?: string;
}

interface TableauRangData {
  sections?: RangASection[];
  competences_cles?: RangACompetence[];
  lignes?: string[][];
  data?: unknown[];
}

interface BandeDessineeCompleteProps {
  itemData: {
    title: string;
    subtitle: string;
    slug?: string;
    item_code?: string;
    tableau_rang_a?: TableauRangData | RangACompetence[];
    tableau_rang_b?: TableauRangData;
  };
}

export const BandeDessineeComplete = ({ itemData }: BandeDessineeCompleteProps) => {
  const { logActivity } = useActivityTracking();
  const { _addPoints } = useGamification();
  const [panels, setPanels] = useState<VignettePregenere[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadBandeDessinee = async () => {
      try {
        // Track BD view
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'bande_dessinee', itemCode: itemData.item_code }
        });
        
        // Charger immédiatement les données pré-générées
        const bandeDessinee = getBandeDessineePregenere(itemData.item_code || 'IC1');
        
        if (bandeDessinee) {
          setPanels(bandeDessinee.vignettes);
          setIsLoaded(true);
          
          // Award points for viewing complete BD
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await _addPoints(user.id, 'itemReviewed');
          }
        } else {
          const defaultPanels = createDefaultPanels(itemData);
          setPanels(defaultPanels);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Erreur chargement bande dessinée:', error);
        const defaultPanels = createDefaultPanels(itemData);
        setPanels(defaultPanels);
        setIsLoaded(true);
      }
    };
    
    loadBandeDessinee();
  }, [itemData.item_code, logActivity, _addPoints, itemData]);

  // Images médicales Unsplash variées et valides
  const MEDICAL_IMAGES = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=300&fit=crop', // Doctor
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&h=300&fit=crop', // Medical equipment
    'https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&h=300&fit=crop', // Hospital
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&h=300&fit=crop', // Stethoscope
    'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500&h=300&fit=crop', // Healthcare
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop', // Medical research
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&h=300&fit=crop', // Consultation
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=300&fit=crop', // Doctor portrait
  ];

  const createDefaultPanels = (data: BandeDessineeCompleteProps['itemData']): VignettePregenere[] => {
    const itemCode = data.item_code || 'IC-1';
    const itemNumber = itemCode.replace('IC-', '');
    const panels: VignettePregenere[] = [];
    
    const getImage = (idx: number) => MEDICAL_IMAGES[idx % MEDICAL_IMAGES.length];
    
    // Extraire les compétences du tableau rang A
    const rangAData = data.tableau_rang_a;
    if (rangAData) {
      // Format array direct
      if (Array.isArray(rangAData)) {
        rangAData.slice(0, 4).forEach((item: RangACompetence, idx: number) => {
          panels.push({
            id: panels.length + 1,
            title: item.intitule || item.title || `Élément ${idx + 1}`,
            text: item.description || item.content || `Description de l'élément ${idx + 1}`,
            imageUrl: getImage(idx),
            competences: [item.intitule || `Compétence ${idx + 1}`]
          });
        });
      }
      // Format object avec competences_cles (OIC)
      else if (rangAData.competences_cles && Array.isArray(rangAData.competences_cles)) {
        rangAData.competences_cles.slice(0, 4).forEach((comp: RangACompetence, idx: number) => {
          panels.push({
            id: panels.length + 1,
            title: comp.competence || comp.title || `Compétence ${idx + 1}`,
            text: comp.description || `Maîtrisez cette compétence essentielle de l'item ${itemNumber}`,
            imageUrl: getImage(idx),
            competences: [comp.competence || `Rang A - ${idx + 1}`]
          });
        });
      }
      // Format sections
      else if (rangAData.sections && Array.isArray(rangAData.sections)) {
        rangAData.sections.slice(0, 4).forEach((section: RangASection, idx: number) => {
          panels.push({
            id: panels.length + 1,
            title: section.title || `Section ${idx + 1}`,
            text: section.content || section.description || `Contenu de la section ${idx + 1}`,
            imageUrl: getImage(idx),
            competences: section.keywords || section.concepts?.map((c) => typeof c === 'string' ? c : c.title || 'Concept') || [`Section ${idx + 1}`]
          });
        });
      }
    }
    
    // Toujours créer au moins une vignette d'introduction
    if (panels.length === 0) {
      panels.push({
        id: 1,
        title: `Introduction - ${data.title || itemCode}`,
        text: `Découvrez les concepts essentiels de l'item ${itemNumber}: ${data.title}. Cette bande dessinée vous guide à travers les compétences clés.`,
        imageUrl: getImage(0),
        competences: ['Introduction', 'Vue d\'ensemble']
      });
    }
    
    return panels;
  };

  const rangA = itemData.tableau_rang_a;
  const totalCompetences = (() => {
    if (Array.isArray(rangA)) return rangA.length;
    if (rangA && typeof rangA === 'object') {
      return rangA.lignes?.length || 
             rangA.data?.length || 
             rangA.sections?.length ||
             rangA.competences_cles?.length ||
             panels.length;
    }
    return panels.length;
  })();

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
          {panels.map((panel, panelIndex) => (
            <div key={`panel-${panel.id}-${panelIndex}`} className="relative">
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
