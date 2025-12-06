import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";

interface EdnItemModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

export const EdnItemModal: React.FC<EdnItemModalProps> = ({
  item,
  isOpen,
  onClose,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [completeItemData, setCompleteItemData] = useState<any>(null);
  const isMobile = useIsMobile();

  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  // Mise à jour du tab actif quand initialTab change
  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Les données OIC sont déjà dans finalItem grâce au fetch optimisé
  useEffect(() => {
    if (finalItem && isOpen) {
      // Utiliser les données déjà présentes dans l'item
      setCompleteItemData({
        competences_oic_rang_a: finalItem.competences_oic_rang_a,
        competences_oic_rang_b: finalItem.competences_oic_rang_b,
        tableau_rang_a: finalItem.tableau_rang_a,
        tableau_rang_b: finalItem.tableau_rang_b
      });
    }
  }, [finalItem, isOpen]);

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
    
    // ORDRE PÉDAGOGIQUE: Quiz juste après les tableaux pour tester les connaissances
    if (finalItem.quiz_questions) {
      tabs.push({ id: 'quiz', label: 'Quiz', icon: Brain, available: true });
    }
    
    if ((finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0) || 
        finalItem.paroles_rang_a || finalItem.paroles_rang_b || finalItem.paroles_rang_ab) {
      tabs.push({ id: 'music', label: 'Musique', icon: Music, available: true });
    }
    
    if (finalItem.scene_immersive) {
      tabs.push({ id: 'scene', label: 'Scène', icon: Users, available: true });
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
        className={`${isFullscreen || isMobile ? 'max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none' : 'max-w-6xl max-h-[90vh]'} 
                   p-0 bg-gradient-to-br from-accent/5 to-primary/5 flex flex-col overflow-auto`}
      >
        {/* Header */}
        <DialogHeader className={`bg-gradient-to-r from-accent to-primary text-primary-foreground ${isMobile ? 'p-4' : 'p-6'} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
              <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-background/20 rounded-lg flex items-center justify-center`}>
                <span className={`text-primary-foreground font-bold ${isMobile ? 'text-sm' : 'text-lg'}`}>{itemNumber}</span>
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-primary-foreground mb-1 truncate`}>
                  {isMobile ? finalItem.item_code : `${finalItem.item_code}: ${finalItem.title}`}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 text-sm truncate">
                  {finalItem.subtitle || `Item de connaissance EDN ${finalItem.item_code}`}
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-primary-foreground hover:bg-background/20"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-primary-foreground hover:bg-background/20"
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
                  <Badge key={tab.id} className="bg-background/20 text-primary-foreground border-background/20">
                    <IconComponent className="h-3 w-3 mr-1" />
                    {tab.label}
                  </Badge>
                );
              })}
            </div>
          )}
        </DialogHeader>

        {/* Navigation Tabs Premium Mobile */}
        <div className="flex-shrink-0 border-b bg-background/80 backdrop-blur-sm relative">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {isMobile ? (
              // Navigation mobile optimisée
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide py-3 px-2">
                  <div className="flex gap-1 min-w-max pb-1">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[68px] transition-all duration-200 active:scale-95
                            ${isActive 
                              ? 'bg-accent text-accent-foreground shadow-md' 
                              : 'bg-background/80 text-muted-foreground hover:bg-muted'
                            }
                          `}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
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
                      className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-accent/10 data-[state=active]:text-accent"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}

            {/* Content avec scroll optimisé - FIX SCROLL */}
            <div className="flex-1 overflow-y-auto relative min-h-0 max-h-full">
              
              {/* Tab Content - Overview */}
              <TabsContent value="overview" className="mt-0 p-6">
                <div className="space-y-6">
                  {/* Aperçu général */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Aperçu général - {finalItem.item_code}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">Contenu disponible</h4>
                          <div className="space-y-2 flex flex-wrap gap-2">
                            {finalItem.tableau_rang_a && (
                              <Badge className="bg-primary/10 text-primary">Rang A</Badge>
                            )}
                            {finalItem.tableau_rang_b && (
                              <Badge className="bg-accent/10 text-accent">Rang B</Badge>
                            )}
                            {finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0 && (
                              <Badge className="bg-success/10 text-success">Musique</Badge>
                            )}
                            {finalItem.scene_immersive && (
                              <Badge className="bg-success/10 text-success">Scène</Badge>
                            )}
                            {finalItem.quiz_questions && (
                              <Badge className="bg-warning/10 text-warning">Quiz</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-muted-foreground text-sm">
                            {finalItem.pitch_intro || `Explorez l'item ${finalItem.item_code} avec tous ses contenus interactifs.`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Données OIC complètes */}
                  {completeItemData && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Compétences UNESS (OIC)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Compétences OIC Rang A</h4>
                              <p className="text-sm text-muted-foreground">
                              {completeItemData.competences_oic_rang_a ? 
                                Array.isArray(completeItemData.competences_oic_rang_a) ?
                                  `${completeItemData.competences_oic_rang_a.length} compétences` :
                                  'Données disponibles' :
                                'Non disponible'
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Compétences OIC Rang B</h4>
                            <p className="text-sm text-muted-foreground">
                              {completeItemData.competences_oic_rang_b ? 
                                Array.isArray(completeItemData.competences_oic_rang_b) ?
                                  `${completeItemData.competences_oic_rang_b.length} compétences` :
                                  'Données disponibles' :
                                'Non disponible'
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Validation complète des compétences */}
                  <CompetenceValidation item={finalItem} />
                  
                  {/* Badges de compétences */}
                  <CompetencesBadges item={finalItem} />
                </div>
              </TabsContent>

              {isMobile && (
                // Navigation par flèches sur mobile
                <div className="fixed top-1/2 left-2 right-2 z-20 flex justify-between pointer-events-none">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg active:scale-95 pointer-events-auto"
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
                    className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg active:scale-95 pointer-events-auto"
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

              {/* Rang A */}
              {(finalItem.tableau_rang_a || completeItemData?.tableau_rang_a) && (
                <TabsContent value="rang-a" className="mt-0 p-6">
                  <TableauRangA data={completeItemData?.tableau_rang_a || finalItem.tableau_rang_a} itemCode={finalItem.item_code} />
                </TabsContent>
              )}

              {/* Rang B */}
              {(finalItem.tableau_rang_b || completeItemData?.tableau_rang_b) && (
                <TabsContent value="rang-b" className="mt-0 p-6">
                  <TableauRangB data={completeItemData?.tableau_rang_b || finalItem.tableau_rang_b} itemCode={finalItem.item_code} />
                </TabsContent>
              )}

              {/* Music */}
              {((finalItem.paroles_musicales && finalItem.paroles_musicales.length > 0) || 
                finalItem.paroles_rang_a || finalItem.paroles_rang_b || finalItem.paroles_rang_ab) && (
                <TabsContent value="music" className="mt-0 p-6">
                  <ParolesMusicales 
                    paroles={finalItem.paroles_musicales}
                    paroles_rang_a={finalItem.paroles_rang_a}
                    paroles_rang_b={finalItem.paroles_rang_b}
                    paroles_rang_ab={finalItem.paroles_rang_ab}
                    itemCode={finalItem.item_code}
                    tableauRangA={finalItem.tableau_rang_a}
                    tableauRangB={finalItem.tableau_rang_b}
                  />
                </TabsContent>
              )}

              {/* Scene */}
              {finalItem.scene_immersive && (
                <TabsContent value="scene" className="mt-0 p-6">
                  <SceneImmersive data={finalItem.scene_immersive} itemCode={finalItem.item_code} />
                </TabsContent>
              )}

              {/* Quiz */}
              {finalItem.quiz_questions && (
                <TabsContent value="quiz" className="mt-0 p-6">
                  <EnhancedQuizFinal 
                    questions={finalItem.quiz_questions}
                    itemCode={finalItem.item_code}
                    itemTitle={finalItem.title}
                  />
                </TabsContent>
              )}

              {/* BD Gallery */}
              <TabsContent value="bd" className="mt-0 p-6">
                <BdGallery 
                  itemCode={finalItem.item_code}
                  title={finalItem.title}
                  tableauRangA={finalItem.tableau_rang_a}
                  tableauRangB={finalItem.tableau_rang_b}
                />
              </TabsContent>

              {/* Roman Narratif */}
              <TabsContent value="roman" className="mt-0 p-6">
                <RomanNarratif 
                  itemCode={finalItem.item_code}
                  title={finalItem.title}
                  tableauRangA={finalItem.tableau_rang_a}
                  tableauRangB={finalItem.tableau_rang_b}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};