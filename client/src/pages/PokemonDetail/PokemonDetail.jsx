import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPokemon } from '../../services/api';
import { capitalize, padId, TYPE_COLORS } from '../../utils/helpers';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import StatBar from '../../components/StatBar/StatBar';
import EvolutionChain from '../../components/EvolutionChain/EvolutionChain';
import './PokemonDetail.css';

export default function PokemonDetail() {
  const { nameOrId } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPokemon();
  }, [nameOrId]);

  async function loadPokemon() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemon(nameOrId);
      setPokemon(data);
    } catch (err) {
      setError(err.message || 'Pokémon not found');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page loading-container">
        <div className="spinner"></div>
        <p>Loading Pokédex Data...</p>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="page error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/pokedex')} className="back-btn">
          ← Back to Pokédex
        </button>
      </div>
    );
  }

  const mainType = pokemon.types[0];
  const bgColor = TYPE_COLORS[mainType] || '#666';

  return (
    <div className="page detail-page" style={{ '--theme-color': bgColor }}>
      <button onClick={() => navigate('/pokedex')} className="back-btn">
        ← Back
      </button>

      <div className="detail-header">
        <div className="detail-title">
          <span className="detail-id">{padId(pokemon.id)}</span>
          <h1>{capitalize(pokemon.name)}</h1>
          <span className="detail-genus">{pokemon.genus}</span>
        </div>
        <div className="detail-types">
          {pokemon.types.map(t => <TypeBadge key={t} type={t} size="lg" />)}
        </div>
      </div>

      <div className="detail-content">
        {/* Left Column: Visuals & Physical */}
        <div className="detail-left">
          <div className="sprite-container" style={{ background: `linear-gradient(135deg, ${bgColor}40, transparent)` }}>
            <img
              src={pokemon.officialArtwork || pokemon.sprite}
              alt={pokemon.name}
              className="main-sprite"
            />
          </div>

          <div className="physical-stats">
            <div className="phys-box">
              <span className="phys-label">Height</span>
              <span className="phys-val">{(pokemon.height * 0.1).toFixed(1)} m</span>
            </div>
            <div className="phys-box">
              <span className="phys-label">Weight</span>
              <span className="phys-val">{(pokemon.weight * 0.1).toFixed(1)} kg</span>
            </div>
          </div>
          
          {pokemon.abilities && pokemon.abilities.length > 0 && (
            <div className="abilities-section">
              <h3>Abilities</h3>
              <div className="abilities-list">
                {pokemon.abilities.map(a => (
                  <span key={a.name} className={`ability-badge ${a.isHidden ? 'hidden-ability' : ''}`}>
                    {capitalize(a.name)} {a.isHidden && <small>(Hidden)</small>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dex Entry, Stats, Evos */}
        <div className="detail-right">
          <div className="dex-entry">
            <h3>Pokédex Entry</h3>
            <p>{pokemon.description}</p>
          </div>

          <div className="stats-section">
            <h3>Base Stats</h3>
            <div className="stats-container">
              {pokemon.stats.map(s => (
                <StatBar key={s.name} name={s.name} value={s.value} />
              ))}
            </div>
            <div className="stat-total">
              <span>Total:</span>
              <span>{pokemon.stats.reduce((acc, s) => acc + s.value, 0)}</span>
            </div>
          </div>

          {pokemon.evolutions && pokemon.evolutions.length > 1 && (
            <EvolutionChain evolutions={pokemon.evolutions} />
          )}
        </div>
      </div>
    </div>
  );
}
