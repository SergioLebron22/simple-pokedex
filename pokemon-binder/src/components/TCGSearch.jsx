import { useState, useEffect } from 'react';
import { useTCGSearch } from '../hooks/useTCGSearch';

export default function TCGSearch({ onSelect }) {
  const [query, setQuery]     = useState('');
  const { results, loading, error, search, clearResults } = useTCGSearch();

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div>
      <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1">
        Search TCG Card
      </label>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. Charizard, Pikachu…"
        className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                   text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                   outline-none transition-colors"
      />

      {loading && (
        <p className="text-xs text-pokeGray-light mt-2 animate-pulse">Searching…</p>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[#333355]
                        bg-pokeDark-card divide-y divide-white/5">
          {results.map(card => (
            <button
              key={card.id}
              onClick={() => { onSelect(card); clearResults(); setQuery(''); }}
              className="w-full flex items-center gap-3 px-3 py-2
                         hover:bg-white/10 transition-colors text-left"
            >
              {card.image && (
                <img
                  src={card.image ? `${card.image}/low.webp` : ''}
                  alt={card.name}
                  className="h-12 rounded"
                  style={{ imageRendering: 'pixelated' }}
                />
              )}
              <div>
                <p className="text-white text-xs font-bold">{card.name}</p>
                <p className="text-pokeGray-light text-[10px]">
                  {card.set?.name} · #{card.localId}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}