import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTE_PATHS } from '@/config/routes';
import { useActivityTracking } from '@/hooks/useActivityTracking';
import { useGamification } from '@/hooks/useGamification';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  answers: { [key: number]: string };
  onAnswerChange: (questionIndex: number, answer: string) => void;
  scenarioId?: string;
}

export const QuizSection = ({ questions, answers, onAnswerChange, scenarioId }: QuizSectionProps) => {
  const { logActivity } = useActivityTracking();
  const { addPoints } = useGamification();

  // Track quiz answer
  const handleAnswerWithTracking = async (questionIndex: number, answer: string) => {
    onAnswerChange(questionIndex, answer);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const isCorrect = questions[questionIndex].correct === parseInt(answer);
      
      await logActivity({
        activity_type: 'exam',
        count: 1,
        score: isCorrect ? 100 : 0,
        metadata: { 
          scenarioId, 
          questionIndex, 
          isCorrect,
          type: 'ecos_quiz'
        }
      });
      
      if (isCorrect) {
        await addPoints(user.id, 'itemReviewed');
      }
    }
  };

  return (
    <Card className="bg-background/5 backdrop-blur-sm border-border/10">
      <div className="p-8">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          📝 Quiz de validation ECOS
        </h2>
        
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-background/20 rounded-lg p-6">
              <h3 className="text-foreground font-semibold mb-4">
                {index + 1}. {question.question}
              </h3>
              <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 cursor-pointer hover:bg-background/5 p-2 rounded">
                        <input
                          type="radio"
                          name={`quiz-${index}`}
                          value={optIndex.toString()}
                          checked={answers[index] === optIndex.toString()}
                          onChange={(e) => handleAnswerWithTracking(index, e.target.value)}
                          className="text-success"
                        />
                        <span className="text-foreground/80">{option}</span>
                      </label>
                    ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link to={ROUTE_PATHS.ecosIndex}>
            <Button className="bg-success hover:bg-success/90 text-success-foreground">
              🏥 Autres stations ECOS
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
