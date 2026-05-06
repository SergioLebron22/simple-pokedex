import { useState, useEffect, useRef } from 'react';

function formatName(name) {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function PokemonSearch({ allPokemon, onNavigate }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const matched = allPokemon
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 10);
    setResults(matched);
    setOpen(matched.length > 0);
  }, [query, allPokemon]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (pokemon) => {
    onNavigate(pokemon);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="🔍 Find Pokémon…"
        className="bg-white/[0.07] border border-white/[0.13] text-white placeholder-gray-400
                   px-3.5 py-2 rounded-xl text-sm outline-none w-full sm:min-w-[180px]
                   focus:border-pokeRed-light transition-colors"
      />

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-full sm:w-64 rounded-xl border border-[#333355]
                     bg-[#1e1e2e] shadow-[0_8px_32px_rgba(0,0,0,0.7)] z-50
                     overflow-hidden divide-y divide-white/5"
        >
          {results.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5
                         hover:bg-white/10 transition-colors text-left"
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                alt={p.name}
                className="w-8 h-8 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-white text-xs font-bold capitalize">
                {formatName(p.name)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Controls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  filterMode,
  onFilterChange,
  allPokemon,
  onNavigate,
}) {
  const filters = [
    { id: 'all',    label: 'All'    },
    { id: 'filled', label: 'Filled' },
    { id: 'empty',  label: 'Empty'  },
  ];

  return (
    <div className="flex gap-2 mb-5 flex-wrap items-center">
      {/* Page navigation */}
      <div className="flex items-center gap-2.5 bg-white/[0.07] border border-white/[0.13] rounded-xl px-3.5 py-2 backdrop-blur-sm">
        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          className="bg-pokeRed text-white w-8 h-8 rounded-lg text-lg font-black leading-none
                     flex items-center justify-center
                     hover:bg-pokeRed-dark hover:scale-110 active:scale-95
                     disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                     transition-all duration-150"
        >
          ‹
        </button>
        <span className="font-pixel text-pokeGold" style={{ fontSize: '8px' }}>
          SPREAD {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages - 1}
          className="bg-pokeRed text-white w-8 h-8 rounded-lg text-lg font-black leading-none
                     flex items-center justify-center
                     hover:bg-pokeRed-dark hover:scale-110 active:scale-95
                     disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                     transition-all duration-150"
        >
          ›
        </button>
      </div>

      {/* Filters */}
      {filters.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onFilterChange(id)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors
            ${filterMode === id
              ? 'bg-pokeRed border-pokeRed-light text-white'
              : 'bg-white/[0.07] border-white/[0.13] text-white hover:bg-white/[0.14]'
            }`}
        >
          {label}
        </button>
      ))}

      {/* Pokemon search → navigate */}
      <div className="flex-1 min-w-0 sm:flex-none">
        <PokemonSearch allPokemon={allPokemon} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
