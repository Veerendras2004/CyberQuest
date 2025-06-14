import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeaderboardItem from "@/components/leaderboard-item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENT_USER_ID = "665f1b2c3d4e5f6789012345";

export default function LeaderboardPage() {
  const [timeFrame, setTimeFrame] = useState<"week" | "alltime">("week");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", 50], // Top 50 users
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const topThree = leaderboard?.slice(0, 3) || [];
  const restOfLeaderboard = leaderboard?.slice(3) || [];

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
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard 🏆</h1>
            <p className="text-gray-600">See how you rank among the top players!</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-end">
          <Select onValueChange={(value: "week" | "alltime") => setTimeFrame(value)} defaultValue="week">
            <SelectTrigger className="w-[180px]">
              <Trophy size={16} className="mr-2" />
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-6">
            {/* Top 3 */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {topThree.map((user: any, index: number) => (
                  <Card key={user.id} className="text-center py-8 relative overflow-hidden">
                    <CardContent className="p-0">
                      {index === 0 && (
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-yellow-400/50 to-transparent"></div>
                      )}
                      <div className="relative z-10">
                        <Medal size={48} className={`mx-auto mb-4 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700"}`} />
                        <p className="text-lg font-bold text-gray-900">#{index + 1}</p>
                        <h3 className="text-xl font-bold text-primary mb-2">{user.username}</h3>
                        <p className="text-lg font-semibold text-gray-700">{user.points} Points</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Rest of Leaderboard */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {restOfLeaderboard.map((user: any, index: number) => (
                    <LeaderboardItem key={user.id} user={user} rank={index + 4} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leaderboard data yet</h3>
            <p className="text-gray-600">Start completing quizzes and activities to earn points!</p>
          </div>
        )}
      </div>
    </div>
  );
}
