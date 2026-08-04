import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';
import { cachedFetchJson } from '../lib/tcgdexCache';

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
      .then(r => r.ok ? r.json() : { owned: {}, totals: {} })
      .catch(() => ({ owned: {}, totals: {} }));
    const seriesPromise  = fetchSeriesInfo().catch(() => ({ bySetId: {}, pocketSetIds: new Set() }));

    Promise.all([setsPromise, summaryPromise, seriesPromise])
      .then(([tcgSets, summary, { bySetId, pocketSetIds }]) => {
        if (cancelled) return;
        const merged = (Array.isArray(tcgSets) ? tcgSets : [])
          .filter(s => !pocketSetIds.has(s.id))
          .map(s => {
            // `totals` is a global cache of each set's true slot count including
            // holo/reverse-holo variant slots, populated the first time anyone
            // opens that set's binder — see MasterSetTotalSlots on the backend.
            // Until then, fall back to tcgdex's plain card count as an estimate.
            const knownTotal = summary.totals?.[s.id];
            return {
              id:               s.id,
              name:             s.name,
              logo:             s.logo || '',
              symbol:           s.symbol || '',
              totalCards:       knownTotal ?? (s.cardCount?.official ?? s.cardCount?.total ?? 0),
              totalCardsExact:  knownTotal != null,
              ownedCount:       summary.owned?.[s.id] || 0,
              releaseDate:      bySetId[s.id]?.releaseDate ?? null,
              seriesOrder:      bySetId[s.id]?.order ?? 0,
            };
          });
        setSets(merged);
      })
      .catch(() => { if (!cancelled) setError('Failed to load sets.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [authFetch]);

  return { sets, loading, error };
}
