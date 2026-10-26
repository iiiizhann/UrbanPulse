export const evaluateOutdoorWindow = (aqi = 0, temp = 25, trends = []) => {
  let safetyTier = 'OPTIMAL';
  let primaryBadge = 'Safe for Outdoors';
  let badgeColor = 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20';
  let advice = 'Air quality and thermal conditions are comfortable for runs and sports.';

  const numAqi = Number(aqi) || 0;
  const numTemp = Number(temp) || 25;

  if (numAqi > 200 || numTemp > 40) {
    safetyTier = 'HAZARDOUS';
    primaryBadge = 'Avoid Outdoor Exercise';
    badgeColor = 'text-rose-700 bg-rose-500/10 border-rose-500/20';
    advice = 'Heavy particulate elevation detected. Substitute outdoor runs with indoor training.';
  } else if (numAqi > 150 || numTemp > 35) {
    safetyTier = 'CAUTION';
    primaryBadge = 'Sensitive Groups Limit Exposure';
    badgeColor = 'text-amber-700 bg-amber-500/10 border-amber-500/20';
    advice = 'Reduce prolonged outdoor exertion. Sensitive individuals should wear an N95 mask.';
  } else if (numAqi > 100 || numTemp > 32) {
    safetyTier = 'MODERATE';
    primaryBadge = 'Moderate Conditions';
    badgeColor = 'text-yellow-700 bg-yellow-500/10 border-yellow-500/20';
    advice = 'Acceptable for most outdoor activities; sensitive groups may feel slight fatigue.';
  }

  let recommendedTimeSlot = '06:00 AM – 08:30 AM';
  let windowStatus = 'Cooler temps & reduced vehicular particulate buildup';

  if (Array.isArray(trends) && trends.length > 0) {
    try {
      const validPoints = trends
        .map((item) => {
          const rawTime = item?.timestamp || item?.recordedAt || item?.createdAt;
          const d = rawTime ? new Date(rawTime) : null;
          const h = d && !isNaN(d.getTime()) ? d.getHours() : 6;
          const itemAqi = Number(item?.avgAqi ?? item?.airQuality?.aqi ?? numAqi);
          const itemTemp = Number(item?.avgTemperature ?? item?.weather?.temperature ?? numTemp);
          return { hour: h, score: itemAqi + itemTemp * 1.5 };
        })
        .filter((p) => !isNaN(p.score));

      if (validPoints.length > 0) {
        validPoints.sort((a, b) => a.score - b.score);
        const bestHour = validPoints[0].hour;
        const formatH = (h) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
        recommendedTimeSlot = `${formatH(bestHour)} – ${formatH((bestHour + 2) % 24)}`;
      }
    } catch {
      // Safe fallback
    }
  }

  return {
    safetyTier,
    primaryBadge,
    badgeColor,
    advice,
    recommendedTimeSlot,
    windowStatus,
    activities: {
      running: safetyTier === 'OPTIMAL' || safetyTier === 'MODERATE',
      cycling: safetyTier !== 'HAZARDOUS',
      childrenPlay: safetyTier === 'OPTIMAL',
    },
  };
};

export default evaluateOutdoorWindow;