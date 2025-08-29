import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Settings, Eye, Brain, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Character {
  id: string;
  name: string;
  role: string;
  dialogue: string[];
  emotion: 'neutral' | 'concerned' | 'focused' | 'relieved';
  position: { x: number; y: number };
}

interface SceneLayer {
  id: string;
  type: 'background' | 'character' | 'medical-equipment' | 'ui-overlay';
  content: string;
  interactive: boolean;
  competences?: string[];
}

interface AdvancedSceneImmersiveProps {
  itemData: {
    title: string;
    subtitle: string;
    item_code: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
  };
  competences: string[];
}

export const AdvancedSceneImmersive = ({ itemData, competences }: AdvancedSceneImmersiveProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [immersionLevel, setImmersionLevel] = useState<'basic' | 'advanced' | 'expert'>('basic');
  const [selectedCompetence, setSelectedCompetence] = useState<string | null>(null);
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement>(null);

  // Génération de personnages adaptatifs selon les compétences
  const generateCharacters = (): Character[] => {
    const baseCharacters: Character[] = [
      {
        id: 'medecin',
        name: 'Dr. Martin',
        role: 'Médecin Senior',
        dialogue: [
          "Analysons cette situation clinique...",
          "Quels sont vos premiers réflexes diagnostiques ?",
          "Observez attentivement les signes cliniques."
        ],
        emotion: 'focused',
        position: { x: 30, y: 40 }
      },
      {
        id: 'patient',
        name: 'Patient',
        role: 'Cas Clinique',
        dialogue: [
          "J'ai des symptômes inquiétants...",
          "Pouvez-vous m'aider à comprendre ?",
          "Je ressens une douleur particulière..."
        ],
        emotion: 'concerned',
        position: { x: 70, y: 50 }
      }
    ];

    // Ajouter des personnages spécialisés selon les compétences
    if (competences.includes('Cardiologie')) {
      baseCharacters.push({
        id: 'cardiologue',
        name: 'Dr. Cardiac',
        role: 'Cardiologue',
        dialogue: [
          "Écoutons attentivement ce rythme cardiaque...",
          "L'ECG révèle des éléments intéressants.",
          "Cette arythmie nécessite notre attention."
        ],
        emotion: 'focused',
        position: { x: 50, y: 30 }
      });
    }

    return baseCharacters;
  };

  const [characters, setCharacters] = useState<Character[]>(generateCharacters());
  const [sceneLayers, setSceneLayers] = useState<SceneLayer[]>([
    {
      id: 'hospital-room',
      type: 'background',
      content: 'Chambre d\'hôpital moderne avec équipements médicaux',
      interactive: false
    },
    {
      id: 'medical-chart',
      type: 'medical-equipment',
      content: 'Dossier médical interactif',
      interactive: true,
      competences: ['Diagnostic', 'Anamnèse']
    }
  ]);

  // Scénarios adaptatifs selon les compétences
  const generateScenario = () => {
    const scenarios = {
      'Cardiologie': {
        setting: 'Service de Cardiologie - USI',
        situation: 'Patient de 58 ans présentant des douleurs thoraciques',
        challenges: ['Diagnostic différentiel', 'Urgence cardiaque', 'Prise en charge'],
        interactions: [
          {
            type: 'choice',
            question: 'Première action à entreprendre ?',
            options: ['ECG immédiat', 'Anamnèse complète', 'Examen physique'],
            correct: 0,
            feedback: 'L\'ECG est prioritaire en cas de douleur thoracique'
          }
        ]
      },
      'Neurologie': {
        setting: 'Service de Neurologie',
        situation: 'Patient présentant des troubles de la conscience',
        challenges: ['Examen neurologique', 'Échelle de Glasgow', 'Imagerie'],
        interactions: [
          {
            type: 'assessment',
            task: 'Évaluez l\'état de conscience selon Glasgow',
            points: ['Ouverture oculaire', 'Réponse verbale', 'Réponse motrice']
          }
        ]
      }
    };

    const primaryCompetence = competences[0] || 'Médecine Générale';
    return scenarios[primaryCompetence as keyof typeof scenarios] || {
      setting: 'Cabinet Médical',
      situation: 'Consultation de médecine générale',
      challenges: ['Anamnèse', 'Examen clinique', 'Diagnostic'],
      interactions: []
    };
  };

  const [currentScenario, setCurrentScenario] = useState(generateScenario());

  const handleUserChoice = (choiceId: string, value: string) => {
    setUserChoices(prev => ({ ...prev, [choiceId]: value }));
    
    // Adaptation de la scène selon les choix
    if (value === 'ECG immédiat') {
      setSceneLayers(prev => [...prev, {
        id: 'ecg-machine',
        type: 'medical-equipment',
        content: 'Appareil ECG en fonctionnement',
        interactive: true,
        competences: ['Cardiologie', 'Diagnostic']
      }]);
    }
  };

  const renderInteractiveElement = (layer: SceneLayer) => {
    if (!layer.interactive) return null;

    return (
      <motion.div
        className="absolute cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedCompetence(layer.competences?.[0] || null)}
      >
        <div className="relative">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary animate-pulse">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          {layer.competences && (
            <Badge className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              {layer.competences[0]}
            </Badge>
          )}
        </div>
      </motion.div>
    );
  };

  const CompetenceSpotlight = () => {
    if (!selectedCompetence) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={() => setSelectedCompetence(null)}
      >
        <Card className="max-w-md p-6 mx-4">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">{selectedCompetence}</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Focus sur cette compétence clé dans le contexte clinique actuel.
          </p>
          <div className="space-y-2">
            <div className="text-sm font-medium">Points d'attention :</div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Observation méthodique</li>
              <li>• Analyse critique</li>
              <li>• Prise de décision</li>
            </ul>
          </div>
          <Button 
            onClick={() => setSelectedCompetence(null)}
            className="mt-4 w-full"
          >
            Continuer l'immersion
          </Button>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Contrôles de scène */}
      <div className="absolute top-4 left-4 z-40 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowSubtitles(!showSubtitles)}
        >
          {showSubtitles ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Niveau d'immersion */}
      <div className="absolute top-4 right-4 z-40">
        <select
          value={immersionLevel}
          onChange={(e) => setImmersionLevel(e.target.value as any)}
          className="bg-secondary text-foreground px-3 py-1 rounded-md text-sm"
        >
          <option value="basic">Basique</option>
          <option value="advanced">Avancé</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Scène principale */}
      <div className="relative w-full h-full">
        {/* Arrière-plan adaptatif */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900/40" />
        
        {/* Personnages interactifs */}
        <AnimatePresence>
          {characters.map((character) => (
            <motion.div
              key={character.id}
              className="absolute"
              style={{
                left: `${character.position.x}%`,
                top: `${character.position.y}%`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {character.name.charAt(0)}
                </div>
                <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  {character.role}
                </Badge>
                
                {/* Bulle de dialogue */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-xs"
                  >
                    <p className="text-sm text-slate-800">
                      {character.dialogue[currentScene % character.dialogue.length]}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Éléments interactifs */}
        {sceneLayers.map((layer) => renderInteractiveElement(layer))}

        {/* Panel de compétences */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <Card className="p-4 bg-background/90 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-semibold">Compétences visées</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {competences.map((competence) => (
                <Badge
                  key={competence}
                  variant={selectedCompetence === competence ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCompetence(competence)}
                >
                  {competence}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Spotlight sur compétence */}
      <AnimatePresence>
        <CompetenceSpotlight />
      </AnimatePresence>

      {/* Audio de fond */}
      <audio ref={audioRef} loop>
        <source src="/ambient-hospital.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};