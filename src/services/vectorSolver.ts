import type { SensorFace, SensorData, Vector3D } from '../types/telemetry';

export interface VectorSolverResult {
  vector: Vector3D;
  dominantFace: SensorFace;
  confidencePct: number;
  angularStabilityDeg: number;
}

/**
 * Photometric Vector Solver for 6-face CubeSat Sun Sensor
 * 
 * Formula:
 * X_raw = LDR(+X) - LDR(-X)
 * Y_raw = LDR(+Y) - LDR(-Y)
 * Z_raw = LDR(+Z) - LDR(-Z)
 * V_normalized = [X, Y, Z] / ||[X, Y, Z]||
 */
export function solveLightVector(
  rawReadings: Record<SensorFace, number>,
  prevVectorHistory: Vector3D[] = []
): VectorSolverResult {
  const xp = rawReadings['+X'] || 0;
  const xm = rawReadings['-X'] || 0;
  const yp = rawReadings['+Y'] || 0;
  const ym = rawReadings['-Y'] || 0;
  const zp = rawReadings['+Z'] || 0;
  const zm = rawReadings['-Z'] || 0;

  // Differential directional intensity
  const xRaw = xp - xm;
  const yRaw = yp - ym;
  const zRaw = zp - zm;

  const rawMagnitude = Math.sqrt(xRaw * xRaw + yRaw * yRaw + zRaw * zRaw);

  let x = 0;
  let y = 0;
  let z = 1; // Default to +Z vector if all zero

  if (rawMagnitude > 0.001) {
    x = xRaw / rawMagnitude;
    y = yRaw / rawMagnitude;
    z = zRaw / rawMagnitude;
  }

  // Calculate magnitude of normalized vector
  const normMagnitude = Math.sqrt(x * x + y * y + z * z);

  // Azimuth: angle in X-Y plane from +X axis towards +Y axis (0° to 360°)
  let azimuthRad = Math.atan2(y, x);
  if (azimuthRad < 0) {
    azimuthRad += 2 * Math.PI;
  }
  const azimuthDeg = (azimuthRad * 180) / Math.PI;

  // Elevation: angle above X-Y plane (-90° to +90°)
  const elevationRad = Math.asin(Math.max(-1, Math.min(1, z)));
  const elevationDeg = (elevationRad * 180) / Math.PI;

  // Find dominant sensor face
  let maxFace: SensorFace = '+Z';
  let maxADC = -1;

  (Object.keys(rawReadings) as SensorFace[]).forEach((face) => {
    if (rawReadings[face] > maxADC) {
      maxADC = rawReadings[face];
      maxFace = face;
    }
  });

  // Calculate confidence percentage based on signal contrast
  const oppositeReadings: Record<SensorFace, SensorFace> = {
    '+X': '-X',
    '-X': '+X',
    '+Y': '-Y',
    '-Y': '+Y',
    '+Z': '-Z',
    '-Z': '+Z',
  };
  const oppFace = oppositeReadings[maxFace];
  const oppADC = rawReadings[oppFace] || 0;

  const contrastRatio = maxADC > 0 ? (maxADC - oppADC) / maxADC : 0;
  const baseConfidence = 60 + contrastRatio * 38.5;
  const confidencePct = Math.min(99.9, Math.max(10.0, Number(baseConfidence.toFixed(1))));

  // Calculate angular stability (degrees fluctuation over recent samples)
  let angularStabilityDeg = 0.8;
  if (prevVectorHistory.length > 1) {
    const last = prevVectorHistory[prevVectorHistory.length - 1];
    const dot = Math.max(-1, Math.min(1, x * last.x + y * last.y + z * last.z));
    const angleDeltaRad = Math.acos(dot);
    const angleDeltaDeg = (angleDeltaRad * 180) / Math.PI;
    angularStabilityDeg = Number(Math.max(0.1, angleDeltaDeg).toFixed(1));
  }

  const vector: Vector3D = {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    z: Number(z.toFixed(2)),
    magnitude: Number(normMagnitude.toFixed(2)),
    azimuth: Math.round(azimuthDeg),
    elevation: Math.round(elevationDeg),
  };

  return {
    vector,
    dominantFace: maxFace,
    confidencePct,
    angularStabilityDeg,
  };
}

/**
 * Normalizes raw ADC readings to 0.00 - 1.00 and calculates relative contribution %
 */
export function processSensorReadings(
  rawReadings: Record<SensorFace, number>,
  prevReadings?: Record<SensorFace, SensorData>
): Record<SensorFace, SensorData> {
  const faces: SensorFace[] = ['+X', '-X', '+Y', '-Y', '+Z', '-Z'];
  const faceToId: Record<SensorFace, any> = {
    '+X': 'LDR-01',
    '-X': 'LDR-02',
    '+Y': 'LDR-03',
    '-Y': 'LDR-04',
    '+Z': 'LDR-05',
    '-Z': 'LDR-06',
  };

  const totalSum = faces.reduce((acc, f) => acc + (rawReadings[f] || 0), 0) || 1;

  const result = {} as Record<SensorFace, SensorData>;

  faces.forEach((face) => {
    const rawADC = Math.max(0, Math.min(1023, Math.round(rawReadings[face] || 0)));
    const normalized = Number((rawADC / 1023).toFixed(2));
    const contributionPct = Math.round((rawADC / totalSum) * 100);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (prevReadings && prevReadings[face]) {
      const prevADC = prevReadings[face].rawADC;
      if (rawADC > prevADC + 2) trend = 'up';
      else if (rawADC < prevADC - 2) trend = 'down';
    }

    result[face] = {
      face,
      id: faceToId[face],
      rawADC,
      normalized,
      contributionPct,
      trend,
      status: rawADC > 0 ? 'NOMINAL' : 'WARNING',
    };
  });

  return result;
}
