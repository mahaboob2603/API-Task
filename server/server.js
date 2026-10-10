import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/db.js';
import pokemonRoutes from './routes/pokemonRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocketIO } from './sockets/battleSocket.js';

const app = express();
const httpServer = createServer(app);
initSocketIO(httpServer);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Routes
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/teams', teamRoutes);


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start
async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`🚀 PokéDek API running on http://localhost:${PORT}`);
  });
}

start();
