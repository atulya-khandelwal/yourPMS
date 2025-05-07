import express from 'express'
import { addProperty, getAllProperties, propertyDetails } from '../../controllers/properties-controller'
import { authenticate } from '../../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, addProperty);
router.get('/:id/details', authenticate, propertyDetails);
router.get('/all-properties',authenticate, getAllProperties); // Assuming this is the correct endpoint for all properties


export default router;