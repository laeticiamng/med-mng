import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  X, BookOpen, Music, Users, Brain, Play, Pause, Volume2, 
  VolumeX, Maximize2, Minimize2, FileText, Image, 
  CheckCircle, Star, Download, Share2, BarChart3
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
import { AudioAmbiancePlayer } from "@/components/edn/audio/AudioAmbiancePlayer";
import { EdnItemExport } from "@/components/edn/export/EdnItemExport";
import { PersonalNotes } from "@/components/edn/PersonalNotes";
import { QuizLeaderboard } from "@/components/edn/QuizLeaderboard";
import { QuizHistorySummary } from "@/components/edn/QuizHistorySummary";
import { QuizProgressChart } from "@/components/edn/quiz/QuizProgressChart";
import { ProgressHeatmap } from "@/components/edn/quiz/ProgressHeatmap";
import { SocialShare } from "@/components/social/SocialShare";
import { FaqSection } from "@/components/help/FaqSection";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";
import { useOicCompetences } from "@/hooks/useOicCompetences";
import { supabase } from "@/integrations/supabase/client";

interface OicCompetence {
  intitule?: string;
  objectif_id?: string;
}

interface EdnItemData {
  id?: string;
  item_code?: string;
  title?: string;
  subtitle?: string;
  tableau_rang_a?: unknown;
  tableau_rang_b?: unknown;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  scene_immersive?: unknown;
  quiz_questions?: unknown;
  audio_ambiance?: { url?: string };
  visual_ambiance?: { url?: string };
  bd_data?: unknown;
  roman_narratif?: string;
  competences_oic_rang_a?: OicCompetence[];
  competences_oic_rang_b?: OicCompetence[];
  bd_panels?: unknown;
  roman_story?: unknown;
}

interface EdnItemModalProps {
  item: EdnItemData;
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
  const [completeItemData, setCompleteItemData] = useState<EdnItemData | null>(null);
  const isMobile = useIsMobile();

  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  // Charger les vraies compétences OIC depuis la base de données
  const { competences: oicCompetencesA, loading: loadingA } = useOicCompetences(finalItem?.item_code || '', 'A');
  const { competences: oicCompetencesB, loading: loadingB } = useOicCompetences(finalItem?.item_code || '', 'B');

