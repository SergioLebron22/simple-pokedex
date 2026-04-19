import CardSlot from './CardSlot';
import ProgressBar from './ProgressBar';

export default function Binder({
  pageEntries,       // array of { id, name } for this page's 20 slots
  pageIndex,
  cardOverrides,     // { [globalSlotIndex]: cardData }
  filterMode,
  onSlotClick,
  CARDS_PER_PAGE,
}) {
  const slots = pageEntries.map((pokemon, localIndex) => {
    const globalIndex = pageIndex * CARDS_PER_PAGE + localIndex;
    const card = cardOverrides[globalIndex] || null;
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
      <div className="w-[calc(100%-40px)] max-w-[860px] h-5 binder-spine-gradient
                      rounded-t-lg flex items-center justify-center shadow-md">
        <span className="font-pixel text-white/60 tracking-[3px]" style={{ fontSize: '7px' }}>
          NATIONAL POKÉDEX BINDER
        </span>
      </div>

      <div className="w-full max-w-[860px] border-x-[3px] border-b-[3px] border-[#4a4a5a]
                      rounded-b-[18px] p-6 pb-5 relative binder-bg-gradient
                      shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.09)]">
        <div className="absolute left-0 top-0 bottom-0 w-7 rounded-bl-[18px]"
          style={{ background: 'linear-gradient(90deg, #1a1a2a, #2d2d3d)', borderRight: '2px solid #1a1a2a' }} />

        <div className="pl-4">
          <div className="grid grid-cols-5 gap-3">
            {visibleSlots.map(({ pokemon, card, localIndex, globalIndex }) => (
              <CardSlot
                key={globalIndex}
                pokemon={pokemon}
                card={card}
                slotNumber={globalIndex + 1}
                onClick={() => onSlotClick(globalIndex, pokemon)}
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