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

        try {
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                const { email, displayName, photoURL } = user;
                const createdAt = serverTimestamp();

                console.log('[AuthContext] Creating new user profile for:', email);

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
            } else {
                // Update last login
                console.log('[AuthContext] Updating last login for:', user.email);
                await setDoc(userRef, {
                    lastLogin: serverTimestamp()
                }, { merge: true });
            }

            // Fetch and set profile
            const updatedSnapshot = await getDoc(userRef);
            const profileData = updatedSnapshot.data();

            if (profileData) {
                // CRITICAL: Always enforce admin role based on email, even if Firestore has wrong value
                if (user.email === adminEmail && profileData.role !== 'admin') {
                    console.warn('[AuthContext] Correcting admin role in Firestore');
                    await setDoc(userRef, { role: 'admin' }, { merge: true });
                    profileData.role = 'admin';
                }

                console.log('[AuthContext] Profile loaded:', { email: profileData.email, role: profileData.role, level: profileData.level });
                setUserProfile(profileData);
                setIsAdmin(profileData.role === 'admin');
            } else {
                throw new Error('Profile data is empty after fetch');
            }

        } catch (error) {
            console.error('[AuthContext] Error in createUserProfile:', error);

            // Fallback: Create a minimal profile from user auth data
            const { email, displayName, photoURL } = user;
            const fallbackProfile = {
                email,
                displayName: displayName || 'Explorer',
                photoURL: photoURL || null,
                role: email === adminEmail ? 'admin' : 'user',
                level: 1,
                xp: 0,
                visited: [],
                guessed: [],
                ashwinMode: false
            };

            console.warn('[AuthContext] Using fallback profile:', fallbackProfile);
            setUserProfile(fallbackProfile);
            setIsAdmin(fallbackProfile.role === 'admin');

            // Try again quickly (1s for faster recovery)
            setTimeout(async () => {
                console.log('[AuthContext] Retrying profile fetch...');
                try {
                    const retrySnapshot = await getDoc(userRef);
                    if (retrySnapshot.exists()) {
                        const retryData = retrySnapshot.data();

                        // CRITICAL: Always enforce admin role based on email
                        if (user.email === adminEmail && retryData.role !== 'admin') {
                            console.warn('[AuthContext] Fixing admin role mismatch in Firestore');
                            await setDoc(userRef, { role: 'admin' }, { merge: true });
                            retryData.role = 'admin';
                        }

                        console.log('[AuthContext] Retry successful:', { email: retryData.email, role: retryData.role });
                        setUserProfile(retryData);
                        setIsAdmin(retryData.role === 'admin');
                    }
                } catch (retryError) {
                    console.error('[AuthContext] Retry failed:', retryError);
                }
            }, 1000); // Reduced from 3s to 1s
        }
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
        console.log('[AuthContext] Initializing auth listener...');

        // Safety timeout - reduced for faster page load
        const timeoutId = setTimeout(() => {
            console.warn('[AuthContext] Auth initialization timeout - forcing render');
            setLoading(false);
        }, 2000); // 2 second timeout (reduced from 5s)

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('[AuthContext] Auth state changed:', user ? `User: ${user.email}` : 'No user');
            clearTimeout(timeoutId); // Clear timeout if auth resolves

            setCurrentUser(user);
            if (user) {
                try {
                    await createUserProfile(user);
                    console.log('[AuthContext] User profile loaded successfully');
                } catch (error) {
                    console.error('[AuthContext] Error loading user profile:', error);
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
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
