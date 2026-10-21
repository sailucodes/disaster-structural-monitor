import React from 'react';
import HardwareStatusCard from '../components/status/HardwareStatusCard';
import SensorHealthTable from '../components/status/SensorHealthTable';
import MlIntegrationCard from '../components/status/MlIntegrationCard';
import { Cpu, RefreshCw, Power } from 'lucide-react';

export default function SystemStatus({ 
  systemStatus, 
  backendOnline, 
  onRefresh, 
  onToggleDemo 
}) {
  const isDemo = systemStatus?.backend?.mode === 'demo';

  return (
    <div className="space-y-6">
      {/* Header with Control Buttons */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            System Architecture & Hardware Bus Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Microcontroller telemetry status, PCA9548A multiplexer routing, backend REST API, and ML hook
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Toggle demo simulation */}
          <button
            onClick={onToggleDemo}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition-all ${
              isDemo
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>Demo Sim: {isDemo ? 'Active' : 'Paused'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 rounded-lg transition-colors"
            title="Refresh system status"
          >
            <RefreshCw className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>

      {/* Gateway & Ingestion Status */}
      <HardwareStatusCard 
        systemStatus={systemStatus} 
        backendOnline={backendOnline} 
      />

      {/* Sensor Bus Topology & Individual Health */}
      <SensorHealthTable sensors={systemStatus?.sensors} />

      {/* ML Model Integration Hub */}
      <MlIntegrationCard mlData={systemStatus?.ml_model} />
    </div>
  );
}
