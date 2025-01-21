// routes/dashboard.js
import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// router.get('/stats', auth.authMiddleware, dashboardController.getDashboardStats);
// router.get('/documents', auth.authMiddleware, dashboardController.getRecentDocuments);

router.get('/stats', 
    (req, res, next) => {
      console.log('Dashboard stats route accessed');
      next();
    },
    auth.authMiddleware, 
    dashboardController.getDashboardStats
  );
  
  router.get('/documents', 
    (req, res, next) => {
      console.log('Dashboard documents route accessed');
      next();
    },
    auth.authMiddleware, 
    dashboardController.getRecentDocuments
  );

export default router;