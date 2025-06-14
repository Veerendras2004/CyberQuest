import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@shared/schema";

interface ActivityCardProps {
  activity: Activity;
  onPlay: (activity: Activity) => void;
}

export default function ActivityCard({ activity, onPlay }: ActivityCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover">
      {activity.imageUrl && (
        <img 
          src={activity.imageUrl} 
          alt={activity.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
          {activity.isNew && (
            <Badge className="bg-green-500 text-white text-xs">New</Badge>
          )}
          {activity.isPopular && (
            <Badge className="bg-yellow-500 text-white text-xs">Popular</Badge>
          )}
          {!activity.isNew && !activity.isPopular && (
            <Badge variant="secondary" className="text-xs">Classic</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock size={12} />
            <span>{activity.timeEstimate}</span>
          </div>
          <Button
            onClick={() => onPlay(activity)}
            className={`px-4 py-2 text-sm font-medium ${
              activity.type === 'word_scramble' ? 'btn-gradient-secondary' :
              activity.type === 'number_puzzle' ? 'btn-gradient-primary' :
              'btn-gradient-success'
            }`}
          >
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
}
