import express from 'express';
import { getUserTeams, createTeam, updateTeam, deleteTeam } from '../controllers/teamController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protect all team routes
router.use(verifyToken);

router.get('/', getUserTeams);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;
