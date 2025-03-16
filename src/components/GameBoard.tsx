
import { motion } from "framer-motion";
import Tile from "@/components/Tile";
import { Tile as TileType } from "@/utils/gameUtils";
import { BOARD_SIZE } from "@/utils/gameUtils";

interface GameBoardProps {
  board: TileType[][];
  onTileSelect: (tile: TileType) => void;
}

const GameBoard = ({ board, onTileSelect }: GameBoardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`game-board grid-cols-${BOARD_SIZE}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
      }}
    >
      {board.flat().map((tile) => (
        <div 
          key={tile.id} 
          className="aspect-square"
          style={{
            gridRow: tile.position.row + 1,
            gridColumn: tile.position.col + 1,
          }}
        >
          <Tile tile={tile} onSelect={onTileSelect} />
        </div>
      ))}
    </motion.div>
  );
};

export default GameBoard;
