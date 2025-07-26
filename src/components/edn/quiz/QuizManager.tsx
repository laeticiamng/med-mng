import React, { useState } from 'react';
import { QuizSelector, QuizConfig } from './QuizSelector';
import { QuizInterface } from './QuizInterface';
import { QuizGenerator } from './QuizGenerator';

interface QuizManagerProps {
  item: {
    id: string;
    item_code: string;
    title: string;
    tableau_rang_a?: any;
    tableau_rang_b?: any;
    quiz_questions?: any;
  };
  onClose?: () => void;
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctAnswers: number;
  wrongAnswers: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  performance: {
    rangA: { correct: number; total: number };
    rangB: { correct: number; total: number };
    easy: { correct: number; total: number };
    medium: { correct: number; total: number };
    hard: { correct: number; total: number };
  };
}

export const QuizManager: React.FC<QuizManagerProps> = ({ item, onClose }) => {
  const [currentView, setCurrentView] = useState<'config' | 'quiz' | 'results'>('config');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);

  // Calculer le nombre total de questions disponibles
  const calculateTotalQuestions = () => {
    let total = 0;
    
    // Compter les questions existantes dans quiz_questions
    if (item.quiz_questions?.questions) {
      total += item.quiz_questions.questions.length;
    }
    
    // Compter les compétences disponibles pour générer des questions
    if (item.tableau_rang_a?.sections) {
      item.tableau_rang_a.sections.forEach((section: any) => {
        if (section.concepts) {
          total += section.concepts.length * 2; // 2 questions par concept
        }
      });
    }
    
    if (item.tableau_rang_b?.sections) {
      item.tableau_rang_b.sections.forEach((section: any) => {
        if (section.concepts) {
          total += section.concepts.length * 2; // 2 questions par concept
        }
      });
    }
    
    // Minimum garanti
    return Math.max(total, 20);
  };

  const handleStartQuiz = (config: QuizConfig) => {
    console.log('🎯 Configuration du quiz:', config);
    
    // Générer les questions selon la configuration
    const generatedQuestions = QuizGenerator.generateQuestions(item, config);
    
    console.log(`🎯 ${generatedQuestions.length} questions générées`);
    
    setQuizConfig(config);
    setQuizQuestions(generatedQuestions);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (results: QuizResults) => {
    console.log('🎯 Quiz terminé:', results);
    setQuizResults(results);
    
    // Optionnel: sauvegarder les résultats
    // saveQuizResults(item.id, results);
  };

  const handleReturnToConfig = () => {
    setCurrentView('config');
    setQuizConfig(null);
    setQuizQuestions([]);
    setQuizResults(null);
  };

  if (currentView === 'config') {
    return (
      <QuizSelector
        itemCode={item.item_code}
        itemTitle={item.title}
        totalQuestions={calculateTotalQuestions()}
        onStartQuiz={handleStartQuiz}
      />
    );
  }

  if (currentView === 'quiz' && quizConfig) {
    return (
      <QuizInterface
        itemCode={item.item_code}
        itemTitle={item.title}
        config={quizConfig}
        questions={quizQuestions}
        onQuizComplete={handleQuizComplete}
        onReturnToConfig={handleReturnToConfig}
      />
    );
  }

  return (
    <div className="p-6 text-center">
      <div className="text-gray-600">Chargement du quiz...</div>
    </div>
  );
};