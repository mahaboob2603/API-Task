import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import './BattleArena.css';

const SOCKET_URL = '/'; // Proxy will handle it

export default function BattleArena() {
  const { user, getToken } = useAuth();
  const [socket, setSocket] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Game States: 'LOBBY', 'QUEUE', 'BATTLE', 'GAMEOVER'
  const [gameState, setGameState] = useState('LOBBY');
  const [battleState, setBattleState] = useState(null);
  const [battleLogs, setBattleLogs] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [winner, setWinner] = useState(null);
  const [waitingForTurn, setWaitingForTurn] = useState(false);

  const logsEndRef = useRef(null);

  useEffect(() => {
    // Fetch user teams
    if (user) {
      getToken().then(token => {
        api.getUserTeams(token).then(data => {
          if (data && data.length > 0) {
            setTeams(data);
            setSelectedTeam(data[0]); // Select first by default
          }
        }).catch(err => console.error("Failed to load teams", err));
      });
    }

    // Connect socket
    const newSocket = io(SOCKET_URL, {
      path: '/socket.io',
      autoConnect: true,
      withCredentials: true
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('queueStatus', (msg) => {
      console.log('Queue Status:', msg);
    });

    socket.on('matchFound', (data) => {
      console.log('Match Found:', data);
      setRoomId(data.roomId);
      const opp = data.players.find(p => p.id !== socket.id);
      setOpponent(opp);
      setGameState('BATTLE');
      setBattleLogs(prev => [...prev, `Match found against ${opp.name || 'Opponent'}!`]);
    });

    socket.on('battleStart', (data) => {
      console.log('Battle Start:', data);
      setBattleState(data.state);
      setBattleLogs(prev => [...prev, 'Battle has started!']);
    });

    socket.on('actionRegistered', () => {
      setWaitingForTurn(true);
      setBattleLogs(prev => [...prev, 'Waiting for opponent...']);
    });

    socket.on('turnResult', (data) => {
      console.log('Turn Result:', data);
      setBattleState(data.updatedState);
      setBattleLogs(prev => [...prev, ...data.logs]);
      setWaitingForTurn(false);
    });

    socket.on('switchComplete', (data) => {
      console.log('Switch Complete:', data);
      setBattleState(data.updatedState);
      setBattleLogs(prev => [...prev, `Player switched Pokemon!`]);
    });

    socket.on('battleOver', (data) => {
      setWinner(data.winnerId);
      setGameState('GAMEOVER');
      setBattleLogs(prev => [...prev, data.winnerId === socket.id ? 'You won the battle!' : 'You lost the battle!']);
    });

    socket.on('opponentDisconnected', () => {
      setBattleLogs(prev => [...prev, 'Opponent disconnected. You win!']);
      setWinner(socket.id);
      setGameState('GAMEOVER');
    });

    return () => {
      socket.off('queueStatus');
      socket.off('matchFound');
      socket.off('battleStart');
      socket.off('actionRegistered');
      socket.off('turnResult');
      socket.off('switchComplete');
      socket.off('battleOver');
      socket.off('opponentDisconnected');
    };
  }, [socket]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleLogs]);

  const handleJoinQueue = async () => {
    if (!socket || !selectedTeam) return;
    
    setGameState('QUEUE');
    
    // Fetch full stats for each pokemon in the team
    try {
      const teamFormat = await Promise.all(selectedTeam.pokemon.map(async (p) => {
        // Fallback stats if fetch fails
        let stats = { hp: 100, attack: 50, defense: 50, 'special-attack': 50, 'special-defense': 50, speed: 50 };
        try {
          const fullData = await api.fetchPokemon(p.pokeId || p.name.toLowerCase());
          stats = {
            hp: fullData.stats.find(s => s.stat.name === 'hp')?.base_stat || 100,
            attack: fullData.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
            defense: fullData.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
            'special-attack': fullData.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50,
            'special-defense': fullData.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50,
            speed: fullData.stats.find(s => s.stat.name === 'speed')?.base_stat || 50,
          };
        } catch (err) {
          console.warn(`Could not fetch full stats for ${p.name}, using defaults.`);
        }

        return {
          id: p.pokeId,
          name: p.name,
          types: p.types,
          stats: stats,
          moves: [
            { name: 'Tackle', type: 'normal', power: 40, category: 'physical', accuracy: 100 },
            { name: 'Ember', type: 'fire', power: 40, category: 'special', accuracy: 100 },
            { name: 'Water Gun', type: 'water', power: 40, category: 'special', accuracy: 100 },
            { name: 'Thunder Shock', type: 'electric', power: 40, category: 'special', accuracy: 100 }
          ],
          sprites: { front_default: p.sprite }
        };
      }));

      socket.emit('joinQueue', {
        team: teamFormat,
        playerName: user?.displayName || user?.email || 'Trainer'
      });
    } catch (err) {
      console.error("Error preparing team for queue:", err);
      setGameState('LOBBY');
    }
  };

  const handleAttack = (moveIndex) => {
    if (waitingForTurn || !roomId) return;
    socket.emit('submitAction', {
      roomId,
      action: { type: 'attack', moveIndex }
    });
  };

  const handleSwitch = (pokemonIndex) => {
    if (waitingForTurn || !roomId) return;
    socket.emit('submitAction', {
      roomId,
      action: { type: 'switch', pokemonIndex }
    });
  };

  const handleLeave = () => {
    if (socket && roomId) {
      socket.emit('leaveMatch', { roomId });
    }
    setGameState('LOBBY');
    setBattleState(null);
    setRoomId(null);
    setOpponent(null);
    setBattleLogs([]);
    setWinner(null);
    setWaitingForTurn(false);
  };

  if (!user) {
    return <div className="page battle-arena"><div className="battle-message">Please login to access Battle Arena.</div></div>;
  }

  return (
    <div className="page battle-arena">
      <div className="battle-container">
        {gameState === 'LOBBY' && (
          <div className="lobby-screen glass-panel">
            <h2>Battle Arena</h2>
            <p>Select a team and join the queue to battle other trainers!</p>
            
            {teams.length === 0 ? (
              <div className="no-teams">
                <p>You need to build a team first!</p>
                <a href="/teams" className="btn primary">Go to Team Builder</a>
              </div>
            ) : (
              <div className="team-selector">
                <select 
                  value={selectedTeam?._id} 
                  onChange={(e) => setSelectedTeam(teams.find(t => t._id === e.target.value))}
                >
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
                <div className="team-preview">
                  {selectedTeam?.pokemon.map((p, i) => (
                    <img key={i} src={p.sprite} alt={p.name} title={p.name} />
                  ))}
                </div>
                <button className="btn primary join-btn" onClick={handleJoinQueue}>Find Match</button>
              </div>
            )}
          </div>
        )}

        {gameState === 'QUEUE' && (
          <div className="queue-screen glass-panel">
            <h2>Searching for Opponent...</h2>
            <div className="spinner"></div>
            <button className="btn danger" onClick={() => setGameState('LOBBY')}>Cancel</button>
          </div>
        )}

        {(gameState === 'BATTLE' || gameState === 'GAMEOVER') && battleState && (
          <div className="battle-screen">
            <div className="battle-field glass-panel">
              {/* Opponent Side */}
              <div className="opponent-side">
                <div className="pokemon-status">
                  <div className="pokemon-name">{battleState.players[opponent.id].activePokemon.name}</div>
                  <div className="hp-bar-container">
                    <div 
                      className="hp-bar fill" 
                      style={{width: `${(battleState.players[opponent.id].activePokemon.hp / battleState.players[opponent.id].activePokemon.maxHp) * 100}%`}}
                    ></div>
                  </div>
                  <div className="hp-text">
                    {Math.max(0, Math.floor(battleState.players[opponent.id].activePokemon.hp))} / {battleState.players[opponent.id].activePokemon.maxHp}
                  </div>
                </div>
                <div className="pokemon-sprite">
                  <img src={battleState.players[opponent.id].activePokemon.sprites.front_default} alt="opponent" />
                </div>
              </div>

              {/* Player Side */}
              <div className="player-side">
                <div className="pokemon-sprite back-sprite">
                  <img src={battleState.players[socket.id].activePokemon.sprites.back_default || battleState.players[socket.id].activePokemon.sprites.front_default} alt="player" />
                </div>
                <div className="pokemon-status">
                  <div className="pokemon-name">{battleState.players[socket.id].activePokemon.name}</div>
                  <div className="hp-bar-container">
                    <div 
                      className="hp-bar fill" 
                      style={{width: `${(battleState.players[socket.id].activePokemon.hp / battleState.players[socket.id].activePokemon.maxHp) * 100}%`}}
                    ></div>
                  </div>
                  <div className="hp-text">
                    {Math.max(0, Math.floor(battleState.players[socket.id].activePokemon.hp))} / {battleState.players[socket.id].activePokemon.maxHp}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Logs */}
            <div className="battle-logs glass-panel">
              {battleLogs.map((log, i) => (
                <div key={i} className="log-entry">{log}</div>
              ))}
              <div ref={logsEndRef} />
            </div>

            {/* Controls */}
            {gameState === 'BATTLE' && (
              <div className="battle-controls glass-panel">
                <div className="moves-panel">
                  <h3>Moves</h3>
                  <div className="moves-grid">
                    {battleState.players[socket.id].activePokemon.moves.map((move, i) => (
                      <button 
                        key={i} 
                        className={`move-btn type-${move.type}`}
                        disabled={waitingForTurn || battleState.players[socket.id].activePokemon.hp <= 0}
                        onClick={() => handleAttack(i)}
                      >
                        {move.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="party-panel">
                  <h3>Party (Switch)</h3>
                  <div className="party-grid">
                    {battleState.players[socket.id].team.map((p, i) => (
                      <button 
                        key={i} 
                        className={`party-btn ${p.hp <= 0 ? 'fainted' : ''} ${i === battleState.players[socket.id].activeIdx ? 'active' : ''}`}
                        disabled={waitingForTurn || p.hp <= 0 || i === battleState.players[socket.id].activeIdx}
                        onClick={() => handleSwitch(i)}
                      >
                        <img src={p.sprites.front_default} alt={p.name} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState === 'GAMEOVER' && (
              <div className="game-over-panel glass-panel">
                <h2>{winner === socket.id ? 'Victory!' : 'Defeat!'}</h2>
                <button className="btn primary" onClick={handleLeave}>Return to Lobby</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