  // Mise à jour du tab actif quand initialTab change
  useEffect(() => {
    if (initialTab && isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Memorize last tab in localStorage
  useEffect(() => {
    if (isOpen && finalItem?.item_code) {
      localStorage.setItem(`modal-tab-${finalItem.item_code}`, activeTab);
    }
  }, [activeTab, isOpen, finalItem?.item_code]);

  // Restore last tab on open
  useEffect(() => {
    if (isOpen && finalItem?.item_code && !initialTab) {
      const savedTab = localStorage.getItem(`modal-tab-${finalItem.item_code}`);
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, [isOpen, finalItem?.item_code, initialTab]);

  // Charger les données complètes (quiz, scene, tableaux, paroles, bd, roman) 
  useEffect(() => {
    const loadCompleteData = async () => {
      if (finalItem && isOpen) {
        try {
          // Toujours fetch les données complètes depuis Supabase pour avoir bd_panels et roman_story
          const { data } = await supabase
            .from('edn_items_immersive')
            .select('quiz_questions, scene_immersive, tableau_rang_a, tableau_rang_b, paroles_musicales, paroles_rang_a, paroles_rang_b, paroles_rang_ab, bd_panels, roman_story')
            .eq('item_code', finalItem.item_code)
            .maybeSingle();
          
          if (data) {
            // Normaliser paroles_musicales: si c'est une string, la convertir en array
            let normalizedParoles: string[] = [];
            if (data.paroles_musicales) {
              if (typeof data.paroles_musicales === 'string') {
                normalizedParoles = (data.paroles_musicales as string)
                  .split(/\n\n|\[.*?\]/)
                  .map(s => s.trim())
                  .filter(s => s.length > 0);
              } else if (Array.isArray(data.paroles_musicales)) {
                normalizedParoles = data.paroles_musicales as string[];
              }
            }
            
            setCompleteItemData({
              quiz_questions: data.quiz_questions as unknown,
              scene_immersive: data.scene_immersive as unknown,
              tableau_rang_a: data.tableau_rang_a as unknown,
              tableau_rang_b: data.tableau_rang_b as unknown,
              paroles_musicales: normalizedParoles,
              paroles_rang_a: data.paroles_rang_a as string[],
              paroles_rang_b: data.paroles_rang_b as string[],
              paroles_rang_ab: data.paroles_rang_ab as string[],
              competences_oic_rang_a: oicCompetencesA,
              competences_oic_rang_b: oicCompetencesB,
              bd_panels: data.bd_panels as unknown,
              roman_story: data.roman_story as unknown,
            });
          }
        } catch {
          // Silent error handling - use existing data
          setCompleteItemData({
            quiz_questions: finalItem.quiz_questions,
            paroles_musicales: finalItem.paroles_musicales,
            competences_oic_rang_a: oicCompetencesA,
            competences_oic_rang_b: oicCompetencesB,
            tableau_rang_a: finalItem.tableau_rang_a,
            tableau_rang_b: finalItem.tableau_rang_b
          });
        }
      }
    };
    loadCompleteData();
  }, [finalItem, isOpen, oicCompetencesA, oicCompetencesB]);

  if (!finalItem) return null;

  const getItemNumber = (itemCode: string) => {
    return parseInt(itemCode.replace('IC-', '') || '0');
  };

  const getAvailableTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Aperçu', icon: BookOpen, available: true },
    ];
    
    // Rang A - toujours disponible car hook useOicCompetences charge les vraies données
    tabs.push({ id: 'rang-a', label: 'Rang A', icon: BookOpen, available: true });
    
    // Rang B - toujours disponible car hook useOicCompetences charge les vraies données
    tabs.push({ id: 'rang-b', label: 'Rang B', icon: Brain, available: true });
    
    // Quiz - toujours disponible (affiche message si vide)
    tabs.push({ id: 'quiz', label: 'Quiz', icon: Brain, available: true });
    
    // Statistics tab - pour voir l'historique et progression
    tabs.push({ id: 'stats', label: 'Stats', icon: BarChart3, available: true });
    
    // Musique - toujours disponible (génération possible)
    tabs.push({ id: 'music', label: 'Musique', icon: Music, available: true });
    
    // Scène - toujours visible (avec message si pas de données)
    tabs.push({ id: 'scene', label: 'Scène', icon: Users, available: true });
    
    // BD et Roman - disponibles pour génération à la demande
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

                  {/* Données OIC complètes avec détails */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Compétences UNESS (OIC)</span>
                        {(loadingA || loadingB) && (
                          <span className="text-xs text-muted-foreground animate-pulse">Chargement...</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Rang A - {oicCompetencesA.length} compétences
                          </h4>
                          {oicCompetencesA.length > 0 ? (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {oicCompetencesA.slice(0, 5).map((comp, idx) => (
                                <div key={idx} className="text-xs p-1.5 bg-background/50 rounded">
                                  <span className="font-medium">{comp.objectif_id}</span>: {comp.intitule?.substring(0, 60)}...
                                </div>
                              ))}
                              {oicCompetencesA.length > 5 && (
                                <p className="text-xs text-muted-foreground">+{oicCompetencesA.length - 5} autres compétences</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{loadingA ? 'Chargement...' : 'Aucune compétence'}</p>
                          )}
                        </div>
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <h4 className="font-semibold mb-2 text-accent-foreground flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            Rang B - {oicCompetencesB.length} compétences
                          </h4>
                          {oicCompetencesB.length > 0 ? (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {oicCompetencesB.slice(0, 5).map((comp, idx) => (
                                <div key={idx} className="text-xs p-1.5 bg-background/50 rounded">
                                  <span className="font-medium">{comp.objectif_id}</span>: {comp.intitule?.substring(0, 60)}...
                                </div>
                              ))}
                              {oicCompetencesB.length > 5 && (
                                <p className="text-xs text-muted-foreground">+{oicCompetencesB.length - 5} autres compétences</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{loadingB ? 'Chargement...' : 'Aucune compétence'}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                        <span className="font-bold text-lg">{oicCompetencesA.length + oicCompetencesB.length}</span>
                        <span className="text-muted-foreground ml-2">compétences UNESS officielles</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation complète des compétences */}
                  <CompetenceValidation item={finalItem} />
                  
                  {/* Export PDF */}
                  <EdnItemExport 
                    itemCode={finalItem.item_code}
                    itemTitle={finalItem.title}
                    tableauRangA={finalItem.tableau_rang_a}
                    tableauRangB={finalItem.tableau_rang_b}
                    parolesRangA={finalItem.paroles_rang_a}
                    parolesRangB={finalItem.paroles_rang_b}
                  />
                  
                  {/* Personal Notes */}
                  <PersonalNotes itemCode={finalItem.item_code} />
                  
                  {/* Quiz History Summary */}
                  <QuizHistorySummary itemCode={finalItem.item_code} />
                  
                  {/* FAQ Section */}
                  <FaqSection />
                  
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

              {/* Rang A - Toujours affiché car useOicCompetences charge les vraies données */}
              <TabsContent value="rang-a" className="mt-0 p-6">
                <TableauRangA data={completeItemData?.tableau_rang_a || finalItem.tableau_rang_a} itemCode={finalItem.item_code} />
              </TabsContent>

              {/* Rang B - Toujours affiché car useOicCompetences charge les vraies données */}
              <TabsContent value="rang-b" className="mt-0 p-6">
                <TableauRangB data={completeItemData?.tableau_rang_b || finalItem.tableau_rang_b} itemCode={finalItem.item_code} />
              </TabsContent>

              {/* Stats Tab - Historique et progression */}
              <TabsContent value="stats" className="mt-0 p-6">
                <div className="space-y-6">
                  {/* OIC Competences Overview */}
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Statistiques - {finalItem.item_code}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      {/* Competences Count Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="text-3xl font-bold text-primary">{oicCompetencesA.length}</div>
                          <div className="text-sm text-muted-foreground">Rang A</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <div className="text-3xl font-bold text-accent-foreground">{oicCompetencesB.length}</div>
                          <div className="text-sm text-muted-foreground">Rang B</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
                          <div className="text-3xl font-bold text-success">{oicCompetencesA.length + oicCompetencesB.length}</div>
                          <div className="text-sm text-muted-foreground">Total OIC</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                          <div className="text-3xl font-bold text-warning">
                            {finalItem.paroles_musicales?.length ? '✓' : '○'}
                          </div>
                          <div className="text-sm text-muted-foreground">Musique</div>
                        </div>
                      </div>
                      
                      {/* Competence Details */}
                      {(oicCompetencesA.length > 0 || oicCompetencesB.length > 0) && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-muted-foreground">Détail des compétences UNESS</h4>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {oicCompetencesA.slice(0, 5).map((comp, idx) => (
                              <div key={`a-${idx}`} className="flex items-start gap-2 p-2 bg-primary/5 rounded text-sm">
                                <span className="font-mono text-primary text-xs">{comp.objectif_id}</span>
                                <span className="text-foreground">{comp.intitule?.substring(0, 80)}...</span>
                              </div>
                            ))}
                            {oicCompetencesB.slice(0, 5).map((comp, idx) => (
                              <div key={`b-${idx}`} className="flex items-start gap-2 p-2 bg-accent/5 rounded text-sm">
                                <span className="font-mono text-accent-foreground text-xs">{comp.objectif_id}</span>
                                <span className="text-foreground">{comp.intitule?.substring(0, 80)}...</span>
                              </div>
                            ))}
                            {(oicCompetencesA.length > 5 || oicCompetencesB.length > 5) && (
                              <p className="text-xs text-muted-foreground text-center pt-2">
                                +{Math.max(0, oicCompetencesA.length - 5) + Math.max(0, oicCompetencesB.length - 5)} autres compétences
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Quiz History Summary + Progression Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <QuizHistorySummary itemCode={finalItem.item_code} />
                        <QuizProgressChart itemCode={finalItem.item_code} />
                      </div>
                      
                      {/* Heatmap d'activité */}
                      <ProgressHeatmap itemCode={finalItem.item_code} days={28} />
                      
                      {/* Competence Progress */}
                      <CompetenceValidation item={finalItem} />
                      
                      {/* Leaderboard */}
                      <QuizLeaderboard itemCode={finalItem.item_code} limit={5} />
                    </CardContent>
                  </Card>
                  
                  {/* Personal Notes */}
                  <PersonalNotes itemCode={finalItem.item_code} />
                </div>
              </TabsContent>

              <TabsContent value="music" className="mt-0 p-6">
                <ParolesMusicales 
                  paroles={completeItemData?.paroles_musicales || finalItem.paroles_musicales}
                  paroles_rang_a={finalItem.paroles_rang_a}
                  paroles_rang_b={finalItem.paroles_rang_b}
                  paroles_rang_ab={finalItem.paroles_rang_ab}
                  itemCode={finalItem.item_code}
                  tableauRangA={finalItem.tableau_rang_a}
                  tableauRangB={finalItem.tableau_rang_b}
                />
              </TabsContent>

              {/* Scene - Toujours affichée */}
              <TabsContent value="scene" className="mt-0 p-6 space-y-4">
                {(completeItemData?.scene_immersive || finalItem.scene_immersive) ? (
                  <>
                    {/* Audio Ambiance Player */}
                    {finalItem.audio_ambiance && (
                      <AudioAmbiancePlayer 
                        audioConfig={finalItem.audio_ambiance} 
                        itemCode={finalItem.item_code} 
                      />
                    )}
                    <SceneImmersive data={completeItemData?.scene_immersive || finalItem.scene_immersive} itemCode={finalItem.item_code} />
                  </>
                ) : (
                  <Card className="border-2 border-accent/20">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle>Scène immersive en préparation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        La scène immersive pour <strong>{finalItem.item_code}</strong> est en cours de création.
                      </p>
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        <button 
                          onClick={() => setActiveTab('rang-a')}
                          className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          <div className="font-semibold text-primary mb-1">📚 Rang A</div>
                          <div className="text-xs text-muted-foreground">Compétences fondamentales</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('music')}
                          className="p-4 rounded-lg border border-success/30 bg-success/5 hover:bg-success/10 transition-colors text-left"
                        >
                          <div className="font-semibold text-success mb-1">🎵 Musique</div>
                          <div className="text-xs text-muted-foreground">Mémorisation musicale</div>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        En attendant, explorez les autres formats pédagogiques disponibles.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Quiz - Toujours affiché */}
              <TabsContent value="quiz" className="mt-0 p-6 space-y-6">
                {(() => {
                  const quizData = completeItemData?.quiz_questions || finalItem.quiz_questions;
                  const hasQuiz = quizData && Array.isArray(quizData) && quizData.length > 0;
                  return hasQuiz ? (
                  <>
                    <EnhancedQuizFinal 
                      questions={completeItemData?.quiz_questions || finalItem.quiz_questions}
                      itemCode={finalItem.item_code}
                      itemTitle={finalItem.title}
                    />
                    
                    {/* Leaderboard */}
                    <QuizLeaderboard itemCode={finalItem.item_code} limit={10} />
                    
                    {/* Social Share */}
                    <div className="flex justify-center">
                      <SocialShare 
                        type="score"
                        title={`Quiz ${finalItem.item_code}`}
                        description={`J'ai complété le quiz ${finalItem.title} !`}
                        value="100%"
                      />
                    </div>
                  </>
                ) : (
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle>Quiz en préparation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-muted-foreground">
                        Les questions de quiz pour <strong>{finalItem.item_code}</strong> sont en cours de création.
                      </p>
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        <button 
                          onClick={() => setActiveTab('rang-a')}
                          className="p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
                        >
                          <div className="font-semibold text-primary mb-1">📚 Rang A</div>
                          <div className="text-xs text-muted-foreground">Compétences fondamentales</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('rang-b')}
                          className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors text-left"
                        >
                          <div className="font-semibold text-accent-foreground mb-1">🎯 Rang B</div>
                          <div className="text-xs text-muted-foreground">Compétences avancées</div>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground pt-2">
                        En attendant, révisez les compétences pour préparer vos révisions.
                      </p>
                    </CardContent>
                  </Card>
                );
                })()}
              </TabsContent>

              {/* BD Gallery */}
              <TabsContent value="bd" className="mt-0 p-6">
                <BdGallery 
                  itemCode={finalItem.item_code}
                  title={finalItem.title}
                  tableauRangA={completeItemData?.tableau_rang_a || finalItem.tableau_rang_a}
                  tableauRangB={completeItemData?.tableau_rang_b || finalItem.tableau_rang_b}
                  bdPanels={completeItemData?.bd_panels as any || finalItem.bd_panels as any}
                />
              </TabsContent>

              {/* Roman Narratif */}
              <TabsContent value="roman" className="mt-0 p-6">
                <RomanNarratif 
                  itemCode={finalItem.item_code}
                  title={finalItem.title}
                  tableauRangA={completeItemData?.tableau_rang_a || finalItem.tableau_rang_a}
                  tableauRangB={completeItemData?.tableau_rang_b || finalItem.tableau_rang_b}
                  romanStory={completeItemData?.roman_story as any || finalItem.roman_story as any}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};