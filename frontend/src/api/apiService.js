import axios from '../utils/axios';

// Auth APIs - TANPA /api prefix karena sudah di base URL
export const login = (credentials) => axios.post('/api/auth/login', credentials);
export const register = (userData) => axios.post('/api/auth/register', userData);
export const getProfile = () => axios.get('/api/auth/profile');
export const updateProfile = (data) => axios.put('/api/auth/profile', data);

// Document APIs
export const getDocuments = (params) => axios.get('/api/documents', { params });
export const getDocumentById = (id) => axios.get(`/api/documents/${id}`);
export const createDocument = (data) => axios.post('/api/documents', data);
export const updateDocument = (id, data) => axios.put(`/api/documents/${id}`, data);
export const deleteDocument = (id) => axios.delete(`/api/documents/${id}`);
export const uploadDocument = (formData) => axios.post('/api/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Document Permissions
export const getDocumentPermissions = (documentId) => 
  axios.get(`/api/documents/${documentId}/permissions`);

// Document Versions
export const getDocumentVersions = (documentId) => 
  axios.get(`/api/documents/${documentId}/versions`);

// Study Groups
export const getStudyGroups = (params) => axios.get('/api/study-groups', { params });
export const getStudyGroupById = (id) => axios.get(`/api/study-groups/${id}`);
export const createStudyGroup = (data) => axios.post('/api/study-groups', data);
export const joinStudyGroup = (id, data) => axios.post(`/api/study-groups/${id}/join`, data);
export const leaveStudyGroup = (id) => axios.post(`/api/study-groups/${id}/leave`);

// Search
export const searchDocuments = (query, filters) => 
  axios.get('/api/search', { params: { q: query, ...filters } });

// Stats
export const getDocumentStats = () => axios.get('/api/documents/stats');
export const getComments = (documentId) => 
  axios.get(`/api/documents/${documentId}/comments`);

export const addComment = (documentId, data) => 
  axios.post(`/api/documents/${documentId}/comments`, data);

export const updateComment = (commentId, data) => 
  axios.put(`/api/comments/${commentId}`, data);

export const deleteComment = (commentId) => 
  axios.delete(`/api/comments/${commentId}`);

// Collaborators
export const getCollaborators = (documentId) => 
  axios.get(`/api/documents/${documentId}/collaboration/collaborators`);

export const inviteCollaborator = (documentId, data) => 
  axios.post(`/api/documents/${documentId}/collaboration/invite`, data);

export const removeCollaborator = (documentId, userId) => 
  axios.delete(`/api/documents/${documentId}/collaboration/collaborators/${userId}`);

export const updateCollaboratorRole = (documentId, userId, role) => 
  axios.put(`/api/documents/${documentId}/collaboration/collaborators/${userId}`, { role });

// Collaboration
export const enableCollaboration = (documentId) => 
  axios.post(`/api/documents/${documentId}/collaboration/enable`);

export const disableCollaboration = (documentId) => 
  axios.post(`/api/documents/${documentId}/collaboration/disable`);

// Integration Status Checks
export const getGoogleDriveStatus = () => 
  axios.get('/api/integrations/google-drive/status');

export const getNotionStatus = () => 
  axios.get('/api/integrations/notion/status');

export const getOneNoteStatus = () => 
  axios.get('/api/integrations/onenote/status');

// Google Drive specific
export const connectGoogleDrive = () => 
  axios.post('/api/integrations/google-drive/connect');

export const disconnectGoogleDrive = () => 
  axios.post('/api/integrations/google-drive/disconnect');

export const getGoogleDriveAuthUrl = () => 
  axios.get('/api/integrations/google-drive/auth-url');

export const listGoogleDriveFiles = (folderId) => 
  axios.get('/api/integrations/google-drive/files', { 
    params: { folderId } 
  });

// Notion specific
export const connectNotion = (token) => 
  axios.post('/api/integrations/notion/connect', { token });

export const disconnectNotion = () => 
  axios.post('/api/integrations/notion/disconnect');

// OneNote specific
export const connectOneNote = () => 
  axios.post('/api/integrations/onenote/connect');

export const disconnectOneNote = () => 
  axios.post('/api/integrations/onenote/disconnect');

// Add logout function
export const logout = () => axios.post('/api/auth/logout');