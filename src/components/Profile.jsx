import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WorldGlobe from './Map/WorldGlobe';
import { Globe, MapPin, User, Star, Edit2, Check, Lock, Shield } from 'lucide-react';

const Profile = ({ profile, onBack, onToggleVisited, topo, onUpdateName, onUnlockAshwin, onViewSolvedMap, isAdmin, onViewAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(profile.name);

    // XP Progress
    const xpForNext = 500 * profile.level;
    const progress = (profile.xp / xpForNext) * 100;

    const handleSaveName = () => {
        onUpdateName(tempName);
        setIsEditing(false);
    };

    return (
        <div className="profile-container">
            <motion.div
                className={`profile-header ${profile.ashwinMode ? 'ashwin-border' : ''}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="profile-info">
                    <motion.div
                        className="avatar-circle"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <User size={32} />
                    </motion.div>
                    <div className="name-section">
                        {isEditing ? (
                            <div className="edit-group">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    autoFocus
                                    className="name-input"
                                />
                                <button className="icon-btn-small" onClick={handleSaveName}><Check size={16} /></button>
                            </div>
                        ) : (
                            <div className="display-group" onClick={() => setIsEditing(true)}>
                                <h1>{profile.name} {profile.ashwinMode && <span className="ashwin-tag">Ashwin Mode</span>}</h1>
                                <Edit2 size={14} className="edit-icon" />
                            </div>
                        )}
                        <div className="level-badge">Level {profile.level} Explorer</div>
                    </div>
                </div>

                <div className="profile-actions">
                    {isAdmin && (
                        <motion.button
                            className="btn btn-admin"
                            onClick={onViewAdmin}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Shield size={18} />
                            Admin Panel
                        </motion.button>
                    )}
                    <button className="btn btn-ghost" onClick={onBack}>
                        Back to Menu
                    </button>
                </div>
            </motion.div>

            <motion.div
                className="stats-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="stat-card xp-card">
                    <Star className="stat-icon xp" />
                    <div className="stat-main">
                        <div className="stat-value">{profile.xp} <span className="stat-unit">XP</span></div>
                        <div className="xp-progress-container">
                            <div className="xp-bar">
                                <motion.div
                                    className="xp-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <div className="xp-text">{xpForNext - profile.xp} XP to Level {profile.level + 1}</div>
                        </div>
                    </div>
                </div>

                <div className="stat-card small-stat">
                    <MapPin className="stat-icon visited" />
                    <div className="stat-value">{profile.visited.length}</div>
                    <div className="stat-label">Visited</div>
                </div>

                <div className="stat-card small-stat">
                    <Globe className="stat-icon guessed" />
                    <div className="stat-value">{profile.guessed.length}</div>
                    <div className="stat-label">Solved</div>
                </div>
            </motion.div>

            {/* Solved Countries - Available to all users */}
            <motion.div
                className="map-launch-section solved-section"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="launch-content">
                    <Globe size={64} className="globe-icon solved" />
                    <h2>Solved Countries 🎯</h2>
                    <p>View all {profile.guessed.length} countries you've successfully identified in the game on an interactive 3D world map.</p>
                    <motion.button
                        className="btn btn-primary btn-launch solved-btn"
                        onClick={onViewSolvedMap}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Globe size={20} />
                        View Solved Countries Map
                    </motion.button>
                </div>
            </motion.div>

            {/* Ashwin Mode - Premium feature for visited countries */}
            <AnimatePresence mode="wait">
                {profile.ashwinMode ? (
                    <motion.div
                        key="ashwin-launch"
                        className="map-launch-section ashwin-section"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="launch-content">
                            <MapPin size={64} className="globe-icon visited" />
                            <h2>Ashwin Mode Unlocked! 🚀</h2>
                            <p>Track your real-life travel journey on an immersive 3D world map showing all the countries you've actually visited.</p>
                            <motion.button
                                className="btn btn-primary btn-launch visited-btn"
                                onClick={onUnlockAshwin}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MapPin size={20} />
                                Launch Ashwin Mode
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="locked-map"
                        className="locked-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Lock size={48} className="lock-icon" />
                        <h3>Ashwin Mode Locked</h3>
                        <p>Perform the secret sequence on the Atlasly logo to unlock Ashwin Mode and track your real-life travel journey.</p>
                        <motion.button
                            className="btn btn-primary"
                            style={{ marginTop: '1.5rem' }}
                            onClick={onUnlockAshwin}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Unlock Ashwin Mode (Testing)
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .profile-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: var(--space-md);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-lg);
                    height: 100%;
                }

                .profile-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--glass-bg);
                    padding: var(--space-lg);
                    border-radius: var(--radius-xl);
                    border: 1px solid var(--glass-border);
                    box-shadow: var(--shadow-lg);
                }
                
                .ashwin-border {
                    border-color: var(--accent);
                    background: linear-gradient(to right, var(--glass-bg), rgba(37, 99, 235, 0.05));
                }

                .profile-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                }

                .avatar-circle {
                    width: 80px;
                    height: 80px;
                    background: var(--gradient-accent);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
                }

                .name-section h1 {
                    font-size: 1.75rem;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .profile-actions {
                    display: flex;
                    gap: var(--space-sm);
                    align-items: center;
                }
                
                .btn-admin {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }
                
                .btn-admin:hover {
                    background: linear-gradient(135deg, #d97706, #b45309);
                    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
                }
                
                .ashwin-tag {
                    font-size: 0.75rem;
                    background: var(--accent);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .display-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .edit-icon { color: var(--text-muted); opacity: 0; transition: opacity 0.2s; }
                .display-group:hover .edit-icon { opacity: 1; }

                .edit-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .name-input {
                    background: var(--bg-secondary);
                    border: 1px solid var(--accent);
                    color: var(--text-primary);
                    font-size: 1.5rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    width: 250px;
                }

                .level-badge {
                    margin-top: 0.5rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: var(--space-md);
                }

                .stat-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-lg);
                    display: flex;
                    gap: var(--space-md);
                    align-items: center;
                    box-shadow: var(--shadow);
                }

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    flex-shrink: 0;
                }
                .stat-icon.xp { color: #eab308; }
                .stat-icon.visited { color: #3b82f6; }
                .stat-icon.guessed { color: #10b981; }

                .stat-main { flex: 1; }
                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    line-height: 1;
                }
                .stat-unit { font-size: 0.875rem; color: var(--text-muted); }

                .xp-progress-container { margin-top: 0.75rem; }
                .xp-bar {
                    height: 8px;
                    background: var(--bg-secondary);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .xp-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #f59e0b, #fbbf24);
                }
                .xp-text {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 4px;
                    text-align: right;
                }

                .small-stat {
                    flex-direction: column;
                    text-align: center;
                    justify-content: center;
                }
                .stat-label { font-weight: 600; color: var(--text-secondary); }

                .map-launch-section {
                    flex: 1;
                    min-height: 300px;
                    border-radius: var(--radius-xl);
                    border: 2px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                .solved-section {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05));
                    border-color: #10b981;
                    box-shadow: 0 0 40px rgba(16, 185, 129, 0.2);
                }

                .solved-section::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
                    animation: pulse 4s ease-in-out infinite;
                }

                .ashwin-section {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
                    border-color: var(--accent);
                    box-shadow: 0 0 40px rgba(37, 99, 235, 0.2);
                }

                .ashwin-section::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%);
                    animation: pulse 4s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }

                .launch-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                    padding: 2.5rem;
                    max-width: 500px;
                }

                .globe-icon {
                    margin-bottom: 1.5rem;
                    animation: float 3s ease-in-out infinite;
                }

                .globe-icon.solved {
                    color: #10b981;
                    filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5));
                }

                .globe-icon.visited {
                    color: var(--accent);
                    filter: drop-shadow(0 0 20px rgba(37, 99, 235, 0.5));
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .launch-content h2 {
                    margin: 0 0 1rem 0;
                    font-size: 1.75rem;
                    color: var(--text-primary);
                }

                .solved-section h2 {
                    background: linear-gradient(135deg, #34d399, #10b981, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .ashwin-section h2 {
                    background: var(--gradient-accent);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .launch-content p {
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .btn-launch {
                    font-size: 1.125rem;
                    padding: 1rem 2rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .solved-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
                }

                .solved-btn:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                }

                .visited-btn {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
                }

                .visited-btn:hover {
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                }
                

                .locked-section {
                    flex: 1;
                    min-height: 400px;
                    background: var(--glass-bg);
                    border-radius: var(--radius-xl);
                    border: 1px dashed var(--border);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 2rem;
                }
                .lock-icon { color: var(--text-muted); margin-bottom: 1rem; }
                .locked-section h3 { margin: 0; font-size: 1.5rem; }
                .locked-section p { color: var(--text-muted); max-width: 300px; margin-top: 0.5rem; }

                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr; }
                    .profile-header { flex-direction: column; gap: 1rem; text-align: center; }
                    .profile-info { flex-direction: column; }
                    .map-header { flex-direction: column; gap: 1rem; text-align: center; }
                }
            `}</style>
        </div>
    );
}

export default Profile;
