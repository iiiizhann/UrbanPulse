import * as analyticsService from '../services/analytics.service.js';
import { AppError } from '../utils/AppError.js';
import { TARGET_CITIES } from '../pipelines/scheduler.js';
import { runCityMetricsETL } from '../pipelines/cityMetrics.pipeline.js';

export const getLatestSnapshot = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (city) {
      const data = await analyticsService.getLatestCitySnapshot(city);
      if (!data) {
        return next(new AppError(`No metrics recorded yet for city '${city}'`, 404));
      }
      return res.status(200).json({ success: true, data });
    }

    const allData = await analyticsService.getAllCitiesSnapshot();
    res.status(200).json({ success: true, count: allData.length, data: allData });
  } catch (err) {
    next(err);
  }
};

export const getCityHistoricalTrends = async (req, res, next) => {
  try {
    const { city } = req.query;
    const hours = req.query.hours ? parseInt(req.query.hours, 10) : 24;

    if (!city) {
      return next(new AppError('City parameter is required (e.g. ?city=Pune)', 400));
    }

    const trends = await analyticsService.getCityTrends(city, hours);

    res.status(200).json({
      success: true,
      city,
      dataPoints: trends.length,
      data: trends,
    });
  } catch (err) {
    next(err);
  }
};

export const getPipelineLogs = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
    const logs = await analyticsService.getPipelineExecutionLogs(limit);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

export const triggerManualETL = async (req, res, next) => {
  try {
    const { city } = req.body;

    if (city) {
      const cityConfig = TARGET_CITIES.find(
        (c) => c.name.toLowerCase() === city.toLowerCase()
      );
      if (!cityConfig) {
        return next(new AppError(`City '${city}' is not configured in pipeline registry`, 400));
      }

      runCityMetricsETL(cityConfig);
      return res.status(202).json({
        success: true,
        message: `Manual ETL ingestion cycle initiated for ${cityConfig.name}`,
      });
    }

    // Trigger for all registered cities in parallel
    Promise.allSettled(TARGET_CITIES.map((c) => runCityMetricsETL(c)));

    res.status(202).json({
      success: true,
      message: 'Autonomous ETL sync triggered for all monitored cities (Pune, Mumbai, Delhi)',
    });
  } catch (err) {
    next(err);
  }
};