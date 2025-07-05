import { google } from 'googleapis';
import User from '../models/User.js';

class GoogleDriveService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5000/api/integrations/google-drive/callback'
    );
  }

  // Generate OAuth2 authorization URL
  async getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Handle OAuth callback and store tokens
  async handleOAuthCallback(code, userId) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Store tokens for user
      await User.findByIdAndUpdate(userId, {
        'integrations.googleDrive': {
          connected: true,
          tokens: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date
          },
          connectedAt: new Date()
        }
      });
      
      return tokens;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw new Error('Failed to exchange code for tokens: ' + error.message);
    }
  }

  // Set user credentials for API calls
  async setUserCredentials(userId) {
    const user = await User.findById(userId);
    if (!user?.integrations?.googleDrive?.connected) {
      throw new Error('Google Drive not connected for this user');
    }
    
    const tokens = user.integrations.googleDrive.tokens;
    this.oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    // Check if token needs refresh
    if (tokens.expiryDate && new Date() > new Date(tokens.expiryDate)) {
      await this.refreshTokens(userId);
    }
  }

  // Refresh expired tokens
  async refreshTokens(userId) {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      await User.findByIdAndUpdate(userId, {
        'integrations.googleDrive.tokens': {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token,
          expiryDate: credentials.expiry_date
        }
      });
      
      this.oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh tokens');
    }
  }

  // List importable files from Google Drive
  async listImportableFiles(userId) {
    await this.setUserCredentials(userId);
    
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      const response = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.document' or mimeType='text/plain' or mimeType='text/markdown' or mimeType='application/rtf'",
        fields: 'files(id, name, mimeType, modifiedTime, size, webViewLink, parents)',
        pageSize: 50,
        orderBy: 'modifiedTime desc'
      });
      
      return response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        size: file.size,
        webViewLink: file.webViewLink,
        canImport: this.canImportFile(file.mimeType),
        icon: this.getFileIcon(file.mimeType)
      }));
    } catch (error) {
      console.error('List files error:', error);
      throw new Error('Failed to list files: ' + error.message);
    }
  }

  // Check if file type can be imported
  canImportFile(mimeType) {
    const supportedTypes = [
      'application/vnd.google-apps.document',
      'text/plain',
      'text/markdown',
      'application/rtf'
    ];
    return supportedTypes.includes(mimeType);
  }

  // Get appropriate icon for file type
  getFileIcon(mimeType) {
    const icons = {
      'application/vnd.google-apps.document': '📄',
      'text/plain': '📝',
      'text/markdown': '📋',
      'application/rtf': '📄'
    };
    return icons[mimeType] || '📄';
  }

  // Download file content
  async downloadFileContent(fileId, userId) {
    await this.setUserCredentials(userId);
    
    const drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    
    try {
      // Get file metadata first
      const fileMetadata = await drive.files.get({
        fileId,
        fields: 'name, mimeType, size'
      });
      
      let content;
      
      if (fileMetadata.data.mimeType === 'application/vnd.google-apps.document') {
        // Export Google Docs as plain text
        const response = await drive.files.export({
          fileId,
          mimeType: 'text/plain'
        });
        content = response.data;
      } else {
        // Download other text files directly
        const response = await drive.files.get({
          fileId,
          alt: 'media'
        });
        content = response.data;
      }
      
      return {
        name: fileMetadata.data.name,
        content: typeof content === 'string' ? content : content.toString(),
        mimeType: fileMetadata.data.mimeType,
        size: fileMetadata.data.size
      };
    } catch (error) {
      console.error('Download file error:', error);
      throw new Error('Failed to download file: ' + error.message);
    }
  }

  // Import multiple files
  async importFiles(fileIds, userId) {
    const results = [];
    const errors = [];
    
    for (const fileId of fileIds) {
      try {
        const fileData = await this.downloadFileContent(fileId, userId);
        results.push({
          fileId,
          ...fileData,
          status: 'success'
        });
      } catch (error) {
        errors.push({
          fileId,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    return { results, errors };
  }

  // Disconnect Google Drive for user
  async disconnect(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        'integrations.googleDrive': {
          connected: false,
          tokens: {},
          connectedAt: null
        }
      });
      
      return true;
    } catch (error) {
      console.error('Disconnect error:', error);
      throw new Error('Failed to disconnect Google Drive');
    }
  }

  // Get connection status
  async getConnectionStatus(userId) {
    const user = await User.findById(userId);
    const integration = user?.integrations?.googleDrive;
    
    return {
      connected: integration?.connected || false,
      connectedAt: integration?.connectedAt,
      hasValidTokens: !!(integration?.tokens?.accessToken)
    };
  }
}

const googleDriveService = new GoogleDriveService();
export default GoogleDriveService;