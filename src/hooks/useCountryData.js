import { useState, useEffect } from 'react';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';
import { normalizeName } from '../utils/geography';
import countriesData from '../data/countries-data.json';
import worldTopology from '../data/world-topology.json';

// Logic extracted from legacy app.js
function buildCountryIndexFromTopo(topo) {
    const features = topojson.feature(topo, topo.objects.countries).features;
    const projection = d3.geoEqualEarth();
    const path = d3.geoPath(projection);
    const out = [];

    for (const f of features) {
        const name = (f.properties && f.properties.name) ? f.properties.name : null;
        if (!name) continue;

        const c = d3.geoCentroid(f);
        const a = Math.abs(path.area(f));
        out.push({ name, norm: normalizeName(name), lon: c[0], lat: c[1], area: a });
    }

    // Difficulty calculation
    const areas = out.map(o => o.area).filter(x => Number.isFinite(x)).sort((a, b) => a - b);
    const q = (p) => areas[Math.floor((areas.length - 1) * p)];
    const q20 = q(0.2), q40 = q(0.4), q60 = q(0.6), q80 = q(0.8);

    for (const o of out) {
        let d = 3;
        if (o.area >= q80) d = 1;
        else if (o.area >= q60) d = 2;
        else if (o.area >= q40) d = 3;
        else if (o.area >= q20) d = 4;
        else d = 5;
        o.difficulty = d;
    }
    return out;
}

function buildTriviaIndex(restCountries) {
    const byNorm = new Map();
    const byCca3 = new Map();

    for (const c of restCountries) {
        if (c && c.cca3) byCca3.set(c.cca3, c);
        const names = [];
        try {
            if (c.name?.common) names.push(c.name.common);
            if (c.name?.official) names.push(c.name.official);
            if (Array.isArray(c.altSpellings)) names.push(...c.altSpellings);
        } catch (_) { }

        for (const n of names) {
            const norm = normalizeName(n);
            if (!norm) continue;
            if (!byNorm.has(norm)) byNorm.set(norm, c);
        }
    }
    return { byNorm, byCca3 };
}

function bestTriviaMatch(triviaByNorm, topoName) {
    const norm = normalizeName(topoName);
    if (triviaByNorm.has(norm)) return triviaByNorm.get(norm);

    // Legacy patches
    const patches = {
        "united states of america": "united states",
        "russian federation": "russia",
        "bolivia plurinational state of": "bolivia",
        "venezuela bolivarian republic of": "venezuela",
        "iran islamic republic of": "iran",
        "tanzania united republic of": "tanzania",
        "korea republic of": "south korea",
        "korea democratic peoples republic of": "north korea",
        "syrian arab republic": "syria",
        "lao peoples democratic republic": "laos",
        "moldova republic of": "moldova",
        "brunei darussalam": "brunei",
        "cabo verde": "cape verde",
        "timor leste": "east timor"
    };

    if (patches[norm]) {
        const patched = patches[norm];
        const pnorm = normalizeName(patched);
        if (triviaByNorm.has(pnorm)) return triviaByNorm.get(pnorm);
    }

    for (const [k, v] of triviaByNorm.entries()) {
        if (k.includes(norm) || norm.includes(k)) return v;
    }
    return null;
}

export function useCountryData() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState({ topo: null, playable: [], triviaIndex: null });

    useEffect(() => {
        const load = async () => {
            try {
                // Use imported static data instead of fetching from APIs
                const topo = worldTopology;
                const rc = countriesData;

                // Process data (same logic as before)
                const countryIndex = buildCountryIndexFromTopo(topo);
                const triviaIndex = buildTriviaIndex(rc);

                const playable = countryIndex.map(t => {
                    const trivia = bestTriviaMatch(triviaIndex.byNorm, t.name);
                    return { ...t, trivia };
                }).filter(x => x && x.name && x.lat != null && x.lon != null);

                setData({ topo, playable, triviaIndex });
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { ...data, isLoading, error };
}
