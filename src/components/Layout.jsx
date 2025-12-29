import React, { useEffect, useState, useRef } from 'react';
import { Globe, Sun, Moon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children, screen, onHome, onProfile, userLevel, onUnlockAshwin }) => {
    const clickCount = useRef(0);
    const [lastClick, setLastClick] = useState(0);
    const [theme, setTheme] = useState(() => localStorage.getItem('atlaslyTheme') || 'light');

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('atlaslyTheme', theme);
    }, [theme]);

    useEffect(() => {
        let typed = "";
        const handleKeyDown = (e) => {
            typed += e.key.toLowerCase();
            if (typed.endsWith("ashwin")) {
                onUnlockAshwin();
                alert("🚀 Ashwin Mode Unlocked!");
                typed = "";
            }
            if (typed.length > 20) typed = typed.slice(-10);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onUnlockAshwin]);

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'ocean', icon: '🌊', label: 'Ocean' }
    ];

    const isFullscreenMap = screen === 'ashwinMode' || screen === 'solvedMap';

    return (
        <div className={`app-root ${screen === 'game' ? 'screen-game' : ''} ${isFullscreenMap ? 'fullscreen-map' : ''}`}>
            {!isFullscreenMap && (
                <motion.nav
                    className="top-nav"
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    <motion.div
                        className="nav-brand"
                        onClick={() => {
                            const now = Date.now();
                            // More lenient: 3 clicks, 2 second gap
                            if (now - lastClick < 2000) {
                                clickCount.current += 1;
                            } else {
                                clickCount.current = 1;
                            }
                            setLastClick(now);
                            if (clickCount.current >= 3) {
                                onUnlockAshwin();
                                clickCount.current = 0;
                                alert("🚀 Ashwin Mode Unlocked!");
                            }
                            onHome();
                        }}
                        style={{ cursor: 'pointer' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            className="brand-icon"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                            <Globe size={24} />
                        </motion.div>
                        <span className="brand-name">Atlasly</span>
                    </motion.div>

                    <div className="nav-actions">
                        <motion.button
                            className="profile-btn"
                            onClick={onProfile}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <User size={18} />
                            <span className="profile-text">Profile</span>
                            {userLevel && <span className="profile-level">Lv {userLevel}</span>}
                        </motion.button>
                        <div className="theme-selector">
                            {themes.map(({ id, icon: Icon, label }) => (
                                <motion.button
                                    key={id}
                                    className={`icon-btn ${theme === id ? 'active' : ''}`}
                                    onClick={() => setTheme(id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={label}
                                >
                                    {typeof Icon === 'string' ? (
                                        <span style={{ fontSize: '14px' }}>{Icon}</span>
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.nav>
            )}

            <AnimatePresence mode="wait">
                <motion.main
                    key={screen}
                    className="main-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.main>
            </AnimatePresence>

            <style>{`
                .top-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-md) var(--space-lg);
                    border-bottom: 1px solid var(--border);
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    box-shadow: var(--shadow);
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .brand-icon {
                    width: clamp(32px, 8vw, 44px);
                    height: clamp(32px, 8vw, 44px);
                    background: var(--gradient-accent);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .brand-name {
                    font-size: var(--font-lg);
                    font-weight: 800;
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .theme-selector {
                    display: flex;
                    gap: var(--space-xs);
                    background: var(--bg-secondary);
                    padding: var(--space-xs);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                }

                .icon-btn {
                    padding: 0.5rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-speed) var(--transition-smooth);
                    min-width: 36px;
                    min-height: 36px;
                }

                .icon-btn:hover {
                    color: var(--text-primary);
                    background: var(--bg-primary);
                }

                .icon-btn.active {
                    color: white;
                    background: var(--gradient-accent);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
                }

                .main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: var(--space-lg) var(--space-md);
                    min-height: calc(100vh - 80px);
                }

                    .profile-btn {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: var(--bg-secondary);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-full);
                        font-weight: 600;
                        font-size: var(--font-sm);
                        color: var(--text-primary);
                        cursor: pointer;
                        margin-right: var(--space-sm);
                    }
                    .profile-btn:hover {
                        border-color: var(--accent);
                        background: var(--bg-primary);
                    }
                    .profile-level {
                        background: var(--accent);
                        color: white;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-size: 0.75rem;
                    }
                    @media (max-width: 640px) {
                        .profile-text { display: none; }
                        .top-nav {
                            padding: var(--space-sm) var(--space-md);
                        }
                        .brand-name {
                            font-size: var(--font-base);
                        }
                    }

                    .fullscreen-map .main-content {
                        max-width: 100%;
                        padding: 0;
                        min-height: 100vh;
                    }
            `}</style>
        </div>
    );
};

export default Layout;
