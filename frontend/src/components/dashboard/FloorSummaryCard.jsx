import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { Compass, Waves, ArrowRight, Activity, Layers } from 'lucide-react';

export default function FloorSummaryCard({ 
  floorNumber, 
  reading, 
  risk, 
  onNavigateToFloor 
}) {
  const tiltMag = reading?.tilt?.magnitude !== undefined ? reading.tilt.magnitude.toFixed(2) : '--';
  const pitch = reading?.tilt?.pitch !== undefined ? reading.tilt.pitch.toFixed(2) : '--';
  const roll = reading?.tilt?.roll !== undefined ? reading.tilt.roll.toFixed(2) : '--';
  const vibIntensity = reading?.vibration?.intensity !== undefined ? reading.vibration.intensity.toFixed(3) : '--';
  const vibDetected = reading?.vibration?.detected || false;
  const isCrack = reading?.crack_detected || false;
  const riskLevel = risk?.level || 'Low';
  const explanation = risk?.explanation || 'Operational parameters nominal.';

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 hover:border-navy-600 transition-all flex flex-col justify-between shadow-md">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Floor {floorNumber} {floorNumber === 1 ? '(Ground Base)' : '(Upper Story)'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                MPU6050 MUX Ch {floorNumber - 1} • Vib Sensor {floorNumber}
              </p>
            </div>
          </div>
          <StatusBadge status={riskLevel} type="risk" size="sm" />
        </div>

        {/* Status Explanation */}
        <p className="text-xs text-slate-300 mt-3 bg-navy-900/60 p-2.5 rounded-lg border border-navy-800/80 leading-relaxed min-h-[48px]">
          {explanation}
        </p>

        {/* Sensor Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Tilt Card */}
          <div className="bg-navy-900/80 border border-navy-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Compass className="w-3.5 h-3.5 text-sky-400" /> Tilt Angle
              </span>
              <span className="text-[10px] font-mono">P: {pitch}° | R: {roll}°</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {tiltMag} <span className="text-xs font-normal text-slate-400">deg</span>
            </div>
          </div>

          {/* Vibration Card */}
          <div className="bg-navy-900/80 border border-navy-800 p-3 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Waves className="w-3.5 h-3.5 text-amber-400" /> Vibration
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                vibDetected ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {vibDetected ? 'DETECTED' : 'QUIESCENT'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {vibIntensity} <span className="text-xs font-normal text-slate-400">rel</span>
            </div>
          </div>
        </div>

        {/* Accel Triaxial preview */}
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-navy-900/40 rounded-lg text-xs font-mono text-slate-400 border border-navy-800/60">
          <span>Accel (g):</span>
          <span className="text-slate-300">
            X: {reading?.accelerometer?.x?.toFixed(2) ?? '0.00'} | 
            Y: {reading?.accelerometer?.y?.toFixed(2) ?? '0.00'} | 
            Z: {reading?.accelerometer?.z?.toFixed(2) ?? '1.00'}
          </span>
        </div>
      </div>

      {/* Drill-down button */}
      <button
        onClick={() => onNavigateToFloor(floorNumber)}
        className="mt-4 w-full py-2 px-3 bg-navy-800 hover:bg-navy-700/80 text-sky-400 hover:text-sky-300 border border-navy-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
      >
        <span>View Floor {floorNumber} Detailed Telemetry</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
