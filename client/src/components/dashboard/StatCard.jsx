import React from 'react';

export const StatCard = ({ title, value, unit, icon: Icon, color, subtitle, badge }) => {
  return (
    <div className="group relative apple-glass rounded-3xl p-5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-200/50 overflow-hidden flex flex-col justify-between">
      {/* Specular Diagonal Sheen on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-x-full group-hover:translate-x-full ease-in-out" />

      <div className="flex items-start justify-between relative z-10">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl ${color} text-white shadow-md shadow-current/30 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="my-3 relative z-10">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-3xl font-black font-mono tracking-tight text-slate-900 group-hover:tracking-normal transition-all duration-300">
            {value}
          </span>
          {unit && <span className="text-sm font-bold text-slate-400 font-mono">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {badge && (
        <div className="pt-2 border-t border-slate-200/50 relative z-10 flex items-center justify-between">
          <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-900/5 text-slate-700">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};