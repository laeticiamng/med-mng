import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Zap, Settings, Play } from 'lucide-react';

interface QuizSelectorProps {
  itemCode: string;
  itemTitle: string;
  totalQuestions: number;
  onStartQuiz: (config: QuizConfig) => void;
}

export interface QuizConfig {
  numberOfQuestions: number;
  questionType: 'rang-a' | 'rang-b' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const QuizSelector: React.FC<QuizSelectorProps> = ({
  itemCode,
  itemTitle,
  totalQuestions,
  onStartQuiz
}) => {
  const [config, setConfig] = useState<QuizConfig>({
    numberOfQuestions: 10,
    questionType: 'mixed',
    difficulty: 'medium'
  });

  const questionOptions = [5, 10, 15, 20, 25, 30, 40, 50];
  const maxQuestions = Math.min(totalQuestions, 50);

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-blue-800">
          <Settings className="h-6 w-6" />
          Configuration du Quiz - {itemCode}
        </CardTitle>
        <CardDescription>
          Personnalisez votre expérience de quiz pour {itemTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Informations sur l'item */}
        <div className="bg-white/60 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-800">Informations</h3>
            <Badge variant="secondary">{totalQuestions} questions total</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded border">
              <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">Item {itemCode}</div>
              <div className="text-gray-600">Compétences médicales</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="font-medium">Rang A & B</div>
              <div className="text-gray-600">Niveaux disponibles</div>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <Zap className="h-6 w-6 mx-auto mb-2 text-amber-600" />
              <div className="font-medium">QCM Adaptatif</div>
              <div className="text-gray-600">Génération d'erreurs</div>
            </div>
          </div>
        </div>

        {/* Configuration du nombre de questions */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-800">
            Nombre de questions
          </label>
          <Select
            value={config.numberOfQuestions.toString()}
            onValueChange={(value) => setConfig({
              ...config,
              numberOfQuestions: parseInt(value)
            })}
          >
            <SelectTrigger className="bg-white/60 border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {questionOptions
                .filter(num => num <= maxQuestions)
                .map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} questions {num === maxQuestions ? '(Maximum)' : ''}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type de questions */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-800">
            Type de compétences
          </label>
          <Select
            value={config.questionType}
            onValueChange={(value: 'rang-a' | 'rang-b' | 'mixed') => setConfig({
              ...config,
              questionType: value
            })}
          >
            <SelectTrigger className="bg-white/60 border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rang-a">
                Rang A uniquement (Compétences fondamentales)
              </SelectItem>
              <SelectItem value="rang-b">
                Rang B uniquement (Compétences approfondies)
              </SelectItem>
              <SelectItem value="mixed">
                Mixte Rang A + B (Recommandé)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Niveau de difficulté */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-blue-800">
            Niveau de difficulté
          </label>
          <Select
            value={config.difficulty}
            onValueChange={(value: 'easy' | 'medium' | 'hard') => setConfig({
              ...config,
              difficulty: value
            })}
          >
            <SelectTrigger className="bg-white/60 border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">
                Facile - Questions directes
              </SelectItem>
              <SelectItem value="medium">
                Moyen - Questions standards (Recommandé)
              </SelectItem>
              <SelectItem value="hard">
                Difficile - Questions piège et cas complexes
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Résumé de la configuration */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Résumé de votre quiz</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Questions :</span>
              <span className="font-medium">{config.numberOfQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Type :</span>
              <span className="font-medium">
                {config.questionType === 'mixed' ? 'Rang A + B' :
                 config.questionType === 'rang-a' ? 'Rang A' : 'Rang B'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Difficulté :</span>
              <span className="font-medium capitalize">{config.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Durée estimée :</span>
              <span className="font-medium">{Math.ceil(config.numberOfQuestions * 1.5)} min</span>
            </div>
          </div>
        </div>

        {/* Bouton de lancement */}
        <Button
          onClick={() => onStartQuiz(config)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3"
          size="lg"
        >
          <Play className="h-5 w-5 mr-2" />
          Commencer le Quiz
        </Button>
      </CardContent>
    </Card>
  );
};