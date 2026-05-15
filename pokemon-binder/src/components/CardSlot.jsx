import { useState } from 'react';

export default function CardSlot({ pokemon, card, slotNumber, onClick, onToggleOwned }) {
  const [imgError, setImgError] = useState(false);

  // Official artwork URL — works for base + most forms
  const spriteUrl = pokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.name}.png`
    : null;

  // Fallback to standard sprite for forms that lack official artwork
  const fallbackUrl = pokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
    : null;

  const displayImage = card?.tcgImage || (!imgError ? spriteUrl : fallbackUrl);

  const isTCG     = !!card?.tcgImage;
  const hasAnything = !!pokemon || !!card;

  return (
    <div
      onClick={onClick}
      title={card?.name || pokemon?.name || `Slot ${slotNumber}`}
      className={`
        relative cursor-pointer rounded-[10px] border-2 overflow-hidden
        flex items-center justify-center flex-col select-none
        transition-all duration-200 hover:-translate-y-1 hover:scale-[1.04] hover:z-10
        ${isTCG
          ? 'border-pokeGold hover:border-yellow-300 hover:shadow-[0_10px_28px_rgba(255,215,0,0.35)]'
          : card
            ? 'border-[#555577] hover:border-pokeRed-light hover:shadow-[0_10px_28px_rgba(230,57,70,0.35)]'
            : 'border-[#2a2a3a] hover:border-gray-500 hover:shadow-[0_10px_28px_rgba(0,0,0,0.55)]'
        }
      `}
      style={{ aspectRatio: '2.5 / 3.5', background: '#0d0d1a' }}
    >
      {/* Slot number */}
      <span className="absolute top-[5px] left-[6px] text-[7px] font-extrabold text-white/20 z-10 pointer-events-none">
        #{slotNumber}
      </span>

      {/* TCG assigned badge */}
      {isTCG && (
        <div className="absolute top-[5px] right-[5px] w-3 h-3 bg-pokeGold rounded-full
                        border-2 border-white shadow z-10" />
      )}

      {hasAnything ? (
        <div className="w-full h-full flex items-center justify-center relative">
          {displayImage ? (
            <img
              src={displayImage}
              alt={card?.name || pokemon?.name}
              onError={() => setImgError(true)}
              className={`object-contain ${isTCG ? 'w-full h-full rounded-lg' : 'w-[80%] h-[80%]'}`}
              style={{
                imageRendering: isTCG ? 'auto' : 'pixelated',
                filter: card?.owned === false ? 'grayscale(100%)' : 'none',
              }}
            />
          ) : (
            <span className="text-2xl opacity-30">❓</span>
          )}

          {/* Owned / missing toggle button */}
          {card && onToggleOwned && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleOwned(); }}
              title={card.owned === false ? 'Mark as owned' : 'Mark as missing'}
              className={`absolute bottom-[22px] right-[4px] w-5 h-5 rounded-full z-20
                          flex items-center justify-center text-[9px] font-black
                          border shadow transition-colors
                          ${card.owned === false
                            ? 'bg-red-700 border-red-500 text-white hover:bg-red-600'
                            : 'bg-green-700 border-green-500 text-white hover:bg-green-600'
                          }`}
            >
              {card.owned === false ? '?' : '✓'}
            </button>
          )}

          {/* Name label */}
          <div className="absolute bottom-0 left-0 right-0 text-center
                          card-name-overlay px-0.5 pb-1 pt-3">
            <span className="text-[12px] font-extrabold text-white drop-shadow-md truncate block px-1 capitalize">
              {card?.name || pokemon?.name?.replace(/-/g, ' ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-7 h-7 border-2 border-dashed border-white/20 rounded-full" />
      )}
    </div>
  );
}