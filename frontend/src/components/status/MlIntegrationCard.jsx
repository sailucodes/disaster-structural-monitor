import React from 'react';
import { Brain, FileCode, CheckCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function MlIntegrationCard({ mlData }) {
  const status = mlData?.status || 'not_integrated';
  const isReady = mlData?.is_ready || false;

  return (
    <div className="bg-navy-850/80 border border-navy-700/60 rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Machine Learning Subsystem</h3>
            <p className="text-xs text-slate-400 font-mono">
              Model Integration Pipeline & Future Hook
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Status: Not Integrated Yet
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* Notice Box */}
        <div className="bg-navy-900/90 border border-navy-700/80 rounded-lg p-4 text-xs leading-relaxed text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Reserved Integration Point (Independent ML Track)</span>
          </div>
          <p>
            Per project requirements, the full-stack system does <strong>not</strong> invent, fabricate, or simulate fake machine-learning predictions.
            When your machine learning teammate completes training the post-disaster classification or regression model, plug the model into the dedicated backend service.
          </p>
        </div>

        {/* Integration Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-navy-900/60 border border-navy-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Model Files</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Place model files (<code className="text-sky-300">.pkl</code>, <code className="text-sky-300">.onnx</code>, or <code className="text-sky-300">.h5</code>) inside <code className="text-sky-300">backend/</code>.
            </p>
          </div>

          <div className="bg-navy-900/60 border border-navy-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Backend Hook</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Update <code className="text-sky-300 font-mono">ml_service.py</code>: load weights in <code className="text-sky-300">load_ml_model()</code> and toggle <code className="text-sky-300">MODEL_STATUS="active"</code>.
            </p>
          </div>

          <div className="bg-navy-900/60 border border-navy-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-semibold mb-1">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Inference Call</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Call inference in <code className="text-sky-300 font-mono">predict_structural_risk()</code>. The REST API and UI will immediately reflect live ML inferences.
            </p>
          </div>
        </div>

        {/* Expected Input Feature Spec */}
        <div className="bg-navy-900/40 border border-navy-800/80 p-3 rounded-lg text-xs font-mono">
          <span className="text-slate-400 block mb-1 uppercase tracking-wider text-[10px]">Input Tensor Structure Provided to Model:</span>
          <code className="text-sky-300 text-[11px] block whitespace-pre-wrap">
            {`{
  f1: [ax, ay, az, gx, gy, gz, pitch, roll, vib_intensity],
  f2: [ax, ay, az, gx, gy, gz, pitch, roll, vib_intensity],
  history_window: 15_timesteps (30s)
}`}
          </code>
        </div>
      </div>
    </div>
  );
}
