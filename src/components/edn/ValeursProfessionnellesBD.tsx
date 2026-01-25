import { useEffect, useRef } from 'react';
import { ComicHeader } from './comic/ComicHeader';
import { ComicPanel } from './comic/ComicPanel';
import { ComicFooter } from './comic/ComicFooter';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Star, BookOpen } from 'lucide-react';

interface TableauRangData {
  sections?: Array<{
    title?: string;
    content?: string;
    keywords?: string[];
    concepts?: unknown[];
    competences?: unknown[];
  }>;
  competences_cles?: unknown[];
}

interface ValeursProfessionnellesBDProps {
  itemData: {
    title: string;
    subtitle: string;
    tableau_rang_a?: TableauRangData;
    tableau_rang_b?: TableauRangData;
  };
}

export const ValeursProfessionnellesBD = ({ itemData }: ValeursProfessionnellesBDProps) => {
  const { logActivity } = useActivityTracking();
  const { _stats, loadStats, _addPoints } = useGamification();
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadStats(user.id);
    };
    load();
  }, [loadStats]);
  
  useEffect(() => {
    const track = async () => {
      if (!hasTrackedRef.current) {
        hasTrackedRef.current = true;
        logActivity({
          activity_type: 'study',
          count: 1,
          metadata: { component: 'valeurs_professionnelles_bd', title: itemData.title }
        });
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await _addPoints(user.id, 'itemReviewed');
        }
      }
    };
    track();
  }, [itemData.title, logActivity, _addPoints]);

  // Données des vignettes spécifiques aux valeurs professionnelles
  const panelsData = [
    {
      id: 1,
      title: "L'Équipe Pluridisciplinaire",
      text: `Dans l'hôpital moderne, médecins, infirmiers, pharmaciens et autres professionnels forment une équipe soudée. Chacun apporte son expertise unique au service d'un objectif commun : le bien-être du patient.`,
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Les Valeurs en Action",
      text: `Dr. Leroy incarne les valeurs cardinales de sa profession : responsabilité, compassion, probité. Ces principes guident chacune de ses décisions, créant un cadre éthique solide pour sa pratique.`,
      imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "La Déontologie au Quotidien",
      text: `Le pharmacien vérifie scrupuleusement chaque ordonnance. Son Ordre professionnel veille au respect des règles déontologiques qui protègent patients et professionnels dans un cadre légal strict.`,
      imageUrl: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "La Collaboration Interprofessionnelle",
      text: `L'infirmière coordonne avec le kinésithérapeute le plan de soins. Cette collaboration organisée optimise la prise en charge et illustre l'évolution vers une médecine collective et efficiente.`,
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 5,
      title: "L'Éthique en Pratique",
      text: `Face à un dilemme médical, l'équipe se réunit. L'éthique n'est plus individuelle mais collective, intégrant evidence-based medicine et expérience du patient dans la décision partagée.`,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 6,
      title: "L'Excellence Professionnelle",
      text: `Chaque professionnel, du médecin à l'aide-soignant, contribue à cette symphonie des soins. Les ordres professionnels garantissent la qualité, créant un système de santé digne de confiance.`,
      imageUrl: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop&crop=center"
    }
  ];

  return (
    <div className="space-y-8 bg-gradient-to-br from-primary/5 via-success/5 to-warning/10 p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <ComicHeader title={itemData.title} />
        {_stats && (
          <div className="flex items-center gap-3 px-4 py-2 bg-background/50 rounded-full">
            <BookOpen className="h-4 w-4 text-primary" />
            <div className="flex items-center gap-1 text-warning">
              <Flame className="h-4 w-4" />
              <span className="font-bold">{_stats.currentStreak ?? 0}j</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1 text-primary">
              <Star className="h-4 w-4" />
              <span className="font-bold">Nv.{_stats.level ?? 1}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Layout en grille comme une vraie bande dessinée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {panelsData.map((panel) => (
          <ComicPanel key={panel.id} panel={panel} />
        ))}
      </div>

      {/* Séparateur thématique */}
      <div className="flex items-center justify-center my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="mx-4 text-primary font-bold text-lg">⚕️ ⚖️ ⚕️</div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      </div>

      <ComicFooter />
    </div>
  );
};
