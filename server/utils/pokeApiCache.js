import fetch from 'node-fetch';
import CachedPokemon from '../models/CachedPokemon.js';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

/**
 * Fetch a single Pokémon by name or ID, with MongoDB caching.
 */
export async function getPokemon(nameOrId) {
  const query = typeof nameOrId === 'number'
    ? { pokeId: nameOrId }
    : { name: String(nameOrId).toLowerCase() };

  // Check cache first
  const cached = await CachedPokemon.findOne(query);
  if (cached) return { data: cached.data, speciesData: cached.speciesData, evolutionData: cached.evolutionData };

  // Fetch from PokeAPI
  const res = await fetch(`${POKEAPI_BASE}/pokemon/${String(nameOrId).toLowerCase()}`);
  if (!res.ok) throw new Error(`Pokémon "${nameOrId}" not found`);
  const data = await res.json();

  // Fetch species data
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  // Fetch evolution chain
  let evolutionData = null;
  if (speciesData.evolution_chain?.url) {
    const evoRes = await fetch(speciesData.evolution_chain.url);
    evolutionData = await evoRes.json();
  }

  // Cache in MongoDB
  await CachedPokemon.findOneAndUpdate(
    { pokeId: data.id },
    { pokeId: data.id, name: data.name, data, speciesData, evolutionData, cachedAt: new Date() },
    { upsert: true, new: true }
  );

  return { data, speciesData, evolutionData };
}

/**
 * Fetch a paginated list of Pokémon (lightweight — names + IDs only).
 */
export async function getPokemonList(offset = 0, limit = 24) {
  const res = await fetch(`${POKEAPI_BASE}/pokemon?offset=${offset}&limit=${limit}`);
  const listData = await res.json();
  return listData;
}

/**
 * Fetch type data for the type matchup chart.
 */
export async function getTypeData(typeName) {
  const res = await fetch(`${POKEAPI_BASE}/type/${typeName}`);
  if (!res.ok) throw new Error(`Type "${typeName}" not found`);
  return res.json();
}

/**
 * Fetch all types.
 */
export async function getAllTypes() {
  const res = await fetch(`${POKEAPI_BASE}/type`);
  return res.json();
}
