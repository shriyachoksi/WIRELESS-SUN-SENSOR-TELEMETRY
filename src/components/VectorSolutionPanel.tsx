import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Cpu, ArrowRight, Sparkles } from 'lucide-react';

export const VectorSolutionPanel: React.FC = () => {
  const { currentPacket } = useTelemetry();
  const { vector, dominantFace, confidencePct, angularStabilityDeg } = currentPacket;

  const pipelineSteps = [
    { label: 'LDR Measurements', code: '6 Raw ADCs' },
    { label: 'Normalization', code: '0.00 - 1.00' },
    { label: 'Face Differential', code: 'X, Y, Z Δ' },
    { label: 'Vector Summation', code: 'V = [ΔX, ΔY, ΔZ]' },
    { label: 'Normalizing', code: '||V|| = 1.0' },
    { label: 'Estimated Direction', code: 'Az & El' },
  ];

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Vector Solution Pipeline
            </h3>
            <p className="text-xs font-mono text-slate-500">
              Photometric solver execution pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xs border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>SIMULATED TELEMETRY</span>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 p-4 rounded-xs border border-slate-200 overflow-x-auto">
        <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">CALCULATION PIPELINE</div>
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {pipelineSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex-1 bg-white p-2.5 rounded-xs border border-slate-200 text-center shadow-2xs">
                <span className="text-[10px] font-mono text-slate-500 block">{step.label}</span>
                <span className="text-xs font-mono font-bold text-slate-900 block mt-0.5">{step.code}</span>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xs border border-slate-800 font-mono">
            <span className="text-[10px] text-amber-400 block mb-1 uppercase tracking-wider">
              RESOLVED LIGHT DIRECTION VECTOR (V)
            </span>
            <div className="text-xl sm:text-2xl font-bold tracking-wider text-white">
              V = [{' '}
              <span className="text-blue-400">{vector.x > 0 ? `+${vector.x.toFixed(2)}` : vector.x.toFixed(2)}</span>,{' '}
              <span className="text-emerald-400">{vector.y > 0 ? `+${vector.y.toFixed(2)}` : vector.y.toFixed(2)}</span>,{' '}
              <span className="text-amber-400">{vector.z > 0 ? `+${vector.z.toFixed(2)}` : vector.z.toFixed(2)}</span>{' '}
              ]
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800">
              <span>MAGNITUDE ||V|| = {vector.magnitude.toFixed(2)}</span>
              <span>AZIMUTH: {vector.azimuth}° | ELEVATION: {vector.elevation}°</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                DOMINANT FACE
              </span>
              <span className="text-base font-bold font-mono text-amber-600">
                {dominantFace}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                CONFIDENCE
              </span>
              <span className="text-base font-bold font-mono text-emerald-600">
                {confidencePct}%
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xs border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                STABILITY
              </span>
              <span className="text-base font-bold font-mono text-blue-600">
                ±{angularStabilityDeg}°
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 bg-slate-900 p-4 rounded-xs border border-slate-800 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase mb-2">
            2D PROJECTION DIAGRAM
          </span>
          <svg viewBox="0 0 200 180" className="w-full max-w-[200px] h-[160px]">
            <line x1="100" y1="90" x2="180" y2="90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="185" y="94" fill="#ef4444" fontSize="10" fontFamily="monospace">+X</text>

            <line x1="100" y1="90" x2="100" y2="10" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="96" y="8" fill="#22c55e" fontSize="10" fontFamily="monospace">+Y</text>

            <line x1="100" y1="90" x2="40" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="25" y="160" fill="#f59e0b" fontSize="10" fontFamily="monospace">+Z</text>

            <circle cx="100" cy="90" r="3" fill="#64748b" />

            {(() => {
              const projX = 100 + vector.x * 60 - vector.z * 30;
              const projY = 90 - vector.y * 60 + vector.z * 30;
              return (
                <g>
                  <line
                    x1="100"
                    y1="90"
                    x2={projX}
                    y2={projY}
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx={projX} cy={projY} r="5" fill="#f59e0b" />
                  <circle cx={projX} cy={projY} r="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" />
                  <text
                    x={projX + 8}
                    y={projY - 4}
                    fill="#fbbf24"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    V
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </section>
  );
};
