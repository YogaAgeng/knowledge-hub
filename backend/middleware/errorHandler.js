// Middleware Error Handler
const errorHandler = (err, _req, res, _next) => {
  // Log error untuk debugging
  console.error(err.stack);

  // Tentukan status code
  const statusCode = err.statusCode || 500;
  
  // Respon error
  const errorResponse = {
    status: err.status || 'error',
    message: err.message || 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Kirim response error
  res.status(statusCode).json(errorResponse);
};

// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { errorHandler, AppError };