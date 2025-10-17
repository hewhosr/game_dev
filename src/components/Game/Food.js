import React from 'react';
import { View } from 'react-native';
import { GRID_SIZE } from '../../constants/GameConstants';
import { styles } from '../../styles/GameStyle;
const Food = ({ position }) => {
  if (!position) return null;
  
  return (
    <View
      style={[
        styles.food,
        {
          left: position.x * GRID_SIZE,
          top: position.y * GRID_SIZE,
          width: GRID_SIZE - 1,
          height: GRID_SIZE - 1,
        }
      ]}
    >
      <View style={styles.foodInner} />
      <View style={styles.foodSparkle} />
    </View>
  );
};

export default Food;
