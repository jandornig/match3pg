import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface GameOverModalProps {
  isOpen: boolean;
  onRestart: () => void;
  level: number;
  score: number;
  highestCombo: number;
  maxEnemyHealth: number;
}

const GameOverModal = ({ 
  isOpen, 
  score,
  level, 
  highestCombo, 
  maxEnemyHealth, 
  onRestart 
}: GameOverModalProps) => {
  // Calculate enemy level based on health scaling (doubles each level, starts at 100)
  const enemyLevel = Math.log2(maxEnemyHealth / 100) + 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-[100]" />
            <DialogContent className="fixed left-[50%] top-[50%] z-[101] translate-x-[-50%] translate-y-[-50%] sm:max-w-md glassmorphism !pr-6">
              <DialogHeader>
                <DialogTitle className="text-4xl text-center mb-4">Game Over!</DialogTitle>
                <DialogDescription className="text-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Level Reached:</span>
                    <span className="font-bold">{level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Highest Combo:</span>
                    <span className="font-bold">{highestCombo}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Strongest Enemy:</span>
                    <span className="font-bold">Level {Math.floor(maxEnemyHealth / 100)}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="mt-6">
                <Button 
                  onClick={onRestart}
                  className="w-full text-lg"
                >
                  Play Again
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;
