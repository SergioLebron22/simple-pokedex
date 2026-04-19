import { useState, useCallback } from 'react';

export function useTCGSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      // API returns an array directly
      setResults(Array.isArray(data) ? data.slice(0, 60) : []);
    } catch (e) {
      setError('Search failed. Try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, loading, error, search, clearResults };
}