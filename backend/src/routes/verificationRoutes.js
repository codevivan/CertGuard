import express from 'express';
import { verifyCertificate } from '../controllers/verificationController.js';
import { verifyRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public route protected by rate limiter
router.get('/:certCode', verifyRateLimiter, verifyCertificate);

export default router;
