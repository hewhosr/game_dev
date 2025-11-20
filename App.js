import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ScrollView,
  Image,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
// Landscape optimized: use height for grid size (taller in landscape)
const GRID_SIZE = 20;
const CELL_SIZE = Math.floor((height - 100) / GRID_SIZE);

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const DIFFICULTIES = {
  EASY: { speed: 200, scoreMultiplier: 1 },
  MEDIUM: { speed: 150, scoreMultiplier: 1.5 },
  HARD: { speed: 100, scoreMultiplier: 2 }
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================
const StorageUtils = {
  saveHighScore: async (playerName, score, difficulty) => {
    try {
      const scoresJson = await AsyncStorage.getItem('snake_highscores');
      const scores = scoresJson ? JSON.parse(scoresJson) : [];
      scores.push({
        id: Date.now().toString(),
        playerName,
        score,
        difficulty,
        timestamp: Date.now()
      });
      scores.sort((a, b) => b.score - a.score);
      const top100 = scores.slice(0, 100);
      await AsyncStorage.setItem('snake_highscores', JSON.stringify(top100));
      return top100;
    } catch (error) {
      console.error('Error saving high score:', error);
      return [];
    }
  },

  getHighScores: async () => {
    try {
      const stored = await AsyncStorage.getItem('snake_highscores');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting high scores:', error);
      return [];
    }
  },

  savePlayerProfile: async (profile) => {
    try {
      await AsyncStorage.setItem('snake_player_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  },

  getPlayerProfile: async () => {
    try {
      const stored = await AsyncStorage.getItem('snake_player_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }
};

// ============================================================================
// GAME LOGIC
// ============================================================================
const GameLogic = {
  createInitialSnake: () => [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ],

  createFood: (snake) => {
    let food;
    do {
      food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
  },

  moveSnake: (snake, direction) => {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;

    return [head, ...snake.slice(0, -1)];
  },

  checkCollision: (snake) => {
    const head = snake[0];
    return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  },

  checkFood: (snake, food) => {
    return snake[0].x === food.x && snake[0].y === food.y;
  },

  growSnake: (snake) => {
    return [...snake, snake[snake.length - 1]];
  }
};

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================
export default function SnakeGame() {
  const [screen, setScreen] = useState('menu');
  const [snake, setSnake] = useState(GameLogic.createInitialSnake());
  const [food, setFood] = useState(GameLogic.createFood(GameLogic.createInitialSnake()));
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [playerName, setPlayerName] = useState('Player');
  const [playerAvatar, setPlayerAvatar] = useState(null);
  const [highScores, setHighScores] = useState([]);

  const gameLoopRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadHighScores();
  }, []);

  const loadProfile = async () => {
    const profile = await StorageUtils.getPlayerProfile();
    if (profile) {
      setPlayerName(profile.name);
      setPlayerAvatar(profile.avatar);
    }
  };

  const loadHighScores = async () => {
    const scores = await StorageUtils.getHighScores();
    setHighScores(scores);
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setDirection(nextDirection);
      
      setSnake(prevSnake => {
        const newSnake = GameLogic.moveSnake(prevSnake, nextDirection);

        if (GameLogic.checkCollision(newSnake)) {
          setGameOver(true);
          setIsPlaying(false);
          handleGameOver();
          return prevSnake;
        }

        if (GameLogic.checkFood(newSnake, food)) {
          setScore(prev => prev + (10 * DIFFICULTIES[difficulty].scoreMultiplier));
          setFood(GameLogic.createFood(newSnake));
          return GameLogic.growSnake(newSnake);
        }

        return newSnake;
      });
    }, DIFFICULTIES[difficulty].speed);

    return () => clearInterval(gameLoopRef.current);
  }, [isPlaying, gameOver, nextDirection, food, difficulty]);

  const handleGameOver = async () => {
    await StorageUtils.saveHighScore(playerName, Math.floor(score), difficulty);
    await loadHighScores();
    Alert.alert('Game Over!', `Final Score: ${Math.floor(score)}`, [
      { text: 'Play Again', onPress: startGame },
      { text: 'Menu', onPress: resetGame }
    ]);
  };

  const startGame = () => {
    setSnake(GameLogic.createInitialSnake());
    setFood(GameLogic.createFood(GameLogic.createInitialSnake()));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setScreen('game');
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScreen('menu');
  };

  const handleAvatarUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPlayerAvatar(result.assets[0].uri);
      await StorageUtils.savePlayerProfile({ name: playerName, avatar: result.assets[0].uri });
    }
  };

  const saveProfile = async () => {
    await StorageUtils.savePlayerProfile({ name: playerName, avatar: playerAvatar });
    Alert.alert('Success', 'Profile saved!');
  };

  // ============================================================================
  // RENDER FUNCTIONS (LANDSCAPE OPTIMIZED)
  // ============================================================================

  const renderMenu = () => (
    <View style={styles.landscapeContainer}>
      {/* Left side: Title and branding */}
      <View style={styles.menuLeft}>
        <Text style={styles.title}>🐍</Text>
        <Text style={styles.titleText}>Snake Game</Text>
        <Text style={styles.subtitle}>Swipe to Play!</Text>
      </View>

      {/* Right side: Menu buttons */}
      <View style={styles.menuRight}>
        <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={startGame}>
          <Text style={styles.buttonText}>▶️ Play Solo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={() => setScreen('multiplayer')}>
          <Text style={styles.buttonText}>👥 Multiplayer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.yellowButton]} onPress={() => setScreen('leaderboard')}>
          <Text style={styles.buttonText}>🏆 Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.grayButton]} onPress={() => setScreen('settings')}>
          <Text style={styles.buttonText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGame = () => (
    <View style={styles.landscapeGameContainer}>
      {/* Left side: Game board */}
      <View style={styles.gameLeft}>
        <View style={[styles.gameBoard, { width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }]}>
          {snake.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.snakeSegment,
                {
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: index === 0 ? '#059669' : '#10b981',
                }
              ]}
            >
              {index === 0 && playerAvatar && (
                <Image source={{ uri: playerAvatar }} style={styles.snakeHead} />
              )}
            </View>
          ))}

          <View
            style={[
              styles.food,
              {
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }
            ]}
          />
        </View>
      </View>

      {/* Right side: Controls and info */}
      <View style={styles.gameRight}>
        {/* Player info */}
        <View style={styles.playerInfoLandscape}>
          {playerAvatar && (
            <Image source={{ uri: playerAvatar }} style={styles.avatarSmall} />
          )}
          <View>
            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.scoreText}>Score: {Math.floor(score)}</Text>
          </View>
        </View>

        {/* Control buttons */}
        <View style={styles.landscapeControls}>
          <TouchableOpacity 
            style={[styles.controlButton, { backgroundColor: isPlaying ? '#ef4444' : '#10b981' }]} 
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Text style={styles.controlButtonText}>{isPlaying ? '⏸️ Pause' : '▶️ Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={resetGame}>
            <Text style={styles.controlButtonText}>🏠 Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Touch Controls */}
        <View style={styles.touchControls}>
          <View style={styles.controlRow}>
            <View style={styles.directionSpacer} />
            <TouchableOpacity 
              style={styles.directionButton}
              onPress={() => direction.y === 0 && setNextDirection(DIRECTIONS.UP)}
            >
              <Text style={styles.directionText}>⬆️</Text>
            </TouchableOpacity>
            <View style={styles.directionSpacer} />
          </View>
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={styles.directionButton}
              onPress={() => direction.x === 0 && setNextDirection(DIRECTIONS.LEFT)}
            >
              <Text style={styles.directionText}>⬅️</Text>
            </TouchableOpacity>
            <View style={styles.directionButtonCenter} />
            <TouchableOpacity 
              style={styles.directionButton}
              onPress={() => direction.x === 0 && setNextDirection(DIRECTIONS.RIGHT)}
            >
              <Text style={styles.directionText}>➡️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.controlRow}>
            <View style={styles.directionSpacer} />
            <TouchableOpacity 
              style={styles.directionButton}
              onPress={() => direction.y === 0 && setNextDirection(DIRECTIONS.DOWN)}
            >
              <Text style={styles.directionText}>⬇️</Text>
            </TouchableOpacity>
            <View style={styles.directionSpacer} />
          </View>
        </View>

        <Text style={styles.helpText}>Tap arrows to move</Text>
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.landscapeContainer}>
      <View style={styles.landscapeContent}>
        <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
        
        <ScrollView style={styles.leaderboardScroll}>
          {highScores.length === 0 ? (
            <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
          ) : (
            highScores.slice(0, 10).map((score, index) => (
              <View key={score.id} style={[styles.scoreRowLandscape, index < 3 && styles.topScore]}>
                <Text style={styles.rankLandscape}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </Text>
                <Text style={styles.scorePlayerLandscape}>{score.playerName}</Text>
                <Text style={styles.scoreValueLandscape}>{score.score}</Text>
                <Text style={[styles.scoreDifficultyLandscape, { color: 
                  score.difficulty === 'EASY' ? '#16a34a' :
                  score.difficulty === 'MEDIUM' ? '#ca8a04' : '#dc2626'
                }]}>
                  {score.difficulty}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
        
        <TouchableOpacity style={[styles.button, styles.grayButton]} onPress={() => setScreen('menu')}>
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.landscapeContainer}>
      <ScrollView style={styles.settingsScroll} contentContainerStyle={styles.settingsContent}>
        <Text style={styles.settingsTitle}>⚙️ Settings</Text>
        
        <View style={styles.settingsRow}>
          <View style={styles.settingsColumn}>
            <Text style={styles.label}>Player Name</Text>
            <TextInput
              style={styles.input}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Snake Head (Your Face)</Text>
            <View style={styles.avatarContainer}>
              {playerAvatar && (
                <Image source={{ uri: playerAvatar }} style={styles.avatarLarge} />
              )}
              <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={handleAvatarUpload}>
                <Text style={styles.buttonText}>📷 {playerAvatar ? 'Change' : 'Upload'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsColumn}>
            <Text style={styles.label}>Difficulty</Text>
            {Object.keys(DIFFICULTIES).map(diff => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  difficulty === diff && styles.difficultyButtonActive
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text style={[
                  styles.difficultyText,
                  difficulty === diff && styles.difficultyTextActive
                ]}>
                  {diff} (×{DIFFICULTIES[diff].scoreMultiplier})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingsButtons}>
          <TouchableOpacity style={[styles.button, styles.blueButton, styles.halfButton]} onPress={saveProfile}>
            <Text style={styles.buttonText}>💾 Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.grayButton, styles.halfButton]} onPress={() => setScreen('menu')}>
            <Text style={styles.buttonText}>🏠 Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderMultiplayer = () => (
    <View style={styles.landscapeContainer}>
      <View style={styles.landscapeContent}>
        <Text style={styles.multiplayerTitle}>👥 Multiplayer</Text>
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>🚧 Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            Multiplayer mode with Firebase real-time sync.
          </Text>
        </View>

        <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={() => setScreen('menu')}>
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" hidden />
      {screen === 'menu' && renderMenu()}
      {screen === 'game' && renderGame()}
      {screen === 'leaderboard' && renderLeaderboard()}
      {screen === 'settings' && renderSettings()}
      {screen === 'multiplayer' && renderMultiplayer()}
    </View>
  );
}

// ============================================================================
// STYLES (LANDSCAPE OPTIMIZED)
// ============================================================================

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#047857',
  },
  menuLeft: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuRight: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 80,
    marginBottom: 10,
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#dcfce7',
    marginTop: 10,
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    alignItems: 'center',
  },
  halfButton: {
    width: '48%',
  },
  greenButton: {
    backgroundColor: '#10b981',
  },
  blueButton: {
    backgroundColor: '#3b82f6',
  },
  yellowButton: {
    backgroundColor: '#eab308',
  },
  grayButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  landscapeGameContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  gameLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  gameRight: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerInfoLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 12,
    width: '100%',
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playerName: {
    color: '#999',
    fontSize: 14,
  },
  scoreText: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold',
  },
  landscapeControls: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gameBoard: {
    backgroundColor: '#dcfce7',
    borderWidth: 4,
    borderColor: '#10b981',
    position: 'relative',
    borderRadius: 8,
  },
  snakeSegment: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#047857',
  },
  snakeHead: {
    width: '100%',
    height: '100%',
  },
  food: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    borderRadius: 100,
  },
  touchControls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  directionButton: {
    width: 60,
    height: 60,
    backgroundColor: '#374151',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonCenter: {
    width: 60,
    height: 60,
  },
  directionSpacer: {
    width: 60,
  },
  directionText: {
    fontSize: 28,
  },
  helpText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  landscapeContent: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  leaderboardTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#eab308',
    textAlign: 'center',
    marginBottom: 20,
  },
  leaderboardScroll: {
    flex: 1,
    marginBottom: 20,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 40,
  },
  scoreRowLandscape: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  topScore: {
    backgroundColor: '#3a3a2a',
  },
  rankLandscape: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 50,
    color: '#fff',
  },
  scorePlayerLandscape: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  scoreValueLandscape: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  scoreDifficultyLandscape: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 70,
    textAlign: 'right',
  },
  settingsScroll: {
    flex: 1,
  },
  settingsContent: {
    padding: 30,
  },
  settingsTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  settingsColumn: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#374151',
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 10,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  difficultyButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  difficultyButtonActive: {
    backgroundColor: '#10b981',
  },
  difficultyText: {
    color: '#999',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  settingsButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  multiplayerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  comingSoon: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eab308',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#854d0e',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#92400e',
  },
});