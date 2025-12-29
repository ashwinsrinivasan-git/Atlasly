import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Firebase configuration
// These values are safe to expose in client-side code
// Security is handled by Firebase Security Rules, not by hiding these values
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBSE_xD7d2SkHuMvkZGq4RkBRdRaUNINr8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "atlasly-fee65.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "atlasly-fee65",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "atlasly-fee65.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "516099308670",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:516099308670:web:1d0d7bf11c14729d43a0fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with memory-only cache (no offline persistence)
export const db = initializeFirestore(app, {
    localCache: {
        kind: 'memory'
    }
});

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
