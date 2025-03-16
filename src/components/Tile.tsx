import { motion } from "framer-motion";
import { Tile as TileType } from "@/utils/gameUtils";
import { Sword, Coins, Bomb, Zap } from "lucide-react";

interface TileProps {
  tile: TileType;
  onSelect: (tile: TileType) => void;
}

const Tile = ({ tile, onSelect }: TileProps) => {
  const handleClick = () => {
    onSelect(tile);
  };

  // Colors for each gem type
  const getGemStyle = () => {
    const type = tile.highlightType || tile.type;
    switch (type) {
      case 'red':
        return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
      case 'blue':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 text-white';
      case 'green':
        return 'bg-gradient-to-br from-green-400 to-green-600 text-white';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900';
      case 'purple':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 text-white';
      case 'grey':
        return 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <motion.div
      initial={{ 
        scale: 0.8, 
        opacity: 0,
        y: tile.position.row < 0 ? -100 : 0 
      }}
      animate={{ 
        scale: tile.isMatched ? 0 : 1, 
        opacity: tile.isMatched ? 0 : 1,
        y: 0,
        boxShadow: tile.isSelected 
          ? "0 0 0 3px rgba(59, 130, 246, 0.5)" 
          : tile.highlightType
          ? "0 0 15px rgba(255, 255, 255, 0.8)"
          : "0 2px 4px rgba(0, 0, 0, 0.1)"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: tile.position.row < 0 ? (Math.abs(tile.position.row) * 0.05) : 0
      }}
      className={`gem-container ${tile.isSelected ? 'ring-2 ring-primary' : ''} ${tile.highlightType ? 'animate-pulse' : ''}`}
      onClick={handleClick}
    >
      <div className={`gem ${getGemStyle()} flex items-center justify-center rounded-lg shadow-md w-full h-full`}>
        <span className="text-lg font-bold">
          {tile.isBomb ? (
            <Bomb size={18} />
          ) : tile.isBolt ? (
            <Zap size={18} />
          ) : (
            <>
              {tile.type === 'red' && <Sword size={18} />}
              {tile.type === 'blue' && '★'}
              {tile.type === 'green' && '♥'}
              {tile.type === 'yellow' && <Coins size={18} />}
              {tile.type === 'purple' && '✦'}
              {tile.type === 'grey' && tile.countdown}
            </>
          )}
        </span>
      </div>
    </motion.div>
  );
};

export default Tile;
