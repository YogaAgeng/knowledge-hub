export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  
  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_BY_ID: (id) => `/documents/${id}`,
  UPLOAD_DOCUMENT: '/documents/upload',
  
  // Study Groups
  STUDY_GROUPS: '/study-groups',
  STUDY_GROUP_BY_ID: (id) => `/study-groups/${id}`,
  JOIN_GROUP: (id) => `/study-groups/${id}/join`,
  
  // Integrations
  INTEGRATIONS_STATUS: '/integrations/status',
  GOOGLE_DRIVE_CONNECT: '/integrations/google-drive/connect',
  NOTION_CONNECT: '/integrations/notion/connect',
  
  // Comments
  DOCUMENT_COMMENTS: (docId) => `/documents/${docId}/comments`,
  
  // Collaboration
  ENABLE_COLLAB: (docId) => `/documents/${docId}/collaboration/enable`,
  INVITE_COLLAB: (docId) => `/documents/${docId}/collaboration/invite`
};