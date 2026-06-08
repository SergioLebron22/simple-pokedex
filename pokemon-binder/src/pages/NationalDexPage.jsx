import { useState } from 'react';
import { usePokedexList }       from '../hooks/usePokedexList';
import { useNationalDexBinder } from '../hooks/useNationalDexBinder';
import NavBar    from '../components/NavBar';
import Header    from '../components/Header';
import Controls  from '../components/Controls';
import Binder    from '../components/Binder';
import PageDots  from '../components/PageDots';
import CardModal from '../components/CardModal';

const CARDS_PER_PAGE = 20;

export default function NationalDexPage() {
  const { allPokemon, getPageEntries, loading: dexLoading, error: dexError } = usePokedexList();
  const {
    cardOverrides,
    currentPage,
    totalCards,
    setCard,
    removeCard,
    goToPage,
    loading: binderLoading,
    error:   binderError,
  } = useNationalDexBinder();

  const [filterMode, setFilterMode] = useState('all');
  const [modal,      setModal]      = useState(null);

  const totalSpreads = Math.ceil(allPokemon.length / CARDS_PER_PAGE / 2);

  const openSlot   = (globalIndex, pokemon) => setModal({ globalIndex, pokemon });
  const closeModal = () => setModal(null);

  const handleNavigateToPokemon = (pokemon) => {
    const idx = allPokemon.findIndex(p => p.id === pokemon.id);
    if (idx === -1) return;
    goToPage(Math.floor(idx / (CARDS_PER_PAGE * 2)));
  };

  const handleSave = (cardData) => { setCard(modal.pokemon.name, cardData); closeModal(); };
  const handleRemove = () => { removeCard(modal.pokemon.name); closeModal(); };

  const fakeSpreadsForDots = Array.from({ length: totalSpreads }, (_, i) => {
    const lp = i * 2, rp = i * 2 + 1;
    return [
      ...getPageEntries(lp).map(p => cardOverrides[p.name] || null),
      ...getPageEntries(rp).map(p => cardOverrides[p.name] || null),
    ];
  });

  const safeGoToPage = (page) => goToPage(Math.min(Math.max(0, page), totalSpreads - 1));

  if (dexLoading || binderLoading) return (
    <>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <div className="text-center space-y-4">
          <div className="font-pixel text-pokeGold animate-pulse" style={{ fontSize: '11px' }}>
            Loading Pokédex…
          </div>
          <div className="w-48 h-2 bg-pokeDark rounded-full overflow-hidden mx-auto">
            <div className="h-full progress-gradient animate-pulse rounded-full w-3/4" />
          </div>
          <p className="text-pokeGray-light text-xs">Fetching all Pokémon…</p>
        </div>
      </div>
    </>
  );

  if (dexError || binderError) return (
    <>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <p className="text-red-400 font-bold text-sm">{dexError || binderError}</p>
      </div>
    </>
  );

  return (
    <>
      <NavBar />
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-16">
        <Header
          totalCards={totalCards}
          totalPages={totalSpreads}
          totalSlots={allPokemon.length}
        />

        <Controls
          currentPage={currentPage}
          totalPages={totalSpreads}
          onPrev={() => safeGoToPage(currentPage - 1)}
          onNext={() => safeGoToPage(currentPage + 1)}
          filterMode={filterMode}
          onFilterChange={setFilterMode}
          allPokemon={allPokemon}
          onNavigate={handleNavigateToPokemon}
        />

        <div className="flex flex-col md:flex-row gap-4">
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

        <PageDots
          pages={fakeSpreadsForDots}
          currentPage={currentPage}
          onGoTo={safeGoToPage}
        />

        {modal && (
          <CardModal
            slot={modal.globalIndex + 1}
            card={cardOverrides[modal.pokemon.name] || null}
            pokemon={modal.pokemon}
            onSave={handleSave}
            onRemove={handleRemove}
            onClose={closeModal}
            showPokedexInfo
          />
        )}
      </div>
    </>
  );
}
