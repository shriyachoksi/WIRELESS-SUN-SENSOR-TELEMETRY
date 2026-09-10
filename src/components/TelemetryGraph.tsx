import React, { useState } from 'react';
import { useTelemetry } from '../context/TelemetryContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, Play, Pause } from 'lucide-react';
import { SENSOR_COLOR_MAP } from '../types/telemetry';

type ViewTab = 'ALL' | 'X_AXIS' | 'Y_AXIS' | 'Z_AXIS' | 'MAGNITUDE';

export const TelemetryGraph: React.FC = () => {
  const { history, isPaused, togglePause } = useTelemetry();
  const [activeTab, setActiveTab] = useState<ViewTab>('ALL');

  const chartData = history.slice(-90).map((packet) => ({
    time: packet.timestamp.split('.')[0],
    '+X': packet.sensors['+X']?.rawADC || 0,
    '-X': packet.sensors['-X']?.rawADC || 0,
    '+Y': packet.sensors['+Y']?.rawADC || 0,
    '-Y': packet.sensors['-Y']?.rawADC || 0,
    '+Z': packet.sensors['+Z']?.rawADC || 0,
    '-Z': packet.sensors['-Z']?.rawADC || 0,
    'Magnitude': Number((packet.vector.magnitude * 1000).toFixed(0)),
    'RawMag': packet.vector.magnitude,
  }));

  const tabs: { id: ViewTab; label: string }[] = [
    { id: 'ALL', label: 'All Sensors (6)' },
    { id: 'X_AXIS', label: '+X / -X Pair' },
    { id: 'Y_AXIS', label: '+Y / -Y Pair' },
    { id: 'Z_AXIS', label: '+Z / -Z Pair' },
    { id: 'MAGNITUDE', label: 'Vector Magnitude' },
  ];

  return (
    <section className="w-full bg-white border border-slate-200 rounded-xs p-5 lg:p-7 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Telemetry History
            </h3>
            <p className="text-xs font-mono text-slate-500">
              60-Second continuous LDR photometric stream
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xs border border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[11px] font-mono font-medium px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={togglePause}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xs font-mono font-bold text-xs border transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            <span>{isPaused ? 'PAUSED' : 'LIVE'}</span>
          </button>
        </div>
      </div>

      <div className="w-full h-[320px] bg-slate-50 p-2.5 rounded-xs border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <YAxis
              domain={[0, 1050]}
              tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#64748b' }}
              stroke="#cbd5e1"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '2px',
                color: '#f8fafc',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
            />

            {(activeTab === 'ALL' || activeTab === 'X_AXIS') && (
              <>
                <Line
                  type="monotone"
                  dataKey="+X"
                  stroke={SENSOR_COLOR_MAP['+X']}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="-X"
                  stroke={SENSOR_COLOR_MAP['-X']}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {(activeTab === 'ALL' || activeTab === 'Y_AXIS') && (
              <>
                <Line
                  type="monotone"
                  dataKey="+Y"
                  stroke={SENSOR_COLOR_MAP['+Y']}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="-Y"
                  stroke={SENSOR_COLOR_MAP['-Y']}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {(activeTab === 'ALL' || activeTab === 'Z_AXIS') && (
              <>
                <Line
                  type="monotone"
                  dataKey="+Z"
                  stroke={SENSOR_COLOR_MAP['+Z']}
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="-Z"
                  stroke={SENSOR_COLOR_MAP['-Z']}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}

            {activeTab === 'MAGNITUDE' && (
              <Line
                type="monotone"
                dataKey="RawMag"
                name="Vector ||V||"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
