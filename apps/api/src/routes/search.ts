import { Router } from 'express';
import * as searchController from '../controllers/searchController';

const router = Router();

router.get('/artists', searchController.searchArtists);
router.get('/trending', searchController.getTrending);

export default router;
