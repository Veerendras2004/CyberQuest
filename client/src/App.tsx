import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import QuizPage from "@/pages/quiz";
import ActivitiesPage from "@/pages/activities";
import TeamHubPage from "@/pages/teamhub";
import CyberLabPage from "@/pages/cyberlab";
import CommunityPage from "@/pages/community";
import LeaderboardPage from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

const CURRENT_USER_ID = 1;

function AppContent() {
  const { data: user } = useQuery({
    queryKey: [`/api/user/${CURRENT_USER_ID}`],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/teamhub" component={TeamHubPage} />
        <Route path="/cyberlab" component={CyberLabPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
