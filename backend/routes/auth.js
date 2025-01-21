import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authControllers.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validasi Registrasi
const registerValidations = [
  body('nama', 'Nama harus diisi').trim().not().isEmpty(),
  body('email', 'Email tidak valid').trim().isEmail(),
  body('password', 'Password minimal 8 karakter').isLength({ min: 8 }),
  body('jurusan', 'Jurusan harus dipilih').trim().not().isEmpty()
];

// Validasi Login
const loginValidations = [
  body('email', 'Email tidak valid').trim().isEmail(),
  body('password', 'Password harus diisi').not().isEmpty()
];

// Route Registrasi
router.post('/register', 
  registerValidations, 
  authController.register
);

// Route Login  
router.post('/login', 
  loginValidations, 
  authController.login
);

// Route Profil
router.get('/profile', auth.authMiddleware, authController.getUserProfile);
  
export default router;