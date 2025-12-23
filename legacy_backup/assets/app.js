\
/* Atlasly — All-countries, high-fidelity mode (GitHub Pages friendly).
   - Shapes: world-atlas countries-50m (Natural Earth derived)
   - Trivia: REST Countries v3.1 (cached)
   - Photos/summary: Wikipedia REST page summary (per-target; cached)
   - No Babel / No JSX: React UMD + createElement
*/
(function () {
  const e = React.createElement;
  const { useEffect, useMemo, useRef, useState } = React;

  // ---------- Utilities ----------
  function normalizeName(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2)
      + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
      * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180)
      - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  function getDailySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  }

  function seededRandom(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  function safeJsonParse(s, fallback) { try { return JSON.parse(s); } catch (_) { return fallback; } }

  function toastEmoji(kind) {
    if (kind === "success") return "✅";
    if (kind === "danger") return "⚠️";
    return "💡";
  }

  function formatPopulation(n) {
    if (typeof n !== "number") return "—";
    if (n >= 1e9) return (Math.round(n/1e8)/10) + "B";
    if (n >= 1e6) return (Math.round(n/1e5)/10) + "M";
    if (n >= 1e3) return Math.round(n/1e3) + "K";
    return String(n);
  }

  // ---------- Icons ----------
  function GlobeIcon(props) {
    const size = props && props.size ? props.size : 24;
    return e("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
      e("circle", { cx: "12", cy: "12", r: "10" }),
      e("path", { d: "M2 12h20" }),
      e("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
    );
  }
  function SunIcon(props) {
    const size = props && props.size ? props.size : 18;
    return e("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
      e("circle", { cx: "12", cy: "12", r: "4" }),
      e("path", { d: "M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })
    );
  }
  function MoonIcon(props) {
    const size = props && props.size ? props.size : 18;
    return e("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
      e("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })
    );
  }
  function HelpIcon(props) {
    const size = props && props.size ? props.size : 18;
    return e("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
      e("circle", { cx: "12", cy: "12", r: "10" }),
      e("path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }),
      e("circle", { cx: "12", cy: "17", r: ".5", fill: "currentColor" })
    );
  }
  function NavigationIcon(props) {
    const size = props && props.size ? props.size : 20;
    const rotation = props && typeof props.rotation === "number" ? props.rotation : 0;
    return e("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", style: { transform: "rotate(" + rotation + "deg)" } },
      e("polygon", { points: "12 2 19 21 12 17 5 21 12 2" })
    );
  }

  // ---------- Data fetch + caching ----------
  const CACHE = {
    rcKey: "atlasly_restcountries_v1",
    rcTsKey: "atlasly_restcountries_ts_v1",
    wikiKeyPrefix: "atlasly_wiki_summary_v1:",
    topoKey: "atlasly_topo50m_v1",
    topoTsKey: "atlasly_topo50m_ts_v1"
  };

  async function fetchJson(url) {
    const r = await fetch(url, { cache: "force-cache" });
    if (!r.ok) throw new Error("HTTP " + r.status + " " + url);
    return await r.json();
  }

  async function loadTopo50m(showToast) {
    // Cache TopoJSON locally (saves repeat load on mobile; 50m is ~739KB)
    const now = Date.now();
    const cached = localStorage.getItem(CACHE.topoKey);
    const cachedTs = Number(localStorage.getItem(CACHE.topoTsKey) || 0);
    const ttl = 7 * 24 * 3600 * 1000; // 7 days
    if (cached && (now - cachedTs) < ttl) return safeJsonParse(cached, null);

    const url = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
    const topo = await fetchJson(url);
    try {
      localStorage.setItem(CACHE.topoKey, JSON.stringify(topo));
      localStorage.setItem(CACHE.topoTsKey, String(now));
    } catch (_) {
      // storage may be full; ignore
    }
    return topo;
  }

  async function loadRestCountries(showToast) {
    const now = Date.now();
    const cached = localStorage.getItem(CACHE.rcKey);
    const cachedTs = Number(localStorage.getItem(CACHE.rcTsKey) || 0);
    const ttl = 7 * 24 * 3600 * 1000; // 7 days
    if (cached && (now - cachedTs) < ttl) return safeJsonParse(cached, null);

    // REST Countries v3.1
    const url = "https://restcountries.com/v3.1/all";
    const data = await fetchJson(url);
    try {
      localStorage.setItem(CACHE.rcKey, JSON.stringify(data));
      localStorage.setItem(CACHE.rcTsKey, String(now));
    } catch (_) {}
    return data;
  }

  async function loadWikipediaSummary(title) {
    const key = CACHE.wikiKeyPrefix + normalizeName(title);
    const cached = localStorage.getItem(key);
    if (cached) return safeJsonParse(cached, null);

    // Wikipedia REST page summary
    // Keep requests minimal: only fetch for the current target (and cache).
    const encoded = encodeURIComponent(title.replace(/\s+/g, "_"));
    const url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + encoded;
    const data = await fetchJson(url);
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
    return data;
  }

  // ---------- Map modeling ----------
  function buildCountryIndexFromTopo(topo) {
    const features = topojson.feature(topo, topo.objects.countries).features;

    // Compute centroid + a simple difficulty score from projected area at global scale.
    // (Harder: smaller area and/or long thin shapes)
    const projection = d3.geoEqualEarth(); // stable for global area ranking
    const path = d3.geoPath(projection);
    const out = [];
    for (const f of features) {
      const name = (f.properties && f.properties.name) ? f.properties.name : null;
      if (!name) continue;

      const c = d3.geoCentroid(f); // [lon, lat]
      const a = Math.abs(path.area(f)); // projected area
      out.push({ name, norm: normalizeName(name), lon: c[0], lat: c[1], area: a });
    }

    // normalize difficulty 1..5 (1 easy big; 5 hard small)
    const areas = out.map(o => o.area).filter(x => Number.isFinite(x)).sort((a,b)=>a-b);
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
    // Build a normalized lookup for multiple name variants → country record
    const byNorm = new Map();
    const byCca3 = new Map();

    for (const c of restCountries) {
      if (c && c.cca3) byCca3.set(c.cca3, c);

      const names = [];
      try {
        if (c.name && c.name.common) names.push(c.name.common);
        if (c.name && c.name.official) names.push(c.name.official);
        if (Array.isArray(c.altSpellings)) names.push.apply(names, c.altSpellings);
        if (c.translations) {
          for (const k of Object.keys(c.translations)) {
            const t = c.translations[k];
            if (t && t.common) names.push(t.common);
            if (t && t.official) names.push(t.official);
          }
        }
      } catch (_) {}

      for (const n of names) {
        const norm = normalizeName(n);
        if (!norm) continue;
        // first write wins (avoids overwriting with noisy translations)
        if (!byNorm.has(norm)) byNorm.set(norm, c);
      }
    }

    return { byNorm, byCca3 };
  }

  function bestTriviaMatch(triviaByNorm, topoName) {
    const norm = normalizeName(topoName);
    if (triviaByNorm.has(norm)) return triviaByNorm.get(norm);

    // a small set of common mismatches between datasets
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

    // fallback: try partial containment for long official names
    for (const [k, v] of triviaByNorm.entries()) {
      if (k === norm) return v;
      if (k.includes(norm) || norm.includes(k)) return v;
    }
    return null;
  }

  // ---------- Silhouette renderer ----------
  function CountrySilhouette(props) {
    const svgRef = useRef(null);
    const { topo, targetName, theme } = props;

    useEffect(() => {
      if (!topo || !svgRef.current || !targetName) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const features = topojson.feature(topo, topo.objects.countries).features;
      const normTarget = normalizeName(targetName);

      const target = features.find(f => normalizeName((f.properties && f.properties.name) || "") === normTarget);
      if (!target) return;

      const width = 520, height = 420;
      const projection = d3.geoMercator().fitSize([width - 60, height - 60], target);
      const path = d3.geoPath().projection(projection);

      const fill = theme === "dark" ? "#3b82f6" : (theme === "ocean" ? "#0ea5e9" : "#2563eb");
      const stroke = theme === "dark" ? "#1d4ed8" : (theme === "ocean" ? "#0284c7" : "#1e40af");

      svg.append("path")
        .datum(target)
        .attr("d", path)
        .attr("transform", "translate(30, 30)")
        .attr("fill", fill)
        .attr("stroke", stroke)
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.98);

    }, [topo, targetName, theme]);

    return e("svg", { ref: svgRef, width: "520", height: "420", viewBox: "0 0 520 420", "aria-label": "Country silhouette" });
  }

  // ---------- App ----------
  function AtlaslyApp() {
    const [topo, setTopo] = useState(null);
    const [countryIndex, setCountryIndex] = useState(null); // from topo
    const [restData, setRestData] = useState(null);
    const [triviaIndex, setTriviaIndex] = useState(null);

    const [screen, setScreen] = useState("landing"); // landing | game
    const [theme, setTheme] = useState("light"); // light | dark | ocean

    const [targetName, setTargetName] = useState(null);
    const [targetMeta, setTargetMeta] = useState(null); // topo record + trivia
    const [wiki, setWiki] = useState(null);

    const [guesses, setGuesses] = useState([]);
    const [input, setInput] = useState("");
    const [complete, setComplete] = useState(false);
    const [won, setWon] = useState(false);

    const [helpOpen, setHelpOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    const [bonusRound, setBonusRound] = useState(null); // flag | capital | neighbor | photo
    const [bonusAnswers, setBonusAnswers] = useState({});

    const [isPremium, setIsPremium] = useState(true); // Keep premium "on" because you said no tradeoffs.

    const [stats, setStats] = useState(() => safeJsonParse(localStorage.getItem("atlaslyStats"), {
      plays: 0, wins: 0, bestStreak: 0, streak: 0, lastWinSeed: null, avgGuesses: null
    }));

    const dailySeed = useMemo(() => getDailySeed(), []);
    const dailyCompleted = useMemo(() => localStorage.getItem("lastDailySeed") === String(dailySeed), [dailySeed]);

    function showToast(kind, text) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ kind, text });
      toastTimer.current = setTimeout(() => setToast(null), 2400);
    }

    // theme init
    useEffect(() => {
      const saved = localStorage.getItem("atlaslyTheme") || "light";
      setTheme(saved);
      document.body.classList.remove("theme-light", "theme-dark", "theme-ocean");
      document.body.classList.add("theme-" + saved);
    }, []);
    useEffect(() => {
      localStorage.setItem("atlaslyTheme", theme);
      document.body.classList.remove("theme-light", "theme-dark", "theme-ocean");
      document.body.classList.add("theme-" + theme);
    }, [theme]);

    useEffect(() => {
      localStorage.setItem("atlaslyStats", JSON.stringify(stats));
    }, [stats]);

    // Load core datasets
    useEffect(() => {
      (async () => {
        try {
          const topo50 = await loadTopo50m(showToast);
          setTopo(topo50);
          const idx = buildCountryIndexFromTopo(topo50);
          setCountryIndex(idx);
        } catch (err) {
          console.error(err);
          showToast("danger", "Could not load map data (50m).");
        }
      })();

      (async () => {
        try {
          const rc = await loadRestCountries(showToast);
          setRestData(rc);
          setTriviaIndex(buildTriviaIndex(rc));
        } catch (err) {
          console.error(err);
          showToast("danger", "Could not load country facts.");
        }
      })();
    }, []);

    const playable = useMemo(() => {
      if (!countryIndex || !triviaIndex) return null;

      // Keep all topo countries, but attach trivia where it exists.
      // Most should match; some may be missing (territories / naming differences).
      const list = countryIndex.map(t => {
        const trivia = bestTriviaMatch(triviaIndex.byNorm, t.name);
        return { ...t, trivia };
      });

      // Filter out ultra-rare missing names (still many hundreds remain)
      return list.filter(x => x && x.name && x.lat != null && x.lon != null);
    }, [countryIndex, triviaIndex]);

    const nameList = useMemo(() => (playable ? playable.map(x => x.name).sort() : []), [playable]);

    function pickDailyCountry() {
      if (!playable || !playable.length) return null;

      // Difficulty-aware daily selection (avoid tiny microstates too frequently)
      // Weighted choice: easier countries more likely, but hard ones still appear.
      const weights = playable.map(c => (6 - c.difficulty)); // diff 1 => 5 weight, diff 5 => 1 weight
      const total = weights.reduce((a,b)=>a+b, 0);
      let r = seededRandom(dailySeed) * total;
      for (let i=0; i<playable.length; i++) {
        r -= weights[i];
        if (r <= 0) return playable[i].name;
      }
      return playable[0].name;
    }

    function pickRandomCountry() {
      if (!playable || !playable.length) return null;
      return playable[Math.floor(Math.random() * playable.length)].name;
    }

    async function setTarget(name) {
      setTargetName(name);
      setGuesses([]);
      setInput("");
      setComplete(false);
      setWon(false);
      setBonusRound(null);
      setBonusAnswers({});
      setWiki(null);

      const meta = playable.find(x => x.name === name) || null;
      setTargetMeta(meta);

      // Load Wikipedia summary & image lazily per target
      try {
        const title = (meta && meta.trivia && meta.trivia.name && meta.trivia.name.common) ? meta.trivia.name.common : name;
        const w = await loadWikipediaSummary(title);
        setWiki(w);
      } catch (err) {
        // don't fail game if wiki is unavailable
        setWiki(null);
      }
    }

    function startDaily() {
      const c = pickDailyCountry();
      if (!c) return;
      setScreen("game");
      setStats(s => ({ ...s, plays: (s.plays || 0) + 1 }));
      setTarget(c);
    }

    function startUnlimited() {
      if (!isPremium) {
        showToast("danger", "Unlimited is part of Premium.");
        return;
      }
      const c = pickRandomCountry();
      if (!c) return;
      setScreen("game");
      setStats(s => ({ ...s, plays: (s.plays || 0) + 1 }));
      setTarget(c);
    }

    function resolveGuess(value) {
      const norm = normalizeName(value);
      if (!norm) return null;

      // Primary: exact match against topo names
      const exact = playable.find(x => x.norm === norm);
      if (exact) return exact.name;

      // Secondary: try restcountries name variants mapped back to topo names
      if (triviaIndex && triviaIndex.byNorm && triviaIndex.byNorm.has(norm)) {
        const rc = triviaIndex.byNorm.get(norm);
        if (rc && rc.name && rc.name.common) {
          const common = normalizeName(rc.name.common);
          const topoMatch = playable.find(x => x.norm === common);
          if (topoMatch) return topoMatch.name;
        }
      }

      // Tertiary: containment heuristics
      const hit = playable.find(x => x.norm.includes(norm) || norm.includes(x.norm));
      return hit ? hit.name : null;
    }

    function submitGuess() {
      if (complete) return;
      const v = input.trim();
      if (!v) return;

      const guessedName = resolveGuess(v);
      if (!guessedName) {
        showToast("danger", "Not recognized. Try a different country name.");
        return;
      }

      const guessedMeta = playable.find(x => x.name === guessedName);
      const target = targetMeta;
      if (!guessedMeta || !target) return;

      const distance = calculateDistance(guessedMeta.lat, guessedMeta.lon, target.lat, target.lon);
      const direction = calculateBearing(guessedMeta.lat, guessedMeta.lon, target.lat, target.lon);
      const proximity = clamp(Math.round(100 - (distance / 200)), 0, 100);

      const next = guesses.concat([{ country: guessedName, distance, direction, proximity }]);
      setGuesses(next);
      setInput("");

      if (guessedName === targetName) {
        setWon(true);
        setComplete(true);
        localStorage.setItem("lastDailySeed", String(dailySeed));

        setStats(s => {
          const prevSeed = s.lastWinSeed;
          const today = dailySeed;
          const yesterday = today - 1;
          const newStreak = (prevSeed === yesterday) ? (s.streak + 1) : 1;
          const bestStreak = Math.max(s.bestStreak || 0, newStreak);
          const wins = (s.wins || 0) + 1;

          const priorAvg = s.avgGuesses;
          const g = next.length;
          const avgGuesses = priorAvg == null ? g : Math.round(((priorAvg * (wins - 1)) + g) / wins * 10) / 10;

          return { ...s, wins, streak: newStreak, bestStreak, lastWinSeed: today, avgGuesses };
        });

        showToast("success", "Solved. Bonus unlocked.");
      } else if (next.length >= 6) {
        setComplete(true);
        showToast("danger", "Out of attempts. See the answer.");
      } else {
        showToast("info", "Hint updated.");
      }
    }

    function shareResults() {
      const header = "Atlasly 🌍  #" + dailySeed;
      const solved = won ? ("Solved in " + guesses.length) : "Not solved";
      const lines = guesses.map(g => {
        const dir = g.direction;
        const arrow = (dir >= 337.5 || dir < 22.5) ? "↑" :
          (dir < 67.5) ? "↗" :
          (dir < 112.5) ? "→" :
          (dir < 157.5) ? "↘" :
          (dir < 202.5) ? "↓" :
          (dir < 247.5) ? "↙" :
          (dir < 292.5) ? "←" : "↖";
        const heat = g.proximity >= 80 ? "🟩" : g.proximity >= 50 ? "🟨" : "🟦";
        return heat + " " + arrow + " " + g.distance + "km";
      });
      const text = [header, solved, "", ...lines].join("\n");

      const done = () => showToast("success", "Copied share text.");
      const fail = () => showToast("danger", "Could not copy. Select and copy manually.");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fail);
      } else {
        try { window.prompt("Copy results:", text); done(); } catch (_) { fail(); }
      }
    }

    function submitBonusAnswer(key, answer, correct) {
      const ok = answer === correct;
      setBonusAnswers(prev => ({ ...prev, [key]: { answer, correct: ok } }));
      showToast(ok ? "success" : "danger", ok ? "Correct." : "Not quite.");
    }

    function getBonusData() {
      const t = targetMeta;
      if (!t || !t.trivia) return null;
      const rc = t.trivia;

      const flagUrl = (rc.flags && (rc.flags.png || rc.flags.svg)) ? (rc.flags.png || rc.flags.svg) : null;
      const capital = (Array.isArray(rc.capital) && rc.capital.length) ? rc.capital[0] : null;

      // neighbors from borders (cca3 codes)
      let neighbors = [];
      if (Array.isArray(rc.borders) && triviaIndex && triviaIndex.byCca3) {
        neighbors = rc.borders
          .map(code => triviaIndex.byCca3.get(code))
          .filter(Boolean)
          .map(x => (x.name && x.name.common) ? x.name.common : null)
          .filter(Boolean);
      }

      return { rc, flagUrl, capital, neighbors };
    }

    function sampleWrong(list, correct, n) {
      const pool = list.filter(x => x !== correct).slice();
      const out = [];
      while (out.length < n && pool.length) {
        const i = Math.floor(Math.random() * pool.length);
        out.push(pool[i]);
        pool.splice(i, 1);
      }
      return out;
    }

    function HelpModal() {
      return e("div", { className: "modal-overlay", onClick: () => setHelpOpen(false) },
        e("div", { className: "modal", onClick: (ev) => ev.stopPropagation() },
          e("button", { className: "btn btn-ghost close", onClick: () => setHelpOpen(false) }, "Close"),
          e("h2", null, "How to Play"),
          e("p", null, "You have 6 tries to guess today’s country from its silhouette."),
          e("p", null, "After each guess, you get distance (km) and a direction arrow pointing toward the target."),
          e("p", null, "Solve it to unlock bonus rounds: flag, capital, neighbors, and a photo/trivia card."),
          e("p", null, "Data sources: world-atlas (Natural Earth), REST Countries, and Wikipedia summaries.")
        )
      );
    }

    // ---------- Loading ----------
    if (!topo || !playable) {
      return e("div", { className: "container", style: { paddingTop: "40px" } },
        e("div", { className: "card", style: { textAlign: "center", padding: "28px" } },
          e("div", { style: { display: "flex", justifyContent: "center", marginBottom: "10px" } }, e(GlobeIcon, { size: 44 })),
          e("div", { style: { fontWeight: 900 } }, "Loading…"),
          e("div", { style: { marginTop: "8px", color: "var(--text-secondary)" } }, "Preparing high-fidelity maps and country facts.")
        )
      );
    }

    // ---------- Landing ----------
    function Landing() {
      const locked = dailyCompleted;
      return e("div", null,
        e("div", { className: "nav" },
          e("div", { className: "nav-inner" },
            e("div", { className: "brand" },
              e("div", { className: "brand-mark" }, e(GlobeIcon, { size: 22 })),
              e("div", { className: "brand-name" }, "Atlasly")
            ),
            e("div", { className: "nav-actions" },
              e("div", { className: "theme-toggle", role: "group", "aria-label": "Theme selector" },
                e("button", { className: "iconbtn" + (theme === "light" ? " active" : ""), onClick: () => setTheme("light"), "aria-label": "Light theme" }, e(SunIcon, { size: 18 })),
                e("button", { className: "iconbtn" + (theme === "dark" ? " active" : ""), onClick: () => setTheme("dark"), "aria-label": "Dark theme" }, e(MoonIcon, { size: 18 })),
                e("button", { className: "iconbtn" + (theme === "ocean" ? " active" : ""), onClick: () => setTheme("ocean"), "aria-label": "Ocean theme" }, "🌊")
              ),
              e("button", { className: "btn btn-ghost", onClick: () => setHelpOpen(true) }, e(HelpIcon, { size: 18 }), "How to play")
            )
          )
        ),
        e("div", { className: "container stack", style: { paddingTop: "18px" } },
          e("div", { className: "hero" },
            e("div", { className: "badge" }, "All Countries • 50m Fidelity • Daily Challenge"),
            e("h1", null, "Guess the country from its silhouette."),
            e("p", null, "Now with high-fidelity shapes and real country facts. Solve today’s puzzle to build your streak."),
            e("div", { className: "row", style: { marginTop: "16px", flexWrap: "wrap" } },
              locked
                ? e("button", { className: "btn btn-primary", disabled: true, style: { opacity: 0.7, cursor: "not-allowed" } }, "Daily Complete")
                : e("button", { className: "btn btn-primary", onClick: startDaily }, "Play Today"),
              e("button", { className: "btn", onClick: startUnlimited }, "Practice"),
              e("button", { className: "btn btn-ghost", onClick: shareResults }, "Share (if played)")
            ),
            e("div", { className: "subtle", style: { marginTop: "10px" } }, "Playable countries: " + playable.length)
          ),
          e("div", { className: "grid3" },
            e("div", { className: "card stat" },
              e("div", { className: "v" }, stats.streak || 0),
              e("div", { className: "k" }, "Current streak")
            ),
            e("div", { className: "card stat" },
              e("div", { className: "v" }, stats.bestStreak || 0),
              e("div", { className: "k" }, "Best streak")
            ),
            e("div", { className: "card stat" },
              e("div", { className: "v" }, (stats.avgGuesses == null ? "—" : stats.avgGuesses)),
              e("div", { className: "k" }, "Avg guesses (wins)")
            )
          ),
          e("div", { className: "card", style: { padding: "16px", color: "var(--text-secondary)" } },
            e("div", { style: { fontWeight: 900, color: "var(--text-primary)" } }, "Data & attribution"),
            e("div", { style: { marginTop: "6px", lineHeight: "1.6" } },
              "Shapes: world-atlas (Natural Earth derived). Facts: REST Countries. Summaries/images: Wikipedia page summaries."
            )
          )
        )
      );
    }

    // ---------- Game ----------
    function Game() {
      const attempts = guesses.length;
      const remaining = 6 - attempts;
      const bonus = getBonusData();

      return e("div", { className: "game-shell" },
        e("div", { className: "nav" },
          e("div", { className: "nav-inner" },
            e("div", { className: "brand" },
              e("div", { className: "brand-mark" }, e(GlobeIcon, { size: 22 })),
              e("div", { className: "brand-name" }, "Atlasly")
            ),
            e("div", { className: "nav-actions" },
              e("div", { className: "subtle" }, "Attempts: " + attempts + " / 6"),
              e("button", { className: "btn btn-ghost", onClick: () => setScreen("landing") }, "Home")
            )
          )
        ),

        e("div", { className: "container stack" },
          e("div", { className: "game-head" },
            e("div", null,
              e("div", { className: "subtle" }, "All Countries"),
              e("div", { style: { fontWeight: 900, fontSize: "18px", letterSpacing: "-0.02em" } }, complete ? "Results" : ("Remaining: " + remaining))
            ),
            e("div", { className: "row" },
              e("button", { className: "btn btn-ghost", onClick: () => setHelpOpen(true) }, e(HelpIcon, { size: 18 }), "Help")
            )
          ),

          !complete ? e("div", { className: "mapbox" },
            e(CountrySilhouette, { topo, targetName, theme })
          ) : null,

          !complete ? e("div", { className: "guesslist" },
            guesses.map((g, idx) => e("div", { key: idx, className: "guessrow" },
              e("div", { className: "name" }, g.country),
              e("div", { className: "chips" },
                e("span", { className: "chip" }, g.distance + " km"),
                e(NavigationIcon, { size: 18, rotation: g.direction }),
                e("span", { className: "chip" }, g.proximity + "%")
              )
            ))
          ) : null,

          !complete ? e("div", { className: "inputbar" },
            e("input", {
              className: "input",
              value: input,
              onChange: (ev) => setInput(ev.target.value),
              onKeyDown: (ev) => { if (ev.key === "Enter") submitGuess(); },
              placeholder: "Type a country (try local spellings too)…",
              list: "atlasly-country-list",
              autoFocus: true
            }),
            e("datalist", { id: "atlasly-country-list" },
              nameList.slice(0, 4000).map(n => e("option", { key: n, value: n }))
            ),
            e("button", { className: "btn btn-primary", onClick: submitGuess }, "Guess")
          ) : null,

          complete ? e("div", { className: "results" },
            e("div", { style: { textAlign: "center" } },
              e("div", { className: "big-emoji" }, won ? "🎉" : "🗺️"),
              e("h2", null, won ? "Solved." : "Good try."),
              e("p", null, "Answer: ", e("strong", { style: { color: "var(--accent)" } }, targetName))
            ),
            bonus && bonus.rc ? e("div", { style: { marginTop: "14px", display: "grid", gap: "10px" } },
              e("div", { className: "panel" },
                e("div", { style: { fontWeight: 900, marginBottom: "6px" } }, "Fast facts"),
                e("div", { style: { color: "var(--text-secondary)", lineHeight: "1.6" } },
                  "Region: ", e("strong", null, bonus.rc.region || "—"), " • ",
                  "Population: ", e("strong", null, formatPopulation(bonus.rc.population)), " • ",
                  "Capital: ", e("strong", null, (Array.isArray(bonus.rc.capital) && bonus.rc.capital[0]) ? bonus.rc.capital[0] : "—")
                )
              ),
              wiki && wiki.extract ? e("div", { className: "panel" },
                e("div", { style: { display: "flex", gap: "12px", alignItems: "flex-start" } },
                  (wiki.thumbnail && wiki.thumbnail.source)
                    ? e("img", { src: wiki.thumbnail.source, alt: "Photo", style: { width: "120px", height: "90px", objectFit: "cover", borderRadius: "14px", border: "1px solid var(--border)" } })
                    : null,
                  e("div", null,
                    e("div", { style: { fontWeight: 900, marginBottom: "6px" } }, "Trivia"),
                    e("div", { style: { color: "var(--text-secondary)", lineHeight: "1.6" } }, wiki.extract)
                  )
                ),
                (wiki.content_urls && wiki.content_urls.desktop && wiki.content_urls.desktop.page)
                  ? e("div", { style: { marginTop: "10px" } },
                      e("a", { href: wiki.content_urls.desktop.page, target: "_blank", rel: "noreferrer", style: { color: "var(--accent)", fontWeight: 900, textDecoration: "none" } }, "Read more on Wikipedia")
                    )
                  : null
              ) : null
            ) : null,

            e("div", { className: "row", style: { justifyContent: "center", flexWrap: "wrap", marginTop: "16px" } },
              e("button", { className: "btn btn-primary", onClick: shareResults }, "Share results"),
              e("button", { className: "btn", onClick: () => setScreen("landing") }, "Back to Home"),
              e("button", { className: "btn btn-ghost", onClick: startUnlimited }, "Play again")
            ),

            won && bonus ? e("div", { style: { marginTop: "16px" } },
              e("div", { className: "subtle", style: { textAlign: "center" } }, "Bonus challenges"),
              e("div", { className: "tabs" },
                e("button", {
                  className: "tab" + (bonusRound === "flag" ? " active" : "") + (bonusAnswers.flag ? (bonusAnswers.flag.correct ? " ok" : " bad") : ""),
                  onClick: () => setBonusRound("flag")
                }, "🚩 Flag", bonusAnswers.flag ? (bonusAnswers.flag.correct ? " ✓" : " ✗") : ""),
                e("button", {
                  className: "tab" + (bonusRound === "capital" ? " active" : "") + (bonusAnswers.capital ? (bonusAnswers.capital.correct ? " ok" : " bad") : ""),
                  onClick: () => setBonusRound("capital")
                }, "🏛️ Capital", bonusAnswers.capital ? (bonusAnswers.capital.correct ? " ✓" : " ✗") : ""),
                (bonus.neighbors && bonus.neighbors.length)
                  ? e("button", {
                      className: "tab" + (bonusRound === "neighbor" ? " active" : "") + (bonusAnswers.neighbor ? (bonusAnswers.neighbor.correct ? " ok" : " bad") : ""),
                      onClick: () => setBonusRound("neighbor")
                    }, "🌍 Neighbor", bonusAnswers.neighbor ? (bonusAnswers.neighbor.correct ? " ✓" : " ✗") : "")
                  : null
              ),

              bonusRound === "flag" ? e("div", { className: "panel" },
                bonusAnswers.flag
                  ? e("div", { style: { fontWeight: 900, textAlign: "center" } },
                      bonusAnswers.flag.correct ? "✅ Correct." : ("❌ It was " + targetName)
                    )
                  : (bonus.flagUrl
                      ? e("div", { style: { textAlign: "center" } },
                          e("img", { src: bonus.flagUrl, alt: "Flag", style: { width: "180px", borderRadius: "14px", border: "1px solid var(--border)" } }),
                          e("div", { style: { marginTop: "12px" } },
                            (function () {
                              const options = sampleWrong(playable.map(x => x.name), targetName, 3).concat([targetName]).sort(()=>Math.random()-0.5);
                              return e("div", { className: "grid2" },
                                options.map(c => e("button", { key: c, className: "choice", onClick: () => submitBonusAnswer("flag", c, targetName) }, c))
                              );
                            })()
                          )
                        )
                      : e("div", { style: { fontWeight: 900, textAlign: "center" } }, "Flag not available for this entry.")
                    )
              ) : null,

              bonusRound === "capital" ? e("div", { className: "panel" },
                bonusAnswers.capital
                  ? e("div", { style: { fontWeight: 900, textAlign: "center" } },
                      bonusAnswers.capital.correct ? "✅ Correct." : ("❌ Capital: " + (bonus.capital || "—"))
                    )
                  : (bonus.capital
                      ? (function () {
                          const allCaps = playable
                            .map(x => x.trivia && Array.isArray(x.trivia.capital) ? x.trivia.capital[0] : null)
                            .filter(Boolean);
                          const wrong = sampleWrong(allCaps, bonus.capital, 3);
                          const options = wrong.concat([bonus.capital]).sort(()=>Math.random()-0.5);
                          return e("div", { className: "grid2" },
                            options.map(cap => e("button", { key: cap, className: "choice", onClick: () => submitBonusAnswer("capital", cap, bonus.capital) }, cap))
                          );
                        })()
                      : e("div", { style: { fontWeight: 900, textAlign: "center" } }, "Capital not available for this entry.")
                    )
              ) : null,

              bonusRound === "neighbor" ? e("div", { className: "panel" },
                (function () {
                  const neighbors = bonus.neighbors || [];
                  if (!neighbors.length) return e("div", { style: { fontWeight: 900, textAlign: "center" } }, "No neighbor data.");
                  const correct = neighbors[Math.floor(Math.random() * neighbors.length)];
                  return bonusAnswers.neighbor
                    ? e("div", { style: { fontWeight: 900, textAlign: "center" } },
                        bonusAnswers.neighbor.correct ? "✅ Correct." : ("❌ Neighbors include: " + neighbors.join(", "))
                      )
                    : (function () {
                        const wrong = sampleWrong(playable.map(x => x.name), correct, 3).filter(x => !neighbors.includes(x));
                        const options = wrong.concat([correct]).sort(()=>Math.random()-0.5);
                        return e("div", { className: "grid2" },
                          options.map(c => e("button", { key: c, className: "choice", onClick: () => submitBonusAnswer("neighbor", c, correct) }, c))
                        );
                      })();
                })()
              ) : null
            ) : null
          ) : null
        )
      );
    }

    return e(React.Fragment, null,
      screen === "landing" ? e(Landing) : e(Game),
      helpOpen ? e(HelpModal) : null,
      toast ? e("div", { className: "toast " + (toast.kind || "") },
        e("span", { className: "dot" }),
        e("span", null, toastEmoji(toast.kind), " ", toast.text)
      ) : null
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(AtlaslyApp));
})();
