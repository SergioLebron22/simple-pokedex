import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl, fromApiCard, toApiCard } from '../lib/api';

export function useCustomBinder(binderId) {
  const { authFetch } = useAuth();
  const authFetchRef  = useRef(authFetch);
  useEffect(() => { authFetchRef.current = authFetch; });

  const [binder,       setBinder]       = useState(null);
  const [cardOverrides,setCardOverrides] = useState({});
  const [currentPage,  setCurrentPage]  = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    if (!binderId) return;
    let cancelled = false;
    setLoading(true);
    authFetchRef.current(apiUrl(`/api/binders/${binderId}/`))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (cancelled) return;
        setBinder(data);
        const overrides = {};
        Object.entries(data.slots || {}).forEach(([k, v]) => { overrides[parseInt(k)] = fromApiCard(v); });
        setCardOverrides(overrides);
      })
      .catch(() => { if (!cancelled) setError('Binder not found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [binderId]);

  const setCard = useCallback((slotIndex, cardData) => {
    setCardOverrides(prev => ({ ...prev, [slotIndex]: cardData }));
    authFetchRef.current(apiUrl(`/api/binders/${binderId}/slots/${slotIndex}/`), {
      method: 'PUT',
      body: JSON.stringify(toApiCard(cardData)),
    }).catch(console.error);
  }, [binderId]);

  const removeCard = useCallback((slotIndex) => {
    setCardOverrides(prev => { const n = { ...prev }; delete n[slotIndex]; return n; });
    authFetchRef.current(apiUrl(`/api/binders/${binderId}/slots/${slotIndex}/`), {
      method: 'DELETE',
    }).catch(console.error);
  }, [binderId]);

  const goToPage = useCallback((page) => setCurrentPage(Math.max(0, page)), []);

  const updateBinderMeta = useCallback((updates) => {
    setBinder(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  return {
    binder,
    cardOverrides,
    currentPage,
    totalCards: Object.keys(cardOverrides).length,
    setCard,
    removeCard,
    goToPage,
    updateBinderMeta,
    loading,
    error,
  };
}
