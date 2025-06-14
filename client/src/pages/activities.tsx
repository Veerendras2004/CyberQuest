import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Filter } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActivityCard from "@/components/activity-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";

const CURRENT_USER_ID = 1;

// Simple game implementations
const WordScrambleGame = ({ activity, onComplete }: { activity: Activity; onComplete: (score: number, timeSpent: number) => void }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const words = activity.gameData?.words || ["LEARNING", "EDUCATION", "KNOWLEDGE"];
  const currentWord = words[currentWordIndex];

  useState(() => {
    const scrambled = currentWord.split('').sort(() => Math.random() - 0.5).join('');
    setScrambledWord(scrambled);
  }, [currentWord]);

  const handleSubmit = () => {
    if (userInput.toUpperCase() === currentWord) {
      const newScore = score + 20;
      setScore(newScore);
      
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput("");
        const nextWord = words[currentWordIndex + 1];
        const scrambled = nextWord.split('').sort(() => Math.random() - 0.5).join('');
        setScrambledWord(scrambled);
      } else {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onComplete(newScore, timeSpent);
      }
    } else {
      alert("Try again!");
    }
  };

  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-semibold">Unscramble this word:</h3>
      <div className="text-3xl font-bold tracking-widest text-primary">{scrambledWord}</div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-center text-xl"
        placeholder="Your answer"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div className="space-y-2">
        <Button onClick={handleSubmit} className="btn-gradient-primary">
          Submit Answer
        </Button>
        <p className="text-sm text-gray-600">
          Word {currentWordIndex + 1} of {words.length} • Score: {score}
        </p>
      </div>
    </div>
  );
};

const NumberPuzzleGame = ({ activity, onComplete }: { activity: Activity; onComplete: (score: number, timeSpent: number) => void }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const puzzles = activity.gameData?.puzzles || [
    { sequence: [2, 4, 8, 16], answer: 32 },
    { sequence: [1, 1, 2, 3, 5], answer: 8 }
  ];
  const currentPuzzle = puzzles[currentPuzzleIndex];

  const handleSubmit = () => {
    if (parseInt(userAnswer) === currentPuzzle.answer) {
      const newScore = score + 30;
      setScore(newScore);
      
      if (currentPuzzleIndex < puzzles.length - 1) {
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        setUserAnswer("");
      } else {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        onComplete(newScore, timeSpent);
      }
    } else {
      alert("Try again!");
    }
  };

  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-semibold">What comes next in the sequence?</h3>
      <div className="text-2xl font-bold text-primary">
        {currentPuzzle.sequence.join(", ")}, ?
      </div>
      <input
        type="number"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-center text-xl"
        placeholder="Your answer"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div className="space-y-2">
        <Button onClick={handleSubmit} className="btn-gradient-primary">
          Submit Answer
        </Button>
        <p className="text-sm text-gray-600">
          Puzzle {currentPuzzleIndex + 1} of {puzzles.length} • Score: {score}
        </p>
      </div>
    </div>
  );
};

const MemoryMatchGame = ({ activity, onComplete }: { activity: Activity; onComplete: (score: number, timeSpent: number) => void }) => {
  const symbols = activity.gameData?.symbols || ["🎮", "🎯", "🏆", "⭐"];
  const [cards, setCards] = useState(() => {
    const gameCards = [...symbols, ...symbols].map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false
    }));
    return gameCards.sort(() => Math.random() - 0.5);
  });
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      if (newCards[first].symbol === newCards[second].symbol) {
        // Match found
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setCards(updatedCards);
          setFlippedCards([]);
          setScore(score + 50);

          // Check if game is complete
          if (updatedCards.every(card => card.isMatched)) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            onComplete(score + 50, timeSpent);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="text-center space-y-6">
      <h3 className="text-xl font-semibold">Match the pairs!</h3>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`w-16 h-16 rounded-lg border-2 text-2xl transition-all ${
              card.isFlipped || card.isMatched
                ? "bg-blue-100 border-blue-400"
                : "bg-gray-200 border-gray-300 hover:bg-gray-300"
            }`}
          >
            {card.isFlipped || card.isMatched ? card.symbol : "?"}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600">Score: {score}</p>
    </div>
  );
};

const ActivityGameModal = ({ 
  activity, 
  onClose, 
  onComplete 
}: { 
  activity: Activity; 
  onClose: () => void; 
  onComplete: (score: number, timeSpent: number) => void 
}) => {
  const renderGame = () => {
    switch (activity.type) {
      case 'word_scramble':
        return <WordScrambleGame activity={activity} onComplete={onComplete} />;
      case 'number_puzzle':
        return <NumberPuzzleGame activity={activity} onComplete={onComplete} />;
      case 'memory_match':
        return <MemoryMatchGame activity={activity} onComplete={onComplete} />;
      default:
        return <div>Game not implemented yet!</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{activity.title}</h2>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </div>
        <div className="p-6">
          {renderGame()}
        </div>
      </div>
    </div>
  );
};

export default function ActivitiesPage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const submitResultMutation = useMutation({
    mutationFn: async (result: { activityId: number; score: number; timeSpent: number }) => {
      const response = await apiRequest("POST", "/api/activity/result", {
        userId: CURRENT_USER_ID,
        activityId: result.activityId,
        score: result.score,
        timeSpent: result.timeSpent,
        gameState: {}
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Activity Completed! 🎉",
        description: `You scored ${result.score} points!`,
      });
      setSelectedActivity(null);
      queryClient.invalidateQueries({ queryKey: [`/api/user/${CURRENT_USER_ID}/stats`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save activity result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlayActivity = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleActivityComplete = (score: number, timeSpent: number) => {
    if (selectedActivity) {
      submitResultMutation.mutate({
        activityId: selectedActivity.id,
        score,
        timeSpent,
      });
    }
  };

  const handleCloseActivity = () => {
    setSelectedActivity(null);
  };

  const filteredActivities = activities?.filter((activity: Activity) => 
    categoryFilter === "all" || activity.category.toLowerCase() === categoryFilter.toLowerCase()
  );

  const categories = activities ? [...new Set(activities.map((a: Activity) => a.category))] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft size={16} />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cybersecurity Activities</h1>
                <p className="text-gray-600">Interactive games to strengthen your security skills</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities?.map((activity: Activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onPlay={handlePlayActivity}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredActivities && filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600">Try adjusting your filter or check back later!</p>
          </div>
        )}

        {/* Activity Game Modal */}
        {selectedActivity && (
          <ActivityGameModal
            activity={selectedActivity}
            onClose={handleCloseActivity}
            onComplete={handleActivityComplete}
          />
        )}
      </div>
    </div>
  );
}
