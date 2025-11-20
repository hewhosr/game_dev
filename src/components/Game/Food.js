import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { CELL_SIZE, COLORS } from '../../constants/GameConstants';

const Food = ({ food }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: food.x * CELL_SIZE,
        top: food.y * CELL_SIZE,
        backgroundColor: COLORS.food,
        borderRadius: CELL_SIZE / 2,
        transform: [{ scale: pulseAnim }],
      }}
    />
  );
};

export default Food;