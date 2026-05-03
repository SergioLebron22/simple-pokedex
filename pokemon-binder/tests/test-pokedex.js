// Run with: node test-pokedex.js
// Checks that no base national-dex Pokémon (#1-1025) is accidentally excluded.

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
  return EXCLUDE_PATTERNS.some(p => p.test(name));
}

async function main() {
  console.log('Fetching Pokémon list…');
  const res  = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000&offset=0');
  const data = await res.json();

  const all = data.results.map(p => ({
    id:   parseInt(p.url.split('/').filter(Boolean).pop(), 10),
    name: p.name,
  }));

  const base    = all.filter(p => p.id >= 1 && p.id <= 1025);
  const wrongly = base.filter(p => shouldExclude(p.name));
  const missing = [];

  // Check every dex number 1-1025 has at least one entry (base or hyphenated default)
  const coveredIds = new Set(base.map(p => p.id));
  for (let i = 1; i <= 1025; i++) {
    if (!coveredIds.has(i)) missing.push(i);
  }

  console.log(`\nBase Pokémon in API (id 1-1025): ${base.length}`);
  console.log(`After exclusion filter: ${base.filter(p => !shouldExclude(p.name)).length}`);

  if (wrongly.length === 0) {
    console.log('\n✓ No base Pokémon are accidentally excluded.');
  } else {
    console.log(`\n✗ ${wrongly.length} base Pokémon wrongly excluded:`);
    wrongly.forEach(p => {
      const matched = EXCLUDE_PATTERNS.filter(pat => pat.test(p.name)).map(String);
      console.log(`  #${String(p.id).padStart(4, '0')} ${p.name.padEnd(30)} matched: ${matched.join(', ')}`);
    });
  }

  if (missing.length > 0) {
    console.log(`\n✗ Dex numbers missing from API entirely: ${missing.join(', ')}`);
  }

  // Bonus: list which forms ARE included (id > 10000, not excluded)
  const includedForms = all.filter(p => p.id > 10000 && !shouldExclude(p.name));
  console.log(`\nForms included in binder (id > 10000): ${includedForms.length}`);
  includedForms.forEach(p => console.log(`  ${p.name} (#${p.id})`));
}

main().catch(console.error);
