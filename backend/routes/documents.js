// routes/documents.js
import express from 'express';
import * as documentController from '../controllers/documentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth.authMiddleware, documentController.createDocument);
router.get('/', auth.authMiddleware, documentController.getUserDocuments);
router.get('/:id', auth.authMiddleware, documentController.getDocumentById);
router.put('/:id', auth.authMiddleware, documentController.updateDocument);
router.delete('/:id', auth.authMiddleware, documentController.deleteDocument);

export default router;