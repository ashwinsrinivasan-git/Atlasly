import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Building2, Globe, Check, X, Sparkles, Trophy, Star } from 'lucide-react';

const BonusRounds = ({ game, triviaIndex }) => {
    const {
        targetCountry,
        bonusRound, setBonusRound,
        bonusAnswers, setBonusAnswers,
        playable
    } = game;

    const [showFeedback, setShowFeedback] = useState(null);

    const targetData = useMemo(() => {
        return playable.find(c => c.name === targetCountry);
    }, [targetCountry, playable]);

    // Helpers to generate options
    const getRandomCountries = (exclude, count = 3) => {
        const available = playable.filter(c => c.name !== exclude);
        const selected = [];
        const pool = [...available];
        while (selected.length < count && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            selected.push(pool[idx]);
            pool.splice(idx, 1);
        }
        return selected;
    };

    const flagOptions = useMemo(() => {
        if (!targetData) return [];
        const wrong = getRandomCountries(targetCountry, 3);
        return [...wrong, targetData].sort(() => Math.random() - 0.5);
    }, [targetData]);

    const capitalOptions = useMemo(() => {
        if (!targetData?.trivia?.capital?.[0]) return [];
        const wrong = getRandomCountries(targetCountry, 3);
        const wrongCaps = wrong.map(c => c.trivia?.capital?.[0]).filter(Boolean);
        if (wrongCaps.length < 3) return [];
        return [...wrongCaps.slice(0, 3), targetData.trivia.capital[0]].sort(() => Math.random() - 0.5);
    }, [targetData]);

    const neighborOptions = useMemo(() => {
        if (!targetData?.trivia?.borders?.length || !triviaIndex?.byCca3) return null;

        const correctCode = targetData.trivia.borders[Math.floor(Math.random() * targetData.trivia.borders.length)];
        const correctCountry = triviaIndex.byCca3.get(correctCode);
        const correctName = correctCountry?.name?.common;

        if (!correctName) return null;

        const wrong = getRandomCountries(targetCountry, 3);

        return {
            options: [...wrong.map(c => c.name), correctName].sort(() => Math.random() - 0.5),
            correct: correctName
        };
    }, [targetData, triviaIndex]);

    const handleAnswer = (type, answer, correct) => {
        const isCorrect = answer === correct;
        setBonusAnswers(prev => ({ ...prev, [type]: { answer, correct: isCorrect } }));
        setShowFeedback({ type, correct: isCorrect });
        setTimeout(() => setShowFeedback(null), 1500);
    };

    const getCompletedCount = () => {
        let count = 0;
        if (bonusAnswers.flag?.correct) count++;
        if (bonusAnswers.capital?.correct) count++;
        if (bonusAnswers.neighbor?.correct) count++;
        return count;
    };

    const getTotalChallenges = () => {
        let total = 2; // Flag + Capital always available
        if (neighborOptions) total++;
        return total;
    };

    if (!targetData) return null;

    const challenges = [
        {
            id: 'flag',
            icon: Flag,
            label: 'Flag',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.4)'
        },
        {
            id: 'capital',
            icon: Building2,
            label: 'Capital',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            shadowColor: 'rgba(245, 87, 108, 0.4)'
        },
        ...(neighborOptions ? [{
            id: 'neighbor',
            icon: Globe,
            label: 'Neighbor',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            shadowColor: 'rgba(79, 172, 254, 0.4)'
        }] : [])
    ];

    return (
        <div className="bonus-wrapper">
            {/* Header */}
            <motion.div
                className="bonus-header"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="header-title">
                    <Sparkles size={18} />
                    <span>Bonus Challenges</span>
                </div>
                <div className="score-badge">
                    <Star size={14} />
                    <span>{getCompletedCount()}/{getTotalChallenges()}</span>
                </div>
            </motion.div>

            {/* Challenge Tabs */}
            <motion.div
                className="challenge-tabs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {challenges.map((challenge, index) => {
                    const Icon = challenge.icon;
                    const isActive = bonusRound === challenge.id;
                    const answer = bonusAnswers[challenge.id];

                    return (
                        <motion.button
                            key={challenge.id}
                            className={`challenge-tab ${isActive ? 'active' : ''} ${answer ? (answer.correct ? 'correct' : 'wrong') : ''}`}
                            onClick={() => setBonusRound(challenge.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                '--tab-gradient': challenge.gradient,
                                '--tab-shadow': challenge.shadowColor
                            }}
                        >
                            <div className="tab-icon">
                                <Icon size={16} />
                            </div>
                            <span className="tab-label">{challenge.label}</span>
                            {answer && (
                                <motion.div
                                    className="tab-status"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                >
                                    {answer.correct ? <Check size={12} /> : <X size={12} />}
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Challenge Content */}
            <AnimatePresence mode="wait">
                {bonusRound && (
                    <motion.div
                        key={bonusRound}
                        className="challenge-content"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Flag Challenge */}
                        {bonusRound === 'flag' && (
                            <div className="challenge-box">
                                <p className="challenge-question">
                                    Which flag belongs to <strong>{targetCountry}</strong>?
                                </p>
                                <div className="options-grid flags">
                                    {flagOptions.map((c, index) => (
                                        <motion.button
                                            key={c.name}
                                            className={`option-card flag-card ${bonusAnswers.flag?.answer === c.name ? (bonusAnswers.flag.correct ? 'correct' : 'wrong') : ''}`}
                                            onClick={() => !bonusAnswers.flag && handleAnswer('flag', c.name, targetCountry)}
                                            disabled={!!bonusAnswers.flag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={!bonusAnswers.flag ? { scale: 1.05, y: -4 } : {}}
                                            whileTap={!bonusAnswers.flag ? { scale: 0.95 } : {}}
                                        >
                                            <span className="flag-emoji">{c.trivia?.flag || '🏳️'}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capital Challenge */}
                        {bonusRound === 'capital' && (
                            <div className="challenge-box">
                                <p className="challenge-question">
                                    What is the capital of <strong>{targetCountry}</strong>?
                                </p>
                                <div className="options-grid text">
                                    {capitalOptions.map((cap, index) => (
                                        <motion.button
                                            key={cap}
                                            className={`option-card text-card ${bonusAnswers.capital?.answer === cap ? (bonusAnswers.capital.correct ? 'correct' : 'wrong') : ''}`}
                                            onClick={() => !bonusAnswers.capital && handleAnswer('capital', cap, targetData.trivia.capital[0])}
                                            disabled={!!bonusAnswers.capital}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={!bonusAnswers.capital ? { scale: 1.02, x: 4 } : {}}
                                            whileTap={!bonusAnswers.capital ? { scale: 0.98 } : {}}
                                        >
                                            <span className="option-text">{cap}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Neighbor Challenge */}
                        {bonusRound === 'neighbor' && neighborOptions && (
                            <div className="challenge-box">
                                <p className="challenge-question">
                                    Which country borders <strong>{targetCountry}</strong>?
                                </p>
                                <div className="options-grid text">
                                    {neighborOptions.options.map((n, index) => (
                                        <motion.button
                                            key={n}
                                            className={`option-card text-card ${bonusAnswers.neighbor?.answer === n ? (bonusAnswers.neighbor.correct ? 'correct' : 'wrong') : ''}`}
                                            onClick={() => !bonusAnswers.neighbor && handleAnswer('neighbor', n, neighborOptions.correct)}
                                            disabled={!!bonusAnswers.neighbor}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={!bonusAnswers.neighbor ? { scale: 1.02, x: 4 } : {}}
                                            whileTap={!bonusAnswers.neighbor ? { scale: 0.98 } : {}}
                                        >
                                            <span className="option-text">{n}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Toast */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        className={`feedback-toast ${showFeedback.correct ? 'correct' : 'wrong'}`}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        {showFeedback.correct ? (
                            <>
                                <Trophy size={16} />
                                <span>Correct! +10 XP</span>
                            </>
                        ) : (
                            <>
                                <X size={16} />
                                <span>Not quite!</span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .bonus-wrapper {
                    margin-top: 1.25rem;
                    background: linear-gradient(145deg, var(--glass-bg), rgba(0,0,0,0.05));
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 16px;
                    padding: 1rem;
                    position: relative;
                    overflow: hidden;
                }

                .bonus-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #f5576c, #4facfe);
                    opacity: 0.8;
                }

                .bonus-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .header-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }

                .header-title svg {
                    color: #f59e0b;
                }

                .score-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 0.3rem 0.7rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                }

                .challenge-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .challenge-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.4rem;
                    padding: 0.6rem 0.75rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .challenge-tab::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: var(--tab-gradient);
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .challenge-tab:hover::before {
                    opacity: 0.1;
                }

                .challenge-tab.active {
                    border-color: transparent;
                    box-shadow: 0 4px 12px var(--tab-shadow);
                }

                .challenge-tab.active::before {
                    opacity: 1;
                }

                .challenge-tab.active .tab-icon,
                .challenge-tab.active .tab-label {
                    color: white;
                    position: relative;
                    z-index: 1;
                }

                .challenge-tab.correct {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.1);
                }

                .challenge-tab.wrong {
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .tab-icon {
                    display: flex;
                    color: var(--text-secondary);
                }

                .tab-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .tab-status {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #10b981;
                    color: white;
                    z-index: 2;
                }

                .challenge-tab.wrong .tab-status {
                    background: #ef4444;
                }

                .challenge-content {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1rem;
                }

                .challenge-question {
                    margin: 0 0 0.75rem 0;
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .challenge-question strong {
                    color: var(--accent);
                    font-weight: 700;
                }

                .options-grid {
                    display: grid;
                    gap: 0.5rem;
                }

                .options-grid.flags {
                    grid-template-columns: repeat(4, 1fr);
                }

                .options-grid.text {
                    grid-template-columns: repeat(2, 1fr);
                }

                .option-card {
                    background: var(--bg-secondary);
                    border: 2px solid var(--border);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .option-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--accent), #8b5cf6);
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .option-card:hover:not(:disabled)::before {
                    opacity: 0.1;
                }

                .option-card:hover:not(:disabled) {
                    border-color: var(--accent);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
                }

                .option-card:disabled {
                    cursor: default;
                }

                .option-card.correct {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.15);
                }

                .option-card.correct::after {
                    content: '✓';
                    position: absolute;
                    top: 4px;
                    right: 6px;
                    color: #10b981;
                    font-weight: bold;
                    font-size: 0.75rem;
                }

                .option-card.wrong {
                    border-color: #ef4444;
                    background: rgba(239, 68, 68, 0.15);
                }

                .option-card.wrong::after {
                    content: '✗';
                    position: absolute;
                    top: 4px;
                    right: 6px;
                    color: #ef4444;
                    font-weight: bold;
                    font-size: 0.75rem;
                }

                .flag-card {
                    padding: 0.75rem 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .flag-emoji {
                    font-size: 2rem;
                    line-height: 1;
                    position: relative;
                    z-index: 1;
                }

                .text-card {
                    padding: 0.65rem 0.75rem;
                }

                .option-text {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    position: relative;
                    z-index: 1;
                }

                .feedback-toast {
                    position: absolute;
                    bottom: 1rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    backdrop-filter: blur(10px);
                    z-index: 10;
                }

                .feedback-toast.correct {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                }

                .feedback-toast.wrong {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
                }

                @media (max-width: 640px) {
                    .bonus-wrapper {
                        margin-top: 0.75rem;
                        padding: 0.6rem;
                        border-radius: 12px;
                    }

                    .bonus-header {
                        margin-bottom: 0.5rem;
                    }

                    .header-title {
                        font-size: 0.8rem;
                        gap: 0.35rem;
                    }

                    .header-title svg {
                        width: 14px;
                        height: 14px;
                    }

                    .score-badge {
                        padding: 0.2rem 0.5rem;
                        font-size: 0.7rem;
                    }

                    .challenge-tabs {
                        gap: 0.35rem;
                        margin-bottom: 0.5rem;
                    }

                    .challenge-tab {
                        padding: 0.45rem 0.5rem;
                        border-radius: 8px;
                    }

                    .tab-icon svg {
                        width: 14px;
                        height: 14px;
                    }

                    .tab-label {
                        display: none;
                    }

                    .tab-status {
                        width: 14px;
                        height: 14px;
                        top: -3px;
                        right: -3px;
                    }

                    .tab-status svg {
                        width: 10px;
                        height: 10px;
                    }

                    .challenge-content {
                        padding: 0.65rem;
                        border-radius: 10px;
                    }

                    .challenge-question {
                        font-size: 0.75rem;
                        margin-bottom: 0.5rem;
                    }

                    .options-grid {
                        gap: 0.35rem;
                    }

                    .options-grid.flags {
                        grid-template-columns: repeat(4, 1fr);
                    }

                    .options-grid.text {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .flag-card {
                        padding: 0.5rem 0.35rem;
                        border-radius: 8px;
                        border-width: 1.5px;
                    }

                    .flag-emoji {
                        font-size: 1.5rem;
                    }

                    .text-card {
                        padding: 0.5rem 0.5rem;
                        border-radius: 8px;
                        border-width: 1.5px;
                    }

                    .option-text {
                        font-size: 0.7rem;
                    }

                    .feedback-toast {
                        padding: 0.4rem 0.75rem;
                        font-size: 0.7rem;
                        border-radius: 16px;
                        bottom: 0.5rem;
                    }

                    .feedback-toast svg {
                        width: 12px;
                        height: 12px;
                    }
                }

                @media (max-width: 380px) {
                    .bonus-wrapper {
                        padding: 0.5rem;
                        margin-top: 0.5rem;
                    }

                    .options-grid.flags {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .options-grid.text {
                        grid-template-columns: 1fr;
                    }

                    .flag-emoji {
                        font-size: 1.75rem;
                    }

                    .text-card {
                        padding: 0.6rem 0.65rem;
                    }

                    .option-text {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BonusRounds;
