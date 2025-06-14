import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Brain, Puzzle, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PerformanceChart from "@/components/performance-chart";
import LeaderboardItem from "@/components/leaderboard-item";

// Mock current user - in a real app this would come from auth context
const CURRENT_USER_ID = 1;

export default function Dashboard() {
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}/stats`],
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard", 5], // Top 5 for dashboard
  });

  const { data: user } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}`],
  });

  if (statsLoading || !userStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: "Start Quiz",
      description: "Test your knowledge",
      icon: Brain,
      color: "btn-gradient-primary",
      href: "/quiz"
    },
    {
      title: "Activities",
      description: "Interactive games",
      icon: Puzzle,
      color: "btn-gradient-secondary",
      href: "/activities"
    },
    {
      title: "Leaderboard",
      description: "See top players",
      icon: Trophy,
      color: "btn-gradient-warning",
      href: "/leaderboard"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.firstName || "Alex"}! 🛡️
              </h1>
              <p className="text-lg opacity-90 mb-6">Ready to strengthen your cybersecurity skills today?</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">{userStats.totalScore.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Total Score</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">#{userStats.rank}</div>
                  <div className="text-sm opacity-80">Global Rank</div>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">{userStats.streak}</div>
                  <div className="text-sm opacity-80">Day Streak</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="card-hover cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Overview</CardTitle>
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <PerformanceChart weeklyScores={userStats.weeklyScores} />
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Target size={16} className="text-primary" />
                      <div className="text-2xl font-bold text-gray-900">{userStats.avgScore}%</div>
                    </div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <TrendingUp size={16} className="text-green-600" />
                      <div className="text-2xl font-bold text-gray-900">{userStats.completedQuizzes + userStats.completedActivities}</div>
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock size={16} className="text-blue-600" />
                      <div className="text-2xl font-bold text-gray-900">{userStats.timeSpent}h</div>
                    </div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      icon: "check",
                      title: "Math Quiz Completed",
                      subtitle: "Score: 92% • 2 hours ago",
                      color: "bg-green-500"
                    },
                    {
                      icon: "star",
                      title: "New Badge Earned",
                      subtitle: "Speed Demon • 1 day ago",
                      color: "bg-yellow-500"
                    },
                    {
                      icon: "puzzle-piece",
                      title: "Activity Completed",
                      subtitle: "Word Scramble • 2 days ago",
                      color: "bg-purple-500"
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center`}>
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mini Leaderboard */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Top Players</CardTitle>
                  <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!leaderboardLoading && leaderboard ? (
                    leaderboard.slice(0, 3).map((player) => (
                      <LeaderboardItem
                        key={player.id}
                        user={player}
                        isCurrentUser={player.id === CURRENT_USER_ID}
                      />
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <div className="animate-pulse">Loading leaderboard...</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
