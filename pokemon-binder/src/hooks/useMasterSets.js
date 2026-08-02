import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

// tcgdex's set/series data barely changes, so cache raw responses in
// sessionStorage to avoid re-fetching ~20+ requests on every visit to this page.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Storage full/unavailable (private browsing etc.) — safe to skip caching.
  }
}

async function cachedFetchJson(key, url) {
  const cached = readCache(key);
  if (cached) return cached;
  const data = await fetch(url).then(r => r.ok ? r.json() : Promise.reject());
  writeCache(key, data);
  return data;
}

// tcgdex's brief /sets list has no release date, and fetching every set's full
// detail (which include their entire card list) just for one field would be very
// heavy. Series detail is much lighter and gives a release date per era plus each
// set's position within it — good enough to sort "new to old" without 200+ requests.
// This is auxiliary (release-date sort + Pocket filtering) — if it fails, callers
// should still be able to show the plain sets list rather than fail outright.
async function fetchSeriesInfo() {
  const seriesList = await cachedFetchJson(
    'mastersets_cache_series_list',
    'https://api.tcgdex.net/v2/en/series'
  ).catch(() => []);

  const details = await Promise.all(
    (Array.isArray(seriesList) ? seriesList : []).map(s =>
      cachedFetchJson(`mastersets_cache_series_${s.id}`, `https://api.tcgdex.net/v2/en/series/${s.id}`)
        .catch(() => null)
    )
  );

  const bySetId = {};
  let pocketSetIds = new Set();
  details.filter(Boolean).forEach(series => {
    (series.sets || []).forEach((s, order) => {
      bySetId[s.id] = { releaseDate: series.releaseDate || null, order };
    });
    if (series.id === 'tcgp') {
      pocketSetIds = new Set((series.sets || []).map(s => s.id));
    }
  });

  return { bySetId, pocketSetIds };
}

export function useMasterSets() {
  const { authFetch } = useAuth();

  const [sets,    setSets]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Only the base sets list is essential — everything else degrades gracefully
    // (missing summary just means 0-owned counts, missing series info just means
    // no release-date sort and no Pocket filtering) rather than failing the page.
    const setsPromise    = cachedFetchJson('mastersets_cache_sets', 'https://api.tcgdex.net/v2/en/sets');
    const summaryPromise = authFetch(apiUrl('/api/mastersets/'))
      .then(r => r.ok ? r.json() : {})
      .catch(() => ({}));
    const seriesPromise  = fetchSeriesInfo().catch(() => ({ bySetId: {}, pocketSetIds: new Set() }));

    Promise.all([setsPromise, summaryPromise, seriesPromise])
      .then(([tcgSets, summary, { bySetId, pocketSetIds }]) => {
        if (cancelled) return;
        const merged = (Array.isArray(tcgSets) ? tcgSets : [])
          .filter(s => !pocketSetIds.has(s.id))
          .map(s => ({
            id:          s.id,
            name:        s.name,
            logo:        s.logo || '',
            symbol:      s.symbol || '',
            totalCards:  s.cardCount?.official ?? s.cardCount?.total ?? 0,
            ownedCount:  summary[s.id] || 0,
            releaseDate: bySetId[s.id]?.releaseDate ?? null,
            seriesOrder: bySetId[s.id]?.order ?? 0,
          }));
        setSets(merged);
      })
      .catch(() => { if (!cancelled) setError('Failed to load sets.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [authFetch]);

  return { sets, loading, error };
}
