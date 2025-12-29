import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const XP_PER_LEVEL = 500;

export function useUserProfile() {
    const { userProfile: firebaseProfile, updateUserProfile: updateFirebase, currentUser } = useAuth();

    // Merge Firebase profile with local profile, Firebase takes precedence if user is logged in
    const [profile, setProfile] = useState(() => {
        if (firebaseProfile) return firebaseProfile;

        try {
            const saved = localStorage.getItem('atlaslyProfile');
            return saved ? JSON.parse(saved) : {
                name: 'Explorer',
                displayName: 'Explorer',
                level: 1,
                xp: 0,
                visited: [],
                guessed: [],
                ashwinMode: false
            };
        } catch {
            return {
                name: 'Explorer',
                displayName: 'Explorer',
                level: 1,
                xp: 0,
                visited: [],
                guessed: [],
                ashwinMode: false
            };
        }
    });

    // Sync with Firebase when firebaseProfile changes
    useEffect(() => {
        if (firebaseProfile) {
            setProfile(firebaseProfile);
        }
    }, [firebaseProfile]);

    // Persist to localStorage for guests, Firebase for authenticated users
    useEffect(() => {
        if (!currentUser) {
            localStorage.setItem('atlaslyProfile', JSON.stringify(profile));
        }
    }, [profile, currentUser]);

    const updateBoth = async (updates) => {
        setProfile(p => ({ ...p, ...updates }));
        if (currentUser) {
            await updateFirebase(updates);
        }
    };

    const addXp = async (amount) => {
        const newXp = profile.xp + amount;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        await updateBoth({ xp: newXp, level: newLevel });
    };

    const toggleVisited = async (countryName) => {
        const isVisited = profile.visited.includes(countryName);
        const newList = isVisited
            ? profile.visited.filter(c => c !== countryName)
            : [...profile.visited, countryName];
        await updateBoth({ visited: newList });
    };

    const markGuessed = async (countryName) => {
        if (profile.guessed.includes(countryName)) return;
        await updateBoth({ guessed: [...profile.guessed, countryName] });
    };

    const toggleAshwinMode = async () => {
        await updateBoth({ ashwinMode: !profile.ashwinMode });
    };

    const updateName = async (name) => {
        await updateBoth({ name, displayName: name });
    };

    return {
        profile: {
            ...profile,
            name: profile.displayName || profile.name || 'Explorer'
        },
        addXp,
        markGuessed,
        toggleAshwinMode,
        toggleVisited,
        updateName
    };
}
