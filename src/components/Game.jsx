import React, { useState, useEffect, useRef } from 'react';
import CountrySilhouette from './Map/CountrySilhouette';
import { Navigation, Check, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BonusRounds from './BonusRounds';
import { normalizeName } from '../utils/geography';

const Game = ({ game, topo, triviaIndex }) => {
    const {
        targetCountry, guesses, gameStatus, submitGuess, playable,
        easyMode, setEasyMode, currentOptions
    } = game;

    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionsRef = useRef(null);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter suggestions
    useEffect(() => {
        if (!input.trim()) {
            setSuggestions([]);
            return;
        }
        const normInput = normalizeName(input);
        const matches = playable
            .filter(c => c.norm.includes(normInput) || (c.trivia?.region && c.trivia.region.toLowerCase().includes(normInput)))
            .slice(0, 10); // Limit to 10 for performance/UX
        setSuggestions(matches);
    }, [input, playable]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        submitAndClear(input);
    };

    const submitAndClear = (val) => {
        const res = submitGuess(val);
        if (res && res.success) {
            setInput('');
            setShowSuggestions(false);
        }
    };

    const isComplete = gameStatus !== 'playing';
    const hasWon = gameStatus === 'won';

    // Get Target Region for Easy Mode
    const targetMeta = playable.find(c => c.name === targetCountry);
    const regionHint = targetMeta?.trivia?.region;

    return (
        <div className="game-container">
            <motion.div
                className="game-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-left">
                    <div className="info-badge">
                        Attempt {guesses.length} / 6
                    </div>
                    <button
                        className={`mode-toggle ${easyMode ? 'active' : ''}`}
                        onClick={() => setEasyMode(!easyMode)}
                        title={easyMode ? "Switch to Hard Mode" : "Switch to Easy Mode"}
                    >
                        {easyMode ? '🐣 Easy' : '🧠 Hard'}
                    </button>
                </div>

                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            className={`status-badge ${hasWon ? 'success' : 'danger'}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            {hasWon ? '🎉 Solved!' : '😅 Game Over'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {easyMode && regionHint && (
                <motion.div
                    className="hint-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <Compass size={16} /> Location: <strong>{regionHint}</strong>
                </motion.div>
            )}

            <motion.div
                className="map-wrapper"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
            >
                <CountrySilhouette topo={topo} targetName={targetCountry} />
            </motion.div>

            <div className="guesses-list">
                <AnimatePresence initial={false}>
                    {guesses.map((g, i) => (
                        <motion.div
                            key={i}
                            className="guess-item"
                            initial={{ opacity: 0, x: -50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            layout
                        >
                            <span className="guess-name">{g.country}</span>
                            <div className="guess-metrics">
                                <span className="metric">{g.distance} km</span>
                                <motion.div
                                    animate={{ rotate: g.direction }}
                                    transition={{ type: 'spring', stiffness: 100 }}
                                >
                                    <Navigation size={18} />
                                </motion.div>
                                <span className="metric proximity">{g.proximity}%</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {!isComplete && (
                    easyMode ? (
                        <motion.div
                            className="options-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            {currentOptions.map(opt => (
                                <button
                                    key={opt}
                                    className="btn option-btn-main"
                                    onClick={() => submitAndClear(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.form
                            className="input-area"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ position: 'relative' }}
                            ref={suggestionsRef}
                        >
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className="game-input"
                                    placeholder="Type a country name..."
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    autoFocus
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="suggestions-dropdown">
                                        {suggestions.map(c => (
                                            <li
                                                key={c.name}
                                                onClick={() => {
                                                    setInput(c.name);
                                                    submitAndClear(c.name);
                                                }}
                                            >
                                                {c.name}
                                                {c.trivia?.region && <span className="suggestion-region">{c.trivia.region}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Guess
                            </motion.button>
                        </motion.form>
                    )
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        className="result-modal"
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <div className="result-content">
                            <motion.h2
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                {hasWon ? '🎉 Outstanding!' : '🗺️ Good Try!'}
                            </motion.h2>
                            <p>The country was <strong>{targetCountry}</strong>.</p>

                            {hasWon && <BonusRounds game={game} triviaIndex={triviaIndex} />}

                            <div className="action-row">
                                <motion.button
                                    className="btn btn-primary"
                                    onClick={game.startUnlimited}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Play Another
                                </motion.button>
                                <motion.button
                                    className="btn btn-ghost"
                                    onClick={() => game.setScreen('landing')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Back Home
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .game-container {
                    max-width: min(600px, 100%);
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                    padding: 0 var(--space-sm);
                }

                .game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--space-sm);
                }
                
                .header-left {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .info-badge {
                    font-weight: 600;
                    font-size: var(--font-sm);
                    color: var(--text-secondary);
                    padding: 0.5rem 1rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                }
                
                .mode-toggle {
                    font-weight: 600;
                    font-size: var(--font-sm);
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    border-radius: var(--radius-full);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mode-toggle:hover { background: var(--bg-secondary); }
                .mode-toggle.active {
                    background: var(--accent-light);
                    color: white;
                    border-color: var(--accent);
                }

                .status-badge {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-full);
                    font-weight: 700;
                    font-size: var(--font-sm);
                }

                .status-badge.success {
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    color: #15803d;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                .status-badge.danger {
                    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                    color: #b91c1c;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                
                .hint-banner {
                    background: var(--accent-light);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: var(--font-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .map-wrapper {
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border-radius: var(--radius-xl);
                    padding: var(--space-md);
                    height: clamp(250px, 40vh, 400px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--shadow);
                }

                .guesses-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-sm);
                    min-height: 100px;
                }

                .guess-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: var(--space-sm) var(--space-md);
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow);
                }

                .guess-name {
                    font-weight: 600;
                    font-size: var(--font-base);
                    color: var(--text-primary);
                    flex: 1;
                    min-width: 140px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .guess-metrics {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                }

                .metric.proximity {
                    font-weight: 700;
                    color: var(--accent);
                }
                
                /* Input Area */
                .input-area {
                    display: flex;
                    gap: var(--space-sm);
                    flex-wrap: wrap;
                }

                .input-wrapper {
                    flex: 1;
                    position: relative;
                    min-width: 200px;
                }

                .game-input {
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    border-radius: var(--radius-md);
                    border: 2px solid var(--border);
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    color: var(--text-primary);
                    font-size: var(--font-base);
                    outline: none;
                    transition: all var(--transition-speed) var(--transition-smooth);
                }

                .game-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                }
                
                .suggestions-dropdown {
                    position: absolute;
                    bottom: 110%; 
                    left: 0;
                    right: 0;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    max-height: 200px;
                    overflow-y: auto;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    z-index: 50;
                }
                
                .suggestions-dropdown li {
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background 0.2s;
                    border-bottom: 1px solid var(--border);
                }
                .suggestions-dropdown li:last-child { border-bottom: none; }
                .suggestions-dropdown li:hover { background: var(--bg-primary); }
                
                .suggestion-region {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    background: var(--bg-primary);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                
                /* Easy Mode Options */
                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
                    gap: 1rem;
                    width: 100%;
                }
                
                .option-btn-main {
                    padding: 1rem;
                    background: var(--glass-bg);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    justify-content: center;
                    text-align: center;
                }
                .option-btn-main:hover {
                    border-color: var(--accent);
                    background: var(--bg-secondary);
                }

                .result-modal {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    padding: var(--space-xl);
                    border-radius: var(--radius-xl);
                    text-align: center;
                    box-shadow: var(--shadow-lg);
                }

                .result-content h2 {
                    font-size: var(--font-xl);
                    margin-bottom: var(--space-sm);
                }

                .result-content p {
                    font-size: var(--font-lg);
                    margin-bottom: var(--space-md);
                }

                .action-row {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-sm);
                    margin-top: var(--space-lg);
                    flex-wrap: wrap;
                }

                @media (max-width: 640px) {
                    .input-area {
                        flex-direction: column;
                    }
                    .game-input {
                        width: 100%;
                    }
                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Game;
