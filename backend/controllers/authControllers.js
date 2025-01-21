import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';

// Generate Token
const generateToken = (user) => {
    const payload = {
        user: {
            id: user.id
        }
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Register User
const register = async (req, res, next) => {
    try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(err => err.msg).join(', ');
            return next(new AppError(errorMessages, 400));
        }

        const { nama, email, password, jurusan } = req.body;

        // Cek apakah user sudah terdaftar
        let user = await User.findOne({ email });
        if (user) {
            return next(new AppError('User sudah terdaftar', 400));
        }

        // Buat user baru
        user = new User({
            nama,
            email,
            password,
            jurusan
        });

        // Simpan user
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(201).json({ token });
    } catch (err) {
        next(new AppError('Gagal registrasi', 500));
    }
};

// Login User
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Cek user
        let user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('Invalid Credentials', 400));
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError('Invalid Credentials', 400));
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                jurusan: user.jurusan
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        next(new AppError('Gagal login', 500));
    }
};

// Get User Profile
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(new AppError('User tidak ditemukan', 404));
        }
        res.json(user);
    } catch (err) {
        next(new AppError('Gagal mengambil profil', 500));
    }
};

export default { getUserProfile, register, login };