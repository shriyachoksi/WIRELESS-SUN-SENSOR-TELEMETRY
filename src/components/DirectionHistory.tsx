import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Route } from 'lucide-react';

export const DirectionHistory: React.FC = () => {
  const { trajectory } = useTelemetry();

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <Route className="w-4 h-4 text-amber-500" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Direction History
            </h3>
            <p className="text-xs font-mono text-slate-500">
              3D Vector trajectory trail & tracking path
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-xs">
          TRAJECTORY LENGTH: {trajectory.length} PTS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 bg-slate-900 p-4 rounded-xs border border-slate-800 flex flex-col items-center justify-center">
          <div className="text-[10px] font-mono text-amber-400 mb-2 uppercase tracking-wider">
            HEMISPHERIC VECTOR TRAJECTORY
          </div>

          <svg viewBox="0 0 240 240" className="w-full max-w-[220px] h-[220px]">
            <circle cx="120" cy="120" r="100" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="120" cy="120" r="66" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx="120" cy="120" r="33" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

            <line x1="20" y1="120" x2="220" y2="120" stroke="#475569" strokeWidth="1" />
            <line x1="120" y1="20" x2="120" y2="220" stroke="#475569" strokeWidth="1" />

            <text x="120" y="14" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">+Y (90°)</text>
            <text x="120" y="234" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle">-Y (270°)</text>
            <text x="226" y="123" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="start">+X (0°)</text>
            <text x="14" y="123" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="end">-X (180°)</text>

            {trajectory.length > 1 && (
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeOpacity="0.7"
                strokeDasharray="2,2"
                points={trajectory
                  .map((pt) => {
                    const cx = 120 + pt.vector.x * 90;
                    const cy = 120 - pt.vector.y * 90;
                    return `${cx},${cy}`;
                  })
                  .join(' ')}
              />
            )}

            {trajectory.map((pt, idx) => {
              const cx = 120 + pt.vector.x * 90;
              const cy = 120 - pt.vector.y * 90;
              const isLatest = idx === trajectory.length - 1;

              return (
                <g key={pt.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLatest ? 6 : 3.5}
                    fill={isLatest ? '#f59e0b' : '#3b82f6'}
                    fillOpacity={pt.opacity}
                  />
                  {isLatest && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="10"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="md:col-span-6 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
            RECENT VECTOR POSITIONS (FADING TRAIL)
          </span>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {trajectory.slice(-6).reverse().map((pt, idx) => (
              <div
                key={pt.id}
                className={`p-2.5 rounded-xs border font-mono text-xs flex items-center justify-between transition-colors ${
                  idx === 0
                    ? 'bg-amber-50 border-amber-300 font-bold text-amber-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">T-{idx * 0.3}s</span>
                  <span className="text-slate-900">
                    [{pt.vector.x > 0 ? `+${pt.vector.x}` : pt.vector.x},{' '}
                    {pt.vector.y > 0 ? `+${pt.vector.y}` : pt.vector.y},{' '}
                    {pt.vector.z > 0 ? `+${pt.vector.z}` : pt.vector.z}]
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-slate-500">DOM: {pt.dominantFace}</span>
                  <span className="text-slate-400">{pt.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
