import React, { useEffect, useState } from 'react';
import { Globe, Sun, Moon, HelpCircle } from 'lucide-react';

const Layout = ({ children, screen, onHome }) => {
    const [theme, setTheme] = useState(() => localStorage.getItem('atlaslyTheme') || 'light');

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('atlaslyTheme', theme);
    }, [theme]);

    return (
        <div className={`app-root ${screen === 'game' ? 'screen-game' : ''}`}>
            <nav className="top-nav">
                <div className="nav-brand" onClick={onHome} style={{ cursor: 'pointer' }}>
                    <div className="brand-icon">
                        <Globe size={24} />
                    </div>
                    <span className="brand-name">Atlasly</span>
                </div>
                <div className="nav-actions">
                    <div className="theme-selector">
                        <button className={`icon-btn ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}>
                            <Sun size={18} />
                        </button>
                        <button className={`icon-btn ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}>
                            <Moon size={18} />
                        </button>
                        <button className={`icon-btn ${theme === 'ocean' ? 'active' : ''}`} onClick={() => setTheme('ocean')}>
                            <span style={{ fontSize: '14px' }}>🌊</span>
                        </button>
                    </div>
                </div>
            </nav>
            <main className="main-content">
                {children}
            </main>

            <style>{`
                .top-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border);
                    background: var(--bg-primary);
                }
                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .brand-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--accent), var(--accent-hover));
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .brand-name {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                .theme-selector {
                    display: flex;
                    gap: 0.25rem;
                    background: var(--bg-secondary);
                    padding: 0.25rem;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }
                .icon-btn {
                    padding: 0.4rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .icon-btn:hover {
                    color: var(--text-primary);
                    background: var(--bg-primary);
                }
                .icon-btn.active {
                    color: var(--accent);
                    background: var(--bg-primary);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .main-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 1rem;
                    min-height: calc(100vh - 80px);
                }
            `}</style>
        </div>
    );
};

export default Layout;
