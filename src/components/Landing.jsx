import React from 'react';
import { Play, Zap, Trophy, Map as MapIcon, Calendar } from 'lucide-react';

const Landing = ({ game, stats }) => {
    return (
        <div className="landing-container">
            {/* Hero */}
            <header className="hero">
                <div className="badge">
                    <Zap size={14} /> <span>Daily Challenge</span>
                </div>
                <h1>Master World Geography</h1>
                <p>Guess countries from their silhouettes. Get instant feedback with distance and direction clues.</p>

                <div className="cta-group">
                    <button
                        className="btn btn-primary"
                        onClick={game.startDaily}
                        disabled={game.dailyCompleted}
                        style={game.dailyCompleted ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                    >
                        <Calendar size={18} />
                        {game.dailyCompleted ? 'Daily Completed' : 'Play Daily'}
                    </button>
                    <button className="btn btn-ghost" onClick={game.startUnlimited}>
                        <Play size={18} /> Practice Mode
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{stats.streak}</div>
                    <div className="stat-label">Current Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{stats.bestStreak}</div>
                    <div className="stat-label">Best Streak</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🌍</div>
                    <div className="stat-value">{stats.wins}</div>
                    <div className="stat-label">Total Wins</div>
                </div>
            </div>

            <style>{`
                .landing-container {
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                    padding: 2rem 0;
                    animation: fadeIn 0.5s ease-out;
                }
                .hero {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }
                .badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-secondary);
                    color: var(--accent);
                    padding: 0.4rem 0.8rem;
                    border-radius: 2rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    border: 1px solid var(--border);
                }
                h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    line-height: 1.1;
                }
                .hero p {
                    font-size: 1.25rem;
                    max-width: 600px;
                }
                .cta-group {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                .stat-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                }
                .stat-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .stat-label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                @media (max-width: 600px) {
                    h1 { font-size: 2rem; }
                    .cta-group { flex-direction: column; width: 100%; }
                    .btn { width: 100%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Landing;
