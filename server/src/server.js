import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { initSchedulers } from './pipelines/scheduler.js';

const startServer = async () => {
  try {
    await connectDB();

    // Start background ingestion pipelines
    initSchedulers();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 UrbanPulse Core Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`🔗 Health Check available at: http://localhost:${env.PORT}/health`);
    });

    const shutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Failed to boot server: ${err.message}`);
    process.exit(1);
  }
};

startServer();