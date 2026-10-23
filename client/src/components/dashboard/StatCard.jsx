import React from 'react';

export const StatCard = ({ title, value, unit, icon: Icon, color, subtitle, badge }) => {
  return (
    <div className="apple-glass rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300">
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${color} text-white shadow-sm shadow-current/30`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="my-3">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-black font-mono tracking-tight text-slate-800">
            {value}
          </span>
          {unit && <span className="text-sm font-bold text-slate-400 font-mono">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] font-medium text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {badge && (
        <div className="pt-2 border-t border-slate-100/80">
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};