import express from 'express';
import {
  getLatestSnapshot,
  getCityHistoricalTrends,
  getPipelineLogs,
  triggerManualETL,
} from '../controllers/analytics.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/latest', getLatestSnapshot);
router.get('/trends', getCityHistoricalTrends);

// Public manual ingestion trigger for testing & webhooks
router.post('/ingest', triggerManualETL);

// Admin-only endpoints
router.get('/pipeline-logs', verifyJWT, authorizeRoles('Admin'), getPipelineLogs);
router.post('/trigger-etl', verifyJWT, authorizeRoles('Admin'), triggerManualETL);

export default router;