import { useState, useEffect } from 'react';

const XP_PER_LEVEL = 500;

export function useUserProfile() {
    const [profile, setProfile] = useState(() => {
        try {
            const saved = localStorage.getItem('atlaslyProfile');
            return saved ? JSON.parse(saved) : {
                name: 'Explorer',
                level: 1,
                xp: 0,
                visited: [], // list of country names
                guessed: [], // list of country names correctly guessed
                ashwinMode: false
            };
        } catch {
            return {
                name: 'Explorer',
                level: 1,
                xp: 0,
                visited: [],
                guessed: [],
                ashwinMode: false
            };
        }
    });

    useEffect(() => {
        localStorage.setItem('atlaslyProfile', JSON.stringify(profile));
    }, [profile]);

    const addXp = (amount) => {
        setProfile(p => {
            const newXp = p.xp + amount;
            const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
            return { ...p, xp: newXp, level: newLevel };
        });
    };

    const toggleVisited = (countryName) => {
        setProfile(p => {
            const isVisited = p.visited.includes(countryName);
            const newList = isVisited
                ? p.visited.filter(c => c !== countryName)
                : [...p.visited, countryName];
            return { ...p, visited: newList };
        });
    };

    const markGuessed = (countryName) => {
        setProfile(p => {
            if (p.guessed.includes(countryName)) return p;
            return { ...p, guessed: [...p.guessed, countryName] };
        });
    };

    const toggleAshwinMode = () => {
        setProfile(p => ({ ...p, ashwinMode: !p.ashwinMode }));
    };

    const updateName = (name) => setProfile(p => ({ ...p, name }));

    return {
        profile,
        addXp,
        markGuessed,
        toggleAshwinMode,
        toggleVisited,
        updateName
    };
}
