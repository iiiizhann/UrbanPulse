import React from 'react';

export const AqiGauge = ({ aqi = 0, status = 'Good', pm25, pm10 }) => {
  // Clamp AQI to standard 0-500 scale for circular gauge rendering
  const maxScale = 500;
  const clampedAqi = Math.min(Math.max(aqi, 0), maxScale);
  
  // Calculate arc stroke offset (half-circle: 180 degrees)
  const radius = 70;
  const circumference = Math.PI * radius;
  const fillPercentage = clampedAqi / maxScale;
  const strokeDashoffset = circumference * (1 - fillPercentage);

  const getTheme = (val) => {
    if (val <= 50) return { text: 'text-emerald-500', stroke: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Air quality is satisfactory and poses little risk.' };
    if (val <= 100) return { text: 'text-amber-500', stroke: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Acceptable; sensitive groups may experience minor effects.' };
    if (val <= 150) return { text: 'text-orange-500', stroke: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Unhealthy for sensitive individuals (asthma/elderly).' };
    if (val <= 200) return { text: 'text-rose-500', stroke: '#ef4444', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Increased likelihood of adverse respiratory effects.' };
    if (val <= 300) return { text: 'text-purple-600', stroke: '#9333ea', bg: 'bg-purple-50', border: 'border-purple-200', desc: 'Health alert: significant health risks for everyone.' };
    return { text: 'text-red-700', stroke: '#b91c1c', bg: 'bg-red-50', border: 'border-red-300', desc: 'Emergency conditions; serious public health warning.' };
  };

  const theme = getTheme(clampedAqi);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
      {/* Dynamic Background Glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.stroke }}
      />

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">Atmospheric Air Quality Index</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.bg} ${theme.text} ${theme.border}`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* SVG Radial Arc */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <svg width="180" height="110" viewBox="0 0 180 110" className="overflow-visible">
          {/* Background Track */}
          <path
            d="M 20 95 A 70 70 0 0 1 160 95"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Filled Progress Arc */}
          <path
            d="M 20 95 A 70 70 0 0 1 160 95"
            fill="none"
            stroke={theme.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numerical Metric */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className={`text-4xl font-extrabold tracking-tight font-mono ${theme.text}`}>
            {aqi}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Index / 500
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 text-center mt-1 px-4 leading-relaxed">
        {theme.desc}
      </p>

      {/* Pollutant Micro-Chips */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <div className="text-[11px] font-medium text-slate-500">Fine Particulate (PM2.5)</div>
          <div className="text-base font-bold font-mono text-slate-800">
            {pm25 !== null && pm25 !== undefined ? `${pm25} µg/m³` : 'N/A'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
          <div className="text-[11px] font-medium text-slate-500">Coarse Dust (PM10)</div>
          <div className="text-base font-bold font-mono text-slate-800">
            {pm10 !== null && pm10 !== undefined ? `${pm10} µg/m³` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};