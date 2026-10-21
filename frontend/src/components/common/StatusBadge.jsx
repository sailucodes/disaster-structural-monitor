import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function StatusBadge({ status, type = 'risk', size = 'md' }) {
  const norm = (status || '').toString().toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = Clock;
  let label = status || 'Unknown';

  if (type === 'risk') {
    if (norm === 'low') {
      colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-950/20';
      Icon = ShieldCheck;
      label = 'Low Risk';
    } else if (norm === 'medium') {
      colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/20';
      Icon = AlertTriangle;
      label = 'Medium Risk';
    } else if (norm === 'high') {
      colorClasses = 'bg-rose-950/60 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/20 animate-pulse';
      Icon = ShieldAlert;
      label = 'High Risk';
    }
  } else if (type === 'severity') {
    if (norm === 'info') {
      colorClasses = 'bg-sky-950/60 text-sky-300 border-sky-500/40';
      Icon = CheckCircle2;
      label = 'Info';
    } else if (norm === 'warning') {
      colorClasses = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      Icon = AlertTriangle;
      label = 'Warning';
    } else if (norm === 'critical') {
      colorClasses = 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse';
      Icon = ShieldAlert;
      label = 'Critical';
    }
  } else if (type === 'health') {
    if (norm === 'ok' || norm === 'online') {
      colorClasses = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
      Icon = CheckCircle2;
      label = 'Operational';
    } else {
      colorClasses = 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      Icon = AlertTriangle;
      label = norm === 'standby' ? 'Standby' : 'Disconnected';
    }
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-sm gap-2' 
    : size === 'sm' 
    ? 'px-2 py-0.5 text-[11px] gap-1' 
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-mono font-medium rounded-full border ${colorClasses} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
}
