// ===== /backend/controllers/integrationControllers.js =====
import User from '../models/User.js';
import Document from '../models/Document.js';

// Note: Untuk production, install dependencies ini:
// npm install googleapis @notionhq/client axios
// Untuk sementara, kita akan return dummy response

// @desc    Get integration status for user
// @route   GET /api/integrations/status
// @access  Private
export const getIntegrationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('integrations');
    
    const status = {
      googleDrive: false,
      notion: false,
      oneNote: false
    };

    if (user.integrations) {
      status.googleDrive = user.integrations.googleDrive?.connected || false;
      status.notion = user.integrations.notion?.connected || false;
      status.oneNote = user.integrations.oneNote?.connected || false;
    }

    res.json({
      success: true,
      data: { status, integrations: user.integrations || {} }
    });
  } catch (error) {
    console.error('Get integration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== GOOGLE DRIVE INTEGRATION =====

// @desc    Start Google Drive OAuth flow
// @route   GET /api/integrations/google-drive/connect
// @access  Private
export const connectGoogleDrive = async (req, res) => {
  try {
    // Simplified version - return dummy URL
    const authUrl = `https://accounts.google.com/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID || 'dummy-client-id'}` +
      `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/integrations/google-drive/callback'}` +
      `&response_type=code` +
      `&scope=https://www.googleapis.com/auth/drive.readonly` +
      `&state=${req.user.id}`;

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('Google Drive connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Handle Google Drive OAuth callback
// @route   GET /api/integrations/google-drive/callback
// @access  Public (but validates state)
export const googleDriveCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=missing_params`);
    }

    // In production, exchange code for token
    // For now, just save dummy integration
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=user_not_found`);
    }

    if (!user.integrations) {
      user.integrations = {};
    }

    user.integrations.googleDrive = {
      connected: true,
      connectedAt: new Date(),
      accessToken: 'dummy-token', // In production, get real token
      refreshToken: 'dummy-refresh-token'
    };

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?success=google_drive_connected`);
  } catch (error) {
    console.error('Google Drive callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=connection_failed`);
  }
};

