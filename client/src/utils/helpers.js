export const TYPE_COLORS = {
  normal: '#a8a878',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

export const TYPE_TEXT_DARK = ['electric', 'ice', 'ground', 'steel', 'normal'];

export function capitalize(str) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function padId(id) {
  return '#' + String(id).padStart(3, '0');
}

export function getStatColor(value) {
  if (value < 50) return '#ff4444';
  if (value < 80) return '#f4a261';
  if (value < 120) return '#44ff88';
  return '#00cc55';
}

export function getStatLabel(name) {
  const map = {
    hp: 'HP',
    attack: 'ATK',
    defense: 'DEF',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPD',
  };
  return map[name] || name.toUpperCase();
}
