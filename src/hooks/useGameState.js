import { useState, useRef, useEffect } from 'react';
import { INITIAL_SNAKE, DIRECTIONS } from '../constants/GameConstants';
import { DIFFICULTY_SETTINGS } from '../constants/Difficulty';
import {
  checkCollision,
  checkFoodCollision,
  generateFood,
  moveSnake,
  getOppositeDirection,
} from '../utils/GameLogic';
import { GameLoop } from '../utils/GameLoop';

export const useGameState = (difficulty) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(() => generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const directionRef = useRef(direction);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameLoopRef = useRef(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const update = () => {
    const currentSnake = snakeRef.current;
    const currentDirection = directionRef.current;
    const currentFood = foodRef.current;

    const newHead = {
      x: currentSnake[0].x + currentDirection.x,
      y: currentSnake[0].y + currentDirection.y,
    };

    if (checkCollision(newHead, currentSnake)) {
      gameLoopRef.current?.stop();
      setIsGameOver(true);
      return;
    }

    const ateFood = checkFoodCollision(newHead, currentFood);
    const newSnake = moveSnake(currentSnake, currentDirection, ateFood);

    setSnake(newSnake);

    if (ateFood) {
      const multiplier = DIFFICULTY_SETTINGS[difficulty].scoreMultiplier;
      setScore(prev => prev + Math.floor(10 * multiplier));
      setFood(generateFood(newSnake));
    }
  };

  const startGame = () => {
    const speed = DIFFICULTY_SETTINGS[difficulty].speed;
    gameLoopRef.current = new GameLoop(update, speed);
    gameLoopRef.current.start();
  };

  const pauseGame = () => {
    setIsPaused(true);
    gameLoopRef.current?.stop();
  };

  const resumeGame = () => {
    setIsPaused(false);
    gameLoopRef.current?.start();
  };

  const resetGame = () => {
    gameLoopRef.current?.stop();
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const changeDirection = (newDirection) => {
    const opposite = getOppositeDirection(directionRef.current);
    if (newDirection !== opposite) {
      setDirection(newDirection);
    }
  };

  useEffect(() => {
    startGame();
    return () => {
      gameLoopRef.current?.stop();
    };
  }, []);

  return {
    snake,
    food,
    direction,
    score,
    isGameOver,
    isPaused,
    changeDirection,
    pauseGame,
    resumeGame,
    resetGame,
  };
};