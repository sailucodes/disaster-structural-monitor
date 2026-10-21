import React from 'react';

export default function TiltGauge({ pitch = 0, roll = 0, magnitude = 0 }) {
  // Clamp visual displacement to within circle (-20 deg to +20 deg scaled to -45px to +45px)
  const maxVisualAngle = 15;
  const clampedPitch = Math.max(-maxVisualAngle, Math.min(maxVisualAngle, pitch));
  const clampedRoll = Math.max(-maxVisualAngle, Math.min(maxVisualAngle, roll));
  
  // Invert pitch for aviation/gyroscope artificial horizon convention
  const bubbleX = (clampedRoll / maxVisualAngle) * 45;
  const bubbleY = (-clampedPitch / maxVisualAngle) * 45;

  const isWarning = magnitude >= 2.5 && magnitude < 5.0;
  const isCritical = magnitude >= 5.0;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-navy-900/80 rounded-xl border border-navy-800">
      <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
        <span>2D Inclinometer Gauge</span>
      </div>

      <div className="relative w-40 h-40 rounded-full bg-navy-950 border-2 border-navy-700 flex items-center justify-center shadow-inner overflow-hidden">
        {/* Safe threshold zone circle (2.5 deg) */}
        <div className="absolute w-24 h-24 rounded-full border border-dashed border-emerald-500/40 pointer-events-none" />
        
        {/* Warning threshold zone circle (5.0 deg) */}
        <div className="absolute w-32 h-32 rounded-full border border-dashed border-amber-500/30 pointer-events-none" />

        {/* Crosshair axes */}
        <div className="absolute w-full h-[1px] bg-navy-700/80 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-navy-700/80 pointer-events-none" />

        {/* Center alignment reference dot */}
        <div className="w-2 h-2 rounded-full bg-slate-500/50 pointer-events-none" />

        {/* Dynamic Bubble / Tilt Indicator */}
        <div 
          className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-300 shadow-lg flex items-center justify-center ${
            isCritical
              ? 'bg-rose-500/50 border-rose-400 shadow-rose-500/50'
              : isWarning
              ? 'bg-amber-500/50 border-amber-400 shadow-amber-500/50'
              : 'bg-sky-500/40 border-sky-400 shadow-sky-500/40'
          }`}
          style={{
            transform: `translate(${bubbleX}px, ${bubbleY}px)`
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Numerical Pitch & Roll readouts */}
      <div className="grid grid-cols-3 gap-2 w-full mt-3 text-center font-mono text-xs">
        <div className="bg-navy-950 p-1.5 rounded border border-navy-800">
          <span className="text-[10px] text-slate-500 block">PITCH (X)</span>
          <span className="font-semibold text-slate-200">{pitch.toFixed(2)}°</span>
        </div>
        <div className="bg-navy-950 p-1.5 rounded border border-navy-800">
          <span className="text-[10px] text-slate-500 block">ROLL (Y)</span>
          <span className="font-semibold text-slate-200">{roll.toFixed(2)}°</span>
        </div>
        <div className="bg-navy-950 p-1.5 rounded border border-navy-800">
          <span className="text-[10px] text-slate-500 block">TOTAL MAG</span>
          <span className={`font-semibold ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
            {magnitude.toFixed(2)}°
          </span>
        </div>
      </div>
    </div>
  );
}
