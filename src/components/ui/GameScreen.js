import React from 'react';
import { View, Text, TouchableOpacity, PanGestureHandler, State } from 'react-native';

import GameEngineWrapper from '../../Game/GameEngine';
import Snake from '../../Game/Snake';
import Food from '../../Game/Food';
import Joystick from '../../Game/Joystick';

import Overlays from './Overlays';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants/GameConstants';
import { styles } from '../../styles/GameStyles';

const GameScreen = ({
  gameState,
  score,
  difficulty,
  entities,
  gameEngineRef,
  onTogglePause,
  onBackToMenu,
  onJoystickMove,
  onSwipe,
  onRestartGame,
  highScores
}) => {
  return (
    <View style={styles.gameContainer}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        
        <View style={[styles.difficultyBadge, { borderColor: difficulty.color }]}>
          <Text style={[styles.difficultyText, { color: difficulty.color }]}>
            {difficulty.name}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onTogglePause}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.iconButtonText}>
              {gameState === 'paused' ? '▶️' : '⏸️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onBackToMenu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.iconButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gameArea}>
        <View style={[styles.gameBorder, { width: GAME_WIDTH + 4, height: GAME_HEIGHT + 4 }]}>
          <GameEngineWrapper
            ref={gameEngineRef}
            entities={{
              snake: { body: entities.snake.body, renderer: Snake },
              food: { position: entities.food, renderer: Food }
            }}
            running={gameState === 'playing'}
          />
        </View>
        
        {gameState === 'playing' && score === 0 && (
          <View style={styles.instructionOverlay}>
            <Text style={styles.instructionOverlayText}>Drag the joystick to slither!</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsSection}>
        <Joystick onMove={onJoystickMove} />
        
        <View style={styles.controlsInfo}>
          <Text style={styles.controlsTitle}>CONTROLS</Text>
          <Text style={styles.controlsSubtitle}>Drag joystick or swipe to move</Text>
          <Text style={styles.controlsStats}>Length: {entities.snake.body.length}</Text>
        </View>
        
        <PanGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.END && gameState === 'playing') {
              onSwipe(nativeEvent);
            }
          }}
        >
          <View style={styles.swipeArea} />
        </PanGestureHandler>
      </View>

      <Overlays
        gameState={gameState}
        score={score}
        snakeLength={entities.snake.body.length}
        difficulty={difficulty}
        highScores={highScores}
        onResume={onTogglePause}
        onRestart={onRestartGame}
        onBackToMenu={onBackToMenu}
      />
    </View>
  );
};

export default GameScreen;