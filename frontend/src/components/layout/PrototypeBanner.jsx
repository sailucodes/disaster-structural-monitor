import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function PrototypeBanner() {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs md:text-sm text-amber-200 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-300">College Engineering Prototype:</strong> Structural health monitoring research model for simulated two-floor seismic testing. 
          <span className="text-amber-300/80 ml-1 hidden sm:inline">Not certified for real-world municipal or building life safety.</span>
        </span>
      </div>
    </div>
  );
}
