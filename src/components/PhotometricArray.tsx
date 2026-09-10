import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import type { SensorFace, SensorData } from '../types/telemetry';
import { ArrowUpRight, ArrowDownRight, Minus, Sun, ShieldCheck, AlertTriangle } from 'lucide-react';

export const PhotometricArray: React.FC = () => {
  const { currentPacket, selectedFace, setSelectedFace } = useTelemetry();
  const { sensors, dominantFace } = currentPacket;
  const [hoveredFace, setHoveredFace] = useState<SensorFace | null>(null);

  const facesDisplay: SensorFace[] = ['+Z', '+X', '+Y', '-X', '-Y', '-Z'];

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              SENSOR INSTRUMENTATION
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            Photometric Array
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">
            Six-face LDR intensity distribution
          </p>
        </div>

        <div className="text-right text-[11px] font-mono text-slate-500">
          <span>ACTIVE SENSORS: </span>
          <strong className="text-emerald-600">6 / 6 NOMINAL</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {facesDisplay.map((face) => {
          const sensor: SensorData = sensors[face] || {
            face,
            id: 'LDR-01',
            rawADC: 0,
            normalized: 0,
            contributionPct: 0,
            trend: 'stable',
            status: 'NOMINAL',
          };

          const isDominant = face === dominantFace;
          const isSelected = face === selectedFace;
          const isHovered = face === hoveredFace;

          return (
            <div
              key={face}
              onClick={() => setSelectedFace(isSelected ? null : face)}
              onMouseEnter={() => setHoveredFace(face)}
              onMouseLeave={() => setHoveredFace(null)}
              className={`relative p-4 rounded-xs border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-md ring-1 ring-blue-400'
                  : isDominant
                  ? 'bg-amber-50/60 border-amber-300 shadow-xs hover:border-amber-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded-xs border ${
                      isDominant
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold'
                        : 'bg-slate-900 text-slate-100 border-slate-800'
                    }`}
                  >
                    FACE {face}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    {sensor.id}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {isDominant && (
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-200/80 border border-amber-300 px-1.5 py-0.5 rounded-xs">
                      DOMINANT
                    </span>
                  )}
                  {sensor.status === 'NOMINAL' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                    {sensor.rawADC}
                  </span>
                  <span className="text-xs font-mono text-slate-500 ml-1">ADC</span>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-mono font-semibold text-slate-700">
                    <span>NORM: {sensor.normalized.toFixed(2)}</span>
                    {sensor.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                    {sensor.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                    {sensor.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    CONTRIB: {sensor.contributionPct}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-xs overflow-hidden border border-slate-200/80">
                <div
                  className={`h-full transition-all duration-300 ${
                    isDominant
                      ? 'bg-amber-500 shadow-amber-300'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, sensor.normalized * 100))}%` }}
                />
              </div>

              {(isHovered || isSelected) && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                  <span>REL CONTRIBUTION: <strong className="text-slate-900">{sensor.contributionPct}%</strong></span>
                  <span className="text-slate-400">{currentPacket.timestamp}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
