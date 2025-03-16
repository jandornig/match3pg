import { useState, useEffect, useCallback, useRef } from "react";
import {
  Tile,
  Position,
  TileType,
  generateBoard,
  areAdjacent,
  swapTiles,
  findAllMatches,
  markMatchedTiles,
  fillEmptySpaces,
  calculateScore,
  TIME_LIMIT,
} from "@/utils/gameUtils";

export enum GameStatus {
  IDLE = "idle",
  PLAYING = "playing",
  GAME_OVER = "gameOver",
}

export enum ComboMode {
  PER_COLOR = "per_color",
  UNIFIED = "unified"
}

type GameState = {
  board: Tile[][];
  selectedTile: Tile | null;
  score: number;
  highScore: number;
  comboCount: number;
  highestCombo: number;
  timeRemaining: number;
  status: GameStatus;
  matches: Position[][];
  lastMatchesByColor: {
    [key in TileType]?: {
    matchedTiles: number;
    comboValue: number;
    scoreGained: number;
    };
  };
  level: number;
  enemyHealth: number;
  maxEnemyHealth: number;
  playerHealth: number;
  enemyAttack: number;
  colorComboCounts: {
    [key in TileType]?: number;
  };
  enemyAttackTimeRemaining: number;
  playerXP: number;
  xpNeededForNextLevel: number;
  baseBlockValue: number;
  showLevelUp: boolean;
  showKill: boolean;
  showAttack: boolean;
  totalGold: number;
  animationInProgress: boolean;
};

