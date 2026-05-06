import Pokeball from './Pokeball';

export default function Header({ totalCards, totalPages, totalSlots }) {
  const pct = totalSlots ? Math.round((totalCards / totalSlots) * 100) : 0;

  const stats = [
    { label: 'Cards',  value: totalCards },
    { label: 'Pages',  value: totalPages },
    { label: 'Slots',  value: totalSlots },
    { label: 'Filled', value: `${pct}%`  },
  ];

  return (
    <header className="flex items-center justify-between mb-5 sm:mb-7 flex-wrap gap-3">
      {/* Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Pokeball size={40} />
        <div>
          <h1
            className="font-pixel text-white leading-relaxed"
            style={{
              fontSize: '13px',
              textShadow: '3px 3px 0 #c1121f, 5px 5px 0 rgba(0,0,0,0.35)',
            }}
          >
            National Pokédex
            <br />
            Binder
          </h1>
          <p className="text-pokeGray-light font-nunito font-bold text-xs mt-1">
            Card Collection Tracker
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 flex-wrap items-center">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-sm"
          >
            {label}:{' '}
            <span className="text-pokeGold">{value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
