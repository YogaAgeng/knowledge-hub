import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors({
  origin: 'http://localhost:5173', // Sesuaikan dengan port frontend
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

// app.get("/", (req, res) => {
//   return res.status(200).send({
//       message: "TEST"
//   });
// });

// app.use('/api/auth', router);

app.use((_req, res, _next) => {
    res.status(404).json({
      status: 'fail',
      message: 'Endpoint tidak ditemukan'
    });
  });

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});