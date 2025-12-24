import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BonusRounds = ({ game, triviaIndex }) => {
    const {
        targetCountry,
        bonusRound, setBonusRound,
        bonusAnswers, setBonusAnswers,
        playable
    } = game;

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
        // Ensure we have enough wrong options
        if (wrongCaps.length < 3) return []; // Fallback logic could be added
        return [...wrongCaps.slice(0, 3), targetData.trivia.capital[0]].sort(() => Math.random() - 0.5);
    }, [targetData]);

    const neighborOptions = useMemo(() => {
        if (!targetData?.trivia?.borders?.length || !triviaIndex?.byCca3) return null;

        const correctCode = targetData.trivia.borders[Math.floor(Math.random() * targetData.trivia.borders.length)];
        const correctCountry = triviaIndex.byCca3.get(correctCode);
        const correctName = correctCountry?.name?.common;

        if (!correctName) return null;

        const wrong = getRandomCountries(targetCountry, 3); // simplistic, doesn't verify non-neighbor but unlikely
        // Better: filter wrong to ensure not neighbors

        return {
            options: [...wrong.map(c => c.name), correctName].sort(() => Math.random() - 0.5),
            correct: correctName
        };
    }, [targetData, triviaIndex]);


    const handleAnswer = (type, answer, correct) => {
        const isCorrect = answer === correct;
        setBonusAnswers(prev => ({ ...prev, [type]: { answer, correct: isCorrect } }));
    };

    if (!targetData) return null;

    return (
        <div className="bonus-container">
            <h3>Bonus Challenges</h3>

            <div className="tabs">
                <button
                    className={`tab ${bonusRound === 'flag' ? 'active' : ''} ${bonusAnswers.flag ? (bonusAnswers.flag.correct ? 'is-correct' : 'is-wrong') : ''}`}
                    onClick={() => setBonusRound('flag')}
                >
                    🚩 Flag
                </button>
                <button
                    className={`tab ${bonusRound === 'capital' ? 'active' : ''} ${bonusAnswers.capital ? (bonusAnswers.capital.correct ? 'is-correct' : 'is-wrong') : ''}`}
                    onClick={() => setBonusRound('capital')}
                >
                    🏛️ Capital
                </button>
                {neighborOptions && (
                    <button
                        className={`tab ${bonusRound === 'neighbor' ? 'active' : ''} ${bonusAnswers.neighbor ? (bonusAnswers.neighbor.correct ? 'is-correct' : 'is-wrong') : ''}`}
                        onClick={() => setBonusRound('neighbor')}
                    >
                        🌍 Neighbor
                    </button>
                )}
            </div>

            <div className="tab-content">
                {bonusRound === 'flag' && (
                    <div className="challenge-box">
                        <p>Which flag belongs to {targetCountry}?</p>
                        <div className="options-grid flags">
                            {flagOptions.map(c => (
                                <button
                                    key={c.name}
                                    className={`option-btn flag-btn ${bonusAnswers.flag?.answer === c.name ? (bonusAnswers.flag.correct ? 'correct' : 'wrong') : ''}`}
                                    onClick={() => !bonusAnswers.flag && handleAnswer('flag', c.name, targetCountry)}
                                    disabled={!!bonusAnswers.flag}
                                >
                                    <span className="emoji-flag">{c.trivia?.flag || '🏳️'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {bonusRound === 'capital' && (
                    <div className="challenge-box">
                        <p>What is the capital of {targetCountry}?</p>
                        <div className="options-grid">
                            {capitalOptions.map(cap => (
                                <button
                                    key={cap}
                                    className={`option-btn ${bonusAnswers.capital?.answer === cap ? (bonusAnswers.capital.correct ? 'correct' : 'wrong') : ''}`}
                                    onClick={() => !bonusAnswers.capital && handleAnswer('capital', cap, targetData.trivia.capital[0])}
                                    disabled={!!bonusAnswers.capital}
                                >
                                    {cap}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {bonusRound === 'neighbor' && neighborOptions && (
                    <div className="challenge-box">
                        <p>Which country shares a border with {targetCountry}?</p>
                        <div className="options-grid">
                            {neighborOptions.options.map(n => (
                                <button
                                    key={n}
                                    className={`option-btn ${bonusAnswers.neighbor?.answer === n ? (bonusAnswers.neighbor.correct ? 'correct' : 'wrong') : ''}`}
                                    onClick={() => !bonusAnswers.neighbor && handleAnswer('neighbor', n, neighborOptions.correct)}
                                    disabled={!!bonusAnswers.neighbor}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .bonus-container {
                    margin-top: 2rem;
                    text-align: left;
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border);
                }
                .tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 0.5rem;
                }
                .tab {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-secondary);
                    border-radius: var(--radius-md);
                    transition: all 0.2s;
                }
                .tab:hover { background: var(--bg-primary); }
                .tab.active { background: var(--bg-primary); color: var(--text-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .tab.is-correct { color: var(--success); }
                .tab.is-wrong { color: var(--danger); }

                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 1rem;
                }
                .options-grid.flags {
                    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
                }
                .option-btn {
                    padding: 1rem;
                    border: 1px solid var(--border);
                    background: var(--bg-primary);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .option-btn:hover:not(:disabled) {
                    border-color: var(--accent);
                }
                .option-btn.correct { background: #dcfce7; border-color: #15803d; color: #15803d; }
                .option-btn.wrong { background: #fee2e2; border-color: #b91c1c; color: #b91c1c; }
                
                .emoji-flag { font-size: 2.5rem; }
            `}</style>
        </div>
    );
};

export default BonusRounds;
