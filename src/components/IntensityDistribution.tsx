import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { SensorFace } from '../types/telemetry';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export const IntensityDistribution: React.FC = () => {
  const { currentPacket } = useTelemetry();
  const { sensors, dominantFace } = currentPacket;

  const sortedFaces = (Object.keys(sensors) as SensorFace[]).sort(
    (a, b) => (sensors[b]?.rawADC || 0) - (sensors[a]?.rawADC || 0)
  );

  const maxADC = Math.max(...sortedFaces.map((f) => sensors[f]?.rawADC || 0), 1023);

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Intensity Distribution
            </h3>
            <p className="text-xs font-mono text-slate-500">
              Photometric balance across all six faces
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">MAX READOUT:</span>
          <span className="font-bold text-slate-900">{sensors[dominantFace]?.rawADC || 921} ADC</span>
        </div>
      </div>

      <div className="space-y-3">
        {sortedFaces.map((face) => {
          const sensor = sensors[face];
          if (!sensor) return null;

          const isDominant = face === dominantFace;
          const pct = Math.max(3, (sensor.rawADC / maxADC) * 100);

          return (
            <div
              key={face}
              className={`p-3 rounded-xs border transition-all ${
                isDominant
                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-bold w-10 text-center py-0.5 rounded-xs text-[11px] ${
                      isDominant
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-800 text-slate-100'
                    }`}
                  >
                    {face}
                  </span>
                  <span className="text-slate-500 font-semibold">{sensor.id}</span>
                  {isDominant && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-xs">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" /> DOMINANT SENSOR
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">
                    {sensor.normalized.toFixed(2)} NORM
                  </span>
                  <span className="font-bold text-slate-900 w-16 text-right">
                    {sensor.rawADC} ADC
                  </span>
                </div>
              </div>

              <div className="relative w-full bg-slate-200/80 h-3.5 rounded-xs overflow-hidden border border-slate-300/60 flex items-center">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDominant
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />

                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-25 px-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-full w-px bg-slate-900" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
