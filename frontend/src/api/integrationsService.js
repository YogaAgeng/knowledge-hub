import axios from '../utils/axios';

// Google Drive
export const connectGoogleDrive = () => 
  axios.get('/api/integrations/google-drive/connect');

export const disconnectGoogleDrive = () => 
  axios.post('/api/integrations/google-drive/disconnect');

export const importFromGoogleDrive = (fileIds) => 
  axios.post('/api/integrations/google-drive/import', { fileIds });

export const getGoogleDriveFiles = () => 
  axios.get('/api/integrations/google-drive/files');

// Notion
export const connectNotion = (authCode) => 
  axios.post('/api/integrations/notion/connect', { authCode });

export const disconnectNotion = () => 
  axios.post('/api/integrations/notion/disconnect');

export const importFromNotion = (pageIds) => 
  axios.post('/api/integrations/notion/import', { pageIds });

export const getNotionPages = () => 
  axios.get('/api/integrations/notion/pages');

// OneNote
export const connectOneNote = () => 
  axios.get('/api/integrations/onenote/connect');

export const disconnectOneNote = () => 
  axios.post('/api/integrations/onenote/disconnect');

export const importFromOneNote = (notebookIds) => 
  axios.post('/api/integrations/onenote/import', { notebookIds });

export const getOneNoteNotebooks = () => 
  axios.get('/api/integrations/onenote/notebooks');

// Integration Status
export const getIntegrationStatus = () => 
  axios.get('/api/integrations/status');