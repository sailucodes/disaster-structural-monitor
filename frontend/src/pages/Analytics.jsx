import React from 'react';
import TiltComparisonChart from '../components/analytics/TiltComparisonChart';
import VibrationChart from '../components/analytics/VibrationChart';
import RecentReadingsTable from '../components/analytics/RecentReadingsTable';
import { LineChart, Clock, RefreshCw } from 'lucide-react';

export default function Analytics({ historyData, onRefresh, historyLimit, setHistoryLimit }) {
  return (
    <div className="space-y-6">
      {/* Header & Limit Selector */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-sky-400" />
            Time-Series Dynamics & Multi-Floor Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare inertial tilt and vibration trends between Ground Base (Floor 1) and Upper Story (Floor 2)
          </p>
        </div>

        {/* History Window Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Window:
          </span>
          <div className="flex bg-navy-900 p-1 rounded-lg border border-navy-700 text-xs font-mono">
            {[30, 60, 120, 200].map((lim) => (
              <button
                key={lim}
                onClick={() => setHistoryLimit(lim)}
                className={`px-3 py-1 rounded-md transition-all ${
                  historyLimit === lim
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lim} pts
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            className="p-2 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 rounded-lg transition-colors"
            title="Refresh analytics dataset"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TiltComparisonChart historyData={historyData} />
        <VibrationChart historyData={historyData} />
      </div>

      {/* Raw Data Log Table */}
      <RecentReadingsTable readings={historyData} onRefresh={onRefresh} />
    </div>
  );
}
