import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Wifi, Cpu, Activity, ShieldCheck, Database, Zap } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { currentPacket, sampleRateHz } = useTelemetry();

  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-300 text-xs font-mono px-4 lg:px-8 py-3 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status items grid */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-8">
          {/* ESP32 LINK */}
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">ESP32 LINK:</span>
            <span className="text-emerald-400 font-bold">CONNECTED</span>
          </div>

          {/* PACKET RATE */}
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">PACKET RATE:</span>
            <span className="text-white font-bold">{sampleRateHz} Hz</span>
          </div>

          {/* PACKET LOSS */}
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">PACKET LOSS:</span>
            <span className="text-white font-bold">{currentPacket.packetLossPct}%</span>
          </div>

          {/* SENSOR HEALTH */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">SENSOR HEALTH:</span>
            <span className="text-emerald-400 font-bold">6 / 6</span>
          </div>

          {/* VECTOR SOLVER */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">VECTOR SOLVER:</span>
            <span className="text-indigo-300 font-bold">RUNNING</span>
          </div>

          {/* DATA SOURCE */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">DATA SOURCE:</span>
            <span className="text-amber-400 font-bold">{currentPacket.dataSource}</span>
          </div>
        </div>

        {/* Right side version copyright note */}
        <div className="text-[11px] text-slate-500">
          <span>WIRELESS CUBESAT SUN-SENSOR INSTRUMENTATION v1.0.4</span>
        </div>
      </div>
    </footer>
  );
};
