import { GRID_WIDTH, GRID_HEIGHT, DIRECTIONS } from '../constants/GameConstants';

export const checkCollision = (head, snake) => {
  // Check wall collision
  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    return true;
  }
  
  // Check self collision
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  
  return false;
};

export const checkFoodCollision = (head, food) => {
  return head.x === food.x && head.y === food.y;
};

export const generateFood = (snake) => {
  let food;
  let isOnSnake;
  
  do {
    food = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT),
    };
    
    isOnSnake = snake.some(segment => segment.x === food.x && segment.y === food.y);
  } while (isOnSnake);
  
  return food;
};

export const moveSnake = (snake, direction, grow = false) => {
  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };
  
  const newSnake = [newHead, ...snake];
  
  if (!grow) {
    newSnake.pop();
  }
  
  return newSnake;
};

export const getOppositeDirection = (direction) => {
  if (direction === DIRECTIONS.UP) return DIRECTIONS.DOWN;
  if (direction === DIRECTIONS.DOWN) return DIRECTIONS.UP;
  if (direction === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
  if (direction === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
  return direction;
};