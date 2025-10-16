import React, { useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../../styles/GameStyles';

const Joystick = ({ onMove }) => {
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const baseSize = 100;
  const thumbSize = 50;
  const maxDistance = (baseSize - thumbSize) / 2;

  const onGestureEvent = (event) => {
    const { translationX, translationY } = event.nativeEvent;
    
    let limitedX = translationX;
    let limitedY = translationY;
    const distance = Math.sqrt(translationX * translationX + translationY * translationY);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(translationY, translationX);
      limitedX = Math.cos(angle) * maxDistance;
      limitedY = Math.sin(angle) * maxDistance;
    }
    
    setJoystickPosition({ x: limitedX, y: limitedY });
    setIsActive(true);
    
    const dx = limitedX / maxDistance;
    const dy = limitedY / maxDistance;
    onMove({ dx, dy });
  };

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END || 
        event.nativeEvent.state === State.CANCELLED) {
      Animated.spring(joystickPosition, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        friction: 7,
        tension: 40,
      }).start();
      
      setTimeout(() => {
        setJoystickPosition({ x: 0, y: 0 });
        setIsActive(false);
        onMove({ dx: 0, dy: 0 });
      }, 150);
    }
  };

  return (
    <View style={[styles.joystickContainer, { width: baseSize, height: baseSize }]}>
      <Text style={styles.joystickLabel}>DRAG TO MOVE</Text>
      <View style={[styles.joystickBase, { width: baseSize, height: baseSize }]}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View 
            style={[
              styles.joystickArea,
              { 
                width: baseSize, 
                height: baseSize,
                transform: [
                  { translateX: joystickPosition.x },
                  { translateY: joystickPosition.y }
                ]
              }
            ]}
          >
            <View style={[styles.joystickCenter, { width: baseSize * 0.3, height: baseSize * 0.3 }]} />
            <View 
              style={[
                styles.joystickThumb,
                { 
                  width: thumbSize, 
                  height: thumbSize,
                  backgroundColor: isActive ? '#4CAF50' : '#388E3C',
                  shadowColor: isActive ? '#4CAF50' : '#000',
                  shadowOpacity: isActive ? 0.6 : 0.3,
                  elevation: isActive ? 8 : 4,
                }
              ]} 
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
      
      <View style={styles.directionIndicators}>
        <Text style={styles.directionArrow}>↑</Text>
        <Text style={styles.directionArrow}>↓</Text>
        <Text style={styles.directionArrow}>←</Text>
        <Text style={styles.directionArrow}>→</Text>
      </View>
    </View>
  );
};

export default Joystick;