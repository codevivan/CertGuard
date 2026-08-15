import express from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', upload.single('templateImage'), createTemplate);
router.put('/:id', upload.single('templateImage'), updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
