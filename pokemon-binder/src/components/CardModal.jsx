import { useState, useEffect } from 'react';
import { useTCGSearch } from '../hooks/useTCGSearch';
import PokedexPanel from './PokedexPanel';
import EvolutionPanel from './EvolutionPanel';
import PokemonInfoTabs from './PokemonInfoTabs';

function derivePokemonName(cardName) {
  if (!cardName) return '';
  return cardName.split(' ')[0].toLowerCase();
}

const VARIANT_LABELS = {
  normal: 'Normal',
  holofoil: 'Holofoil',
  reverseHolofoil: 'Reverse Holo',
  '1stEditionHolofoil': '1st Ed. Holo',
  '1stEditionNormal': '1st Ed.',
  unlimitedHolofoil: 'Unlimited Holo',
};

function CardInfoPanel({ card }) {
  const [priceData, setPriceData] = useState(null);
  const [cardMeta, setCardMeta]   = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    setPriceData(null);
    setCardMeta(null);
    if (!card?.tcgCardId) return;
    setPriceLoading(true);
    fetch(`https://api.pokemontcg.io/v2/cards/${card.tcgCardId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.data) return;
        const c = data.data;
        setCardMeta({ rarity: c.rarity, hp: c.hp, types: c.types, number: c.number, set: c.set?.name });
        if (c.tcgplayer?.prices) setPriceData(c.tcgplayer.prices);
      })
      .catch(() => {})
      .finally(() => setPriceLoading(false));
  }, [card?.tcgCardId]);

  const priceEntries = priceData
    ? Object.entries(priceData).filter(([, p]) => p?.market != null)
    : [];

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="space-y-1.5">
        <p className="text-white font-extrabold text-sm capitalize leading-tight">{card?.name}</p>
        <p className="text-pokeGray-light text-[11px]">{cardMeta?.set || card?.tcgSet}</p>
        {(cardMeta?.number || card?.tcgLocalId) && (
          <p className="text-pokeGray-light text-[11px]">#{cardMeta?.number || card?.tcgLocalId}</p>
        )}
        {cardMeta?.rarity && (
          <span className="inline-block bg-pokeDark-card border border-white/10 text-pokeGold
                           text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {cardMeta.rarity}
          </span>
        )}
        {cardMeta?.hp && (
          <p className="text-pokeGray-light text-[11px]">
            HP: <span className="text-white font-bold">{cardMeta.hp}</span>
          </p>
        )}
        {cardMeta?.types?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {cardMeta.types.map(t => (
              <span key={t}
                className="bg-orange-500/20 border border-orange-500/40 text-orange-300
                           text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {card?.notes && (
        <p className="text-pokeGray-light text-[11px] italic bg-pokeDark-card rounded-lg
                      px-2 py-1.5 border border-white/5">
          {card.notes}
        </p>
      )}

      <div>
        <p className="text-[10px] font-bold text-pokeGray-light mb-2 uppercase tracking-wider">
          Market Price
        </p>
        {priceLoading && (
          <p className="text-xs text-pokeGray-light animate-pulse">Loading prices…</p>
        )}
        {!priceLoading && priceEntries.length > 0 ? (
          <div className="space-y-2">
            {priceEntries.map(([variant, p]) => (
              <div key={variant}
                className="bg-pokeDark-card rounded-xl p-2.5 border border-white/5">
                <p className="text-pokeGray-light text-[10px] mb-0.5">
                  {VARIANT_LABELS[variant] || variant}
                </p>
                <p className="text-pokeGold font-extrabold text-base">${p.market.toFixed(2)}</p>
                <p className="text-pokeGray-light text-[10px]">
                  Low ${p.low?.toFixed(2)} · High ${p.high?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : !priceLoading && (
          <a
            href={`https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card?.name || '')}&view=grid`}
            target="_blank"
            rel="noreferrer"
            className="block bg-pokeDark-card rounded-xl p-2.5 border border-white/5
                       text-pokeGold text-[11px] text-center hover:border-pokeGold/30 transition-colors"
          >
            Check price on TCGPlayer →
          </a>
        )}
      </div>
    </div>
  );
}

function toSearchQuery(name) {
  if (!name) return '';
  const base = name.split('-')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export default function CardModal({ slot, card, pokemon, onSave, onRemove, onClose, onToggleOwned }) {
  const defaultQuery = toSearchQuery(card?.name || pokemon?.name || '');

  const [nameOverride, setNameOverride] = useState(card?.name || '');
  const [selected, setSelected]         = useState(null);
  const [notes, setNotes]               = useState(card?.notes || '');
  const [view, setView]                 = useState(card ? 'info' : 'edit');
  const [nameQuery, setNameQuery]       = useState(defaultQuery);
  const [idFilter, setIdFilter]         = useState('');

  const { results, loading, error, search, clearResults } = useTCGSearch();

  useEffect(() => {
    const q = toSearchQuery(card?.name || pokemon?.name || '');
    setNameOverride(card?.name || '');
    setSelected(null);
    setNotes(card?.notes || '');
    setView(card ? 'info' : 'edit');
    setNameQuery(q);
    setIdFilter('');
    clearResults();
  }, [card, slot, clearResults, pokemon?.name]);

  useEffect(() => {
    const t = setTimeout(() => search(nameQuery), 400);
    return () => clearTimeout(t);
  }, [nameQuery, search]);

  const filteredResults = idFilter.trim()
    ? results.filter(c => c.localId?.toLowerCase().includes(idFilter.trim().toLowerCase()))
    : results;

  const handleCardClick = (tcgCard) => {
    setSelected({
      name:       tcgCard.name,
      tcgImage:   tcgCard.image ? `${tcgCard.image}/high.webp` : '',
      tcgSet:     tcgCard.set?.name  || '',
      tcgCardId:  tcgCard.id         || '',
      tcgLocalId: tcgCard.localId    || '',
    });
    setNameOverride(tcgCard.name);
  };

  const handleSave = () => {
    const name = nameOverride.trim() || card?.name || '';
    if (!name) return;
    onSave({
      name,
      tcgImage:   selected?.tcgImage   ?? card?.tcgImage   ?? '',
      tcgSet:     selected?.tcgSet     ?? card?.tcgSet     ?? '',
      tcgCardId:  selected?.tcgCardId  ?? card?.tcgCardId  ?? '',
      tcgLocalId: selected?.tcgLocalId ?? card?.tcgLocalId ?? '',
      notes:      notes.trim(),
      owned:      card?.owned          ?? true,
    });
  };

  const pokemonName = derivePokemonName(card?.name || pokemon?.name || '');

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-[5px] animate-fadeIn"
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-4 py-6 px-3 sm:px-5">

      <div
        className={`w-full rounded-2xl border border-[#555577] p-4 sm:p-6
                   shadow-[0_30px_80px_rgba(0,0,0,0.85)] animate-slideUp
                   ${view === 'info' ? 'max-w-5xl' : 'max-w-4xl'}`}
        style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-pixel text-pokeGold" style={{ fontSize: '10px' }}>
            Slot #{slot}
          </h2>
          <div className="flex gap-2 items-center">
            {card && onToggleOwned && (
              <button
                onClick={onToggleOwned}
                className={`text-xs font-bold px-2 py-1 rounded-lg border transition-colors
                  ${card.owned === false
                    ? 'bg-red-800 border-red-600 text-red-100 hover:bg-red-700'
                    : 'bg-green-800 border-green-600 text-green-200 hover:bg-green-700'
                  }`}
              >
                {card.owned === false ? '? Missing' : '✓ Owned'}
              </button>
            )}
            {card && (
              <>
                <button
                  onClick={() => setView('info')}
                  className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors
                    ${view === 'info' ? 'bg-pokeRed text-white' : 'bg-white/10 text-white'}`}
                >
                  Info
                </button>
                <button
                  onClick={() => setView('edit')}
                  className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors
                    ${view === 'edit' ? 'bg-pokeRed text-white' : 'bg-white/10 text-white'}`}
                >
                  Edit
                </button>
              </>
            )}
            <button onClick={onClose}
              className="bg-white/10 text-white w-8 h-8 rounded-lg text-lg hover:bg-white/20">
              ×
            </button>
          </div>
        </div>

        {view === 'edit' ? (
          <div className="space-y-4">
            {/* Search inputs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1">
                  Search by Name
                </label>
                <input
                  type="text"
                  value={nameQuery}
                  onChange={e => setNameQuery(e.target.value)}
                  placeholder="e.g. Charizard, Pikachu…"
                  className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                             text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                             outline-none transition-colors"
                />
              </div>
              <div className="w-full sm:w-36">
                <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1">
                  Filter by Local ID
                </label>
                <input
                  type="text"
                  value={idFilter}
                  onChange={e => setIdFilter(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                             text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                             outline-none transition-colors"
                />
              </div>
            </div>

            {loading && <p className="text-xs text-pokeGray-light animate-pulse">Searching…</p>}
            {error   && <p className="text-xs text-red-400">{error}</p>}

            {/* Card grid */}
            {filteredResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
                {filteredResults.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleCardClick(c)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all
                      ${selected?.tcgCardId === c.id
                        ? 'border-pokeGold bg-pokeGold/10 scale-105 shadow-[0_0_12px_rgba(255,215,0,0.3)]'
                        : 'border-white/10 bg-pokeDark-card hover:border-white/30 hover:scale-[1.02]'
                      }`}
                  >
                    {c.image ? (
                      <img
                        src={`${c.image}/low.webp`}
                        alt={c.name}
                        className="w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-full aspect-[5/7] bg-pokeDark rounded-lg flex items-center
                                      justify-center opacity-25 text-2xl">🎴</div>
                    )}
                    <p className="text-white text-[9px] font-bold text-center leading-tight w-full truncate">
                      {c.name}
                    </p>
                    <p className="text-pokeGray-light text-[8px] text-center w-full truncate">
                      {c.set?.name} · #{c.localId}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Name, notes, actions */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={nameOverride}
                    onChange={e => setNameOverride(e.target.value)}
                    placeholder="Auto-filled from selection"
                    className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                               text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                               outline-none transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Holo, NM condition"
                    className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                               text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                               outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave}
                  className="flex-1 bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                             py-2.5 rounded-xl text-sm transition-colors">
                  💾 Save
                </button>
                {card && (
                  <button onClick={onRemove}
                    className="bg-red-900/30 border border-red-700/40 hover:bg-red-800/50
                               text-red-400 font-bold py-2.5 px-4 rounded-xl text-sm">
                    🗑
                  </button>
                )}
                <button onClick={onClose}
                  className="bg-white/10 border border-white/15 hover:bg-white/20
                             text-white font-bold py-2.5 px-4 rounded-xl text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Info view: stacks on mobile, 3-column on md+ */
          <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-8 items-start">
            {/* Card image — first on mobile (order-1), center column on desktop (md:order-2) */}
            <div className="flex flex-col items-center w-full order-1 md:order-2">
              {card?.tcgImage ? (
                <img
                  src={card.tcgImage}
                  alt={card.name}
                  className="h-60 sm:h-80 w-auto rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] object-contain"
                />
              ) : (
                <div className="h-60 sm:h-80 w-44 sm:w-56 bg-pokeDark-card border border-white/10 rounded-xl
                                flex items-center justify-center text-6xl opacity-25">🎴</div>
              )}
            </div>

            {/* Card info + price — second on mobile, left column on desktop (md:order-1) */}
            <div className="order-2 md:order-1 min-w-0">
              <CardInfoPanel card={card} />
            </div>

            {/* Pokédex panel — third on mobile and desktop */}
            <div className="order-3 min-w-0">
              <PokedexPanel pokemonName={pokemon?.name} />
            </div>
          </div>
        )}
      </div>

      {view === 'info' && card && (
        <div className="w-full max-w-5xl mx-auto space-y-4" onClick={e => e.stopPropagation()}>
          <EvolutionPanel pokemonName={pokemonName} />
          <PokemonInfoTabs pokemonName={pokemonName} />
        </div>
      )}

      </div>
    </div>
  );
}
