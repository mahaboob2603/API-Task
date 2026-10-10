import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPokemonList } from '../../services/api';
import { capitalize } from '../../utils/helpers';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import './Home.css';

const FEATURED_POKEMON = ['charizard', 'mewtwo', 'rayquaza', 'lucario', 'greninja', 'garchomp'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatured();
  }, []);

  async function loadFeatured() {
    try {
      // Load first batch for the showcase
      const data = await fetchPokemonList(0, 12);
      setFeatured(data.pokemon || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">⚡ Advanced Pokémon Platform</div>
          <h1 className="hero-title">
            <span className="hero-title-line1">Explore the</span>
            <span className="hero-title-line2">Pokémon Universe</span>
          </h1>
          <p className="hero-subtitle">
            Browse 1,000+ Pokémon, compare stats, explore type matchups,
            build teams, and battle other trainers in real-time.
          </p>
          <div className="hero-actions">
            <Link to="/pokedex" className="hero-btn hero-btn--primary">
              <span>📖</span> Open Pokédex
            </Link>
            <Link to="/types" className="hero-btn hero-btn--secondary">
              <span>⚡</span> Type Chart
            </Link>
          </div>
        </div>

        {/* Floating Pokeball */}
        <div className="hero-visual">
          <div className="pokeball-hero">
            <div className="pokeball-top"></div>
            <div className="pokeball-stripe">
              <div className="pokeball-button"></div>
            </div>
            <div className="pokeball-bottom"></div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-strip">
        <div className="stat-item">
          <span className="stat-number">1,025+</span>
          <span className="stat-desc">Pokémon</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">18</span>
          <span className="stat-desc">Types</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">9</span>
          <span className="stat-desc">Generations</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">∞</span>
          <span className="stat-desc">Teams</span>
        </div>
      </section>

      {/* Featured Pokémon */}
      <section className="featured-section">
        <h2 className="section-title">
          <span className="section-icon">🌟</span>
          Discover Pokémon
        </h2>
        <div className="featured-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton featured-skeleton"></div>
            ))
          ) : (
            featured.slice(0, 6).map((pokemon, i) => (
              <Link
                key={pokemon.id}
                to={`/pokemon/${pokemon.name}`}
                className="featured-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <img
                  src={pokemon.officialArtwork || pokemon.sprite}
                  alt={pokemon.name}
                  className="featured-sprite"
                />
                <div className="featured-info">
                  <span className="featured-id">#{String(pokemon.id).padStart(3, '0')}</span>
                  <h3 className="featured-name">{capitalize(pokemon.name)}</h3>
                  <div className="featured-types">
                    {pokemon.types.map(t => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="featured-cta">
          <Link to="/pokedex" className="see-all-btn">
            View All Pokémon →
          </Link>
        </div>
      </section>

      {/* Features section */}
      <section className="features-section">
        <h2 className="section-title">
          <span className="section-icon">🎮</span>
          Platform Features
        </h2>
        <div className="features-grid">
          {[
            { icon: '📖', title: 'Advanced Pokédex', desc: 'Browse, search, and filter all Pokémon with detailed stats, abilities, and evolution chains.' },
            { icon: '⚔️', title: 'Compare Pokémon', desc: 'Side-by-side stat comparison to find the strongest contenders for your team.' },
            { icon: '⚡', title: 'Type Matchups', desc: 'Interactive type effectiveness chart with strengths, weaknesses, and immunities.' },
            { icon: '🏗️', title: 'Team Builder', desc: 'Build teams of 6 with type coverage analysis. Save and share with other trainers.', badge: 'Coming Soon' },
            { icon: '🎯', title: 'Live Battles', desc: 'Real-time PvP battles with actual Pokémon stats, type effectiveness, and move selection.', badge: 'Coming Soon' },
            { icon: '🔄', title: 'Trading Hub', desc: 'Trade Pokémon with other trainers. Post offers and negotiate in real-time.', badge: 'Coming Soon' },
          ].map((feature, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              {feature.badge && <span className="feature-badge">{feature.badge}</span>}
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
