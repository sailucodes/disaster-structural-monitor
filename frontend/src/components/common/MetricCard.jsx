import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle, 
  icon: Icon, 
  badge,
  trend,
  className = ''
}) {
  return (
    <div className={`bg-navy-850/80 border border-navy-700/60 rounded-xl p-4 sm:p-5 backdrop-blur-sm shadow-md transition-all hover:border-navy-600/80 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              {value}
            </span>
            {unit && <span className="text-xs sm:text-sm font-mono text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || badge || trend) && (
        <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
}
