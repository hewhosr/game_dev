import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useMenuAnimations = (gameState) => {
  const titleScale = useRef(new Animated.Value(1)).current;
  const wormPosition = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gameState === 'menu') {
      startMenuAnimations();
    }
  }, [gameState]);

  const startMenuAnimations = () => {
    
    // Title pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(titleScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Worm movement animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(wormPosition, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(wormPosition, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Button fade in
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  return {
    titleScale,
    wormPosition,
    buttonOpacity
  };
};