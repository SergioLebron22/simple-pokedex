import { useState, useCallback } from 'react';

export function usePokedex() {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPokemon = useCallback(async (nameOrId) => {
    if (!nameOrId) return;
    setLoading(true);
    setError(null);
    setPokemon(null);
    setSpecies(null);
    try {
      const res  = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${String(nameOrId).toLowerCase()}`
      );
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPokemon(data);

      const specRes  = await fetch(data.species.url);
      const specData = await specRes.json();
      setSpecies(specData);
    } catch (e) {
      setError('Pokémon not found');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPokemon(null);
    setSpecies(null);
    setError(null);
  }, []);

  return { pokemon, species, loading, error, fetchPokemon, clear };
}