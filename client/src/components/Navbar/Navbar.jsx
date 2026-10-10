import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loginWithGoogle, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/pokedex', label: 'Pokédex', icon: '📖' },
    { to: '/teams', label: 'Team Builder', icon: '🛡️' },
    { to: '/battle', label: 'Battle Arena', icon: '⚔️' },
    { to: '/trade', label: 'Trade Hub', icon: '🔄' },
    { to: '/types', label: 'Types', icon: '⚡' },
    { to: '/compare', label: 'Compare', icon: '📊' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-circle"></div>
          <span className="logo-text">PokéDek</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
          
          {user ? (
            <div className="nav-auth">
              <span className="nav-username">{user.displayName || user.email}</span>
              <button onClick={logout} className="auth-btn logout-btn">Logout</button>
            </div>
          ) : (
            <button onClick={loginWithGoogle} className="auth-btn login-btn">
              Login
            </button>
          )}
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
}
