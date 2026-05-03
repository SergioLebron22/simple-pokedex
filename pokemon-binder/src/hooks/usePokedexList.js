import { useState, useEffect } from 'react';

const CARDS_PER_PAGE = 20;
const SLOT_LIMIT = 1600;

const EXCLUDE_PATTERNS = [
  /-totem$/,
  /-totem-alola$/,
  /-core-[a-z]+$/,
  /-[a-z]+-stripe$/,
  /-[a-z]+-pattern$/,
  /-[a-z]+-trim$/,
  /^unown-[a-z]+$/,
  /^unown-exclamation$/,
  /^unown-question$/,
  /^pikachu-/,
  /^spinda-/,
  /^basculin-(?!red)/,
  /-zen$/,
  /^genesect-/,
  /^greninja-battle-bond/,
  /^scatterbug-/,
  /^spewpa-/,
  /^flabebe-/,
  /^furfrou-/,
  /-blade/,
  /-(small|large|super)$/,
  /^xerneas-/,
  /^rockruff-own-tempo/,
  /^minior-(?!red)/,
  /^mimikyu-(busted|totem-disguised|totem-busted)/,
  /^magearna-/,
  /^cramorant-/,
  /low-key-gmax/,
  /appletun-gmax/,
  /-(phony|antique)$/,
  /-(hero|crowned)$/,
  /^zarude-/,
  /^gimmighoul-/,
  /^koraidon-/,
  /^miraidon-/,
  /-(counterfeit|artisan)$/,
  /-starter/,
  /-female/,
  /-three/,
  /^tatsugiri-(droopy|stretchy)/,
  /^squawkabilly-(?!green)/,
];

function shouldExclude(name) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(name));
}

// Strips hyphen-suffixes from right to left until a known base Pokémon name is found.
// Uses only entries with id ≤ 10000 as valid base targets to avoid false positives
// (e.g. charizard-mega resolving to charizard-mega instead of charizard).
function getBaseName(name, nameToBaseId) {
  // If the name itself is a national-dex Pokémon (id ≤ 10000), it is not a
  // form of anything else — return it as-is so it sorts at its own dex position.
  if (nameToBaseId[name] !== undefined) return name;
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

  // Build lookup of base Pokémon (national dex IDs ≤ 10000).
  // Also register bare prefixes for entries whose "default form" name has a suffix
  // (e.g. 'giratina-altered' id=487 → also registers 'giratina' → 487).
  // This lets getBaseName find the anchor when PokeAPI uses a hyphenated default name.
  const nameToBaseId = {};
  for (const p of entries) {
    if (p.id <= 10000) {
      nameToBaseId[p.name] = p.id;
      const nameParts = p.name.split('-');
      for (let k = 1; k < nameParts.length; k++) {
        const prefix = nameParts.slice(0, k).join('-');
        if (nameToBaseId[prefix] === undefined) nameToBaseId[prefix] = p.id;
      }
    }
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