import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WorldGlobe from './Map/WorldGlobe';
import { Globe, MapPin, User, Star, Edit2, Check, Lock, Shield } from 'lucide-react';

const Profile = ({ profile, onBack, onToggleVisited, topo, onUpdateName, onUnlockAshwin, onViewAshwinMap, onViewSolvedMap, isAdmin, onViewAdmin }) => {
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
            {/* Compact Header */}
            <motion.div
                className={`profile-header ${profile.ashwinMode ? 'ashwin-border' : ''}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="avatar-mini">
                    <User size={24} />
                </div>
                <div className="name-compact">
                    {isEditing ? (
                        <div className="edit-group-mini">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                autoFocus
                                className="name-input-mini"
                            />
                            <button className="icon-btn-micro" onClick={handleSaveName}><Check size={14} /></button>
                        </div>
                    ) : (
                        <div className="display-group-mini" onClick={() => setIsEditing(true)}>
                            <h2>{profile.name}</h2>
                            <Edit2 size={12} className="edit-icon" />
                        </div>
                    )}
                </div>
                <div className="level-pill">Lv {profile.level}</div>
                <button className="btn-close-mini" onClick={onBack}>✕</button>
            </motion.div>

            {/* Compact XP Bar */}
            <div className="xp-container-mini">
                <div className="xp-bar-mini">
                    <motion.div
                        className="xp-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <div className="xp-label-mini">{profile.xp} / {xpForNext} XP</div>
            </div>

            {/* Compact Stats Grid - Now clickable to open maps */}
            <div className="stats-row-mini">
                <motion.div
                    className="mini-stat-card clickable"
                    onClick={profile.ashwinMode ? onViewAshwinMap : onUnlockAshwin}
                    whileTap={{ scale: 0.95 }}
                >
                    <MapPin size={16} className="text-blue" />
                    <span className="mini-stat-val">{profile.visited.length}</span>
                    <span className="mini-stat-lab">Visited</span>
                    {!profile.ashwinMode && <Lock size={10} className="lock-badge" />}
                </motion.div>
                <motion.div
                    className="mini-stat-card clickable"
                    onClick={onViewSolvedMap}
                    whileTap={{ scale: 0.95 }}
                >
                    <Globe size={16} className="text-green" />
                    <span className="mini-stat-val">{profile.guessed.length}</span>
                    <span className="mini-stat-lab">Solved</span>
                </motion.div>
            </div>

            {/* Admin Panel - Ultra Compact */}
            {isAdmin && (
                <motion.div
                    className="admin-row"
                    onClick={onViewAdmin}
                    whileTap={{ scale: 0.97 }}
                >
                    <Shield size={14} className="text-amber" />
                    <span>Admin</span>
                    <span className="admin-arrow">→</span>
                </motion.div>
            )}

            <style>{`
                .profile-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xs);
                    height: 100%;
                    overflow: hidden;
                    padding: var(--space-xs);
                }

                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-xs);
                    background: var(--glass-bg);
                    padding: 6px 10px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--glass-border);
                }

                .avatar-mini {
                    width: 32px;
                    height: 32px;
                    background: var(--gradient-accent);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .avatar-mini svg { width: 16px; height: 16px; }

                .name-compact { flex: 1; }
                .name-compact h2 { font-size: 1rem; margin: 0; }
                
                .level-pill {
                    background: var(--accent-light);
                    color: var(--accent);
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .btn-close-mini {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 1.25rem;
                    padding: 4px;
                }

                .xp-container-mini {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .xp-bar-mini {
                    height: 4px;
                    background: var(--bg-secondary);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .xp-label-mini {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                    text-align: right;
                    font-weight: 600;
                }

                .stats-row-mini {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
                    gap: 6px;
                }

                .mini-stat-card {
                    background: var(--bg-tertiary);
                    padding: 8px 6px;
                    border-radius: var(--radius-sm);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    border: 1px solid var(--border);
                    position: relative;
                }
                .mini-stat-card svg { width: 14px; height: 14px; }

                .mini-stat-card.clickable {
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .mini-stat-card.clickable:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent);
                    background: var(--glass-bg);
                }

                .admin-row {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: rgba(245, 158, 11, 0.08);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #f59e0b;
                    transition: all 0.2s;
                }
                .admin-row:hover {
                    background: rgba(245, 158, 11, 0.15);
                    border-color: #f59e0b;
                }
                .admin-arrow {
                    margin-left: auto;
                    opacity: 0.6;
                }

                .lock-badge {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    color: var(--text-muted);
                    opacity: 0.7;
                }

                .mini-stat-val { font-size: 1rem; font-weight: 800; }
                .mini-stat-lab { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }

                .text-blue { color: #3b82f6; }
                .text-green { color: #10b981; }
                .text-amber { color: #f59e0b; }

                .edit-group-mini { display: flex; align-items: center; gap: 4px; }
                .name-input-mini {
                    background: var(--bg-primary);
                    border: 1px solid var(--accent);
                    color: var(--text-primary);
                    font-size: 1rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    width: 120px;
                }
                .icon-btn-micro { background: var(--accent); color: white; border: none; border-radius: 4px; padding: 4px; display: flex; }
                .display-group-mini { display: flex; align-items: center; gap: 4px; cursor: pointer; }
                .display-group-mini:hover .edit-icon { opacity: 1; }
                .edit-icon { opacity: 0.5; }
            `}</style>
        </div>
    );
}

export default Profile;
