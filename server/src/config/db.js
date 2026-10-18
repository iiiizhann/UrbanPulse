import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`✅ MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);
  } catch (error) {
    logger.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    logger.info('💡 Ensure local MongoDB or Docker MongoDB container is running.');
  }
};