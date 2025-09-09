import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdvancedQuizInteractifProps {
  item: {
    id: string;
    title: string;
    quiz_questions?: any;
    item_code: string;
  };
  onProgress?: (progress: number) => void;
}

export const AdvancedQuizInteractif: React.FC<AdvancedQuizInteractifProps> = ({
  item,
  onProgress
}) => {
  const [quizData, setQuizData] = useState(null);
  
  useEffect(() => {
    if (item?.quiz_questions) {
      setQuizData(item.quiz_questions);
    }
  }, [item]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>❓ Quiz Interactif - {item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Quiz médical pour l'item {item.item_code}
          </p>
          {quizData ? (
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p>{JSON.stringify(quizData, null, 2)}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Chargement du quiz...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};