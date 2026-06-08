import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, fromApiCard, toApiCard } from '../lib/api';

export function useNationalDexBinder() {
  const { authFetch } = useAuth();
  const authFetchRef  = useRef(authFetch);
  useEffect(() => { authFetchRef.current = authFetch; });

  const [cardOverrides, setCardOverrides] = useState({});
  const [currentPage,   setCurrentPage]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    let cancelled = false;
    authFetchRef.current(apiUrl('/api/national-dex/'))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (cancelled) return;
        const overrides = {};
        // Keys are now pokemon_name strings, not slot indices
        Object.entries(data).forEach(([k, v]) => { overrides[k] = fromApiCard(v); });
        setCardOverrides(overrides);
      })
      .catch(() => { if (!cancelled) setError('Failed to load your binder.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const setCard = useCallback((pokemonName, cardData) => {
    setCardOverrides(prev => ({ ...prev, [pokemonName]: cardData }));
    authFetchRef.current(apiUrl(`/api/national-dex/pokemon/${encodeURIComponent(pokemonName)}/`), {
      method: 'PUT',
      body: JSON.stringify(toApiCard(cardData)),
    }).catch(console.error);
  }, []);

  const removeCard = useCallback((pokemonName) => {
    setCardOverrides(prev => { const n = { ...prev }; delete n[pokemonName]; return n; });
    authFetchRef.current(apiUrl(`/api/national-dex/pokemon/${encodeURIComponent(pokemonName)}/`), {
      method: 'DELETE',
    }).catch(console.error);
  }, []);

  const goToPage = useCallback((page) => setCurrentPage(Math.max(0, page)), []);

  return {
    cardOverrides,
    currentPage,
    totalCards: Object.keys(cardOverrides).length,
    setCard,
    removeCard,
    goToPage,
    loading,
    error,
  };
}
