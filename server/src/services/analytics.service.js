import { CityMetric } from '../models/CityMetric.js';
import { PipelineLog } from '../models/PipelineLog.js';

export const getLatestCitySnapshot = async (city) => {
  return await CityMetric.findOne({
    city: { $regex: new RegExp(`^${city}$`, 'i') },
  }).sort({ recordedAt: -1 });
};

export const getAllCitiesSnapshot = async () => {
  // Aggregate to get the absolute latest record for every distinct city
  return await CityMetric.aggregate([
    { $sort: { recordedAt: -1 } }, {$group: {
        _id: '$city',
        latestDoc: { $first: '$$ROOT' },
      },
    },
    {
      $replaceRoot: { newRoot: '$latestDoc' },
    },
    { $sort: { city: 1 } },
  ]);
};

export const getCityTrends = async (city, hours = 24) => {
  const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await CityMetric.aggregate([
    {
      $match: {
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        recordedAt: { $gte: sinceDate },
      },
    },
    {
      $project: {
        hourBucket: { $dateToString: { format: '\%Y-\%m-\%d \%H:00', date: '$recordedAt' } },
        temperature: '$weather.temperature',
        aqi: '$airQuality.aqi',
        humidity: '$weather.humidity',
        pm25: '$airQuality.pm25',
      },
    },
    {
      $group: {
        _id: '$hourBucket',
        avgTemperature: { $avg: '$temperature' },
        maxAqi: { $max: '$aqi' },
        avgAqi: { $avg: '$aqi' },
        avgHumidity: { $avg: '$humidity' },
        avgPm25: { $avg: '$pm25' },
      },
    },
    { $sort: { _id: 1 } }, {$project: {
        _id: 0,
        timestamp: '$_id',
        avgTemperature: { $round: ['$avgTemperature', 1] },
        maxAqi: { $round: ['$maxAqi', 0] },
        avgAqi: { $round: ['$avgAqi', 0] },
        avgHumidity: { $round: ['$avgHumidity', 1] },
        avgPm25: { $round: ['$avgPm25', 1] },
      },
    },
  ]);
};

export const getPipelineExecutionLogs = async (limit = 20) => {
  return await PipelineLog.find().sort({ createdAt: -1 }).limit(limit);
};