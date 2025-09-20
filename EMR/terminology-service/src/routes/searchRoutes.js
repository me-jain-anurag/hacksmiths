import express from 'express';
import { validateApiKey, validateAbhaToken } from '../utils/tokenValidator.js';
import { searchController } from '../controllers/searchController.js';

const router = express.Router();

router.post('/', validateApiKey, validateAbhaToken, searchController);

export default router;
