import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine 
} from 'recharts';

export default function VibrationChart({ historyData }) {
  const chartData = React.useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    const sorted = [...historyData].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return sorted.map((item) => {
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
      return {
        time: timeStr,
        timestamp: item.timestamp,
        floorId: item.floor_id,
        f1_vib: item.floor_id === 1 ? item.vibration?.intensity : undefined,
        f2_vib: item.floor_id === 2 ? item.vibration?.intensity : undefined,
      };
    });
  }, [historyData]);

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-navy-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-white">Dynamic Vibration Oscillations</h3>
          <p className="text-xs text-slate-400">
            Piezoelectric vibration sensor amplitude (relative 0.0 - 1.0)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> F1 Vib
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> F2 Vib
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 mt-4">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
            Awaiting vibration telemetry...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorF1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorF2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                domain={[0, 1.0]} 
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
              <ReferenceLine y={0.35} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn (0.35)', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />
              <ReferenceLine y={0.7} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crit (0.70)', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} />
              
              <Area 
                type="monotone" 
                dataKey="f1_vib" 
                name="Floor 1 Vibration" 
                stroke="#06b6d4" 
                fillOpacity={1} 
                fill="url(#colorF1)" 
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="f2_vib" 
                name="Floor 2 Vibration" 
                stroke="#f43f5e" 
                fillOpacity={1} 
                fill="url(#colorF2)" 
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
