import React from 'react';
import { Download, Filter, RefreshCw } from 'lucide-react';

export default function RecentReadingsTable({ readings, onRefresh }) {
  const [floorFilter, setFloorFilter] = React.useState('all');
  const [sourceFilter, setSourceFilter] = React.useState('all');

  const filteredReadings = React.useMemo(() => {
    if (!readings) return [];
    return readings.filter(r => {
      if (floorFilter !== 'all' && r.floor_id !== parseInt(floorFilter)) return false;
      if (sourceFilter !== 'all' && r.data_source !== sourceFilter) return false;
      return true;
    });
  }, [readings, floorFilter, sourceFilter]);

  const exportCSV = () => {
    if (!filteredReadings.length) return;
    const headers = ["Timestamp", "Floor", "TiltMag(deg)", "Pitch(deg)", "Roll(deg)", "AccelX", "AccelY", "AccelZ", "VibIntensity", "CrackDetected", "DataSource"];
    const rows = filteredReadings.map(r => [
      r.timestamp,
      r.floor_id,
      r.tilt?.magnitude ?? '',
      r.tilt?.pitch ?? '',
      r.tilt?.roll ?? '',
      r.accelerometer?.x ?? '',
      r.accelerometer?.y ?? '',
      r.accelerometer?.z ?? '',
      r.vibration?.intensity ?? '',
      r.crack_detected ? 'TRUE' : 'FALSE',
      r.data_source ?? 'simulated'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `structural_readings_${new Date().toISOString().slice(0, 19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-800">
        <div>
          <h3 className="text-base font-bold text-white">Recent Sensor Records Log</h3>
          <p className="text-xs text-slate-400">
            Chronological raw telemetry stream from Floor 1 and Floor 2
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1 Only</option>
            <option value="2">Floor 2 Only</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          >
            <option value="all">All Sources</option>
            <option value="simulated">Simulated Demo</option>
            <option value="live_hardware">Live Hardware</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4 max-h-96">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-900/90 text-slate-400 sticky top-0 border-b border-navy-700">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Floor</th>
              <th className="py-2.5 px-3">Tilt Mag</th>
              <th className="py-2.5 px-3">Pitch / Roll</th>
              <th className="py-2.5 px-3">Accel (X, Y, Z)</th>
              <th className="py-2.5 px-3">Vibration</th>
              <th className="py-2.5 px-3">Crack</th>
              <th className="py-2.5 px-3">Source Tag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60 text-slate-300">
            {filteredReadings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  No readings match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredReadings.slice(-30).reverse().map((r, idx) => {
                const isSimulated = (r.data_source || 'simulated') === 'simulated';
                return (
                  <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(r.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 font-semibold text-sky-300">
                      Floor {r.floor_id}
                    </td>
                    <td className="py-2 px-3 font-bold text-white">
                      {r.tilt?.magnitude?.toFixed(2) ?? '--'}°
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {r.tilt?.pitch?.toFixed(1) ?? '0'}° / {r.tilt?.roll?.toFixed(1) ?? '0'}°
                    </td>
                    <td className="py-2 px-3 text-slate-400">
                      {r.accelerometer?.x?.toFixed(2)}, {r.accelerometer?.y?.toFixed(2)}, {r.accelerometer?.z?.toFixed(2)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={r.vibration?.detected ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                        {r.vibration?.intensity?.toFixed(3) ?? '0.00'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.crack_detected ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                        {r.crack_detected ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isSimulated 
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {isSimulated ? 'SIMULATED' : 'HARDWARE'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
