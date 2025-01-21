// controllers/googleDriveController.js
import User from '../models/User.js';
import Document from '../models/Document.js';
import { 
  generateGoogleAuthUrl, 
  getGoogleTokens,
  getGoogleDriveService 
} from '../config/googleDrive.js';
import { AppError } from '../middleware/errorHandler.js';

export const connectGoogleDrive = async (req, res, next) => {
  try {
    const authUrl = generateGoogleAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    next(new AppError('Gagal membuat URL autentikasi', 500));
  }
};

export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    const tokens = await getGoogleTokens(code);

    await User.findByIdAndUpdate(req.user.id, {
      googleDriveTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      },
      googleDriveConnected: true
    });

    res.redirect('/dashboard');
  } catch (error) {
    next(new AppError('Gagal mengautentikasi Google Drive', 500));
  }
};

export const syncDocumentsFromDrive = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.googleDriveConnected) {
      return next(new AppError('Belum terhubung dengan Google Drive', 400));
    }

    const drive = getGoogleDriveService({
      access_token: user.googleDriveTokens.accessToken,
      refresh_token: user.googleDriveTokens.refreshToken
    });

    const response = await drive.files.list({
      q: "mimeType='text/plain' or mimeType='application/vnd.google-apps.document'",
      spaces: 'drive'
    });

    const syncedDocuments = await Promise.all(
      response.data.files.map(async (file) => {
        try {
          const fileContent = await drive.files.get({
            fileId: file.id,
            alt: 'media'
          });

          return Document.create({
            user: req.user.id,
            title: file.name,
            content: fileContent.data,
            category: 'Google Drive Sync'
          });
        } catch (error) {
          console.error(`Gagal sinkronisasi dokumen ${file.name}:`, error);
          return null;
        }
      })
    );

    const filteredDocuments = syncedDocuments.filter(doc => doc !== null);

    res.json({
      message: 'Dokumen berhasil disinkronkan',
      syncedCount: filteredDocuments.length,
      documents: filteredDocuments
    });
  } catch (error) {
    next(new AppError('Gagal sinkronisasi dokumen', 500));
  }
};

export const disconnectGoogleDrive = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      googleDriveTokens: null,
      googleDriveConnected: false
    });

    res.json({ message: 'Google Drive berhasil diputuskan' });
  } catch (error) {
    next(new AppError('Gagal memutuskan Google Drive', 500));
  }
};