export const useGameState = () => {
  const ATTACK_INTERVAL = 3; // Attack interval in seconds
  const COMBO_TIMER = {
    [ComboMode.PER_COLOR]: 5,
    [ComboMode.UNIFIED]: 3
  };
  
  const [comboMode, setComboMode] = useState<ComboMode>(ComboMode.UNIFIED); // Start with unified mode
  
  const [state, setState] = useState<GameState>({
    board: [],
    selectedTile: null,
    score: 0,
    highScore: 0,
    comboCount: 0,
    highestCombo: 0,
    timeRemaining: COMBO_TIMER[ComboMode.UNIFIED], // Use unified mode timer
    status: GameStatus.IDLE,
    matches: [],
    lastMatchesByColor: {},
    level: 1,
    enemyHealth: 100,
    maxEnemyHealth: 100,
    playerHealth: 100,
    enemyAttack: 5,
    colorComboCounts: {},
    enemyAttackTimeRemaining: ATTACK_INTERVAL,
    playerXP: 0,
    xpNeededForNextLevel: 10,
    baseBlockValue: 1,
    showLevelUp: false,
    showKill: false,
    showAttack: false,
    totalGold: 0,
    animationInProgress: false
  });

  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const processingMoveRef = useRef<boolean>(false);
  const damageTimerRef = useRef<number | null>(null);

  // Add sound references
  const levelUpSound = useRef(new Audio('/sounds/levelup.mp3'));
  const killSound = useRef(new Audio('/sounds/kill.mp3'));

  // Function to show level up animation
  const showLevelUpAnimation = () => {
    levelUpSound.current.play();
    setState(prev => ({ 
      ...prev, 
      showLevelUp: true,
      animationInProgress: true 
    }));
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        showLevelUp: false,
        animationInProgress: false 
      }));
    }, 1000);
  };

  // Function to show kill animation
  const showKillAnimation = () => {
    killSound.current.play();
    setState(prev => ({ 
      ...prev, 
      showKill: true,
      animationInProgress: true 
    }));
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        showKill: false,
        animationInProgress: false 
      }));
    }, 1000);
  };

  // Initialize the game
  const initGame = useCallback(() => {
    const savedHighScore = localStorage.getItem("highScore");
    setState({
      board: generateBoard(1), // Start at level 1
      selectedTile: null,
      score: 0,
      highScore: savedHighScore ? parseInt(savedHighScore) : 0,
      comboCount: 0,
      highestCombo: 0,
      timeRemaining: COMBO_TIMER[ComboMode.UNIFIED], // Use unified mode timer
      status: GameStatus.PLAYING,
      matches: [],
      lastMatchesByColor: {},
      level: 1,
      enemyHealth: 100,
      maxEnemyHealth: 100,
      playerHealth: 100,
      enemyAttack: 5,
      colorComboCounts: {},
      enemyAttackTimeRemaining: ATTACK_INTERVAL,
      playerXP: 0,
      xpNeededForNextLevel: 10,
      baseBlockValue: 1,
      showLevelUp: false,
      showKill: false,
      showAttack: false,
      totalGold: 0,
      animationInProgress: false
    });
    lastTimeRef.current = Date.now();
  }, []);

  // Handle game over
  const handleGameOver = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (damageTimerRef.current) {
      clearInterval(damageTimerRef.current);
      damageTimerRef.current = null;
    }

    setState((prevState) => {
      // Update high score if needed
      if (prevState.score > prevState.highScore) {
        localStorage.setItem("highScore", prevState.score.toString());
        return {
          ...prevState,
          highScore: prevState.score,
          status: GameStatus.GAME_OVER,
          lastMatchesByColor: {},
        };
      }
      return { 
        ...prevState, 
        status: GameStatus.GAME_OVER,
        lastMatchesByColor: {},
      };
    });
  }, []);

  // Timer update function
  const updateTimer = useCallback(() => {
    if (state.status !== GameStatus.PLAYING) return;

    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000;
    lastTimeRef.current = now;

    setState((prevState) => {
      const newTimeRemaining = Math.max(0, prevState.timeRemaining - deltaTime);

      if (newTimeRemaining <= 0) {
        // Reset combo and color combos when timer expires
        return { 
          ...prevState, 
          timeRemaining: COMBO_TIMER[comboMode], 
          comboCount: 0,
          colorComboCounts: {}, // Reset all color combos
          lastMatchesByColor: {}, // Reset last matches display
        };
      }

      return { ...prevState, timeRemaining: newTimeRemaining };
    });

    animationFrameRef.current = requestAnimationFrame(updateTimer);
  }, [state.status, comboMode]);

  // Start timer
  useEffect(() => {
    if (state.status === GameStatus.PLAYING) {
      lastTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.status, updateTimer]);

  // Handle enemy damage and level progression
  const handleEnemyDamage = useCallback((damage: number) => {
    setState((prevState) => {
      const newEnemyHealth = Math.max(0, prevState.enemyHealth - damage);
      
      // If enemy is defeated, advance to next level but keep player health
      if (newEnemyHealth === 0) {
        const nextLevel = prevState.level + 1;
        const nextMaxHealth = 100 * Math.pow(2, nextLevel - 1);
        const nextEnemyAttack = 5 * Math.pow(2, nextLevel - 1);
        return {
          ...prevState,
          board: generateBoard(nextLevel), // Generate new board with current level
          level: nextLevel,
          enemyHealth: nextMaxHealth,
          maxEnemyHealth: nextMaxHealth,
          enemyAttack: nextEnemyAttack,
        };
      }

      return {
        ...prevState,
        enemyHealth: newEnemyHealth,
      };
    });
  }, []);

  // Handle player healing
  const handlePlayerHeal = useCallback((healAmount: number) => {
    setState((prevState) => ({
      ...prevState,
      playerHealth: prevState.playerHealth + healAmount,
    }));
  }, []);

  // Handle player damage from enemy
  useEffect(() => {
    if (state.status !== GameStatus.PLAYING) return;

    // Clear any existing damage timer
    if (damageTimerRef.current) {
      clearInterval(damageTimerRef.current);
    }

    // Set up new damage timer
    damageTimerRef.current = window.setInterval(() => {
      setState((prevState) => {
        const newPlayerHealth = Math.max(0, prevState.playerHealth - prevState.enemyAttack);
        
        // If player health reaches 0, game over
        if (newPlayerHealth === 0) {
          handleGameOver();
          return {
            ...prevState,
            playerHealth: newPlayerHealth,
            enemyAttackTimeRemaining: ATTACK_INTERVAL,
            showAttack: false
          };
        }

        return {
          ...prevState,
          playerHealth: newPlayerHealth,
          enemyAttackTimeRemaining: ATTACK_INTERVAL,
          showAttack: false
        };
      });
    }, ATTACK_INTERVAL * 1000); // Convert seconds to milliseconds

    return () => {
      if (damageTimerRef.current) {
        clearInterval(damageTimerRef.current);
      }
    };
  }, [state.status, state.enemyAttack, handleGameOver]);

  // Update enemy attack timer with batched updates
  useEffect(() => {
    if (state.status !== GameStatus.PLAYING) return;

    let startTime = performance.now();
    let lastUpdate = performance.now();
    let animationFrameId: number;
    let batchedUpdates = {
      timeRemaining: state.enemyAttackTimeRemaining,
      showAttack: false
    };

    const updateTimer = (currentTime: number) => {
      // Limit updates to every 100ms to reduce state updates
      if (currentTime - lastUpdate < 100) {
        animationFrameId = requestAnimationFrame(updateTimer);
        return;
      }

      const elapsedTime = (currentTime - startTime) / 1000;
      const cycleTime = elapsedTime % ATTACK_INTERVAL;
      const remainingTime = ATTACK_INTERVAL - cycleTime;

      // Batch updates
      if (Math.abs(remainingTime - batchedUpdates.timeRemaining) > 0.1) {
        batchedUpdates = {
          timeRemaining: remainingTime,
          showAttack: remainingTime < 0.5
        };
        
        // Only update state if not in the middle of an animation
        if (!state.animationInProgress) {
          setState((prevState) => ({
            ...prevState,
            enemyAttackTimeRemaining: batchedUpdates.timeRemaining,
            showAttack: batchedUpdates.showAttack
          }));
        }
        
        lastUpdate = currentTime;
      }

      // Reset start time when a new cycle begins
      if (cycleTime < 0.01) {
        startTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state.status, state.animationInProgress]);

  // Handle tile selection
  const selectTile = useCallback(
    (tile: Tile) => {
      // Early return if we're already processing a move or the game isn't playing
      if (
        state.status !== GameStatus.PLAYING ||
        processingMoveRef.current ||
        tile.isMatched
      )
        return;

      setState((prevState) => {
        // If no tile is selected, check if this tile has potential matches
        if (!prevState.selectedTile) {
          // Check if this tile has any potential matches with adjacent tiles
          const hasPotentialMatch = prevState.board.some((row, rowIndex) =>
            row.some((t, colIndex) => {
              if (t.id === tile.id) return false;
              if (!areAdjacent(tile.position, { row: rowIndex, col: colIndex }, prevState.board)) return false;
              
              // Try swapping and check for matches
              const testBoard = swapTiles(
                prevState.board,
                tile.position,
                { row: rowIndex, col: colIndex }
              );
              const matches = findAllMatches(testBoard);
              return matches.length > 0;
            })
          );

          // Only allow selection if there's a potential match
          if (!hasPotentialMatch) return prevState;

          return {
            ...prevState,
            board: prevState.board.map((row) =>
              row.map((t) =>
                t.id === tile.id ? { ...t, isSelected: true } : t
              )
            ),
            selectedTile: tile,
          };
        }

        // If this is the same tile, deselect it
        if (prevState.selectedTile.id === tile.id) {
          return {
            ...prevState,
            board: prevState.board.map((row) =>
              row.map((t) =>
                t.id === tile.id ? { ...t, isSelected: false } : t
              )
            ),
            selectedTile: null,
          };
        }

        // Check if tiles are adjacent
        if (areAdjacent(prevState.selectedTile.position, tile.position, prevState.board)) {
          // Set processing flag immediately
          processingMoveRef.current = true;

          // Swap tiles and check for matches
          const newBoard = swapTiles(
            prevState.board,
            prevState.selectedTile.position,
            tile.position
          );

          // Check for matches after swap
          const matches = findAllMatches(newBoard);

          // If no matches, swap back immediately
          if (matches.length === 0) {
            // Store the tile positions before we lose them
            const firstPos = { ...prevState.selectedTile.position };
            const secondPos = { ...tile.position };
            
            // Clear processing flag and revert the swap
            processingMoveRef.current = false;
            const revertedBoard = swapTiles(
              newBoard,
              secondPos,
              firstPos
            );

            return {
              ...prevState,
              board: revertedBoard.map((row) =>
                row.map((t) => ({ ...t, isSelected: false }))
              ),
              selectedTile: null,
            };
          }

          // First mark the tiles as matched
          const markedBoard = markMatchedTiles(newBoard, matches);

          // Calculate new combo count based on mode
          const newComboCount = prevState.comboCount + 1;
          const newHighestCombo = Math.max(prevState.highestCombo, newComboCount);

          // Reset the timer
          const newTimeRemaining = COMBO_TIMER[comboMode];

          // Initialize new color combo counts
          const newColorComboCounts = { ...prevState.colorComboCounts };
          const newLastMatchesByColor = { ...prevState.lastMatchesByColor };

          // Track total matched tiles for unified mode
          let totalMatchedTiles = 0;
          let totalDamage = 0;
          let totalHeal = 0;
          let xpGained = 0;

          // Process matches by color
          matches.forEach(match => {
            if (match.length === 0) return;
            
            const color = markedBoard[match[0].row][match[0].col].type;
            const matchedTiles = match.length;
            totalMatchedTiles += matchedTiles;

            // Calculate base value for this match
            let value = matchedTiles * prevState.baseBlockValue;
            
            if (comboMode === ComboMode.PER_COLOR) {
              // Per-color mode: Each color has its own combo counter
              const previousCombo = newColorComboCounts[color] || 0;
              newColorComboCounts[color] = previousCombo + 1;
              const colorCombo = newColorComboCounts[color];
              value *= colorCombo;
            } else {
              // Unified mode: Use the global combo counter for all colors
              value *= newComboCount;
            }

            // Apply color-specific effects
            if (color === 'grey') {
              value *= 3;
            }

            if (color === 'green') {
              totalHeal += value;
            } else if (color === 'blue') {
              xpGained += value;
            } else if (color === 'yellow') {
              // Add to total gold
              setState(prev => ({
                ...prev,
                totalGold: prev.totalGold + value
              }));
            } else if (color === 'red' || color === 'purple') {
              totalDamage += value;
            }

            // Record match details
            newLastMatchesByColor[color] = {
              matchedTiles,
              comboValue: comboMode === ComboMode.PER_COLOR ? newColorComboCounts[color] : newComboCount,
              scoreGained: value
            };
          });

          // Update player health and game state
          let newPlayerHealth = Math.min(prevState.maxEnemyHealth, prevState.playerHealth + totalHeal);
          let newEnemyHealth = Math.max(0, prevState.enemyHealth - totalDamage);
          let newMaxEnemyHealth = prevState.maxEnemyHealth;
          let newEnemyAttack = prevState.enemyAttack;
          let newLevel = prevState.level;

          if (newEnemyHealth <= 0) {
            xpGained += prevState.maxEnemyHealth;
            newEnemyHealth = prevState.maxEnemyHealth * 2;
            newMaxEnemyHealth = prevState.maxEnemyHealth * 2;
            newEnemyAttack = prevState.enemyAttack * 2;
            showKillAnimation();
          }

          // Calculate total XP and handle level ups
          let currentXP = prevState.playerXP + xpGained;
          let newXPNeeded = prevState.xpNeededForNextLevel;
          let newBaseBlockValue = prevState.baseBlockValue;
          let finalXP = currentXP;
          
          while (currentXP >= newXPNeeded) {
            newLevel += 1;
            newBaseBlockValue += 1;
            const healthBoost = Math.floor(prevState.maxEnemyHealth / 10);
            newPlayerHealth = newPlayerHealth + healthBoost;
            currentXP -= newXPNeeded;
            finalXP = currentXP;
            newXPNeeded = newXPNeeded * 2;
            showLevelUpAnimation();
          }

          // Schedule filling empty spaces
          setTimeout(() => {
            setState((prevState) => {
              const filledBoard = fillEmptySpaces(prevState.board, newLevel, matches, tile.position);
              processingMoveRef.current = false;

              return {
                ...prevState,
                board: filledBoard,
                matches: [],
                playerHealth: newPlayerHealth,
                enemyHealth: newEnemyHealth,
                maxEnemyHealth: newMaxEnemyHealth,
                enemyAttack: newEnemyAttack,
                level: newLevel,
                playerXP: finalXP,
                xpNeededForNextLevel: newXPNeeded,
                baseBlockValue: newBaseBlockValue,
                score: prevState.score + totalDamage,
                comboCount: newComboCount,
                highestCombo: newHighestCombo,
                colorComboCounts: newColorComboCounts,
                lastMatchesByColor: newLastMatchesByColor,
              };
            });
          }, 300);

          return {
            ...prevState,
            board: markedBoard,
            selectedTile: null,
            matches: matches,
            timeRemaining: newTimeRemaining,
            lastMatchesByColor: newLastMatchesByColor,
            colorComboCounts: newColorComboCounts,
            playerHealth: newPlayerHealth,
            enemyHealth: newEnemyHealth,
            maxEnemyHealth: newMaxEnemyHealth,
            enemyAttack: newEnemyAttack,
            level: newLevel,
            playerXP: finalXP,
            xpNeededForNextLevel: newXPNeeded,
            baseBlockValue: newBaseBlockValue,
            score: prevState.score + totalDamage,
            comboCount: newComboCount,
            highestCombo: newHighestCombo,
          };
        }

        // If not adjacent, select the new tile
        return {
          ...prevState,
          board: prevState.board.map((row) =>
            row.map((t) => ({
              ...t,
              isSelected: t.id === tile.id,
            }))
          ),
          selectedTile: tile,
        };
      });
    },
    [state.status, handleEnemyDamage, handlePlayerHeal]
  );

  // Restart game
  const restartGame = useCallback(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    // Check for matches after board updates (for cascade effects)
    if (
      state.status === GameStatus.PLAYING &&
      !processingMoveRef.current &&
      state.matches.length === 0
    ) {
      const matches = findAllMatches(state.board);
      if (matches.length > 0) {
        processingMoveRef.current = true;

        // Process matches
        setState((prevState) => {
          // Calculate new combo count based on mode
          const newComboCount = prevState.comboCount + 1;
          const newHighestCombo = Math.max(prevState.highestCombo, newComboCount);

          // Reset the timer
          const newTimeRemaining = COMBO_TIMER[comboMode];

          // Initialize new color combo counts
          const newColorComboCounts = { ...prevState.colorComboCounts };
          const newLastMatchesByColor = { ...prevState.lastMatchesByColor };

          // Track total matched tiles for unified mode
          let totalMatchedTiles = 0;
          let totalDamage = 0;
          let totalHeal = 0;
          let xpGained = 0;

          // First mark the tiles as matched
          const markedBoard = markMatchedTiles(prevState.board, matches);

          // Process matches by color
          matches.forEach(match => {
            if (match.length === 0) return;
            
            const color = markedBoard[match[0].row][match[0].col].type;
            const matchedTiles = match.length;
            totalMatchedTiles += matchedTiles;

            // Calculate base value for this match
            let value = matchedTiles * prevState.baseBlockValue;
            
            if (comboMode === ComboMode.PER_COLOR) {
              // Per-color mode: Each color has its own combo counter
              const previousCombo = newColorComboCounts[color] || 0;
              newColorComboCounts[color] = previousCombo + 1;
              const colorCombo = newColorComboCounts[color];
              value *= colorCombo;
            } else {
              // Unified mode: Use the global combo counter for all colors
              value *= newComboCount;
            }

            // Apply color-specific effects
            if (color === 'grey') {
              value *= 3;
            }

            if (color === 'green') {
              totalHeal += value;
            } else if (color === 'blue') {
              xpGained += value;
            } else if (color === 'yellow') {
              // Add to total gold
              setState(prev => ({
                ...prev,
                totalGold: prev.totalGold + value
              }));
            } else if (color === 'red' || color === 'purple') {
              totalDamage += value;
            }

            // Record match details
            newLastMatchesByColor[color] = {
              matchedTiles,
              comboValue: comboMode === ComboMode.PER_COLOR ? newColorComboCounts[color] : newComboCount,
              scoreGained: value
            };
          });

          // Update player health and game state
          let newPlayerHealth = Math.min(prevState.maxEnemyHealth, prevState.playerHealth + totalHeal);
          let newEnemyHealth = Math.max(0, prevState.enemyHealth - totalDamage);
          let newMaxEnemyHealth = prevState.maxEnemyHealth;
          let newEnemyAttack = prevState.enemyAttack;
          let newLevel = prevState.level;

          if (newEnemyHealth <= 0) {
            xpGained += prevState.maxEnemyHealth;
            newEnemyHealth = prevState.maxEnemyHealth * 2;
            newMaxEnemyHealth = prevState.maxEnemyHealth * 2;
            newEnemyAttack = prevState.enemyAttack * 2;
            showKillAnimation();
          }

          // Calculate total XP and handle level ups
          let currentXP = prevState.playerXP + xpGained;
          let newXPNeeded = prevState.xpNeededForNextLevel;
          let newBaseBlockValue = prevState.baseBlockValue;
          let finalXP = currentXP;
          
          while (currentXP >= newXPNeeded) {
            newLevel += 1;
            newBaseBlockValue += 1;
            const healthBoost = Math.floor(prevState.maxEnemyHealth / 10);
            newPlayerHealth = newPlayerHealth + healthBoost;
            currentXP -= newXPNeeded;
            finalXP = currentXP;
            newXPNeeded = newXPNeeded * 2;
            showLevelUpAnimation();
          }

          // Schedule filling empty spaces
          setTimeout(() => {
            setState((prevState) => {
              const filledBoard = fillEmptySpaces(prevState.board, newLevel, matches);
              processingMoveRef.current = false;

              return {
                ...prevState,
                board: filledBoard,
                matches: [],
                playerHealth: newPlayerHealth,
                enemyHealth: newEnemyHealth,
                maxEnemyHealth: newMaxEnemyHealth,
                enemyAttack: newEnemyAttack,
                level: newLevel,
                playerXP: finalXP,
                xpNeededForNextLevel: newXPNeeded,
                baseBlockValue: newBaseBlockValue,
                score: prevState.score + totalDamage,
                comboCount: newComboCount,
                highestCombo: newHighestCombo,
                colorComboCounts: newColorComboCounts,
                lastMatchesByColor: newLastMatchesByColor,
              };
            });
          }, 300);

          return {
            ...prevState,
            board: markedBoard,
            matches: matches,
            timeRemaining: newTimeRemaining,
            lastMatchesByColor: newLastMatchesByColor,
            colorComboCounts: newColorComboCounts,
            playerHealth: newPlayerHealth,
            enemyHealth: newEnemyHealth,
            maxEnemyHealth: newMaxEnemyHealth,
            enemyAttack: newEnemyAttack,
            level: newLevel,
            playerXP: finalXP,
            xpNeededForNextLevel: newXPNeeded,
            baseBlockValue: newBaseBlockValue,
            score: prevState.score + totalDamage,
            comboCount: newComboCount,
            highestCombo: newHighestCombo,
          };
        });
      } else {
        processingMoveRef.current = false;
      }
    }
  }, [state.board, state.status, state.matches, comboMode]);

  // Initialize game on first render
  useEffect(() => {
    initGame();
  }, [initGame]);

  return {
    ...state,
    selectTile,
    restartGame,
  };
};
