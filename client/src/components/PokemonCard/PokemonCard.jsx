import { Link } from 'react-router-dom';
import TypeBadge from '../TypeBadge/TypeBadge';
import { capitalize, padId, TYPE_COLORS } from '../../utils/helpers';
import './PokemonCard.css';

export default function PokemonCard({ pokemon, index = 0 }) {
  const mainType = pokemon.types[0];
  const bgColor = TYPE_COLORS[mainType] || '#666';

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      className="pokemon-card"
      style={{
        '--card-color': bgColor,
        '--card-color-alpha': bgColor + '30',
        animationDelay: `${index * 0.05}s`,
      }}
    >
      {/* Background pokeball watermark */}
      <div className="card-pokeball-bg">
        <svg viewBox="0 0 100 100" className="pokeball-svg">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="2" opacity="0.15" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
        </svg>
      </div>

      {/* ID number */}
      <span className="card-id">{padId(pokemon.id)}</span>

      {/* Sprite */}
      <div className="card-sprite-container">
        <img
          src={pokemon.officialArtwork || pokemon.sprite}
          alt={pokemon.name}
          className="card-sprite"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="card-info">
        <h3 className="card-name">{capitalize(pokemon.name)}</h3>
        <div className="card-types">
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>
    </Link>
  );
}
