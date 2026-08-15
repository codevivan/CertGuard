import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext }) => {
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-orange-500/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-red-500/5 text-rose-400 border-rose-500/30',
    purple: 'from-purple-500/20 to-violet-500/5 text-purple-400 border-purple-500/30',
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${currentTheme} glass-panel relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="text-3xl font-extrabold font-heading text-white mt-1">{value}</div>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-slate-900/60 border border-slate-800 shadow-inner`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
