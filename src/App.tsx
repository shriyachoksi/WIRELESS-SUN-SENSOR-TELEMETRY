import React from 'react';
import { TelemetryProvider } from './context/TelemetryContext';
import { CommandBar } from './components/CommandBar';
import { CubeSatHero } from './components/CubeSatHero';
import { PhotometricArray } from './components/PhotometricArray';
import { IntensityDistribution } from './components/IntensityDistribution';
import { VectorSolutionPanel } from './components/VectorSolutionPanel';
import { TelemetryGraph } from './components/TelemetryGraph';
import { DirectionHistory } from './components/DirectionHistory';
import { StatusBar } from './components/StatusBar';
import { VectorDetailModal } from './components/VectorDetailModal';

export const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 tech-grid-bg flex flex-col justify-between selection:bg-amber-200 selection:text-amber-950">
      {/* 1. TOP COMMAND BAR */}
      <CommandBar />

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 flex-1">
        {/* 2. HERO / VECTOR SECTION */}
        <CubeSatHero />

        {/* 3. SIX-FACE SENSOR ARRAY */}
        <PhotometricArray />

        {/* 4 & 5. SENSOR BALANCE & VECTOR ANALYSIS (2 Cols on Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IntensityDistribution />
          <VectorSolutionPanel />
        </div>

        {/* 6. LIVE TELEMETRY GRAPH */}
        <TelemetryGraph />

        {/* 7. VECTOR TRAJECTORY & DIRECTION HISTORY */}
        <DirectionHistory />
      </main>

      {/* 8. SYSTEM STATUS STRIP (FOOTER) */}
      <StatusBar />

      {/* INSPECTOR MODAL */}
      <VectorDetailModal />
    </div>
  );
};

export function App() {
  return (
    <TelemetryProvider>
      <DashboardContent />
    </TelemetryProvider>
  );
}

export default App;
