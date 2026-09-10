import type { SensorFace, TelemetryPacket, SimulationPattern } from '../types/telemetry';
import { solveLightVector, processSensorReadings } from './vectorSolver';

export type TelemetryCallback = (packet: TelemetryPacket) => void;

export class SimulationEngine {
  private timerId: number | null = null;
  private sampleRateHz: number = 10;
  private sampleCounter: number = 0;
  private pattern: SimulationPattern = 'ZENITH_Z_DOMINANT';
  private callbacks: Set<TelemetryCallback> = new Set();
  private isRunning: boolean = true;
  private timeStep: number = 0;

  // Base values matching prompt specifications for +Z dominant zenith state
  private baseReadings: Record<SensorFace, number> = {
    '+X': 742,
    '-X': 318,
    '+Y': 486,
    '-Y': 271,
    '+Z': 921,
    '-Z': 154,
  };

  // Manual light direction for manual mode [-1 to 1]
  private manualLightVector = { x: 0.42, y: -0.18, z: 0.89 };

  private prevVectorHistory: any[] = [];
  private prevSensorData: any = null;

  constructor() {
    this.start();
  }

  public subscribe(callback: TelemetryCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public setPattern(pattern: SimulationPattern) {
    this.pattern = pattern;
  }

  public setManualLightVector(x: number, y: number, z: number) {
    this.manualLightVector = { x, y, z };
  }

  public setSampleRate(hz: number) {
    this.sampleRateHz = Math.max(1, Math.min(50, hz));
    if (this.isRunning) {
      this.restartTimer();
    }
  }

  public start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.restartTimer();
    } else if (!this.timerId) {
      this.restartTimer();
    }
  }

  public pause() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public togglePause(): boolean {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private restartTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
    }
    const intervalMs = 1000 / this.sampleRateHz;
    this.timerId = window.setInterval(() => this.tick(), intervalMs);
  }

  private tick() {
    if (!this.isRunning) return;

    this.sampleCounter++;
    this.timeStep += 0.05;

    const currentReadings = this.generateSensorReadings();
    const sensorData = processSensorReadings(currentReadings, this.prevSensorData);
    this.prevSensorData = sensorData;

    const solverResult = solveLightVector(currentReadings, this.prevVectorHistory);
    
    // Store vector in history for stability calculation
    this.prevVectorHistory.push(solverResult.vector);
    if (this.prevVectorHistory.length > 20) {
      this.prevVectorHistory.shift();
    }

    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    const packet: TelemetryPacket = {
      timestamp,
      isoTimestamp: now.toISOString(),
      sampleNumber: this.sampleCounter,
      sensors: sensorData,
      vector: solverResult.vector,
      dominantFace: solverResult.dominantFace,
      confidencePct: solverResult.confidencePct,
      angularStabilityDeg: solverResult.angularStabilityDeg,
      packetRateHz: this.sampleRateHz,
      packetLossPct: 0.2,
      dataSource: 'SIMULATION',
    };

    // Notify all subscribers
    this.callbacks.forEach((cb) => cb(packet));
  }

  private generateSensorReadings(): Record<SensorFace, number> {
    const noise = () => (Math.random() - 0.5) * 6; // Realistic small micro-fluctuation ±3 ADC

    if (this.pattern === 'ZENITH_Z_DOMINANT') {
      const driftX = Math.sin(this.timeStep * 0.2) * 15;
      const driftY = Math.cos(this.timeStep * 0.25) * 12;
      const driftZ = Math.sin(this.timeStep * 0.15) * 8;

      return {
        '+X': Math.min(1023, Math.max(0, this.baseReadings['+X'] + driftX + noise())),
        '-X': Math.min(1023, Math.max(0, this.baseReadings['-X'] - driftX + noise())),
        '+Y': Math.min(1023, Math.max(0, this.baseReadings['+Y'] + driftY + noise())),
        '-Y': Math.min(1023, Math.max(0, this.baseReadings['-Y'] - driftY + noise())),
        '+Z': Math.min(1023, Math.max(0, this.baseReadings['+Z'] + driftZ + noise())),
        '-Z': Math.min(1023, Math.max(0, this.baseReadings['-Z'] - driftZ + noise())),
      };
    } else if (this.pattern === 'ORBITAL_SWEEP') {
      const angle = this.timeStep * 0.3;
      const lightX = Math.cos(angle) * 0.7;
      const lightY = Math.sin(angle) * 0.7;
      const lightZ = Math.sin(angle * 0.5) * 0.6 + 0.3;

      return this.convertLightVectorToReadings(lightX, lightY, lightZ);
    } else if (this.pattern === 'SPIN_STABILIZED') {
      const angle = this.timeStep * 0.8;
      const lightX = Math.sin(angle);
      const lightY = 0.2;
      const lightZ = Math.cos(angle);

      return this.convertLightVectorToReadings(lightX, lightY, lightZ);
    } else if (this.pattern === 'MANUAL') {
      return this.convertLightVectorToReadings(
        this.manualLightVector.x,
        this.manualLightVector.y,
        this.manualLightVector.z
      );
    }

    return this.baseReadings;
  }

  private convertLightVectorToReadings(lx: number, ly: number, lz: number): Record<SensorFace, number> {
    const mag = Math.sqrt(lx * lx + ly * ly + lz * lz) || 1;
    const nx = lx / mag;
    const ny = ly / mag;
    const nz = lz / mag;

    const noise = () => (Math.random() - 0.5) * 4;
    const baseIntensity = 950;
    const ambientNoise = 120;

    return {
      '+X': Math.round(Math.max(ambientNoise, Math.max(0, nx) * baseIntensity + noise())),
      '-X': Math.round(Math.max(ambientNoise, Math.max(0, -nx) * baseIntensity + noise())),
      '+Y': Math.round(Math.max(ambientNoise, Math.max(0, ny) * baseIntensity + noise())),
      '-Y': Math.round(Math.max(ambientNoise, Math.max(0, -ny) * baseIntensity + noise())),
      '+Z': Math.round(Math.max(ambientNoise, Math.max(0, nz) * baseIntensity + noise())),
      '-Z': Math.round(Math.max(ambientNoise, Math.max(0, -nz) * baseIntensity + noise())),
    };
  }
}
