import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { CubeSat3D } from './CubeSat3D';
import { Navigation, Info } from 'lucide-react';

export const CubeSatHero: React.FC = () => {
  const { currentPacket, selectedVectorComponent, setSelectedVectorComponent } = useTelemetry();
  const { vector } = currentPacket;

  const formatCoord = (val: number) => {
    if (val >= 0) return `+${val.toFixed(2)}`;
    return val.toFixed(2);
  };

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-tech-pulse" />
            <span className="text-xs font-mono font-bold text-amber-600 uppercase tracking-widest">
              PRIMARY VECTOR SOLUTION
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            Light Source Direction
          </h2>
          <p className="text-sm text-slate-500 font-mono mt-1">
            Estimated direction derived from six-face photometric measurements
          </p>
        </div>

        {/* Solver Quick Status Tag */}
        <div className="flex items-center gap-3 font-mono text-xs bg-slate-50 px-3.5 py-2 rounded-xs border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[10px]">SOLVER:</span>
            <span className="text-slate-800 font-bold">SPHERICAL SUMMATION</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400 block text-[10px]">CONFIDENCE:</span>
            <span className="text-emerald-600 font-bold">{currentPacket.confidencePct}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Visualization + Telemetry Output Metrics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <CubeSat3D />
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-4 bg-slate-50 p-5 rounded-xs border border-slate-200">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-mono font-bold text-slate-900 tracking-wider uppercase">
                  LIGHT VECTOR [V]
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-xs border border-slate-200">
                UNIT VECTOR
              </span>
            </div>

            <div className="space-y-2.5 mb-6">
              <button
                onClick={() => setSelectedVectorComponent(selectedVectorComponent === 'X' ? null : 'X')}
                className={`w-full flex items-center justify-between p-3 rounded-xs border font-mono transition-all cursor-pointer ${
                  selectedVectorComponent === 'X'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-xs bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    X
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Vector X Component</span>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono tracking-wider">
                  {formatCoord(vector.x)}
                </span>
              </button>

              <button
                onClick={() => setSelectedVectorComponent(selectedVectorComponent === 'Y' ? null : 'Y')}
                className={`w-full flex items-center justify-between p-3 rounded-xs border font-mono transition-all cursor-pointer ${
                  selectedVectorComponent === 'Y'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-xs bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                    Y
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Vector Y Component</span>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono tracking-wider">
                  {formatCoord(vector.y)}
                </span>
              </button>

              <button
                onClick={() => setSelectedVectorComponent(selectedVectorComponent === 'Z' ? null : 'Z')}
                className={`w-full flex items-center justify-between p-3 rounded-xs border font-mono transition-all cursor-pointer ${
                  selectedVectorComponent === 'Z'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                    : 'bg-white border-amber-200/80 hover:border-amber-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-xs bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                    Z
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Vector Z Component</span>
                </div>
                <span className="text-lg font-bold text-slate-900 font-mono tracking-wider">
                  {formatCoord(vector.z)}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
              <div className="bg-white p-3 rounded-xs border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  MAGNITUDE
                </span>
                <span className="text-base font-bold font-mono text-slate-900">
                  {vector.magnitude.toFixed(2)}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xs border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  AZIMUTH
                </span>
                <span className="text-base font-bold font-mono text-blue-700">
                  {vector.azimuth}°
                </span>
              </div>

              <div className="bg-white p-3 rounded-xs border border-slate-200 text-center">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  ELEVATION
                </span>
                <span className="text-base font-bold font-mono text-amber-600">
                  {vector.elevation}°
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 bg-white p-2.5 rounded-xs border border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>MATH STABILITY: <strong className="text-slate-800">±{currentPacket.angularStabilityDeg}°</strong></span>
            </span>
            <span className="text-[10px] text-amber-600 font-bold uppercase">READY</span>
          </div>
        </div>
      </div>
    </section>
  );
};
