import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/utils";
import type { Quiz, Question } from "@shared/schema";

interface QuizInterfaceProps {
  quiz: Quiz;
  questions: Question[];
  onClose: () => void;
  onComplete: (result: { score: number; correctAnswers: number; timeSpent: number }) => void;
}

export default function QuizInterface({ quiz, questions, onClose, onComplete }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return quiz.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    let newScore = score;
    let newCorrectAnswers = correctAnswers;

    // Check if answer is correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      newScore += currentQuestion.points;
      newCorrectAnswers += 1;
      setScore(newScore);
      setCorrectAnswers(newCorrectAnswers);
    }

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeRemaining(quiz.timeLimit);
    } else {
      // Quiz completed
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        score: newScore,
        correctAnswers: newCorrectAnswers,
        timeSpent
      });
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="score-animation">Score: {score}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.questionText}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedAnswer === index
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-primary hover:bg-blue-50"
                  }`}
                >
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)})
                  </span>{" "}
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={16} />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="btn-gradient-primary px-6 py-2"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
