import React from 'react';
import { motion } from 'framer-motion';
import WorldGlobe from './Map/WorldGlobe';
import { Globe, X } from 'lucide-react';

const SolvedCountries = ({ profile, topo, onToggleVisited, onBack }) => {
    return (
        <div className="solved-countries-container">
            {/* Compact Overlay Header */}
            <motion.div
                className="solved-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="header-content">
                    <div className="title-section">
                        <h1>🎯 Your Solved Countries</h1>
                        <span className="stat-badge">
                            <Globe size={16} />
                            {profile.guessed.length} countries solved
                        </span>
                    </div>

                    <button className="close-btn" onClick={onBack} title="Back to Profile">
                        <X size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Fullscreen Map */}
            <div className="map-container-full">
                <WorldGlobe
                    topo={topo}
                    profile={{
                        ...profile,
                        visited: [] // Only show guessed countries
                    }}
                    onToggleVisited={onToggleVisited}
                />
            </div>

            {/* Floating Mobile Badge */}
            <motion.div
                className="mobile-floating-badge"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    boxShadow: [
                        '0 4px 20px rgba(16, 185, 129, 0.4)',
                        '0 4px 30px rgba(16, 185, 129, 0.6)',
                        '0 4px 20px rgba(16, 185, 129, 0.4)'
                    ]
                }}
                transition={{
                    delay: 0.5,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
                whileTap={{ scale: 0.95 }}
            >
                <Globe size={16} />
                <span>{profile.guessed.length} solved</span>
            </motion.div>

            {/* Sidebar with Solved Countries List */}
            <motion.div
                className="countries-sidebar"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="sidebar-header">
                    <h3>Solved Countries</h3>
                    <span className="sidebar-count">{profile.guessed.length}</span>
                </div>
                <div className="countries-list">
                    {profile.guessed.length === 0 ? (
                        <div className="empty-state">
                            <Globe size={32} opacity={0.3} />
                            <p>No countries solved yet</p>
                            <small>Play the game to solve countries and see them here</small>
                        </div>
                    ) : (
                        profile.guessed.sort().map((country, index) => (
                            <motion.div
                                key={country}
                                className="country-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.02 }}
                            >
                                <span className="country-flag">
                                    {country === 'USA' ? '🇺🇸' :
                                        country === 'Canada' ? '🇨🇦' :
                                            country === 'Mexico' ? '🇲🇽' :
                                                country === 'United Kingdom' ? '🇬🇧' :
                                                    country === 'France' ? '🇫🇷' :
                                                        country === 'Germany' ? '🇩🇪' :
                                                            country === 'Italy' ? '🇮🇹' :
                                                                country === 'Spain' ? '🇪🇸' :
                                                                    country === 'Japan' ? '🇯🇵' :
                                                                        country === 'China' ? '🇨🇳' :
                                                                            country === 'India' ? '🇮🇳' :
                                                                                country === 'Australia' ? '🇦🇺' :
                                                                                    country === 'Brazil' ? '🇧🇷' :
                                                                                        country === 'Argentina' ? '🇦🇷' :
                                                                                            country === 'South Africa' ? '🇿🇦' :
                                                                                                '🌍'}
                                </span>
                                <span className="country-name">{country}</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            <style>{`
                .solved-countries-container {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
                    overflow: hidden;
                }

                .solved-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 10;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 0.5rem 1rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1rem;
                }

                .title-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .title-section h1 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 700;
                    color: white;
                }

                .stat-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                    padding: 0.25rem 0.6rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }



                .close-btn {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    color: #ef4444;
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .close-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.5);
                    transform: scale(1.05);
                }

                .map-container-full {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 320px;
                    bottom: 0;
                    width: auto;
                    height: 100%;
                }

                .countries-sidebar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 320px;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border-left: 1px solid rgba(16, 185, 129, 0.3);
                    display: flex;
                    flex-direction: column;
                    z-index: 5;
                }

                .sidebar-header {
                    flex-shrink: 0;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(30, 41, 59, 0.5);
                }

                .sidebar-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: white;
                }

                .sidebar-count {
                    background: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                }

                .countries-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0.5rem;
                }

                .countries-list::-webkit-scrollbar {
                    width: 6px;
                }

                .countries-list::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                }

                .countries-list::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.5);
                    border-radius: 3px;
                }

                .countries-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.7);
                }

                .country-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    margin-bottom: 0.5rem;
                    background: rgba(30, 41, 59, 0.6);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .country-item:hover {
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(16, 185, 129, 0.4);
                    transform: translateX(-4px);
                }

                .country-flag {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .country-name {
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 2rem;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.5);
                }

                .empty-state p {
                    margin: 1rem 0 0.5rem 0;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .empty-state small {
                    font-size: 0.75rem;
                    line-height: 1.4;
                    opacity: 0.7;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .solved-header {
                        padding: 0.5rem 1rem;
                    }

                    .title-section {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .title-section h1 {
                        font-size: 1rem;
                    }

                    .stat-badge {
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                    }

                    .countries-sidebar {
                        display: none;
                    }

                    .map-container-full {
                        right: 0;
                        width: 100%;
                    }

                    .mobile-floating-badge {
                        display: flex;
                    }
                }

                .mobile-floating-badge {
                    display: none;
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(16, 185, 129, 0.95);
                    color: white;
                    padding: 0.6rem 1.25rem;
                    border-radius: 2rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    z-index: 100;
                }
            `}</style>
        </div>
    );
};

export default SolvedCountries;
