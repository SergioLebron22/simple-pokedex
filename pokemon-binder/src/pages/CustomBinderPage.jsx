import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Binder from '../components/Binder';
import PageDots from '../components/PageDots';
import CardModal from '../components/CardModal';
import EditBinderModal from '../components/EditBinderModal';
import { useCustomBinder } from '../hooks/useCustomBinder';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

const FILTER_OPTIONS = [
  { id: 'all',    label: 'All'    },
  { id: 'filled', label: 'Filled' },
  { id: 'empty',  label: 'Empty'  },
];

export default function CustomBinderPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { authFetch } = useAuth();

  const {
    binder,
    cardOverrides,
    currentPage,
    totalCards,
    setCard,
    removeCard,
    goToPage,
    updateBinderMeta,
    loading,
    error,
  } = useCustomBinder(id);

  const [filterMode,  setFilterMode]  = useState('all');
  const [modal,       setModal]       = useState(null); // { globalIndex }
  const [editModal,   setEditModal]   = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  if (loading) return (
    <>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <p className="text-pokeGold font-pixel animate-pulse" style={{ fontSize: '10px' }}>Loading…</p>
      </div>
    </>
  );

  if (error || !binder) return (
    <>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-4">
        <p className="text-red-400 text-sm">{error || 'Binder not found.'}</p>
        <button onClick={() => navigate('/binders')}
          className="text-xs text-pokeGray-light hover:text-white underline">
          ← Back to My Binders
        </button>
      </div>
    </>
  );

  const SLOTS_PER_PAGE = binder.grid_rows * binder.grid_cols;
  const totalSpreads   = Math.ceil(binder.page_count / 2);
  const clampedPage    = Math.min(currentPage, totalSpreads - 1);

  const getPageEntries = (pageIdx) => Array(SLOTS_PER_PAGE).fill(null);

  const fakeSpreadsForDots = Array.from({ length: totalSpreads }, (_, i) => {
    const left  = i * 2;
    const right = i * 2 + 1;
    return [
      ...Array.from({ length: SLOTS_PER_PAGE }, (_, j) => cardOverrides[left  * SLOTS_PER_PAGE + j] || null),
      ...Array.from({ length: SLOTS_PER_PAGE }, (_, j) => cardOverrides[right * SLOTS_PER_PAGE + j] || null),
    ];
  });

  const openSlot   = (globalIndex) => setModal({ globalIndex });
  const closeModal = () => setModal(null);

  const handleSave = (cardData) => {
    setCard(modal.globalIndex, cardData);
    closeModal();
  };

  const handleRemove = () => {
    removeCard(modal.globalIndex);
    closeModal();
  };

  const handleEditSave = async (formData) => {
    const res = await authFetch(apiUrl(`/api/binders/${id}/`), {
      method: 'PATCH',
      body:   JSON.stringify(formData),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(Object.values(d)[0]?.[0] || 'Failed to save.');
    }
    const updated = await res.json();
    updateBinderMeta(updated);
    setEditModal(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${binder.name}"? All cards will be lost.`)) return;
    setDeleting(true);
    await authFetch(apiUrl(`/api/binders/${id}/`), { method: 'DELETE' });
    navigate('/binders');
  };

  const totalSlots = SLOTS_PER_PAGE * binder.page_count;

  return (
    <>
      <NavBar />
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-16">

        {/* Header */}
        <header className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/binders')}
              className="text-pokeGray-light hover:text-white text-xs font-bold transition-colors">
              ← Binders
            </button>
            <div
              className="w-10 h-10 rounded-xl border-2 shrink-0"
              style={{ background: binder.bg_color, borderColor: binder.binder_color }}
            />
            <div>
              <h1 className="font-pixel text-white leading-relaxed" style={{ fontSize: '11px' }}>
                {binder.name}
              </h1>
              <p className="text-pokeGray-light text-xs mt-0.5">
                {binder.grid_cols}×{binder.grid_rows} · {binder.page_count} pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Cards',  value: totalCards },
              { label: 'Slots',  value: totalSlots },
              { label: 'Filled', value: `${totalSlots ? Math.round((totalCards / totalSlots) * 100) : 0}%` },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-bold">
                {label}: <span className="text-pokeGold">{value}</span>
              </div>
            ))}
            <button
              onClick={() => setEditModal(true)}
              className="bg-white/10 border border-white/15 hover:bg-white/20 text-white
                         font-bold py-1.5 px-3 rounded-xl text-xs transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-900/30 border border-red-700/40 hover:bg-red-800/50
                         text-red-400 font-bold py-1.5 px-3 rounded-xl text-xs transition-colors
                         disabled:opacity-50"
            >
              Delete
            </button>
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
        </div>

        {/* Two-page spread */}
        <div className="flex flex-col md:flex-row gap-4">
          {[clampedPage * 2, clampedPage * 2 + 1].map((pageIdx) => {
            if (pageIdx >= binder.page_count) return null;
            return (
              <div key={pageIdx} className="flex-1 min-w-0">
                <Binder
                  pageEntries={getPageEntries(pageIdx)}
                  pageIndex={pageIdx}
                  cardOverrides={cardOverrides}
                  filterMode={filterMode}
                  onSlotClick={openSlot}
                  CARDS_PER_PAGE={SLOTS_PER_PAGE}
                  gridCols={binder.grid_cols}
                  spineLabel={binder.name.toUpperCase()}
                  binderBgColor={binder.bg_color}
                  binderBorderColor={binder.binder_color}
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
          onSave={handleSave}
          onRemove={handleRemove}
          onClose={closeModal}
        />
      )}

      {editModal && (
        <EditBinderModal
          binder={binder}
          onSave={handleEditSave}
          onClose={() => setEditModal(false)}
        />
      )}
    </>
  );
}
