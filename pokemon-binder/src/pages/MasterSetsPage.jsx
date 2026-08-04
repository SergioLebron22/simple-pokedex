import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useMasterSets } from '../hooks/useMasterSets';

const SORT_STORAGE_KEY = 'pb_mastersets_sort';

const SORT_OPTIONS = [
  { id: 'name-asc',      label: 'Name (A–Z)' },
  { id: 'name-desc',     label: 'Name (Z–A)' },
  { id: 'release-desc',  label: 'Newest to Oldest' },
  { id: 'release-asc',   label: 'Oldest to Newest' },
  { id: 'progress-desc', label: 'Most Complete' },
  { id: 'progress-asc',  label: 'Least Complete' },
  { id: 'cards-desc',    label: 'Most Cards' },
  { id: 'cards-asc',     label: 'Fewest Cards' },
];

function progressOf(set) {
  return set.totalCards ? set.ownedCount / set.totalCards : 0;
}

// Oldest-first comparator; sets with an unknown release date sort last.
function compareRelease(a, b) {
  if (a.releaseDate && b.releaseDate) {
    if (a.releaseDate !== b.releaseDate) return a.releaseDate < b.releaseDate ? -1 : 1;
    return a.seriesOrder - b.seriesOrder;
  }
  if (a.releaseDate) return -1;
  if (b.releaseDate) return 1;
  return a.name.localeCompare(b.name);
}

function sortSets(sets, sortBy) {
  const sorted = [...sets];
  switch (sortBy) {
    case 'name-desc':     return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'release-desc':  return sorted.sort((a, b) => compareRelease(b, a));
    case 'release-asc':   return sorted.sort((a, b) => compareRelease(a, b));
    case 'progress-desc': return sorted.sort((a, b) => progressOf(b) - progressOf(a));
    case 'progress-asc':  return sorted.sort((a, b) => progressOf(a) - progressOf(b));
    case 'cards-desc':    return sorted.sort((a, b) => b.totalCards - a.totalCards);
    case 'cards-asc':     return sorted.sort((a, b) => a.totalCards - b.totalCards);
    case 'name-asc':
    default:              return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function loadSavedSort() {
  try {
    const saved = localStorage.getItem(SORT_STORAGE_KEY);
    return SORT_OPTIONS.some(o => o.id === saved) ? saved : 'name-asc';
  } catch {
    return 'name-asc';
  }
}

function SetBinderCard({ set, onClick }) {
  const pct = set.totalCards ? Math.round((set.ownedCount / set.totalCards) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 overflow-hidden
                 hover:border-white/25 hover:-translate-y-1 transition-all duration-200
                 shadow-[0_4px_20px_rgba(0,0,0,0.4)] bg-pokeDark-mid"
    >
      <div className="h-24 bg-white/95 flex items-center justify-center p-4">
        {set.logo ? (
          <img
            src={`${set.logo}.png`}
            alt={set.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-3xl opacity-30">🎴</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-extrabold text-sm mb-2 truncate">{set.name}</h3>
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-pokeGray-light text-[11px]"
            title={set.totalCardsExact ? undefined : 'Includes holo/reverse-holo variants once you open this set'}
          >
            {set.ownedCount} / {set.totalCardsExact ? '' : '~'}{set.totalCards} owned
          </span>
          <span className="text-pokeGold text-[11px] font-bold">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-pokeGold rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MasterSetsPage() {
  const navigate       = useNavigate();
  const { sets, loading, error } = useMasterSets();
  const [query,  setQuery]  = useState('');
  const [sortBy, setSortBy] = useState(loadSavedSort);

  const handleSortChange = (id) => {
    setSortBy(id);
    try { localStorage.setItem(SORT_STORAGE_KEY, id); } catch {}
  };

  const filteredSets = query.trim()
    ? sets.filter(s => s.name.toLowerCase().includes(query.trim().toLowerCase()))
    : sets;
  const visibleSets = sortSets(filteredSets, sortBy);

  return (
    <>
      <NavBar />
      <div className="max-w-6xl mx-auto px-5 pt-8 pb-16">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 className="font-pixel text-white mb-1" style={{ fontSize: '12px' }}>Master Sets</h1>
            <p className="text-pokeGray-light text-xs">{sets.length} sets</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search sets…"
              className="flex-1 sm:w-56 bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                         text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                         outline-none transition-colors"
            />
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value)}
              className="bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                         text-white px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            >
              {SORT_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-pokeGray-light text-sm animate-pulse">
            Loading sets…
          </div>
        )}
        {error && (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && visibleSets.length === 0 && (
          <div className="text-center py-20 text-pokeGray-light text-sm">
            No sets match "{query}".
          </div>
        )}
        {!loading && !error && visibleSets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleSets.map(set => (
              <SetBinderCard
                key={set.id}
                set={set}
                onClick={() => navigate(`/mastersets/${set.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
