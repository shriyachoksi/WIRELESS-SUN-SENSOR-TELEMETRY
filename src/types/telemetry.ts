export type SensorFace = '+X' | '-X' | '+Y' | '-Y' | '+Z' | '-Z';
export type SensorId = 'LDR-01' | 'LDR-02' | 'LDR-03' | 'LDR-04' | 'LDR-05' | 'LDR-06';

export interface SensorData {
  face: SensorFace;
  id: SensorId;
  rawADC: number;            // 0 - 1023 ADC reading
  normalized: number;        // 0.00 - 1.00
  contributionPct: number;   // 0 - 100% relative to total light intensity
  trend: 'up' | 'down' | 'stable';
  status: 'NOMINAL' | 'CALIBRATING' | 'WARNING';
}

export interface Vector3D {
  x: number;          // -1.00 to +1.00
  y: number;          // -1.00 to +1.00
  z: number;          // -1.00 to +1.00
  magnitude: number;  // ||V||
  azimuth: number;    // degrees 0 - 360°
  elevation: number;  // degrees -90° to +90°
}

export interface TelemetryPacket {
  timestamp: string;         // e.g. "19:16:32.481"
  isoTimestamp: string;
  sampleNumber: number;
  sensors: Record<SensorFace, SensorData>;
  vector: Vector3D;
  dominantFace: SensorFace;
  confidencePct: number;     // e.g. 94.2%
  angularStabilityDeg: number;// e.g. 0.8°
  packetRateHz: number;      // e.g. 10
  packetLossPct: number;     // e.g. 0.2%
  dataSource: 'SIMULATION' | 'ESP32_HARDWARE';
}

export interface TrajectoryPoint {
  id: string;
  timestamp: string;
  vector: Vector3D;
  dominantFace: SensorFace;
  opacity: number;
}

export type SimulationPattern = 
  | 'ZENITH_Z_DOMINANT' 
  | 'ORBITAL_SWEEP' 
  | 'SPIN_STABILIZED' 
  | 'ECLIPSE_TRANSITION'
  | 'MANUAL';

export const FACE_TO_LDR_MAP: Record<SensorFace, SensorId> = {
  '+X': 'LDR-01',
  '-X': 'LDR-02',
  '+Y': 'LDR-03',
  '-Y': 'LDR-04',
  '+Z': 'LDR-05',
  '-Z': 'LDR-06',
};

export const SENSOR_COLOR_MAP: Record<SensorFace, string> = {
  '+X': '#3b82f6', // blue
  '-X': '#60a5fa', // light blue
  '+Y': '#10b981', // emerald
  '-Y': '#34d399', // light emerald
  '+Z': '#f59e0b', // amber (dominant)
  '-Z': '#fbbf24', // light amber
};
