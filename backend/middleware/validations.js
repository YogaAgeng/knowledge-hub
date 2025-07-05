// ===== /backend/middleware/validations.js =====
import { body, param, query, validationResult } from 'express-validator';

// Validation middleware to check errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
export const registerValidations = [
  body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter')
    .matches(/\d/)
    .withMessage('Password harus mengandung minimal 1 angka'),
  body('nama')
    .trim()
    .notEmpty()
    .withMessage('Nama wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama harus 3-100 karakter'),
  body('nim')
    .trim()
    .notEmpty()
    .withMessage('NIM wajib diisi')
    .matches(/^\d{10}$/)
    .withMessage('NIM harus 10 digit angka'),
  body('jurusan')
    .trim()
    .notEmpty()
    .withMessage('Jurusan wajib diisi')
    .isIn(['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Komputer'])
    .withMessage('Jurusan tidak valid'),
  body('semester')
    .isInt({ min: 1, max: 14 })
    .withMessage('Semester harus angka 1-14')
];

export const loginValidations = [
  body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password wajib diisi')
];

// Document validations
export const documentValidations = [
  body('judul')
    .trim()
    .notEmpty()
    .withMessage('Judul dokumen wajib diisi')
    .isLength({ min: 3, max: 200 })
    .withMessage('Judul harus 3-200 karakter'),
  body('deskripsi')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('kategori')
    .notEmpty()
    .withMessage('Kategori wajib dipilih')
    .isIn(['catatan', 'rangkuman', 'materi', 'tugas', 'artikel', 'tutorial', 'lainnya'])
    .withMessage('Kategori tidak valid'),
  body('mataKuliah')
    .trim()
    .notEmpty()
    .withMessage('Mata kuliah wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Mata kuliah harus 3-100 karakter'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags harus berupa array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maksimal 10 tags');
      }
      return true;
    }),
  body('konten')
    .trim()
    .notEmpty()
    .withMessage('Konten dokumen wajib diisi')
    .isLength({ min: 10 })
    .withMessage('Konten minimal 10 karakter'),
  body('format')
    .optional()
    .isIn(['text', 'markdown', 'html', 'pdf', 'doc', 'docx'])
    .withMessage('Format tidak valid'),
  body('akses')
    .optional()
    .isIn(['public', 'private', 'restricted'])
    .withMessage('Tipe akses tidak valid'),
  body('aksesUsers')
    .optional()
    .isArray()
    .withMessage('Akses users harus berupa array')
    .custom((users) => {
      if (users.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
        throw new Error('Invalid user ID format');
      }
      return true;
    })
];

// Study group validations
export const studyGroupValidations = [
  body('nama')
    .trim()
    .notEmpty()
    .withMessage('Nama kelompok wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama kelompok harus 3-100 karakter'),
  body('deskripsi')
    .trim()
    .notEmpty()
    .withMessage('Deskripsi wajib diisi')
    .isLength({ min: 10, max: 500 })
    .withMessage('Deskripsi harus 10-500 karakter'),
  body('kategori')
    .notEmpty()
    .withMessage('Kategori wajib dipilih')
    .isIn([
      'programming', 
      'data-science', 
      'web-development', 
      'mobile-development',
      'database',
      'security',
      'design',
      'competition',
      'research',
      'cloud',
      'blockchain',
      'general'
    ])
    .withMessage('Kategori tidak valid'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic harus boolean'),
  body('maksAnggota')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Maksimal anggota harus 2-100'),
  body('jadwalPertemuan')
    .optional()
    .isArray()
    .withMessage('Jadwal pertemuan harus berupa array')
    .custom((jadwal) => {
      for (const pertemuan of jadwal) {
        if (!pertemuan.hari || !pertemuan.waktu || !pertemuan.lokasi) {
          throw new Error('Setiap jadwal harus memiliki hari, waktu, dan lokasi');
        }
      }
      return true;
    })
];

// Discussion validations
export const discussionValidations = [
  body('konten')
    .trim()
    .notEmpty()
    .withMessage('Konten diskusi wajib diisi')
    .isLength({ min: 3, max: 1000 })
    .withMessage('Konten harus 3-1000 karakter'),
  body('tipe')
    .optional()
    .isIn(['comment', 'question', 'suggestion', 'issue'])
    .withMessage('Tipe diskusi tidak valid'),
  body('posisi')
    .optional()
    .isObject()
    .withMessage('Posisi harus berupa object')
    .custom((posisi) => {
      if (posisi && (!Number.isInteger(posisi.halaman) || !Number.isFinite(posisi.x) || !Number.isFinite(posisi.y))) {
        throw new Error('Posisi harus memiliki halaman (integer), x dan y (number)');
      }
      return true;
    })
];

// Comment validations
export const commentValidations = [
  body('konten')
    .trim()
    .notEmpty()
    .withMessage('Konten komentar wajib diisi')
    .isLength({ min: 1, max: 500 })
    .withMessage('Konten harus 1-500 karakter')
];

// Integration validations
export const notionIntegrationValidations = [
  body('apiKey')
    .trim()
    .notEmpty()
    .withMessage('Notion API key wajib diisi')
    .matches(/^secret_[a-zA-Z0-9]{43}$/)
    .withMessage('Format Notion API key tidak valid')
];

// Collaboration validations
export const collaborationInviteValidations = [
  body('email')
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .toLowerCase(),
  body('role')
    .optional()
    .isIn(['viewer', 'editor', 'admin'])
    .withMessage('Role tidak valid'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Pesan maksimal 500 karakter')
];

// Search validations
export const searchValidations = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Query pencarian wajib diisi')
    .isLength({ min: 2, max: 100 })
    .withMessage('Query harus 2-100 karakter')
    .escape(), // Prevent XSS
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page harus angka positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit harus 1-100'),
  query('kategori')
    .optional()
    .isIn(['catatan', 'rangkuman', 'materi', 'tugas', 'artikel', 'tutorial', 'lainnya'])
    .withMessage('Kategori tidak valid')
];

// ID parameter validations
export const mongoIdValidation = param('id')
  .isMongoId()
  .withMessage('ID tidak valid');

export const documentIdValidation = param('documentId')
  .isMongoId()
  .withMessage('Document ID tidak valid');

// File upload validations
export const fileUploadValidations = [
  body('judul')
    .trim()
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Judul harus 3-200 karakter'),
  body('deskripsi')
    .trim()
    .optional()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('kategori')
    .notEmpty()
    .withMessage('Kategori wajib dipilih')
    .isIn(['catatan', 'rangkuman', 'materi', 'tugas', 'artikel', 'tutorial', 'lainnya'])
    .withMessage('Kategori tidak valid'),
  body('mataKuliah')
    .trim()
    .notEmpty()
    .withMessage('Mata kuliah wajib diisi'),
  body('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const tags = value.split(',').map(tag => tag.trim());
        if (tags.length > 10) {
          throw new Error('Maksimal 10 tags');
        }
      }
      return true;
    })
];

// Profile update validations
export const profileUpdateValidations = [
  body('nama')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama harus 3-100 karakter'),
  body('nim')
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('NIM harus 10 digit angka'),
  body('jurusan')
    .optional()
    .trim()
    .isIn(['Teknik Informatika', 'Sistem Informasi', 'Ilmu Komputer', 'Teknik Komputer'])
    .withMessage('Jurusan tidak valid'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 14 })
    .withMessage('Semester harus angka 1-14')
];

// Custom validators
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidNIM = (nim) => {
  return /^\d{10}$/.test(nim);
};

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Sanitization helpers
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};