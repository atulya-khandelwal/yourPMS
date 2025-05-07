import express from 'express'
import { addFloors } from '../../controllers/floors-controller'
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, addFloors)

export default router;