import React from 'react';
import { GameEngine } from 'react-native-game-engine';
import { GAME_WIDTH, GAME_HEIGHT } from '../../constants/GameConstants';
import { styles } from '../../styles/GameStyles';

const GameEngineWrapper = ({ 
  ref, 
  style, 
  systems, 
  entities, 
  running, 
  children 
}) => {
  return (
    <GameEngine
      ref={ref}
      style={[styles.gameEngine, { width: GAME_WIDTH, height: GAME_HEIGHT }, style]}
      systems={systems}
      entities={entities}
      running={running}
    >
      {children}
    </GameEngine>
  );
};

export default GameEngineWrapper;