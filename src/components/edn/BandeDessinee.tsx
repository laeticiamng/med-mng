
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon } from 'lucide-react';

interface BandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
}

interface ComicPanel {
  id: number;
  imageUrl: string;
  text: string;
  title: string;
}

export const BandeDessinee = ({ itemData }: BandeDessineeProps) => {
  // Bande dessinée statique pré-générée
  const comicPanels: ComicPanel[] = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      text: `Dans le cadre de "${itemData.title}", nous explorons les enjeux de la relation médecin-malade moderne. La communication est la clé d'une relation thérapeutique réussie.`,
      title: "Introduction - Le Contexte"
    },
    {
      id: 2,
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      text: "La communication efficace entre soignant et patient est au cœur de toute démarche thérapeutique réussie. Chaque mot compte dans cette relation privilégiée.",
      title: "Les Enjeux Principaux"
    },
    {
      id: 3,
      imageUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      text: "L'écoute active, l'empathie et la transmission claire d'informations sont des compétences essentielles à développer pour tout professionnel de santé.",
      title: "Les Outils Pratiques"
    },
    {
      id: 4,
      imageUrl: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      text: "Une relation thérapeutique de qualité améliore significativement l'adhésion au traitement et les résultats cliniques. Le patient devient partenaire de ses soins.",
      title: "Mise en Application"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-serif text-amber-900 mb-4">Bande Dessinée Éducative</h2>
        <p className="text-lg text-amber-700 mb-6">
          Découvrez les concepts clés sous forme de bande dessinée interactive et mémorable
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comicPanels.map((panel) => (
          <Card key={panel.id} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-amber-700 border-amber-300">
                  Vignette {panel.id}
                </Badge>
                <h3 className="text-lg font-semibold text-amber-900">
                  {panel.title}
                </h3>
              </div>
              
              <div className="relative">
                <img 
                  src={panel.imageUrl} 
                  alt={panel.title}
                  className="w-full h-48 object-cover rounded-lg border-2 border-amber-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div className="w-full h-48 bg-amber-100 rounded-lg border-2 border-amber-200 items-center justify-center hidden">
                  <ImageIcon className="h-12 w-12 text-amber-400" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <p className="text-amber-900 font-medium italic">
                  {panel.text}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
