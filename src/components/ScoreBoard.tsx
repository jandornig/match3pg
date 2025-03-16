import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TileType } from "@/utils/gameUtils";
import Timer from "@/components/Timer";
import { Sword, MoveUpRight, Heart, Coins } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  comboCount: number;
  baseBlockValue: number;
  lastMatchesByColor: {
    [key in TileType]?: {
      matchedTiles: number;
      comboValue: number;
      scoreGained: number;
    };
  };
  timeRemaining: number;
  level: number;
  playerXP: number;
  xpNeededForNextLevel: number;
  playerHealth: number;
  totalGold: number;
}

const ScoreBoard = ({ 
  score, 
  comboCount,
  baseBlockValue,
  lastMatchesByColor,
  timeRemaining,
  level,
  playerXP,
  xpNeededForNextLevel,
  playerHealth,
  totalGold
}: ScoreBoardProps) => {
  const getColorStyle = (color: TileType) => {
    switch (color) {
      case 'red': return 'text-red-500';
      case 'blue': return 'text-blue-500';
      case 'green': return 'text-green-500';
      case 'yellow': return 'text-yellow-500';
      case 'purple': return 'text-purple-500';
      case 'grey': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getColorSymbol = (color: TileType) => {
    switch (color) {
      case 'red': return <Sword size={18} />;
      case 'blue': return '★';
      case 'green': return '♥';
      case 'yellow': return <Coins size={18} />;
      case 'purple': return '✦';
      case 'grey': return '3';
      default: return '?';
    }
  };

  const getColorLabel = (color: TileType) => {
    switch (color) {
      case 'blue': return 'XP';
      case 'green': return 'Health';
      case 'red': return 'Swing';
      case 'yellow': return 'Gold';
      case 'purple': return 'Magic';
      default: return '?';
    }
  };

  // Define the order of colors
  const orderedColors: TileType[] = ['blue', 'green', 'red', 'yellow', 'purple'];

  return (
    <Card className="glassmorphism p-3">
      <div className="flex flex-col space-y-4">
        {/* Player Stats */}
        <div className="flex items-center gap-4 pb-2 border-b">
          <div className="flex items-center gap-2">
            <div className="flex justify-center">
              <Sword size={18} className="text-blue-500" />
            </div>
            <div className="text-sm font-medium">Level {level}</div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">Block Value: {baseBlockValue}</div>
        </div>

        {/* Health and XP Display */}
        <div className="flex justify-between items-center gap-4 pb-2">
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-5 w-5 text-green-500" />
              <span className="text-sm">Health</span>
            </div>
            <div className="text-2xl font-bold text-green-500">
              {playerHealth}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {lastMatchesByColor['green']?.matchedTiles || 0}×{lastMatchesByColor['green']?.comboValue || 0}
              </span>
              <span className={`text-sm font-bold text-green-500`}>
                {lastMatchesByColor['green']?.scoreGained || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl text-blue-500">★</span>
              <span className="text-sm">XP</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {Math.round(playerXP)}/{xpNeededForNextLevel}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {lastMatchesByColor['blue']?.matchedTiles || 0}×{lastMatchesByColor['blue']?.comboValue || 0}
              </span>
              <span className={`text-sm font-bold text-blue-500`}>
                {lastMatchesByColor['blue']?.scoreGained || 0}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Gold</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {totalGold}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {lastMatchesByColor['yellow']?.matchedTiles || 0}×{lastMatchesByColor['yellow']?.comboValue || 0}
              </span>
              <span className={`text-sm font-bold text-yellow-500`}>
                {lastMatchesByColor['yellow']?.scoreGained || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Combo and Timer */}
        <div className="pt-2 border-t flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Combo</div>
            <div className={`text-lg font-bold ${comboCount > 0 ? 'text-primary' : 'text-gray-500'}`}>
              {comboCount}x
            </div>
          </div>
          <Timer timeRemaining={timeRemaining} />
        </div>
      </div>
    </Card>
  );
};

export default ScoreBoard;
