import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { AppError } from './utils/AppError.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import alertRoutes from './routes/alert.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Base Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'UrbanPulse Core API',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Undefined Route Handler (Catch-all for Express 5)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
});

// Centralized Error Middleware
app.use(globalErrorHandler);

export default app;