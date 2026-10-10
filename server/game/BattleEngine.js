import { getEffectiveness } from '../utils/typeChart.js';

/**
 * BattleEngine — Turn-based Pokémon battle logic.
 * Each player has a team of Pokémon (with HP, stats, types, moves).
 * Players take turns choosing attacks; damage is type-based.
 */

const MOVE_POOL = [
  { name: 'Tackle', type: 'normal', power: 40, accuracy: 100 },
  { name: 'Ember', type: 'fire', power: 40, accuracy: 100 },
  { name: 'Water Gun', type: 'water', power: 40, accuracy: 100 },
  { name: 'Vine Whip', type: 'grass', power: 45, accuracy: 100 },
  { name: 'Thunder Shock', type: 'electric', power: 40, accuracy: 100 },
  { name: 'Ice Shard', type: 'ice', power: 40, accuracy: 100 },
  { name: 'Karate Chop', type: 'fighting', power: 50, accuracy: 100 },
  { name: 'Poison Sting', type: 'poison', power: 15, accuracy: 100 },
  { name: 'Mud Shot', type: 'ground', power: 55, accuracy: 95 },
  { name: 'Gust', type: 'flying', power: 40, accuracy: 100 },
  { name: 'Confusion', type: 'psychic', power: 50, accuracy: 100 },
  { name: 'Bug Bite', type: 'bug', power: 60, accuracy: 100 },
  { name: 'Rock Throw', type: 'rock', power: 50, accuracy: 90 },
  { name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100 },
  { name: 'Dragon Claw', type: 'dragon', power: 80, accuracy: 100 },
  { name: 'Bite', type: 'dark', power: 60, accuracy: 100 },
  { name: 'Iron Tail', type: 'steel', power: 100, accuracy: 75 },
  { name: 'Dazzling Gleam', type: 'fairy', power: 80, accuracy: 100 },
];

function getMovesForPokemon(types) {
  const moves = [];
  // Give STAB moves first (same type attack bonus)
  for (const type of types) {
    const stab = MOVE_POOL.find(m => m.type === type);
    if (stab) moves.push({ ...stab });
  }
  // Fill remaining slots with Tackle + random
  if (!moves.find(m => m.name === 'Tackle')) {
    moves.push({ ...MOVE_POOL[0] }); // Tackle
  }
  // Add one more random move
  const remaining = MOVE_POOL.filter(m => !moves.find(mv => mv.name === m.name));
  if (remaining.length > 0) {
    moves.push({ ...remaining[Math.floor(Math.random() * remaining.length)] });
  }
  return moves.slice(0, 4);
}

function buildBattlePokemon(pokemon) {
  const hpStat = pokemon.stats?.hp || 100;
  const atkStat = pokemon.stats?.attack || 50;
  const defStat = pokemon.stats?.defense || 50;
  const spdStat = pokemon.stats?.speed || 50;

  const maxHp = Math.floor(hpStat * 2 + 50); // Simplified HP formula

  return {
    id: pokemon.pokeId || pokemon.id,
    name: pokemon.name,
    types: pokemon.types || [],
    sprite: pokemon.sprite,
    maxHp,
    currentHp: maxHp,
    attack: atkStat,
    defense: defStat,
    speed: spdStat,
    moves: getMovesForPokemon(pokemon.types || []),
    fainted: false,
  };
}

function calculateDamage(attacker, move, defender) {
  const level = 50;
  const power = move.power;
  const attack = attacker.attack;
  const defense = defender.defense;

  // Check accuracy
  if (Math.random() * 100 > move.accuracy) {
    return { damage: 0, missed: true, effectiveness: 1 };
  }

  // Base damage formula (simplified from mainline games)
  let baseDamage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50 + 2);

  // STAB (Same Type Attack Bonus)
  const stab = attacker.types.includes(move.type) ? 1.5 : 1;

  // Type effectiveness (against all defender types)
  let effectiveness = 1;
  for (const defType of defender.types) {
    effectiveness *= getEffectiveness(move.type, defType);
  }

  // Random variance (85-100%)
  const random = (Math.random() * 15 + 85) / 100;

  // Critical hit (6.25% chance, 1.5x)
  const critRoll = Math.random();
  const critical = critRoll < 0.0625 ? 1.5 : 1;

  const totalDamage = Math.max(1, Math.floor(baseDamage * stab * effectiveness * random * critical));

  return {
    damage: totalDamage,
    missed: false,
    effectiveness,
    critical: critical > 1,
    stab: stab > 1,
  };
}

export class BattleInstance {
  constructor(player1, player2, roomId) {
    this.roomId = roomId;
    this.players = {
      [player1.id]: {
        id: player1.id,
        name: player1.name,
        team: player1.team.map(p => buildBattlePokemon(p)),
        activePokemonIndex: 0,
        ready: false,
        action: null,
      },
      [player2.id]: {
        id: player2.id,
        name: player2.name,
        team: player2.team.map(p => buildBattlePokemon(p)),
        activePokemonIndex: 0,
        ready: false,
        action: null,
      },
    };
    this.playerIds = [player1.id, player2.id];
    this.turn = 1;
    this.log = [];
    this.status = 'active'; // active | finished
    this.winner = null;
  }

  getActivePokemon(playerId) {
    const player = this.players[playerId];
    return player.team[player.activePokemonIndex];
  }

