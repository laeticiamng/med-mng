
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

interface QuizSectionProps {
  questions: QuizQuestion[];
  answers: { [key: number]: string };
  onAnswerChange: (questionIndex: number, answer: string) => void;
}

export const QuizSection = ({ questions, answers, onAnswerChange }: QuizSectionProps) => {
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
                      onChange={(e) => onAnswerChange(index, e.target.value)}
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
          <Link to="/ecos">
            <Button className="bg-success hover:bg-success/90 text-success-foreground">
              🏥 Autres stations ECOS
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
