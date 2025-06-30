
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Wand2, Music, Library, Heart } from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

export const MusicGenerationFeatures = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Choisir votre Item EDN",
      description: "Sélectionnez parmi IC-1 à IC-5 selon vos besoins d'apprentissage"
    },
    {
      icon: Wand2,
      title: "Rang A ou B",
      description: "Choisissez le niveau de compétence adapté à votre formation"
    },
    {
      icon: Music,
      title: "Style Musical",
      description: "Personnalisez avec votre style préféré (Pop, Rock, Jazz, etc.)"
    },
    {
      icon: Library,
      title: "Bibliothèque Personnelle",
      description: "Sauvegardez et organisez toutes vos créations musicales"
    },
    {
      icon: Heart,
      title: "Favoris et Collections",
      description: "Créez vos listes de favoris pour un accès rapide"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-lg">
                <TranslatedText text={feature.title} />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                <TranslatedText text={feature.description} />
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
