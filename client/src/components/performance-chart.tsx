import { useMemo } from "react";

interface PerformanceChartProps {
  weeklyScores: number[];
  className?: string;
}

export default function PerformanceChart({ weeklyScores, className = "" }: PerformanceChartProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const maxScore = useMemo(() => {
    const max = Math.max(...weeklyScores);
    return max > 0 ? max : 100; // Avoid division by zero
  }, [weeklyScores]);

  return (
    <div className={`h-64 relative bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-end justify-between h-full space-x-2">
        {weeklyScores.map((score, index) => {
          const height = (score / maxScore) * 100;
          return (
            <div key={index} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="btn-gradient-primary rounded-t w-full relative group cursor-pointer"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {score} points
                </div>
              </div>
              <span className="text-xs text-gray-600">{days[index]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
