import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = 'Search Pokémon...' }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim().toLowerCase());
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            onClick={() => { setValue(''); onSearch(''); }}
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="search-btn">
        <span>Search</span>
      </button>
    </form>
  );
}
