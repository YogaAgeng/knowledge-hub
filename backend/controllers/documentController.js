import Document from '../models/Document.js';
import Version from '../models/Version.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all documents
export const getDocuments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      kategori, 
      mataKuliah, 
      tags,
      sort = '-createdAt',
      search 
    } = req.query;

    // Build query
    const query = {
      $or: [
        { akses: 'public' },
        { penulis: req.user.id },
        { aksesUsers: req.user.id }
      ]
    };

    if (kategori) query.kategori = kategori;
    if (mataKuliah) query.mataKuliah = new RegExp(mataKuliah, 'i');
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$and = [
        {
          $or: [
            { judul: new RegExp(search, 'i') },
            { deskripsi: new RegExp(search, 'i') },
            { konten: new RegExp(search, 'i') }
          ]
        }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const documents = await Document.find(query)
      .populate('penulis', 'nama email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('penulis', 'nama email')
      .populate('aksesUsers', 'nama email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check access
    const hasAccess = 
      document.akses === 'public' ||
      document.penulis._id.toString() === req.user.id ||
      document.aksesUsers.some(user => user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke dokumen ini'
      });
    }

    // Increment view count
    document.dilihat += 1;
    await document.save();

    res.json({
      success: true,
      data: { document }
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create document
export const createDocument = async (req, res) => {
  try {
    const {
      judul,
      deskripsi,
      kategori,
      mataKuliah,
      tags,
      konten,
      format = 'text',
      akses = 'public',
      aksesUsers = []
    } = req.body;

    const document = await Document.create({
      judul,
      deskripsi,
      kategori,
      mataKuliah,
      tags: tags || [],
      konten,
      format,
      penulis: req.user.id,
      akses,
      aksesUsers,
      ukuranFile: Buffer.byteLength(konten || '', 'utf8'),
      jumlahHalaman: 1
    });

    // Create initial version
    await Version.create({
      documentId: document._id,
      versi: 1,
      perubahan: 'Initial version',
      konten,
      editor: req.user.id
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('penulis', 'nama email');

    res.status(201).json({
      success: true,
      data: { document: populatedDocument }
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check permission
    if (document.penulis.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengedit dokumen ini'
      });
    }

    const {
      judul,
      deskripsi,
      kategori,
      mataKuliah,
      tags,
      konten,
      format,
      akses,
      aksesUsers
    } = req.body;

    // Track if content changed for versioning
    const contentChanged = konten && konten !== document.konten;

    // Update document
    Object.assign(document, {
      judul: judul || document.judul,
      deskripsi: deskripsi || document.deskripsi,
      kategori: kategori || document.kategori,
      mataKuliah: mataKuliah || document.mataKuliah,
      tags: tags || document.tags,
      konten: konten || document.konten,
      format: format || document.format,
      akses: akses || document.akses,
      aksesUsers: aksesUsers || document.aksesUsers,
      ukuranFile: konten ? Buffer.byteLength(konten, 'utf8') : document.ukuranFile
    });

    await document.save();

    // Create new version if content changed
    if (contentChanged) {
      const lastVersion = await Version.findOne({ documentId: document._id })
        .sort('-versi')
        .limit(1);

      await Version.create({
        documentId: document._id,
        versi: (lastVersion?.versi || 0) + 1,
        perubahan: req.body.perubahan || 'Content updated',
        konten,
        editor: req.user.id
      });
    }

    const updatedDocument = await Document.findById(document._id)
      .populate('penulis', 'nama email')
      .populate('aksesUsers', 'nama email');

    res.json({
      success: true,
      data: { document: updatedDocument }
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check permission
    if (document.penulis.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus dokumen ini'
      });
    }

    // Delete associated versions
    await Version.deleteMany({ documentId: document._id });

    // Delete file if exists
    if (document.fileUrl) {
      const filePath = path.join(__dirname, '..', document.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Dokumen berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Upload document file
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const {
      judul,
      deskripsi,
      kategori,
      mataKuliah,
      tags,
      akses = 'public',
      aksesUsers = []
    } = req.body;

    const document = await Document.create({
      judul: judul || req.file.originalname,
      deskripsi,
      kategori,
      mataKuliah,
      tags: tags ? tags.split(',') : [],
      konten: '',
      format: path.extname(req.file.filename).substring(1),
      penulis: req.user.id,
      akses,
      aksesUsers: aksesUsers ? aksesUsers.split(',') : [],
      fileUrl: `/uploads/${req.file.filename}`,
      namaFile: req.file.originalname,
      ukuranFile: req.file.size,
      jumlahHalaman: 1
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('penulis', 'nama email');

    res.status(201).json({
      success: true,
      data: { document: populatedDocument }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get document versions
export const getDocumentVersions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    const versions = await Version.find({ documentId: req.params.id })
      .populate('editor', 'nama email')
      .sort('-versi');

    res.json({
      success: true,
      data: { versions }
    });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get document permissions
export const getDocumentPermissions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('penulis', 'nama email')
      .populate('aksesUsers', 'nama email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user is owner
    if (document.penulis._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Hanya penulis yang dapat melihat permissions'
      });
    }

    res.json({
      success: true,
      data: {
        akses: document.akses,
        penulis: document.penulis,
        aksesUsers: document.aksesUsers
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Search documents
export const searchDocuments = async (req, res) => {
  try {
    const { q, kategori, mataKuliah, tags, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }

    // Build search query
    const searchQuery = {
      $and: [
        {
          $or: [
            { akses: 'public' },
            { penulis: req.user.id },
            { aksesUsers: req.user.id }
          ]
        },
        {
          $or: [
            { judul: new RegExp(q, 'i') },
            { deskripsi: new RegExp(q, 'i') },
            { konten: new RegExp(q, 'i') },
            { tags: new RegExp(q, 'i') }
          ]
        }
      ]
    };

    // Add filters
    if (kategori) searchQuery.kategori = kategori;
    if (mataKuliah) searchQuery.mataKuliah = new RegExp(mataKuliah, 'i');
    if (tags) searchQuery.tags = { $in: tags.split(',') };

    // Execute search with pagination
    const skip = (page - 1) * limit;
    const documents = await Document.find(searchQuery)
      .populate('penulis', 'nama email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get document statistics
export const getDocumentStats = async (req, res) => {
  try {
    // Get user's documents
    const userDocuments = await Document.find({ penulis: req.user.id });
    
    // Calculate statistics
    const stats = {
      totalDocuments: userDocuments.length,
      totalViews: userDocuments.reduce((sum, doc) => sum + doc.dilihat, 0),
      totalDownloads: userDocuments.reduce((sum, doc) => sum + doc.diunduh, 0),
      documentsByCategory: {},
      documentsByFormat: {},
      recentDocuments: []
    };

    // Count by category
    userDocuments.forEach(doc => {
      stats.documentsByCategory[doc.kategori] = (stats.documentsByCategory[doc.kategori] || 0) + 1;
      stats.documentsByFormat[doc.format] = (stats.documentsByFormat[doc.format] || 0) + 1;
    });

    // Get recent documents
    stats.recentDocuments = await Document.find({ penulis: req.user.id })
      .sort('-createdAt')
      .limit(5)
      .select('judul kategori createdAt dilihat');

    // Get popular documents
    stats.popularDocuments = await Document.find({ penulis: req.user.id })
      .sort('-dilihat')
      .limit(5)
      .select('judul kategori dilihat diunduh');

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};