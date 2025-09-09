import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Maximize,
  Download,
  Share,
  Bookmark
} from 'lucide-react';
import { TranslatedText } from '@/components/TranslatedText';

interface BandeDessineeProps {
  item: any;
  storyData?: any;
  onProgress?: (progress: number) => void;
}

export const BandeDessinee: React.FC<BandeDessineeProps> = ({ 
  item, 
  storyData, 
  onProgress 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readPages, setReadPages] = useState<Set<number>>(new Set());

  // Générer les pages de BD basées sur l'item médical
  const pages = [
    {
      id: 1,
      title: 'Introduction',
      content: `Découvrons ensemble ${item.title}`,
      panels: [
        {
          dialogue: `Bonjour ! Je suis le Dr. Médicale, et aujourd'hui nous allons explorer ${item.title}.`,
          character: 'docteur',
          background: 'hospital'
        },
        {
          dialogue: `Cette histoire va nous permettre de comprendre les concepts clés de façon visuelle et mémorable.`,
          character: 'docteur',
          background: 'classroom'
        }
      ],
      educationalNote: `${item.title} est un sujet important du programme médical. Cette approche narrative facilite la mémorisation.`
    },
    {
      id: 2,
      title: 'Le cas clinique',
      content: 'Un patient arrive aux urgences...',
      panels: [
        {
          dialogue: `Un patient de 45 ans arrive aux urgences en présentant des symptômes caractéristiques.`,
          character: 'patient',
          background: 'emergency'
        },
        {
          dialogue: `Le médecin urgentiste commence par un interrogatoire systématique pour recueillir l'anamnèse.`,
          character: 'docteur',
          background: 'emergency'
        },
        {
          dialogue: `"Depuis quand avez-vous ces symptômes ? Y a-t-il des facteurs déclenchants ?"`,
          character: 'docteur',
          background: 'emergency'
        }
      ],
      educationalNote: 'L\'interrogatoire est la première étape de la démarche diagnostique. Il permet d\'orienter l\'examen clinique.'
    },
    {
      id: 3,
      title: 'L\'examen clinique',
      content: 'Le médecin procède à l\'examen...',
      panels: [
        {
          dialogue: `L'examen clinique révèle des signes objectifs importants pour le diagnostic.`,
          character: 'docteur',
          background: 'examination'
        },
        {
          dialogue: `Chaque signe clinique doit être interprété dans le contexte global du patient.`,
          character: 'docteur',
          background: 'examination'
        }
      ],
      educationalNote: 'L\'examen clinique doit être systématique et méthodique pour ne pas passer à côté d\'éléments importants.'
    },
    {
      id: 4,
      title: 'Le diagnostic',
      content: 'Après analyse, le diagnostic est posé...',
      panels: [
        {
          dialogue: `En synthétisant tous les éléments, le diagnostic devient évident : il s'agit de ${item.title}.`,
          character: 'docteur',
          background: 'office'
        },
        {
          dialogue: `Le médecin explique maintenant au patient sa pathologie et les options thérapeutiques.`,
          character: 'docteur',
          background: 'office'
        }
      ],
      educationalNote: 'Le diagnostic doit toujours être expliqué au patient de manière claire et compréhensible.'
    },
    {
      id: 5,
      title: 'Le traitement',
      content: 'Le plan thérapeutique est établi...',
      panels: [
        {
          dialogue: `Le traitement sera adapté à votre situation particulière et à vos facteurs de risque.`,
          character: 'docteur',
          background: 'office'
        },
        {
          dialogue: `Il est important de suivre les recommandations et de revenir pour le suivi programmé.`,
          character: 'docteur',
          background: 'office'
        }
      ],
      educationalNote: 'Le traitement doit être personnalisé et le suivi médical est essentiel pour s\'assurer de l\'efficacité.'
    },
    {
      id: 6,
      title: 'Conclusion',
      content: 'Récapitulatif des points clés...',
      panels: [
        {
          dialogue: `Nous avons vu ensemble l'approche complète de ${item.title} : du diagnostic au traitement.`,
          character: 'docteur',
          background: 'classroom'
        },
        {
          dialogue: `N'oubliez pas les points clés : interrogatoire, examen clinique, diagnostic et prise en charge adaptée !`,
          character: 'docteur',
          background: 'classroom'
        }
      ],
      educationalNote: `Cette approche systématique de ${item.title} vous servira dans votre pratique clinique future.`
    }
  ];

  useEffect(() => {
    const progress = (readPages.size / pages.length) * 100;
    onProgress?.(progress);
  }, [readPages, pages.length, onProgress]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setReadPages(prev => new Set([...prev, currentPage]));
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    if (pageIndex <= currentPage) {
      setReadPages(prev => new Set([...prev, pageIndex]));
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <TranslatedText text="Bande Dessinée Éducative" />
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Apprenez {item.title} à travers une histoire illustrée
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                BD Interactive
              </Badge>
              <Badge variant="outline">
                {item.item_code}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Viewer principal */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : 'lg:col-span-3'}`}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Page {currentPage + 1} - {currentPageData.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentPageData.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={zoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-mono">{zoomLevel}%</span>
                  <Button variant="outline" size="sm" onClick={zoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto">
              {/* Zone de BD simulée */}
              <div 
                className="bg-white rounded-lg border-2 border-gray-300 p-4 min-h-96"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                  {currentPageData.panels.map((panel, index) => (
                    <div 
                      key={index}
                      className="border-2 border-gray-400 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-100 relative"
                    >
                      {/* Personnage représenté par une icône */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          panel.character === 'docteur' 
                            ? 'bg-blue-500' 
                            : 'bg-green-500'
                        }`}>
                          {panel.character === 'docteur' ? 'Dr' : 'P'}
                        </div>
                      </div>
                      
                      {/* Bulle de dialogue */}
                      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 relative">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {panel.dialogue}
                        </p>
                        {/* Pointer de la bulle */}
                        <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                      </div>
                      
                      {/* Indication du décor */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="outline" className="text-xs">
                          {panel.background}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Note éducative */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-800">
                <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  💡 Point éducatif
                </h5>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {currentPageData.educationalNote}
                </p>
              </div>
            </CardContent>

            {/* Navigation */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {currentPage + 1} / {pages.length}
                  </span>
                  <Progress 
                    value={((currentPage + 1) / pages.length) * 100} 
                    className="w-32 h-2"
                  />
                </div>
                
                <Button
                  onClick={nextPage}
                  disabled={currentPage === pages.length - 1}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Panneau latéral */}
        {!isFullscreen && (
          <div className="space-y-4">
            {/* Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Progression
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pages lues</span>
                      <span>{readPages.size}/{pages.length}</span>
                    </div>
                    <Progress 
                      value={(readPages.size / pages.length) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((readPages.size / pages.length) * 100)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Complété</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation rapide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {pages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => goToPage(index)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        currentPage === index
                          ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950'
                          : readPages.has(index)
                          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">Page {index + 1}</span>
                        {readPages.has(index) && (
                          <Badge variant="secondary" className="text-xs">✓</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {page.title}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Ajouter aux favoris
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger PDF
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};