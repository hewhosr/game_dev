import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadHighScores = async () => {
  try {
    const savedScores = await AsyncStorage.getItem('@snake_high_scores');
    return savedScores ? JSON.parse(savedScores) : [];
  } catch (error) {
    console.log('Error loading high scores:', error);
    return [];
  }
};

export const saveHighScore = async (highScores, newScore, difficulty) => {
  try {
    const newScoreEntry = { 
      score: newScore, 
      date: new Date().toLocaleDateString(),
      difficulty: difficulty.name
    };
    
    const updatedScores = [...highScores, newScoreEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    await AsyncStorage.setItem('@snake_high_scores', JSON.stringify(updatedScores));
    return updatedScores;
  } catch (error) {
    console.log('Error saving high score:', error);
    return highScores;
  }
};