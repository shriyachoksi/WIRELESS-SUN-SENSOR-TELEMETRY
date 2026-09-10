import React from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { Play, Pause, Activity, Radio } from 'lucide-react';
import type { SimulationPattern } from '../types/telemetry';

export const CommandBar: React.FC = () => {
  const { 
    currentPacket, 
    isPaused, 
    togglePause, 
    simulationPattern, 
    setSimulationPattern,
    sampleRateHz,
    setSampleRateHz
  } = useTelemetry();

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
      {/* Left Branding */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 bg-slate-900 text-amber-400 font-mono font-bold text-xs flex items-center justify-center rounded-xs tracking-wider border border-slate-700 shadow-xs">
          LV01
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
              LIGHT VECTOR <span className="text-amber-500 font-mono">/ 01</span>
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xs font-semibold">
              CUBESAT-1U
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 tracking-wider uppercase">
            WIRELESS SUN-SENSOR TELEMETRY
          </p>
        </div>
      </div>

      {/* Center/Right Technical Telemetry Teleprompter */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs font-mono">
        {/* System Status */}
        <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xs border border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-500 font-medium">SYSTEM:</span>
          <span className="text-emerald-600 font-bold">ONLINE</span>
        </div>

        {/* Telemetry Source */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xs border border-slate-200">
          <Radio className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500">TELEMETRY:</span>
          <span className="text-blue-700 font-bold">{currentPacket.dataSource}</span>
        </div>

        {/* Sample Rate */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xs border border-slate-200">
          <Activity className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500">SAMPLE RATE:</span>
          <select 
            value={sampleRateHz}
            onChange={(e) => setSampleRateHz(Number(e.target.value))}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            <option value={5}>5 Hz</option>
            <option value={10}>10 Hz</option>
            <option value={20}>20 Hz</option>
          </select>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 bg-slate-900 text-slate-100 px-3 py-1.5 rounded-xs font-mono font-medium shadow-2xs">
          <span className="text-slate-400 text-[10px] uppercase">UTC:</span>
          <span className="text-amber-400">{currentPacket.timestamp}</span>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xs border border-slate-200">
          <span className="text-[11px] text-slate-500 font-mono px-1">MODE:</span>
          <select
            value={simulationPattern}
            onChange={(e) => setSimulationPattern(e.target.value as SimulationPattern)}
            className="text-xs font-mono font-medium text-slate-800 bg-white border border-slate-300 rounded-xs px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ZENITH_Z_DOMINANT">ZENITH (+Z DOMINANT)</option>
            <option value="ORBITAL_SWEEP">ORBITAL SWEEP</option>
            <option value="SPIN_STABILIZED">SPIN STABILIZED</option>
            <option value="MANUAL">MANUAL VECTOR</option>
          </select>
        </div>

        {/* Stream Play/Pause Toggle Button */}
        <button
          onClick={togglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-mono font-bold text-xs transition-all cursor-pointer border shadow-2xs ${
            isPaused
              ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
              : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
          }`}
          title={isPaused ? 'Resume live simulation' : 'Pause simulation stream'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
        </button>
      </div>
    </header>
  );
};
