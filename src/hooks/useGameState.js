import { useState, useRef } from 'react';
import { INITIAL_SNAKE } from '../constants/GameConstants';
import { generateFood } from '../utils/GameLogic';

export const useGameState = () => {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(null);
  
  const gameEngineRef = useRef(null);
  const lastUpdateTime = useRef(Date.now());

  const [entities, setEntities] = useState({
    snake: { 
      body: [...INITIAL_SNAKE], 
      direction: 'right', 
      nextDirection: 'right'
    },
    food: { x: 10, y: 10 }
  });

  const resetGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }

    const newSnake = [...INITIAL_SNAKE];
    const newFood = generateFood(newSnake);
    
    const newEntities = {
      snake: { 
        body: newSnake, 
        direction: 'right', 
        nextDirection: 'right'
      },
      food: newFood
    };
    
    setEntities(newEntities);
    setScore(0);
    lastUpdateTime.current = Date.now();
    
    return newEntities;
  };

  const startGame = () => {
    resetGame();
    setGameState('playing');
    
    setTimeout(() => {
      if (gameEngineRef.current) {
        gameEngineRef.current.start();
      }
    }, 100);
  };

  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const endGame = () => {
    setGameState('game-over');
  };

  return {
    gameState,
    setGameState,
    score,
    setScore,
    difficulty,
    setDifficulty,
    entities,
    setEntities,
    gameEngineRef,
    lastUpdateTime,
    resetGame,
    startGame,
    togglePause,
    endGame
  };
};