import { useState, useEffect } from 'react';
import { getHighScores, getTopScore, saveHighScore } from '../utils/Storage';

export const useHighScores = (difficulty) => {
  const [highScores, setHighScores] = useState([]);
  const [topScore, setTopScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadScores = async () => {
    setLoading(true);
    try {
      const scores = await getHighScores(difficulty);
      const top = await getTopScore(difficulty);
      setHighScores(scores);
      setTopScore(top);
    } catch (error) {
      console.error('Error loading scores:', error);
    }
    setLoading(false);
  };

  const saveScore = async (score) => {
    try {
      await saveHighScore(score, difficulty);
      await loadScores();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  useEffect(() => {
    loadScores();
  }, [difficulty]);

  return {
    highScores,
    topScore,
    loading,
    saveScore,
    refreshScores: loadScores,
  };
};