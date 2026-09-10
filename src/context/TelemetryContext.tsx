import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import type { 
  TelemetryPacket, 
  SensorFace, 
  TrajectoryPoint, 
  SimulationPattern,
  Vector3D
} from '../types/telemetry';
import { SimulationEngine } from '../services/simulationEngine';

interface TelemetryContextValue {
  currentPacket: TelemetryPacket;
  history: TelemetryPacket[];
  trajectory: TrajectoryPoint[];
  isPaused: boolean;
  togglePause: () => void;
  selectedFace: SensorFace | null;
  setSelectedFace: (face: SensorFace | null) => void;
  simulationPattern: SimulationPattern;
  setSimulationPattern: (pattern: SimulationPattern) => void;
  manualVector: Vector3D;
  setManualVector: (v: Partial<Vector3D>) => void;
  sampleRateHz: number;
  setSampleRateHz: (hz: number) => void;
  selectedVectorComponent: 'X' | 'Y' | 'Z' | 'ALL' | null;
  setSelectedVectorComponent: (comp: 'X' | 'Y' | 'Z' | 'ALL' | null) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const MAX_HISTORY_POINTS = 600; // 60 seconds at 10 Hz
const MAX_TRAJECTORY_POINTS = 15;

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engineRef = useRef<SimulationEngine | null>(null);
  
  if (!engineRef.current) {
    engineRef.current = new SimulationEngine();
  }

  const [currentPacket, setCurrentPacket] = useState<TelemetryPacket>(() => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.000';
    return {
      timestamp,
      isoTimestamp: now.toISOString(),
      sampleNumber: 1,
      sensors: {
        '+X': { face: '+X', id: 'LDR-01', rawADC: 742, normalized: 0.73, contributionPct: 26, trend: 'stable', status: 'NOMINAL' },
        '-X': { face: '-X', id: 'LDR-02', rawADC: 318, normalized: 0.31, contributionPct: 11, trend: 'stable', status: 'NOMINAL' },
        '+Y': { face: '+Y', id: 'LDR-03', rawADC: 486, normalized: 0.48, contributionPct: 17, trend: 'stable', status: 'NOMINAL' },
        '-Y': { face: '-Y', id: 'LDR-04', rawADC: 271, normalized: 0.26, contributionPct: 9,  trend: 'stable', status: 'NOMINAL' },
        '+Z': { face: '+Z', id: 'LDR-05', rawADC: 921, normalized: 0.90, contributionPct: 32, trend: 'stable', status: 'NOMINAL' },
        '-Z': { face: '-Z', id: 'LDR-06', rawADC: 154, normalized: 0.15, contributionPct: 5,  trend: 'stable', status: 'NOMINAL' },
      },
      vector: { x: 0.42, y: -0.18, z: 0.89, magnitude: 0.99, azimuth: 337, elevation: 63 },
      dominantFace: '+Z',
      confidencePct: 94.2,
      angularStabilityDeg: 0.8,
      packetRateHz: 10,
      packetLossPct: 0.2,
      dataSource: 'SIMULATION',
    };
  });

  const [history, setHistory] = useState<TelemetryPacket[]>([currentPacket]);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedFace, setSelectedFace] = useState<SensorFace | null>(null);
  const [simulationPattern, setSimulationPatternState] = useState<SimulationPattern>('ZENITH_Z_DOMINANT');
  const [sampleRateHz, setSampleRateHzState] = useState<number>(10);
  const [selectedVectorComponent, setSelectedVectorComponent] = useState<'X' | 'Y' | 'Z' | 'ALL' | null>(null);
  const [manualVector, setManualVectorState] = useState<Vector3D>({
    x: 0.42,
    y: -0.18,
    z: 0.89,
    magnitude: 0.99,
    azimuth: 337,
    elevation: 63,
  });

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const unsubscribe = engine.subscribe((packet) => {
      setCurrentPacket(packet);

      setHistory((prev) => {
        const next = [...prev, packet];
        if (next.length > MAX_HISTORY_POINTS) {
          return next.slice(next.length - MAX_HISTORY_POINTS);
        }
        return next;
      });

      if (packet.sampleNumber % 3 === 0) {
        setTrajectory((prev) => {
          const newPoint: TrajectoryPoint = {
            id: `${packet.sampleNumber}`,
            timestamp: packet.timestamp,
            vector: packet.vector,
            dominantFace: packet.dominantFace,
            opacity: 1.0,
          };
          const updated = prev.map((pt, idx) => ({
            ...pt,
            opacity: Math.max(0.1, 1 - (prev.length - idx) / MAX_TRAJECTORY_POINTS),
          }));
          const combined = [...updated, newPoint];
          if (combined.length > MAX_TRAJECTORY_POINTS) {
            return combined.slice(combined.length - MAX_TRAJECTORY_POINTS);
          }
          return combined;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const togglePause = () => {
    if (engineRef.current) {
      const running = engineRef.current.togglePause();
      setIsPaused(!running);
    }
  };

  const setSimulationPattern = (pattern: SimulationPattern) => {
    setSimulationPatternState(pattern);
    if (engineRef.current) {
      engineRef.current.setPattern(pattern);
    }
  };

  const setSampleRateHz = (hz: number) => {
    setSampleRateHzState(hz);
    if (engineRef.current) {
      engineRef.current.setSampleRate(hz);
    }
  };

  const setManualVector = (v: Partial<Vector3D>) => {
    setManualVectorState((prev) => {
      const next = { ...prev, ...v };
      if (engineRef.current) {
        engineRef.current.setManualLightVector(next.x, next.y, next.z);
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({
      currentPacket,
      history,
      trajectory,
      isPaused,
      togglePause,
      selectedFace,
      setSelectedFace,
      simulationPattern,
      setSimulationPattern,
      manualVector,
      setManualVector,
      sampleRateHz,
      setSampleRateHz,
      selectedVectorComponent,
      setSelectedVectorComponent,
    }),
    [
      currentPacket,
      history,
      trajectory,
      isPaused,
      selectedFace,
      simulationPattern,
      manualVector,
      sampleRateHz,
      selectedVectorComponent,
    ]
  );

  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
};

export const useTelemetry = () => {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return ctx;
};
