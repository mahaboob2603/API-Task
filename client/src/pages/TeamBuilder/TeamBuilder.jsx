import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPokemon, saveTeam, getUserTeams } from '../../services/api';
import './TeamBuilder.css';

export default function TeamBuilder() {
  const { user, loginWithGoogle, getToken } = useAuth();
  const [team, setTeam] = useState(Array(6).fill(null));
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [savedTeams, setSavedTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserTeams();
    }
  }, [user]);

  async function loadUserTeams() {
    try {
      const token = await getToken();
      const teams = await getUserTeams(token);
      setSavedTeams(teams);
    } catch (error) {
      console.error("Failed to load teams", error);
    }
  }

  useEffect(() => {
    if (search.length > 2) {
      searchPokemon();
    } else {
      setSearchResults([]);
    }
  }, [search]);

  async function searchPokemon() {
    try {
      const data = await fetchPokemon(search.toLowerCase());
      setSearchResults([data]); // Display the single match
    } catch (error) {
      setSearchResults([]);
    }
  }

  const addToTeam = (pokemon) => {
    const emptyIndex = team.findIndex(slot => slot === null);
    if (emptyIndex !== -1) {
      const newTeam = [...team];
      newTeam[emptyIndex] = pokemon;
      setTeam(newTeam);
      setSearch('');
    } else {
      alert("Your team is full!");
    }
  };

  const removeFromTeam = (index) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };

  const handleSaveTeam = async () => {
    const filledSlots = team.filter(p => p !== null);
    if (filledSlots.length === 0) return;

    setLoading(true);
    try {
      const token = await getToken();
      const pokemonData = filledSlots.map(p => ({
        pokeId: p.id,
        name: p.name,
        sprite: p.sprite,
        types: p.types
      }));

      await saveTeam({ name: 'My Awesome Team', pokemon: pokemonData }, token);
      alert('Team saved successfully!');
      setTeam(Array(6).fill(null));
      loadUserTeams();
    } catch (error) {
      console.error("Failed to save team", error);
      alert('Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="page login-prompt">
        <h2>Authentication Required</h2>
        <p>You need to be logged in to build and save a Pokémon team.</p>
        <button className="primary-btn" onClick={loginWithGoogle}>Sign in with Google</button>
      </div>
    );
  }

  return (
    <div className="page team-builder">
      <div className="team-header">
        <h1>Team Builder</h1>
        <p>Assemble your ultimate squad of 6 Pokémon.</p>
      </div>

      <div className="builder-layout">
        <div className="team-roster">
          {team.map((slot, index) => (
            <div key={index} className={`team-slot ${slot ? 'filled' : 'empty'}`}>
              {slot ? (
                <>
                  <button className="remove-btn" onClick={() => removeFromTeam(index)}>✕</button>
                  <img src={slot.sprite} alt={slot.name} />
                  <span>{slot.name}</span>
                </>
              ) : (
                <div className="empty-slot-indicator">+</div>
              )}
            </div>
          ))}
        </div>

        <div className="pokemon-search-panel">
          <h2>Find Pokémon</h2>
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="search-results">
            {searchResults.map(p => (
              <div key={p.id} className="search-result-item" onClick={() => addToTeam(p)}>
                <img src={p.sprite} alt={p.name} />
                <span>{p.name}</span>
                <button className="add-btn">+</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="team-actions">
        <button 
          className="primary-btn save-team-btn" 
          disabled={team.every(slot => slot === null) || loading}
          onClick={handleSaveTeam}
        >
          {loading ? 'Saving...' : 'Save Team'}
        </button>
      </div>

      {savedTeams.length > 0 && (
        <div className="saved-teams-section">
          <h2>Your Saved Teams</h2>
          <div className="saved-teams-list">
            {savedTeams.map(t => (
              <div key={t._id} className="saved-team-card">
                <h3>{t.name}</h3>
                <div className="saved-team-sprites">
                  {t.pokemon.map((p, i) => (
                    <img key={i} src={p.sprite} alt={p.name} title={p.name} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
