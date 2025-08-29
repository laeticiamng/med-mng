import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, Bookmark, Share2, Download, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComicPanel {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  competences: string[];
  dialogue: string[];
  medicalConcepts: string[];
  interactiveElements: InteractiveElement[];
  difficulty: 'facile' | 'moyen' | 'difficile';
}

interface InteractiveElement {
  id: string;
  type: 'hotspot' | 'question' | 'definition';
  position: { x: number; y: number };
  content: string;
  competence: string;
  feedback?: string;
}

interface AdvancedBandeDessineeProps {
  itemData: {
    title: string;
    subtitle: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  competences: string[];
}

export const AdvancedBandeDessinee = ({ itemData, competences }: AdvancedBandeDessineeProps) => {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [completedInteractions, setCompletedInteractions] = useState<Set<string>>(new Set());
  const [selectedHotspot, setSelectedHotspot] = useState<InteractiveElement | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'single' | 'double' | 'scroll'>('single');
  const [showCompetenceMap, setShowCompetenceMap] = useState(false);

  // Génération des panels adaptatifs selon les compétences
  const generateComicPanels = (): ComicPanel[] => {
    const basePanels: ComicPanel[] = [
      {
        id: 'intro',
        title: 'Présentation du cas',
        content: 'Notre histoire commence dans un service hospitalier...',
        imageUrl: '/api/placeholder/600/400',
        competences: ['Anamnèse', 'Communication'],
        dialogue: [
          "Bonjour, je suis le Dr. Martin.",
          "Nous allons explorer ensemble ce cas clinique.",
          "Chaque détail compte dans notre analyse."
        ],
        medicalConcepts: ['Approche clinique', 'Relation patient-médecin'],
        interactiveElements: [
          {
            id: 'stethoscope',
            type: 'hotspot',
            position: { x: 40, y: 60 },
            content: 'Stéthoscope - Outil essentiel d\'auscultation',
            competence: 'Examen clinique'
          }
        ],
        difficulty: 'facile'
      }
    ];

    // Adaptation selon les compétences spécifiques
    if (competences.includes('Cardiologie')) {
      basePanels.push({
        id: 'cardiac-case',
        title: 'Urgence Cardiologique',
        content: 'Le patient présente des douleurs thoraciques...',
        imageUrl: '/api/placeholder/600/400',
        competences: ['Cardiologie', 'Urgences'],
        dialogue: [
          "Douleur thoracique aiguë depuis 2 heures",
          "Irradiation vers le bras gauche",
          "Sueurs profuses et nausées"
        ],
        medicalConcepts: ['Syndrome coronarien aigu', 'ECG', 'Biomarqueurs'],
        interactiveElements: [
          {
            id: 'ecg-trace',
            type: 'question',
            position: { x: 70, y: 30 },
            content: 'Analysez ce tracé ECG',
            competence: 'Interprétation ECG',
            feedback: 'Sus-décalage en dérivations inférieures'
          },
          {
            id: 'chest-pain',
            type: 'definition',
            position: { x: 50, y: 70 },
            content: 'Douleur thoracique typique : constrictive, rétrosternale',
            competence: 'Sémiologie'
          }
        ],
        difficulty: 'moyen'
      });
    }

    if (competences.includes('Neurologie')) {
      basePanels.push({
        id: 'neuro-case',
        title: 'Examen Neurologique',
        content: 'Évaluation des fonctions neurologiques...',
        imageUrl: '/api/placeholder/600/400',
        competences: ['Neurologie', 'Examen clinique'],
        dialogue: [
          "Testez les réflexes ostéotendineux",
          "Évaluez la force musculaire",
          "Recherchez des signes pyramidaux"
        ],
        medicalConcepts: ['Réflexes', 'Tonus musculaire', 'Sensibilité'],
        interactiveElements: [
          {
            id: 'reflex-hammer',
            type: 'hotspot',
            position: { x: 30, y: 50 },
            content: 'Marteau à réflexes - Test des ROT',
            competence: 'Examen neurologique'
          }
        ],
        difficulty: 'moyen'
      });
    }

    return basePanels;
  };

  const [comicPanels, setComicPanels] = useState<ComicPanel[]>(generateComicPanels());

  useEffect(() => {
    const progress = ((currentPanel + 1) / comicPanels.length) * 100;
    setReadingProgress(progress);
  }, [currentPanel, comicPanels.length]);

  const handleInteraction = (element: InteractiveElement) => {
    setSelectedHotspot(element);
    setCompletedInteractions(prev => new Set([...prev, element.id]));
  };

  const toggleBookmark = () => {
    setBookmarks(prev => 
      prev.includes(currentPanel) 
        ? prev.filter(p => p !== currentPanel)
        : [...prev, currentPanel]
    );
  };

  const InteractiveHotspot = ({ element }: { element: InteractiveElement }) => {
    const isCompleted = completedInteractions.has(element.id);
    
    return (
      <motion.div
        className={`absolute cursor-pointer ${
          element.type === 'question' ? 'w-8 h-8' : 'w-6 h-6'
        }`}
        style={{
          left: `${element.position.x}%`,
          top: `${element.position.y}%`,
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleInteraction(element)}
      >
        <div className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
          isCompleted 
            ? 'bg-green-500 border-green-400' 
            : element.type === 'question'
            ? 'bg-yellow-500 border-yellow-400 animate-pulse'
            : 'bg-blue-500 border-blue-400'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : element.type === 'question' ? (
            <span className="text-white text-xs font-bold">?</span>
          ) : (
            <Lightbulb className="w-3 h-3 text-white" />
          )}
        </div>
        
        {/* Badge de compétence */}
        <Badge 
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap"
          variant={isCompleted ? "default" : "secondary"}
        >
          {element.competence}
        </Badge>
      </motion.div>
    );
  };

  const CompetenceMapOverlay = () => {
    if (!showCompetenceMap) return null;

    const competenceStats = competences.map(comp => {
      const totalElements = comicPanels.reduce((acc, panel) => 
        acc + panel.interactiveElements.filter(el => el.competence === comp).length, 0
      );
      const completedElements = comicPanels.reduce((acc, panel) => 
        acc + panel.interactiveElements.filter(el => 
          el.competence === comp && completedInteractions.has(el.id)
        ).length, 0
      );
      
      return {
        name: comp,
        progress: totalElements > 0 ? (completedElements / totalElements) * 100 : 0,
        total: totalElements,
        completed: completedElements
      };
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={() => setShowCompetenceMap(false)}
      >
        <Card className="max-w-2xl w-full mx-4 p-6">
          <h3 className="text-xl font-semibold mb-4">Carte des Compétences</h3>
          <div className="space-y-4">
            {competenceStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.completed}/{stat.total}
                  </span>
                </div>
                <Progress value={stat.progress} className="h-2" />
              </div>
            ))}
          </div>
          <Button 
            onClick={() => setShowCompetenceMap(false)}
            className="mt-4 w-full"
          >
            Continuer la lecture
          </Button>
        </Card>
      </motion.div>
    );
  };

  const currentPanelData = comicPanels[currentPanel];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <Progress value={readingProgress} className="h-1 rounded-none" />
      </div>

      {/* Contrôles supérieurs */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={toggleBookmark}>
            <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentPanel) ? 'fill-current' : ''}`} />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCompetenceMap(true)}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="bg-secondary text-foreground px-3 py-1 rounded-md text-sm"
          >
            <option value="single">Panel unique</option>
            <option value="double">Double page</option>
            <option value="scroll">Défilement</option>
          </select>
        </div>
      </div>

      {/* Panel principal */}
      <div className="flex items-center justify-center h-full p-8">
        <div className="relative max-w-4xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPanel}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <Card className="overflow-hidden shadow-2xl border-4 border-slate-800 dark:border-slate-200">
                {/* En-tête du panel */}
                <div className="bg-primary/10 p-4 border-b-2 border-slate-800 dark:border-slate-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{currentPanelData?.title}</h2>
                    <Badge variant="outline">
                      Panel {currentPanel + 1}/{comicPanels.length}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentPanelData?.competences.map((comp) => (
                      <Badge key={comp} variant="secondary" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Image du panel avec éléments interactifs */}
                <div className="relative aspect-[3/2] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-600">
                  <img
                    src={currentPanelData?.imageUrl}
                    alt={currentPanelData?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100%" height="100%" fill="#f1f5f9"/>
                          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#64748b">
                            ${currentPanelData?.title}
                          </text>
                        </svg>
                      `)}`;
                    }}
                  />
                  
                  {/* Éléments interactifs */}
                  {currentPanelData?.interactiveElements.map((element) => (
                    <InteractiveHotspot key={element.id} element={element} />
                  ))}
                </div>

                {/* Contenu et dialogue */}
                <div className="p-6 space-y-4">
                  <p className="text-lg leading-relaxed">{currentPanelData?.content}</p>
                  
                  {/* Bulles de dialogue */}
                  <div className="space-y-2">
                    {currentPanelData?.dialogue.map((line, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.5 }}
                        className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border-l-4 border-primary"
                      >
                        <p className="italic">"{line}"</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Concepts médicaux */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Concepts clés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPanelData?.medicalConcepts.map((concept) => (
                        <Badge key={concept} variant="outline">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          variant="secondary"
          onClick={() => setCurrentPanel(Math.max(0, currentPanel - 1))}
          disabled={currentPanel === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        <Button
          variant="secondary"
          onClick={() => setCurrentPanel(Math.min(comicPanels.length - 1, currentPanel + 1))}
          disabled={currentPanel === comicPanels.length - 1}
        >
          Suivant
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Modal d'interaction */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedHotspot(null)}
          >
            <Card className="max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <Badge>{selectedHotspot.competence}</Badge>
                <Badge variant="outline">{selectedHotspot.type}</Badge>
              </div>
              <p className="text-lg mb-4">{selectedHotspot.content}</p>
              {selectedHotspot.feedback && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    💡 {selectedHotspot.feedback}
                  </p>
                </div>
              )}
              <Button onClick={() => setSelectedHotspot(null)} className="w-full">
                Compris !
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Carte des compétences */}
      <AnimatePresence>
        <CompetenceMapOverlay />
      </AnimatePresence>
    </div>
  );
};