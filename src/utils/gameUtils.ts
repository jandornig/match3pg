export type TileType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'grey';
export type Position = { row: number; col: number };
export type Tile = {
  id: string;
  type: TileType;
  position: Position;
  isSelected: boolean;
  isMatched: boolean;
  countdown?: number; // Optional countdown for grey tiles
  isBomb?: boolean; // Whether this tile is a bomb variant
  isBolt?: boolean; // Whether this tile is a bolt variant
  highlightType?: TileType; // Type to highlight the tile as during match-4 effect
};

export const TILE_TYPES: TileType[] = ['red', 'blue', 'green', 'yellow', 'purple'];
export const GREY_TILE: TileType = 'grey';
export const BOARD_SIZE = 8;
export const MATCH_MIN = 3;
export const TIME_LIMIT = 5; // seconds
export const POINTS_PER_TILE = 10;
export const COMBO_MULTIPLIER = 1.0; // Changed to 1.0 for full combo effect

// Generate a random tile type based on level
export const getRandomTileType = (level: number = 1): TileType => {
  // From level 3 onwards, give grey tiles a 5% chance of appearing
  if (level >= 3 && Math.random() < 0.05) {
    return GREY_TILE;
  }
  // Otherwise return a random normal tile
  const index = Math.floor(Math.random() * TILE_TYPES.length);
  return TILE_TYPES[index];
};

