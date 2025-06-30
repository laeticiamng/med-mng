import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Music, Library, Heart, Wand2, BookOpen, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TranslatedText } from '@/components/TranslatedText';
import { useFreeTrialLimit } from '@/hooks/useFreeTrialLimit';

export const MusicGenerationSection = () => {
  const navigate = useNavigate();
  const { getRemainingGenerations, maxFreeGenerations } = useFreeTrialLimit();
  const remainingFree = getRemainingGenerations();

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
    <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            <TranslatedText text="Génération Musicale IA" />
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            <TranslatedText text="Transformez vos contenus EDN en chansons personnalisées avec l'intelligence artificielle. Apprenez en musique et créez votre bibliothèque médicale unique." />
          </p>

          {/* Free Trial Badge */}
          {remainingFree > 0 && (
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-green-100 text-green-800">
              <Gift className="h-4 w-4 mr-2" />
              <TranslatedText text={`${remainingFree}/${maxFreeGenerations} générations gratuites restantes`} />
            </Badge>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/edn')}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
            >
              <Music className="h-6 w-6 mr-2" />
              <TranslatedText text={remainingFree > 0 ? "Générer gratuitement" : "Générer ma Musique"} />
            </Button>
            <Button 
              onClick={() => navigate('/edn/music-library')}
              variant="outline"
              size="lg"
              className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg"
            >
              <Library className="h-6 w-6 mr-2" />
              <TranslatedText text="Ma Bibliothèque" />
            </Button>
            
            {remainingFree === 0 && (
              <Button 
                onClick={() => navigate('/med-mng/pricing')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <TranslatedText text="Voir les Tarifs" />
              </Button>
            )}
          </div>
        </div>

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

        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <TranslatedText text="Comment ça marche ?" />
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <TranslatedText text="Sélectionnez votre Item EDN" />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <TranslatedText text="Choisissez parmi IC-1 à IC-5 selon votre spécialité" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <TranslatedText text="Choisissez Rang A ou B" />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <TranslatedText text="Adaptez le niveau selon vos besoins de formation" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <TranslatedText text="Personnalisez le Style" />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <TranslatedText text="Choisissez votre style musical préféré pour apprendre" />
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <TranslatedText text="Sauvegardez dans votre Bibliothèque" />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <TranslatedText text="Organisez vos créations et créez vos favoris" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6">
              <div className="text-center">
                <Music className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  <TranslatedText text="Prêt à commencer ?" />
                </h4>
                <p className="text-gray-600 mb-6">
                  <TranslatedText text={remainingFree > 0 ? `${remainingFree} générations gratuites disponibles` : "Créez votre première chanson médicale"} />
                </p>
                <Button 
                  onClick={() => navigate(remainingFree > 0 ? '/edn' : '/med-mng/pricing')}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  <TranslatedText text={remainingFree > 0 ? "Essayer gratuitement" : "Voir les tarifs"} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
