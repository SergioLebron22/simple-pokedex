import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';
import { compareByLocalId } from '../lib/sortCards';

const SAVE_ERROR_DISPLAY_MS = 4000;

export function useMasterSetBinder(setId) {
  const { authFetch } = useAuth();
  const authFetchRef  = useRef(authFetch);
  useEffect(() => { authFetchRef.current = authFetch; });

  const [setMeta,       setSetMeta]       = useState(null);
  const [cardOverrides, setCardOverrides] = useState({});
  const [currentPage,   setCurrentPage]   = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [saveError,     setSaveError]     = useState(null);

  // Sorted set cards, keyed by globalIndex — used by toggleOwned to resolve
  // a slot index back to its fixed tcgdex card id.
  const cardsRef = useRef([]);
  // Mirrors cardOverrides so toggleOwned can read the current owned value
  // synchronously (state updater callbacks aren't invoked synchronously).
  const cardOverridesRef = useRef({});
  useEffect(() => { cardOverridesRef.current = cardOverrides; }, [cardOverrides]);

  const saveErrorTimeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(saveErrorTimeoutRef.current), []);

  const showSaveError = (message) => {
    clearTimeout(saveErrorTimeoutRef.current);
    setSaveError(message);
    saveErrorTimeoutRef.current = setTimeout(() => setSaveError(null), SAVE_ERROR_DISPLAY_MS);
  };

  useEffect(() => {
    if (!setId) return;
    let cancelled = false;
    setLoading(true);
    setCurrentPage(0);

    Promise.all([
      fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`).then(r => r.ok ? r.json() : Promise.reject()),
      authFetchRef.current(apiUrl(`/api/mastersets/${setId}/`)).then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([set, ownership]) => {
        if (cancelled) return;
        const sortedCards = [...(set.cards || [])].sort(compareByLocalId);
        cardsRef.current = sortedCards;

        setSetMeta({ id: set.id, name: set.name, logo: set.logo || '', symbol: set.symbol || '' });

        const overrides = {};
        sortedCards.forEach((c, i) => {
          overrides[i] = {
            name:       c.name,
            tcgImage:   c.image ? `${c.image}/high.webp` : '',
            tcgSet:     set.name,
            tcgCardId:  c.id,
            tcgLocalId: c.localId,
            owned:      !!ownership[c.id],
          };
        });
        setCardOverrides(overrides);
      })
      .catch(() => { if (!cancelled) setError('Failed to load set.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [setId]);

  const toggleOwned = useCallback((globalIndex) => {
    const card    = cardsRef.current[globalIndex];
    const current = cardOverridesRef.current[globalIndex];
    if (!card || !current) return;

    const previousOwned = current.owned;
    const nextOwned      = !previousOwned;

    setCardOverrides(prev => ({
      ...prev,
      [globalIndex]: { ...prev[globalIndex], owned: nextOwned },
    }));

    authFetchRef.current(apiUrl(`/api/mastersets/${setId}/cards/${card.id}/`), {
      method: 'PUT',
      body: JSON.stringify({ owned: nextOwned }),
    })
      .then(r => { if (!r.ok) throw new Error('Request failed'); })
      .catch(() => {
        setCardOverrides(prev => ({
          ...prev,
          [globalIndex]: { ...prev[globalIndex], owned: previousOwned },
        }));
        showSaveError("Couldn't save that change — check your connection and try again.");
      });
  }, [setId]);

  const goToPage = useCallback((page) => setCurrentPage(Math.max(0, page)), []);

  const totalSlots = cardsRef.current.length;
  const ownedCount = Object.values(cardOverrides).filter(c => c.owned).length;

  return {
    setMeta,
    cardOverrides,
    currentPage,
    totalSlots,
    ownedCount,
    toggleOwned,
    goToPage,
    loading,
    error,
    saveError,
  };
}