// Create a new tile with a unique ID
export const createTile = (row: number, col: number, level: number = 1, options?: { type?: TileType; isBomb?: boolean; isBolt?: boolean }): Tile => {
  const type = options?.type || getRandomTileType(level);
  return {
    id: `tile-${row}-${col}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    position: { row, col },
    isSelected: false,
    isMatched: false,
    countdown: type === 'grey' ? 3 : undefined,
    isBomb: options?.isBomb || false,
    isBolt: options?.isBolt || false,
  };
};

// Generate a new board
export const generateBoard = (level: number = 1): Tile[][] => {
  const board: Tile[][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = createTile(row, col, level);
    }
  }
  
  // Remove any initial matches
  let hasMatches = true;
  while (hasMatches) {
    const matches = findAllMatches(board);
    if (matches.length === 0) {
      hasMatches = false;
    } else {
      // Replace matched tiles
      matches.flat().forEach(pos => {
        const { row, col } = pos;
        board[row][col] = createTile(row, col, level);
      });
    }
  }
  
  return board;
};

// Check if two positions are adjacent
export const areAdjacent = (pos1: Position, pos2: Position, board: Tile[][]): boolean => {
  // Don't allow swapping if either tile is grey
  if (board[pos1.row][pos1.col].type === 'grey' || board[pos2.row][pos2.col].type === 'grey') {
    return false;
  }
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Swap two tiles
export const swapTiles = (board: Tile[][], pos1: Position, pos2: Position): Tile[][] => {
  const newBoard = [...board.map(row => [...row])];
  const tile1 = { ...newBoard[pos1.row][pos1.col] };
  const tile2 = { ...newBoard[pos2.row][pos2.col] };
  
  // Update positions
  tile1.position = { ...pos2 };
  tile2.position = { ...pos1 };
  
  // Swap tiles
  newBoard[pos1.row][pos1.col] = tile2;
  newBoard[pos2.row][pos2.col] = tile1;
  
  return newBoard;
};

// Find matches in a row
const findRowMatches = (board: Tile[][]): Position[][] => {
  const matches: Position[][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    let currentType: TileType | null = null;
    let matchLength = 1;
    let startCol = 0;
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = board[row][col];
      
      // When encountering a grey tile, just reset the sequence
      if (tile.type === 'grey') {
        if (matchLength >= MATCH_MIN) {
          const match: Position[] = [];
          if (matchLength === 4) {
            // For match-4, collect all tiles of the same type in the row
            let rowMatch: Position[] = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
              if (board[row][i].type !== 'grey' && board[row][i].type === currentType) {
                rowMatch.push({ row, col: i });
              }
            }
            // Only add if we found matching tiles
            if (rowMatch.length > 0) {
              // Add a flag to identify this as a match-4
              rowMatch = rowMatch.map(pos => ({ ...pos, isMatch4: true }));
              matches.push(rowMatch);
            }
          } else {
            // For regular matches, just add the consecutive tiles
            for (let i = 0; i < matchLength; i++) {
              match.push({ row, col: startCol + i });
            }
            matches.push(match);
          }
        }
        currentType = null;
        matchLength = 1;
        startCol = col + 1;
        continue;
      }
      
      if (currentType === null || tile.type !== currentType) {
        // Check if the previous sequence was a match
        if (matchLength >= MATCH_MIN) {
          const match: Position[] = [];
          if (matchLength === 4) {
            // For match-4, collect all tiles of the same type in the row
            let rowMatch: Position[] = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
              if (board[row][i].type !== 'grey' && board[row][i].type === currentType) {
                rowMatch.push({ row, col: i });
              }
            }
            // Only add if we found matching tiles
            if (rowMatch.length > 0) {
              // Add a flag to identify this as a match-4
              rowMatch = rowMatch.map(pos => ({ ...pos, isMatch4: true }));
              matches.push(rowMatch);
            }
          } else {
            // For regular matches, just add the consecutive tiles
            for (let i = 0; i < matchLength; i++) {
              match.push({ row, col: startCol + i });
            }
            matches.push(match);
          }
        }
        
        // Reset for the new type
        currentType = tile.type;
        matchLength = 1;
        startCol = col;
      } else {
        matchLength++;
      }
      
      // Check for match at the end of the row
      if (col === BOARD_SIZE - 1 && matchLength >= MATCH_MIN) {
        const match: Position[] = [];
        if (matchLength === 4) {
          // For match-4, collect all tiles of the same type in the row
          let rowMatch: Position[] = [];
          for (let i = 0; i < BOARD_SIZE; i++) {
            if (board[row][i].type !== 'grey' && board[row][i].type === currentType) {
              rowMatch.push({ row, col: i });
            }
          }
          // Only add if we found matching tiles
          if (rowMatch.length > 0) {
            // Add a flag to identify this as a match-4
            rowMatch = rowMatch.map(pos => ({ ...pos, isMatch4: true }));
            matches.push(rowMatch);
          }
        } else {
          // For regular matches, just add the consecutive tiles
          for (let i = 0; i < matchLength; i++) {
            match.push({ row, col: startCol + i });
          }
          matches.push(match);
        }
      }
    }
  }
  
  return matches;
};

// Find matches in a column
const findColMatches = (board: Tile[][]): Position[][] => {
  const matches: Position[][] = [];
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    let currentType: TileType | null = null;
    let matchLength = 1;
    let startRow = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      const tile = board[row][col];
      
      // When encountering a grey tile, just reset the sequence
      if (tile.type === 'grey') {
        if (matchLength >= MATCH_MIN) {
          const match: Position[] = [];
          if (matchLength === 4) {
            // For match-4, collect all tiles of the same type in the column
            let colMatch: Position[] = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
              if (board[i][col].type !== 'grey' && board[i][col].type === currentType) {
                colMatch.push({ row: i, col });
              }
            }
            // Only add if we found matching tiles
            if (colMatch.length > 0) {
              // Add a flag to identify this as a match-4
              colMatch = colMatch.map(pos => ({ ...pos, isMatch4: true }));
              matches.push(colMatch);
            }
          } else {
            // For regular matches, just add the consecutive tiles
            for (let i = 0; i < matchLength; i++) {
              match.push({ row: startRow + i, col });
            }
            matches.push(match);
          }
        }
        currentType = null;
        matchLength = 1;
        startRow = row + 1;
        continue;
      }
      
      if (currentType === null || tile.type !== currentType) {
        // Check if the previous sequence was a match
        if (matchLength >= MATCH_MIN) {
          const match: Position[] = [];
          if (matchLength === 4) {
            // For match-4, collect all tiles of the same type in the column
            let colMatch: Position[] = [];
            for (let i = 0; i < BOARD_SIZE; i++) {
              if (board[i][col].type !== 'grey' && board[i][col].type === currentType) {
                colMatch.push({ row: i, col });
              }
            }
            // Only add if we found matching tiles
            if (colMatch.length > 0) {
              // Add a flag to identify this as a match-4
              colMatch = colMatch.map(pos => ({ ...pos, isMatch4: true }));
              matches.push(colMatch);
            }
          } else {
            // For regular matches, just add the consecutive tiles
            for (let i = 0; i < matchLength; i++) {
              match.push({ row: startRow + i, col });
            }
            matches.push(match);
          }
        }
        
        // Reset for the new type
        currentType = tile.type;
        matchLength = 1;
        startRow = row;
      } else {
        matchLength++;
      }
      
      // Check for match at the end of the column
      if (row === BOARD_SIZE - 1 && matchLength >= MATCH_MIN) {
        const match: Position[] = [];
        if (matchLength === 4) {
          // For match-4, collect all tiles of the same type in the column
          let colMatch: Position[] = [];
          for (let i = 0; i < BOARD_SIZE; i++) {
            if (board[i][col].type !== 'grey' && board[i][col].type === currentType) {
              colMatch.push({ row: i, col });
            }
          }
          // Only add if we found matching tiles
          if (colMatch.length > 0) {
            // Add a flag to identify this as a match-4
            colMatch = colMatch.map(pos => ({ ...pos, isMatch4: true }));
            matches.push(colMatch);
          }
        } else {
          // For regular matches, just add the consecutive tiles
          for (let i = 0; i < matchLength; i++) {
            match.push({ row: startRow + i, col });
          }
          matches.push(match);
        }
      }
    }
  }
  
  return matches;
};

// Find all matches on the board
export const findAllMatches = (board: Tile[][]): Position[][] => {
  const rowMatches = findRowMatches(board);
  const colMatches = findColMatches(board);
  return [...rowMatches, ...colMatches];
};

// Check if a position is adjacent to any match
const isAdjacentToMatch = (pos: Position, matches: Position[][]): boolean => {
  return matches.flat().some(matchPos => {
    const rowDiff = Math.abs(pos.row - matchPos.row);
    const colDiff = Math.abs(pos.col - matchPos.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  });
};

// Mark matched tiles and update grey tiles
export const markMatchedTiles = (board: Tile[][], matches: Position[][]): Tile[][] => {
  const newBoard = [...board.map(row => [...row])];
  
  // First check for bomb and bolt tiles in matches
  let bombExplosions: { pos: Position, color: TileType }[] = [];
  let boltEffects: { color: TileType }[] = [];
  matches.flat().forEach(pos => {
    const tile = board[pos.row][pos.col];
    if (tile.isBomb) {
      bombExplosions.push({ pos, color: tile.type });
    }
    if (tile.isBolt) {
      boltEffects.push({ color: tile.type });
    }
  });

  // Keep track of processed positions to avoid infinite loops
  const processedPositions = new Set<string>();

  // Process bolt effects first - they affect the entire board
  boltEffects.forEach(({ color }) => {
    // Mark all tiles of the same color as matched
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const tile = newBoard[row][col];
        if (tile.type === color) {
          const posKey = `${row},${col}`;
          if (!processedPositions.has(posKey)) {
            // If this is a bomb, queue it for explosion
            if (tile.isBomb) {
              bombExplosions.push({ pos: { row, col }, color: tile.type });
            }
            // Mark the tile as matched
            newBoard[row][col] = {
              ...tile,
              isMatched: true,
              highlightType: color,
              isBolt: false, // Remove bolt status if it was a bolt tile
            };
            processedPositions.add(posKey);
          }
        }
      }
    }
  });

  // Process matches to identify match-4 rows/columns
  matches.forEach(match => {
    // Check if this is a match-4 (any position in the match will have the flag)
    if (match[0] && (match[0] as any).isMatch4) {
      const isHorizontal = match[0].row === match[1]?.row;
      const matchColor = board[match[0].row][match[0].col].type;
      
      if (isHorizontal) {
        // Highlight entire row
        const row = match[0].row;
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (newBoard[row][col].type !== 'grey') {
            // Check if this tile is a bomb before changing it
            if (newBoard[row][col].isBomb) {
              bombExplosions.push({ pos: { row, col }, color: newBoard[row][col].type });
              // Don't highlight or mark as matched yet - let the bomb explosion handle it
              continue;
            }
            newBoard[row][col] = {
              ...newBoard[row][col],
              highlightType: matchColor,
              isMatched: true,
            };
            processedPositions.add(`${row},${col}`);
          }
        }
      } else {
        // Highlight entire column
        const col = match[0].col;
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (newBoard[row][col].type !== 'grey') {
            // Check if this tile is a bomb before changing it
            if (newBoard[row][col].isBomb) {
              bombExplosions.push({ pos: { row, col }, color: newBoard[row][col].type });
              // Don't highlight or mark as matched yet - let the bomb explosion handle it
              continue;
            }
            newBoard[row][col] = {
              ...newBoard[row][col],
              highlightType: matchColor,
              isMatched: true,
            };
            processedPositions.add(`${row},${col}`);
          }
        }
      }
    }
  });

  // Process bomb explosions and chain reactions
  while (bombExplosions.length > 0) {
    const { pos, color } = bombExplosions.shift()!;
    const posKey = `${pos.row},${pos.col}`;
    
    // Skip if already processed
    if (processedPositions.has(posKey)) continue;

    // Get all positions within 2 tiles (including diagonals)
    for (let row = Math.max(0, pos.row - 2); row <= Math.min(BOARD_SIZE - 1, pos.row + 2); row++) {
      for (let col = Math.max(0, pos.col - 2); col <= Math.min(BOARD_SIZE - 1, pos.col + 2); col++) {
        const affectedPosKey = `${row},${col}`;
        if (processedPositions.has(affectedPosKey)) continue;

        // First check if this position has a bomb that wasn't processed yet
        if (newBoard[row][col].isBomb) {
          // Queue this bomb for explosion before marking it
          bombExplosions.push({
            pos: { row, col },
            color: newBoard[row][col].type
          });
        }

        // Then mark the affected tile
        newBoard[row][col] = {
          ...newBoard[row][col],
          isMatched: true,
          highlightType: color, // Add highlight effect for explosion
        };

        // Don't add explosion positions to matches array - they shouldn't create new special tiles
        processedPositions.add(affectedPosKey);
      }
    }

    // Finally mark the initial bomb tile itself as matched and remove its bomb status
    newBoard[pos.row][pos.col] = {
      ...newBoard[pos.row][pos.col],
      isBomb: false,
      isMatched: true,
      highlightType: color,
    };
    processedPositions.add(posKey);
  }

  // Then mark all remaining matched tiles that weren't processed yet
  matches.flat().forEach(pos => {
    const { row, col } = pos;
    const posKey = `${row},${col}`;
    if (!processedPositions.has(posKey)) {
      newBoard[row][col] = {
        ...newBoard[row][col],
        isMatched: true,
      };
      processedPositions.add(posKey);
    }
  });
  
  // Finally check all grey tiles for adjacency to matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const posKey = `${row},${col}`;
      if (processedPositions.has(posKey)) continue;

      const tile = newBoard[row][col];
      if (tile.type === 'grey' && tile.countdown && !tile.isMatched) {
        if (isAdjacentToMatch({ row, col }, matches)) {
          const newCountdown = tile.countdown - 1;
          if (newCountdown <= 0) {
            newBoard[row][col] = {
              ...tile,
              isMatched: true,
              countdown: 0,
            };
          } else {
            newBoard[row][col] = {
              ...tile,
              countdown: newCountdown,
            };
          }
          processedPositions.add(posKey);
        }
      }
    }
  }
  
  return newBoard;
};

// Fill empty spaces with new tiles
export const fillEmptySpaces = (board: Tile[][], level: number = 1, matches?: Position[][], lastSwappedPos?: Position): Tile[][] => {
  const newBoard = [...board.map(row => [...row])];
  
  // Clear highlight effect from all tiles first
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (newBoard[row][col].highlightType) {
        newBoard[row][col] = {
          ...newBoard[row][col],
          highlightType: undefined,
        };
      }
    }
  }
  
  // If we have matches, check for match-5 to create special tiles
  if (matches && lastSwappedPos) {
    // Create a map to track all matched positions
    const matchedTiles = new Map<string, { pos: Position, color: TileType }>();
    
    // First pass: collect all matched positions
    matches.forEach(match => {
      match.forEach(pos => {
        const key = `${pos.row},${pos.col}`;
        const color = board[pos.row][pos.col].type;
        matchedTiles.set(key, { pos, color });
      });
    });
    
    // Function to check if a match is a straight line of 5
    const isStraightLine = (positions: Position[]): boolean => {
      if (positions.length !== 5) return false;
      
      // Check if all positions are in the same row
      const sameRow = positions.every(pos => pos.row === positions[0].row);
      if (sameRow) {
        // Sort by column and check if they're consecutive
        const cols = positions.map(pos => pos.col).sort((a, b) => a - b);
        return cols[4] - cols[0] === 4;
      }
      
      // Check if all positions are in the same column
      const sameCol = positions.every(pos => pos.col === positions[0].col);
      if (sameCol) {
        // Sort by row and check if they're consecutive
        const rows = positions.map(pos => pos.row).sort((a, b) => a - b);
        return rows[4] - rows[0] === 4;
      }
      
      return false;
    };
    
    // Function to get all connected tiles of the same color
    const getConnectedTiles = (startPos: Position, color: TileType, visited: Set<string>): Position[] => {
      const connected: Position[] = [];
      const queue: Position[] = [startPos];
      
      while (queue.length > 0) {
        const pos = queue.shift()!;
        const key = `${pos.row},${pos.col}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        connected.push(pos);
        
        // Check all adjacent positions
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
          const newRow = pos.row + dx;
          const newCol = pos.col + dy;
          const newKey = `${newRow},${newCol}`;
          
          const matchedTile = matchedTiles.get(newKey);
          if (matchedTile && matchedTile.color === color && !visited.has(newKey)) {
            queue.push(matchedTile.pos);
          }
        }
      }
      
      return connected;
    };
    
    // Find all connected groups
    const visited = new Set<string>();
    for (const [key, { pos, color }] of matchedTiles) {
      if (!visited.has(key)) {
        const connectedTiles = getConnectedTiles(pos, color, visited);
        
        if (connectedTiles.length >= 5) {
          // Check if it's a straight line of 5
          if (isStraightLine(connectedTiles)) {
            console.log('Found straight line of 5 tiles, creating bolt tile');
            // Create bolt tile at the last swapped position if it's part of this match
            const lastSwappedKey = `${lastSwappedPos.row},${lastSwappedPos.col}`;
            if (matchedTiles.has(lastSwappedKey)) {
              newBoard[lastSwappedPos.row][lastSwappedPos.col] = createTile(lastSwappedPos.row, lastSwappedPos.col, level, {
                type: color,
                isBolt: true
              });
              newBoard[lastSwappedPos.row][lastSwappedPos.col].isMatched = false;
              
              // Remove this position from matches
              matches.forEach(match => {
                const idx = match.findIndex(p => p.row === lastSwappedPos.row && p.col === lastSwappedPos.col);
                if (idx !== -1) {
                  match.splice(idx, 1);
                }
              });
            }
          } else if (connectedTiles.length >= 5) {
            // Handle T-shapes and other 5+ matches with bomb tiles
            console.log(`Found match of ${connectedTiles.length} tiles at positions:`, connectedTiles);
            
            // First check if the last swapped position is part of this match
            const lastSwappedKey = `${lastSwappedPos.row},${lastSwappedPos.col}`;
            if (matchedTiles.has(lastSwappedKey) && matchedTiles.get(lastSwappedKey)!.color === color) {
              // If last swapped position is part of the match, create bomb there
              newBoard[lastSwappedPos.row][lastSwappedPos.col] = createTile(lastSwappedPos.row, lastSwappedPos.col, level, {
                type: color,
                isBomb: true
              });
              newBoard[lastSwappedPos.row][lastSwappedPos.col].isMatched = false;
              
              // Remove this position from matches
              matches.forEach(match => {
                const idx = match.findIndex(p => p.row === lastSwappedPos.row && p.col === lastSwappedPos.col);
                if (idx !== -1) {
                  match.splice(idx, 1);
                }
              });
            } else {
              // If last swapped position is not part of the match, find the best position
              let bombPos = connectedTiles[0];
              let maxAdjacent = 0;
              
              connectedTiles.forEach(pos => {
                let adjacentCount = 0;
                const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (const [dx, dy] of directions) {
                  const checkKey = `${pos.row + dx},${pos.col + dy}`;
                  if (matchedTiles.has(checkKey) && matchedTiles.get(checkKey)!.color === color) {
                    adjacentCount++;
                  }
                }
                if (adjacentCount > maxAdjacent) {
                  maxAdjacent = adjacentCount;
                  bombPos = pos;
                }
              });
              
              newBoard[bombPos.row][bombPos.col] = createTile(bombPos.row, bombPos.col, level, {
                type: color,
                isBomb: true
              });
              newBoard[bombPos.row][bombPos.col].isMatched = false;
              
              matches.forEach(match => {
                const idx = match.findIndex(p => p.row === bombPos.row && p.col === bombPos.col);
                if (idx !== -1) {
                  match.splice(idx, 1);
                }
              });
            }
          }
        }
      }
    }
  }
  
  // Start from the bottom row and work up
  for (let col = 0; col < BOARD_SIZE; col++) {
    let emptySpaces = 0;
    
    // First, check and mark grey tiles at the bottom for removal
    if (newBoard[BOARD_SIZE - 1][col].type === 'grey') {
      newBoard[BOARD_SIZE - 1][col].isMatched = true;
    }
    
    // Count matched tiles and shift down non-matched tiles
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col].isMatched) {
        emptySpaces++;
        newBoard[row][col] = null as any; // Mark as empty
      } else if (emptySpaces > 0) {
        // Move tile down by emptySpaces
        const newRow = row + emptySpaces;
        const movedTile = {
          ...newBoard[row][col],
          position: { row: newRow, col },
        };
        newBoard[newRow][col] = movedTile;
        newBoard[row][col] = null as any; // Mark original position as empty
      }
    }
    
    // Fill empty spaces at the top with new tiles
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (newBoard[row][col] === null) {
        // Create new tile with negative row for animation
        const virtualRow = row - emptySpaces - 1;
        newBoard[row][col] = {
          ...createTile(virtualRow, col, level),
          position: { row, col },
        };
      }
    }
  }
  
  return newBoard;
};

// Calculate score for matches - Updated to properly use combo count
export const calculateScore = (matches: Position[][], comboCount: number): number => {
  // Count total matched tiles
  const matchedTiles = matches.flat().length;
  
  // Base score is the number of matched tiles times the points per tile
  const baseScore = matchedTiles * POINTS_PER_TILE;
  
  // Apply combo multiplier (comboCount multiplies the score directly)
  // If combo is 0, we still give the base score
  const finalScore = Math.max(1, comboCount) * baseScore;
  
  return finalScore;
};
