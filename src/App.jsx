import React, { useState } from 'react';
import Layout from './components/Layout';
import Loader from './components/UI/Loader';
import { useCountryData } from './hooks/useCountryData';
import { useGameLogic } from './hooks/useGameLogic';
import { useUserProfile } from './hooks/useUserProfile';
import Landing from './components/Landing';
import Game from './components/Game';
import Profile from './components/Profile';
import AshwinMode from './components/AshwinMode';
import SolvedCountries from './components/SolvedCountries';

function App() {
  const { isLoading, error, playable, triviaIndex, topo } = useCountryData();
  const game = useGameLogic(playable, triviaIndex);
  const { profile, addXp, toggleVisited, markGuessed, toggleAshwinMode, updateName } = useUserProfile();
  const [viewProfile, setViewProfile] = useState(false);
  const [viewSolvedMap, setViewSolvedMap] = useState(false);

  // Wrap submitGuess to track stats
  const handleGuess = (input) => {
    const result = game.submitGuess(input);
    if (result && result.status === 'won') {
      markGuessed(game.targetCountry);
      addXp(100);
      // Bonus XP for streak
      if (game.stats.streak > 1) addXp(10 * game.stats.streak);
    }
    return result;
  };

  const augmentedGame = { ...game, submitGuess: handleGuess };

  if (isLoading) return <Loader text="Loading world data..." />;
  if (error) return <div className="error-screen">Error loading data. Please refresh.</div>;

  // Screen priority: ashwinMode > solvedMap > viewProfile > game screen
  let currentScreen = game.screen;
  if (viewProfile) currentScreen = 'profile';
  if (viewSolvedMap) currentScreen = 'solvedMap';
  if (profile.ashwinMode && !viewProfile && !viewSolvedMap) currentScreen = 'ashwinMode';

  return (
    <Layout
      screen={currentScreen}
      onHome={() => { setViewProfile(false); game.setScreen('landing'); }}
      onProfile={() => setViewProfile(true)}
      userLevel={profile.level}
      onUnlockAshwin={toggleAshwinMode}
    >
      {currentScreen === 'profile' && (
        <Profile
          profile={profile}
          topo={topo}
          onBack={() => setViewProfile(false)}
          onToggleVisited={toggleVisited}
          onUpdateName={updateName}
          onUnlockAshwin={toggleAshwinMode}
          onViewSolvedMap={() => setViewSolvedMap(true)}
        />
      )}

      {currentScreen === 'solvedMap' && (
        <SolvedCountries
          profile={profile}
          topo={topo}
          onToggleVisited={toggleVisited}
          onBack={() => {
            setViewSolvedMap(false);
            setViewProfile(true);
          }}
        />
      )}

      {currentScreen === 'ashwinMode' && (
        <AshwinMode
          profile={profile}
          topo={topo}
          onToggleVisited={toggleVisited}
          onBack={() => {
            toggleAshwinMode(); // Turn off Ashwin mode
            setViewProfile(true); // Go back to profile
          }}
        />
      )}

      {currentScreen === 'landing' && (
        <Landing
          game={augmentedGame}
          stats={game.stats}
        />
      )}
      {currentScreen === 'game' && (
        <Game
          game={augmentedGame}
          topo={topo}
          triviaIndex={triviaIndex}
        />
      )}
    </Layout>
  );
}

export default App;
