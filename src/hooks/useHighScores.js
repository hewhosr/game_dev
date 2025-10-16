import { useState, useEffect } from 'react';
import { loadHighScores, saveHighScore } from '../../utils/Storage';

export const useHighScores = () => {
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    const scores = await loadHighScores();
    setHighScores(scores);
  };

  const addHighScore = async (newScore, difficulty) => {
    const updatedScores = await saveHighScore(highScores, newScore, difficulty);
    setHighScores(updatedScores);
  };

  return {
    highScores,
    addHighScore
  };
};