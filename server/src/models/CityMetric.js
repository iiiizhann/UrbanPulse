import mongoose from 'mongoose';

const CityMetricSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, 'City identifier is mandatory'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    weather: {
      temperature: { type: Number, required: true },
      feelsLike: { type: Number },
      humidity: { type: Number, min: 0, max: 100 },
      windSpeed: { type: Number },
      condition: { type: String, trim: true },
    },
    airQuality: {
      aqi: { type: Number, required: true, index: true },
      pm25: { type: Number, default: null },
      pm10: { type: Number, default: null },
      status: {
        type: String,
        enum: ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
        default: 'Moderate',
      },
    },
    fuel: {
      petrolPrice: { type: Number, default: 104.5 },
      dieselPrice: { type: Number, default: 92.3 },
      currency: { type: String, default: 'INR' },
    },
    contentHash: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate writes
    },
    recordedAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance composite index for time-series range queries
CityMetricSchema.index({ city: 1, recordedAt: -1 });

// Spatial index for map proximity queries
CityMetricSchema.index({ location: '2dsphere' });

export const CityMetric = mongoose.model('CityMetric', CityMetricSchema);