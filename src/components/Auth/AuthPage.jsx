import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    const messages = {
      'auth/popup-closed-by-user': 'Sign-in popup was closed',
      'auth/cancelled-popup-request': 'Sign-in was cancelled',
      'auth/popup-blocked': 'Please allow popups and try again',
      'auth/network-request-failed': 'Network error. Please check your connection'
    };
    return messages[code] || 'An error occurred. Please try again.';
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            🌍
          </motion.div>
          <h1>Welcome to Atlasly</h1>
          <p>Learn geography while exploring the world</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-content">
          <motion.button
            className="btn btn-primary btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Chrome size={24} />
            <span>Continue with Google</span>
          </motion.button>

          <motion.p
            className="privacy-notice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            By continuing, you agree to our Terms and conditions.
          </motion.p>
        </div>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
          background: linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 100%
          );
        }

        .auth-container {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          max-width: 440px;
          width: 100%;
          box-shadow: var(--shadow-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        .auth-logo {
          font-size: 4rem;
          margin-bottom: var(--space-md);
          display: inline-block;
        }

        .auth-header h1 {
          font-size: 1.875rem;
          margin: 0 0 var(--space-xs) 0;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgb(239, 68, 68);
          color: rgb(239, 68, 68);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-md);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.875rem;
        }

        .auth-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          align-items: center;
        }

        .btn-google {
          width: 100%;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
          font-size: 1.125rem;
          font-weight: 700;
          background: white;
          color: #333;
          border: 1px solid #ddd;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .btn-google:hover {
          background: #f8f8f8;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1);
        }

        .privacy-notice {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-align: center;
          max-width: 280px;
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .auth-container {
            padding: var(--space-lg);
          }

          .social-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
