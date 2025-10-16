import { GRID_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../constants/GameConstants';

export const generateFood = (snakeBody) => {
  let newFood;
  let attempts = 0;
  const maxX = Math.floor(GAME_WIDTH / GRID_SIZE);
  const maxY = Math.floor(GAME_HEIGHT / GRID_SIZE);
  
  do {
    newFood = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY)
    };
    attempts++;
  } while (
    snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
    attempts < 100
  );
  return newFood;
};

export const checkCollision = (head, snakeBody) => {
  if (snakeBody.length > 3) {
    return snakeBody.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    );
  }
  return false;
};

export const moveSnake = (snake, direction) => {
  const newSnake = [...snake.body];
  let head = { ...newSnake[0] };
  
  switch (direction) {
    case 'up': head.y -= 1; break;
    case 'down': head.y += 1; break;
    case 'left': head.x -= 1; break;
    case 'right': head.x += 1; break;
  }

  const maxX = Math.floor(GAME_WIDTH / GRID_SIZE);
  const maxY = Math.floor(GAME_HEIGHT / GRID_SIZE);
  
  // Wall wrapping
  if (head.x < 0) head.x = maxX - 1;
  else if (head.x >= maxX) head.x = 0;
  if (head.y < 0) head.y = maxY - 1;
  else if (head.y >= maxY) head.y = 0;

  newSnake.unshift(head);
  
  return {
    newSnake,
    head
  };
};