import { Router } from 'express';
import { healthRoutes } from './health.js';
import { exampleRoutes } from './example.js';

const router = Router();

router.use(healthRoutes);
router.use(exampleRoutes);

export { router as apiRoutes };
