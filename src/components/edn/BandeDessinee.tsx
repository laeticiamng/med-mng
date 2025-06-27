
import { ComicHeader } from './comic/ComicHeader';
import { ComicPanel } from './comic/ComicPanel';
import { ComicFooter } from './comic/ComicFooter';

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  // Données des vignettes de la bande dessinée avec images plus réalistes
  const panelsData = [
    {
      id: 1,
      title: "La Rencontre",
      text: `Dans le cabinet médical, Dr. Martin accueille sa patiente, Mme Dubois. L'atmosphère est chaleureuse mais professionnelle, établissant les bases d'une relation de confiance essentielle à tout soin de qualité.`,
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "L'Écoute Active",
      text: `Le médecin pratique l'écoute active, se penchant légèrement vers sa patiente, maintenant un contact visuel bienveillant. Chaque mot compte dans cette communication thérapeutique privilégiée.`,
      imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "L'Explication Claire",
      text: `Dr. Martin explique le diagnostic avec des mots simples, utilisant des schémas et des gestes pour s'assurer que sa patiente comprend bien. La pédagogie médicale en action.`,
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "L'Alliance Thérapeutique",
      text: `Patient et médecin construisent ensemble un plan de soins. Cette collaboration active améliore l'adhésion au traitement et les résultats cliniques. Une vraie partnership santé.`,
      imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 5,
      title: "Le Suivi Personnalisé",
      text: `Le médecin programme un suivi adapté aux besoins spécifiques de sa patiente. Cette approche personnalisée renforce la qualité des soins et la satisfaction du patient.`,
      imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 6,
      title: "La Conclusion Positive",
      text: `La consultation se termine sur une note positive. Mme Dubois repart rassurée, avec un plan de soins clair et la certitude d'être bien accompagnée dans son parcours de santé.`,
      imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=300&fit=crop&crop=center"
    }
  ];

  return (
    <div className="space-y-8 bg-gradient-to-br from-amber-50 via-orange-50 to-blue-50 p-6 rounded-xl">
      <ComicHeader title={itemData.title} />
      
      {/* Mise en page en grille comme une vraie bande dessinée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {panelsData.map((panel) => (
          <ComicPanel key={panel.id} panel={panel} />
        ))}
      </div>

      {/* Séparateur artistique */}
      <div className="flex items-center justify-center my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
        <div className="mx-4 text-amber-600 font-bold text-lg">★ ★ ★</div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
      </div>

      <ComicFooter />
    </div>
  );
};
