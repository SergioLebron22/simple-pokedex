import { useEffect } from 'react';
import { usePokedex } from '../hooks/usePokedex';

const TYPE_COLORS = {
  fire:'bg-orange-500', water:'bg-blue-500', grass:'bg-green-500',
  electric:'bg-yellow-400 text-black', psychic:'bg-pink-500',
  ice:'bg-cyan-400 text-black', dragon:'bg-indigo-600',
  dark:'bg-gray-700', fairy:'bg-pink-300 text-black',
  normal:'bg-gray-400 text-black', fighting:'bg-red-700',
  flying:'bg-sky-400 text-black', poison:'bg-purple-500',
  ground:'bg-yellow-600', rock:'bg-yellow-700',
  bug:'bg-lime-500 text-black', ghost:'bg-purple-800',
  steel:'bg-gray-500', default:'bg-gray-600',
};

function TypeBadge({ type }) {
  const color = TYPE_COLORS[type] || TYPE_COLORS.default;
  return (
    <span className={`${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize`}>
      {type}
    </span>
  );
}

function StatBar({ label, value }) {
  const pct = Math.min(Math.round((value / 255) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-pokeGray-light w-16 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-pokeDark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-gradient"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-white font-bold w-6 text-right">{value}</span>
    </div>
  );
}

const STAT_LABELS = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SpA', 'special-defense':'SpD', speed:'SPD',
};

export default function PokedexPanel({ pokemonName }) {
  const { pokemon, species, loading, error, fetchPokemon, clear } = usePokedex();

  useEffect(() => {
    if (pokemonName) fetchPokemon(pokemonName);
    return () => clear();
  }, [pokemonName, fetchPokemon, clear]);

  if (loading) return (
    <div className="mt-4 text-center text-pokeGray-light text-xs animate-pulse py-4">
      Loading Pokédex data…
    </div>
  );
  if (error) return (
    <div className="mt-4 text-center text-red-400 text-xs py-2">{error}</div>
  );
  if (!pokemon) return null;

  const flavorText = species?.flavor_text_entries
    ?.find(e => e.language.name === 'en')
    ?.flavor_text
    ?.replace(/\f/g, ' ');

  return (
    <div className="space-y-3 min-w-0">
      {/* Header */}
      <div>
        <h3 className="text-white font-extrabold capitalize text-sm">{pokemon.name}</h3>
        <p className="text-pokeGray-light text-[10px]">
          #{String(pokemon.id).padStart(3, '0')} ·{' '}
          {species?.genera?.find(g => g.language.name === 'en')?.genus}
        </p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {pokemon.types.map(t => (
            <TypeBadge key={t.type.name} type={t.type.name} />
          ))}
        </div>
      </div>

      {/* Flavor text */}
      {flavorText && (
        <p className="text-[11px] text-pokeGray-light italic leading-relaxed bg-pokeDark-card
                      rounded-lg px-3 py-2 border border-white/5">
          {flavorText}
        </p>
      )}

      {/* Physical */}
      <div className="grid grid-cols-2 gap-2 text-center">
        {[
          { label: 'Height', value: `${(pokemon.height / 10).toFixed(1)} m` },
          { label: 'Weight', value: `${(pokemon.weight / 10).toFixed(1)} kg` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-pokeDark-card rounded-lg py-2 border border-white/5">
            <p className="text-[10px] text-pokeGray-light">{label}</p>
            <p className="text-white font-bold text-xs">{value}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="space-y-1.5">
        {pokemon.stats.map(s => (
          <StatBar
            key={s.stat.name}
            label={STAT_LABELS[s.stat.name] || s.stat.name}
            value={s.base_stat}
          />
        ))}
      </div>

      {/* Abilities */}
      <div>
        <p className="text-[10px] font-bold text-pokeGray-light mb-1">Abilities</p>
        <div className="flex gap-2 flex-wrap">
          {pokemon.abilities.map(a => (
            <span key={a.ability.name}
              className="bg-pokeDark-card border border-white/10 text-white
                         text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize">
              {a.ability.name}{a.is_hidden ? ' ✦' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}