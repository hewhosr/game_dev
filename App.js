import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DIFFICULTY } from './src/constants/Difficulty';
import { useHighScores } from './src/hooks/useHighScores';
import { useGameState } from './src/hooks/useGameState';
import { useMenuAnimations } from './src/hooks/useMenuAnimations';

import MenuScreen from './src/components/ui/MenuScreen';
import GameScreen from './src/components/ui/GameScreen';
import LeaderboardModal from './src/components/ui/LeaderboardModal';


import { GameLoop } from './src/utils/GameLoop';
import { styles } from './src/styles/CommonStyles';

export default function App() {
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  
  const { highScores, addHighScore } = useHighScores();
  const {
    gameState,
    setGameState,
    score,
    setScore,
    difficulty,
    setDifficulty,
    entities,
    setEntities,
    gameEngineRef,
    lastUpdateTime,
    startGame,
    togglePause,
    endGame
  } = useGameState();

  const { titleScale, wormPosition, buttonOpacity } = useMenuAnimations(gameState);

  // Set default difficulty
  React.useEffect(() => {
    if (!difficulty) {
      setDifficulty(DIFFICULTY.MEDIUM);
    }
  }, []);

  const handleJoystickMove = ({ dx, dy }) => {
    if (gameEngineRef.current && gameState === 'playing') {
      gameEngineRef.current.dispatch({ type: 'joystick-move', dx, dy });
    }
  };

  const handleSwipe = (nativeEvent) => {
    if (gameState === 'playing') {
      const { translationX, translationY } = nativeEvent;
      const swipeThreshold = 20;
      
      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX > swipeThreshold) {
          gameEngineRef.current.dispatch({ type: 'swipe-right' });
        } else if (translationX < -swipeThreshold) {
          gameEngineRef.current.dispatch({ type: 'swipe-left' });
        }
      } else {
        if (translationY > swipeThreshold) {
          gameEngineRef.current.dispatch({ type: 'swipe-down' });
        } else if (translationY < -swipeThreshold) {
          gameEngineRef.current.dispatch({ type: 'swipe-up' });
        }
      }
    }
  };

  const handleEndGame = () => {
    endGame();
    addHighScore(score, difficulty);
  };

  const gameLoopSystem = (entities, { events, time }) => {
    return GameLoop(
      entities,
      { events, time },
      {
        gameState,
        difficulty,
        score,
        setScore,
        setEntities,
        onEndGame: handleEndGame,
        lastUpdateTime
      }
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {gameState === 'menu' ? (
        <MenuScreen
          onStartGame={startGame}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          difficulty={difficulty}
          onSetDifficulty={setDifficulty}
          titleScale={titleScale}
          wormPosition={wormPosition}
          buttonOpacity={buttonOpacity}
        />
      ) : (
        <GameScreen
          gameState={gameState}
          score={score}
          difficulty={difficulty}
          entities={entities}
          gameEngineRef={gameEngineRef}
          onTogglePause={togglePause}
          onBackToMenu={() => setGameState('menu')}
          onJoystickMove={handleJoystickMove}
          onSwipe={handleSwipe}
          onRestartGame={startGame}
          highScores={highScores}
          systems={[gameLoopSystem]}
        />
      )}
      <LeaderboardModal
        visible={showLeaderboard}
        highScores={highScores}
        onClose={() => setShowLeaderboard(false)}
      />
    </GestureHandlerRootView>
  );
}