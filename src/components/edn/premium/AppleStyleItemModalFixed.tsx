import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export const AppleStyleItemModalFixed: React.FC<AppleStyleItemModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [completeItemData, setCompleteItemData] = useState<any>(null);
  const isMobile = useIsMobile();

  // Utiliser les données passées en props ou récupérer depuis la base
  const finalItem = completeItemData || item;

  // Récupérer les données complètes OIC
  useEffect(() => {
    const fetchCompleteData = async () => {
      if (!item?.item_code) return;
      
      try {
        const { data: completeData } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('item_code', item.item_code)
          .single();
        
        if (completeData) {
          console.log('✅ Données complètes récupérées:', completeData);
          setCompleteItemData(completeData);
        }
      } catch (error) {
        console.error('❌ Erreur récupération données complètes:', error);
      }
    };
    
    if (isOpen) {
      fetchCompleteData();
    }
  }, [item?.item_code, isOpen]);

  const getItemNumber = (itemCode: string) => {
    return itemCode?.replace('IC-', '') || '0';
  };

  const getCompletionBadge = () => {
    const hasRangA = !!(finalItem?.tableau_rang_a || finalItem?.competences_oic_rang_a);
    const hasRangB = !!(finalItem?.tableau_rang_b || finalItem?.competences_oic_rang_b);
    const hasMusic = !!finalItem?.paroles_musicales;
    const hasScene = !!finalItem?.scene_immersive;
    const hasQuiz = !!finalItem?.quiz_questions;

    const totalFeatures = 5;
    const completedFeatures = [hasRangA, hasRangB, hasMusic, hasScene, hasQuiz].filter(Boolean).length;
    const percentage = Math.round((completedFeatures / totalFeatures) * 100);

    if (percentage === 100) {
      return {
        text: 'Complet',
        color: 'bg-green-50 text-green-700 border-green-200',
        variant: 'default' as const,
        icon: <CheckCircle className="h-3 w-3" />
      };
    } else if (percentage >= 75) {
      return {
        text: `${percentage}% Avancé`,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        variant: 'secondary' as const,
        icon: <Star className="h-3 w-3" />
      };
    } else {
      return {
        text: `${percentage}% En cours`,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        variant: 'outline' as const,
        icon: <ChevronDown className="h-3 w-3" />
      };
    }
  };

  const getSections = (): Section[] => {
    const sections: Section[] = [
      {
        id: 'overview',
        label: 'Aperçu Général',
        icon: BookOpen,
        available: true,
        progress: 100,
        component: (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {finalItem?.title}
              </h1>
              <p className="text-slate-600">
                {finalItem?.subtitle || 'Item de connaissance EDN'}
              </p>
            </div>
            
            {finalItem?.pitch_intro && (
              <div className="bg-slate-50 rounded-lg p-6">
                <p className="text-slate-700 leading-relaxed">{finalItem.pitch_intro}</p>
              </div>
            )}
          </div>
        )
      },
      {
        id: 'rang-a',
        label: 'Compétences Rang A',
        icon: BookOpen,
        available: !!(finalItem?.tableau_rang_a || finalItem?.competences_oic_rang_a),
        progress: finalItem?.tableau_rang_a ? 100 : 0,
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
              ✅ NOUVEAU: Chargement des compétences OIC RÉELLES depuis backup_oic_competences pour {finalItem?.item_code} Rang A
            </div>
            <TableauCompetencesOICWithRealData 
              itemCode={finalItem?.item_code || ''} 
              rang="A" 
            />
          </div>
        )
      },
      {
        id: 'rang-b',
        label: 'Compétences Rang B',
        icon: Brain,
        available: !!(finalItem?.tableau_rang_b || finalItem?.competences_oic_rang_b),
        progress: finalItem?.tableau_rang_b ? 100 : 0,
        component: (
          <div className="p-6">
            <div style={{ 
              padding: '15px', 
              background: '#f3e8ff', 
              border: '2px solid #a855f7',
              marginBottom: '20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#581c87'
            }}>
              ✅ NOUVEAU: Chargement des compétences OIC RÉELLES depuis backup_oic_competences pour {finalItem?.item_code} Rang B
            </div>
            <TableauCompetencesOICWithRealData 
              itemCode={finalItem?.item_code || ''} 
              rang="B" 
            />
          </div>
        )
      },
      {
        id: 'music',
        label: 'Génération Musicale',
        icon: Music,
        available: true, // Toujours disponible pour permettre la génération
        progress: (finalItem?.paroles_musicales && finalItem.paroles_musicales.length > 0) ? 100 : 0,
        component: (
          <div className="p-6">
            <ParolesMusicales 
              itemCode={finalItem?.item_code}
              paroles_rang_a={finalItem?.paroles_rang_a || []}
              paroles_rang_b={finalItem?.paroles_rang_b || []}
              paroles_rang_ab={finalItem?.paroles_rang_ab || []}
              paroles={finalItem?.paroles_musicales || []}
              tableauRangA={finalItem?.tableau_rang_a}
              tableauRangB={finalItem?.tableau_rang_b}
            />
          </div>
        )
      },
      {
        id: 'scene',
        label: 'Scène Immersive',
        icon: Users,
        available: !!finalItem?.scene_immersive,
        progress: finalItem?.scene_immersive ? 100 : 0,
        component: (
          <div className="p-6">
            <SceneImmersive 
              data={finalItem?.scene_immersive || {}} 
              itemCode={finalItem?.item_code}
            />
          </div>
        )
      },
      {
        id: 'quiz',
        label: 'Quiz Final',
        icon: Brain,
        available: !!finalItem?.quiz_questions,
        progress: finalItem?.quiz_questions ? 100 : 0,
        component: (
          <div className="p-6">
            <EnhancedQuizFinal 
              questions={finalItem?.quiz_questions || []} 
              itemCode={finalItem?.item_code}
              itemTitle={finalItem?.title || ''}
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
              itemCode={finalItem?.item_code} 
              title={finalItem?.title || ''} 
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
              itemCode={finalItem?.item_code}
              title={finalItem?.title || ''} 
            />
          </div>
        )
      }
    ];
    
    return sections.filter(section => section.available);
  };

  const sections = getSections();
  const itemNumber = getItemNumber(finalItem?.item_code);
  const completionBadge = getCompletionBadge();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`
        ${isMobile 
          ? 'max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none' 
          : 'max-w-7xl max-h-[95vh] w-[95vw]'
        } 
        p-0 bg-white flex flex-col overflow-hidden
      `}>
        
        {/* Header moderne */}
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
                    {finalItem?.item_code}
                  </h1>
                  <p className="text-slate-300 text-sm truncate">
                    {finalItem?.title}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant={completionBadge.variant}
                  className={`${completionBadge.color} border px-3 py-1`}
                >
                  {completionBadge.icon}
                  <span className="ml-1">{completionBadge.text}</span>
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
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

        {/* Content area avec navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar navigation (desktop) */}
          {!isMobile && (
            <div className="w-80 bg-slate-50 border-r border-slate-200 overflow-y-auto">
              <div className="p-4 space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                        isActive 
                          ? 'bg-white shadow-md border border-slate-200' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-100' : 'bg-slate-200'}`}>
                        <IconComponent className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{section.label}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {section.progress === 100 ? '✓ Complet' : `${section.progress}%`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {sections.find(s => s.id === activeSection)?.component}
          </div>

          {/* Mobile navigation */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2">
              <div className="flex gap-1 overflow-x-auto">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex-shrink-0 p-3 rounded-lg transition-all ${
                        isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-slate-900' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};