import React from 'react';
import { View } from 'react-native';
import { CELL_SIZE, COLORS } from '../../constants/GameConstants';

const Snake = ({ snake }) => {
  return (
    <>
      {snake.map((segment, index) => (
        <View
          key={`snake-${index}`}
          style={{
            position: 'absolute',
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: segment.x * CELL_SIZE,
            top: segment.y * CELL_SIZE,
            backgroundColor: index === 0 ? COLORS.snakeHead : COLORS.snake,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: index === 0 ? COLORS.snake : COLORS.snakeHead,
          }}
        />
      ))}
    </>
  );
};

export default Snake;