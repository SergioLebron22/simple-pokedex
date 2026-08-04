import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Binder from '../components/Binder';
import PageDots from '../components/PageDots';
import CardModal from '../components/CardModal';
import { useMasterSetBinder } from '../hooks/useMasterSetBinder';

const SLOTS_PER_PAGE = 12; // 4 cols x 3 rows

const FILTER_OPTIONS = [
  { id: 'all',     label: 'All'     },
  { id: 'owned',   label: 'Owned'   },
  { id: 'missing', label: 'Missing' },
];

function CardSearch({ cardOverrides, onNavigate }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.trim().toLowerCase();
    const matched = Object.entries(cardOverrides)
      .filter(([, card]) => card?.name?.toLowerCase().includes(q))
      .slice(0, 10)
      .map(([globalIndex, card]) => ({ globalIndex: parseInt(globalIndex, 10), card }));
    setResults(matched);
    setOpen(matched.length > 0);
  }, [query, cardOverrides]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = ({ globalIndex }) => {
    onNavigate(globalIndex);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[10rem] max-w-xs">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="🔍 Search cards…"
        className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                   text-white placeholder-gray-500 px-3 py-2 rounded-xl text-sm
                   outline-none transition-colors"
      />

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full sm:w-72 rounded-xl border border-[#333355]
                     bg-[#1e1e2e] shadow-[0_8px_32px_rgba(0,0,0,0.7)] z-50
                     overflow-hidden divide-y divide-white/5 max-h-80 overflow-y-auto"
        >
          {results.map(({ globalIndex, card }) => (
            <button
              key={globalIndex}
              onClick={() => handleSelect({ globalIndex })}
              className="w-full flex items-center gap-2.5 px-3 py-1.5
                         hover:bg-white/10 transition-colors text-left"
            >
              {card.tcgImage ? (
                <img
                  src={card.tcgImage}
                  alt={card.name}
                  className="w-8 h-11 object-contain rounded"
                />
              ) : (
                <span className="w-8 h-11 flex items-center justify-center text-sm opacity-30">🎴</span>
              )}
              <span className="text-white text-xs font-bold truncate">
                {card.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MasterSetBinderPage() {
  const { setId }   = useParams();
  const navigate    = useNavigate();

  const {
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
  } = useMasterSetBinder(setId);

  const [filterMode, setFilterMode] = useState('all');
  const [modal,      setModal]      = useState(null); // { globalIndex }

  if (loading) return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-2">
        <p className="text-pokeGold font-pixel animate-pulse" style={{ fontSize: '10px' }}>Loading…</p>
        {loadingProgress.total > 0 && (
          <p className="text-pokeGray-light text-xs">
            Checking print variants ({loadingProgress.done} / {loadingProgress.total})
          </p>
        )}
      </div>
    </>
  );

  if (error || !setMeta) return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-4">
        <p className="text-red-400 text-sm">{error || 'Set not found.'}</p>
        <button onClick={() => navigate('/mastersets')}
          className="text-xs text-pokeGray-light hover:text-white underline">
          ← Back to Master Sets
        </button>
      </div>
    </>
  );

  const pageCount    = Math.max(1, Math.ceil(totalSlots / SLOTS_PER_PAGE));
  const totalSpreads = Math.max(1, Math.ceil(pageCount / 2));
  const clampedPage  = Math.min(currentPage, totalSpreads - 1);

  const getPageEntries = () => Array(SLOTS_PER_PAGE).fill(null);

  const fakeSpreadsForDots = Array.from({ length: totalSpreads }, (_, i) => {
    const left  = i * 2;
    const right = i * 2 + 1;
    return [
      ...Array.from({ length: SLOTS_PER_PAGE }, (_, j) => cardOverrides[left  * SLOTS_PER_PAGE + j] || null),
      ...Array.from({ length: SLOTS_PER_PAGE }, (_, j) => cardOverrides[right * SLOTS_PER_PAGE + j] || null),
    ];
  });

  const openSlot = (globalIndex) => {
    if (globalIndex >= totalSlots) return;
    setModal({ globalIndex });
  };
  const closeModal = () => setModal(null);

  const navigateSlot = (delta) => {
    setModal(prev => {
      if (!prev) return prev;
      const nextIndex = prev.globalIndex + delta;
      if (nextIndex < 0 || nextIndex >= totalSlots) return prev;
      const spreadIdx = Math.floor(nextIndex / SLOTS_PER_PAGE / 2);
      if (spreadIdx !== clampedPage) goToPage(spreadIdx);
      return { globalIndex: nextIndex };
    });
  };

  const navigateToSlot = (globalIndex) => {
    goToPage(Math.floor(globalIndex / SLOTS_PER_PAGE / 2));
  };

  const pct = totalSlots ? Math.round((ownedCount / totalSlots) * 100) : 0;

  return (
    <>
      <NavBar />
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-16">

        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/mastersets')}
              className="text-pokeGray-light hover:text-white text-xs font-bold transition-colors">
              ← Master Sets
            </button>
            <div
              className="w-10 h-10 rounded-xl border-2 border-white/15 shrink-0 bg-white/95
                         flex items-center justify-center overflow-hidden"
            >
              {setMeta.logo ? (
                <img src={`${setMeta.logo}.png`} alt={setMeta.name} className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-sm opacity-30">🎴</span>
              )}
            </div>
            <div>
              <h1 className="font-pixel text-white leading-relaxed" style={{ fontSize: '11px' }}>
                {setMeta.name}
              </h1>
              <p className="text-pokeGray-light text-xs mt-0.5">
                {totalSlots} cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Owned', value: ownedCount },
              { label: 'Total', value: totalSlots },
              { label: '%',     value: `${pct}%` },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-bold">
                {label}: <span className="text-pokeGold">{value}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Controls */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          <div className="flex items-center gap-2.5 bg-white/[0.07] border border-white/[0.13] rounded-xl px-3.5 py-2 backdrop-blur-sm">
            <button
              onClick={() => goToPage(clampedPage - 1)}
              disabled={clampedPage === 0}
              className="bg-pokeRed text-white w-8 h-8 rounded-lg text-lg font-black flex items-center justify-center
                         hover:bg-pokeRed-dark hover:scale-110 active:scale-95
                         disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-150"
            >‹</button>
            <span className="font-pixel text-pokeGold" style={{ fontSize: '8px' }}>
              SPREAD {clampedPage + 1} / {totalSpreads}
            </span>
            <button
              onClick={() => goToPage(clampedPage + 1)}
              disabled={clampedPage >= totalSpreads - 1}
              className="bg-pokeRed text-white w-8 h-8 rounded-lg text-lg font-black flex items-center justify-center
                         hover:bg-pokeRed-dark hover:scale-110 active:scale-95
                         disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-150"
            >›</button>
          </div>

          {FILTER_OPTIONS.map(({ id: fid, label }) => (
            <button
              key={fid}
              onClick={() => setFilterMode(fid)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors
                ${filterMode === fid
                  ? 'bg-pokeRed border-pokeRed-light text-white'
                  : 'bg-white/[0.07] border-white/[0.13] text-white hover:bg-white/[0.14]'
                }`}
            >
              {label}
            </button>
          ))}

          <CardSearch cardOverrides={cardOverrides} onNavigate={navigateToSlot} />
        </div>

        {/* Two-page spread */}
        <div className="flex flex-col md:flex-row gap-4">
          {[clampedPage * 2, clampedPage * 2 + 1].map((pageIdx) => {
            if (pageIdx >= pageCount) return null;
            return (
              <div key={pageIdx} className="flex-1 min-w-0">
                <Binder
                  pageEntries={getPageEntries()}
                  pageIndex={pageIdx}
                  cardOverrides={cardOverrides}
                  filterMode={filterMode}
                  progressMode="owned"
                  onSlotClick={openSlot}
                  CARDS_PER_PAGE={SLOTS_PER_PAGE}
                  gridCols={4}
                  spineLabel={setMeta.name.toUpperCase()}
                  onToggleOwned={toggleOwned}
                />
              </div>
            );
          })}
        </div>

        <PageDots
          pages={fakeSpreadsForDots}
          currentPage={clampedPage}
          onGoTo={goToPage}
        />
      </div>

      {modal && (
        <CardModal
          slot={modal.globalIndex + 1}
          card={cardOverrides[modal.globalIndex] || null}
          pokemon={null}
          onClose={closeModal}
          onToggleOwned={() => toggleOwned(modal.globalIndex)}
          onPrev={modal.globalIndex > 0 ? () => navigateSlot(-1) : undefined}
          onNext={modal.globalIndex < totalSlots - 1 ? () => navigateSlot(1) : undefined}
          editable={false}
        />
      )}

      {saveError && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70]
                        bg-red-900/90 border border-red-700 text-red-100 text-xs font-bold
                        px-4 py-2.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          {saveError}
        </div>
      )}
    </>
  );
}
