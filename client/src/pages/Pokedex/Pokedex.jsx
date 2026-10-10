import { useState, useEffect, useCallback } from 'react';
import { fetchPokemonList, fetchTypes } from '../../services/api';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import './Pokedex.css';

const PAGE_SIZE = 24;

export default function Pokedex() {
  const [pokemon, setPokemon] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [generation, setGeneration] = useState('all');

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pokemon, selectedType, searchQuery, generation]);

  async function loadInitial() {
    try {
      const [listData, typesData] = await Promise.all([
        fetchPokemonList(0, PAGE_SIZE),
        fetchTypes(),
      ]);
      setPokemon(listData.pokemon || []);
      setTotalCount(listData.count || 0);
      setTypes(typesData.types || []);
      setOffset(PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load Pokémon:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPokemonList(offset, PAGE_SIZE);
      setPokemon(prev => [...prev, ...(data.pokemon || [])]);
      setOffset(prev => prev + PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  function applyFilters() {
    let result = [...pokemon];

    // Type filter
    if (selectedType) {
      result = result.filter(p => p.types.includes(selectedType));
    }

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.includes(searchQuery) ||
        String(p.id).includes(searchQuery)
      );
    }

    // Generation filter
    if (generation !== 'all') {
      const [min, max] = GEN_RANGES[generation] || [1, 9999];
      result = result.filter(p => p.id >= min && p.id <= max);
    }

    setFiltered(result);
  }

  function handleSearch(query) {
    setSearchQuery(query);
  }

  function handleTypeFilter(type) {
    setSelectedType(prev => prev === type ? null : type);
  }

  return (
    <div className="page pokedex-page">
      <div className="pokedex-header">
        <h1 className="pokedex-title">Pokédex</h1>
        <p className="pokedex-subtitle">
          Showing {filtered.length} of {totalCount} Pokémon
        </p>
      </div>

      {/* Search & Filters */}
      <div className="pokedex-controls">
        <SearchBar onSearch={handleSearch} placeholder="Search by name or number..." />

        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Type:</span>
            <div className="type-filters">
              {types.map(type => (
                <TypeBadge
                  key={type}
                  type={type}
                  size="sm"
                  onClick={() => handleTypeFilter(type)}
                />
              ))}
              {selectedType && (
                <button className="clear-filter" onClick={() => setSelectedType(null)}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">Gen:</span>
            <div className="gen-filters">
              {['all', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'].map(gen => (
                <button
                  key={gen}
                  className={`gen-btn ${generation === gen ? 'active' : ''}`}
                  onClick={() => setGeneration(gen)}
                >
                  {gen === 'all' ? 'All' : gen}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pokémon Grid */}
      {loading ? (
        <div className="pokemon-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="skeleton card-skeleton"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="pokemon-grid">
            {filtered.map((p, i) => (
              <PokemonCard key={p.id} pokemon={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>No Pokémon found. Try a different search or filter.</p>
            </div>
          )}

          {offset < totalCount && !searchQuery && !selectedType && (
            <div className="load-more-container">
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <><div className="spinner" style={{ width: 20, height: 20, margin: 0 }}></div> Loading...</>
                ) : (
                  'Load More Pokémon'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const GEN_RANGES = {
  'I': [1, 151],
  'II': [152, 251],
  'III': [252, 386],
  'IV': [387, 493],
  'V': [494, 649],
  'VI': [650, 721],
  'VII': [722, 809],
  'VIII': [810, 905],
  'IX': [906, 1025],
};
