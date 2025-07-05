import axios from '../utils/axios';

export const enableCollaboration = (documentId) => 
  axios.post(`/api/documents/${documentId}/collaboration/enable`);

export const disableCollaboration = (documentId) => 
  axios.post(`/api/documents/${documentId}/collaboration/disable`);

export const inviteCollaborator = (documentId, data) => 
  axios.post(`/api/documents/${documentId}/collaboration/invite`, data);

export const removeCollaborator = (documentId, userId) => 
  axios.delete(`/api/documents/${documentId}/collaboration/collaborators/${userId}`);

export const updateCollaboratorRole = (documentId, userId, role) => 
  axios.put(`/api/documents/${documentId}/collaboration/collaborators/${userId}`, { role });

export const getCollaborators = (documentId) => 
  axios.get(`/api/documents/${documentId}/collaboration/collaborators`);

export const acceptInvitation = (token) => 
  axios.post(`/api/collaborate/accept/${token}`);

export const rejectInvitation = (token) => 
  axios.post(`/api/collaborate/reject/${token}`);