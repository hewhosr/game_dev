import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/GameConstants';
import { DIRECTIONS } from '../../constants/GameConstants';

const Joystick = ({ onDirectionChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.joystick}>
        <TouchableOpacity
          style={[styles.button, styles.buttonTop]}
          onPress={() => onDirectionChange(DIRECTIONS.UP)}
        >
          <View style={styles.arrow}>
            <View style={[styles.arrowPart, styles.arrowUp]} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.middleRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonLeft]}
            onPress={() => onDirectionChange(DIRECTIONS.LEFT)}
          >
            <View style={styles.arrow}>
              <View style={[styles.arrowPart, styles.arrowLeft]} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.center} />
          
          <TouchableOpacity
            style={[styles.button, styles.buttonRight]}
            onPress={() => onDirectionChange(DIRECTIONS.RIGHT)}
          >
            <View style={styles.arrow}>
              <View style={[styles.arrowPart, styles.arrowRight]} />
            </View>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonBottom]}
          onPress={() => onDirectionChange(DIRECTIONS.DOWN)}
        >
          <View style={styles.arrow}>
            <View style={[styles.arrowPart, styles.arrowDown]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  joystick: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.accent,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  buttonTop: {
    marginBottom: 10,
  },
  buttonBottom: {
    marginTop: 10,
  },
  buttonLeft: {
    marginRight: 10,
  },
  buttonRight: {
    marginLeft: 10,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.grid,
    borderRadius: 20,
  },
  arrow: {
    width: 20,
    height: 20,
  },
  arrowPart: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  arrowUp: {
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.text,
  },
  arrowDown: {
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.text,
  },
  arrowLeft: {
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: COLORS.text,
  },
  arrowRight: {
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: COLORS.text,
  },
});

export default Joystick;