import cron from 'node-cron';
import { runCityMetricsETL } from './cityMetrics.pipeline.js';
import { logger } from '../utils/logger.js';

export const TARGET_CITIES = [
  { name: 'Pune', lat: 18.5204, lon: 73.8567, petrol: 104.2, diesel: 92.1 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777, petrol: 106.3, diesel: 94.2 },
  { name: 'Delhi', lat: 28.6139, lon: 77.209, petrol: 96.7, diesel: 89.6 },
];

export const initSchedulers = () => {
  logger.info('⏰ Initializing UrbanPulse Cron Engine...');

  // Run initial ingestion immediately upon server startup
  (async () => {
    logger.info('🚀 Triggering immediate startup ETL sync across cities...');
    for (const city of TARGET_CITIES) {
      await runCityMetricsETL(city);
    }
  })();

  // Schedule recurring cron run: every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    logger.info('⏱️ Executing scheduled 30-minute ETL run...');
    for (const city of TARGET_CITIES) {
      await runCityMetricsETL(city);
    }
  });

  logger.info('✅ Cron tasks scheduled successfully [Interval: Every 30 minutes]');
};