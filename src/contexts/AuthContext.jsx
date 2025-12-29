import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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

    // Create or update user profile in Firestore (optimized for speed)
    const createUserProfile = async (user, additionalData = {}) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);

        try {
            // Single read to get current profile
            const snapshot = await getDoc(userRef);
            const { email, displayName, photoURL } = user;

            if (!snapshot.exists()) {
                // New user - create profile
                const createdAt = serverTimestamp();
                console.log('[AuthContext] Creating new user profile for:', email);

                const newProfile = {
                    email,
                    displayName: displayName || additionalData.displayName || 'Explorer',
                    photoURL: photoURL || null,
                    createdAt,
                    lastLogin: createdAt,
                    role: email === adminEmail ? 'admin' : 'user',
                    level: 1,
                    xp: 0,
                    visited: [],
                    guessed: [],
                    ashwinMode: false,
                    ...additionalData
                };

                await setDoc(userRef, newProfile);
                setUserProfile(newProfile);
                setIsAdmin(newProfile.role === 'admin');
                console.log('[AuthContext] New profile created');
            } else {
                // Existing user - use cached data, update lastLogin in background
                let profileData = snapshot.data();

                // Enforce admin role based on email
                const shouldBeAdmin = email === adminEmail;
                const needsRoleUpdate = shouldBeAdmin && profileData.role !== 'admin';

                if (needsRoleUpdate) {
                    console.warn('[AuthContext] Correcting admin role');
                    profileData.role = 'admin';
                }

                // Set profile immediately (fast!)
                setUserProfile(profileData);
                setIsAdmin(profileData.role === 'admin');
                console.log('[AuthContext] Profile loaded:', { email: profileData.email, role: profileData.role, level: profileData.level });

                // Update lastLogin and role in background (don't wait)
                const updates = { lastLogin: serverTimestamp() };
                if (needsRoleUpdate) updates.role = 'admin';
                setDoc(userRef, updates, { merge: true }).catch(e =>
                    console.error('[AuthContext] Background update failed:', e)
                );
            }

        } catch (error) {
            console.error('[AuthContext] Error in createUserProfile:', error);

            // Fallback profile
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

    // Sign in with Google (using popup with enhanced error handling)
    const loginWithGoogle = async () => {
        try {
            // Add a small delay to ensure popup isn't blocked
            await new Promise(resolve => setTimeout(resolve, 100));
            const result = await signInWithPopup(auth, googleProvider);
            console.log('[AuthContext] Popup sign-in successful:', result.user.email);
            await createUserProfile(result.user);
            return result;
        } catch (error) {
            console.error('[AuthContext] Google sign-in error:', error);
            // If popup was blocked, show helpful message
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site and try again.');
            }
            throw error;
        }
    };

    // Sign in with GitHub (using popup)
    const loginWithGithub = async () => {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            await createUserProfile(result.user);
            return result;
        } catch (error) {
            console.error('[AuthContext] GitHub sign-in error:', error);
            throw error;
        }
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

        // Safety timeout - minimal for fast load
        const timeoutId = setTimeout(() => {
            console.warn('[AuthContext] Auth initialization timeout - forcing render');
            setLoading(false);
        }, 1000); // 1 second timeout for fastest load

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
