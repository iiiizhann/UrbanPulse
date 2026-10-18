import { logger } from '../utils/logger.js';

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`[Error ${err.statusCode}]: ${err.message}\nStack: ${err.stack}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  logger.error(`[CRITICAL UNHANDLED]: ${err.message}`);
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};