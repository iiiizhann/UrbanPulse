import mongoose from 'mongoose';

const PipelineLogSchema = new mongoose.Schema(
  {
    pipelineName: { type: String, required: true },
    executionStatus: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL_SUCCESS', 'FAILED'],
      required: true,
    },
    recordsExtracted: { type: Number, default: 0 },
    recordsIngested: { type: Number, default: 0 },
    durationMs: { type: Number, required: true },
    errorDetails: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const PipelineLog = mongoose.model('PipelineLog', PipelineLogSchema);