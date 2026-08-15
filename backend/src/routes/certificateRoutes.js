import express from 'express';
import {
  generateSingleCertificate,
  bulkGenerateCertificates,
  getCertificates,
  getCertificateById,
  revokeCertificate,
  reissueCertificate,
  exportCertificatesCSV,
} from '../controllers/certificateController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', generateSingleCertificate);
router.post('/bulk-generate', upload.single('csvFile'), bulkGenerateCertificates);
router.get('/export', exportCertificatesCSV);
router.get('/', getCertificates);
router.get('/:id', getCertificateById);
router.patch('/:id/revoke', revokeCertificate);
router.post('/:id/reissue', reissueCertificate);

export default router;
