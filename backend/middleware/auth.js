import jwt from 'jsonwebtoken';
// import { AppError } from './errorHandler.js';

const authMiddleware = (req, res, next) => {
  console.log('Full Headers:', req.headers);

  const authHeader = req.header('Authorization');
  console.log('Authorization Headers:', req.headers);
  // Ambil token dari header

  // Cek keberadaan token
  if (!authHeader) {
    return res.status(401).json({ 
      msg: 'Tidak ada token, otorisasi ditolak' 
    });
  }

  // if (!token) {
  //   return res.status(401).json({ 
  //     msg: 'Token tidak valid' 
  //   });
  // }

  // if (!token) {
  //   return next(new AppError('Tidak ada token, otorisasi ditolak', 401));
  // }


  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      msg: 'Format token salah' 
    });
  }

  const token = parts[1];
  console.log('Extracted Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token Verification Error:', err);
    res.status(401).json({ msg: 'Token tidak valid' });
  }
};

export default { authMiddleware };