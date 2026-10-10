import { Server } from 'socket.io';
import { BattleInstance } from '../game/BattleEngine.js';

const waitingQueue = []; // players waiting for a match
const activeRooms = new Map(); // roomId -> BattleInstance

// Default team for quick battles
const DEFAULT_TEAM = [
  { pokeId: 25, name: 'pikachu', types: ['electric'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', stats: [{ name: 'hp', value: 35 }, { name: 'attack', value: 55 }, { name: 'defense', value: 40 }, { name: 'speed', value: 90 }] },
  { pokeId: 6, name: 'charizard', types: ['fire', 'flying'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', stats: [{ name: 'hp', value: 78 }, { name: 'attack', value: 84 }, { name: 'defense', value: 78 }, { name: 'speed', value: 100 }] },
  { pokeId: 9, name: 'blastoise', types: ['water'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', stats: [{ name: 'hp', value: 79 }, { name: 'attack', value: 83 }, { name: 'defense', value: 100 }, { name: 'speed', value: 78 }] },
];

export function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Player connected: ${socket.id}`);

    // --- MATCHMAKING ---
    socket.on('findMatch', (data) => {
      const playerInfo = {
        socketId: socket.id,
        name: data?.name || `Trainer-${socket.id.slice(0, 4)}`,
        team: data?.team?.length > 0 ? data.team : DEFAULT_TEAM,
      };

      // Check if someone is already waiting
      if (waitingQueue.length > 0) {
        const opponent = waitingQueue.shift();

        // Don't match with yourself
        if (opponent.socketId === socket.id) {
          waitingQueue.push(playerInfo);
          socket.emit('matchStatus', { status: 'waiting', message: 'Searching for opponent...' });
          return;
        }

        // Create a battle room
        const roomId = `battle-${Date.now()}`;
        const battle = new BattleInstance(
          { id: opponent.socketId, name: opponent.name, team: opponent.team },
          { id: socket.id, name: playerInfo.name, team: playerInfo.team },
          roomId
        );

        activeRooms.set(roomId, battle);

        // Join both sockets to the room
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
          opponentSocket.join(roomId);
          opponentSocket.data.roomId = roomId;
          opponentSocket.emit('matchFound', {
            roomId,
            opponent: playerInfo.name,
            state: battle.getState(opponent.socketId),
          });
        }

        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.emit('matchFound', {
          roomId,
          opponent: opponent.name,
          state: battle.getState(socket.id),
        });

        console.log(`🎮 Battle started: ${opponent.name} vs ${playerInfo.name} in ${roomId}`);
      } else {
        waitingQueue.push(playerInfo);
        socket.emit('matchStatus', { status: 'waiting', message: 'Searching for opponent...' });
        console.log(`🔍 ${playerInfo.name} waiting for match...`);
      }
    });

    socket.on('cancelMatch', () => {
      const idx = waitingQueue.findIndex(p => p.socketId === socket.id);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
        socket.emit('matchStatus', { status: 'cancelled', message: 'Matchmaking cancelled' });
      }
    });

    // --- BATTLE ACTIONS ---
    socket.on('battleAction', (data) => {
      const { roomId, action } = data;
      const battle = activeRooms.get(roomId);
      if (!battle || battle.status === 'finished') return;

      const results = battle.submitAction(socket.id, action);

      if (results) {
        // Both players have acted — broadcast turn results
        for (const pid of battle.playerIds) {
          const playerSocket = io.sockets.sockets.get(pid);
          if (playerSocket) {
            playerSocket.emit('turnResult', {
              results,
              state: battle.getState(pid),
            });
          }
        }

        // Cleanup finished battles
        if (battle.status === 'finished') {
          setTimeout(() => activeRooms.delete(roomId), 60000);
        }
      } else {
        // Waiting for opponent
        socket.emit('actionConfirmed', { message: 'Waiting for opponent...' });
      }
    });

    // --- FORCE SWITCH (when active pokemon faints) ---
    socket.on('forceSwitch', (data) => {
      const { roomId, switchIndex } = data;
      const battle = activeRooms.get(roomId);
      if (!battle) return;

      const player = battle.players[socket.id];
      if (player && switchIndex >= 0 && switchIndex < player.team.length && !player.team[switchIndex].fainted) {
        player.activePokemonIndex = switchIndex;

        // Send updated state to both players
        for (const pid of battle.playerIds) {
          const playerSocket = io.sockets.sockets.get(pid);
          if (playerSocket) {
            playerSocket.emit('switchComplete', {
              state: battle.getState(pid),
            });
          }
        }
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`💔 Player disconnected: ${socket.id}`);

      // Remove from queue
      const queueIdx = waitingQueue.findIndex(p => p.socketId === socket.id);
      if (queueIdx !== -1) waitingQueue.splice(queueIdx, 1);

      // Forfeit active battle
      const roomId = socket.data.roomId;
      if (roomId) {
        const battle = activeRooms.get(roomId);
        if (battle && battle.status === 'active') {
          battle.status = 'finished';
          const winnerId = battle.playerIds.find(id => id !== socket.id);
          battle.winner = winnerId;

          const winnerSocket = io.sockets.sockets.get(winnerId);
          if (winnerSocket) {
            winnerSocket.emit('opponentDisconnected', {
              message: 'Your opponent disconnected. You win!',
              state: battle.getState(winnerId),
            });
          }
        }
      }
    });
  });

  console.log('🎮 Socket.IO initialized for PvP battles');
  return io;
}
