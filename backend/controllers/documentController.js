// controllers/documentController.js
import Document from '../models/Document.js';
import { AppError } from '../middleware/errorHandler.js';

// Buat Dokumen Baru
export const createDocument = async (req, res, next) => {
  try {
    const { title, content, type, tags } = req.body;
    
    // Validasi input
    if (!title || !content || !type) {
      return next(new AppError('Judul, konten, dan tipe dokumen wajib diisi', 400));
    }

    // Buat dokumen baru
    const newDocument = new Document({
      user: req.user.id,
      title,
      content,
      type,
      tags: tags || []
    });

    // Simpan dokumen
    const savedDocument = await newDocument.save();

    res.status(201).json(savedDocument);
  } catch (error) {
    next(new AppError('Gagal membuat dokumen', 500));
  }
};

// Dapatkan Semua Dokumen Pengguna
export const getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(documents);
  } catch (error) {
    next(new AppError('Gagal mengambil dokumen', 500));
  }
};

// Dapatkan Dokumen Berdasarkan ID
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!document) {
      return next(new AppError('Dokumen tidak ditemukan', 404));
    }

    res.json(document);
  } catch (error) {
    next(new AppError('Gagal mengambil dokumen', 500));
  }
};

// Update Dokumen
export const updateDocument = async (req, res, next) => {
  try {
    const { title, content, type, tags } = req.body;

    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, type, tags },
      { new: true, runValidators: true }
    );

    if (!document) {
      return next(new AppError('Dokumen tidak ditemukan', 404));
    }

    res.json(document);
  } catch (error) {
    next(new AppError('Gagal memperbarui dokumen', 500));
  }
};

// Hapus Dokumen
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!document) {
      return next(new AppError('Dokumen tidak ditemukan', 404));
    }

    res.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    next(new AppError('Gagal menghapus dokumen', 500));
  }
};