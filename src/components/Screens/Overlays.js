import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/CommonStyles';

const Overlays = ({
  gameState,
  score,
  snakeLength,
  difficulty,
  highScores,
  onResume,
  onRestart,
  onBackToMenu
}) => {
  if (gameState === 'menu' || gameState === 'playing') return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        {gameState === 'paused' && (
          <>
            <Text style={styles.overlayTitle}>⏸️ GAME PAUSED</Text>
            <Text style={styles.overlaySubtitle}>Score: {score}</Text>
            <Text style={styles.overlaySubtitle}>Snake Length: {snakeLength}</Text>
            <TouchableOpacity style={styles.overlayButton} onPress={onResume}>
              <Text style={styles.overlayButtonText}>RESUME SLITHERING</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayButtonSecondary} onPress={onBackToMenu}>
              <Text style={styles.overlayButtonSecondaryText}>MAIN MENU</Text>
            </TouchableOpacity>
          </>
        )}

        {gameState === 'game-over' && (
          <>
            <Text style={styles.gameOverTitle}>💀 WORM CRASHED!</Text>
            <Text style={styles.finalScore}>Final Score: {score}</Text>
            <Text style={styles.finalScore}>Length Reached: {snakeLength}</Text>
            <Text style={styles.finalDifficulty}>Difficulty: {difficulty.name}</Text>
            
            {score > 0 && (highScores.length === 0 || score > highScores[0]?.score) && (
              <Text style={styles.newHighScore}>🎉 NEW LEGENDARY WORM! 🎉</Text>
            )}
            
            <TouchableOpacity style={styles.overlayButton} onPress={onRestart}>
              <Text style={styles.overlayButtonText}>🔄 HATCH NEW WORM</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.overlayButtonSecondary} onPress={onBackToMenu}>
              <Text style={styles.overlayButtonSecondaryText}>🏠 WORM NEST</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default Overlays;