import React from 'react';
import MetricCard from '../components/common/MetricCard';
import OverallRiskCard from '../components/dashboard/OverallRiskCard';
import FloorSummaryCard from '../components/dashboard/FloorSummaryCard';
import { 
  Building2, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  Compass, 
  Waves, 
  Clock, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';

export default function Dashboard({ 
  latestReadings, 
  riskData, 
  systemStatus, 
  backendOnline,
  onNavigateToFloor,
  onTriggerShock,
  onRefresh,
  isShocking
}) {
  const f1 = latestReadings?.floor_1;
  const f2 = latestReadings?.floor_2;
  const f1Risk = riskData?.floor_risks?.floor_1;
  const f2Risk = riskData?.floor_risks?.floor_2;

  const activeSensors = systemStatus?.active_sensor_count ?? 4;
  const totalSensors = systemStatus?.total_sensor_count ?? 4;
  const alertCount = systemStatus?.unresolved_alerts_count ?? 0;
  const isLive = systemStatus?.esp32_connection?.is_connected;

  const timestampStr = latestReadings?.timestamp 
    ? new Date(latestReadings.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : '--:--:--';

  return (
    <div className="space-y-6">
      {/* Top Status Bar: Timestamp, System Mode, Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-900/60 p-3.5 rounded-xl border border-navy-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Last Telemetry Sync: <strong className="text-white">{timestampStr}</strong></span>
          <span className="text-slate-600">|</span>
          <span className={isLive ? 'text-cyan-300 font-semibold' : 'text-amber-300'}>
            Mode: {isLive ? 'Live Hardware Feed (ESP32)' : 'Simulated Demo Stream'}
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700/80 text-slate-300 border border-navy-700 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>Sync Now</span>
        </button>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Transducers"
          value={`${activeSensors}/${totalSensors}`}
          subtitle="Dual MPU6050 + Vib"
          icon={Cpu}
          trend="operational"
        />
        <MetricCard
          title="Active Anomaly Alerts"
          value={alertCount}
          subtitle={alertCount > 0 ? "Threshold breach warnings" : "Zero active anomalies"}
          icon={AlertTriangle}
          className={alertCount > 0 ? "border-amber-500/40" : ""}
        />
        <MetricCard
          title="Max Building Tilt"
          value={Math.max(f1?.tilt?.magnitude || 0, f2?.tilt?.magnitude || 0).toFixed(2)}
          unit="deg"
          subtitle="Envelope safe limit: < 2.5°"
          icon={Compass}
        />
        <MetricCard
          title="Max Dynamic Vib"
          value={Math.max(f1?.vibration?.intensity || 0, f2?.vibration?.intensity || 0).toFixed(3)}
          unit="rel"
          subtitle="Piezoelectric shock state"
          icon={Waves}
        />
      </div>

      {/* Primary Structural Risk Card */}
      <OverallRiskCard 
        riskData={riskData} 
        onTriggerShock={onTriggerShock}
        isShocking={isShocking}
      />

      {/* Floor Summaries: Floor 1 and Floor 2 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            Two-Floor Miniature Building Status
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Physical Model Channels
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FloorSummaryCard
            floorNumber={1}
            reading={f1}
            risk={f1Risk}
            onNavigateToFloor={onNavigateToFloor}
          />
          <FloorSummaryCard
            floorNumber={2}
            reading={f2}
            risk={f2Risk}
            onNavigateToFloor={onNavigateToFloor}
          />
        </div>
      </div>
    </div>
  );
}
