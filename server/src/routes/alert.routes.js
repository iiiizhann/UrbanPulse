import express from 'express';
import { z } from 'zod';
import { AlertRule } from '../models/AlertRule.js';

const router = express.Router();

const CreateAlertSchema = z.object({
  city: z.enum(['Pune', 'Mumbai', 'Delhi']),
  metric: z.enum(['AQI', 'TEMPERATURE']).default('AQI'),
  threshold: z.number().min(1),
  condition: z.enum(['GREATER_THAN', 'LESS_THAN']).default('GREATER_THAN'),
  channel: z.enum(['TELEGRAM', 'WEBHOOK']),
  destination: z.string().min(3),
});

// GET /api/v1/alerts
router.get('/', async (req, res, next) => {
  try {
    const rules = await AlertRule.find().sort({ createdAt: -1 });
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/alerts
router.post('/', async (req, res, next) => {
  try {
    const validated = CreateAlertSchema.parse(req.body);
    const rule = await AlertRule.create(validated);
    res.status(201).json({ success: true, data: rule });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/alerts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await AlertRule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert rule removed' });
  } catch (err) {
    next(err);
  }
});

export default router;