// @desc    Disconnect Google Drive
// @route   POST /api/integrations/google-drive/disconnect
// @access  Private
export const disconnectGoogleDrive = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.integrations && user.integrations.googleDrive) {
      user.integrations.googleDrive = {
        connected: false,
        disconnectedAt: new Date()
      };
      await user.save();
    }

    res.json({
      success: true,
      message: 'Google Drive berhasil diputuskan'
    });
  } catch (error) {
    console.error('Google Drive disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get Google Drive files
// @route   GET /api/integrations/google-drive/files
// @access  Private
export const getGoogleDriveFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.googleDrive?.connected) {
      return res.status(404).json({
        success: false,
        message: 'Google Drive tidak terhubung'
      });
    }

    // In production, fetch real files
    // For now, return dummy data
    const dummyFiles = [
      {
        id: '1',
        name: 'Catatan Kuliah.docx',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: new Date().toISOString(),
        size: 1024
      },
      {
        id: '2', 
        name: 'Materi Algoritma.pdf',
        mimeType: 'application/pdf',
        modifiedTime: new Date().toISOString(),
        size: 2048
      }
    ];

    res.json({
      success: true,
      data: { files: dummyFiles }
    });
  } catch (error) {
    console.error('Get Google Drive files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Import file from Google Drive
// @route   POST /api/integrations/google-drive/import
// @access  Private
export const importFromGoogleDrive = async (req, res) => {
  try {
    const { fileId, fileName, mimeType } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.googleDrive?.connected) {
      return res.status(404).json({
        success: false,
        message: 'Google Drive tidak terhubung'
      });
    }

    // In production, fetch real file content
    // For now, create dummy document
    const document = await Document.create({
      judul: fileName || 'Imported from Google Drive',
      deskripsi: `Imported from Google Drive`,
      kategori: 'lainnya',
      mataKuliah: 'General',
      tags: ['google-drive', 'imported'],
      konten: 'This is dummy content. In production, real content would be fetched from Google Drive.',
      format: 'text',
      penulis: req.user.id,
      sourceIntegration: {
        platform: 'googleDrive',
        fileId,
        fileName,
        importedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'File berhasil diimpor dari Google Drive',
      data: { document }
    });
  } catch (error) {
    console.error('Import from Google Drive error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== NOTION INTEGRATION =====

// @desc    Connect to Notion
// @route   POST /api/integrations/notion/connect
// @access  Private
export const connectNotion = async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Notion API key diperlukan'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.integrations) {
      user.integrations = {};
    }

    user.integrations.notion = {
      connected: true,
      connectedAt: new Date(),
      apiKey: apiKey // In production, encrypt this
    };

    await user.save();

    res.json({
      success: true,
      message: 'Notion berhasil terhubung'
    });
  } catch (error) {
    console.error('Notion connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Disconnect Notion
// @route   POST /api/integrations/notion/disconnect
// @access  Private
export const disconnectNotion = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.integrations && user.integrations.notion) {
      user.integrations.notion = {
        connected: false,
        disconnectedAt: new Date()
      };
      await user.save();
    }

    res.json({
      success: true,
      message: 'Notion berhasil diputuskan'
    });
  } catch (error) {
    console.error('Notion disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get Notion pages
// @route   GET /api/integrations/notion/pages
// @access  Private
export const getNotionPages = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.notion?.connected) {
      return res.status(404).json({
        success: false,
        message: 'Notion tidak terhubung'
      });
    }

    // In production, fetch real pages
    // For now, return dummy data
    const dummyPages = [
      {
        id: '1',
        title: 'Catatan Machine Learning',
        lastEdited: new Date().toISOString(),
        url: 'https://notion.so/dummy'
      },
      {
        id: '2',
        title: 'Project Documentation',
        lastEdited: new Date().toISOString(),
        url: 'https://notion.so/dummy2'
      }
    ];

    res.json({
      success: true,
      data: { pages: dummyPages }
    });
  } catch (error) {
    console.error('Get Notion pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Import page from Notion
// @route   POST /api/integrations/notion/import
// @access  Private
export const importFromNotion = async (req, res) => {
  try {
    const { pageId, pageTitle } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.notion?.connected) {
      return res.status(404).json({
        success: false,
        message: 'Notion tidak terhubung'
      });
    }

    // In production, fetch real page content
    // For now, create dummy document
    const document = await Document.create({
      judul: pageTitle || 'Imported from Notion',
      deskripsi: 'Imported from Notion',
      kategori: 'lainnya',
      mataKuliah: 'General',
      tags: ['notion', 'imported'],
      konten: '# Notion Page\n\nThis is dummy content. In production, real content would be fetched from Notion.',
      format: 'markdown',
      penulis: req.user.id,
      sourceIntegration: {
        platform: 'notion',
        fileId: pageId,
        fileName: pageTitle,
        importedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Page berhasil diimpor dari Notion',
      data: { document }
    });
  } catch (error) {
    console.error('Import from Notion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ===== ONENOTE INTEGRATION =====

// @desc    Start OneNote OAuth flow
// @route   GET /api/integrations/onenote/connect
// @access  Private
export const connectOneNote = async (req, res) => {
  try {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${process.env.ONENOTE_CLIENT_ID || 'dummy-client-id'}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(process.env.ONENOTE_REDIRECT_URI || 'http://localhost:5000/api/integrations/onenote/callback')}` +
      `&scope=${encodeURIComponent('Notes.Read Notes.Read.All offline_access')}` +
      `&state=${req.user.id}`;

    res.json({
      success: true,
      data: { authUrl }
    });
  } catch (error) {
    console.error('OneNote connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Handle OneNote OAuth callback
// @route   GET /api/integrations/onenote/callback
// @access  Public (but validates state)
export const oneNoteCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=missing_params`);
    }

    // In production, exchange code for token
    // For now, just save dummy integration
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=user_not_found`);
    }

    if (!user.integrations) {
      user.integrations = {};
    }

    user.integrations.oneNote = {
      connected: true,
      connectedAt: new Date(),
      accessToken: 'dummy-token',
      refreshToken: 'dummy-refresh-token'
    };

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?success=onenote_connected`);
  } catch (error) {
    console.error('OneNote callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=connection_failed`);
  }
};

// @desc    Disconnect OneNote
// @route   POST /api/integrations/onenote/disconnect
// @access  Private
export const disconnectOneNote = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.integrations && user.integrations.oneNote) {
      user.integrations.oneNote = {
        connected: false,
        disconnectedAt: new Date()
      };
      await user.save();
    }

    res.json({
      success: true,
      message: 'OneNote berhasil diputuskan'
    });
  } catch (error) {
    console.error('OneNote disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get OneNote notebooks
// @route   GET /api/integrations/onenote/notebooks
// @access  Private
export const getOneNoteNotebooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.oneNote?.connected) {
      return res.status(404).json({
        success: false,
        message: 'OneNote tidak terhubung'
      });
    }

    // In production, fetch real notebooks
    // For now, return dummy data
    const dummyNotebooks = [
      {
        id: '1',
        name: 'Semester 5',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Project Notes',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: { notebooks: dummyNotebooks }
    });
  } catch (error) {
    console.error('Get OneNote notebooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Import from OneNote
// @route   POST /api/integrations/onenote/import
// @access  Private
export const importFromOneNote = async (req, res) => {
  try {
    const { pageId, pageTitle } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user.integrations?.oneNote?.connected) {
      return res.status(404).json({
        success: false,
        message: 'OneNote tidak terhubung'
      });
    }

    // In production, fetch real page content
    // For now, create dummy document
    const document = await Document.create({
      judul: pageTitle || 'Imported from OneNote',
      deskripsi: 'Imported from OneNote',
      kategori: 'lainnya',
      mataKuliah: 'General',
      tags: ['onenote', 'imported'],
      konten: 'This is dummy content from OneNote. In production, real content would be fetched.',
      format: 'text',
      penulis: req.user.id,
      sourceIntegration: {
        platform: 'oneNote',
        fileId: pageId,
        fileName: pageTitle,
        importedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Page berhasil diimpor dari OneNote',
      data: { document }
    });
  } catch (error) {
    console.error('Import from OneNote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};