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
            {/* Hero */}
            <motion.header className="hero" variants={itemVariants}>
                <motion.div
                    className="badge"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Zap size={14} /> <span>Daily Challenge</span>
                </motion.div>
                <h1>Master World Geography</h1>
                <p>Guess countries from their silhouettes. Get instant feedback with distance and direction clues.</p>

                <div className="cta-group">
                    <motion.button
                        className="btn btn-primary"
                        onClick={game.startDaily}
                        disabled={game.dailyCompleted}
                        style={game.dailyCompleted ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                        whileHover={!game.dailyCompleted ? { scale: 1.02 } : {}}
                        whileTap={!game.dailyCompleted ? { scale: 0.98 } : {}}
                    >
                        <Calendar size={18} />
                        {game.dailyCompleted ? 'Daily Completed' : 'Play Daily'}
                    </motion.button>
                    <motion.button
                        className="btn btn-ghost"
                        onClick={game.startUnlimited}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Play size={18} /> Practice Mode
                    </motion.button>
                </div>
            </motion.header>

            {/* Stats */}
            <motion.div className="stats-grid" variants={itemVariants}>
                {[
                    { icon: '🔥', value: stats.streak, label: 'Current Streak' },
                    { icon: '🏆', value: stats.bestStreak, label: 'Best Streak' },
                    { icon: '🌍', value: stats.wins, label: 'Total Wins' }
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="stat-card"
                        variants={itemVariants}
                        whileHover={{
                            scale: 1.05,
                            rotate: [0, -1, 1, 0],
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="stat-icon">{stat.icon}</div>
                        <motion.div
                            className="stat-value"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 10,
                                delay: 0.5 + index * 0.1
                            }}
                        >
                            {stat.value}
                        </motion.div>
                        <div className="stat-label">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            <style>{`
                .landing-container {
                    display: flex;
                    flex-direction: column;
                    gap: clamp(1rem, 5vh, var(--space-xl));
                    padding: clamp(1rem, 3vh, var(--space-lg)) 0;
                    height: 100%;
                    justify-content: center;
                }

                .hero {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-md);
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    color: var(--accent);
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-full);
                    font-size: var(--font-sm);
                    font-weight: 600;
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--shadow);
                }

                h1 {
                    font-size: var(--font-2xl);
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    line-height: 1.1;
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero p {
                    font-size: var(--font-lg);
                    max-width: 600px;
                    color: var(--text-secondary);
                }

                .cta-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--space-sm);
                    margin-top: var(--space-md);
                    justify-content: center;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
                    gap: var(--space-md);
                }

                .stat-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-sm);
                    box-shadow: var(--shadow);
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                }

                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--gradient-accent);
                    transform: scaleX(0);
                    transition: transform 0.3s var(--transition-smooth);
                }

                .stat-card:hover::before {
                    transform: scaleX(1);
                }

                .stat-icon {
                    font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
                    margin-bottom: var(--space-xs);
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                }

                .stat-value {
                    font-size: var(--font-2xl);
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }

                .stat-label {
                    color: var(--text-secondary);
                    font-size: var(--font-sm);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                @media (max-width: 640px) {
                    .cta-group {
                        flex-direction: column;
                        width: 100%;
                    }
                    .btn {
                        width: 100%;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default Landing;
