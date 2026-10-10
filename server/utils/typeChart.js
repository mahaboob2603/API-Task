// Full type effectiveness chart
// damage_relations format: { doubleDamageTo, halfDamageTo, noDamageTo }
const TYPE_CHART = {
  normal:   { doubleTo: [], halfTo: ['rock', 'steel'], noTo: ['ghost'] },
  fire:     { doubleTo: ['grass', 'ice', 'bug', 'steel'], halfTo: ['fire', 'water', 'rock', 'dragon'], noTo: [] },
  water:    { doubleTo: ['fire', 'ground', 'rock'], halfTo: ['water', 'grass', 'dragon'], noTo: [] },
  electric: { doubleTo: ['water', 'flying'], halfTo: ['electric', 'grass', 'dragon'], noTo: ['ground'] },
  grass:    { doubleTo: ['water', 'ground', 'rock'], halfTo: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], noTo: [] },
  ice:      { doubleTo: ['grass', 'ground', 'flying', 'dragon'], halfTo: ['fire', 'water', 'ice', 'steel'], noTo: [] },
  fighting: { doubleTo: ['normal', 'ice', 'rock', 'dark', 'steel'], halfTo: ['poison', 'flying', 'psychic', 'bug', 'fairy'], noTo: ['ghost'] },
  poison:   { doubleTo: ['grass', 'fairy'], halfTo: ['poison', 'ground', 'rock', 'ghost'], noTo: ['steel'] },
  ground:   { doubleTo: ['fire', 'electric', 'poison', 'rock', 'steel'], halfTo: ['grass', 'bug'], noTo: ['flying'] },
  flying:   { doubleTo: ['grass', 'fighting', 'bug'], halfTo: ['electric', 'rock', 'steel'], noTo: [] },
  psychic:  { doubleTo: ['fighting', 'poison'], halfTo: ['psychic', 'steel'], noTo: ['dark'] },
  bug:      { doubleTo: ['grass', 'psychic', 'dark'], halfTo: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], noTo: [] },
  rock:     { doubleTo: ['fire', 'ice', 'flying', 'bug'], halfTo: ['fighting', 'ground', 'steel'], noTo: [] },
  ghost:    { doubleTo: ['psychic', 'ghost'], halfTo: ['dark'], noTo: ['normal'] },
  dragon:   { doubleTo: ['dragon'], halfTo: ['steel'], noTo: ['fairy'] },
  dark:     { doubleTo: ['psychic', 'ghost'], halfTo: ['fighting', 'dark', 'fairy'], noTo: [] },
  steel:    { doubleTo: ['ice', 'rock', 'fairy'], halfTo: ['fire', 'water', 'electric', 'steel'], noTo: [] },
  fairy:    { doubleTo: ['fighting', 'dragon', 'dark'], halfTo: ['fire', 'poison', 'steel'], noTo: [] },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

/**
 * Get effectiveness multiplier for attackType vs defenderType
 */
export function getEffectiveness(attackType, defenderType) {
  const chart = TYPE_CHART[attackType];
  if (!chart) return 1;
  if (chart.doubleTo.includes(defenderType)) return 2;
  if (chart.halfTo.includes(defenderType)) return 0.5;
  if (chart.noTo.includes(defenderType)) return 0;
  return 1;
}

/**
 * Get full matchup matrix for the type chart page
 */
export function getFullTypeChart() {
  const matrix = {};
  for (const atk of ALL_TYPES) {
    matrix[atk] = {};
    for (const def of ALL_TYPES) {
      matrix[atk][def] = getEffectiveness(atk, def);
    }
  }
  return { types: ALL_TYPES, matrix };
}

export { TYPE_CHART, ALL_TYPES };
