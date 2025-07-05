import axios from '../utils/axios';

export const getDiscussions = (documentId, params) => 
  axios.get(`/api/documents/${documentId}/discussions`, { params });

export const createDiscussion = (documentId, data) => 
  axios.post(`/api/documents/${documentId}/discussions`, data);

export const updateDiscussion = (discussionId, data) => 
  axios.put(`/api/discussions/${discussionId}`, data);

export const deleteDiscussion = (discussionId) => 
  axios.delete(`/api/discussions/${discussionId}`);

export const addReaction = (discussionId, type) => 
  axios.post(`/api/discussions/${discussionId}/reactions`, { type });