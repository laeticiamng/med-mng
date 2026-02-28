import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import React, { useMemo } from 'react';

interface CompetencyData {
  specialty: string;
  correct: number;
  total: number;
  score: number;
}

interface ExamCompetencyRadarProps {
  answers: Record<string, { selected: number | number[]; correct: boolean; timeSpent: number }>;
  questions: Array<{ id: string; item_code: string; question_text?: string; [key: string]: any }>;
}

export const ExamCompetencyRadar = React.memo(function ExamCompetencyRadar({ answers, questions }: ExamCompetencyRadarProps) {
  const competencies = useMemo(() => {
    const bySpecialty: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (!answer) return;

      // Use item_code prefix as specialty proxy (e.g., "001" → first specialty group)
      const code = q.item_code || 'Inconnu';
      // Group by first 2 digits of item code for specialty clustering
      const prefix = code.replace(/[^0-9]/g, '').slice(0, 2) || 'XX';
      const specialty = ITEM_CODE_SPECIALTIES[prefix] || `Items ${prefix}x`;

      if (!bySpecialty[specialty]) {
        bySpecialty[specialty] = { correct: 0, total: 0 };
      }
      bySpecialty[specialty].total++;
      if (answer.correct) bySpecialty[specialty].correct++;
    });

    return Object.entries(bySpecialty)
      .map(([specialty, data]) => ({
        specialty,
        correct: data.correct,
        total: data.total,
        score: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [answers, questions]);

  if (competencies.length === 0) return null;

  const maxTotal = Math.max(...competencies.map((c) => c.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Score par compétence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {competencies.map((comp) => (
          <div key={comp.specialty} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{comp.specialty}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{comp.correct}/{comp.total}</span>
                <Badge variant={comp.score >= 70 ? 'default' : comp.score >= 50 ? 'secondary' : 'destructive'}>
                  {comp.score}%
                </Badge>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  comp.score >= 70 ? 'bg-primary' : comp.score >= 50 ? 'bg-warning' : 'bg-destructive'
                }`}
                style={{ width: `${comp.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

// Map item code prefixes to specialty names
const ITEM_CODE_SPECIALTIES: Record<string, string> = {
  '01': 'Cardiologie',
  '02': 'Pneumologie',
  '03': 'Gastro-entérologie',
  '04': 'Néphrologie',
  '05': 'Neurologie',
  '06': 'Rhumatologie',
  '07': 'Endocrinologie',
  '08': 'Dermatologie',
  '09': 'Pédiatrie',
  '10': 'Gynécologie',
  '11': 'Psychiatrie',
  '12': 'Urgences',
  '13': 'Chirurgie',
  '14': 'ORL',
  '15': 'Ophtalmologie',
  '16': 'Hématologie',
  '17': 'Oncologie',
  '18': 'Infectiologie',
  '19': 'Médecine interne',
  '20': 'Santé publique',
};
