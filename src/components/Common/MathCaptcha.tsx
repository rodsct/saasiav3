"use client";

import { useEffect, useState } from 'react';

interface MathCaptchaProps {
  onVerify: (answer: string, correctAnswer: number) => void;
  onError?: () => void;
  className?: string;
}

const MathCaptcha: React.FC<MathCaptchaProps> = ({
  onVerify,
  onError,
  className = ''
}) => {
  const [question, setQuestion] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const generateCaptcha = () => {
    setIsLoading(true);
    // Always use client-side generation to avoid API issues
    generateClientSideCaptcha();
    setIsLoading(false);
  };

  const generateClientSideCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let questionText: string;
    let answer: number;
    
    if (operation === '+') {
      questionText = `¿Cuánto es ${num1} + ${num2}?`;
      answer = num1 + num2;
    } else {
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      questionText = `¿Cuánto es ${larger} - ${smaller}?`;
      answer = larger - smaller;
    }
    
    setQuestion(questionText);
    setCorrectAnswer(answer);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserAnswer(value);
    
    // Auto-verify when user enters a number
    if (value && !isNaN(Number(value))) {
      onVerify(value, correctAnswer);
    }
  };

  const handleRefresh = () => {
    setUserAnswer('');
    generateCaptcha();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Generando pregunta...</span>
      </div>
    );
  }

  return (
    <div className={`math-captcha p-4 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Verificación Anti-Spam
        </label>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-primary hover:text-primary/80 text-sm"
          title="Nueva pregunta"
        >
          🔄
        </button>
      </div>
      
      <div className="mb-3">
        <p className="text-base font-medium text-gray-800 dark:text-gray-200">
          {question}
        </p>
      </div>
      
      <input
        type="number"
        value={userAnswer}
        onChange={handleInputChange}
        placeholder="Tu respuesta"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        required
      />
      
      <p className="text-xs text-gray-500 mt-2">
        Resuelve esta operación matemática para continuar
      </p>
    </div>
  );
};

export default MathCaptcha;