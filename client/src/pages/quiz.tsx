import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Play, Clock, Target, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuizInterface from "@/components/quiz-interface";
import { getDifficultyColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, Question } from "@shared/schema";

const CURRENT_USER_ID = 1;

export default function QuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const questionsMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const response = await apiRequest("GET", `/api/quiz/${quizId}/questions`);
      return response.json();
    },
    onSuccess: (questions) => {
      setQuizQuestions(questions);
    },
  });

  const submitResultMutation = useMutation({
    mutationFn: async (result: { quizId: number; score: number; correctAnswers: number; timeSpent: number }) => {
      const response = await apiRequest("POST", "/api/quiz/result", {
        userId: CURRENT_USER_ID,
        quizId: result.quizId,
        score: result.score,
        totalQuestions: quizQuestions.length,
        correctAnswers: result.correctAnswers,
        timeSpent: result.timeSpent,
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Quiz Completed! 🎉",
        description: `You scored ${result.score} points!`,
      });
      setSelectedQuiz(null);
      setQuizQuestions([]);
      // Invalidate user stats to refresh dashboard
      queryClient.invalidateQueries({ queryKey: [`/api/user/${CURRENT_USER_ID}/stats`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save quiz result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    questionsMutation.mutate(quiz.id);
  };

  const handleQuizComplete = (result: { score: number; correctAnswers: number; timeSpent: number }) => {
    if (selectedQuiz) {
      submitResultMutation.mutate({
        quizId: selectedQuiz.id,
        ...result,
      });
    }
  };

  const handleCloseQuiz = () => {
    setSelectedQuiz(null);
    setQuizQuestions([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Quizzes</h1>
              <p className="text-gray-600">Test your cybersecurity knowledge across three difficulty levels</p>
            </div>
          </div>
        </div>

        {/* Quiz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.map((quiz: Quiz) => (
            <Card key={quiz.id} className="card-hover">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Target size={14} />
                      <span>{quiz.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{quiz.timeLimit}s per question</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleStartQuiz(quiz)}
                    disabled={questionsMutation.isPending}
                    className="w-full btn-gradient-primary"
                  >
                    <Play size={16} className="mr-2" />
                    {questionsMutation.isPending ? "Starting..." : "Start Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {quizzes && quizzes.length === 0 && (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
            <p className="text-gray-600">Check back later for new quizzes!</p>
          </div>
        )}

        {/* Quiz Interface Modal */}
        {selectedQuiz && quizQuestions.length > 0 && (
          <QuizInterface
            quiz={selectedQuiz}
            questions={quizQuestions}
            onClose={handleCloseQuiz}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    </div>
  );
}
