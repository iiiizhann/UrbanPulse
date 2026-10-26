import React from 'react';
import { Sun, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { evaluateOutdoorWindow } from '../../utils/activityAdvisor';

export const OutdoorActivityCard = ({ aqi = 120, temperature = 27, trends = [] }) => {
  const assessment = evaluateOutdoorWindow(aqi, temperature, trends);

  return (
    <div className="apple-glass rounded-3xl p-6 relative overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
            <Sun className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
              Outdoor Activity Planner
            </h3>
            <p className="text-[11px] text-slate-500">
              Thermal and respiratory index for outdoor workouts
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${assessment.badgeColor}`}
        >
          {assessment.primaryBadge}
        </span>
      </div>

      {/* Recommended Prime Window */}
      <div className="bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-black tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Optimal Outdoor Window</span>
          </div>
          <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
            {assessment.recommendedTimeSlot}
          </div>
          <p className="text-[11px] text-slate-500">{assessment.windowStatus}</p>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Indices</span>
          <span className="text-xs font-bold text-slate-700">AQI: {aqi}</span>
          <span className="text-xs font-bold text-slate-700">Temp: {temperature}°C</span>
        </div>
      </div>

      {/* Plain Actionable Guidance */}
      <p className="text-xs text-slate-600 leading-relaxed font-medium">
        {assessment.advice}
      </p>

      {/* Activity Suitability Checklist */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/50">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-slate-200/60">
          {assessment.activities.running ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
          <span className="text-[11px] font-bold text-slate-700">Running</span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-slate-200/60">
          {assessment.activities.cycling ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
          <span className="text-[11px] font-bold text-slate-700">Cycling</span>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-slate-200/60">
          {assessment.activities.childrenPlay ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          )}
          <span className="text-[11px] font-bold text-slate-700">Kids Outdoors</span>
        </div>
      </div>
    </div>
  );
};

export default OutdoorActivityCard;