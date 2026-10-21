import React from 'react';
import { Cpu, Wifi, WifiOff, Server, HardDrive, Shield } from 'lucide-react';

export default function HardwareStatusCard({ systemStatus, backendOnline }) {
  const esp = systemStatus?.esp32_connection || {};
  const isConnected = esp.is_connected;
  const backend = systemStatus?.backend || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ESP32 Hardware Unit */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isConnected 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ESP32 Gateway Controller</h3>
              <p className="text-xs text-slate-400 font-mono">Microcontroller Data Hub</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 border ${
            isConnected
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          }`}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Hardware Live' : 'Demo Mode'}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">IP Address:</span>
            <span className="text-slate-200">{esp.ip_address || '192.168.1.xxx (Awaiting handshake)'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">Heartbeat Interval:</span>
            <span className="text-slate-200">
              {esp.seconds_since_last_ping !== null && esp.seconds_since_last_ping !== undefined 
                ? `${esp.seconds_since_last_ping}s ago` 
                : (isConnected ? 'Active' : 'Simulated ~1.5s')}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">Total Packets Ingested:</span>
            <span className="text-slate-200">{esp.total_packets_received || 0}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Multiplexer:</span>
            <span className="text-sky-400 font-semibold">PCA9548A (Address 0x70)</span>
          </div>
        </div>
      </div>

      {/* Backend API Server */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              backendOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Flask Ingestion Server</h3>
              <p className="text-xs text-slate-400 font-mono">REST API Engine</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            backendOnline 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' 
              : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
          }`}>
            {backendOnline ? '● Online (Port 5000)' : '○ Offline'}
          </span>
        </div>

        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">Operating Mode:</span>
            <span className="text-sky-300 uppercase font-semibold">{backend.mode || 'demo'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">Ingress Endpoint:</span>
            <span className="text-slate-200">POST /api/readings</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-navy-800/80">
            <span className="text-slate-400">CORS Policy:</span>
            <span className="text-emerald-400">Enabled (Vite client permissible)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Telemetry Buffer:</span>
            <span className="text-slate-200">In-Memory Ring Buffer (300 records/floor)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
