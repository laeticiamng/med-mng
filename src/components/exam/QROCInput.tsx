import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Edit3, XCircle } from 'lucide-react';
import { useState } from 'react';

interface QROCInputProps {
  question: string;
  itemCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedKeywords: string[];
  explanation: string;
  onSubmit: (answer: string, score: number) => void;
  disabled?: boolean;
}

/**
 * QROCInput - Question à Réponse Ouverte Courte
 *
 * Accepts free-text answers and scores them based on keyword matching.
 * Used in EDN exam simulation for open-ended medical questions.
 */
export const QROCInput: React.FC<QROCInputProps> = ({
  question,
  itemCode,
  difficulty,
  expectedKeywords,
  explanation,
  onSubmit,
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missedKeywords, setMissedKeywords] = useState<string[]>([]);

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleSubmit = () => {
    if (!answer.trim() || submitted) return;

    const normalizedAnswer = normalizeText(answer);
    const matched: string[] = [];
    const missed: string[] = [];

    for (const keyword of expectedKeywords) {
      const normalizedKeyword = normalizeText(keyword);
      // Check if any word in the keyword is present in the answer
      const keywordWords = normalizedKeyword.split(' ');
      const isMatch = keywordWords.some(word =>
        word.length > 3 ? normalizedAnswer.includes(word) : normalizedAnswer.split(' ').includes(word)
      );

      if (isMatch) {
        matched.push(keyword);
      } else {
        missed.push(keyword);
      }
    }

    const calculatedScore = expectedKeywords.length > 0
      ? Math.round((matched.length / expectedKeywords.length) * 100)
      : 0;

    setMatchedKeywords(matched);
    setMissedKeywords(missed);
    setScore(calculatedScore);
    setSubmitted(true);
    onSubmit(answer, calculatedScore);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={
            difficulty === 'easy' ? 'secondary' :
            difficulty === 'medium' ? 'default' : 'destructive'
          }>
            {difficulty === 'easy' ? 'Facile' :
             difficulty === 'medium' ? 'Moyen' : 'Difficile'}
          </Badge>
          <Badge variant="outline">{itemCode}</Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            QROC
          </Badge>
        </div>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit3 className="h-4 w-4" />
            <span>Rédigez votre réponse ci-dessous</span>
          </div>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Tapez votre réponse ici..."
            rows={4}
            disabled={submitted || disabled}
            className={submitted ? 'opacity-80' : ''}
          />
          <p className="text-xs text-muted-foreground">
            {answer.length} caractères • Mots-clés attendus : {expectedKeywords.length}
          </p>
        </div>

        {/* Results after submission */}
        {submitted && (
          <div className="space-y-4">
            {/* Score display */}
            <div className={`p-4 rounded-lg ${
              score >= 70 ? 'bg-success/10 border border-success/20' :
              score >= 40 ? 'bg-warning/10 border border-warning/20' :
              'bg-destructive/10 border border-destructive/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold flex items-center gap-2">
                  {score >= 70 ? (
                    <><CheckCircle className="h-4 w-4 text-success" /> Bonne réponse</>
                  ) : score >= 40 ? (
                    <><CheckCircle className="h-4 w-4 text-warning" /> Réponse partielle</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-destructive" /> Réponse insuffisante</>
                  )}
                </h4>
                <Badge variant={score >= 70 ? 'default' : score >= 40 ? 'secondary' : 'destructive'}>
                  {score}%
                </Badge>
              </div>
              <p className="text-sm mb-3">{explanation}</p>
            </div>

            {/* Keywords analysis */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Mots-clés attendus :</h4>
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((kw, i) => (
                  <Badge key={i} className="bg-success/20 text-success border-success/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {kw}
                  </Badge>
                ))}
                {missedKeywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-destructive border-destructive/30">
                    <XCircle className="h-3 w-3 mr-1" />
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {!submitted && (
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || disabled}
            >
              Valider la réponse
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
