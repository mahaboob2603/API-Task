import Team from '../models/Team.js';

// GET /api/teams
export async function getUserTeams(req, res) {
  try {
    const userId = req.user.uid;
    const teams = await Team.find({ userId }).sort({ updatedAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /api/teams
export async function createTeam(req, res) {
  try {
    const userId = req.user.uid;
    const { name, pokemon, isPublic } = req.body;

    if (!pokemon || !Array.isArray(pokemon) || pokemon.length > 6) {
      return res.status(400).json({ error: 'Invalid team data. Max 6 Pokémon allowed.' });
    }

    const team = new Team({
      userId,
      name: name || 'New Team',
      isPublic: isPublic || false,
      pokemon,
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /api/teams/:id
export async function updateTeam(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { name, pokemon, isPublic } = req.body;

    const team = await Team.findOne({ _id: id, userId });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    if (name) team.name = name;
    if (isPublic !== undefined) team.isPublic = isPublic;
    if (pokemon) {
      if (pokemon.length > 6) return res.status(400).json({ error: 'Max 6 Pokémon allowed.' });
      team.pokemon = pokemon;
    }

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /api/teams/:id
export async function deleteTeam(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const team = await Team.findOneAndDelete({ _id: id, userId });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
