import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, BookOpen, Clock, GraduationCap, Loader2, Play, Shield, Target, Timer } from 'lucide-react';
import { useState } from 'react';

export interface EDNExamConfig {
  questionCount: number;
  timerMinutes: number;
  questionTypes: ('QCM' | 'QRU' | 'QROC')[];
  difficulty: 'easy' | 'medium' | 'hard' | 'progressive';
  strictTimer: boolean;
  noPause: boolean;
  hideExplanations: boolean;
  penalties: boolean;
  randomOrder: boolean;
  specialties: string[];
}

interface EDNRealConditionsProps {
  onStart: (config: EDNExamConfig) => void;
  loading?: boolean;
}

const PRESETS = {
  ednBlanc: {
    label: 'EDN Blanc Complet',
    description: '120 dossiers, 3h, conditions réelles EDN',
    questionCount: 120,
    timerMinutes: 180,
    questionTypes: ['QCM', 'QRU', 'QROC'] as const,
    difficulty: 'progressive' as const,
    strictTimer: true,
    noPause: true,
    hideExplanations: true,
    penalties: true,
    randomOrder: true,
  },
  sessionRapide: {
    label: 'Session Rapide',
    description: '20 questions, 30min, correction immédiate',
    questionCount: 20,
    timerMinutes: 30,
    questionTypes: ['QCM', 'QRU'] as const,
    difficulty: 'medium' as const,
    strictTimer: false,
    noPause: false,
    hideExplanations: false,
    penalties: false,
    randomOrder: true,
  },
  focusSpecialite: {
    label: 'Focus Spécialité',
    description: '40 questions, 1h, une spécialité',
    questionCount: 40,
    timerMinutes: 60,
    questionTypes: ['QCM', 'QRU', 'QROC'] as const,
    difficulty: 'medium' as const,
    strictTimer: false,
    noPause: false,
    hideExplanations: false,
    penalties: false,
    randomOrder: true,
  },
};

const SPECIALTIES = [
  'Cardiologie', 'Pneumologie', 'Neurologie', 'Gastro-entérologie',
  'Néphrologie', 'Endocrinologie', 'Rhumatologie', 'Dermatologie',
  'Pédiatrie', 'Gynécologie', 'Psychiatrie', 'Urgences',
  'Hématologie', 'Infectiologie', 'Oncologie', 'Ophtalmologie',
  'ORL', 'Médecine interne',
];

export const EDNRealConditions: React.FC<EDNRealConditionsProps> = ({
  onStart,
  loading = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('ednBlanc');
  const [config, setConfig] = useState<EDNExamConfig>({
    ...PRESETS.ednBlanc,
    questionTypes: [...PRESETS.ednBlanc.questionTypes],
    specialties: [],
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey as keyof typeof PRESETS];
    if (preset) {
      setSelectedPreset(presetKey);
      setConfig(prev => ({
        ...prev,
        ...preset,
        questionTypes: [...preset.questionTypes],
        specialties: prev.specialties,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPreset === key ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => applyPreset(key)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                {key === 'ednBlanc' ? <GraduationCap className="h-6 w-6 text-primary" /> :
                 key === 'sessionRapide' ? <Timer className="h-6 w-6 text-primary" /> :
                 <Target className="h-6 w-6 text-primary" />}
              </div>
              <h3 className="font-bold text-sm">{preset.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                <Badge variant="outline" className="text-xs">{preset.questionCount} Q</Badge>
                <Badge variant="outline" className="text-xs">{preset.timerMinutes} min</Badge>
                <Badge variant="outline" className="text-xs">
                  {preset.questionTypes.join('+')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{config.questionCount}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{config.timerMinutes} min</p>
              <p className="text-xs text-muted-foreground">Durée</p>
            </div>
            <div>
              <Target className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">{config.questionTypes.length}</p>
              <p className="text-xs text-muted-foreground">Types</p>
            </div>
            <div>
              <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold">
                {config.strictTimer ? 'Strict' : 'Souple'}
              </p>
              <p className="text-xs text-muted-foreground">Mode</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full"
      >
        {showAdvanced ? 'Masquer' : 'Afficher'} les réglages avancés
      </Button>

      {showAdvanced && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Réglages avancés</CardTitle>
            <CardDescription>Personnalisez votre session d'examen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulté</Label>
              <Select
                value={config.difficulty}
                onValueChange={(v) => setConfig(prev => ({ ...prev, difficulty: v as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                  <SelectItem value="progressive">Progressif (adaptatif)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question count */}
            <div className="space-y-2">
              <Label>Nombre de questions</Label>
              <Select
                value={config.questionCount.toString()}
                onValueChange={(v) => setConfig(prev => ({ ...prev, questionCount: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 (rapide)</SelectItem>
                  <SelectItem value="20">20 (court)</SelectItem>
                  <SelectItem value="40">40 (moyen)</SelectItem>
                  <SelectItem value="60">60 (long)</SelectItem>
                  <SelectItem value="80">80 (intensif)</SelectItem>
                  <SelectItem value="120">120 (EDN complet)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timer */}
            <div className="space-y-2">
              <Label>Durée (minutes)</Label>
              <Select
                value={config.timerMinutes.toString()}
                onValueChange={(v) => setConfig(prev => ({ ...prev, timerMinutes: parseInt(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                  <SelectItem value="180">3 heures (EDN)</SelectItem>
                  <SelectItem value="240">4 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialty filter */}
            <div className="space-y-2">
              <Label>Spécialités ({config.specialties.length === 0 ? 'toutes' : config.specialties.length})</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map(spec => (
                  <Badge
                    key={spec}
                    variant={config.specialties.includes(spec) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        specialties: prev.specialties.includes(spec)
                          ? prev.specialties.filter(s => s !== spec)
                          : [...prev.specialties, spec]
                      }));
                    }}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Timer strict</Label>
                  <p className="text-xs text-muted-foreground">Passage automatique à la fin du temps</p>
                </div>
                <Switch
                  checked={config.strictTimer}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, strictTimer: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Interdire la pause</Label>
                  <p className="text-xs text-muted-foreground">Conditions EDN réelles</p>
                </div>
                <Switch
                  checked={config.noPause}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, noPause: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Masquer les explications</Label>
                  <p className="text-xs text-muted-foreground">Correction en fin d'examen uniquement</p>
                </div>
                <Switch
                  checked={config.hideExplanations}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, hideExplanations: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Points négatifs</Label>
                  <p className="text-xs text-muted-foreground">-1/3 pour les réponses incorrectes</p>
                </div>
                <Switch
                  checked={config.penalties}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, penalties: v }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EDN Warning */}
      {config.strictTimer && config.noPause && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Conditions EDN réelles activées</h4>
              <p className="text-xs text-muted-foreground">
                Timer strict, pas de pause, explications masquées. Comme le jour J.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start */}
      <Button
        size="lg"
        className="w-full gap-2"
        onClick={() => onStart(config)}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Préparation de l'examen...
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Lancer l'examen ({config.questionCount} questions, {config.timerMinutes} min)
          </>
        )}
      </Button>
    </div>
  );
};
