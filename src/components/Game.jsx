import React, { useState, useEffect, useRef } from 'react';
import Country3D from './Map/Country3D';
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

            {/* Progressive Clue Reveal */}
            <div className="progressive-clues">
                <AnimatePresence>
                    {guesses.length >= 2 && (
                        <motion.div
                            className="clue-card flag-clue clue-unlocked"
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: 0,
                                boxShadow: [
                                    '0 0 0 0 rgba(59, 130, 246, 0)',
                                    '0 0 20px 10px rgba(59, 130, 246, 0.4)',
                                    '0 0 0 0 rgba(59, 130, 246, 0)'
                                ]
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 15,
                                boxShadow: { duration: 1, times: [0, 0.5, 1] }
                            }}
                        >
                            <span className="clue-badge">🔓 UNLOCKED</span>
                            <span className="clue-label">Flag Hint</span>
                            <div className="flag-display">
                                {targetMeta?.trivia?.flag || '🚩'}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {guesses.length >= 4 && (
                        <motion.div
                            className="clue-card fact-clue clue-unlocked"
                            initial={{ opacity: 0, scale: 0.5, rotate: 10 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: 0,
                                boxShadow: [
                                    '0 0 0 0 rgba(16, 185, 129, 0)',
                                    '0 0 20px 10px rgba(16, 185, 129, 0.4)',
                                    '0 0 0 0 rgba(16, 185, 129, 0)'
                                ]
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 15,
                                delay: 0.1,
                                boxShadow: { duration: 1, times: [0, 0.5, 1] }
                            }}
                        >
                            <span className="clue-badge">💡 REVEALED</span>
                            <span className="clue-label">Fun Fact</span>
                            <p className="fact-text">
                                {targetMeta?.trivia?.fact || "A fascinating country in this region..."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                className={`map-wrapper ${guesses.length >= 1 ? 'revealed' : 'silhouette'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    scale: guesses.length >= 1 ? [0.95, 1.03, 1] : 1
                }}
                transition={{
                    delay: 0.1,
                    scale: { duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' }
                }}
            >
                <Country3D topo={topo} targetName={targetCountry} />
                {guesses.length === 0 && <div className="silhouette-overlay">❓ Mystery Silhouette</div>}
                {guesses.length === 1 && (
                    <motion.div
                        className="reveal-flash"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                )}
            </motion.div>

            <div className="guesses-list">
                <AnimatePresence initial={false}>
                    {guesses.map((g, i) => (
                        <motion.div
                            key={i}
                            className="guess-pill"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            layout
                        >
                            <span className="guess-name">{g.country}</span>
                            <div className="guess-metrics">
                                <span className="metric">{g.distance.toLocaleString()} km</span>
                                <motion.div
                                    className="direction-icon"
                                    animate={{ rotate: g.direction }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                >
                                    <Navigation size={14} fill="currentColor" />
                                </motion.div>
                                <span className="proximity-percentage">{g.proximity}%</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {!isComplete && (
                    <div className="game-interaction-area">
                        {easyMode ? (
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
                        )}
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isComplete && (
                    <>
                        {/* Victory Confetti */}
                        {hasWon && (
                            <div className="confetti-container">
                                {[...Array(12)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="confetti-piece"
                                        initial={{
                                            y: -20,
                                            x: Math.random() * 300 - 150,
                                            rotate: 0,
                                            opacity: 1
                                        }}
                                        animate={{
                                            y: 400 + Math.random() * 200,
                                            x: Math.random() * 400 - 200,
                                            rotate: Math.random() * 720 - 360,
                                            opacity: 0
                                        }}
                                        transition={{
                                            duration: 2 + Math.random(),
                                            delay: i * 0.1,
                                            ease: 'easeOut'
                                        }}
                                        style={{
                                            left: `${20 + Math.random() * 60}%`,
                                            background: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][i % 5]
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                        <motion.div
                            className="result-modal"
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 50 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                            <div className="result-content">
                                <motion.h2
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
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
                    </>
                )}
            </AnimatePresence>

            <style>{`
                .game-container {
                    max-width: min(600px, 100%);
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xs);
                    padding: 0 var(--space-xs);
                    height: 100%;
                    overflow: hidden;
                }

                .game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: var(--space-xs);
                }
                
                .header-left {
                    display: flex;
                    gap: 0.35rem;
                    align-items: center;
                }

                .info-badge {
                    font-weight: 600;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    padding: 0.35rem 0.7rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                }
                
                .mode-toggle {
                    font-weight: 600;
                    font-size: 0.75rem;
                    padding: 0.35rem 0.7rem;
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
                    padding: 0.35rem 0.75rem;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                }

                .progressive-clues {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin-bottom: -0.5rem;
                    z-index: 10;
                }

                .clue-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--accent);
                    padding: 0.35rem 0.7rem;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    text-align: center;
                    max-width: 120px;
                }

                .clue-label {
                    font-size: 0.55rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--accent);
                    font-weight: 800;
                    display: block;
                    margin-bottom: 2px;
                }

                .flag-display {
                    font-size: 1.5rem;
                    line-height: 1;
                }

                .fact-clue {
                    max-width: 160px;
                }

                .fact-text {
                    font-size: 0.65rem;
                    margin: 0;
                    line-height: 1.2;
                    color: var(--text-primary);
                }

                .clue-badge {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--accent);
                    color: white;
                    font-size: 0.55rem;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    white-space: nowrap;
                    letter-spacing: 0.5px;
                }

                .flag-clue .clue-badge {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                }

                .fact-clue .clue-badge {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .clue-unlocked {
                    position: relative;
                    animation: clue-glow 2s ease-in-out infinite;
                }

                @keyframes clue-glow {
                    0%, 100% { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
                    50% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4); }
                }

                .map-wrapper {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: var(--radius-lg);
                    padding: var(--space-xs);
                    height: clamp(200px, 35vh, 380px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--glass-shadow);
                    overflow: hidden; 
                    position: relative;
                    transition: all 0.5s ease;
                }

                .map-wrapper.silhouette {
                    filter: grayscale(0.8) drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
                    opacity: 0.9;
                }

                .silhouette-overlay {
                    position: absolute;
                    bottom: 1rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.6);
                    color: white;
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 700;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .map-wrapper.revealed {
                    filter: none;
                    opacity: 1;
                    transition: filter 0.5s ease, opacity 0.5s ease;
                }

                .reveal-flash {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
                    pointer-events: none;
                    z-index: 10;
                    border-radius: var(--radius-xl);
                }

                /* Radial focal point backdrop */
                .map-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    height: 80%;
                    background: radial-gradient(circle, var(--accent-light) 0%, transparent 70%);
                    opacity: 0.3;
                    pointer-events: none;
                    z-index: 0;
                }

                .guesses-list {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: var(--space-xs);
                    padding: var(--space-sm) 0;
                    min-height: 40px;
                    overflow-y: auto;
                    max-height: 120px;
                }

                .guess-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.4rem 0.8rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                    box-shadow: var(--shadow);
                    transition: transform 0.2s ease;
                }

                .guess-pill:hover {
                    transform: scale(1.02);
                    border-color: var(--accent);
                }

                .guess-name {
                    font-weight: 700;
                    font-size: 0.8rem;
                    color: var(--text-primary);
                }

                .guess-metrics {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    font-size: 11px;
                    border-left: 1px solid var(--border);
                    padding-left: 0.5rem;
                }

                .proximity-percentage {
                    font-weight: 800;
                    color: var(--accent);
                    min-width: 2rem;
                }

                .direction-icon {
                    color: var(--accent);
                    display: flex;
                    align-items: center;
                }
                
                /* Input Area */
                .input-area {
                    display: flex;
                    gap: var(--space-sm);
                }

                .input-wrapper {
                    flex: 1;
                    position: relative;
                }

                .game-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    border: 2px solid var(--border);
                    background: var(--glass-bg);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    outline: none;
                    transition: all var(--transition-speed);
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
                    max-height: 150px;
                    overflow-y: auto;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    z-index: 50;
                }
                
                .suggestions-dropdown li {
                    padding: 0.6rem 1rem;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background 0.2s;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.85rem;
                }
                .suggestions-dropdown li:last-child { border-bottom: none; }
                .suggestions-dropdown li:hover { background: var(--bg-primary); }
                
                .suggestion-region {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    background: var(--bg-primary);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                
                /* Easy Mode Options */
                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.75rem;
                    width: 100%;
                }
                
                .option-btn-main {
                    padding: 0.75rem;
                    background: var(--glass-bg);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    justify-content: center;
                    text-align: center;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: var(--radius-md);
                }
                .option-btn-main:hover {
                    border-color: var(--accent);
                    background: var(--bg-secondary);
                }

                .result-modal {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    padding: var(--space-lg);
                    border-radius: var(--radius-xl);
                    text-align: center;
                    box-shadow: var(--shadow-lg);
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90%;
                    max-width: 400px;
                    z-index: 100;
                }

                .result-content h2 {
                    font-size: 1.5rem;
                    margin-bottom: var(--space-xs);
                }

                .result-content p {
                    font-size: 1rem;
                    margin-bottom: var(--space-md);
                }

                .action-row {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-sm);
                    margin-top: var(--space-lg);
                }

                @media (max-width: 640px) {
                    .game-container { gap: var(--space-sm); }
                    .map-wrapper { height: clamp(200px, 35vh, 400px); }
                    .guesses-list { max-height: 80px; }

                    .result-modal {
                        position: fixed;
                        top: 10px;
                        left: 10px;
                        right: 10px;
                        bottom: 10px;
                        width: auto;
                        max-width: none;
                        transform: none;
                        padding: 1rem;
                        border-radius: 16px;
                        overflow-y: auto;
                        display: flex;
                        flex-direction: column;
                    }

                    .result-content {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        min-height: 0;
                    }

                    .result-content h2 {
                        font-size: 1.25rem;
                        margin-bottom: 0.5rem;
                    }

                    .result-content p {
                        font-size: 0.9rem;
                        margin-bottom: 0.75rem;
                    }

                    .action-row {
                        flex-direction: column;
                        gap: 0.5rem;
                        margin-top: 1rem;
                    }

                    .action-row .btn {
                        width: 100%;
                        padding: 0.65rem 1rem;
                        font-size: 0.85rem;
                    }
                }

                /* Victory Confetti */
                .confetti-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 99;
                    overflow: hidden;
                }

                .confetti-piece {
                    position: absolute;
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};

export default Game;
