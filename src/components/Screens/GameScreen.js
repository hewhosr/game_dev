import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Snake from '../Game/Snake';
import Food from '../Game/Food';
import Joystick from '../Game/Joystick';
import { PauseOverlay, GameOverOverlay } from './Overlays';
import { useGameState } from '../../hooks/useGameState';
import { useHighScores } from '../../hooks/useHighScores';
import { DIFFICULTY_SETTINGS } from '../../constants/Difficulty';
import { gameStyles } from '../../styles/GameStyles';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants/GameConstants';

const GameScreen = ({ difficulty, onGameEnd }) => {
  const {
    snake,
    food,
    score,
    isGameOver,
    isPaused,
    changeDirection,
    pauseGame,
    resumeGame,
    resetGame,
  } = useGameState(difficulty);

  const { topScore, saveScore } = useHighScores(difficulty);

  useEffect(() => {
    if (isGameOver && score > 0) {
      saveScore(score);
    }
  }, [isGameOver, score, saveScore]);

  const handleRestart = () => {
    resetGame();
  };

  const handleQuit = () => {
    onGameEnd();
  };

  return (
    <SafeAreaView style={gameStyles.container}>
      <View style={gameStyles.header}>
        <View style={gameStyles.scoreContainer}>
          <Text style={gameStyles.scoreLabel}>Score</Text>
          <Text style={gameStyles.scoreValue}>{score}</Text>
        </View>
        
        <View style={gameStyles.difficultyBadge}>
          <Text style={[
            gameStyles.difficultyText,
            { color: DIFFICULTY_SETTINGS[difficulty].color }
          ]}>
            {DIFFICULTY_SETTINGS[difficulty].label}
          </Text>
        </View>

        <View style={gameStyles.scoreContainer}>
          <Text style={gameStyles.scoreLabel}>Best</Text>
          <Text style={gameStyles.scoreValue}>{topScore}</Text>
        </View>
      </View>

      <View
        style={[
          gameStyles.gameArea,
          { width: GAME_WIDTH, height: GAME_HEIGHT },
        ]}
      >
        <Snake snake={snake} />
        <Food food={food} />
      </View>

      <View style={gameStyles.controls}>
        <View style={gameStyles.controlButtons}>
          <TouchableOpacity
            style={gameStyles.pauseButton}
            onPress={isPaused ? resumeGame : pauseGame}
          >
            <Text style={gameStyles.pauseButtonText}>
              {isPaused ? '▶' : '❚❚'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={gameStyles.quitButton}
            onPress={handleQuit}
          >
            <Text style={gameStyles.quitButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Joystick onDirectionChange={changeDirection} />
      </View>

      <PauseOverlay
        visible={isPaused}
        onResume={resumeGame}
        onQuit={handleQuit}
      />

      <GameOverOverlay
        visible={isGameOver}
        score={score}
        topScore={topScore}
        difficulty={difficulty}
        onRestart={handleRestart}
        onQuit={handleQuit}
      />
    </SafeAreaView>
  );
};

export default GameScreen;