import React from 'react';
import Layout from './components/Layout';
import Loader from './components/UI/Loader';
import { useCountryData } from './hooks/useCountryData';
import { useGameLogic } from './hooks/useGameLogic';
import Landing from './components/Landing';
import Game from './components/Game';

function App() {
  const { isLoading, error, playable, triviaIndex, topo } = useCountryData();
  const game = useGameLogic(playable, triviaIndex);

  if (isLoading) return <Loader text="Loading world data..." />;
  if (error) return <div className="error-screen">Error loading data. Please refresh.</div>;

  return (
    <Layout screen={game.screen} onHome={() => game.setScreen('landing')}>
      {game.screen === 'landing' && (
        <Landing
          game={game}
          stats={game.stats}
        />
      )}
      {game.screen === 'game' && (
        <Game
          game={game}
          topo={topo}
          triviaIndex={triviaIndex}
        />
      )}
    </Layout>
  );
}

export default App;
