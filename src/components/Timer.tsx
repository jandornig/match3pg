import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { TIME_LIMIT } from "@/utils/gameUtils";

interface TimerProps {
  timeRemaining: number;
}

const Timer = ({ timeRemaining }: TimerProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const newProgress = (timeRemaining / TIME_LIMIT) * 100;
    setProgress(newProgress);
  }, [timeRemaining]);

  return (
    <Progress 
      value={progress} 
      className="h-2 transition-all duration-100 ease-linear [&>div]:bg-blue-500" 
    />
  );
};

export default Timer;
