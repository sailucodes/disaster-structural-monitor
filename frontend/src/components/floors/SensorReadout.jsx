import React from 'react';
import { Waves, Compass, RotateCw, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function SensorReadout({ reading }) {
  const accel = reading?.accelerometer || { x: 0, y: 0, z: 1.0 };
  const gyro = reading?.gyroscope || { x: 0, y: 0, z: 0 };
  const vibration = reading?.vibration || { detected: false, intensity: 0.0 };
  const crack = reading?.crack_detected || false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Accelerometer Card */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 border-b border-navy-800 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Compass className="w-4 h-4" /> MPU6050 Accelerometer
          </span>
          <span className="text-slate-400">Units: g-force</span>
        </div>

        <div className="space-y-2.5 mt-3">
          {['x', 'y', 'z'].map((axis) => {
            const val = accel[axis] !== undefined ? accel[axis] : 0.0;
            // Normalize around nominal (-1.5g to +1.5g)
            const percent = Math.min(100, Math.max(0, ((val + 1.5) / 3.0) * 100));
            return (
              <div key={axis} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase">Axis {axis}</span>
                  <span className="text-slate-200 font-semibold">{val.toFixed(3)} g</span>
                </div>
                <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
                  <div 
                    className="h-full bg-sky-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gyroscope Card */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 border-b border-navy-800 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <RotateCw className="w-4 h-4" /> MPU6050 Gyroscope
          </span>
          <span className="text-slate-400">Units: °/s</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center font-mono">
          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-500 block">GYRO X</span>
            <span className="text-sm font-bold text-slate-200">{gyro.x?.toFixed(2) ?? '0.00'}</span>
            <span className="text-[10px] text-slate-500 block">°/s</span>
          </div>
          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-500 block">GYRO Y</span>
            <span className="text-sm font-bold text-slate-200">{gyro.y?.toFixed(2) ?? '0.00'}</span>
            <span className="text-[10px] text-slate-500 block">°/s</span>
          </div>
          <div className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
            <span className="text-[10px] text-slate-500 block">GYRO Z</span>
            <span className="text-sm font-bold text-slate-200">{gyro.z?.toFixed(2) ?? '0.00'}</span>
            <span className="text-[10px] text-slate-500 block">°/s</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 font-mono">
          Angular velocity measured via PCA9548A multiplexed I²C bus.
        </p>
      </div>

      {/* Vibration Sensor Module */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-4">
        <div className="flex items-center justify-between pb-2 border-b border-navy-800 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-amber-400">
            <Waves className="w-4 h-4" /> Piezo/Vibration Sensor
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
            vibration.detected ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {vibration.detected ? 'SHOCK DETECTED' : 'QUIESCENT'}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="text-slate-400">Normalized Intensity:</span>
            <span className="text-base font-bold text-white">{(vibration.intensity * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                vibration.intensity > 0.6 ? 'bg-rose-500' :
                vibration.intensity > 0.25 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, vibration.intensity * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Crack Sensor Expansion */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-navy-800 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold text-sky-400">
            <AlertOctagon className="w-4 h-4" /> Expansion: Crack Sensor
          </span>
          <span className="text-slate-500 text-[10px]">Future Integration Slot</span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          {crack ? (
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          )}
          <div>
            <div className="text-xs font-mono font-semibold text-slate-200">
              {crack ? 'Crack Contact Broken (Triggered)' : 'Structural Continuity Intact'}
            </div>
            <p className="text-[11px] text-slate-400">
              Conductive trace / foil crack detection module pin status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
