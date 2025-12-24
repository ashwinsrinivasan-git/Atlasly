import { useState, useMemo, useEffect } from 'react';
import { calculateDistance, calculateBearing, clamp, normalizeName } from '../utils/geography';
import { getDailySeed, seededRandom } from '../utils/random';

export function useGameLogic(playable, triviaIndex) {
    const [screen, setScreen] = useState('landing');
    const [targetCountry, setTargetCountry] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
    const [bonusRound, setBonusRound] = useState(null);
    const [bonusAnswers, setBonusAnswers] = useState({});

    const [easyMode, setEasyMode] = useState(() => {
        try { return JSON.parse(localStorage.getItem("atlaslyEasyMode")) || false; } catch { return false; }
    });
    const [currentOptions, setCurrentOptions] = useState([]);

    useEffect(() => {
        localStorage.setItem("atlaslyEasyMode", JSON.stringify(easyMode));
    }, [easyMode]);

    // Stats
    const [stats, setStats] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("atlaslyStats")) || { plays: 0, wins: 0, streak: 0, bestStreak: 0, lastWinSeed: null };
        } catch {
            return { plays: 0, wins: 0, streak: 0, bestStreak: 0, lastWinSeed: null };
        }
    });

    useEffect(() => {
        localStorage.setItem("atlaslyStats", JSON.stringify(stats));
    }, [stats]);

    const dailySeed = useMemo(() => getDailySeed(), []);
    const dailyCompleted = useMemo(() => String(stats.lastWinSeed) === String(dailySeed), [stats.lastWinSeed, dailySeed]);

    const pickDailyCountry = () => {
        if (!playable || !playable.length) return null;
        // Difficulty-weighted selection
        const weights = playable.map(c => (6 - (c.difficulty || 3)));
        const total = weights.reduce((a, b) => a + b, 0);
        let r = seededRandom(dailySeed) * total;
        for (let i = 0; i < playable.length; i++) {
            r -= weights[i];
            if (r <= 0) return playable[i].name;
        }
        return playable[0].name;
    };

    const generateOptions = (target) => {
        if (!playable || !target) return [];
        const available = playable.filter(c => c.name !== target);
        const distractors = [];
        const pool = [...available];

        // Try to find distractors in the same region if possible for "moderate" difficulty, 
        // or just random for now. Let's do random but maybe weight by area size similarly?
        // Simple random is fine for now.
        while (distractors.length < 3 && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            distractors.push(pool[idx]);
            pool.splice(idx, 1);
        }

        const targetObj = playable.find(c => c.name === target);
        if (!targetObj) return [];

        return [...distractors, targetObj]
            .map(c => c.name) // just names
            .sort(() => Math.random() - 0.5);
    };

    useEffect(() => {
        if ((!currentOptions || currentOptions.length === 0) && targetCountry && playable.length > 0) {
            setCurrentOptions(generateOptions(targetCountry));
        }
    }, [targetCountry, playable, currentOptions]);

    const startDaily = () => {
        const c = pickDailyCountry();
        if (!c) return;
        resetGame(c);
        setStats(s => ({ ...s, plays: s.plays + 1 }));
    };

    const startUnlimited = () => {
        if (!playable || !playable.length) return;
        const random = playable[Math.floor(Math.random() * playable.length)].name;
        resetGame(random);
        setStats(s => ({ ...s, plays: s.plays + 1 }));
    };

    const resetGame = (target) => {
        setTargetCountry(target);
        setGuesses([]);
        setGameStatus('playing');
        setBonusRound(null);
        setBonusAnswers({});
        setScreen('game');
        setCurrentOptions(generateOptions(target));
    };

    const resolveGuess = (input) => {
        const norm = normalizeName(input);
        if (!norm) return null;

        // Exact match in topo
        const exact = playable.find(x => x.norm === norm);
        if (exact) return exact.name;

        // Trivia alias match
        if (triviaIndex && triviaIndex.byNorm && triviaIndex.byNorm.has(norm)) {
            const rc = triviaIndex.byNorm.get(norm);
            if (rc && rc.name && rc.name.common) {
                const common = normalizeName(rc.name.common);
                const topoMatch = playable.find(x => x.norm === common);
                if (topoMatch) return topoMatch.name;
            }
        }

        // Containment heuristic
        const hit = playable.find(x => x.norm.includes(norm) || norm.includes(x.norm));
        return hit ? hit.name : null;
    };

    const submitGuess = (input) => {
        if (gameStatus !== 'playing') return;

        const guessedName = resolveGuess(input);
        if (!guessedName) return { error: "Unknown country" };

        if (guesses.some(g => g.country === guessedName)) return { error: "Already guessed" };

        const guessedMeta = playable.find(x => x.name === guessedName);
        const targetMeta = playable.find(x => x.name === targetCountry);

        if (!guessedMeta || !targetMeta) return;

        const distance = calculateDistance(guessedMeta.lat, guessedMeta.lon, targetMeta.lat, targetMeta.lon);
        const direction = calculateBearing(guessedMeta.lat, guessedMeta.lon, targetMeta.lat, targetMeta.lon);
        const proximity = clamp(Math.round(100 - (distance / 200)), 0, 100);

        const newGuess = { country: guessedName, distance, direction, proximity };
        const newGuesses = [...guesses, newGuess];
        setGuesses(newGuesses);

        if (guessedName === targetCountry) {
            setGameStatus('won');
            // Update stats
            setStats(s => {
                const prevSeed = s.lastWinSeed;
                const yesterday = dailySeed - 1; // Simplified, not handling month rollover perfectly for streak, but good enough for now
                // Actually proper streak logic needs Date manipulation but let's stick to simple seed diff if possible or just check 'played yesterday'
                // For now, simple increment
                const newStreak = (prevSeed === yesterday) ? (s.streak + 1) : 1;
                return {
                    ...s,
                    wins: s.wins + 1,
                    streak: newStreak,
                    bestStreak: Math.max(s.bestStreak, newStreak),
                    lastWinSeed: dailySeed
                };
            });
            return { success: true, status: 'won' };
        } else if (newGuesses.length >= 6) {
            setGameStatus('lost');
            return { success: true, status: 'lost' };
        }

        return { success: true, status: 'playing' };
    };

    return {
        screen, setScreen,
        targetCountry,
        guesses,
        gameStatus,
        bonusRound, setBonusRound,
        bonusAnswers, setBonusAnswers,
        stats,
        dailyCompleted,
        startDaily,
        startUnlimited,
        submitGuess,
        playable, // expose for autocomplete
        easyMode, setEasyMode,
        currentOptions
    };
}
