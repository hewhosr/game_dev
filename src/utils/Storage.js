import * as SQLite from 'expo-sqlite';

let db;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('snakegame.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS high_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      date TEXT NOT NULL
    );
  `);
};

export const saveHighScore = async (score, difficulty) => {
  const date = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO high_scores (score, difficulty, date) VALUES (?, ?, ?)',
    [score, difficulty, date]
  );
};

export const getHighScores = async (difficulty = null, limit = 10) => {
  let query = 'SELECT * FROM high_scores';
  let params = [];
  
  if (difficulty) {
    query += ' WHERE difficulty = ?';
    params.push(difficulty);
  }
  
  query += ' ORDER BY score DESC LIMIT ?';
  params.push(limit);
  
  const result = await db.getAllAsync(query, params);
  return result;
};

export const getTopScore = async (difficulty) => {
  const result = await db.getFirstAsync(
    'SELECT MAX(score) as topScore FROM high_scores WHERE difficulty = ?',
    [difficulty]
  );
  return result?.topScore || 0;
};