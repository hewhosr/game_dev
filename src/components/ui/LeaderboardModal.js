import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/CommonStyles';

const LeaderboardModal = ({ visible, highScores, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🏆 HALL OF FAME</Text>
          
          {highScores.length === 0 ? (
            <View style={styles.noScoresContainer}>
              <Text style={styles.noScoresText}>No legendary worms yet!</Text>
              <Text style={styles.noScoresSubtext}>Be the first to make history!</Text>
            </View>
          ) : (
            highScores.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.scoreItem,
                  index === 0 && styles.topScoreItem
                ]}
              >
                <Text style={styles.scoreRank}>#{index + 1}</Text>
                <View style={styles.scoreInfo}>
                  <Text style={styles.scoreValue}>{item.score} points</Text>
                  <Text style={styles.scoreMeta}>{item.difficulty} • {item.date}</Text>
                </View>
                {index === 0 && <Text style={styles.crown}>👑</Text>}
              </View>
            ))
          )}
          
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>BACK TO MENU</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LeaderboardModal;