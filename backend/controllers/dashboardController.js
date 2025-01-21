// controllers/dashboardController.js
import Document from '../models/Document.js';
import { AppError } from '../middleware/errorHandler.js';

const getDashboardStats = async (req, res, next) => {
    try {
        console.log('User ID in stats:', req.user);
        const userId = req.user.id;

        const totalDocuments = await Document.countDocuments({ user: userId });
        const monthlyDocuments = await Document.countDocuments({
            user: userId,
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
        });

        res.json({
            totalDocuments, 
            monthlyDocuments,
            usedStorage: 0
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        next(new AppError('Gagal mengambil statistik', 500));
    }
};

export const getRecentDocuments = async (req, res, next) => {
    try {
        console.log('User ID in documents:', req.user);
        const userId = req.user.id;
        const documents = await Document.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json(documents);
    } catch (error) {
        console.error('Dashboard documents error:', error);
        next(new AppError('Gagal mengambil dokumen', 500));
    }
};

// const calculateUsedStorage = async (userId) => {
//   // Implementasi sederhana, bisa disesuaikan
//   const documents = await Document.find({ user: userId });
//   const totalSize = documents.reduce((sum, doc) => sum + doc.content.length, 0);
//   return totalSize / (1024 * 1024); // Konversi ke MB
// };

export default { getDashboardStats, getRecentDocuments };