  getAliveTeamCount(playerId) {
    return this.players[playerId].team.filter(p => !p.fainted).length;
  }

  submitAction(playerId, action) {
    this.players[playerId].action = action;
    this.players[playerId].ready = true;

    // Check if both players are ready
    const allReady = this.playerIds.every(id => this.players[id].ready);
    if (allReady) {
      return this.resolveTurn();
    }
    return null; // Waiting for other player
  }

  resolveTurn() {
    const results = [];
    const [id1, id2] = this.playerIds;
    const p1 = this.players[id1];
    const p2 = this.players[id2];

    // Handle switches first
    for (const pid of this.playerIds) {
      const player = this.players[pid];
      if (player.action?.type === 'switch') {
        const switchTo = player.action.index;
        if (switchTo >= 0 && switchTo < player.team.length && !player.team[switchTo].fainted) {
          const old = player.team[player.activePokemonIndex].name;
          player.activePokemonIndex = switchTo;
          const newPoke = player.team[switchTo].name;
          results.push({
            type: 'switch',
            player: pid,
            playerName: player.name,
            from: old,
            to: newPoke,
            message: `${player.name} switched ${old} for ${newPoke}!`,
          });
        }
      }
    }

    // Resolve attacks by speed order
    const attackers = this.playerIds
      .filter(id => this.players[id].action?.type === 'attack')
      .map(id => ({
        id,
        speed: this.getActivePokemon(id).speed,
      }))
      .sort((a, b) => b.speed - a.speed);

    for (const { id: attackerId } of attackers) {
      const attacker = this.getActivePokemon(attackerId);
      if (attacker.fainted) continue;

      const defenderId = this.playerIds.find(id => id !== attackerId);
      const defender = this.getActivePokemon(defenderId);
      if (defender.fainted) continue;

      const moveIndex = this.players[attackerId].action.moveIndex || 0;
      const move = attacker.moves[moveIndex] || attacker.moves[0];

      const result = calculateDamage(attacker, move, defender);

      if (result.missed) {
        results.push({
          type: 'attack',
          attacker: attackerId,
          attackerName: this.players[attackerId].name,
          pokemonName: attacker.name,
          move: move.name,
          missed: true,
          message: `${attacker.name} used ${move.name}... but it missed!`,
        });
      } else {
        defender.currentHp = Math.max(0, defender.currentHp - result.damage);

        let effectMsg = '';
        if (result.effectiveness > 1) effectMsg = "It's super effective!";
        else if (result.effectiveness < 1 && result.effectiveness > 0) effectMsg = "It's not very effective...";
        else if (result.effectiveness === 0) effectMsg = "It had no effect!";

        results.push({
          type: 'attack',
          attacker: attackerId,
          attackerName: this.players[attackerId].name,
          pokemonName: attacker.name,
          move: move.name,
          damage: result.damage,
          effectiveness: result.effectiveness,
          critical: result.critical,
          effectMsg,
          defenderHp: defender.currentHp,
          defenderMaxHp: defender.maxHp,
          message: `${attacker.name} used ${move.name}! ${result.critical ? 'Critical hit! ' : ''}${effectMsg} Dealt ${result.damage} damage!`,
        });

        // Check if defender fainted
        if (defender.currentHp <= 0) {
          defender.fainted = true;
          results.push({
            type: 'faint',
            player: defenderId,
            playerName: this.players[defenderId].name,
            pokemonName: defender.name,
            message: `${defender.name} fainted!`,
          });

          // Check if all Pokémon on the defender's team fainted
          const aliveCount = this.getAliveTeamCount(defenderId);
          if (aliveCount === 0) {
            this.status = 'finished';
            this.winner = attackerId;
            results.push({
              type: 'victory',
              winner: attackerId,
              winnerName: this.players[attackerId].name,
              loser: defenderId,
              loserName: this.players[defenderId].name,
              message: `${this.players[attackerId].name} wins the battle!`,
            });
          } else {
            results.push({
              type: 'forceSwitch',
              player: defenderId,
              message: `${this.players[defenderId].name} must choose another Pokémon!`,
            });
          }
        }
      }
    }

    // Reset for next turn
    this.turn++;
    for (const pid of this.playerIds) {
      this.players[pid].ready = false;
      this.players[pid].action = null;
    }

    this.log.push(...results);
    return results;
  }

  getState(forPlayerId) {
    const opponentId = this.playerIds.find(id => id !== forPlayerId);
    const player = this.players[forPlayerId];
    const opponent = this.players[opponentId];
    const activePoke = this.getActivePokemon(forPlayerId);
    const oppActivePoke = this.getActivePokemon(opponentId);

    return {
      roomId: this.roomId,
      turn: this.turn,
      status: this.status,
      winner: this.winner,
      player: {
        name: player.name,
        activePokemon: activePoke,
        team: player.team.map(p => ({
          name: p.name,
          sprite: p.sprite,
          currentHp: p.currentHp,
          maxHp: p.maxHp,
          fainted: p.fainted,
          types: p.types,
        })),
      },
      opponent: {
        name: opponent.name,
        activePokemon: {
          name: oppActivePoke.name,
          sprite: oppActivePoke.sprite,
          currentHp: oppActivePoke.currentHp,
          maxHp: oppActivePoke.maxHp,
          types: oppActivePoke.types,
          fainted: oppActivePoke.fainted,
        },
        aliveCount: this.getAliveTeamCount(opponentId),
      },
    };
  }
}
