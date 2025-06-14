import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Shield, Sword, Lock, Unlock, Target, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const CURRENT_USER_ID = "665f1b2c3d4e5f6789012345";

interface TeamChallenge {
  id: number;
  title: string;
  description: string;
  team: string;
  category: string;
  difficulty: string;
  type: string;
  content: any;
  maxScore: number;
  unlockLevel: number;
}

export default function TeamHubPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<TeamChallenge | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userTeam } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}/team`],
  });

  const { data: redChallenges } = useQuery({
    queryKey: ["/api/team-challenges", "red"],
    enabled: selectedTeam === "red" || userTeam === "red",
  });

  const { data: whiteChallenges } = useQuery({
    queryKey: ["/api/team-challenges", "white"],
    enabled: selectedTeam === "white" || userTeam === "white",
  });

  const { data: userProgress } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}/team-progress`, selectedTeam || userTeam],
    enabled: !!(selectedTeam || userTeam),
  });

  const teamSelectionMutation = useMutation({
    mutationFn: async (team: string) => {
      const response = await apiRequest("POST", `/api/user/${CURRENT_USER_ID}/team`, { team });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${CURRENT_USER_ID}/team`] });
      toast({
        title: "Team Selected! 🎯",
        description: `Welcome to the ${selectedTeam === "red" ? "Red Team (Offensive)" : "White Team (Defensive)"} specialization!`,
      });
    },
  });

  const challengeCompleteMutation = useMutation({
    mutationFn: async (result: { challengeId: number; score: number; timeSpent: number }) => {
      const response = await apiRequest("POST", "/api/team-progress", {
        userId: CURRENT_USER_ID,
        challengeId: result.challengeId,
        score: result.score,
        timeSpent: result.timeSpent,
        completed: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${CURRENT_USER_ID}/team-progress`] });
      setActiveChallenge(null);
      toast({
        title: "Challenge Completed! 🏆",
        description: "Great work! You've earned points and unlocked new challenges.",
      });
    },
  });

  const handleTeamSelection = (team: string) => {
    setSelectedTeam(team);
    teamSelectionMutation.mutate(team);
  };

  const currentTeam = userTeam || selectedTeam;
  const challenges = currentTeam === "red" ? redChallenges : whiteChallenges;

  // Team Selection Screen
  if (!currentTeam) {
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
              <h1 className="text-3xl font-bold text-gray-900">Choose Your Team</h1>
              <p className="text-gray-600">Select your cybersecurity specialization path</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Red Team Card */}
            <Card className="card-hover cursor-pointer border-2 border-red-200 hover:border-red-400 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sword className="text-white" size={32} />
                </div>
                <CardTitle className="text-2xl text-red-600">Red Team</CardTitle>
                <p className="text-gray-600">Offensive Security</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Master the art of ethical hacking and penetration testing. Learn to think like an attacker to better defend systems.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">You'll Learn:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Penetration Testing Techniques</li>
                    <li>• Exploit Development</li>
                    <li>• Social Engineering</li>
                    <li>• Vulnerability Assessment</li>
                  </ul>
                </div>
                <Button
                  onClick={() => handleTeamSelection("red")}
                  className="w-full bg-red-500 hover:bg-red-600"
                  disabled={teamSelectionMutation.isPending}
                >
                  Join Red Team
                </Button>
              </CardContent>
            </Card>

            {/* White Team Card */}
            <Card className="card-hover cursor-pointer border-2 border-blue-200 hover:border-blue-400 transition-all">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-white" size={32} />
                </div>
                <CardTitle className="text-2xl text-blue-600">White Team</CardTitle>
                <p className="text-gray-600">Defensive Security</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Become a guardian of digital assets. Learn to detect, prevent, and respond to cyber threats effectively.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold">You'll Learn:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• System Hardening</li>
                    <li>• Incident Response</li>
                    <li>• Threat Analysis</li>
                    <li>• Secure Architecture</li>
                  </ul>
                </div>
                <Button
                  onClick={() => handleTeamSelection("white")}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={teamSelectionMutation.isPending}
                >
                  Join White Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Challenge Interface
  if (activeChallenge) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{activeChallenge.title}</h2>
              <Button variant="ghost" onClick={() => setActiveChallenge(null)}>×</Button>
            </div>
            <p className="text-gray-600 mt-2">{activeChallenge.description}</p>
          </div>
          <div className="p-6">
            <ChallengeSimulator 
              challenge={activeChallenge}
              onComplete={(score, timeSpent) => {
                challengeCompleteMutation.mutate({
                  challengeId: activeChallenge.id,
                  score,
                  timeSpent
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Team Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${currentTeam === "red" ? "bg-red-500" : "bg-blue-500"} rounded-full flex items-center justify-center`}>
              {currentTeam === "red" ? <Sword className="text-white" size={20} /> : <Shield className="text-white" size={20} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentTeam === "red" ? "Red Team Hub" : "White Team Hub"}
              </h1>
              <p className="text-gray-600">
                {currentTeam === "red" ? "Offensive Security Training" : "Defensive Security Training"}
              </p>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges?.map((challenge: TeamChallenge) => {
            const isCompleted = userProgress?.some((p: any) => p.challengeId === challenge.id && p.completed);
            const isLocked = challenge.unlockLevel > 1; // Simple unlock logic
            
            return (
              <Card key={challenge.id} className={`card-hover ${isLocked ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {isCompleted ? (
                        <Badge className="bg-green-500 text-white">Completed</Badge>
                      ) : isLocked ? (
                        <Lock size={16} className="text-gray-400" />
                      ) : (
                        <Unlock size={16} className="text-green-500" />
                      )}
                    </div>
                    <Badge variant="outline" className={`${
                      challenge.difficulty === "easy" ? "border-green-500 text-green-700" :
                      challenge.difficulty === "medium" ? "border-yellow-500 text-yellow-700" :
                      "border-red-500 text-red-700"
                    }`}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Target size={14} />
                        <span>{challenge.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Max: {challenge.maxScore} pts</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setActiveChallenge(challenge)}
                      disabled={isLocked}
                      className={`w-full ${
                        currentTeam === "red" 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {isCompleted ? "Retry Challenge" : isLocked ? "Locked" : "Start Challenge"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {challenges && challenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges available</h3>
            <p className="text-gray-600">New challenges are being developed for your team!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Challenge Simulator Component
function ChallengeSimulator({ 
  challenge, 
  onComplete 
}: { 
  challenge: TeamChallenge; 
  onComplete: (score: number, timeSpent: number) => void 
}) {
  const [startTime] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);

  const handleStepComplete = (stepScore: number, answer: any) => {
    setScore(prev => prev + stepScore);
    setAnswers(prev => [...prev, answer]);
    
    if (currentStep < (challenge.content?.steps?.length || 1) - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      onComplete(score + stepScore, timeSpent);
    }
  };

  // Simple challenge content based on type
  if (challenge.type === "simulation") {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="mb-2">$ {challenge.category} simulation</div>
          <div>Initializing {challenge.team} team challenge...</div>
          <div className="mt-2 text-yellow-400">Ready for input.</div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Challenge Objective:</h3>
          <p className="text-gray-700">{challenge.description}</p>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Response:
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={4}
              placeholder="Enter your solution approach..."
            />
          </div>
          
          <Button
            onClick={() => handleStepComplete(challenge.maxScore || 50, "simulation_complete")}
            className="btn-gradient-primary"
          >
            Submit Solution
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🔧</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Challenge Under Development</h3>
      <p className="text-gray-600">This challenge type is being built. Check back soon!</p>
      <Button
        onClick={() => handleStepComplete(10, "placeholder")}
        className="mt-4 btn-gradient-primary"
      >
        Complete Placeholder
      </Button>
    </div>
  );
}