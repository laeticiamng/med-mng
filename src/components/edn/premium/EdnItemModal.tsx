import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, BookOpen, Music, Users, Brain, Play, Pause, Volume2, 
  VolumeX, Maximize2, Minimize2, FileText, Image, 
  CheckCircle, Star, Download, Share2
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TableauRangA } from "@/components/edn/TableauRangA";
import { TableauRangB } from "@/components/edn/TableauRangB";
import { ParolesMusicales } from "@/components/edn/ParolesMusicales";
import { SceneImmersive } from "@/components/edn/SceneImmersive";
import { EnhancedQuizFinal } from "@/components/edn/EnhancedQuizFinal";
import { BdGallery } from "@/components/edn/BdGallery";
import { RomanNarratif } from "@/components/edn/RomanNarratif";
import { CompetencesBadges } from "@/components/edn/CompetencesBadges";
import { CompetenceValidation } from "@/components/edn/CompetenceValidation";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";

interface EdnItemModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EdnItemModal: React.FC<EdnItemModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const isMobile = useIsMobile();

  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  if (!finalItem) return null;

  const getItemNumber = (itemCode: string) => {
    return parseInt(itemCode.replace('IC-', '') || '0');
  };

  const getAvailableTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Aperçu', icon: BookOpen, available: true },
    ];
    
    if (finalItem.tableau_rang_a) {
      tabs.push({ id: 'rang-a', label: 'Rang A', icon: BookOpen, available: true });
    }
    
    if (finalItem.tableau_rang_b) {
      tabs.push({ id: 'rang-b', label: 'Rang B', icon: Brain, available: true });
    }
    
    if (finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0) {
      tabs.push({ id: 'music', label: 'Musique', icon: Music, available: true });
    }
    
    if (finalItem.scene_immersive) {
      tabs.push({ id: 'scene', label: 'Scène', icon: Users, available: true });
    }
    
    if (finalItem.quiz_questions) {
      tabs.push({ id: 'quiz', label: 'Quiz', icon: Brain, available: true });
    }
    
    // Nouveaux onglets pour BD et Roman
    tabs.push({ id: 'bd', label: 'BD', icon: Image, available: true });
    tabs.push({ id: 'roman', label: 'Roman', icon: FileText, available: true });
    
    return tabs;
  };

  const tabs = getAvailableTabs();
  const itemNumber = getItemNumber(finalItem.item_code);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${isFullscreen || isMobile ? 'max-w-[100vw] max-h-[100vh] m-0 rounded-none' : 'max-w-6xl max-h-[90vh]'} 
                   overflow-hidden p-0 bg-gradient-to-br from-purple-50 to-indigo-50`}
      >
        {/* Header */}
        <DialogHeader className={`bg-gradient-to-r from-purple-600 to-indigo-600 text-white ${isMobile ? 'p-4' : 'p-6'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-white/20 rounded-lg flex items-center justify-center`}>
                <span className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>{itemNumber}</span>
              </div>
              <div>
                <DialogTitle className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-1`}>
                  {isMobile ? finalItem.item_code : `${finalItem.item_code}: ${finalItem.title}`}
                </DialogTitle>
                {!isMobile && finalItem.subtitle && (
                  <p className="text-purple-100">{finalItem.subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          {!isMobile && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {tabs.slice(1).map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <Badge key={tab.id} className="bg-white/20 text-white border-white/20">
                    <IconComponent className="h-3 w-3 mr-1" />
                    {tab.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </DialogHeader>

        {/* Navigation Tabs Premium Mobile */}
        <div className="flex-shrink-0 border-b bg-white/80 backdrop-blur-sm relative">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {isMobile ? (
              // Navigation mobile avec swipe et scroll amélioré
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide py-2 px-4">
                  <div className="flex gap-1 min-w-max">
                    {tabs.map((tab, index) => {
                      const IconComponent = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            flex flex-col items-center gap-1 px-4 py-3 rounded-xl min-w-[72px] transition-all duration-300 active:scale-95
                            ${isActive 
                              ? 'bg-purple-600 text-white shadow-lg scale-105 transform' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                          `}
                        >
                          <IconComponent className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                          <span className="text-xs font-medium leading-none">
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Indicateur de swipe */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-current rounded-full opacity-40"></div>
                    <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-current rounded-full opacity-80"></div>
                  </div>
                </div>
              </div>
            ) : (
              // Navigation desktop
              <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}
          </Tabs>
        </div>

        {/* Content avec navigation tactile */}
        <div className="flex-1 overflow-y-auto relative">
          {isMobile && (
            // Navigation par flèches sur mobile
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md active:scale-95"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                  }
                }}
                disabled={tabs.findIndex(tab => tab.id === activeTab) === 0}
              >
                ←
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md active:scale-95"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                disabled={tabs.findIndex(tab => tab.id === activeTab) === tabs.length - 1}
              >
                →
              </Button>
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview */}
            <TabsContent value="overview" className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
              {/* Validation complète des compétences */}
              <CompetenceValidation item={finalItem} />
              
              {/* Badges de compétences */}
              <CompetencesBadges item={finalItem} />
              
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Contenu Disponible
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {finalItem.tableau_rang_a && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Tableau Rang A - Compétences fondamentales</span>
                      </div>
                    )}
                    {finalItem.tableau_rang_b && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Tableau Rang B - Compétences avancées</span>
                      </div>
                    )}
                    {finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Musique - {finalItem.paroles_musicales.length} chansons d'apprentissage</span>
                      </div>
                    )}
                    {finalItem.scene_immersive && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Scène immersive - Expérience interactive</span>
                      </div>
                    )}
                    {finalItem.quiz_questions && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Quiz interactif - Évaluation des connaissances</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Actions Rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Commencer l'apprentissage
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le contenu
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Rang A */}
            {finalItem.tableau_rang_a && (
              <TabsContent value="rang-a" className={isMobile ? 'p-4' : 'p-6'}>
                <TableauRangA data={finalItem.tableau_rang_a} />
              </TabsContent>
            )}

            {/* Rang B */}
            {finalItem.tableau_rang_b && (
              <TabsContent value="rang-b" className={isMobile ? 'p-4' : 'p-6'}>
                <TableauRangB data={finalItem.tableau_rang_b} itemCode={finalItem.item_code} />
              </TabsContent>
            )}

            {/* Music */}
            {finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0 && (
              <TabsContent value="music" className={isMobile ? 'p-4' : 'p-6'}>
                <ParolesMusicales 
                  paroles={finalItem.paroles_musicales}
                  itemCode={finalItem.item_code}
                />
              </TabsContent>
            )}

            {/* Scene */}
            {finalItem.scene_immersive && (
              <TabsContent value="scene" className={isMobile ? 'p-4' : 'p-6'}>
                <SceneImmersive data={finalItem.scene_immersive} itemCode={finalItem.item_code} />
              </TabsContent>
            )}

            {/* Quiz */}
            {finalItem.quiz_questions && (
              <TabsContent value="quiz" className={isMobile ? 'p-4' : 'p-6'}>
                <EnhancedQuizFinal 
                  questions={finalItem.quiz_questions}
                  itemCode={finalItem.item_code}
                  itemTitle={finalItem.title}
                />
              </TabsContent>
            )}

            {/* BD Gallery */}
            <TabsContent value="bd" className={isMobile ? 'p-4' : 'p-6'}>
              <BdGallery 
                itemCode={finalItem.item_code}
                title={finalItem.title}
                tableauRangA={finalItem.tableau_rang_a}
                tableauRangB={finalItem.tableau_rang_b}
              />
            </TabsContent>

            {/* Roman Narratif */}
            <TabsContent value="roman" className={isMobile ? 'p-4' : 'p-6'}>
              <RomanNarratif 
                itemCode={finalItem.item_code}
                title={finalItem.title}
                tableauRangA={finalItem.tableau_rang_a}
                tableauRangB={finalItem.tableau_rang_b}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};