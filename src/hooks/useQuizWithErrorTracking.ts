import { useState, useCallback } from 'react';
import { useQuizErrorTracker } from './useQuizErrorTracker';

interface QuizQuestion {
  question: string;
  options?: string[];
  correct?: number;
  reponse?: string;
  points_cles?: string[];
  affirmation?: string;
  justification?: string;
}

export const useQuizWithErrorTracking = (itemCode: string, itemTitle: string) => {
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  const { addQuizError, endQuizSession } = useQuizErrorTracker();

  const handleAnswer = useCallback((questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const checkAndRecordError = useCallback((
    question: QuizQuestion, 
    questionIndex: number, 
    userAnswer: any, 
    questionType: string
  ) => {
    let isCorrect = false;
    let correctAnswer = '';
    let theme = itemCode || 'Général';

    switch (questionType) {
      case 'qcm':
        isCorrect = userAnswer === question.correct;
        correctAnswer = question.options?.[question.correct || 0] || '';
        break;
      case 'qru':
        const userAnswerText = (userAnswer || '').toLowerCase();
        const expectedAnswer = (question.reponse || '').toLowerCase();
        isCorrect = userAnswerText.includes(expectedAnswer);
        correctAnswer = question.reponse || '';
        break;
      case 'qroc':
        const userText = (userAnswer || '').toLowerCase();
        const matchedPoints = question.points_cles?.filter(point => 
          userText.includes(point.toLowerCase())
        ) || [];
        isCorrect = matchedPoints.length >= 2;
        correctAnswer = question.points_cles?.join(', ') || '';
        break;
      case 'zap':
        isCorrect = userAnswer === question.correct;
        correctAnswer = question.correct ? 'Vrai' : 'Faux';
        break;
    }

    if (!isCorrect) {
      addQuizError({
        questionId: `${questionType}_${questionIndex}`,
        question: question.question || question.affirmation || '',
        userAnswer: typeof userAnswer === 'boolean' ? (userAnswer ? 'Vrai' : 'Faux') : String(userAnswer || ''),
        correctAnswer,
        explanation: question.justification,
        theme
      });
    }

    return isCorrect;
  }, [addQuizError, itemCode]);

  const calculateScoreWithTracking = useCallback((questions: any) => {
    let totalScore = 0;
    const allQuestions: any[] = [];
    
    // Construire la liste de toutes les questions
    if (questions.qcm) {
      allQuestions.push(...questions.qcm.map((q: any, i: number) => ({ ...q, type: 'qcm', id: i })));
    }
    if (questions.qru) {
      const startId = questions.qcm?.length || 0;
      allQuestions.push(...questions.qru.map((q: any, i: number) => ({ ...q, type: 'qru', id: i + startId })));
    }
    if (questions.qroc) {
      const startId = (questions.qcm?.length || 0) + (questions.qru?.length || 0);
      allQuestions.push(...questions.qroc.map((q: any, i: number) => ({ ...q, type: 'qroc', id: i + startId })));
    }
    if (questions.zap) {
      const startId = (questions.qcm?.length || 0) + (questions.qru?.length || 0) + (questions.qroc?.length || 0);
      allQuestions.push(...questions.zap.map((q: any, i: number) => ({ ...q, type: 'zap', id: i + startId })));
    }

    // Vérifier chaque réponse et enregistrer les erreurs
    allQuestions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = checkAndRecordError(question, question.id, userAnswer, question.type);
      if (isCorrect) totalScore++;
    });

    return totalScore;
  }, [answers, checkAndRecordError]);

  const finishQuiz = useCallback((questions: any) => {
    const finalScore = calculateScoreWithTracking(questions);
    setScore(finalScore);
    setShowResults(true);
    
    // Terminer la session de suivi d'erreurs
    endQuizSession(finalScore);
    
    return finalScore;
  }, [calculateScoreWithTracking, endQuizSession]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  }, []);

  return {
    answers,
    currentQuestion,
    showResults,
    score,
    handleAnswer,
    finishQuiz,
    resetQuiz,
    setCurrentQuestion,
    setAnswers,
    setShowResults,
    setScore
  };
};