import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy } from 'lucide-react';

interface QuizInteractifProps {
  item: any;
  questions?: any[];
  onProgress?: (progress: number) => void;
}

export const QuizInteractif: React.FC<QuizInteractifProps> = ({ item, questions, onProgress }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <CardTitle>Quiz Interactif</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg">
          <Trophy className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Évaluation gamifiée</h3>
          <p className="text-muted-foreground mb-4">
            Testez vos connaissances sur {item?.title}
          </p>
          <Badge variant="secondary">Quiz adaptatif en préparation</Badge>
        </div>
      </CardContent>
    </Card>
  );
};