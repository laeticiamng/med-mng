
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Headphones, Palette, Users, Brain, Stethoscope } from 'lucide-react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { TranslatedText } from '@/components/TranslatedText';
import { useGlobalTranslation } from '@/hooks/useGlobalTranslation';

const EdnIndex = () => {
  const navigate = useNavigate();
  const { translateArray, currentLanguage, isTranslationNeeded } = useGlobalTranslation();
  const [translatedItems, setTranslatedItems] = useState([]);

  const ednitems = [
    {
      code: 'IC-1',
      title: 'La relation médecin-malade dans le cadre du colloque singulier',
      description: 'Maîtrisez les 15 compétences fondamentales de la relation médecin-malade selon la fiche E-LiSA officielle. Un parcours complet pour développer une relation thérapeutique de qualité, respectueuse et efficace.',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      features: ['Colloque singulier', 'Communication thérapeutique', 'Éthique relationnelle']
    },
    {
      code: 'IC-2',
      title: 'Les valeurs professionnelles du médecin et autres professionnels de santé',
      description: 'Explorez les valeurs fondamentales qui guident la pratique médicale moderne. Comprenez l\'éthique, la déontologie et les responsabilités professionnelles dans le contexte de la santé contemporaine.',
      icon: <Stethoscope className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      features: ['Déontologie médicale', 'Valeurs professionnelles', 'Éthique en santé']
    },
    {
      code: 'IC-3',
      title: 'Le raisonnement et la décision en médecine',
      description: 'Développez vos compétences de raisonnement clinique et de prise de décision médicale. Apprenez les méthodes d\'analyse critique et d\'evidence-based medicine.',
      icon: <Brain className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      features: ['Raisonnement clinique', 'Evidence-based medicine', 'Prise de décision']
    },
    {
      code: 'IC-4',
      title: 'La sécurité du patient',
      description: 'Maîtrisez les principes de sécurité des soins et de gestion des risques. Apprenez à identifier, prévenir et gérer les événements indésirables associés aux soins.',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'from-red-500 to-red-600',
      features: ['Sécurité des soins', 'Gestion des risques', 'Événements indésirables']
    },
    {
      code: 'IC-5',
      title: 'La responsabilité médicale',
      description: 'Comprenez les aspects juridiques et éthiques de la responsabilité médicale. Explorez les différents types de responsabilité et leurs implications pratiques.',
      icon: <Palette className="h-6 w-6" />,
      color: 'from-orange-500 to-orange-600',
      features: ['Responsabilité civile', 'Responsabilité pénale', 'Aspects juridiques']
    }
  ];

  // Traduire les items si nécessaire
  useEffect(() => {
    const translateItems = async () => {
      if (!isTranslationNeeded) {
        setTranslatedItems(ednitems);
        return;
      }

      const itemsToTranslate = ednitems.map(item => ({
        ...item,
        title: item.title,
        description: item.description,
        features: item.features
      }));

      try {
        const translatedItemsData = await Promise.all(
          itemsToTranslate.map(async (item, index) => {
            // Délai entre les traductions pour éviter le rate limiting
            if (index > 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            const [translatedTitle, translatedDescription, translatedFeatures] = await Promise.all([
              translateArray([item.title]),
              translateArray([item.description]),
              translateArray(item.features)
            ]);

            return {
              ...item,
              title: translatedTitle[0] || item.title,
              description: translatedDescription[0] || item.description,
              features: translatedFeatures.length === item.features.length ? translatedFeatures : item.features
            };
          })
        );

        setTranslatedItems(translatedItemsData);
      } catch (error) {
        console.warn('Translation failed, using original items:', error);
        setTranslatedItems(ednitems);
      }
    };

    translateItems();
  }, [currentLanguage, isTranslationNeeded, translateArray]);

  const handleItemClick = (itemCode: string) => {
    navigate(`/edn/item/${itemCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec sélecteur de langue */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <TranslatedText 
              text="Formation EDN - Items de Compétences"
              as="h1"
              className="text-4xl font-bold text-gray-900 mb-2"
              showLoader
            />
            <TranslatedText 
              text="Parcours de formation médicale interactif et personnalisé"
              as="p"
              className="text-xl text-gray-600"
            />
          </div>
          <LanguageSelector />
        </div>

        {/* Indication de la langue actuelle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <div>
              <p className="font-semibold text-blue-800">
                <TranslatedText text={`Interface en ${currentLanguage === 'fr' ? 'Français' : currentLanguage}`} />
              </p>
              <p className="text-sm text-blue-600">
                <TranslatedText text="Toute l'expérience de formation sera traduite dans cette langue" />
              </p>
            </div>
          </div>
        </div>

        {/* Grid des items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translatedItems.map((item) => (
            <Card
              key={item.code}
              className="hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleItemClick(item.code)}
            >
              <CardHeader className={`bg-gradient-to-r ${item.color} text-white rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {item.code}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold mt-2">
                  {item.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {item.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      <TranslatedText text="Commencer" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Headphones className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section informative */}
        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <TranslatedText 
                text="Formation EDN Interactive"
                as="h2"
                className="text-2xl font-bold mb-4"
              />
              <TranslatedText 
                text="Explorez les Items de Compétences (IC) avec des contenus interactifs, des bandes dessinées pédagogiques, des scènes immersives et la génération musicale personnalisée pour une expérience d'apprentissage unique."
                as="p"
                className="text-gray-600 leading-relaxed"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <TranslatedText 
                    text="Contenus Pédagogiques"
                    as="h3"
                    className="font-semibold mb-2"
                  />
                  <TranslatedText 
                    text="Ressources complètes et structurées"
                    as="p"
                    className="text-sm text-gray-600"
                  />
                </div>
                <div className="text-center">
                  <Palette className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                  <TranslatedText 
                    text="Expérience Immersive"
                    as="h3"
                    className="font-semibold mb-2"
                  />
                  <TranslatedText 
                    text="Scènes interactives et bandes dessinées"
                    as="p"
                    className="text-sm text-gray-600"
                  />
                </div>
                <div className="text-center">
                  <Headphones className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <TranslatedText 
                    text="Génération Musicale"
                    as="h3"
                    className="font-semibold mb-2"
                  />
                  <TranslatedText 
                    text="Musiques personnalisées avec paroles pédagogiques"
                    as="p"
                    className="text-sm text-gray-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EdnIndex;
