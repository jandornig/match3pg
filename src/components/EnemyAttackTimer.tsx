import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface EnemyAttackTimerProps {
  timeRemaining: number;
  maxTime: number;
  showAttack?: boolean;
}

export const EnemyAttackTimer = ({ timeRemaining, maxTime, showAttack }: EnemyAttackTimerProps) => {
  const progress = (timeRemaining / maxTime) * 100;

  return (
    <div className="w-full relative">
      <Progress 
        value={progress} 
        className="w-full [&>div]:bg-red-500 [&>div]:transition-all [&>div]:duration-100 [&>div]:ease-linear"
      />
      <AnimatePresence>
        {showAttack && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-lg font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] [text-shadow:_0_0_5px_rgb(255_255_255_/_90%)]">
              ATTACK!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 