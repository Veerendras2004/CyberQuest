import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeaderboardItem from "@/components/leaderboard-item";

const CURRENT_USER_ID = 1;

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-gray-600">See how you rank against other players</p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <Card className="gradient-bg text-white overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold flex items-center justify-center space-x-2">
                  <Trophy size={28} />
                  <span>Top Performers</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-center space-x-8 py-8">
                  {/* Second Place */}
                  {topThree[1] && (
                    <div className="text-center">
                      <div className="w-16 h-16 btn-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">
                          {topThree[1].firstName[0]}{topThree[1].lastName[0]}
                        </span>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg p-4 h-24 flex flex-col justify-center">
                        <Medal size={20} className="mx-auto mb-1 text-gray-300" />
                        <div className="font-bold">{topThree[1].firstName}</div>
                        <div className="text-sm opacity-80">{topThree[1].totalScore.toLocaleString()} pts</div>
                      </div>
                    </div>
                  )}

                  {/* First Place */}
                  {topThree[0] && (
                    <div className="text-center">
                      <div className="w-20 h-20 btn-gradient-warning rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-xl">
                          {topThree[0].firstName[0]}{topThree[0].lastName[0]}
                        </span>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg p-4 h-32 flex flex-col justify-center">
                        <Trophy size={24} className="mx-auto mb-2 text-yellow-300" />
                        <div className="font-bold text-lg">{topThree[0].firstName}</div>
                        <div className="text-sm opacity-80">{topThree[0].totalScore.toLocaleString()} pts</div>
                      </div>
                    </div>
                  )}

                  {/* Third Place */}
                  {topThree[2] && (
                    <div className="text-center">
                      <div className="w-16 h-16 btn-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">
                          {topThree[2].firstName[0]}{topThree[2].lastName[0]}
                        </span>
                      </div>
                      <div className="bg-white/20 backdrop-blur rounded-lg p-4 h-24 flex flex-col justify-center">
                        <Award size={20} className="mx-auto mb-1 text-orange-300" />
                        <div className="font-bold">{topThree[2].firstName}</div>
                        <div className="text-sm opacity-80">{topThree[2].totalScore.toLocaleString()} pts</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Full Rankings</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant={timeFrame === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFrame("week")}
                  className={timeFrame === "week" ? "btn-gradient-primary" : ""}
                >
                  This Week
                </Button>
                <Button
                  variant={timeFrame === "alltime" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFrame("alltime")}
                  className={timeFrame === "alltime" ? "btn-gradient-primary" : ""}
                >
                  All Time
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show top 3 again in list format */}
              {topThree.map((user) => (
                <LeaderboardItem
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === CURRENT_USER_ID}
                />
              ))}
              
              {/* Rest of the leaderboard */}
              {restOfLeaderboard.map((user) => (
                <LeaderboardItem
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === CURRENT_USER_ID}
                />
              ))}
            </div>

            {/* Load More Button */}
            {leaderboard && leaderboard.length >= 50 && (
              <div className="mt-6 text-center">
                <Button variant="outline">
                  View More Players
                </Button>
              </div>
            )}

            {/* Empty State */}
            {leaderboard && leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
                <p className="text-gray-600">Be the first to complete a quiz or activity!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
