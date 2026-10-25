import axios from 'axios';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const sendTelegramAlert = async (chatId, message) => {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (!botToken || botToken.includes('dummy')) {
    logger.warn('⚠️ Telegram bot token missing or dummy. Skipping message dispatch.');
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      },
      { timeout: 5000 }
    );
    logger.info(`📢 [Alert] Telegram alert dispatched to ${chatId}`);
  } catch (err) {
    logger.error(`❌ [Alert] Failed to send Telegram alert: ${err.message}`);
  }
};

export const sendWebhookAlert = async (webhookUrl, payload) => {
  try {
    let requestBody;

    // Discord-specific rich embed formatting
    if (webhookUrl.includes('discord.com')) {
      const isSevere = payload.value > 200;
      requestBody = {
        username: 'UrbanPulse Telemetry',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3208/3208707.png',
        embeds: [
          {
            title: `🚨 Atmospheric Threshold Alert: ${payload.city}`,
            description: `Sensor readings have crossed safe municipal operational limits.`,
            color: isSevere ? 0xe11d48 : 0xf59e0b, // Rose red if severe, amber otherwise
            fields: [
              {
                name: 'Target Metric',
                value: `**${payload.metric}**`,
                inline: true,
              },
              {
                name: 'Current Level',
                value: `\`${payload.value}\``,
                inline: true,
              },
              {
                name: 'Configured Limit',
                value: `\`${payload.threshold}\``,
                inline: true,
              },
              {
                name: 'Air Status',
                value: payload.status || 'Active Alert',
                inline: true,
              },
              {
                name: 'Condition Trigger',
                value: payload.condition === 'GREATER_THAN' ? 'Exceeded Limit (>)' : 'Subceeded Limit (<)',
                inline: true,
              },
            ],
            footer: {
              text: 'UrbanPulse Real-time Civic Telemetry System',
            },
            timestamp: payload.recordedAt ? new Date(payload.recordedAt).toISOString() : new Date().toISOString(),
          },
        ],
      };
    } else {
      // Standard JSON payload for custom webhooks
      requestBody = payload;
    }

    await axios.post(webhookUrl, requestBody, {
      timeout: 6000,
      headers: { 'Content-Type': 'application/json' },
    });
    logger.info(`📢 [Alert] Webhook successfully delivered to destination`);
  } catch (err) {
    logger.error(`❌ [Alert] Webhook delivery failed: ${err.response?.data?.message || err.message}`);
  }
};