import { useState, useEffect } from 'react';

const TYPE_COLORS = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
  grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
  ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
  steel: '#B8B8D0', fairy: '#EE99AC',
};

const ALL_TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison',
  'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy',
];

const METHOD_LABELS = {
  'level-up': 'Level Up',
  'machine':  'TM / HM',
  'egg':      'Egg',
  'tutor':    'Tutor',
};

function TypeBadge({ typeName }) {
  return (
    <span
      className="text-white text-[12px] font-bold px-2 py-0.5 rounded-lg capitalize"
      style={{ backgroundColor: TYPE_COLORS[typeName] || '#888' }}
    >
      {typeName}
    </span>
  );
}

function computeChart(typeDataArr) {
  const mult = {};
  for (const td of typeDataArr) {
    const dr = td.damage_relations;
    for (const t of dr.double_damage_from) mult[t.name] = (mult[t.name] ?? 1) * 2;
    for (const t of dr.half_damage_from)   mult[t.name] = (mult[t.name] ?? 1) * 0.5;
    for (const t of dr.no_damage_from)     mult[t.name] = 0;
  }
  return mult;
}

/* ─── Moves ─────────────────────────────────────────────────────── */
function MovesTab({ moves }) {
  const [method, setMethod] = useState('level-up');

  const grouped = {};
  for (const m of moves) {
    for (const vg of m.version_group_details) {
      const key = vg.move_learn_method.name;
      (grouped[key] ??= []).push({
        name:  m.move.name,
        level: vg.level_learned_at,
      });
    }
  }

  const available = ['level-up', 'machine', 'egg', 'tutor'].filter(k => grouped[k]?.length);

  // Deduplicate: last occurrence wins (PokeAPI lists version groups oldest→newest)
  const dedupe = list => {
    const map = {};
    for (const e of list) map[e.name] = e;
    return Object.values(map);
  };

  let display = dedupe(grouped[method] ?? []);
  if (method === 'level-up') {
    display.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  } else {
    display.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {available.map(k => (
          <button key={k} onClick={() => setMethod(k)}
            className={`text-[12px] font-bold px-2.5 py-1 rounded-lg border transition-colors
              ${method === k
                ? 'bg-pokeGold/20 border-pokeGold/50 text-pokeGold'
                : 'bg-white/5 border-white/10 text-pokeGray-light hover:bg-white/10'}`}>
            {METHOD_LABELS[k] ?? k}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {display.map(m => (
          <div key={m.name}
               className="bg-pokeDark-card rounded-lg px-2.5 py-1.5 border border-white/5
                          flex items-center justify-between gap-1 min-w-0">
            <span className="text-white text-[12px] font-bold capitalize truncate">
              {m.name.replace(/-/g, ' ')}
            </span>
            {method === 'level-up' && (
              <span className="text-pokeGold text-[13px] font-bold shrink-0">
                {m.level > 0 ? `Lv.${m.level}` : '—'}
              </span>
            )}
          </div>
        ))}
        {display.length === 0 && (
          <p className="col-span-full text-[12px] text-pokeGray-light italic">None.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Habitats ───────────────────────────────────────────────────── */
function HabitatsTab({ speciesData, encounters }) {
  const byVersion = {};
  for (const enc of (encounters ?? [])) {
    for (const vd of enc.version_details) {
      const locName = enc.location_area.name
        .replace(/-area$/, '')
        .replace(/-/g, ' ');
      (byVersion[vd.version.name] ??= new Set()).add(locName);
    }
  }
  const versions = Object.keys(byVersion).sort();

  return (
    <div className="space-y-3">
      {speciesData?.habitat && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-pokeGray-light uppercase tracking-wider font-bold">
            Habitat:
          </span>
          <span className="bg-green-900/30 border border-green-700/40 text-green-300
                           text-[12px] font-bold px-2 py-0.5 rounded-lg capitalize">
            {speciesData.habitat.name.replace(/-/g, ' ')}
          </span>
        </div>
      )}

      {versions.length > 0 ? (
        <div className="space-y-2">
          {versions.map(ver => (
            <div key={ver} className="bg-pokeDark-card rounded-xl p-2.5 border border-white/5">
              <p className="text-pokeGold text-[12px] font-bold capitalize mb-1.5">
                {ver.replace(/-/g, ' ')}
              </p>
              <div className="flex flex-wrap gap-1">
                {[...byVersion[ver]].map(loc => (
                  <span key={loc}
                        className="text-white text-[13px] bg-white/5 border border-white/10
                                   px-1.5 py-0.5 rounded capitalize">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-pokeGray-light italic">
          Not encountered in the wild in any known game.
        </p>
      )}
    </div>
  );
}

/* ─── Type Chart ─────────────────────────────────────────────────── */
function TypeChartTab({ pokemonTypes, typeDataArr }) {
  const mult = computeChart(typeDataArr);

  const sections = [
    { key: 4,    label: '4× Weak',  color: '#f87171' },
    { key: 2,    label: '2× Weak',  color: '#fb923c' },
    { key: 0.5,  label: '½ Resist', color: '#4ade80' },
    { key: 0.25, label: '¼ Resist', color: '#34d399' },
    { key: 0,    label: 'Immune',   color: '#60a5fa' },
  ];

  const byMult = {};
  for (const t of ALL_TYPES) {
    const m = mult[t] ?? 1;
    if (m !== 1) (byMult[m] ??= []).push(t);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[12px] text-pokeGray-light font-bold">Type:</span>
        {pokemonTypes.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
      </div>

      <div className="space-y-2">
        {sections.filter(s => byMult[s.key]?.length).map(({ key, label, color }) => (
          <div key={key}>
            <p className="text-[12px] font-bold mb-1" style={{ color }}>{label}</p>
            <div className="flex flex-wrap gap-1">
              {byMult[key].map(t => <TypeBadge key={t} typeName={t} />)}
            </div>
          </div>
        ))}
        {Object.keys(byMult).length === 0 && (
          <p className="text-[12px] text-pokeGray-light">No notable weaknesses or resistances.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────────── */
export default function PokemonInfoTabs({ pokemonName }) {
  const [activeTab,  setActiveTab]  = useState('moves');
  const [poke,       setPoke]       = useState(null);
  const [species,    setSpecies]    = useState(null);
  const [encounters, setEncounters] = useState(null);
  const [typeData,   setTypeData]   = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!pokemonName) { setPoke(null); return; }
    let cancelled = false;
    setPoke(null); setSpecies(null); setEncounters(null); setTypeData(null);
    setLoading(true);

    (async () => {
      try {
        const [pokeRes, specRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`),
        ]);
        if (cancelled) return;

        const pokeJson = pokeRes.ok ? await pokeRes.json() : null;
        const specJson = specRes.ok ? await specRes.json() : null;
        if (cancelled || !pokeJson) return;

        setPoke(pokeJson);
        if (specJson) setSpecies(specJson);

        const [encRes, ...typeResArr] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokeJson.id}/encounters`),
          ...pokeJson.types.map(t => fetch(`https://pokeapi.co/api/v2/type/${t.type.name}`)),
        ]);
        if (cancelled) return;

        if (encRes.ok) setEncounters(await encRes.json());
        const tdArr = await Promise.all(typeResArr.map(r => r.ok ? r.json() : null));
        if (!cancelled) setTypeData(tdArr.filter(Boolean));
      } catch {
        // silently fail — pokemon name may not map to a valid species
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pokemonName]);

  if (!pokemonName) return null;

  const TABS = [
    { id: 'moves',      label: 'Moves'      },
    { id: 'habitats',   label: 'Habitats'   },
    { id: 'type-chart', label: 'Type Chart' },
  ];

  return (
    <div
      className="w-full max-w-5xl mx-auto rounded-2xl border border-[#555577] p-4 sm:p-5
                 shadow-[0_30px_80px_rgba(0,0,0,0.85)] animate-slideUp"
      style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
    >
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`text-[13px] font-bold px-3 py-1.5 rounded-lg transition-colors
              ${activeTab === tab.id
                ? 'bg-pokeRed text-white'
                : 'bg-white/10 text-pokeGray-light hover:bg-white/20'}`}>
            {tab.label}
          </button>
        ))}
        {species?.capture_rate != null && (
          <div className="ml-auto flex items-center gap-1.5 bg-pokeDark-card border border-white/10
                          rounded-lg px-2.5 py-1">
            <span className="text-[12px] text-pokeGray-light">Catch Rate</span>
            <span className="text-[13px] font-bold text-pokeGold">
              {((species.capture_rate / 255) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center text-[12px] text-pokeGray-light animate-pulse py-4">
          Loading…
        </p>
      )}

      {!loading && activeTab === 'moves' && poke && (
        <MovesTab moves={poke.moves} />
      )}
      {!loading && activeTab === 'habitats' && (
        <HabitatsTab speciesData={species} encounters={encounters} />
      )}
      {!loading && activeTab === 'type-chart' && poke && typeData && (
        <TypeChartTab pokemonTypes={poke.types} typeDataArr={typeData} />
      )}
    </div>
  );
}
