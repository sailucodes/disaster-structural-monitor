import React from 'react';
import StatusBadge from '../components/common/StatusBadge';
import TiltGauge from '../components/floors/TiltGauge';
import SensorReadout from '../components/floors/SensorReadout';
import { Layers, Compass, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function FloorMonitoring({ latestReadings, riskData, selectedFloor = 1, setSelectedFloor }) {
  const currentFloor = selectedFloor || 1;
  const reading = currentFloor === 1 ? latestReadings?.floor_1 : latestReadings?.floor_2;
  const risk = currentFloor === 1 ? riskData?.floor_risks?.floor_1 : riskData?.floor_risks?.floor_2;

  const tiltMag = reading?.tilt?.magnitude || 0;
  const pitch = reading?.tilt?.pitch || 0;
  const roll = reading?.tilt?.roll || 0;
  const riskLevel = risk?.level || 'Low';
  const explanation = risk?.explanation || 'Operational parameters nominal.';

  return (
    <div className="space-y-6">
      {/* Floor Selector Header */}
      <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            Floor Structural Telemetry Inspection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed 6-DoF inertial & piezoelectric diagnostics per miniature building level
          </p>
        </div>

        {/* Floor Switcher Buttons */}
        <div className="flex items-center gap-2 bg-navy-900 p-1 rounded-lg border border-navy-700 self-start sm:self-auto">
          <button
            onClick={() => setSelectedFloor && setSelectedFloor(1)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              currentFloor === 1
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Floor 1 (Ground Base)
          </button>
          <button
            onClick={() => setSelectedFloor && setSelectedFloor(2)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
              currentFloor === 2
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Floor 2 (Upper Story)
          </button>
        </div>
      </div>

      {/* Main Floor Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tilt Gauge & Status */}
        <div className="lg:col-span-1 space-y-4">
          <TiltGauge pitch={pitch} roll={roll} magnitude={tiltMag} />

          {/* Risk Card for this floor */}
          <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <span className="text-xs font-mono uppercase text-slate-400">Floor {currentFloor} Risk Evaluation</span>
              <StatusBadge status={riskLevel} type="risk" size="sm" />
            </div>

            <div className="bg-navy-900/80 p-3 rounded-lg border border-navy-800 text-xs text-slate-300 leading-relaxed">
              <div className="text-[11px] font-semibold text-sky-400 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Diagnostic Assessment:
              </div>
              {explanation}
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Safe Tilt Limit:</span>
                <span className="text-emerald-400">&lt; 2.50°</span>
              </div>
              <div className="flex justify-between">
                <span>Warning Limit:</span>
                <span className="text-amber-400">2.50° - 5.00°</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Structural Limit:</span>
                <span className="text-rose-400">&gt; 5.00°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sensor Readout Panel */}
        <div className="lg:col-span-2">
          <SensorReadout reading={reading} />
        </div>

      </div>
    </div>
  );
}
