import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { X, Navigation } from 'lucide-react';

export const VectorDetailModal: React.FC = () => {
  const { selectedVectorComponent, setSelectedVectorComponent, currentPacket } = useTelemetry();
  const { vector, sensors } = currentPacket;

  if (!selectedVectorComponent) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xs border border-slate-300 max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                VECTOR COMPONENT INSPECTOR [{selectedVectorComponent}]
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Photometric differential vector resolution
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedVectorComponent(null)}
            className="p-1 rounded-xs hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs text-slate-700">
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xs border border-slate-800">
            <span className="text-[10px] text-amber-400 block mb-1">
              SOLVER COMPONENT CALCULATION
            </span>
            {selectedVectorComponent === 'X' && (
              <>
                <div className="text-lg font-bold text-blue-400">
                  X_raw = LDR(+X) - LDR(-X)
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  = {sensors['+X']?.rawADC} - {sensors['-X']?.rawADC} = {sensors['+X']?.rawADC - sensors['-X']?.rawADC} ADC
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Normalized X = {vector.x > 0 ? `+${vector.x}` : vector.x}
                </div>
              </>
            )}

            {selectedVectorComponent === 'Y' && (
              <>
                <div className="text-lg font-bold text-emerald-400">
                  Y_raw = LDR(+Y) - LDR(-Y)
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  = {sensors['+Y']?.rawADC} - {sensors['-Y']?.rawADC} = {sensors['+Y']?.rawADC - sensors['-Y']?.rawADC} ADC
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Normalized Y = {vector.y > 0 ? `+${vector.y}` : vector.y}
                </div>
              </>
            )}

            {selectedVectorComponent === 'Z' && (
              <>
                <div className="text-lg font-bold text-amber-400">
                  Z_raw = LDR(+Z) - LDR(-Z)
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  = {sensors['+Z']?.rawADC} - {sensors['-Z']?.rawADC} = {sensors['+Z']?.rawADC - sensors['-Z']?.rawADC} ADC
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Normalized Z = {vector.z > 0 ? `+${vector.z}` : vector.z}
                </div>
              </>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-xs border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-900 block">
              HARDWARE CALIBRATION FACTORS:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>ADC Gain: <strong>1.000</strong></div>
              <div>Dark Current Offset: <strong>0 ADC</strong></div>
              <div>Cosine Response Corr: <strong>0.988</strong></div>
              <div>Face Normal Alignment: <strong>[0,0,1]</strong></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setSelectedVectorComponent(null)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-xs transition-colors cursor-pointer"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
};
