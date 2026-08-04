import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';
import { compareByLocalId } from '../lib/sortCards';
import { cachedFetchJson, mapWithConcurrency } from '../lib/tcgdexCache';

const SAVE_ERROR_DISPLAY_MS = 4000;
// tcgdex's brief set-detail card list doesn't say which print variants (holo,
// reverse holo...) a card actually comes in — only its own full card detail
// does. We need that BEFORE building the slot list (extra slots for holo/
// reverse change how many slots exist at all), so this runs as a blocking
// batch, capped at this many in flight so a big set (200+ cards) doesn't fire
// everything at once. Cached afterward, so this cost is paid once per set.
const VARIANT_FETCH_CONCURRENCY = 15;

// Which slots exist for one card, in binder order. A plain "normal" slot is
// only added if the card was actually printed that way (or as a fallback when
// it has neither holo nor reverse, e.g. Trainer/Energy cards, so no card is
// ever dropped) — some cards (many early-set rares) are holo-only and would
// otherwise get a redundant, non-existent "normal" slot alongside their holo one.
function slotsForCard(variants) {
  if (!variants) return [{ variant: null, label: '' }];
  const slots = [];
  if (variants.normal || (!variants.holo && !variants.reverse)) {
    slots.push({ variant: null, label: '' });
  }
  if (variants.holo)    slots.push({ variant: 'holo',    label: 'Holo' });
  if (variants.reverse) slots.push({ variant: 'reverse', label: 'Reverse Holo' });
  return slots;
}

export function useMasterSetBinder(setId) {
  const { authFetch } = useAuth();
  const authFetchRef  = useRef(authFetch);
  useEffect(() => { authFetchRef.current = authFetch; });

  const [setMeta,        setSetMeta]        = useState(null);
  const [cardOverrides,  setCardOverrides]  = useState({});
  const [currentPage,    setCurrentPage]    = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 0 });
  const [error,          setError]          = useState(null);
  const [saveError,      setSaveError]      = useState(null);

  // Parallel to cardOverrides, keyed by globalIndex — what toggleOwned needs
  // to resolve a slot back to its real tcgdex card id + which print variant.
  const slotsRef = useRef([]);
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
    setLoadingProgress({ done: 0, total: 0 });
    setCurrentPage(0);
    slotsRef.current = [];
    setCardOverrides({});

    Promise.all([
      cachedFetchJson(`mastersets_cache_set_${setId}`, `https://api.tcgdex.net/v2/en/sets/${setId}`),
      authFetchRef.current(apiUrl(`/api/mastersets/${setId}/`)).then(r => r.ok ? r.json() : Promise.reject()),
      authFetchRef.current(apiUrl(`/api/mastersets/${setId}/variants/`)).then(r => r.ok ? r.json() : {}).catch(() => ({})),
    ])
      .then(async ([set, ownership, variantOwnership]) => {
        if (cancelled) return;
        const sortedCards = [...(set.cards || [])].sort(compareByLocalId);
        setSetMeta({ id: set.id, name: set.name, logo: set.logo || '', symbol: set.symbol || '' });
        setLoadingProgress({ done: 0, total: sortedCards.length });

        let done = 0;
        const variantsByCard = await mapWithConcurrency(sortedCards, VARIANT_FETCH_CONCURRENCY, async (c) => {
          if (cancelled) return null;
          let variants = null;
          try {
            const detail = await cachedFetchJson(
              `mastersets_cache_card_${c.id}`,
              `https://api.tcgdex.net/v2/en/cards/${c.id}`
            );
            variants = detail.variants || null;
          } catch {
            // Unknown — falls back to a single plain slot for this card.
          }
          done += 1;
          if (!cancelled) setLoadingProgress({ done, total: sortedCards.length });
          return variants;
        });
        if (cancelled) return;

        const slots = [];
        const overrides = {};
        sortedCards.forEach((c, i) => {
          slotsForCard(variantsByCard[i]).forEach(({ variant, label }) => {
            const globalIndex = slots.length;
            slots.push({ tcgCardId: c.id, variant });
            overrides[globalIndex] = {
              name:       label ? `${c.name} (${label})` : c.name,
              tcgImage:   c.image ? `${c.image}/high.webp` : '',
              tcgSet:     set.name,
              tcgCardId:  c.id,
              tcgLocalId: c.localId,
              variantLabel: label || null,
              owned: variant
                ? (variantOwnership[c.id] || []).includes(variant)
                : !!ownership[c.id],
            };
          });
        });

        slotsRef.current = slots;
        setCardOverrides(overrides);
        setLoading(false);

        // Share the now-known true slot count (this is expensive to compute —
        // see MasterSetTotalSlots on the backend) so the Master Sets list page
        // can show an accurate total for this set without recomputing it itself.
        authFetchRef.current(apiUrl(`/api/mastersets/${setId}/total-slots/`), {
          method: 'PUT',
          body: JSON.stringify({ total_slots: slots.length }),
        }).catch(() => {});
      })
      .catch(() => {
        if (cancelled) return;
        setError('Failed to load set.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [setId]);

  const toggleOwned = useCallback((globalIndex) => {
    const slot    = slotsRef.current[globalIndex];
    const current = cardOverridesRef.current[globalIndex];
    if (!slot || !current) return;

    const previousOwned = current.owned;
    const nextOwned      = !previousOwned;

    setCardOverrides(prev => ({
      ...prev,
      [globalIndex]: { ...prev[globalIndex], owned: nextOwned },
    }));

    const url = slot.variant
      ? apiUrl(`/api/mastersets/${setId}/cards/${slot.tcgCardId}/variants/${slot.variant}/`)
      : apiUrl(`/api/mastersets/${setId}/cards/${slot.tcgCardId}/`);

    authFetchRef.current(url, {
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

  const totalSlots = slotsRef.current.length;
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
    loadingProgress,
    error,
    saveError,
  };
}
