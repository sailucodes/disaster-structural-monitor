import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Shield, Info, Brain, Zap, Clock } from 'lucide-react';

export default function OverallRiskCard({ riskData, onTriggerShock, isShocking }) {
  const level = riskData?.overall_risk_level || 'Low';
  const score = riskData?.overall_score !== undefined ? riskData.overall_score : 0.0;
  const lastUpdate = riskData?.last_update 
    ? new Date(riskData.last_update).toLocaleTimeString() 
    : 'Waiting...';

  // Risk gradient styling
  const borderGradient = level === 'High' 
    ? 'border-rose-500/60 shadow-lg shadow-rose-950/20' 
    : level === 'Medium'
    ? 'border-amber-500/50 shadow-lg shadow-amber-950/20'
    : 'border-emerald-500/40 shadow-lg shadow-emerald-950/20';

  return (
    <div className={`bg-navy-850/90 border rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all ${borderGradient}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-700/60">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Overall Structural Risk Assessment
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time aggregate stability metric evaluated across miniature building floors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={level} type="risk" size="lg" />
          <div className="text-right font-mono">
            <span className="text-2xl font-bold text-white">{(score * 100).toFixed(0)}%</span>
            <span className="text-xs text-slate-400 block">Risk Index</span>
          </div>
        </div>
      </div>

      {/* Risk Gauge Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Structural Index: {score.toFixed(2)} / 1.00</span>
          <span>Threshold: &lt;0.35 Low | 0.35-0.65 Med | &gt;0.65 High</span>
        </div>
        <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-700">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              level === 'High' ? 'bg-gradient-to-r from-amber-500 to-rose-500' :
              level === 'Medium' ? 'bg-gradient-to-r from-emerald-500 to-amber-500' :
              'bg-gradient-to-r from-sky-500 to-emerald-500'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, score * 100))}%` }}
          />
        </div>
      </div>

      {/* ML Integration Note & Controls */}
      <div className="mt-4 pt-4 border-t border-navy-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="md:col-span-2 flex items-start gap-2 text-xs text-slate-300 bg-navy-900/60 p-2.5 rounded-lg border border-navy-700/60">
          <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">ML Model Hook: </span>
            <span className="text-slate-300">
              Model status is <span className="font-mono text-amber-300">not_integrated</span>. Current assessment uses deterministic baseline engineering thresholds (tilt + vibration). Connect model weights in <code className="text-sky-300 font-mono">ml_service.py</code>.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onTriggerShock(0.85)}
            disabled={isShocking}
            className="w-full md:w-auto px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Simulate seismic vibration on miniature model"
          >
            <Zap className={`w-3.5 h-3.5 ${isShocking ? 'animate-bounce text-amber-400' : 'text-rose-400'}`} />
            {isShocking ? 'Shock In Progress...' : 'Simulate Shock Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
