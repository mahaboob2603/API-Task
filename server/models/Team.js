import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, default: 'My Team' },
  isPublic: { type: Boolean, default: false },
  pokemon: [{
    pokeId: { type: Number, required: true },
    name: { type: String, required: true },
    sprite: { type: String },
    types: [{ type: String }],
  }],
}, { timestamps: true });

// A user can have multiple teams, but we want to limit it to 6 pokemon per team.
// We handle that logic in the controller.

const Team = mongoose.model('Team', teamSchema);
export default Team;
