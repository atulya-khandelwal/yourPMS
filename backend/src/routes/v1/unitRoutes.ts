import express from 'express'
import { addUnit, bookUnit, availableUnits } from '../../controllers/units-controller'
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, addUnit);
router.get('/available/:property_id', authenticate, availableUnits);
router.put('/:id/book', authenticate, bookUnit)

export default router;