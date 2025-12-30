import React from 'react';
import { Play, Zap, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = ({ game, stats }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <motion.div
            className="landing-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Ambient Background Shapes */}
            <div className="ambient-bg">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`ambient-shape shape-${i % 3}`}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 15, 0],
                            rotate: [0, 180, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.5
                        }}
                        style={{
                            left: `${10 + i * 15}%`,
                            top: `${15 + (i % 3) * 25}%`
                        }}
                    />
                ))}
            </div>
            {/* Hero Splash */}
            <motion.div className="hero-splash" variants={itemVariants}>
                <motion.div
                    className="app-icon-large"
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    🌍
                </motion.div>

                <h1 className="splash-title">Atlasly</h1>
                <p className="splash-subtitle">Master the Map. Conquer the World.</p>

                <div className="game-modes-vertical">
                    <motion.button
                        className="btn btn-primary btn-lg"
                        onClick={game.startDaily}
                        disabled={game.dailyCompleted}
                        whileHover={!game.dailyCompleted ? { scale: 1.03, boxShadow: '0 8px 30px rgba(37, 99, 235, 0.5)' } : {}}
                        whileTap={!game.dailyCompleted ? { scale: 0.97 } : {}}
                    >
                        <Calendar size={20} />
                        <span>{game.dailyCompleted ? 'Daily Solved' : 'Daily Challenge'}</span>
                        {!game.dailyCompleted && <div className="btn-shine" />}
                    </motion.button>

                    <motion.button
                        className="btn btn-secondary btn-lg"
                        onClick={game.startUnlimited}
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)' }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Play size={20} /> <span>Practice Mode</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Quick Stats Row */}
            <motion.div className="quick-stats-row" variants={itemVariants}>
                {[
                    { icon: '🔥', value: stats.streak, label: 'Streak' },
                    { icon: '🌍', value: stats.wins, label: 'Wins' }
                ].map((stat) => (
                    <div key={stat.label} className="mini-stat">
                        <span className="mini-icon">{stat.icon}</span>
                        <span className="mini-value">{stat.value}</span>
                        <span className="mini-label">{stat.label}</span>
                    </div>
                ))}
            </motion.div>

            <style>{`
                .landing-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                    padding: var(--space-sm) var(--space-md);
                    text-align: center;
                    overflow: hidden;
                    position: relative;
                }

                /* Ambient Background */
                .ambient-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    overflow: hidden;
                    z-index: 0;
                }

                .ambient-shape {
                    position: absolute;
                    opacity: 0.08;
                    border-radius: 50%;
                }

                .shape-0 {
                    width: 120px;
                    height: 120px;
                    background: var(--accent);
                    border-radius: 50%;
                }

                .shape-1 {
                    width: 80px;
                    height: 80px;
                    background: var(--success);
                    border-radius: 30%;
                }

                .shape-2 {
                    width: 60px;
                    height: 60px;
                    background: var(--gradient-accent);
                    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
                    border-radius: 0;
                }

                .hero-splash {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-sm);
                    position: relative;
                    z-index: 1;
                }

                .app-icon-large {
                    font-size: 3.5rem;
                    filter: drop-shadow(0 8px 16px rgba(0,0,0,0.2));
                }

                .splash-title {
                    font-size: 2.25rem;
                    font-weight: 900;
                    margin: 0;
                    background: var(--gradient-accent);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.05em;
                }

                .splash-subtitle {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    margin: 0;
                    font-weight: 500;
                }

                .game-modes-vertical {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xs);
                    width: 100%;
                    max-width: 280px;
                    margin-top: var(--space-md);
                }

                .btn-lg {
                    padding: 0.9rem;
                    font-size: 1rem;
                    border-radius: var(--radius-md);
                    width: 100%;
                }

                .btn-shine {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.4),
                        transparent
                    );
                    animation: shine 3s infinite;
                }

                @keyframes shine {
                    0% { left: -100%; }
                    20% { left: 100%; }
                    100% { left: 100%; }
                }

                .quick-stats-row {
                    display: flex;
                    justify-content: center;
                    gap: var(--space-lg);
                    padding-top: var(--space-sm);
                    border-top: 1px solid var(--glass-border);
                }

                .mini-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1px;
                }

                .mini-value {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }

                .mini-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .btn-secondary {
                    background: var(--bg-tertiary);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }

                @media (max-height: 600px) {
                    .app-icon-large { font-size: 3rem; }
                    .splash-title { font-size: 2rem; }
                    .game-modes-vertical { margin-top: var(--space-md); }
                }
            `}</style>
        </motion.div>
    );
};

export default Landing;
