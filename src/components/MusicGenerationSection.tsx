
import React from 'react';
import { TranslatedText } from '@/components/TranslatedText';
import { Music, Wand2, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export const MusicGenerationSection = () => {
  const navigate = useNavigate();
  
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
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-lg bg-green-100 text-green-800">
            <Gift className="h-4 w-4 mr-2" />
            <TranslatedText text="3/3 générations gratuites disponibles" />
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            onClick={() => navigate('/edn')}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
          >
            <Music className="h-6 w-6 mr-2" />
            <TranslatedText text="Générer gratuitement" />
          </Button>
          <Button 
            onClick={() => navigate('/edn/music-library')}
            variant="outline"
            size="lg"
            className="border-amber-600 text-amber-600 hover:bg-amber-50 px-8 py-3 text-lg"
          >
            <Music className="h-6 w-6 mr-2" />
            <TranslatedText text="Ma Bibliothèque" />
          </Button>
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
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6">
              <div className="text-center">
                <Music className="h-16 w-16 text-amber-600 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  <TranslatedText text="Prêt à commencer ?" />
                </h4>
                <p className="text-gray-600 mb-6">
                  <TranslatedText text="3 générations gratuites disponibles" />
                </p>
                <Button 
                  onClick={() => navigate('/edn')}
                  className="bg-amber-600 hover:bg-amber-700 text-white w-full"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  <TranslatedText text="Essayer gratuitement" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
