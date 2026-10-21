import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine 
} from 'recharts';

export default function TiltComparisonChart({ historyData }) {
  // Transform and pair readings by approximate timestamp or index
  // Group readings by floor
  const chartData = React.useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    // Sort ascending by timestamp
    const sorted = [...historyData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // We can map into timeline entries
    return sorted.map((item, idx) => {
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
      return {
        time: timeStr,
        timestamp: item.timestamp,
        floorId: item.floor_id,
        f1_tilt: item.floor_id === 1 ? item.tilt?.magnitude : undefined,
        f2_tilt: item.floor_id === 2 ? item.tilt?.magnitude : undefined,
        tilt: item.tilt?.magnitude || 0,
        source: item.data_source || 'simulated'
      };
    });
  }, [historyData]);

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-white">Structural Tilt Time-Series</h3>
          <p className="text-xs text-slate-400">
            Comparative tilt angle magnitude (deg) for Floor 1 vs Floor 2
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Floor 1
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Floor 2
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 mt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            Awaiting telemetry history...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                domain={[0, 'auto']}
                unit="°"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#334155', 
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }} 
              />
              {/* Warning and Critical thresholds */}
              <ReferenceLine y={2.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn (2.5°)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crit (5.0°)', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
              
              <Line 
                type="monotone" 
                dataKey="f1_tilt" 
                name="Floor 1 Tilt" 
                stroke="#38bdf8" 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="f2_tilt" 
                name="Floor 2 Tilt" 
                stroke="#fbbf24" 
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
