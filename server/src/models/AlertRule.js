import mongoose from 'mongoose';

const alertRuleSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      enum: ['Pune', 'Mumbai', 'Delhi'],
    },
    metric: {
      type: String,
      required: true,
      enum: ['AQI', 'TEMPERATURE'],
      default: 'AQI',
    },
    threshold: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      enum: ['GREATER_THAN', 'LESS_THAN'],
      default: 'GREATER_THAN',
    },
    channel: {
      type: String,
      enum: ['TELEGRAM', 'WEBHOOK'],
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const AlertRule = mongoose.model('AlertRule', alertRuleSchema);