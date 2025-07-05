import express from 'express';
import * as authController from '../controllers/authControllers.js';
import * as documentController from '../controllers/documentController.js';
import * as integrationController from '../controllers/integrationController.js';
import * as studyGroupController from '../controllers/studyGroupController.js';
import * as discussionController from '../controllers/discussionController.js';
import * as collaborationController from '../controllers/collaborationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import { 
  loginValidations, 
  registerValidations, 
  documentValidations,
  validate 
} from '../middleware/validations.js';

const router = express.Router();

// ===== AUTH ROUTES =====
router.post('/auth/register', registerValidations, validate, authController.register);
router.post('/auth/login', loginValidations, validate, authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, authController.updateProfile);

// ===== DOCUMENT ROUTES =====

router.get('/documents', authMiddleware, documentController.getDocuments);
router.get('/documents/stats', authMiddleware, documentController.getDocumentStats);
router.get('/documents/:id', authMiddleware, documentController.getDocumentById);
router.post('/documents', authMiddleware, documentValidations, validate, documentController.createDocument);
router.put('/documents/:id', authMiddleware, documentController.updateDocument);
router.delete('/documents/:id', authMiddleware, documentController.deleteDocument);
router.post('/documents/upload', authMiddleware, upload.single('file'), documentController.uploadDocument);
router.get('/documents/:id/versions', authMiddleware, documentController.getDocumentVersions);
router.get('/documents/:id/permissions', authMiddleware, documentController.getDocumentPermissions);

// ===== COLLABORATION ROUTES =====
router.post('/documents/:id/collaboration/enable', authMiddleware, collaborationController.enableCollaboration);
router.post('/documents/:id/collaboration/disable', authMiddleware, collaborationController.disableCollaboration);
router.post('/documents/:id/collaboration/invite', authMiddleware, collaborationController.inviteCollaborator);
router.get('/documents/:id/collaboration/collaborators', authMiddleware, collaborationController.getCollaborators);
router.delete('/documents/:id/collaboration/collaborators/:userId', authMiddleware, collaborationController.removeCollaborator);
router.put('/documents/:id/collaboration/collaborators/:userId', authMiddleware, collaborationController.updateCollaboratorRole);
router.post('/collaborate/accept/:token', authMiddleware, collaborationController.acceptInvitation);
router.post('/collaborate/reject/:token', authMiddleware, collaborationController.rejectInvitation);

// ===== DISCUSSION ROUTES =====
router.get('/documents/:documentId/discussions', authMiddleware, discussionController.getDiscussions);
router.post('/documents/:documentId/discussions', authMiddleware, discussionController.createDiscussion);
router.put('/discussions/:id', authMiddleware, discussionController.updateDiscussion);
router.delete('/discussions/:id', authMiddleware, discussionController.deleteDiscussion);
router.post('/discussions/:id/reactions', authMiddleware, discussionController.addReaction);

// ===== STUDY GROUP ROUTES =====
router.get('/study-groups', authMiddleware, studyGroupController.getStudyGroups);
// router.get('/study-groups/:id', authMiddleware, studyGroupController.getStudyGroupById);
router.post('/study-groups', authMiddleware, studyGroupController.createStudyGroup);
router.put('/study-groups/:id', authMiddleware, studyGroupController.updateStudyGroup);
router.delete('/study-groups/:id', authMiddleware, studyGroupController.deleteStudyGroup);
router.post('/study-groups/:id/join', authMiddleware, studyGroupController.joinStudyGroup);
router.post('/study-groups/:id/leave', authMiddleware, studyGroupController.leaveStudyGroup);
// router.get('/study-groups/:id/documents', authMiddleware, studyGroupController.getGroupDocuments);
// router.post('/study-groups/:id/invite', authMiddleware, studyGroupController.inviteMember);

// ===== INTEGRATION ROUTES =====
router.get('/integrations/status', authMiddleware, integrationController.getIntegrationStatus);

// Google Drive Integration
router.get('/integrations/google-drive/connect', authMiddleware, integrationController.connectGoogleDrive);
router.get('/integrations/google-drive/callback', authMiddleware, integrationController.googleDriveCallback);
router.post('/integrations/google-drive/disconnect', authMiddleware, integrationController.disconnectGoogleDrive);
router.get('/integrations/google-drive/files', authMiddleware, integrationController.getGoogleDriveFiles);
router.post('/integrations/google-drive/import', authMiddleware, integrationController.importFromGoogleDrive);

// Notion Integration
router.post('/integrations/notion/connect', authMiddleware, integrationController.connectNotion);
router.post('/integrations/notion/disconnect', authMiddleware, integrationController.disconnectNotion);
router.get('/integrations/notion/pages', authMiddleware, integrationController.getNotionPages);
router.post('/integrations/notion/import', authMiddleware, integrationController.importFromNotion);

// OneNote Integration
router.get('/integrations/onenote/connect', authMiddleware, integrationController.connectOneNote);
router.get('/integrations/onenote/callback', authMiddleware, integrationController.oneNoteCallback);
router.post('/integrations/onenote/disconnect', authMiddleware, integrationController.disconnectOneNote);
router.get('/integrations/onenote/notebooks', authMiddleware, integrationController.getOneNoteNotebooks);
router.post('/integrations/onenote/import', authMiddleware, integrationController.importFromOneNote);

// ===== SEARCH ROUTE =====
router.get('/search', authMiddleware, documentController.searchDocuments);

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;