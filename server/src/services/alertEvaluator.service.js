import { AlertRule } from '../models/AlertRule.js';
import { sendTelegramAlert, sendWebhookAlert } from './notification.service.js';
import { logger } from '../utils/logger.js';

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown

export const evaluateMetricAlerts = async (cityMetric) => {
  try {
    logger.info(`🔍 [Alert Evaluator] Checking rules for ${cityMetric.city} (AQI: ${cityMetric.airQuality?.aqi})`);

    const rules = await AlertRule.find({ city: cityMetric.city, isActive: true });
    logger.info(`🔍 [Alert Evaluator] Found ${rules.length} active rule(s) for ${cityMetric.city}`);

    if (!rules.length) return;

    const now = Date.now();

    for (const rule of rules) {
      if (rule.lastTriggeredAt && now - new Date(rule.lastTriggeredAt).getTime() < COOLDOWN_MS) {
        logger.info(`⏳ [Alert Evaluator] Rule ${rule._id} is on cooldown until ${new Date(new Date(rule.lastTriggeredAt).getTime() + COOLDOWN_MS).toLocaleTimeString()}`);
        continue;
      }

      const currentVal =
        rule.metric === 'AQI' ? cityMetric.airQuality.aqi : cityMetric.weather.temperature;

      const isBreached =
        rule.condition === 'GREATER_THAN'
          ? currentVal >= rule.threshold
          : currentVal <= rule.threshold;

      logger.info(`📊 [Alert Evaluator] Value: ${currentVal}, Threshold: ${rule.threshold}, Breached: ${isBreached}`);

      if (isBreached) {
        logger.warn(
          `🚨 [Threshold Breached] ${rule.city} ${rule.metric}: ${currentVal} (Threshold: ${rule.threshold})`
        );

        if (rule.channel === 'TELEGRAM') {
          const msg =
            `🚨 <b>UrbanPulse Civic Alert</b>\n\n` +
            `📍 <b>City:</b> ${rule.city}\n` +
            `📊 <b>Metric:</b> ${rule.metric}\n` +
            `⚠️ <b>Current Level:</b> <code>${currentVal}</code> (Limit: ${rule.threshold})\n` +
            `🏷️ <b>Air Status:</b> ${cityMetric.airQuality.status}\n` +
            `⏰ <b>Timestamp:</b> ${new Date().toLocaleTimeString()}\n\n` +
            `<i>Visit your UrbanPulse dashboard for real-time telemetry.</i>`;

          await sendTelegramAlert(rule.destination, msg);
        } else if (rule.channel === 'WEBHOOK') {
          await sendWebhookAlert(rule.destination, {
            city: rule.city,
            metric: rule.metric,
            value: currentVal,
            threshold: rule.threshold,
            condition: rule.condition,
            status: cityMetric.airQuality.status,
            recordedAt: cityMetric.recordedAt,
          });
        }

        rule.lastTriggeredAt = new Date();
        await rule.save();
        logger.info(`✅ [Alert Evaluator] Updated lastTriggeredAt for rule ${rule._id}`);
      }
    }
  } catch (err) {
    logger.error(`❌ [Alert Evaluator] Error assessing rules: ${err.message}`);
  }
};