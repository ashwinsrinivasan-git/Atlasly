import React, { useState } from 'react';
import CountrySilhouette from './Map/CountrySilhouette';
import { Navigation, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BonusRounds from './BonusRounds';

const Game = ({ game, topo, triviaIndex }) => {
    const {
        targetCountry, guesses, gameStatus, submitGuess, playable
    } = game;

    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const res = submitGuess(input);
        if (res && res.success) {
            setInput('');
        }
    };

    const isComplete = gameStatus !== 'playing';
    const hasWon = gameStatus === 'won';

    return (
        <div className="game-container">
            <div className="game-header">
                <div className="info-badge">
                    Attempt {guesses.length} / 6
                </div>
                {isComplete && (
                    <div className={`status-badge ${hasWon ? 'success' : 'danger'}`}>
                        {hasWon ? 'Solved!' : 'Game Over'}
                    </div>
                )}
            </div>

            <div className="map-wrapper">
                <CountrySilhouette topo={topo} targetName={targetCountry} />
            </div>

            <div className="guesses-list">
                <AnimatePresence initial={false}>
                    {guesses.map((g, i) => (
                        <motion.div
                            key={i}
                            className="guess-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            layout
                        >
                            <span className="guess-name">{g.country}</span>
                            <div className="guess-metrics">
                                <span className="metric">{g.distance} km</span>
                                <Navigation
                                    size={18}
                                    style={{ transform: `rotate(${g.direction}deg)` }}
                                />
                                <span className="metric">{g.proximity}%</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {!isComplete && (
                <form className="input-area" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="game-input"
                        placeholder="Type a country name..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        list="countries-list"
                        autoFocus
                    />
                    <datalist id="countries-list">
                        {playable.slice(0, 50).map(c => (
                            <option key={c.name} value={c.name} />
                        ))}
                    </datalist>
                    <button type="submit" className="btn btn-primary">Guess</button>
                </form>
            )}

            {isComplete && (
                <motion.div
                    className="result-modal"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="result-content">
                        <h2>{hasWon ? '🎉 Outstanding!' : '🗺️ Good Try!'}</h2>
                        <p>The country was <strong>{targetCountry}</strong>.</p>

                        {hasWon && <BonusRounds game={game} triviaIndex={triviaIndex} />}

                        <div className="action-row">
                            <button className="btn btn-primary" onClick={game.startUnlimited}>Play Another</button>
                            <button className="btn btn-ghost" onClick={() => game.setScreen('landing')}>Back Home</button>
                        </div>
                    </div>
                </motion.div>
            )}

            <style>{`
                .game-container {
                    max-width: 600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .info-badge {
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .status-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .status-badge.success { background: #dcfce7; color: #15803d; }
                .status-badge.danger { background: #fee2e2; color: #b91c1c; }
                
                .map-wrapper {
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    padding: 1rem;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--border);
                }

                .guesses-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-height: 100px;
                }
                .guess-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .guess-name { font-weight: 600; }
                .guess-metrics { display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem; }
                
                .input-area {
                    display: flex;
                    gap: 0.5rem;
                }
                .game-input {
                    flex: 1;
                    padding: 0.8rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 1rem;
                    outline: none;
                }
                .game-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 2px var(--accent-hover);
                }

                .result-modal {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    text-align: center;
                    box-shadow: var(--shadow);
                }
                .result-content h2 { font-size: 2rem; margin-bottom: 0.5rem; }
                .action-row {
                    display: flex;
                    justify-content: center;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default Game;
