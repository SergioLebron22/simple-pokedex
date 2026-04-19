import { useState, useEffect, useRef } from 'react';

const getSpriteUrl = (pokemonName) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonName}.png`;

// Simple in-memory cache shared across all hook instances
const cache = new Map();

export function useSpriteCache(pokemonNames = []) {
  const [sprites, setSprites] = useState({});

  useEffect(() => {
    if (!pokemonNames.length) return;

    let cancelled = false;

    const load = async () => {
      const updates = {};

      await Promise.all(
        pokemonNames.map(async (name) => {
          if (!name) return;
          if (cache.has(name)) {
            updates[name] = cache.get(name);
            return;
          }
          // Use the sprite URL directly — browser caches it
          const url = getSpriteUrl(name);
          cache.set(name, url);
          updates[name] = url;
        })
      );

      if (!cancelled) setSprites(prev => ({ ...prev, ...updates }));
    };

    load();
    return () => { cancelled = true; };
  }, [pokemonNames.join(',')]);

  return sprites;
}