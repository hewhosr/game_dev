import React from 'react';
import { View } from 'react-native';
import { GRID_SIZE } from '../../constants/GameConstants';
import { styles } from '../../styles/GameStyles';

const Snake = ({ body }) => {
  if (!body || !Array.isArray(body)) return null;
  
  return (
    <>
      {body.map((segment, index) => (
        <View
          key={index}
          style={[
            styles.snakeSegment,
            {
              left: segment.x * GRID_SIZE,
              top: segment.y * GRID_SIZE,
              width: GRID_SIZE - 1,
              height: GRID_SIZE - 1,
              backgroundColor: index === 0 ? '#00C853' : '#64DD17',
              ...(index === 0 && {
                backgroundColor: '#00E676',
                shadowColor: '#00C853',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 6,
              })
            }
          ]}
        >
          {index === 0 && (
            <>
              <View style={styles.snakeEyeLeft} />
              <View style={styles.snakeEyeRight} />
            </>
          )}
        </View>
      ))}
    </>
  );
};

export default Snake;