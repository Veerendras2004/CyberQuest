import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Shield, AlertTriangle, MessageSquare, CheckCircle, XCircle, Clock, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CURRENT_USER_ID = 1;

interface CyberLabResult {
  id: number;
  labType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export default function CyberLabPage() {
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: labResults } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}/cyber-lab-results`],
  });

  const labCompleteMutation = useMutation({
    mutationFn: async (result: {
      labType: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      timeSpent: number;
    }) => {
      const response = await apiRequest("POST", "/api/cyber-lab-results", {
        userId: CURRENT_USER_ID,
        ...result,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${CURRENT_USER_ID}/cyber-lab-results`] });
      setActiveLab(null);
      toast({
        title: "Lab Completed!",
        description: "Your results have been recorded and points added to your score.",
      });
    },
  });

  const labTypes = [
    {
      id: "phishing",
      title: "Phishing Email Detection",
      description: "Learn to identify malicious emails and phishing attempts",
      icon: "📧",
      difficulty: "Beginner",
      estimatedTime: "10-15 minutes",
      color: "blue"
    },
    {
      id: "malware",
      title: "Malware Analysis Simulation",
      description: "Analyze suspicious files and identify malware characteristics",
      icon: "🦠",
      difficulty: "Intermediate",
      estimatedTime: "15-20 minutes",
      color: "red"
    },
    {
      id: "social_engineering",
      title: "Social Engineering Defense",
      description: "Practice recognizing and responding to social engineering attacks",
      icon: "🎭",
      difficulty: "Advanced",
      estimatedTime: "20-25 minutes",
      color: "purple"
    }
  ];

  if (activeLab) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {labTypes.find(lab => lab.id === activeLab)?.title}
              </h2>
              <Button variant="ghost" onClick={() => setActiveLab(null)}>×</Button>
            </div>
          </div>
          <div className="p-6">
            <LabSimulation 
              labType={activeLab}
              onComplete={(result) => {
                labCompleteMutation.mutate(result);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cyber Lab</h1>
            <p className="text-gray-600">Interactive cybersecurity simulations and training</p>
          </div>
        </div>

        {/* Lab Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {labTypes.map((lab) => {
            const labResult = (labResults as CyberLabResult[])?.find(r => r.labType === lab.id);
            const isCompleted = !!labResult;
            
            return (
              <Card key={lab.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{lab.icon}</div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        lab.difficulty === "Beginner" ? "border-green-500 text-green-700" :
                        lab.difficulty === "Intermediate" ? "border-yellow-500 text-yellow-700" :
                        "border-red-500 text-red-700"
                      }`}
                    >
                      {lab.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{lab.title}</CardTitle>
                  <p className="text-sm text-gray-600">{lab.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{lab.estimatedTime}</span>
                      </div>
                      {isCompleted && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={14} />
                          <span>{labResult.score}pts</span>
                        </div>
                      )}
                    </div>
                    
                    {isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Last Score:</span>
                          <span>{labResult.correctAnswers}/{labResult.totalQuestions} correct</span>
                        </div>
                        <Progress 
                          value={(labResult.correctAnswers / labResult.totalQuestions) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <Button
                      onClick={() => setActiveLab(lab.id)}
                      className={`w-full ${
                        lab.color === "blue" ? "bg-blue-500 hover:bg-blue-600" :
                        lab.color === "red" ? "bg-red-500 hover:bg-red-600" :
                        "bg-purple-500 hover:bg-purple-600"
                      }`}
                    >
                      {isCompleted ? "Retry Lab" : "Start Lab"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Results */}
        {labResults && (labResults as CyberLabResult[]).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(labResults as CyberLabResult[]).slice(0, 5).map((result) => {
                  const lab = labTypes.find(l => l.id === result.labType);
                  return (
                    <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{lab?.icon}</div>
                        <div>
                          <h4 className="font-medium">{lab?.title}</h4>
                          <p className="text-sm text-gray-600">
                            Completed {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{result.score} pts</div>
                        <div className="text-sm text-gray-600">
                          {result.correctAnswers}/{result.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Lab Simulation Component
function LabSimulation({ 
  labType, 
  onComplete 
}: { 
  labType: string; 
  onComplete: (result: {
    labType: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
  }) => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const labData = {
    phishing: {
      questions: [
        {
          type: "email",
          subject: "URGENT: Verify Your Account Now!",
          sender: "security@paypaI.com",
          content: "Your account has been compromised. Click here immediately to secure your account: http://paypal-security.suspicious-link.com/verify",
          question: "Is this email legitimate?",
          options: ["Yes, it's from PayPal", "No, it's a phishing attempt"],
          correct: 1,
          explanation: "This is a phishing email. Notice the suspicious sender domain (paypaI.com with capital 'I' instead of 'l'), urgent language, and suspicious URL."
        },
        {
          type: "email",
          subject: "Your Monthly Statement",
          sender: "statements@chase.com",
          content: "Your Chase credit card statement is ready. Log in to view your statement and recent transactions.",
          question: "Is this email legitimate?",
          options: ["Yes, it appears legitimate", "No, it's suspicious"],
          correct: 0,
          explanation: "This appears to be a legitimate email with a proper sender domain, professional language, and no suspicious links."
        },
        {
          type: "email",
          subject: "Re: Invoice #12345",
          sender: "accounting@company-name.com",
          content: "Please find attached the invoice you requested. The payment is due within 24 hours to avoid service interruption.",
          question: "What makes this email suspicious?",
          options: ["Urgent payment deadline", "Generic company name", "Both A and B"],
          correct: 2,
          explanation: "Both the urgent deadline and generic company name are red flags. Legitimate businesses typically provide proper identification and reasonable payment terms."
        }
      ]
    },
    malware: {
      questions: [
        {
          type: "file",
          filename: "vacation_photos.exe",
          size: "45 KB",
          question: "Is this file suspicious?",
          options: ["No, it's just photos", "Yes, photos shouldn't be .exe files"],
          correct: 1,
          explanation: "This is highly suspicious. Photo files should have extensions like .jpg, .png, not .exe which indicates an executable program."
        },
        {
          type: "behavior",
          description: "A program is trying to modify system registry entries and create network connections to unknown servers.",
          question: "What type of malware behavior is this?",
          options: ["Normal software behavior", "Potential malware activity", "System maintenance"],
          correct: 1,
          explanation: "This behavior is typical of malware - unauthorized registry modifications and suspicious network connections are major red flags."
        },
        {
          type: "scan",
          result: "File detected: Trojan.Win32.Agent.abc - High Risk",
          question: "What should you do?",
          options: ["Ignore the warning", "Quarantine the file immediately", "Run the file to test it"],
          correct: 1,
          explanation: "When antivirus software detects a high-risk Trojan, you should immediately quarantine or delete the file to prevent system damage."
        }
      ]
    },
    social_engineering: {
      questions: [
        {
          type: "phone",
          scenario: "A caller claims to be from IT support and asks for your password to 'update security settings'.",
          question: "How should you respond?",
          options: ["Provide the password", "Ask for verification and callback number", "Hang up immediately"],
          correct: 1,
          explanation: "Always verify the caller's identity through official channels. Legitimate IT never asks for passwords over the phone."
        },
        {
          type: "physical",
          scenario: "A person in a delivery uniform asks you to hold the door open to the secure office area.",
          question: "What should you do?",
          options: ["Help them since they're making a delivery", "Ask to see their ID and verify with reception", "Let them in but escort them"],
          correct: 1,
          explanation: "Never allow unauthorized access to secure areas. Always verify identity through proper channels, regardless of appearance."
        },
        {
          type: "online",
          scenario: "You receive a LinkedIn message from someone claiming to be a recruiter offering a job that seems too good to be true.",
          question: "What's the best approach?",
          options: ["Accept immediately", "Research the company and recruiter thoroughly", "Ignore the message"],
          correct: 1,
          explanation: "Always research opportunities thoroughly. Verify the recruiter's identity and company legitimacy before sharing personal information."
        }
      ]
    }
  };

  const currentLabData = labData[labType as keyof typeof labData];
  const question = currentLabData?.questions[currentQuestion];
  const totalQuestions = currentLabData?.questions.length || 0;

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex.toString());
    setShowFeedback(true);
    
    if (answerIndex === question.correct) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete({
        labType,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent
      });
    }
  };

  if (!currentLabData) {
    return <div>Loading lab data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <span>Score: {score} pts</span>
        </div>
        <Progress value={((currentQuestion + 1) / totalQuestions) * 100} className="h-2" />
      </div>

      {/* Question Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scenario Display */}
          {question.type === "email" && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2 text-sm">
                <div><strong>From:</strong> {question.sender}</div>
                <div><strong>Subject:</strong> {question.subject}</div>
                <div className="border-t pt-2 mt-2">
                  <div>{question.content}</div>
                </div>
              </div>
            </div>
          )}

          {question.type === "file" && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📄</div>
                <div>
                  <div className="font-medium">{question.filename}</div>
                  <div className="text-sm text-gray-600">Size: {question.size}</div>
                </div>
              </div>
            </div>
          )}

          {(question.type === "behavior" || question.type === "scan" || question.type === "phone" || question.type === "physical" || question.type === "online") && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p>{question.description || question.scenario || question.result}</p>
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  showFeedback
                    ? index === question.correct
                      ? "default"
                      : selectedAnswer === index.toString()
                      ? "destructive"
                      : "outline"
                    : "outline"
                }
                className={`w-full text-left justify-start h-auto p-4 ${
                  showFeedback && index === question.correct
                    ? "bg-green-500 text-white"
                    : showFeedback && selectedAnswer === index.toString() && index !== question.correct
                    ? "bg-red-500 text-white"
                    : ""
                }`}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
              >
                <div className="flex items-center space-x-2">
                  {showFeedback && index === question.correct && <CheckCircle size={16} />}
                  {showFeedback && selectedAnswer === index.toString() && index !== question.correct && <XCircle size={16} />}
                  <span>{option}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600">💡</div>
                <div>
                  <div className="font-medium text-blue-800">Explanation:</div>
                  <div className="text-blue-700">{question.explanation}</div>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          {showFeedback && (
            <Button onClick={handleNext} className="w-full btn-gradient-primary">
              {currentQuestion < totalQuestions - 1 ? "Next Question" : "Complete Lab"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}