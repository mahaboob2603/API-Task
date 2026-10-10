import { useState } from 'react';
import './TradeHub.css';

export default function TradeHub() {
  const [activeTab, setActiveTab] = useState('gts');
  const [isSearching, setIsSearching] = useState(false);

  const mockListings = [
    { id: 1, trainer: 'Ash Ketchum', offering: 'Pikachu', seeking: 'Charizard', date: 'Just now' },
    { id: 2, trainer: 'Gary Oak', offering: 'Blastoise', seeking: 'Venusaur', date: '5 mins ago' },
    { id: 3, trainer: 'Misty', offering: 'Starmie', seeking: 'Gyarados', date: '10 mins ago' },
  ];

  return (
    <div className="trade-hub page">
      <div className="trade-hub-container">
        
        <header className="trade-header">
          <h1>Pokémon Trade Hub</h1>
          <p>Exchange Pokémon with trainers around the globe.</p>
        </header>

        <div className="trade-tabs">
          <button 
            className={`trade-tab ${activeTab === 'gts' ? 'active' : ''}`}
            onClick={() => setActiveTab('gts')}
          >
            Global Trade Station (GTS)
          </button>
          <button 
            className={`trade-tab ${activeTab === 'wonder' ? 'active' : ''}`}
            onClick={() => setActiveTab('wonder')}
          >
            Wonder Trade
          </button>
        </div>

        {activeTab === 'gts' && (
          <div className="gts-panel">
            <div className="gts-controls">
              <button className="gts-btn primary">Deposit a Pokémon</button>
              <button className="gts-btn secondary">Seek a Pokémon</button>
            </div>
            
            <div className="gts-listings">
              <h2>Recent Listings</h2>
              <div className="listings-grid">
                {mockListings.map(listing => (
                  <div key={listing.id} className="listing-card">
                    <div className="listing-header">
                      <span className="trainer-name">{listing.trainer}</span>
                      <span className="listing-date">{listing.date}</span>
                    </div>
                    <div className="listing-details">
                      <div className="trade-item">
                        <span className="trade-label">Offering</span>
                        <div className="trade-pokemon offering">{listing.offering}</div>
                      </div>
                      <div className="trade-arrow">⇄</div>
                      <div className="trade-item">
                        <span className="trade-label">Seeking</span>
                        <div className="trade-pokemon seeking">{listing.seeking}</div>
                      </div>
                    </div>
                    <button className="gts-btn action">Initiate Trade</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wonder' && (
          <div className="wonder-panel">
            <div className="wonder-info">
              <h2>Wonder Trade</h2>
              <p>Send a Pokémon into the void and receive a random one from another trainer in return! It's completely unpredictable.</p>
            </div>
            
            <div className="wonder-action">
              <div className={`wonder-machine ${isSearching ? 'active' : ''}`}>
                <div className="machine-core"></div>
                <div className="machine-ring ring-1"></div>
                <div className="machine-ring ring-2"></div>
              </div>
              
              <button 
                className="wonder-btn" 
                onClick={() => setIsSearching(!isSearching)}
              >
                {isSearching ? 'Searching network...' : 'Start Wonder Trade'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
