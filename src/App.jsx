import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import AuthPage from './components/Auth/AuthPage';
import AdminPanel from './components/Admin/AdminPanel';

function AuthenticatedApp() {
  const { currentUser, isAdmin } = useAuth();
  const { isLoading, error, playable, triviaIndex, topo } = useCountryData();
  const game = useGameLogic(playable, triviaIndex);
  const { profile, addXp, toggleVisited, markGuessed, toggleAshwinMode, updateName } = useUserProfile();
  const [viewProfile, setViewProfile] = useState(false);
  const [viewSolvedMap, setViewSolvedMap] = useState(false);
  const [viewAshwinMap, setViewAshwinMap] = useState(false);
  const [viewAdmin, setViewAdmin] = useState(false);

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

  // Show auth page if not logged in
  if (!currentUser) {
    return <AuthPage />;
  }

  if (isLoading) return <Loader text="Loading world data..." />;
  if (error) return <div className="error-screen">Error loading data. Please refresh.</div>;

  // Screen priority: admin > solvedMap > ashwinMode > viewProfile > game screen
  let currentScreen = game.screen;
  if (viewAdmin) currentScreen = 'admin';
  else if (viewSolvedMap) currentScreen = 'solvedMap';
  else if (viewAshwinMap && profile.ashwinMode) currentScreen = 'ashwinMode';
  else if (viewProfile) currentScreen = 'profile';

  return (
    <Layout
      screen={currentScreen}
      onHome={() => {
        setViewProfile(false);
        setViewAdmin(false);
        setViewSolvedMap(false);
        setViewAshwinMap(false);
        game.setScreen('landing');
      }}
      onProfile={() => { setViewProfile(true); setViewAdmin(false); }}
      userLevel={profile.level}
      onUnlockAshwin={toggleAshwinMode}
      isAdmin={isAdmin}
      onViewAdmin={() => { setViewAdmin(true); setViewProfile(false); }}
    >
      {currentScreen === 'admin' && (
        <AdminPanel onBack={() => { setViewAdmin(false); setViewProfile(true); }} />
      )}

      {currentScreen === 'profile' && (
        <Profile
          profile={profile}
          topo={topo}
          onBack={() => setViewProfile(false)}
          onToggleVisited={toggleVisited}
          onUpdateName={updateName}
          onUnlockAshwin={toggleAshwinMode}
          onViewAshwinMap={() => setViewAshwinMap(true)}
          onViewSolvedMap={() => setViewSolvedMap(true)}
          isAdmin={isAdmin}
          onViewAdmin={() => setViewAdmin(true)}
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
            setViewAshwinMap(false); // Close Ashwin mode view
            setViewProfile(true); // Return to profile
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

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
