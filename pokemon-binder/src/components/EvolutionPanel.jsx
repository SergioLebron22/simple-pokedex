import { useState, useEffect } from 'react';

function getTriggerLabel(details) {
  if (!details) return null;
  if (details.min_level) return `Lv. ${details.min_level}`;
  if (details.held_item?.name) return `Trade · ${details.held_item.name.replace(/-/g, ' ')}`;
  if (details.item?.name) return details.item.name.replace(/-/g, ' ');
  if (details.trigger?.name === 'trade') return 'Trade';
  if (details.min_happiness || details.trigger?.name === 'friendship') return 'Friendship';
  if (details.trigger?.name) return details.trigger.name.replace(/-/g, ' ');
  return null;
}

function idFromUrl(url) {
  return url?.split('/').filter(Boolean).pop();
}

function parseChain(node, stage = 0, result = []) {
  const trigger = node.evolution_details?.[0] ?? null;
  result.push({ stage, name: node.species.name, id: idFromUrl(node.species.url), trigger });
  for (const next of (node.evolves_to ?? [])) {
    parseChain(next, stage + 1, result);
  }
  return result;
}

export default function EvolutionPanel({ pokemonName }) {
  const [stages,  setStages]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemonName) { setStages(null); return; }
    let cancelled = false;
    setStages(null);
    setLoading(true);

    (async () => {
      try {
        const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
        if (!specRes.ok || cancelled) return;
        const spec = await specRes.json();

        const evoRes = await fetch(spec.evolution_chain.url);
        if (!evoRes.ok || cancelled) return;
        const evo = await evoRes.json();

        const flat = parseChain(evo.chain);
        const grouped = {};
        for (const e of flat) {
          (grouped[e.stage] ??= []).push(e);
        }
        if (!cancelled) setStages(grouped);
      } catch {
        // silently fail — card name may not map to a valid species
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pokemonName]);

  const stageKeys = stages
    ? Object.keys(stages).map(Number).sort((a, b) => a - b)
    : [];

  if (loading) return (
    <div
      className="w-full max-w-5xl rounded-2xl border border-[#555577] p-4
                 shadow-[0_30px_80px_rgba(0,0,0,0.85)]"
      style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
    >
      <p className="text-center text-[12px] text-pokeGray-light animate-pulse">
        Loading evolution line…
      </p>
    </div>
  );

  if (!stages || stageKeys.length <= 1) return null;

  return (
    <div
      className="w-full max-w-5xl rounded-2xl border border-[#555577] p-4 sm:p-5
                 shadow-[0_30px_80px_rgba(0,0,0,0.85)] animate-slideUp"
      style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
    >
      <p className="font-pixel text-pokeGold mb-4" style={{ fontSize: '11px' }}>
        EVOLUTION LINE
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {stageKeys.map((stageKey, i) => (
          <div key={stageKey} className="flex items-center gap-3">
            {i > 0 && (
              <span className="text-pokeGray-light text-xl font-bold select-none">→</span>
            )}

            <div className={`flex gap-4 ${stages[stageKey].length > 1 ? 'flex-col' : 'flex-col items-center'}`}>
              {stages[stageKey].map(entry => (
                <div key={entry.name} className="flex flex-col items-center gap-1">
                  {entry.trigger && getTriggerLabel(entry.trigger) && (
                    <span className="text-[11px] font-bold text-pokeGold bg-pokeGold/10
                                     border border-pokeGold/30 rounded-full px-2 py-0.5 capitalize
                                     whitespace-nowrap">
                      {getTriggerLabel(entry.trigger)}
                    </span>
                  )}
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                    alt={entry.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
                    onError={e => {
                      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
                    }}
                  />
                  <span className="text-[12px] text-white font-bold capitalize text-center leading-tight">
                    {entry.name.replace(/-/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
