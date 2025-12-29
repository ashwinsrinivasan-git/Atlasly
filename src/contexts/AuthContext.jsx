import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@atlasly.com';

    // Create or update user profile in Firestore
    const createUserProfile = async (user, additionalData = {}) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            const { email, displayName, photoURL } = user;
            const createdAt = serverTimestamp();

            try {
                await setDoc(userRef, {
                    email,
                    displayName: displayName || additionalData.displayName || 'Explorer',
                    photoURL: photoURL || null,
                    createdAt,
                    lastLogin: createdAt,
                    role: email === adminEmail ? 'admin' : 'user',
                    // Game profile
                    level: 1,
                    xp: 0,
                    visited: [],
                    guessed: [],
                    ashwinMode: false,
                    ...additionalData
                });
            } catch (error) {
                console.error('Error creating user profile:', error);
            }
        } else {
            // Update last login
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
        }

        // Fetch and set profile
        const updatedSnapshot = await getDoc(userRef);
        const profileData = updatedSnapshot.data();
        setUserProfile(profileData);
        setIsAdmin(profileData?.role === 'admin');
    };

    // Sign up with email and password
    const signup = async (email, password, displayName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
        await createUserProfile(result.user, { displayName });
        return result;
    };

    // Sign in with email and password
    const login = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    };

    // Sign in with Google
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserProfile(result.user);
        return result;
    };

    // Sign in with GitHub
    const loginWithGithub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        await createUserProfile(result.user);
        return result;
    };

    // Sign out
    const logout = async () => {
        setUserProfile(null);
        setIsAdmin(false);
        return await signOut(auth);
    };

    // Update user profile data
    const updateUserProfile = async (updates) => {
        if (!currentUser) return;

        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updates, { merge: true });

        // Update local state
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await createUserProfile(user);
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signup,
        login,
        loginWithGoogle,
        loginWithGithub,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
