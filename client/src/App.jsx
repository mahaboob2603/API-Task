import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Pokedex from './pages/Pokedex/Pokedex';
import PokemonDetail from './pages/PokemonDetail/PokemonDetail';
import TeamBuilder from './pages/TeamBuilder/TeamBuilder';
import BattleArena from './pages/BattleArena/BattleArena';
import TradeHub from './pages/TradeHub/TradeHub';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokemon/:nameOrId" element={<PokemonDetail />} />
          <Route path="/teams" element={<TeamBuilder />} />
          <Route path="/battle" element={<BattleArena />} />
          <Route path="/trade" element={<TradeHub />} />
          {/* Placeholders for other routes that can be built out later */}
          <Route path="/types" element={<div className="page" style={{paddingTop: 100, textAlign: 'center'}}><h2>Type Chart (Coming Soon)</h2></div>} />
          <Route path="/compare" element={<div className="page" style={{paddingTop: 100, textAlign: 'center'}}><h2>Compare (Coming Soon)</h2></div>} />
        </Routes>
      </Router>

    </AuthProvider>
  );
}

export default App;
