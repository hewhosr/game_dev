import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 16;
const CELL_SIZE = Math.min((SCREEN_WIDTH - 48) / GRID_SIZE, 18);

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const DIFFICULTIES = {
  EASY: { speed: 200, multiplier: 1, emoji: '🟢', color: '#10b981' },
  MEDIUM: { speed: 150, multiplier: 1.5, emoji: '🟡', color: '#f59e0b' },
  HARD: { speed: 100, multiplier: 2, emoji: '🔴', color: '#ef4444' },
  INSANE: { speed: 75, multiplier: 3, emoji: '💀', color: '#8b5cf6' }
};

const StorageUtils = {
  saveScore: async (playerName, score, difficulty) => {
    try {
      const stored = await AsyncStorage.getItem('snake_leaderboard');
      const scores = stored ? JSON.parse(stored) : [];
      
      scores.push({
        id: `${Date.now()}-${Math.random()}`,
        playerName: playerName.trim(),
        score: Math.floor(score),
        difficulty,
        timestamp: Date.now()
      });
      
      scores.sort((a, b) => b.score - a.score);
      const top100 = scores.slice(0, 100);
      
      await AsyncStorage.setItem('snake_leaderboard', JSON.stringify(top100));
      return top100;
    } catch (error) {
      return [];
    }
  },

  getLeaderboard: async () => {
    try {
      const stored = await AsyncStorage.getItem('snake_leaderboard');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  clearLeaderboard: async () => {
    try {
      await AsyncStorage.removeItem('snake_leaderboard');
      return true;
    } catch (error) {
      return false;
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
      return null;
    }
  }
};

const GameLogic = {
  createInitialSnake: () => [
    { x: 8, y: 8 },
    { x: 7, y: 8 },
    { x: 6, y: 8 }
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
  const [playerName, setPlayerName] = useState('');
  const [playerAvatar, setPlayerAvatar] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [gameMode, setGameMode] = useState('single');
  const [multiplayerCode, setMultiplayerCode] = useState('');
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState('Opponent');

  const gameLoopRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadLeaderboard();
  }, []);

  const loadProfile = async () => {
    const profile = await StorageUtils.getPlayerProfile();
    if (profile) {
      setPlayerName(profile.name || '');
      setDifficulty(profile.difficulty || 'MEDIUM');
      setPlayerAvatar(profile.avatar || null);
    }
  };

  const loadLeaderboard = async () => {
    const scores = await StorageUtils.getLeaderboard();
    setLeaderboard(scores);
    if (scores.length > 0) {
      setHighScore(scores[0].score);
    }
  };

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera roll permission is required');
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
      await StorageUtils.savePlayerProfile({ 
        name: playerName,
        difficulty: difficulty,
        avatar: result.assets[0].uri
      });
    }
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setDirection(nextDirection);
      
      setSnake(prevSnake => {
        const newSnake = GameLogic.moveSnake(prevSnake, nextDirection);

        if (GameLogic.checkCollision(newSnake)) {
          handleGameOver();
          return prevSnake;
        }

        if (GameLogic.checkFood(newSnake, food)) {
          const points = 10 * DIFFICULTIES[difficulty].multiplier;
          setScore(prev => prev + points);
          setFood(GameLogic.createFood(newSnake));
          return GameLogic.growSnake(newSnake);
        }

        return newSnake;
      });
    }, DIFFICULTIES[difficulty].speed);

    return () => clearInterval(gameLoopRef.current);
  }, [isPlaying, gameOver, nextDirection, food, difficulty]);

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    
    if (score > 0) {
      await StorageUtils.saveScore(playerName || 'Guest', score, difficulty);
      await loadLeaderboard();
    }
    
    setShowGameOverModal(true);
  };

  const startGame = () => {
    setSnake(GameLogic.createInitialSnake());
    setFood(GameLogic.createFood(GameLogic.createInitialSnake()));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setScore(0);
    setGameOver(false);
    setShowGameOverModal(false);
    setIsPlaying(true);
    setScreen('game');
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setShowGameOverModal(false);
    setScreen('menu');
  };

  const saveProfile = async () => {
    await StorageUtils.savePlayerProfile({ 
      name: playerName,
      difficulty: difficulty,
      avatar: playerAvatar
    });
  };

  const clearLeaderboardData = async () => {
    Alert.alert(
      'Clear Leaderboard',
      'Delete all scores?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await StorageUtils.clearLeaderboard();
            await loadLeaderboard();
            Alert.alert('Success', 'Leaderboard cleared!');
          }
        }
      ]
    );
  };

  const generateMultiplayerCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMultiplayerCode(code);
    Alert.alert('Room Created!', `Share this code: ${code}\n\nAsk your friend to join!`);
  };

  const joinMultiplayerGame = () => {
    if (multiplayerCode.trim().length === 6) {
      setGameMode('multiplayer');
      setOpponentName(`Player (${multiplayerCode})`);
      startGame();
    } else {
      Alert.alert('Invalid Code', 'Code must be 6 characters');
    }
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  const renderMenu = () => (
    <View style={styles.menuContainer}>
      <View style={styles.menuContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Nokia Snake Game</Text>
          {highScore > 0 && (
            <Text style={styles.highScoreText}>Best: {highScore}</Text>
          )}
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleAvatarUpload} style={styles.avatarButton}>
            {playerAvatar ? (
              <Image source={{ uri: playerAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraEmoji}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <TextInput
            placeholder="Your name..."
            placeholderTextColor="#94a3b8"
            value={playerName}
            onChangeText={setPlayerName}
            onBlur={saveProfile}
            maxLength={20}
            style={styles.nameInput}
          />
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            onPress={() => { if (playerName.trim()) { setGameMode('single'); startGame(); } }}
            disabled={!playerName.trim()}
            style={[styles.menuButton, styles.playButton, !playerName.trim() && styles.disabledButton]}
          >
            <Text style={styles.buttonEmoji}>▶️</Text>
            <Text style={styles.buttonText}>Single</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { if (playerName.trim()) setScreen('multiplayer'); }}
            disabled={!playerName.trim()}
            style={[styles.menuButton, styles.multiButton, !playerName.trim() && styles.disabledButton]}
          >
            <Text style={styles.buttonEmoji}>👥</Text>
            <Text style={styles.buttonText}>Multi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              loadLeaderboard();
              setScreen('leaderboard');
            }}
            style={[styles.menuButton, styles.leaderboardButton]}
          >
            <Text style={styles.buttonEmoji}>🏆</Text>
            <Text style={styles.buttonText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setScreen('settings')}
            style={[styles.menuButton, styles.settingsButton, styles.fullWidthButton]}
          >
            <Text style={styles.buttonEmoji}>⚙️</Text>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderGame = () => (
    <View style={styles.gameContainer}>
      <View style={styles.gameHeader}>
        <View style={styles.playerInfo}>
          {playerAvatar ? (
            <Image source={{ uri: playerAvatar }} style={styles.smallAvatar} />
          ) : (
            <Text style={styles.playerEmoji}>👤</Text>
          )}
          <Text style={styles.playerNameText}>{playerName || 'Guest'}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{Math.floor(score)}</Text>
          <Text style={styles.difficultyEmoji}>{DIFFICULTIES[difficulty].emoji}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
            style={[styles.miniButton, isPlaying ? styles.pauseActive : styles.playActive]}
          >
            <Text style={styles.miniEmoji}>{isPlaying ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Return to menu?', 'Your score will be lost', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: resetGame }
              ]);
            }}
            style={styles.homeButton}
          >
            <Text style={styles.homeEmoji}>🏠</Text>
          </TouchableOpacity>
        </View>
      </View>

      {gameMode === 'multiplayer' && (
        <View style={styles.opponentScoreBar}>
          <Text style={styles.opponentText}>👤 {opponentName}: {Math.floor(opponentScore)}</Text>
        </View>
      )}

      <View style={styles.gameBoard}>
        <View
          style={[styles.grid, {
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE
          }]}
        >
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
                  borderRadius: index === 0 ? CELL_SIZE / 2 : 4,
                  opacity: 1 - (index * 0.008),
                }
              ]}
            >
              {index === 0 && playerAvatar && (
                <Image 
                  source={{ uri: playerAvatar }} 
                  style={styles.snakeHeadAvatar}
                />
              )}
            </View>
          ))}

          <View
            style={[
              styles.food,
              {
                left: food.x * CELL_SIZE + 2,
                top: food.y * CELL_SIZE + 2,
                width: CELL_SIZE - 4,
                height: CELL_SIZE - 4,
              }
            ]}
          />
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.dpadWrapper}>
          <View style={styles.dpad}>
            <TouchableOpacity
              onPress={() => direction.y === 0 && setNextDirection(DIRECTIONS.UP)}
              style={styles.dpadButton}
            >
              <Text style={styles.dpadEmoji}>⬆️</Text>
            </TouchableOpacity>
            <View style={styles.dpadRow}>
              <TouchableOpacity
                onPress={() => direction.x === 0 && setNextDirection(DIRECTIONS.LEFT)}
                style={styles.dpadButton}
              >
                <Text style={styles.dpadEmoji}>⬅️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => direction.x === 0 && setNextDirection(DIRECTIONS.RIGHT)}
                style={styles.dpadButton}
              >
                <Text style={styles.dpadEmoji}>➡️</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => direction.y === 0 && setNextDirection(DIRECTIONS.DOWN)}
              style={styles.dpadButton}
            >
              <Text style={styles.dpadEmoji}>⬇️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showGameOverModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.gameOverEmoji}>💀</Text>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <View style={styles.finalScoreCard}>
              <Text style={styles.finalScore}>{Math.floor(score)}</Text>
              <Text style={styles.finalDifficulty}>
                {DIFFICULTIES[difficulty].emoji} {difficulty}
              </Text>
            </View>
            {score > highScore && score > 0 && (
              <Text style={styles.newHighScore}>🎉 NEW HIGH SCORE!</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowGameOverModal(false);
                  startGame();
                }}
                style={[styles.modalButton, styles.playAgainButton]}
              >
                <Text style={styles.modalButtonText}>🔄 Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetGame}
                style={[styles.modalButton, styles.menuButton2]}
              >
                <Text style={styles.modalButtonText}>🏠 Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderMultiplayer = () => (
    <View style={styles.multiplayerContainer}>
      <View style={styles.multiplayerHeader}>
        <Text style={styles.multiplayerTitle}>👥 Multiplayer</Text>
        <TouchableOpacity onPress={() => setScreen('menu')}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.multiplayerContent}>
        <View style={styles.modeCard}>
          <Text style={styles.modeCardTitle}>🎮 Create Room</Text>
          <Text style={styles.modeCardDesc}>Create a room and share the code with friends</Text>
          <TouchableOpacity
            onPress={generateMultiplayerCode}
            style={styles.modeButton}
          >
            <Text style={styles.modeButtonText}>Generate Code</Text>
          </TouchableOpacity>
          {multiplayerCode && (
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>Code: {multiplayerCode}</Text>
            </View>
          )}
        </View>

        <View style={styles.modeCard}>
          <Text style={styles.modeCardTitle}>🔗 Join Room</Text>
          <Text style={styles.modeCardDesc}>Enter a friend's room code to join</Text>
          <TextInput
            placeholder="Enter 6-digit code..."
            placeholderTextColor="#94a3b8"
            value={multiplayerCode}
            onChangeText={setMultiplayerCode}
            maxLength={6}
            style={styles.codeInput}
          />
          <TouchableOpacity
            onPress={joinMultiplayerGame}
            disabled={multiplayerCode.trim().length !== 6}
            style={[styles.modeButton, multiplayerCode.trim().length !== 6 && styles.disabledButton]}
          >
            <Text style={styles.modeButtonText}>Join Game</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How Multiplayer Works</Text>
          <Text style={styles.infoText}>• Create or join a room using a 6-digit code</Text>
          <Text style={styles.infoText}>• Both players compete in real-time</Text>
          <Text style={styles.infoText}>• Highest score wins!</Text>
          <Text style={styles.infoText}>• Scores are displayed live on screen</Text>
          <Text style={styles.infoText}>• Same difficulty for fair competition</Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderLeaderboard = () => {
    const filteredScores = filterDifficulty === 'ALL' 
      ? leaderboard 
      : leaderboard.filter(s => s.difficulty === filterDifficulty);

    return (
      <View style={styles.leaderboardContainer}>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
          <TouchableOpacity onPress={() => setScreen('menu')}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['ALL', ...Object.keys(DIFFICULTIES)].map((diff) => (
            <TouchableOpacity
              key={diff}
              onPress={() => setFilterDifficulty(diff)}
              style={[
                styles.filterButton,
                filterDifficulty === diff && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterButtonText,
                filterDifficulty === diff && styles.filterButtonTextActive
              ]}>
                {diff === 'ALL' ? 'ALL' : `${DIFFICULTIES[diff].emoji} ${diff}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.scoresList}>
          {filteredScores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎮</Text>
              <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
            </View>
          ) : (
            filteredScores.slice(0, 50).map((entry, index) => (
              <View
                key={entry.id}
                style={[
                  styles.scoreEntry,
                  entry.playerName === playerName && styles.scoreEntryHighlight
                ]}
              >
                <Text style={styles.scoreRank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </Text>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreName}>{entry.playerName}</Text>
                  <Text style={styles.scoreDate}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.scoreRight}>
                  <Text style={styles.scorePoints}>{entry.score}</Text>
                  <Text style={styles.scoreEmoji}>{DIFFICULTIES[entry.difficulty]?.emoji}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={clearLeaderboardData}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>⚙️ Settings</Text>
        <TouchableOpacity
          onPress={() => {
            saveProfile();
            setScreen('menu');
          }}
        >
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.settingsContent}>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>👤 Player Avatar</Text>
          <View style={styles.avatarUploadContainer}>
            <TouchableOpacity onPress={handleAvatarUpload}>
              {playerAvatar ? (
                <Image source={{ uri: playerAvatar }} style={styles.settingsAvatar} />
              ) : (
                <View style={styles.settingsAvatarPlaceholder}>
                  <Text style={styles.settingsAvatarEmoji}>👤</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to upload your photo</Text>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>🎯 Difficulty</Text>
          {Object.entries(DIFFICULTIES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setDifficulty(key)}
              style={[
                styles.difficultyButton,
                difficulty === key && styles.difficultyButtonActive
              ]}
            >
              <Text style={styles.difficultyEmoji2}>{value.emoji}</Text>
              <View style={styles.difficultyInfo}>
                <Text style={[
                  styles.difficultyName,
                  difficulty === key && styles.difficultyNameActive
                ]}>
                  {key}
                </Text>
                <Text style={[
                  styles.difficultyDetails,
                  difficulty === key && styles.difficultyDetailsActive
                ]}>
                  ×{value.multiplier} points • {value.speed}ms
                </Text>
              </View>
              {difficulty === key && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.howToPlayCard}>
          <Text style={styles.howToPlayTitle}>🎮 How to Play</Text>
          <Text style={styles.howToPlayText}>• Use arrow buttons to control the snake</Text>
          <Text style={styles.howToPlayText}>• Eat the red food to grow and score points</Text>
          <Text style={styles.howToPlayText}>• Don't run into yourself!</Text>
          <Text style={styles.howToPlayText}>• Your avatar appears on the snake's head</Text>
          <Text style={styles.howToPlayText}>• Higher difficulty = more points per food</Text>
        </View>
      </ScrollView>
    </View>
  );

  switch (screen) {
    case 'menu':
      return renderMenu();
    case 'game':
      return renderGame();
    case 'leaderboard':
      return renderLeaderboard();
    case 'multiplayer':
      return renderMultiplayer();
    case 'settings':
      return renderSettings();
    default:
      return renderMenu();
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 8,
  },
  menuContent: {
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 2,
  },
  highScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    gap: 8,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#475569',
    borderWidth: 2,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
   cameraIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  cameraEmoji: {
    fontSize: 12,
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f1f5f9',
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#475569',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  menuButton: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  playButton: {
    backgroundColor: '#10b981',
  },
  multiButton: {
    backgroundColor: '#8b5cf6',
  },
  leaderboardButton: {
    backgroundColor: '#f59e0b',
  },
  settingsButton: {
    backgroundColor: '#475569',
  },
  fullWidthButton: {
    flex: 1,
    minWidth: '100%',
  },
  disabledButton: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 8,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  playerEmoji: {
    fontSize: 24,
  },
  playerNameText: {
    color: '#f1f5f9',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  difficultyEmoji: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  miniButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  pauseActive: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  playActive: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  miniEmoji: {
    fontSize: 16,
  },
  homeButton: {
    padding: 4,
  },
  homeEmoji: {
    fontSize: 20,
  },
  opponentScoreBar: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  opponentText: {
    color: '#e9d5ff',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  grid: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: 'rgba(71, 85, 105, 0.5)',
    position: 'relative',
  },
  snakeSegment: {
    position: 'absolute',
  },
  snakeHeadAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  food: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    borderRadius: 100,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 12,
    paddingBottom: 8,
  },
  dpadWrapper: {
    alignItems: 'flex-start',
  },
  dpad: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  dpadButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 0.8)',
  },
  dpadRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dpadEmoji: {
    fontSize: 18,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
    width: '80%',
    maxWidth: 340,
  },
  gameOverEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  finalScoreCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    width: '100%',
  },
  finalScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#10b981',
  },
  finalDifficulty: {
    fontSize: 16,
    color: '#cbd5e1',
    marginTop: 4,
  },
  newHighScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  playAgainButton: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  menuButton2: {
    backgroundColor: '#475569',
    borderColor: '#334155',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  multiplayerContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
  },
  multiplayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  multiplayerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  closeButton: {
    fontSize: 20,
    color: '#cbd5e1',
    padding: 2,
  },
  multiplayerContent: {
    flex: 1,
  },
  modeCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 6,
  },
  modeCardDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 12,
  },
  modeButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7c3aed',
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  codeDisplay: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  codeText: {
    color: '#e9d5ff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#f1f5f9',
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 10,
  },
  infoText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 4,
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  filterScroll: {
    marginBottom: 12,
    maxHeight: 44,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(71, 85, 105, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.6)',
    marginRight: 6,
  },
  filterButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  filterButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scoresList: {
    flex: 1,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 16,
  },
  scoreEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  scoreEntryHighlight: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
    borderWidth: 2,
  },
  scoreRank: {
    fontSize: 18,
    marginRight: 12,
    minWidth: 32,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreName: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreDate: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  scoreRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scorePoints: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreEmoji: {
    fontSize: 12,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#475569',
  },
  settingsContent: {
    flex: 1,
  },
  settingsCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  settingsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 10,
  },
  avatarUploadContainer: {
    alignItems: 'center',
    gap: 6,
  },
  settingsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#10b981',
  },
  settingsAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#475569',
    borderWidth: 3,
    borderColor: '#64748b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsAvatarEmoji: {
    fontSize: 40,
  },
  avatarHint: {
    color: '#94a3b8',
    fontSize: 12,
  },
  difficultyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.4)',
    gap: 10,
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  difficultyEmoji2: {
    fontSize: 18,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyName: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  difficultyNameActive: {
    color: '#10b981',
  },
  difficultyDetails: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  difficultyDetailsActive: {
    color: '#6ee7b7',
  },
  checkmark: {
    fontSize: 16,
    color: '#10b981',
  },
  howToPlayCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  howToPlayTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 10,
  },
  howToPlayText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});