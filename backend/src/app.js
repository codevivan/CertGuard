import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import logRoutes from './routes/logRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'CertGuard API Server', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verify', verificationRoutes);
app.use('/api/logs', logRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Global Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
