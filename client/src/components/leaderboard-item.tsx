import { Star } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface LeaderboardUser {
  id: number;
  firstName: string;
  lastName: string;
  totalScore: number;
  rank: number;
}

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isCurrentUser?: boolean;
}

export default function LeaderboardItem({ user, isCurrentUser = false }: LeaderboardItemProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-orange-500";
    return "bg-gray-400";
  };

  const getAvatarGradient = (rank: number) => {
    if (rank === 1) return "btn-gradient-warning";
    if (rank === 2) return "btn-gradient-secondary";
    if (rank === 3) return "btn-gradient-primary";
    return "btn-gradient-success";
  };

  const getStarCount = (rank: number) => {
    if (rank <= 3) return 3;
    if (rank <= 10) return 2;
    return 1;
  };

  const starCount = getStarCount(user.rank);

  return (
    <div className={`flex items-center space-x-4 p-4 rounded-lg transition-colors ${
      isCurrentUser ? "bg-blue-50 border border-primary/20" : "hover:bg-gray-50"
    }`}>
      <div className={`w-8 h-8 rounded-full ${getRankColor(user.rank)} flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">{user.rank}</span>
      </div>
      <div className={`w-12 h-12 ${getAvatarGradient(user.rank)} rounded-full flex items-center justify-center`}>
        <span className="text-white font-bold">
          {getInitials(user.firstName, user.lastName)}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">
          {user.firstName} {user.lastName} {isCurrentUser && "(You)"}
        </h4>
        <p className="text-sm text-gray-600">
          {user.rank <= 3 ? "Expert Player" : user.rank <= 10 ? "Advanced Player" : "Intermediate Player"} • {starCount} badge{starCount !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">{user.totalScore.toLocaleString()}</div>
        <div className="text-sm text-gray-600">points</div>
      </div>
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < starCount ? "text-yellow-500 fill-current" : "text-gray-300"}
          />
        ))}
      </div>
    </div>
  );
}
