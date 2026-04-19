export default function PageDots({ pages, currentPage, onGoTo }) {
  const spreadCount = Math.ceil(pages.length / 2);

  return (
    <div className="flex gap-2 justify-center mt-4 flex-wrap">
      {Array.from({ length: spreadCount }, (_, i) => {
        const leftPage  = pages[i * 2];
        const rightPage = pages[i * 2 + 1];
        const hasCards  = leftPage?.some(Boolean) || rightPage?.some(Boolean);
        const isActive  = i === currentPage;

        return (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            title={`Spread ${i + 1}`}
            className={`
              w-2.5 h-2.5 rounded-full border transition-all duration-150
              ${isActive
                ? 'bg-pokeRed border-pokeRed scale-[1.4]'
                : hasCards
                  ? 'bg-white/25 border-white/30 hover:bg-white/40'
                  : 'bg-white/[0.12] border-white/20 hover:bg-white/25'
              }
            `}
          />
        );
      })}
    </div>
  );
}
