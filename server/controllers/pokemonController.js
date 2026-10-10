import { getPokemon, getPokemonList, getTypeData, getAllTypes } from '../utils/pokeApiCache.js';
import { getFullTypeChart } from '../utils/typeChart.js';

// GET /api/pokemon?offset=0&limit=24
export async function listPokemon(req, res) {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 24, 100);
    const listData = await getPokemonList(offset, limit);

    // Fetch details for each Pokémon in parallel
    const details = await Promise.all(
      listData.results.map(async (p) => {
        try {
          const { data } = await getPokemon(p.name);
          return {
            id: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.front_default,
            officialArtwork: data.sprites.other?.['official-artwork']?.front_default,
            stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
          };
        } catch {
          return null;
        }
      })
    );

    res.json({
      count: listData.count,
      pokemon: details.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/pokemon/:nameOrId
export async function getOnePokemon(req, res) {
  try {
    const { nameOrId } = req.params;
    const id = parseInt(nameOrId);
    const { data, speciesData, evolutionData } = await getPokemon(isNaN(id) ? nameOrId : id);

    // Parse evolution chain
    const evolutions = parseEvolutionChain(evolutionData?.chain);

    // Get English description
    const description = speciesData.flavor_text_entries
      ?.find(e => e.language.name === 'en')
      ?.flavor_text?.replace(/\f/g, ' ').replace(/\n/g, ' ') || 'No description available.';

    // Get genus
    const genus = speciesData.genera
      ?.find(g => g.language.name === 'en')
      ?.genus || 'Pokémon';

    res.json({
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprite: data.sprites.front_default,
      spriteBack: data.sprites.back_default,
      spriteShiny: data.sprites.front_shiny,
      officialArtwork: data.sprites.other?.['official-artwork']?.front_default,
      stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map(a => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      })),
      moves: data.moves.slice(0, 20).map(m => m.move.name),
      baseExperience: data.base_experience,
      description,
      genus,
      generation: speciesData.generation?.name,
      habitat: speciesData.habitat?.name,
      captureRate: speciesData.capture_rate,
      growthRate: speciesData.growth_rate?.name,
      eggGroups: speciesData.egg_groups?.map(e => e.name) || [],
      color: speciesData.color?.name,
      isLegendary: speciesData.is_legendary,
      isMythical: speciesData.is_mythical,
      evolutions,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

// GET /api/types
export async function listTypes(req, res) {
  try {
    const typesData = await getAllTypes();
    const types = typesData.results
      .filter(t => t.name !== 'unknown' && t.name !== 'shadow')
      .map(t => t.name);
    res.json({ types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/types/chart
export async function typeChart(req, res) {
  try {
    res.json(getFullTypeChart());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Helper: parse evolution chain recursively
function parseEvolutionChain(chain) {
  if (!chain) return [];
  const evolutions = [];

  function traverse(node) {
    const id = extractIdFromUrl(node.species.url);
    evolutions.push({
      name: node.species.name,
      id,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      minLevel: node.evolution_details?.[0]?.min_level || null,
      trigger: node.evolution_details?.[0]?.trigger?.name || null,
      item: node.evolution_details?.[0]?.item?.name || null,
    });
    if (node.evolves_to) {
      node.evolves_to.forEach(traverse);
    }
  }

  traverse(chain);
  return evolutions;
}

function extractIdFromUrl(url) {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1]);
}
