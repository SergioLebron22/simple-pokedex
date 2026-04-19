import { useState } from 'react';
import { usePokedexList } from './hooks/usePokedexList';
import { useBinder }      from './hooks/useBinder';
import Header    from './components/Header';
import Controls  from './components/Controls';
import Binder    from './components/Binder';
import PageDots  from './components/PageDots';
import CardModal from './components/CardModal';

const CARDS_PER_PAGE = 20;

export default function App() {
  // Load full Pokédex list (filtered, capped at 1280)
  const {
    allPokemon,
    getPageEntries,
    totalPages: dexPages,
    loading,
    error,
  } = usePokedexList();

  // Binder state — keyed by global slot index
  const {
    cardOverrides,
    currentPage,      // currentPage = spread index
    totalCards,
    totalSlots,
    setCard,
    removeCard,
    goToPage,
  } = useBinder(allPokemon.length);

  const [filterMode, setFilterMode] = useState('all');
  const [modal, setModal] = useState(null); // { globalIndex, pokemon }

  // Two pages per spread
  const totalSpreads = Math.ceil(allPokemon.length / CARDS_PER_PAGE / 2);

  const openSlot   = (globalIndex, pokemon) => setModal({ globalIndex, pokemon });
  const closeModal = () => setModal(null);

  const handleNavigateToPokemon = (pokemon) => {
    const idx = allPokemon.findIndex(p => p.id === pokemon.id);
    if (idx === -1) return;
    goToPage(Math.floor(idx / (CARDS_PER_PAGE * 2)));
  };

  const handleSave = (cardData) => {
    setCard(modal.globalIndex, cardData);
    closeModal();
  };

  const handleRemove = () => {
    removeCard(modal.globalIndex);
    closeModal();
  };

  // Build spread dots — one dot per spread, active if either page has cards
  const fakeSpreadsForDots = Array.from({ length: totalSpreads }, (_, i) => {
    const leftPageIdx  = i * 2;
    const rightPageIdx = i * 2 + 1;
    const leftCards  = Array.from({ length: CARDS_PER_PAGE }, (_, j) =>
      cardOverrides[leftPageIdx  * CARDS_PER_PAGE + j] || null
    );
    const rightCards = Array.from({ length: CARDS_PER_PAGE }, (_, j) =>
      cardOverrides[rightPageIdx * CARDS_PER_PAGE + j] || null
    );
    return [...leftCards, ...rightCards];
  });

  // Loading screen
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div
          className="font-pixel text-pokeGold animate-pulse mx-auto"
          style={{ fontSize: '11px' }}
        >
          Loading Pokédex…
        </div>
        <div className="w-48 h-2 bg-pokeDark rounded-full overflow-hidden mx-auto">
          <div className="h-full progress-gradient animate-pulse rounded-full w-3/4" />
        </div>
        <p className="text-pokeGray-light text-xs">Fetching all Pokémon…</p>
      </div>
    </div>
  );

  // Error screen
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-400 font-bold text-sm">{error}</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-16">
      <Header
        totalCards={totalCards}
        totalPages={totalSpreads}
        totalSlots={totalSlots}
      />

      <Controls
        currentPage={currentPage}
        totalPages={totalSpreads}
        onPrev={() => goToPage(currentPage - 1)}
        onNext={() => goToPage(currentPage + 1)}
        filterMode={filterMode}
        onFilterChange={setFilterMode}
        allPokemon={allPokemon}
        onNavigate={handleNavigateToPokemon}
      />

      {/* Two-page spread */}
      <div className="flex gap-4">
        {[currentPage * 2, currentPage * 2 + 1].map((pageIdx) => {
          const entries = getPageEntries(pageIdx);
          if (!entries.length) return null;
          return (
            <div key={pageIdx} className="flex-1 min-w-0">
              <Binder
                pageEntries={entries}
                pageIndex={pageIdx}
                cardOverrides={cardOverrides}
                filterMode={filterMode}
                onSlotClick={openSlot}
                CARDS_PER_PAGE={CARDS_PER_PAGE}
              />
            </div>
          );
        })}
      </div>

      {/* Spread dots */}
      <PageDots
        pages={fakeSpreadsForDots}
        currentPage={currentPage}
        onGoTo={goToPage}
      />

      {/* Card modal */}
      {modal && (
        <CardModal
          slot={modal.globalIndex + 1}
          card={cardOverrides[modal.globalIndex] || null}
          pokemon={modal.pokemon}
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
