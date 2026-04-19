import { useState, useEffect } from 'react';

const CARDS_PER_PAGE = 20;
const SLOT_LIMIT = 1280;

// Patterns that indicate a form variant we want to exclude
const EXCLUDE_PATTERNS = [
  /-totem$/,
//   /-gmax$/,          // keep or remove gigantamax — remove if unwanted
//   /-mega$/,
//   /-mega-[xy]$/,
//   /-alola$/,         // keep or remove regionals — remove if unwanted
//   /-galar$/,
//   /-hisui$/,
//   /-paldea$/,
  // Minior colors and similar multi-color forms
  /-core-[a-z]+$/,
  /-[a-z]+-stripe$/,
  // Vivillon, Florges, Furfrou patterns
  /-[a-z]+-pattern$/,
  /-[a-z]+-trim$/,
  // Unown letters
  /^unown-[a-z]+$/,
  /^unown-exclamation$/,
  /^unown-question$/,
  // Pikachu costume/hat/gmax variants
  /^pikachu-/,
  // Spinda
  /^spinda-/,
  // Castform forms
//   /^castform-/,
  // Deoxys forms
//   /^deoxys-/,
  // Wormadam forms
//   /^wormadam-/,
  // Rotom forms
//   /^rotom-/,
  // Shaymin forms
//   /^shaymin-/,
  // Giratina forms
//   /^giratina-/,
  // Basculin forms
  /^basculin-/,
  // Darmanitan forms
  /^darmanitan-/,
  // Tornadus/Thundurus/Landorus forms
//   /-(incarnate|therian)$/,
  // Kyurem forms
//   /^kyurem-/,
  // Keldeo forms
//   /^keldeo-/,
  // Meloetta forms
//   /^meloetta-/,
  // Genesect forms
  /^genesect-/,
  // Greninja forms
  /^greninja-/,
  // Scatterbug/Spewpa patterns
  /^scatterbug-/,
  /^spewpa-/,
  // Flabébé colors
  /^flabebe-/,
  // Furfrou trims
  /^furfrou-/,
  // Meowstic forms
  /^meowstic-/,
  // Aegislash forms
  /^aegislash-/,
  // Pumpkaboo/Gourgeist sizes
  /-(small|large|super)$/,
  // Xerneas forms
  /^xerneas-/,
  // Zygarde forms
  /^zygarde-/,
  // Hoopa forms
  // /^hoopa-/,
  // Oricorio forms
  // /^oricorio-/,
  // Lycanroc forms
//   /^lycanroc-/,
  // Wishiwashi forms
  /^wishiwashi-/,
  // Minior forms (core colors)
  /^minior-/,
  // Mimikyu forms
  /^mimikyu-/,
  // Necrozma forms
//   /^necrozma-/,
  // Magearna forms
  /^magearna-/,
  // Cramorant forms
  /^cramorant-/,
  // Toxtricity forms
  /^toxtricity-/,
  // Sinistea/Polteageist forms
  /-(phony|antique)$/,
  // Indeedee forms
  /^indeedee-/,
  // Morpeko forms
  /^morpeko-/,
  // Zacian/Zamazenta forms
  /-(hero|crowned)$/,
  // Eternatus forms
//   /^eternatus-/,
  // Urshifu forms
  /^urshifu-/,
  // Zarude forms
  /^zarude-/,
  // Calyrex forms
  /^calyrex-/,
  // Enamorus forms
  /^enamorus-/,
  // Palafin forms
//   /^palafin-/,
  // Tatsugiri forms
  /^tatsugiri-/,
  // Dudunsparce forms
//   /^dudunsparce-/,
  // Maushold forms
  /^maushold-/,
  // Squawkabilly colors
  /^squawkabilly-/,
  // Oinkologne forms
//   /^oinkologne-/,
  // Iron/Paradox alternate forms
  // Gimmighoul forms
  /^gimmighoul-/,
  // Koraidon/Miraidon forms
  /^koraidon-/,
  /^miraidon-/,
  // Poltchageist forms
  /-(counterfeit|artisan)$/,
  // Bloodmoon Ursaluna (keep base)
  // /^ursaluna-/,
  // Walking Wake, Iron Leaves etc are separate Pokemon — keep those
];

function shouldExclude(name) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(name));
}

// Strips hyphen-suffixes from right to left until a known base Pokémon name is found.
// Uses only entries with id ≤ 10000 as valid base targets to avoid false positives
// (e.g. charizard-mega resolving to charizard-mega instead of charizard).
function getBaseName(name, nameToBaseId) {
  const parts = name.split('-');
  for (let i = parts.length - 1; i >= 1; i--) {
    const candidate = parts.slice(0, i).join('-');
    if (nameToBaseId[candidate] !== undefined) return candidate;
  }
  return name;
}

async function fetchAllPokemon() {
  const res  = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0');
  const data = await res.json();

  const entries = data.results
    .map(p => ({
      id:   parseInt(p.url.split('/').filter(Boolean).pop(), 10),
      name: p.name,
      url:  p.url,
    }))
    .filter(p => !shouldExclude(p.name));

  // Build lookup of base Pokémon only (national dex IDs ≤ 10000)
  const nameToBaseId = {};
  for (const p of entries) {
    if (p.id <= 10000) nameToBaseId[p.name] = p.id;
  }

  // Group forms right after their base: sort by (baseId, isBase, ownId)
  entries.sort((a, b) => {
    const aBase   = getBaseName(a.name, nameToBaseId);
    const bBase   = getBaseName(b.name, nameToBaseId);
    const aBaseId = nameToBaseId[aBase] ?? a.id;
    const bBaseId = nameToBaseId[bBase] ?? b.id;

    if (aBaseId !== bBaseId) return aBaseId - bBaseId;
    const aIsBase = aBase === a.name ? 0 : 1;
    const bIsBase = bBase === b.name ? 0 : 1;
    if (aIsBase !== bIsBase) return aIsBase - bIsBase;
    return a.id - b.id;
  });

  return entries.slice(0, SLOT_LIMIT);
}

export function usePokedexList() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    fetchAllPokemon()
      .then(setAllPokemon)
      .catch(() => setError('Failed to load Pokédex'))
      .finally(() => setLoading(false));
  }, []);

  const getPageEntries = (pageIndex) =>
    allPokemon.slice(pageIndex * CARDS_PER_PAGE, (pageIndex + 1) * CARDS_PER_PAGE);

  const totalPages = Math.ceil(allPokemon.length / CARDS_PER_PAGE);

  return { allPokemon, getPageEntries, totalPages, loading, error };
}