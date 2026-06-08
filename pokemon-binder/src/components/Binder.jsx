import CardSlot from './CardSlot';
import ProgressBar from './ProgressBar';

export default function Binder({
  pageEntries,
  pageIndex,
  cardOverrides,
  filterMode,
  onSlotClick,
  CARDS_PER_PAGE,
  gridCols          = 5,
  spineLabel        = 'NATIONAL POKÉDEX BINDER',
  binderBgColor     = null,
  binderBorderColor = '#4a4a5a',
  onToggleOwned,
}) {
  const slots = pageEntries.map((pokemon, localIndex) => {
    const globalIndex = pageIndex * CARDS_PER_PAGE + localIndex;
    const card = cardOverrides[pokemon.name] || null;
    return { pokemon, card, localIndex, globalIndex };
  });

  const visibleSlots = slots.filter(({ pokemon, card }) => {
    if (filterMode === 'filled' && !card) return false;
    if (filterMode === 'empty'  &&  card) return false;
    return true;
  });

  const filledCount = slots.filter(s => s.card).length;

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[calc(100%-40px)] max-w-[860px] h-5 rounded-t-lg
                   flex items-center justify-center shadow-md"
        style={{ background: binderBorderColor }}
      >
        <span className="font-pixel text-white/60 tracking-[3px]" style={{ fontSize: '7px' }}>
          {spineLabel}
        </span>
      </div>

      <div
        className="w-full max-w-[860px] border-x-[3px] border-b-[3px] rounded-b-[18px] p-3 pb-3 sm:p-6 sm:pb-5 relative
                   shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.09)]"
        style={{
          borderColor: binderBorderColor,
          background:  binderBgColor || 'linear-gradient(135deg, #1a1a2e 0%, #2a2a3e 50%, #1e1e32 100%)',
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-5 sm:w-7 rounded-bl-[18px]"
          style={{ background: 'linear-gradient(90deg, #1a1a2a, #2d2d3d)', borderRight: `2px solid ${binderBorderColor}` }}
        />

        <div className="pl-2 sm:pl-4">
          <div
            className="grid gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {visibleSlots.map(({ pokemon, card, localIndex, globalIndex }) => (
              <CardSlot
                key={globalIndex}
                pokemon={pokemon}
                card={card}
                slotNumber={globalIndex + 1}
                onClick={() => onSlotClick(globalIndex, pokemon)}
                onToggleOwned={() => onToggleOwned(globalIndex)}
              />
            ))}
          </div>

          <ProgressBar
            filled={filledCount}
            total={CARDS_PER_PAGE}
            pageNumber={pageIndex + 1}
          />
        </div>
      </div>
    </div>
  );
}
