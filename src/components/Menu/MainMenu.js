import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { DIFFICULTY_SETTINGS } from '../../constants/Difficulty';
import { useMenuAnimations } from '../../hooks/useMenuAnimations';
import LeaderboardModal from './LeaderboardModal';
import { menuStyles } from '../../styles/MenuStyles';

const MainMenu = ({ onStartGame }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { fadeAnim, scaleAnim } = useMenuAnimations();

  return (
    <View style={menuStyles.container}>
      <Animated.View
        style={[
          menuStyles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={menuStyles.title}>🐍 SNAKE GAME</Text>
        <Text style={menuStyles.subtitle}>Classic Retro Style</Text>

        <View style={menuStyles.difficultyContainer}>
          <Text style={menuStyles.sectionTitle}>Select Difficulty</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <TouchableOpacity
                key={key}
                style={[
                  menuStyles.difficultyButton,
                  selectedDifficulty === key && menuStyles.difficultyButtonActive,
                  { borderColor: settings.color },
                ]}
                onPress={() => setSelectedDifficulty(key)}
              >
                <Text
                  style={[
                    menuStyles.difficultyText,
                    selectedDifficulty === key && menuStyles.difficultyTextActive,
                    { color: settings.color },
                  ]}
                >
                  {settings.label}
                </Text>
                <Text style={menuStyles.multiplierText}>
                  {settings.scoreMultiplier}x score
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={menuStyles.playButton}
          onPress={() => onStartGame(selectedDifficulty)}
        >
          <Text style={menuStyles.playButtonText}>PLAY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={menuStyles.leaderboardButton}
          onPress={() => setShowLeaderboard(true)}
        >
          <Text style={menuStyles.leaderboardButtonText}>🏆 Leaderboard</Text>
        </TouchableOpacity>

        <View style={menuStyles.instructions}>
          <Text style={menuStyles.instructionsTitle}>How to Play:</Text>
          <Text style={menuStyles.instructionsText}>
            • Use the joystick to control the snake{'\n'}
            • Eat food to grow and score points{'\n'}
            • Avoid walls and yourself{'\n'}
            • Higher difficulty = more points!
          </Text>
        </View>
      </Animated.View>

      <LeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </View>
  );
};

export default MainMenu;