import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            gap: '1.5rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-primary)'
        }}>
            <div style={{
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent)" />
                <p style={{ fontSize: 'var(--font-lg)', fontWeight: 500 }}>{text}</p>
            </div>
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Loader;
