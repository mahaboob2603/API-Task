import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export async function fetchPokemonList(offset = 0, limit = 24) {
  const { data } = await api.get(`/pokemon?offset=${offset}&limit=${limit}`);
  return data;
}

export async function fetchPokemon(nameOrId) {
  const { data } = await api.get(`/pokemon/${nameOrId}`);
  return data;
}

export async function fetchTypes() {
  const { data } = await api.get('/pokemon/types');
  return data;
}

export async function fetchTypeChart() {
  const { data } = await api.get('/pokemon/types/chart');
  return data;
}

// --- Team Builder API ---
export async function saveTeam(teamData, token) {
  const { data } = await api.post('/teams', teamData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function getUserTeams(token) {
  const { data } = await api.get('/teams', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export default api;
