import { moveSnake, checkCollision, generateFood } from './GameLogic';

export const GameLoop = (entities, { events, time }, {
  gameState,
  difficulty,
  score,
  setScore,
  setEntities,
  onEndGame,
  lastUpdateTime
}) => {
  if (gameState !== 'playing') {
    return entities;
  }

  const now = Date.now();
  const delta = now - lastUpdateTime.current;
  
  if (delta < difficulty.speed) {
    return entities;
  }
  
  lastUpdateTime.current = now;

  let { snake, food } = entities;
  
  if (!snake.body || snake.body.length === 0) {
    return entities;
  }

  let newSnake = [...snake.body];
  let newDirection = snake.nextDirection;

  if (events.length) {
    events.forEach((e) => {
      if (e.type === 'swipe-up' && snake.direction !== 'down') newDirection = 'up';
      else if (e.type === 'swipe-down' && snake.direction !== 'up') newDirection = 'down';
      else if (e.type === 'swipe-left' && snake.direction !== 'right') newDirection = 'left';
      else if (e.type === 'swipe-right' && snake.direction !== 'left') newDirection = 'right';
      else if (e.type === 'joystick-move') {
        const { dx, dy } = e;
        const deadZone = 0.3;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > deadZone && snake.direction !== 'left') newDirection = 'right';
          else if (dx < -deadZone && snake.direction !== 'right') newDirection = 'left';
        } else {
          if (dy > deadZone && snake.direction !== 'up') newDirection = 'down';
          else if (dy < -deadZone && snake.direction !== 'down') newDirection = 'up';
        }
      }
    });
  }

  const { newSnake: updatedSnake, head } = moveSnake(snake, newDirection);

  if (checkCollision(head, updatedSnake)) {
    onEndGame();
    return entities;
  }

  if (head.x === food.x && head.y === food.y) {
    const newFood = generateFood(updatedSnake);
    const points = 10;
    const newScore = score + points;
    setScore(newScore);
    
    return {
      snake: { 
        ...snake, 
        body: updatedSnake, 
        direction: newDirection, 
        nextDirection: newDirection
      },
      food: { ...food, position: newFood }
    };
  } else {
    updatedSnake.pop();
    return {
      snake: { 
        ...snake, 
        body: updatedSnake, 
        direction: newDirection, 
        nextDirection: newDirection
      },
      food
    };
  }
};