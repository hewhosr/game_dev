import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const GAME_WIDTH = width;
export const GAME_HEIGHT = height * 0.7;
export const CELL_SIZE = 20;
export const GRID_WIDTH = Math.floor(GAME_WIDTH / CELL_SIZE);
export const GRID_HEIGHT = Math.floor(GAME_HEIGHT / CELL_SIZE);

export const COLORS = {
  background: '#1a1a2e',
  snake: '#00ff88',
  snakeHead: '#00cc66',
  food: '#ff4466',
  grid: '#2a2a3e',
  text: '#ffffff',
  textSecondary: '#888888',
  accent: '#6c5ce7',
  success: '#00b894',
  danger: '#d63031',
};

export const INITIAL_SNAKE = [
  { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) },
  { x: Math.floor(GRID_WIDTH / 2) - 1, y: Math.floor(GRID_HEIGHT / 2) },
  { x: Math.floor(GRID_WIDTH / 2) - 2, y: Math.floor(GRID_HEIGHT / 2) },
];

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};