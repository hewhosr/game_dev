import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { DIFFICULTY_SETTINGS } from '../../constants/Difficulty';
import { useHighScores } from '../../hooks/useHighScores';
import { menuStyles } from '../../styles/MenuStyles';

const LeaderboardModal = ({ visible, onClose }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const { highScores, loading } = useHighScores(selectedDifficulty);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={menuStyles.modalOverlay}>
        <View style={menuStyles.modalContent}>
          <Text style={menuStyles.modalTitle}>🏆 Leaderboard</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={menuStyles.difficultyTabs}
          >
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, settings]) => (
              <TouchableOpacity
                key={key}
                style={[
                  menuStyles.difficultyTab,
                  selectedDifficulty === key && menuStyles.difficultyTabActive,
                ]}
                onPress={() => setSelectedDifficulty(key)}
              >
                <Text
                  style={[
                    menuStyles.difficultyTabText,
                    selectedDifficulty === key && menuStyles.difficultyTabTextActive,
                  ]}
                >
                  {settings.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={menuStyles.scoresList}>
            {loading ? (
              <ActivityIndicator size="large" color="#6c5ce7" />
            ) : highScores.length > 0 ? (
              highScores.map((score, index) => (
                <View key={score.id} style={menuStyles.scoreItem}>
                  <Text style={menuStyles.scoreRank}>#{index + 1}</Text>
                  <Text style={menuStyles.scoreValue}>{score.score}</Text>
                  <Text style={menuStyles.scoreDate}>
                    {new Date(score.date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={menuStyles.noScoresText}>
                No scores yet. Be the first!
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={menuStyles.closeButton}
            onPress={onClose}
          >
            <Text style={menuStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LeaderboardModal;