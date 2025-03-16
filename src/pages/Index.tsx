import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState, GameStatus } from "@/hooks/useGameState";
import GameBoard from "@/components/GameBoard";
import Timer from "@/components/Timer";
import ScoreBoard from "@/components/ScoreBoard";
import GameOverModal from "@/components/GameOverModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Skull, Heart, Sword } from "lucide-react";
import { EnemyAttackTimer } from "@/components/EnemyAttackTimer";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const { 
    board, 
    score, 
    highScore, 
    comboCount, 
    timeRemaining, 
    status, 
    lastMatchesByColor,
    selectTile, 
    restartGame,
    level,
    enemyHealth,
    maxEnemyHealth,
    playerHealth,
    enemyAttack,
    enemyAttackTimeRemaining,
    playerXP,
    xpNeededForNextLevel,
    baseBlockValue,
    highestCombo,
    showLevelUp,
    showKill,
    showAttack,
    totalGold
  } = useGameState();

  // Calculate danger class based on number of hits until death
  const getDangerClass = () => {
    if (status === GameStatus.GAME_OVER) return '';
    
    const hitsUntilDeath = Math.ceil(playerHealth / enemyAttack);
    
    if (hitsUntilDeath <= 1) return 'danger-pulse danger-pulse-very-fast';
    if (hitsUntilDeath <= 2) return 'danger-pulse danger-pulse-fast';
    if (hitsUntilDeath <= 3) return 'danger-pulse danger-pulse-medium';
    if (hitsUntilDeath <= 4) return 'danger-pulse danger-pulse-slow';
    return '';
  };

  useEffect(() => {
    // Focus trap to ensure keyboard focus stays in the game
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        restartGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [restartGame]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-800 to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mb-4 relative"
      >
        <div className="mb-6 relative">
          <ScoreBoard 
            score={score} 
            comboCount={comboCount} 
            lastMatchesByColor={lastMatchesByColor}
            baseBlockValue={baseBlockValue}
            timeRemaining={timeRemaining}
            level={level}
            playerXP={playerXP}
            xpNeededForNextLevel={xpNeededForNextLevel}
            playerHealth={playerHealth}
            totalGold={totalGold}
          />

          {/* Level Up Animation */}
          <AnimatePresence>
            {showLevelUp && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
              >
                <div className="text-7xl font-bold text-blue-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] [text-shadow:_0_0_5px_rgb(255_255_255_/_90%)]">
                  LEVEL UP!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {status === GameStatus.PLAYING && board.length > 0 && (
          <div className="relative mb-6">
            <div className="relative bg-white rounded-xl p-2">
              <div className={`absolute inset-0 rounded-xl ${getDangerClass()}`} />
              <GameBoard 
                board={board} 
                onTileSelect={selectTile} 
              />
            </div>
          </div>
        )}

        {/* Enemy Stats Card */}
        <Card className="glassmorphism p-3 bg-black relative">
          <div className="flex flex-col space-y-2">
            {/* Enemy Level */}
            <div className="flex justify-center items-center mb-2">
              <div className="flex items-center space-x-2">
                <Sword className="h-4 w-4 text-white" />
                <span className="text-sm text-white">Enemy Level {level}</span>
              </div>
            </div>

            <div className="flex">
              {/* Left Side - Health and Attack */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-white" />
                  <span className="text-2xl font-bold text-white">{enemyHealth}/{maxEnemyHealth}</span>
                </div>
                <Progress value={(enemyHealth / maxEnemyHealth) * 100} className="[&>div]:bg-green-500" />
                <div className="flex items-center space-x-2">
                  <Skull className="h-6 w-6 text-white" />
                  <span className="text-2xl font-bold text-white">{enemyAttack}</span>
                </div>
                <EnemyAttackTimer timeRemaining={enemyAttackTimeRemaining} maxTime={3} showAttack={showAttack} />
              </div>

              {/* Right Side - Damage Calculations */}
              <div className="flex-1 pl-4 space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-red-500">Swing</span>
                  <Sword className="h-6 w-6 text-red-500" />
                  <span className="text-lg font-bold text-red-500">
                    {lastMatchesByColor['red']?.scoreGained || 0}
                    <span className="text-xs ml-1">
                      ({lastMatchesByColor['red']?.matchedTiles || 0}×{lastMatchesByColor['red']?.comboValue || 0})
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-purple-500">Magic</span>
                  <span className="text-2xl text-purple-500">✦</span>
                  <span className="text-lg font-bold text-purple-500">
                    {lastMatchesByColor['purple']?.scoreGained || 0}
                    <span className="text-xs ml-1">
                      ({lastMatchesByColor['purple']?.matchedTiles || 0}×{lastMatchesByColor['purple']?.comboValue || 0})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Kill Animation */}
          <AnimatePresence>
            {showKill && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
              >
                <div className="text-7xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] [text-shadow:_0_0_5px_rgb(255_255_255_/_90%)]">
                  KILL!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {status === GameStatus.IDLE && (
          <div className="flex justify-center mt-6">
            <Button onClick={restartGame} size="lg">Start Game</Button>
          </div>
        )}
      </motion.div>

      <GameOverModal 
        isOpen={status === GameStatus.GAME_OVER}
        score={score}
        level={level}
        highestCombo={highestCombo}
        maxEnemyHealth={maxEnemyHealth}
        onRestart={restartGame}
      />
    </div>
  );
};

export default Index;
