import mongoose from 'mongoose';

const cachedPokemonSchema = new mongoose.Schema({
  pokeId: { type: Number, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  speciesData: { type: mongoose.Schema.Types.Mixed },
  evolutionData: { type: mongoose.Schema.Types.Mixed },
  cachedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// TTL index — auto-delete after 7 days
cachedPokemonSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 604800 });

const CachedPokemon = mongoose.model('CachedPokemon', cachedPokemonSchema);
export default CachedPokemon;
