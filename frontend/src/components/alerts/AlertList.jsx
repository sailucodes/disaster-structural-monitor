import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { AlertCircle, ShieldAlert, AlertTriangle, CheckCircle, Clock, Filter, Layers } from 'lucide-react';

export default function AlertList({ alerts }) {
  const [severityFilter, setSeverityFilter] = React.useState('all');
  const [floorFilter, setFloorFilter] = React.useState('all');

  const filteredAlerts = React.useMemo(() => {
    if (!alerts) return [];
    return alerts.filter(a => {
      if (severityFilter !== 'all' && a.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
      if (floorFilter !== 'all' && a.floor_id !== parseInt(floorFilter)) return false;
      return true;
    });
  }, [alerts, severityFilter, floorFilter]);

  const criticalCount = alerts?.filter(a => a.severity === 'critical').length || 0;
  const warningCount = alerts?.filter(a => a.severity === 'warning').length || 0;

  return (
    <div className="space-y-4">
      {/* Overview & Filter Bar */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-sky-400" />
            Alerts & Anomaly Incident Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic triggers from threshold breaches, seismic shock tests, and hardware events
          </p>
        </div>

        {/* Severity counters & Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono mr-2">
            <span className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40">
              {criticalCount} Critical
            </span>
            <span className="px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
              {warningCount} Warnings
            </span>
          </div>

          {/* Severity selector */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>

          {/* Floor selector */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="all">All Floors</option>
            <option value="0">System Wide (0)</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
          </select>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="bg-navy-850/60 border border-navy-800 rounded-xl p-8 text-center text-slate-500 font-mono text-sm">
            No incidents reported matching selected criteria.
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isCrit = item.severity === 'critical';
            const isWarn = item.severity === 'warning';
            const borderCol = isCrit 
              ? 'border-rose-500/40 bg-rose-950/10' 
              : isWarn 
              ? 'border-amber-500/40 bg-amber-950/10' 
              : 'border-navy-700/80 bg-navy-850/80';

            return (
              <div 
                key={item.id} 
                className={`border rounded-xl p-4 transition-all hover:border-slate-600 ${borderCol}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={item.severity} type="severity" size="sm" />
                    <span className="font-bold text-sm text-slate-100">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      {item.floor_id === 0 ? 'System' : `Floor ${item.floor_id}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed pl-1">
                  {item.message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
