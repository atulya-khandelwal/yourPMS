import express from 'express'
import propertyRoutes from './propertyRoutes'
import floorRoutes from './floorRoutes'
import unitRoutes from './unitRoutes'
import authRoutes from './authRoutes'

const router = express.Router();

router.use('/properties', propertyRoutes);
router.use('/floors', floorRoutes);
router.use('/units', unitRoutes);
router.use('/auth', authRoutes);

export default router;