import express from 'express';
import { listPokemon, getOnePokemon, listTypes, typeChart } from '../controllers/pokemonController.js';

const router = express.Router();

router.get('/', listPokemon);
router.get('/types', listTypes);
router.get('/types/chart', typeChart);
router.get('/:nameOrId', getOnePokemon);

export default router;
