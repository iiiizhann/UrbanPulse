import React from 'react';

export const StatCard = ({ title, value, unit, icon: Icon, color, subtitle, badge }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        {badge && (
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};