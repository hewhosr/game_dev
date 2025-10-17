import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GRID_SIZE = 20;
export const GAME_WIDTH = 300;
export const GAME_HEIGHT = 300;
export const INITIAL_SNAKE = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
export const SCREEN_DIMENSIONS = { SCREEN_WIDTH, SCREEN_HEIGHT };
