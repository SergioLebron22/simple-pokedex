import { useState, useEffect, useCallback } from 'react';

const SLOT_LIMIT     = 1280;
const CARDS_PER_PAGE = 20;
const TOTAL_SPREADS  = Math.ceil(SLOT_LIMIT / CARDS_PER_PAGE / 2); // = 32

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('pokemonBinder');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useBinder(totalDexSlots = SLOT_LIMIT) {
  // cardOverrides: { [globalSlotIndex]: cardData | null }
  const [cardOverrides, setCardOverrides] = useState(() => {
    const saved = loadFromStorage();
    return saved?.cardOverrides || {};
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = loadFromStorage();
    return saved?.currentPage || 0;
  });

  const totalPages = totalDexSlots
    ? Math.ceil(totalDexSlots / CARDS_PER_PAGE)
    : 0;

  useEffect(() => {
    localStorage.setItem(
      'pokemonBinder',
      JSON.stringify({ cardOverrides, currentPage })
    );
  }, [cardOverrides, currentPage]);

  const setCard = useCallback((globalSlotIndex, card) => {
    setCardOverrides(prev => ({ ...prev, [globalSlotIndex]: card }));
  }, []);

  const removeCard = useCallback((globalSlotIndex) => {
    setCardOverrides(prev => {
      const next = { ...prev };
      delete next[globalSlotIndex];
      return next;
    });
  }, []);

  const goToPage = useCallback((index) => {
    setCurrentPage(Math.max(0, Math.min(index, TOTAL_SPREADS - 1)));
  }, []);

  // Total cards = slots with a TCG card assigned
  const totalCards = Object.keys(cardOverrides).length;

  return {
    cardOverrides,
    currentPage,
    totalCards,
    totalSlots: totalDexSlots,
    totalPages,
    setCard,
    removeCard,
    goToPage,
    CARDS_PER_PAGE,
  };
}