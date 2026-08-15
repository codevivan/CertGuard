import express from 'express';
import { getVerificationLogs, getDashboardAnalytics } from '../controllers/logController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getVerificationLogs);
router.get('/analytics', getDashboardAnalytics);

export default router;
