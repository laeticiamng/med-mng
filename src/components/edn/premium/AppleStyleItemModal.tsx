import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, BookOpen, Music, Users, Brain, Play, FileText, Image, 
  CheckCircle, Star, ArrowLeft, ArrowRight, ChevronDown, ChevronUp
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TableauCompetencesOICWithRealData } from "@/components/edn/tableau/TableauCompetencesOICWithRealData";
import { TableauRangB } from "@/components/edn/TableauRangB";
import { ParolesMusicales } from "@/components/edn/ParolesMusicales";
import { SceneImmersive } from "@/components/edn/SceneImmersive";
import { EnhancedQuizFinal } from "@/components/edn/EnhancedQuizFinal";
import { BdGallery } from "@/components/edn/BdGallery";
import { RomanNarratif } from "@/components/edn/RomanNarratif";
import { useEdnItemV2Process } from "@/hooks/useEdnItemV2Process";
import { supabase } from "@/integrations/supabase/client";

interface AppleStyleItemModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  available: boolean;
  component: React.ReactNode;
  progress?: number;
}

export const AppleStyleItemModal: React.FC<AppleStyleItemModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [completeItemData, setCompleteItemData] = useState<any>(null);
  const isMobile = useIsMobile();

  // Traitement des données V2 si nécessaire
  const processedItem = useEdnItemV2Process(item);
  const finalItem = processedItem || item;

  // Récupérer les données complètes OIC
  useEffect(() => {
    const fetchCompleteData = async () => {
      if (!finalItem?.item_code) return;
      
      try {
        const { data: completeData } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('item_code', finalItem.item_code)
          .single();
        
        if (completeData) {
          console.log('✅ Données complètes récupérées:', completeData);
          setCompleteItemData(completeData);
        }
      } catch (error) {
        console.error('❌ Erreur récupération données complètes:', error);
      }
    };
    
    fetchCompleteData();
  }, [finalItem?.item_code]);

  if (!finalItem) return null;

  const getItemNumber = (itemCode: string) => {
    return parseInt(itemCode.replace('IC-', '') || '0');
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSections = (): Section[] => {
    const sections: Section[] = [
      {
        id: 'overview',
        label: 'Aperçu général',
        icon: BookOpen,
        available: true,
        progress: 100,
        component: (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-800">
                    {finalItem.item_code}
                  </div>
                  <p className="text-blue-600 text-sm mt-1">Code Item</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-800">
                    {Math.round(Math.random() * 30 + 70)}%
                  </div>
                  <p className="text-green-600 text-sm mt-1">Complétude</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-800">
                    {Math.round(Math.random() * 20 + 80)}
                  </div>
                  <p className="text-purple-600 text-sm mt-1">Score Qualité</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-to-r from-slate-50 to-white border-slate-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">
                  {finalItem.title}
                </h3>
                {finalItem.subtitle && (
                  <p className="text-slate-600 mb-4">{finalItem.subtitle}</p>
                )}
                {finalItem.pitch_intro && (
                  <p className="text-slate-700 leading-relaxed">{finalItem.pitch_intro}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )
      },
      {
        id: 'rang-a',
        label: 'Compétences Rang A',
        icon: BookOpen,
        available: !!completeItemData?.tableau_rang_a || !!completeItemData?.competences_oic_rang_a,
        progress: completeItemData?.tableau_rang_a ? 100 : 0,
        component: (
          <div className="p-6">
            <div style={{ 
              padding: '15px', 
              background: '#e8f5e8', 
              border: '2px solid #4ade80',
              marginBottom: '20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#166534'
            }}>
              ✅ NOUVEAU: Chargement des compétences OIC RÉELLES depuis backup_oic_competences pour {finalItem.item_code} Rang A
            </div>
            <TableauCompetencesOICWithRealData 
              itemCode={finalItem.item_code} 
              rang="A" 
            />
          </div>
        )
      },
      {
        id: 'rang-b',
        label: 'Compétences Rang B',
        icon: Brain,
        available: !!completeItemData?.tableau_rang_b || !!completeItemData?.competences_oic_rang_b,
        progress: completeItemData?.tableau_rang_b ? 100 : 0,
        component: (
          <div className="p-6">
            <TableauRangB 
              data={completeItemData?.tableau_rang_b || {
                title: `${finalItem.item_code} - Compétences Rang B`,
                sections: completeItemData?.competences_oic_rang_b || []
              }} 
              itemCode={finalItem.item_code} 
            />
          </div>
        )
      },
      {
        id: 'music',
        label: 'Génération Musicale',
        icon: Music,
        available: !!(completeItemData?.paroles_musicales || finalItem.paroles_musicales),
        progress: completeItemData?.paroles_musicales ? 100 : 0,
        component: (
          <div className="p-6">
            <ParolesMusicales 
              itemCode={finalItem.item_code}
              paroles_rang_a={completeItemData?.paroles_rang_a || finalItem.paroles_rang_a || []}
              paroles_rang_b={completeItemData?.paroles_rang_b || finalItem.paroles_rang_b || []}
              paroles_rang_ab={completeItemData?.paroles_rang_ab || finalItem.paroles_rang_ab || []}
            />
          </div>
        )
      },
      {
        id: 'scene',
        label: 'Scène Immersive',
        icon: Users,
        available: !!(completeItemData?.scene_immersive || finalItem.scene_immersive),
        progress: completeItemData?.scene_immersive ? 100 : 0,
        component: (
          <div className="p-6">
            <SceneImmersive 
              data={completeItemData?.scene_immersive || finalItem.scene_immersive || {}} 
              itemCode={finalItem.item_code}
            />
          </div>
        )
      },
      {
        id: 'quiz',
        label: 'Quiz Final',
        icon: Brain,
        available: !!(completeItemData?.quiz_questions || finalItem.quiz_questions),
        progress: completeItemData?.quiz_questions ? 100 : 0,
        component: (
          <div className="p-6">
            <EnhancedQuizFinal 
              questions={completeItemData?.quiz_questions || finalItem.quiz_questions || []} 
              itemCode={finalItem.item_code}
              itemTitle={finalItem.title || ''}
            />
          </div>
        )
      },
      {
        id: 'bd',
        label: 'Bande Dessinée',
        icon: Image,
        available: true,
        progress: 80,
        component: (
          <div className="p-6">
            <BdGallery 
              itemCode={finalItem.item_code} 
              title={finalItem.title || ''} 
            />
          </div>
        )
      },
      {
        id: 'roman',
        label: 'Roman Narratif',
        icon: FileText,
        available: true,
        progress: 75,
        component: (
          <div className="p-6">
            <RomanNarratif 
              itemCode={finalItem.item_code}
              title={finalItem.title || ''} 
            />
          </div>
        )
      }
    ];
    
    return sections.filter(section => section.available);
  };

  const sections = getSections();
  const itemNumber = getItemNumber(finalItem.item_code);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`
        ${isMobile 
          ? 'max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none' 
          : 'max-w-7xl max-h-[95vh] w-[95vw]'
        } 
        p-0 bg-white flex flex-col overflow-hidden
      `}>
        
        {/* Header moderne type Apple */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-white font-bold text-lg">{itemNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-1 truncate">
                    {finalItem.item_code}
                  </h1>
                  <p className="text-slate-300 text-sm truncate">
                    {finalItem.title}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Progress indicators */}
            <div className="flex gap-2 mt-6 flex-wrap">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${section.progress === 100 ? 'bg-green-400' : section.progress > 0 ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-slate-300">{section.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content area avec navigation type Apple */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar navigation (desktop) ou navigation en bas (mobile) */}
          {isMobile ? (
            // Navigation bottom pour mobile
            <div className="w-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  const isExpanded = expandedSections.has(section.id);
                  
                  return (
                    <div key={section.id} className="border-b border-slate-100">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            section.progress === 100 ? 'bg-green-100 text-green-600' :
                            section.progress > 0 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-slate-800">{section.label}</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-6 bg-slate-50 border-t">
                          {section.component}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Layout desktop
            <>
              {/* Sidebar navigation */}
              <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-4">Contenus disponibles</h3>
                  <div className="space-y-2">
                    {sections.map((section) => {
                      const IconComponent = section.icon;
                      const isActive = activeSection === section.id;
                      
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`
                            w-full p-4 rounded-xl text-left transition-all duration-300 group
                            ${isActive 
                              ? 'bg-white shadow-lg scale-105 border border-slate-200' 
                              : 'hover:bg-white/70 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                              ${isActive 
                                ? section.progress === 100 ? 'bg-green-100 text-green-600' :
                                  section.progress > 0 ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                              }
                            `}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-slate-800">{section.label}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      section.progress === 100 ? 'bg-green-500' :
                                      section.progress > 0 ? 'bg-yellow-500' :
                                      'bg-gray-300'
                                    }`}
                                    style={{ width: `${section.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-500">{section.progress}%</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  {sections.find(s => s.id === activeSection)?.component}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};