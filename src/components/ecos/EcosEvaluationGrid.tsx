import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, FileText, Save } from 'lucide-react';
import { useState } from 'react';

interface EvaluationCriteria {
  id: string;
  category: string;
  description: string;
  points: number;
  isRequired: boolean;
}

interface EcosEvaluationGridProps {
  scenarioId: string;
  scenarioTitle: string;
  onComplete?: (score: number, totalPoints: number, checkedItems: string[]) => void;
}

// Grille d'évaluation ECOS officielle UNESS - critères génériques
const defaultCriteria: EvaluationCriteria[] = [
  // Communication
  { id: 'comm-1', category: 'Communication', description: 'Se présente au patient', points: 1, isRequired: true },
  { id: 'comm-2', category: 'Communication', description: 'Explique le motif de la consultation', points: 1, isRequired: false },
  { id: 'comm-3', category: 'Communication', description: 'Utilise un langage adapté au patient', points: 2, isRequired: true },
  { id: 'comm-4', category: 'Communication', description: 'Écoute active et reformulation', points: 2, isRequired: false },
  { id: 'comm-5', category: 'Communication', description: 'Vérifie la compréhension du patient', points: 1, isRequired: false },
  
  // Interrogatoire
  { id: 'int-1', category: 'Interrogatoire', description: 'Recherche le motif principal', points: 2, isRequired: true },
  { id: 'int-2', category: 'Interrogatoire', description: 'Caractérise les symptômes (ATCD, durée, intensité)', points: 3, isRequired: true },
  { id: 'int-3', category: 'Interrogatoire', description: 'Recherche les antécédents pertinents', points: 2, isRequired: true },
  { id: 'int-4', category: 'Interrogatoire', description: 'Recherche les traitements en cours', points: 1, isRequired: false },
  { id: 'int-5', category: 'Interrogatoire', description: 'Recherche les allergies', points: 1, isRequired: true },
  { id: 'int-6', category: 'Interrogatoire', description: 'Explore le mode de vie (tabac, alcool)', points: 1, isRequired: false },
  
  // Examen clinique
  { id: 'exam-1', category: 'Examen clinique', description: 'Prend les constantes vitales', points: 2, isRequired: true },
  { id: 'exam-2', category: 'Examen clinique', description: 'Réalise un examen général', points: 2, isRequired: true },
  { id: 'exam-3', category: 'Examen clinique', description: 'Examen ciblé et pertinent', points: 3, isRequired: true },
  { id: 'exam-4', category: 'Examen clinique', description: 'Recherche les signes de gravité', points: 3, isRequired: true },
  { id: 'exam-5', category: 'Examen clinique', description: 'Respecte la pudeur du patient', points: 1, isRequired: false },
  
  // Raisonnement
  { id: 'reas-1', category: 'Raisonnement', description: 'Formule des hypothèses diagnostiques', points: 3, isRequired: true },
  { id: 'reas-2', category: 'Raisonnement', description: 'Hiérarchise les hypothèses', points: 2, isRequired: false },
  { id: 'reas-3', category: 'Raisonnement', description: 'Propose des examens complémentaires pertinents', points: 3, isRequired: true },
  { id: 'reas-4', category: 'Raisonnement', description: 'Justifie ses choix', points: 2, isRequired: false },
  
  // Prise en charge
  { id: 'pec-1', category: 'Prise en charge', description: 'Propose une prise en charge adaptée', points: 3, isRequired: true },
  { id: 'pec-2', category: 'Prise en charge', description: 'Prescrit les traitements nécessaires', points: 2, isRequired: false },
  { id: 'pec-3', category: 'Prise en charge', description: 'Planifie le suivi', points: 1, isRequired: false },
  { id: 'pec-4', category: 'Prise en charge', description: 'Donne des consignes de surveillance', points: 2, isRequired: true },
  { id: 'pec-5', category: 'Prise en charge', description: 'Rédige un courrier/compte-rendu si nécessaire', points: 1, isRequired: false },
];

export const EcosEvaluationGrid = ({ 
  scenarioId, 
  scenarioTitle,
  onComplete 
}: EcosEvaluationGridProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [...new Set(defaultCriteria.map(c => c.category))];
  const totalPoints = defaultCriteria.reduce((sum, c) => sum + c.points, 0);
  const earnedPoints = defaultCriteria
    .filter(c => checkedItems.has(c.id))
    .reduce((sum, c) => sum + c.points, 0);
  const progressPercent = (earnedPoints / totalPoints) * 100;

  const handleCheck = (criteriaId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(criteriaId);
    } else {
      newChecked.delete(criteriaId);
    }
    setCheckedItems(newChecked);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onComplete?.(earnedPoints, totalPoints, Array.from(checkedItems));
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return 'text-success';
    if (percent >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreGrade = (percent: number) => {
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'E';
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Grille d'évaluation ECOS</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{scenarioTitle}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {scenarioId}
          </Badge>
        </div>
        
        {/* Score progress */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score actuel</span>
            <span className={`text-2xl font-bold ${getScoreColor(progressPercent)}`}>
              {earnedPoints}/{totalPoints} pts ({Math.round(progressPercent)}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          {isSubmitted && (
            <Badge className="mt-2" variant={progressPercent >= 60 ? 'default' : 'destructive'}>
              Note: {getScoreGrade(progressPercent)} - {progressPercent >= 60 ? 'Validé' : 'Non validé'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {category}
              <Badge variant="secondary" className="text-xs">
                {defaultCriteria.filter(c => c.category === category && checkedItems.has(c.id)).length}/
                {defaultCriteria.filter(c => c.category === category).length}
              </Badge>
            </h3>
            
            <div className="space-y-2">
              {defaultCriteria
                .filter(c => c.category === category)
                .map(criteria => (
                  <label
                    key={criteria.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      checkedItems.has(criteria.id)
                        ? 'bg-success/10 border-success/30'
                        : 'bg-muted/30 border-transparent hover:bg-muted/50'
                    } ${isSubmitted ? 'pointer-events-none' : ''}`}
                  >
                    <Checkbox
                      checked={checkedItems.has(criteria.id)}
                      onCheckedChange={(checked) => handleCheck(criteria.id, checked as boolean)}
                      disabled={isSubmitted}
                    />
                    <div className="flex-1">
                      <span className="text-sm">{criteria.description}</span>
                      {criteria.isRequired && (
                        <span className="ml-2 text-xs text-destructive">*Obligatoire</span>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {criteria.points} pt{criteria.points > 1 ? 's' : ''}
                    </Badge>
                    {checkedItems.has(criteria.id) && (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    )}
                  </label>
                ))}
            </div>
          </div>
        ))}

        {/* Submit button */}
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit}
            className="w-full gap-2"
            size="lg"
          >
            <Save className="h-5 w-5" />
            Valider mon évaluation
          </Button>
        ) : (
          <div className="p-4 bg-primary/5 rounded-lg text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
            <p className="font-semibold">Évaluation enregistrée !</p>
            <p className="text-sm text-muted-foreground mt-1">
              Score final: {earnedPoints}/{totalPoints} points ({Math.round(progressPercent)}%)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
